// Boca falando nos retratos, de graça e no próprio navegador.
// 1) O MediaPipe acha os lábios e o queixo no retrato (uma vez por imagem, fica guardado).
// 2) A voz vem do Gemini, pedida ao servidor local (/api/voz).
// 3) A boca abre conforme o volume real do áudio: a imagem é deformada de forma suave (WebGL),
//    o lábio de baixo e o queixo descem, o de cima sobe um pouco e o vão mostra o interior.
// Sem servidor ou sem chave, cai para a voz do navegador com um ritmo aproximado.
import { FaceLandmarker, FilesetResolver } from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/vision_bundle.mjs";

const VERSAO_CACHE = "closing:boca:v1:";
const LABIO_INFERIOR_INTERNO = [308, 324, 318, 402, 317, 14, 87, 178, 88, 95, 78];

// Jeito de falar na voz do navegador (só quando a voz do Gemini não está disponível).
const ESTILO_VOZ = {
  Paulo: { genero: "M", tom: 0.82, ritmo: 0.95 },
  Yuri: { genero: "M", tom: 0.95, ritmo: 1.05 },
  Witalo: { genero: "M", tom: 1.08, ritmo: 1.12 },
  Marcia: { genero: "F", tom: 1.12, ritmo: 1.08 },
  Raquel: { genero: "F", tom: 1.0, ritmo: 1.0 },
};

