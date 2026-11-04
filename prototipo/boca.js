// Boca falando nos retratos, de graça e no próprio navegador.
// 1) O MediaPipe acha os lábios e o queixo no retrato (uma vez por imagem, fica guardado).
// 2) Ao falar, o queixo desce e aparece o interior da boca, no ritmo das sílabas.
// 3) A voz vem do sintetizador de fala do navegador/Windows (pt-BR).
import { FaceLandmarker, FilesetResolver } from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/vision_bundle.mjs";

const VERSAO_CACHE = "closing:boca:v1:";
const LABIO_INFERIOR_INTERNO = [291, 308, 324, 318, 402, 317, 14, 87, 178, 88, 95, 78, 61];
const CONTORNO_QUEIXO = [397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172];

// Jeito de falar de cada voz aprovada (tom e velocidade da voz do navegador).
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
  const d = await carregarDetector();
  const r = d.detect(img);
  if (!r.faceLandmarks?.length) return null;
  const pts = r.faceLandmarks[0].map((p) => [p.x, p.y]);
  try { localStorage.setItem(VERSAO_CACHE + src, JSON.stringify(pts)); } catch {}
  return pts;
}

function carregarImagem(src) {
  return new Promise((ok, erro) => {
    const img = new Image();
    img.onload = () => ok(img);
    img.onerror = erro;
    img.src = src;
  });
}

// ---------- voz ----------
let vozes = [];
function atualizarVozes() { vozes = speechSynthesis.getVoices().filter((v) => /^pt(-|_)?BR/i.test(v.lang) || /portugu[eê]s.*brasil/i.test(v.name)); }
if ("speechSynthesis" in window) { atualizarVozes(); speechSynthesis.onvoiceschanged = atualizarVozes; }
const FEMININAS = /francisca|thalita|maria|let[ií]cia|fernanda|brenda|giovanna|leila|luciana|manuela|yara|elza|google/i;
const MASCULINAS = /antonio|ant[oô]nio|daniel|donato|f[aá]bio|julio|j[uú]lio|humberto|valerio|val[eé]rio|nicolau|leonardo/i;
function escolherVoz(genero) {
  const naturais = vozes.filter((v) => /natural|online|neural/i.test(v.name));
  const base = naturais.length ? naturais : vozes;
  const re = genero === "F" ? FEMININAS : MASCULINAS;
  return base.find((v) => re.test(v.name)) || vozes.find((v) => re.test(v.name)) || base[0] || null;
}

