// Boca falando nos retratos, de graça e no próprio navegador.
// 1) O MediaPipe acha os lábios e o queixo no retrato (uma vez por imagem, fica guardado).
// 2) A voz é a voz aprovada do ElevenLabs, pedida ao servidor local (/api/voz).
// 3) A boca abre conforme o volume real do áudio: os lábios se separam e o queixo desce
//    um pouco, com as bordas esfumadas para não parecer recorte.
// Sem servidor ou sem chave, cai para a voz do navegador com um ritmo aproximado.
import { FaceLandmarker, FilesetResolver } from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/vision_bundle.mjs";

const VERSAO_CACHE = "closing:boca:v1:";
const LABIO_SUPERIOR_INTERNO = [78, 191, 80, 81, 82, 13, 312, 311, 310, 415, 308];
const LABIO_INFERIOR_INTERNO = [308, 324, 318, 402, 317, 14, 87, 178, 88, 95, 78];
const CONTORNO_QUEIXO = [397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172];

// Jeito de falar na voz do navegador (só quando o ElevenLabs não está disponível).
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

// ---------- retrato animado ----------
export async function montar(container, personagem) {
  container.innerHTML = "";
  const canvas = document.createElement("canvas");
  canvas.className = "retrato-vivo";
  container.append(canvas);
  const ctx = canvas.getContext("2d");
  const camada = document.createElement("canvas"), ctxCamada = camada.getContext("2d");
  const img = await carregarImagem(personagem.foto);
  let pts = null;
  try { pts = await pontosDoRosto(img, personagem.foto); } catch (e) { console.warn("Rosto não detectado; boca sem animação.", e); }

  let abertura = 0, ativo = true, fonteVolume = null, ritmoAte = 0, audioAtual = null;
  const amostras = new Uint8Array(1024);
  const inicio = performance.now();

  function ajustar() {
    const r = container.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = camada.width = Math.max(1, Math.round(r.width * dpr));
    canvas.height = camada.height = Math.max(1, Math.round(r.height * dpr));
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

  function contorno(c, indices, P, deslocamento = 0) {
    indices.forEach((i, k) => { const [x, y] = P(i); k ? c.lineTo(x, y + deslocamento) : c.moveTo(x, y + deslocamento); });
  }

  function desenhar() {
    if (!ativo) return;
    requestAnimationFrame(desenhar);
    const W = canvas.width, H = canvas.height, iw = img.naturalWidth, ih = img.naturalHeight;
    const s = Math.max(W / iw, H / ih), dx = (W - iw * s) * 0.5, dy = (H - ih * s) * 0.35;
    ctx.clearRect(0, 0, W, H);
    ctx.drawImage(img, dx, dy, iw * s, ih * s);
    if (!pts) return;

    const alvo = volume();
    abertura += (alvo - abertura) * (alvo > abertura ? 0.55 : 0.25);
    if (abertura < 0.03) return;

    const P = (i) => [dx + pts[i][0] * iw * s, dy + pts[i][1] * ih * s];
    const [x1, y1] = P(61), [x2, y2] = P(291), [, ySup] = P(13), [, yInf] = P(14), [, yQueixo] = P(152);
    const largura = Math.hypot(x2 - x1, y2 - y1), meioX = (x1 + x2) / 2;
    const queda = abertura * Math.min(largura * 0.24, (yQueixo - yInf) * 0.2);

    // Interior da boca: entre o lábio de cima (parado) e o de baixo (descendo).
    ctx.save();
    ctx.beginPath();
    contorno(ctx, LABIO_SUPERIOR_INTERNO, P);
    contorno(ctx, LABIO_INFERIOR_INTERNO, P, queda);
    ctx.closePath();
    const fundo = ctx.createLinearGradient(0, ySup, 0, yInf + queda);
    fundo.addColorStop(0, "#1a0706"); fundo.addColorStop(1, "#4a1512");
    ctx.fillStyle = fundo;
    ctx.fill();
    ctx.clip();
    ctx.fillStyle = "rgba(245,240,232,.92)";
    ctx.fillRect(meioX - largura * 0.3, ySup - 2, largura * 0.6, Math.max(1.5, queda * 0.3));
    ctx.fillStyle = "rgba(180,80,78,.85)";
    ctx.beginPath();
    ctx.ellipse(meioX, yInf + queda * 0.85, largura * 0.22, Math.max(1, queda * 0.25), 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Lábio de baixo e queixo descem juntos, com a borda esfumada para se misturar ao rosto.
    ctxCamada.clearRect(0, 0, W, H);
    ctxCamada.save();
    ctxCamada.filter = `blur(${Math.max(1, largura * 0.05)}px)`;
    ctxCamada.beginPath();
    contorno(ctxCamada, LABIO_INFERIOR_INTERNO.slice().reverse(), P, queda);
    contorno(ctxCamada, CONTORNO_QUEIXO, P, queda * 0.6);
    ctxCamada.closePath();
    ctxCamada.fillStyle = "#fff";
    ctxCamada.fill();
    ctxCamada.restore();
    ctxCamada.globalCompositeOperation = "source-in";
    ctxCamada.drawImage(img, dx, dy + queda, iw * s, ih * s);
    ctxCamada.globalCompositeOperation = "source-over";
    ctx.drawImage(camada, 0, 0);
  }
  desenhar();

  async function falarElevenLabs(texto) {
    const resp = await fetch("/api/voz", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ texto, voz: personagem.voz }) });
    if (!resp.ok) throw new Error((await resp.json().catch(() => ({}))).erro || `voz indisponível (${resp.status})`);
    const url = URL.createObjectURL(await resp.blob());
    const audio = new Audio(url);
    audioAtual = audio;
    const ac = audioPronto();
    const analisador = ac.createAnalyser();
    analisador.fftSize = 1024;
    const fonte = ac.createMediaElementSource(audio);
    fonte.connect(analisador); analisador.connect(ac.destination);
    fonteVolume = analisador;
    await new Promise((ok) => { audio.onended = audio.onerror = ok; audio.play().catch(ok); });
    fonteVolume = null; audioAtual = null;
    URL.revokeObjectURL(url);
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
    // Fala com a voz aprovada do ElevenLabs; se não der, usa a voz do navegador.
    async falar(texto) {
      audioPronto();
      try { await falarElevenLabs(texto); retrato.fonte = "elevenlabs"; }
      catch (e) { console.warn("Usando a voz do navegador:", e.message); retrato.fonte = "navegador"; retrato.motivo = e.message; await falarNavegador(texto); }
    },
    calar() { audioAtual?.pause(); speechSynthesis?.cancel(); ritmoAte = 0; fonteVolume = null; },
    moverBoca(ms) { ritmoAte = performance.now() + ms; },
    detectou: () => !!pts,
    destruir() { ativo = false; obs.disconnect(); retrato.calar(); },
  };
  return retrato;
}

window.Boca = { montar };
window.dispatchEvent(new Event("boca-pronta"));