let detector = null;
async function carregarDetector() {
  if (detector) return detector;
  const arquivos = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm");
  detector = await FaceLandmarker.createFromOptions(arquivos, {
    baseOptions: { modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task" },
    runningMode: "IMAGE",
    numFaces: 1,
  });
  return detector;
}

async function pontosDoRosto(img, src) {
  try { const salvo = JSON.parse(localStorage.getItem(VERSAO_CACHE + src)); if (salvo) return salvo; } catch {}
  const r = (await carregarDetector()).detect(img);
  if (!r.faceLandmarks?.length) return null;
  const pts = r.faceLandmarks[0].map((p) => [p.x, p.y]);
  try { localStorage.setItem(VERSAO_CACHE + src, JSON.stringify(pts)); } catch {}
  return pts;
}

function carregarImagem(src) {
  return new Promise((ok, erro) => { const img = new Image(); img.onload = () => ok(img); img.onerror = erro; img.src = src; });
}

// ---------- voz do navegador (reserva) ----------
let vozes = [];
function atualizarVozes() { vozes = speechSynthesis.getVoices().filter((v) => /^pt(-|_)?BR/i.test(v.lang)); }
if ("speechSynthesis" in window) { atualizarVozes(); speechSynthesis.onvoiceschanged = atualizarVozes; }
const FEMININAS = /francisca|thalita|maria|let[ií]cia|fernanda|brenda|giovanna|leila|manuela|yara|elza|google/i;
const MASCULINAS = /antonio|ant[oô]nio|daniel|donato|f[aá]bio|j[uú]lio|humberto|val[eé]rio|nicolau/i;
function vozDoNavegador(genero) {
  const naturais = vozes.filter((v) => /natural|online|neural/i.test(v.name));
  const re = genero === "F" ? FEMININAS : MASCULINAS;
  return (naturais.length ? naturais : vozes).find((v) => re.test(v.name)) || vozes.find((v) => re.test(v.name)) || vozes[0] || null;
}

let contextoAudio = null;
function audioPronto() {
  contextoAudio = contextoAudio || new (window.AudioContext || window.webkitAudioContext)();
  if (contextoAudio.state === "suspended") contextoAudio.resume();
  return contextoAudio;
}

// ---------- geometria da boca ----------
// Tudo é medido num sistema "da boca": u vai de -1 (canto esquerdo) a 1 (canto direito),
// v é a distância em pixels para baixo, perpendicular à linha dos cantos.
const AMOSTRAS_LINHA = 16;
function geometriaBoca(pts, dx, dy, w, h, abertura) {
  const P = (i) => [dx + pts[i][0] * w, dy + pts[i][1] * h];
  const L = P(61), R = P(291);
  const c = [(L[0] + R[0]) / 2, (L[1] + R[1]) / 2];
  const largura = Math.hypot(R[0] - L[0], R[1] - L[1]) || 1, meia = largura / 2;
  const ex = [(R[0] - L[0]) / largura, (R[1] - L[1]) / largura], ey = [-ex[1], ex[0]];
  const local = (p) => [((p[0] - c[0]) * ex[0] + (p[1] - c[1]) * ex[1]) / meia, (p[0] - c[0]) * ey[0] + (p[1] - c[1]) * ey[1]];

  // A "costura" onde a boca abre é a borda de cima do lábio de baixo.
  const linha = [local(L), ...LABIO_INFERIOR_INTERNO.map((i) => local(P(i))), local(R)].sort((a, b) => a[0] - b[0]);
  const costura = new Float32Array(AMOSTRAS_LINHA);
  for (let k = 0; k < AMOSTRAS_LINHA; k++) {
    const u = -1.4 + (2.8 * k) / (AMOSTRAS_LINHA - 1);
    if (u <= linha[0][0]) { costura[k] = linha[0][1]; continue; }
    if (u >= linha[linha.length - 1][0]) { costura[k] = linha[linha.length - 1][1]; continue; }
    const j = linha.findIndex((p) => p[0] >= u), a = linha[j - 1], b = linha[j];
    costura[k] = a[1] + ((b[1] - a[1]) * (u - a[0])) / Math.max(1e-6, b[0] - a[0]);
  }
  const vSup = local(P(13))[1], vInf = local(P(14))[1];
  const queixo = Math.max(meia * 0.6, local(P(152))[1] - vInf);
  const nariz = Math.max(meia * 0.3, vInf - local(P(2))[1]);
  return {
    c, ex, ey, meia, costura, queixo, nariz,
    queda: abertura * Math.min(meia * 0.42, queixo * 0.3),
    dentes: vInf - vSup > meia * 0.12 ? 0 : 1, // o retrato já mostra os dentes? então não desenha outros
  };
}

// ---------- pintura com WebGL ----------
// Em vez de recortar a boca, deforma a imagem: o lábio de baixo e o queixo descem de leve,
// o de cima sobe um pouco, tudo com transição suave até a pele parada. No vão aparece o
// interior da boca (dentes de cima, sombra e língua).
const SOMBREADOR = `#version 300 es
precision highp float;
uniform sampler2D foto;
uniform vec2 tela, origem, tamanho, centro, eixoX, eixoY;
uniform float meia, queda, queixo, nariz, dentes;
uniform float costura[${AMOSTRAS_LINHA}];
out vec4 cor;

float costuraEm(float u) {
  float t = clamp((u + 1.4) / 2.8, 0.0, 1.0) * float(${AMOSTRAS_LINHA - 1});
  int i = int(min(floor(t), float(${AMOSTRAS_LINHA - 2})));
  return mix(costura[i], costura[i + 1], t - float(i));
}
vec3 foto_em(vec2 p) { return texture(foto, (p - origem) / tamanho).rgb; }

void main() {
  vec2 p = vec2(gl_FragCoord.x, tela.y - gl_FragCoord.y);
  if (queda < 0.05) { cor = vec4(foto_em(p), 1.0); return; }
  vec2 d = p - centro;
  float u = dot(d, eixoX) / meia;
  float v = dot(d, eixoY) - costuraEm(u);          // distância até a costura (positivo = abaixo)
  float au = abs(u);
  float boca = 1.0 - smoothstep(0.0, 1.08, au);      // o vão é mais aberto no meio
  float maxilar = 1.0 - smoothstep(0.7, 2.1, au);    // o queixo desce numa área mais larga
  float baixo = queda * boca;                         // quanto o lábio de baixo desce
  float cima = queda * 0.14 * boca;                   // quanto o lábio de cima sobe

  float vOrigem;
  if (v >= baixo) {
    float q = v - baixo;
    float desce = mix(baixo, queda * maxilar, smoothstep(0.0, queixo * 0.5, q));
    desce *= 1.0 - smoothstep(queixo * 0.55, queixo * 1.35, q);
    vOrigem = v - desce;
  } else if (v <= -cima) {
    float r = -v - cima;
    vOrigem = v + cima * (1.0 - smoothstep(0.0, nariz * 0.9, r));
  } else {
    vOrigem = 0.0;
  }
  vec3 pele = foto_em(p - eixoY * (v - vOrigem));

  // Interior da boca, com borda suave de 1 pixel.
  float vao = baixo + cima;
  float dentro = smoothstep(-cima - 1.0, -cima + 0.6, v) * (1.0 - smoothstep(baixo - 0.6, baixo + 1.0, v));
  if (vao < 0.4) dentro = 0.0;
  float t = clamp((v + cima) / max(vao, 0.001), 0.0, 1.0);
  vec3 interior = mix(vec3(0.09, 0.025, 0.03), vec3(0.24, 0.06, 0.06), t);
  interior *= 1.0 - 0.55 * smoothstep(0.35, 1.0, au);  // cantos mais escuros
  float lingua = smoothstep(0.62, 0.9, t) * (1.0 - smoothstep(0.55, 0.85, au));
  interior = mix(interior, vec3(0.50, 0.17, 0.17), lingua * 0.8);
  float dente = dentes * (1.0 - smoothstep(0.08, 0.2, t)) * (1.0 - smoothstep(0.45, 0.7, au)) * smoothstep(3.0, 7.0, vao);
  interior = mix(interior, vec3(0.80, 0.77, 0.73), dente * 0.9);

  // Sombra fina na borda dos lábios, para o vão não parecer colado.
  float sombra = (1.0 - smoothstep(0.0, 2.5, abs(v - baixo))) + (1.0 - smoothstep(0.0, 2.0, abs(v + cima)));
  pele *= 1.0 - 0.18 * clamp(sombra, 0.0, 1.0) * smoothstep(0.5, 3.0, vao) * boca;

  cor = vec4(mix(pele, interior, dentro), 1.0);
}`;

function criarPintor(canvas, img) {
  const gl = canvas.getContext("webgl2", { premultipliedAlpha: false });
  if (!gl) {
    // Navegador sem WebGL 2: mostra o retrato parado.
    const ctx = canvas.getContext("2d");
    return { pintar: ({ W, H, dx, dy, iw, ih }) => { ctx.clearRect(0, 0, W, H); ctx.drawImage(img, dx, dy, iw, ih); } };
  }
  const compilar = (tipo, fonte) => {
    const s = gl.createShader(tipo); gl.shaderSource(s, fonte); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
    return s;
  };
  const prog = gl.createProgram();
  gl.attachShader(prog, compilar(gl.VERTEX_SHADER, `#version 300 es
in vec2 pos; void main() { gl_Position = vec4(pos, 0.0, 1.0); }`));
  gl.attachShader(prog, compilar(gl.FRAGMENT_SHADER, SOMBREADOR));
  gl.linkProgram(prog);
  gl.useProgram(prog);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const pos = gl.getAttribLocation(prog, "pos");
  gl.enableVertexAttribArray(pos);
  gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
  gl.generateMipmap(gl.TEXTURE_2D);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  const U = {};
  for (const n of ["tela", "origem", "tamanho", "centro", "eixoX", "eixoY", "meia", "queda", "queixo", "nariz", "dentes", "costura"]) U[n] = gl.getUniformLocation(prog, n);
  return {
    pintar({ W, H, dx, dy, iw, ih, boca }) {
      gl.viewport(0, 0, W, H);
      gl.uniform2f(U.tela, W, H); gl.uniform2f(U.origem, dx, dy); gl.uniform2f(U.tamanho, iw, ih);
      if (boca) {
        gl.uniform2f(U.centro, ...boca.c); gl.uniform2f(U.eixoX, ...boca.ex); gl.uniform2f(U.eixoY, ...boca.ey);
        gl.uniform1f(U.meia, boca.meia); gl.uniform1f(U.queda, boca.queda); gl.uniform1f(U.queixo, boca.queixo);
        gl.uniform1f(U.nariz, boca.nariz); gl.uniform1f(U.dentes, boca.dentes); gl.uniform1fv(U.costura, boca.costura);
      } else gl.uniform1f(U.queda, 0);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    },
  };
}

// ---------- retrato animado ----------
export async function montar(container, personagem) {
  container.innerHTML = "";
  const canvas = document.createElement("canvas");
  canvas.className = "retrato-vivo";
  container.append(canvas);
  const img = await carregarImagem(personagem.foto);
  let pts = null;
  try { pts = await pontosDoRosto(img, personagem.foto); } catch (e) { console.warn("Rosto não detectado; boca sem animação.", e); }
  const pintor = criarPintor(canvas, img);

  let abertura = 0, fixo = null, ativo = true, fonteVolume = null, ritmoAte = 0, audioAtual = null, falaCancelada = false;
  const amostras = new Uint8Array(1024);
  const inicio = performance.now();

  function ajustar() {
    const r = container.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.round(r.width * dpr));
    canvas.height = Math.max(1, Math.round(r.height * dpr));
  }
  const obs = new ResizeObserver(ajustar); obs.observe(container); ajustar();

  // Volume de 0 a 1: do áudio real, se houver; senão, um ritmo de sílabas aproximado.
  function volume() {
    if (fonteVolume) {
      fonteVolume.getByteTimeDomainData(amostras);
      let soma = 0;
      for (let i = 0; i < amostras.length; i++) { const v = (amostras[i] - 128) / 128; soma += v * v; }
      return Math.max(0, Math.min(1, (Math.sqrt(soma / amostras.length) - 0.015) * 7));
    }
    if (performance.now() < ritmoAte) {
      const t = (performance.now() - inicio) / 1000;
      return 0.15 + 0.6 * Math.max(0, Math.sin(t * Math.PI * 4.2)) * (0.7 + 0.3 * Math.sin(t * 11.3));
    }
    return 0;
  }

  function desenhar() {
    if (!ativo) return;
    requestAnimationFrame(desenhar);
    const W = canvas.width, H = canvas.height, iw = img.naturalWidth, ih = img.naturalHeight;
    const s = Math.max(W / iw, H / ih), dx = (W - iw * s) * 0.5, dy = (H - ih * s) * 0.35;

    // Suaviza o volume: abre rápido, fecha um pouco mais devagar, sem tremer.
    const alvo = fixo ?? Math.pow(volume(), 0.75);
    abertura += (alvo - abertura) * (alvo > abertura ? 0.35 : 0.18);
    if (abertura < 0.01) abertura = 0;
    pintor.pintar({ W, H, dx, dy, iw: iw * s, ih: ih * s, boca: pts ? geometriaBoca(pts, dx, dy, iw * s, ih * s, abertura) : null });
  }
  desenhar();

  // Uma voz por fala: dividir em frases quase não adianta (a primeira demora o mesmo)
  // e cria pausas entre as frases, além de gastar o limite grátis mais rápido.
  async function vozDaFrase(frase) {
    const resp = await fetch("/api/voz", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ texto: frase, voz: personagem.voz }) });
    if (!resp.ok) throw new Error((await resp.json().catch(() => ({}))).erro || `voz indisponível (${resp.status})`);
    return audioPronto().decodeAudioData(await resp.arrayBuffer());
  }
  async function falarComGemini(texto) {
    const ac = audioPronto();
    const pedidos = [vozDaFrase(texto)];
    pedidos.forEach((p) => p.catch(() => {}));
    const analisador = ac.createAnalyser();
    analisador.fftSize = 1024;
    analisador.connect(ac.destination);
    let tocou = false;
    try {
      for (const pedido of pedidos) {
        let buffer;
        try { buffer = await pedido; } catch (e) { if (!tocou) throw e; break; }
        if (!ativo || falaCancelada) break;
        const fonte = ac.createBufferSource();
        fonte.buffer = buffer;
        fonte.connect(analisador);
        fonteVolume = analisador; audioAtual = fonte; tocou = true;
        await new Promise((ok) => { fonte.onended = ok; fonte.start(); });
      }
    } finally { fonteVolume = null; audioAtual = null; analisador.disconnect(); }
  }

  function falarNavegador(texto) {
    const estilo = ESTILO_VOZ[personagem.voz] || { genero: personagem.genero, tom: 1, ritmo: 1 };
    const estimado = Math.max(1500, (texto.length * 62) / estilo.ritmo);
    if (!("speechSynthesis" in window) || !vozes.length) { ritmoAte = performance.now() + estimado; return new Promise((ok) => setTimeout(ok, estimado)); }
    speechSynthesis.cancel();
    const fala = new SpeechSynthesisUtterance(texto);
    fala.lang = "pt-BR";
    const voz = vozDoNavegador(estilo.genero);
    if (voz) fala.voice = voz;
    fala.pitch = estilo.tom * (estilo.genero === "M" && voz && !MASCULINAS.test(voz.name) ? 0.72 : 1);
    fala.rate = estilo.ritmo;
    return new Promise((ok) => {
      fala.onstart = () => { ritmoAte = performance.now() + estimado * 1.5; };
      fala.onend = fala.onerror = () => { ritmoAte = 0; ok(); };
      speechSynthesis.speak(fala);
    });
  }

  const retrato = {
    fonte: null,
    // Fala com a voz do Gemini; se não der, usa a voz do navegador.
    async falar(texto) {
      audioPronto(); falaCancelada = false;
      try { await falarComGemini(texto); retrato.fonte = "gemini"; }
      catch (e) { console.warn("Usando a voz do navegador:", e.message); retrato.fonte = "navegador"; retrato.motivo = e.message; await falarNavegador(texto); }
    },
    calar() { falaCancelada = true; try { audioAtual?.stop(); } catch {} speechSynthesis?.cancel(); ritmoAte = 0; fonteVolume = null; },
    moverBoca(ms) { ritmoAte = performance.now() + ms; },
    detectou: () => !!pts,
    fixar(valor) { fixo = valor; },
    destruir() { ativo = false; obs.disconnect(); retrato.calar(); },
  };
  return retrato;
}

window.Boca = { montar };
window.dispatchEvent(new Event("boca-pronta"));