// ---------- retrato animado ----------
export async function montar(container, personagem) {
  container.innerHTML = "";
  const canvas = document.createElement("canvas");
  canvas.className = "retrato-vivo";
  container.append(canvas);
  const ctx = canvas.getContext("2d");
  const img = await carregarImagem(personagem.foto);
  let pts = null;
  try { pts = await pontosDoRosto(img, personagem.foto); } catch (e) { console.warn("Rosto não detectado; boca sem animação.", e); }

  let abertura = 0, alvo = 0, falandoAte = 0, pausaAte = 0, ativo = true;
  const relogio = performance.now();

  function ajustar() {
    const r = container.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.round(r.width * dpr));
    canvas.height = Math.max(1, Math.round(r.height * dpr));
  }
  const obs = new ResizeObserver(ajustar); obs.observe(container); ajustar();

  function desenhar() {
    if (!ativo) return;
    requestAnimationFrame(desenhar);
    const W = canvas.width, H = canvas.height, iw = img.naturalWidth, ih = img.naturalHeight;
    const s = Math.max(W / iw, H / ih), dx = (W - iw * s) * 0.5, dy = (H - ih * s) * 0.35;
    const P = (i) => [dx + pts[i][0] * iw * s, dy + pts[i][1] * ih * s];
    ctx.clearRect(0, 0, W, H);
    ctx.drawImage(img, dx, dy, iw * s, ih * s);
    if (!pts) return;

    // Ritmo das sílabas enquanto fala, com pequenas pausas entre palavras.
    const t = (performance.now() - relogio) / 1000, agora = performance.now();
    if (agora < falandoAte && agora > pausaAte) {
      const silaba = Math.abs(Math.sin(t * Math.PI * 4.6));
      alvo = 0.25 + 0.75 * silaba * (0.75 + 0.25 * Math.sin(t * 13.7));
    } else alvo = 0;
    abertura += (alvo - abertura) * 0.35;
    if (abertura < 0.02) return;

    const [cx1, cy1] = P(61), [cx2, cy2] = P(291), [, yLabioSup] = P(13), [, yLabioInf] = P(14), [, yQueixo] = P(152);
    const largura = Math.hypot(cx2 - cx1, cy2 - cy1);
    const queda = abertura * Math.min(largura * 0.42, (yQueixo - yLabioInf) * 0.36);
    const meioX = (cx1 + cx2) / 2;

    // Interior da boca (aparece entre o lábio de cima e o queixo que desce).
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(meioX, (yLabioSup + yLabioInf) / 2 + queda * 0.55, largura * 0.4, Math.max(2, queda * 0.62 + (yLabioInf - yLabioSup) * 0.5), 0, 0, Math.PI * 2);
    ctx.fillStyle = "#2a0d0b";
    ctx.fill();
    ctx.clip();
    ctx.fillStyle = "#f2ece4";
    ctx.fillRect(meioX - largura * 0.28, yLabioSup - 1, largura * 0.56, Math.max(2, queda * 0.32));
    ctx.fillStyle = "#b9504e";
    ctx.beginPath();
    ctx.ellipse(meioX, yLabioInf + queda * 0.95, largura * 0.24, Math.max(1, queda * 0.3), 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Queixo e lábio de baixo descem juntos.
    ctx.save();
    ctx.beginPath();
    // Do canto esquerdo da boca, pelo lábio de baixo, até o canto direito; depois volta pelo contorno do queixo.
    const contorno = [...LABIO_INFERIOR_INTERNO.slice().reverse(), ...CONTORNO_QUEIXO];
    contorno.forEach((i, k) => { const [x, y] = P(i); k ? ctx.lineTo(x, y) : ctx.moveTo(x, y); });
    ctx.closePath();
    ctx.translate(0, queda);
    ctx.clip();
    ctx.drawImage(img, dx, dy, iw * s, ih * s);
    ctx.restore();

    // Sombra suave sob o lábio de cima.
    const g = ctx.createLinearGradient(0, yLabioSup, 0, yLabioSup + queda * 0.6 + 2);
    g.addColorStop(0, "rgba(0,0,0,.35)"); g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(meioX - largura * 0.42, yLabioSup, largura * 0.84, queda * 0.6 + 2);
  }
  desenhar();

  function moverBoca(ms) { falandoAte = performance.now() + ms; }

  return {
    // Fala o texto com a voz do navegador e mexe a boca até terminar. Devolve uma promessa.
    falar(texto) {
      const estilo = ESTILO_VOZ[personagem.voz] || { genero: personagem.genero, tom: 1, ritmo: 1 };
      const estimado = Math.max(1500, texto.length * 62 / estilo.ritmo);
      if (!("speechSynthesis" in window) || !vozes.length) { moverBoca(estimado); return new Promise((ok) => setTimeout(ok, estimado)); }
      speechSynthesis.cancel();
      const fala = new SpeechSynthesisUtterance(texto);
      fala.lang = "pt-BR";
      const voz = escolherVoz(estilo.genero);
      if (voz) fala.voice = voz;
      // Sem voz masculina instalada, engrossa a voz disponível.
      const ajusteGenero = estilo.genero === "M" && voz && !MASCULINAS.test(voz.name) ? 0.72 : 1;
      fala.pitch = Math.max(0.1, Math.min(2, estilo.tom * ajusteGenero));
      fala.rate = estilo.ritmo;
      return new Promise((ok) => {
        fala.onstart = () => moverBoca(estimado * 1.5);
        fala.onboundary = () => { pausaAte = performance.now() + 60; };
        fala.onend = fala.onerror = () => { falandoAte = 0; ok(); };
        speechSynthesis.speak(fala);
        setTimeout(() => { if (!speechSynthesis.speaking) { moverBoca(estimado); setTimeout(ok, estimado); } }, 700);
      });
    },
    calar() { speechSynthesis?.cancel(); falandoAte = 0; },
    moverBoca,
    detectou: () => !!pts,
    destruir() { ativo = false; obs.disconnect(); speechSynthesis?.cancel(); },
  };
}

window.Boca = { montar };
window.dispatchEvent(new Event("boca-pronta"));
