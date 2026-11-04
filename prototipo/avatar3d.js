// Personagens e cenários em 3D (Three.js). Tudo é montado com formas simples, sem modelos externos.
import * as THREE from "three";

// ---------- utilidades ----------
const mat = (cor, extra = {}) => new THREE.MeshStandardMaterial({ color: cor, roughness: 0.7, metalness: 0, ...extra });
function malha(geo, material, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(geo, material);
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}
const caixa = (w, h, d, cor, x, y, z, extra) => malha(new THREE.BoxGeometry(w, h, d), mat(cor, extra), x, y, z);
const cilindro = (rt, rb, h, cor, x, y, z, extra) => malha(new THREE.CylinderGeometry(rt, rb, h, 24), mat(cor, extra), x, y, z);
function esfera(r, cor, x, y, z, sx = 1, sy = 1, sz = 1, extra) {
  const m = malha(new THREE.SphereGeometry(r, 32, 24), cor instanceof THREE.Material ? cor : mat(cor, extra), x, y, z);
  m.scale.set(sx, sy, sz);
  return m;
}
function sorteio(semente) {
  let s = semente;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}
function texturaCanvas(w, h, desenhar) {
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  desenhar(c.getContext("2d"), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// ---------- personagem ----------
function texturaXadrez(cor) {
  return texturaCanvas(128, 128, (g, w, h) => {
    g.fillStyle = cor; g.fillRect(0, 0, w, h);
    g.fillStyle = "rgba(0,0,0,.28)";
    for (let i = 0; i < w; i += 32) { g.fillRect(i, 0, 10, h); g.fillRect(0, i, w, 10); }
    g.fillStyle = "rgba(255,255,255,.16)";
    for (let i = 20; i < w; i += 32) { g.fillRect(i, 0, 3, h); g.fillRect(0, i, w, 3); }
  });
}

function triangulo(cor, largura, altura, x, y, z) {
  const forma = new THREE.Shape();
  forma.moveTo(-largura / 2, 0); forma.lineTo(largura / 2, 0); forma.lineTo(0, -altura); forma.closePath();
  const m = malha(new THREE.ShapeGeometry(forma), mat(cor, { side: THREE.DoubleSide }), x, y, z);
  m.castShadow = false;
  return m;
}

function montarPersonagem(p) {
  const grupo = new THREE.Group();
  const pele = mat(p.pele, { roughness: 0.55 });
  const cabelo = mat(p.cabelo, { roughness: 0.45 });
  const roupaMat = p.roupa === "xadrez" ? mat("#ffffff", { map: texturaXadrez(p.cor) }) : mat(p.cor, { roughness: 0.8 });

  // Corpo
  const corpo = new THREE.Group();
  const torso = malha(new THREE.CapsuleGeometry(0.26, 0.5, 8, 24), roupaMat, 0, 0.86, 0);
  torso.scale.set(1.38, 1, 0.78);
  corpo.add(torso);
  [-1, 1].forEach((lado) => {
    const braco = malha(new THREE.CapsuleGeometry(0.075, 0.4, 6, 16), roupaMat, lado * 0.355, 1.0, 0);
    braco.rotation.z = lado * 0.08;
    corpo.add(braco);
  });
  corpo.add(malha(new THREE.CylinderGeometry(0.075, 0.085, 0.18, 24), pele, 0, 1.42, 0));
  const frente = 0.205;
  switch (p.roupa) {
    case "jaleco":
      corpo.add(triangulo(p.detalhe, 0.17, 0.2, 0, 1.36, frente));
      [-1, 1].forEach((l) => { const lap = caixa(0.03, 0.34, 0.01, "#d9dde2", l * 0.06, 1.18, frente + 0.005); lap.rotation.z = l * 0.25; corpo.add(lap); });
      break;
    case "terno":
      corpo.add(triangulo("#f2f2f2", 0.16, 0.22, 0, 1.36, frente));
      corpo.add(caixa(0.035, 0.2, 0.012, p.detalhe, 0, 1.24, frente + 0.008));
      break;
    case "blazer": case "cardigan":
      corpo.add(triangulo(p.detalhe, 0.15, 0.18, 0, 1.36, frente));
      if (p.roupa === "cardigan") [1.13, 1.03].forEach((y) => corpo.add(esfera(0.012, "#3a2c22", 0.03, y, frente + 0.01)));
      break;
    case "polo": {
      const gola = malha(new THREE.TorusGeometry(0.1, 0.022, 12, 32), mat(new THREE.Color(p.cor).multiplyScalar(0.7)), 0, 1.36, 0.02);
      gola.rotation.x = Math.PI / 2 - 0.25; corpo.add(gola);
      [1.27, 1.21].forEach((y) => corpo.add(esfera(0.01, "#5a3510", 0, y, frente + 0.01)));
      break;
    }
    case "esportivo": {
      const faixa = malha(new THREE.CylinderGeometry(0.365, 0.365, 0.035, 32, 1, true), mat("#ffffff"), 0, 1.0, 0);
      faixa.scale.set(1, 1, 0.78); corpo.add(faixa);
      break;
    }
    default: {
      const gola = malha(new THREE.TorusGeometry(0.09, 0.016, 12, 32), mat(new THREE.Color(p.cor).multiplyScalar(1.6)), 0, 1.35, 0.01);
      gola.rotation.x = Math.PI / 2 - 0.2; corpo.add(gola);
    }
  }
  grupo.add(corpo);

  // Cabeça
  const cabeca = new THREE.Group();
  cabeca.position.y = 1.5;
  const Y = 0.13; // altura do centro da cabeça acima do pivô do pescoço
  const cranio = esfera(0.2, pele, 0, Y, 0, 0.95, 1.12, 1);
  cabeca.add(cranio);
  [-1, 1].forEach((l) => cabeca.add(esfera(0.045, pele, l * 0.188, Y, -0.01, 0.5, 1, 0.8)));
  cabeca.add(esfera(0.03, pele, 0, Y - 0.02, 0.198, 0.8, 1, 1));

  // Olhos
  const olhos = [], pupilas = [];
  [-1, 1].forEach((l) => {
    const olho = new THREE.Group();
    olho.position.set(l * 0.072, Y + 0.03, 0.163);
    olho.add(esfera(0.035, mat("#fbf7f2", { roughness: 0.25 }), 0, 0, 0, 1, 0.85, 0.7));
    const pupila = new THREE.Group();
    pupila.add(malha(new THREE.CircleGeometry(0.018, 24), mat(p.olhos || "#4a2f1d", { roughness: 0.3 }), 0, 0, 0.0235));
    pupila.add(malha(new THREE.CircleGeometry(0.009, 20), mat("#0d0907"), 0, 0, 0.024));
    pupila.add(malha(new THREE.CircleGeometry(0.0045, 12), new THREE.MeshBasicMaterial({ color: "#ffffff" }), 0.007, 0.007, 0.0245));
    olho.add(pupila);
    cabeca.add(olho);
    olhos.push(olho); pupilas.push(pupila);
  });

  // Sobrancelhas
  const sobrancelhas = [-1, 1].map((l) => {
    const s = caixa(0.065, 0.013, 0.015, new THREE.Color(p.cabelo).multiplyScalar(0.8), l * 0.072, Y + 0.085, 0.185);
    s.rotation.z = -l * 0.1;
    cabeca.add(s);
    return s;
  });

  // Boca
  const corLabio = new THREE.Color(p.pele).multiplyScalar(0.55);
  const bocaFechada = malha(new THREE.TorusGeometry(0.038, 0.007, 8, 24, Math.PI), mat(corLabio), 0, Y - 0.075, 0.188);
  bocaFechada.rotation.z = Math.PI;
  cabeca.add(bocaFechada);
  const bocaAberta = new THREE.Group();
  bocaAberta.position.set(0, Y - 0.08, 0.182);
  bocaAberta.add(esfera(0.036, "#3b1410", 0, 0, 0, 1.15, 0.75, 0.4));
  bocaAberta.add(caixa(0.05, 0.012, 0.01, "#f4efe8", 0, 0.014, 0.013));
  bocaAberta.add(esfera(0.018, "#c45a58", 0, -0.013, 0.008, 1.2, 0.5, 0.4));
  bocaAberta.scale.y = 0.01;
  cabeca.add(bocaAberta);

  // Barba
  if (p.barba === "cheia") {
    const b = malha(new THREE.SphereGeometry(0.207, 32, 16, 0, Math.PI * 2, Math.PI * 0.66, Math.PI * 0.34), cabelo, 0, Y + 0.005, 0.004);
    b.scale.set(0.97, 1.14, 1.03); cabeca.add(b);
  } else if (p.barba === "bigode") {
    const b = malha(new THREE.CapsuleGeometry(0.013, 0.06, 4, 8), cabelo, 0, Y - 0.052, 0.197);
    b.rotation.z = Math.PI / 2; cabeca.add(b);
  }

  // Cabelo
  const tampa = (inclina = -0.38, aberto = 0.5) => {
    const t = malha(new THREE.SphereGeometry(0.214, 32, 16, 0, Math.PI * 2, 0, Math.PI * aberto), cabelo, 0, Y + 0.01, -0.012);
    t.scale.set(0.98, 1.14, 1.04);
    t.rotation.x = inclina;
    return t;
  };
  switch (p.estilo) {
    case "curto": cabeca.add(tampa(-0.55, 0.45)); break;
    case "jovem":
      cabeca.add(tampa(-0.55, 0.45));
      for (let i = 0; i < 6; i++) {
        const c = malha(new THREE.ConeGeometry(0.035, 0.08, 8), cabelo, -0.09 + i * 0.036, Y + 0.21, 0.04 - Math.abs(i - 2.5) * 0.012);
        c.rotation.x = 0.5; c.rotation.z = (i - 2.5) * 0.12; cabeca.add(c);
      }
      break;
    case "liso": case "ombro": {
      cabeca.add(tampa(-0.5, 0.47));
      const comprimento = p.estilo === "liso" ? 0.34 : 0.16;
      const costas = malha(new THREE.CapsuleGeometry(0.2, comprimento, 8, 24), cabelo, 0, Y - 0.08 - comprimento / 3, -0.07);
      costas.scale.set(1.05, 1, 0.55); cabeca.add(costas);
      [-1, 1].forEach((l) => {
        const lado = malha(new THREE.CapsuleGeometry(0.05, comprimento + 0.08, 6, 12), cabelo, l * 0.17, Y - 0.06 - comprimento / 4, 0.03);
        cabeca.add(lado);
      });
      break;
    }
    case "coque":
      cabeca.add(tampa(-0.5, 0.46));
      cabeca.add(esfera(0.085, cabelo, 0, Y + 0.24, -0.09));
      break;
    case "cacheado": {
      const r = sorteio(7);
      for (let i = 0; i < 46; i++) {
        const th = r() * Math.PI * 2, ph = r() * Math.PI * 0.58;
        const x = Math.sin(ph) * Math.cos(th) * 0.22, y = Math.cos(ph) * 0.25, z = Math.sin(ph) * Math.sin(th) * 0.22;
        if (z > 0.12 && y < 0.17) continue; // deixa o rosto livre
        cabeca.add(esfera(0.06 + r() * 0.03, cabelo, x * 1.05, Y + y, z - 0.02));
      }
      break;
    }
    case "calvo":
      [-1, 1].forEach((l) => cabeca.add(esfera(0.1, cabelo, l * 0.165, Y - 0.005, -0.05, 0.45, 0.62, 0.95)));
      cabeca.add(esfera(0.13, cabelo, 0, Y - 0.01, -0.15, 1.2, 0.55, 0.5));
      break;
  }

  // Óculos
  if (p.oculos) {
    const aro = mat("#1f1f1f", { roughness: 0.35, metalness: 0.4 });
    [-1, 1].forEach((l) => {
      const a = malha(new THREE.TorusGeometry(0.036, 0.0045, 8, 32), aro, l * 0.072, Y + 0.03, 0.205);
      a.scale.set(1.15, 0.85, 1); cabeca.add(a);
      const lente = malha(new THREE.CircleGeometry(0.035, 24), new THREE.MeshPhysicalMaterial({ color: "#cfe8ff", transparent: true, opacity: 0.12, roughness: 0, metalness: 0.2 }), l * 0.072, Y + 0.03, 0.205);
      lente.scale.set(1.15, 0.85, 1); cabeca.add(lente);
    });
    const ponte = malha(new THREE.CylinderGeometry(0.004, 0.004, 0.03, 8), aro, 0, Y + 0.035, 0.207);
    ponte.rotation.z = Math.PI / 2; cabeca.add(ponte);
  }

  grupo.add(cabeca);
  return { grupo, corpo, torso, cabeca, olhos, pupilas, sobrancelhas, bocaFechada, bocaAberta };
}

// ---------- cenários ----------
function texturaJanela(tipo) {
  return texturaCanvas(512, 384, (g, w, h) => {
    if (tipo === "cidade") {
      const ceu = g.createLinearGradient(0, 0, 0, h); ceu.addColorStop(0, "#8ec5ff"); ceu.addColorStop(1, "#e8f3ff");
      g.fillStyle = ceu; g.fillRect(0, 0, w, h);
      const r = sorteio(3);
      for (let x = 0; x < w; x += 34) {
        const alt = 120 + r() * 220;
        g.fillStyle = `rgba(${90 + r() * 40},${110 + r() * 40},${140 + r() * 40},.9)`; g.fillRect(x, h - alt, 30, alt);
        g.fillStyle = "rgba(255,255,255,.35)";
        for (let y = h - alt + 10; y < h - 8; y += 16) for (let j = 4; j < 26; j += 9) if (r() > 0.4) g.fillRect(x + j, y, 5, 7);
      }
    } else {
      const ceu = g.createLinearGradient(0, 0, 0, h); ceu.addColorStop(0, "#a9d6ff"); ceu.addColorStop(0.7, "#eaf6ff"); ceu.addColorStop(1, "#cfe6c4");
      g.fillStyle = ceu; g.fillRect(0, 0, w, h);
      g.fillStyle = "#7fb36a"; g.beginPath(); g.ellipse(120, h, 200, 90, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = "#6aa35a"; g.beginPath(); g.ellipse(400, h + 10, 220, 110, 0, 0, Math.PI * 2); g.fill();
    }
  });
}

function base(grupo, { parede, chao, lateral }) {
  const piso = malha(new THREE.PlaneGeometry(14, 14), mat(chao, { roughness: 0.85 }), 0, 0, 0);
  piso.rotation.x = -Math.PI / 2; grupo.add(piso);
  const fundo = malha(new THREE.PlaneGeometry(14, 7), mat(parede, { roughness: 0.95 }), 0, 3.5, -2.4); grupo.add(fundo);
  [-1, 1].forEach((l) => {
    const p = malha(new THREE.PlaneGeometry(8, 7), mat(lateral || parede, { roughness: 0.95 }), l * 3.2, 3.5, 1);
    p.rotation.y = -l * Math.PI / 2; grupo.add(p);
  });
}
function janela(grupo, x, y, w, h, tipo = "dia") {
  const vidro = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: texturaJanela(tipo) }));
  vidro.position.set(x, y, -2.38); grupo.add(vidro);
  const moldura = "#f4f4f2";
  grupo.add(caixa(w + 0.1, 0.06, 0.08, moldura, x, y + h / 2, -2.36), caixa(w + 0.1, 0.06, 0.12, moldura, x, y - h / 2, -2.34));
  grupo.add(caixa(0.06, h, 0.08, moldura, x - w / 2, y, -2.36), caixa(0.06, h, 0.08, moldura, x + w / 2, y, -2.36), caixa(0.04, h, 0.05, moldura, x, y, -2.36));
  const luz = new THREE.PointLight("#fff6e6", 6, 6, 1.6); luz.position.set(x, y, -1.6); grupo.add(luz);
}
function estante(grupo, x, cor, semente, { largura = 1.1, altura = 2.2, livros = true, itens } = {}) {
  const r = sorteio(semente), z = -2.15;
  grupo.add(caixa(0.05, altura, 0.4, cor, x - largura / 2, altura / 2, z), caixa(0.05, altura, 0.4, cor, x + largura / 2, altura / 2, z));
  for (let i = 0; i < 5; i++) {
    const y = 0.1 + i * (altura - 0.1) / 4;
    grupo.add(caixa(largura, 0.04, 0.4, cor, x, y, z));
    if (i === 4) continue;
    let px = x - largura / 2 + 0.06;
    while (px < x + largura / 2 - 0.12) {
      if (itens) { const it = itens(r, px, y, z); grupo.add(it.malha); px += it.largura; continue; }
      if (!livros || r() < 0.18) { px += 0.12; continue; }
      const lw = 0.04 + r() * 0.04, lh = 0.24 + r() * 0.14;
      const corLivro = ["#7a2e2e", "#2e4a7a", "#2e6a4a", "#c9a35b", "#5a3e6e", "#d8d2c4", "#3b3b3b"][Math.floor(r() * 7)];
      grupo.add(caixa(lw, lh, 0.26, corLivro, px + lw / 2, y + 0.02 + lh / 2, z));
      px += lw + 0.006;
    }
  }
}
function planta(grupo, x, z, altura = 1.1, vaso = "#d9d4cc") {
  grupo.add(cilindro(0.17, 0.13, 0.36, vaso, x, 0.18, z));
  const r = sorteio(Math.round(x * 100 + 999));
  for (let i = 0; i < 12; i++) {
    const a = r() * Math.PI * 2, d = r() * 0.22, h = 0.45 + r() * (altura - 0.45);
    grupo.add(esfera(0.1 + r() * 0.08, ["#2f6b3a", "#3f8a4a", "#285a32"][i % 3], x + Math.cos(a) * d, h, z + Math.sin(a) * d * 0.6, 1, 1.3, 1, { roughness: 0.8 }));
  }
}
function quadro(grupo, x, y, w, h, cor, moldura = "#2b2b2b") {
  grupo.add(caixa(w + 0.06, h + 0.06, 0.03, moldura, x, y, -2.37));
  const tela = caixa(w, h, 0.01, cor, x, y, -2.35); tela.castShadow = false; grupo.add(tela);
}
function luminaria(grupo, x, y, z, cor = "#ffd9a0", intensidade = 4) {
  grupo.add(cilindro(0.005, 0.005, 3 - y, "#222", x, y + (3 - y) / 2 + 0.1, z));
  grupo.add(cilindro(0.06, 0.22, 0.2, "#1f1f1f", x, y, z, { side: THREE.DoubleSide }));
  const lampada = new THREE.Mesh(new THREE.SphereGeometry(0.05, 16, 12), new THREE.MeshBasicMaterial({ color: cor }));
  lampada.position.set(x, y - 0.08, z); grupo.add(lampada);
  const luz = new THREE.PointLight(cor, intensidade, 5, 1.8); luz.position.set(x, y - 0.15, z); grupo.add(luz);
}
function mesa(grupo, cor, { caneca = true } = {}) {
  grupo.add(caixa(2.6, 0.06, 0.9, cor, 0, 0.78, 0.55, { roughness: 0.5 }));
  if (caneca) {
    grupo.add(cilindro(0.04, 0.04, 0.1, "#f2f2f2", 0.62, 0.86, 0.48));
    grupo.add(caixa(0.26, 0.015, 0.2, "#e9e4d8", -0.6, 0.82, 0.5));
    grupo.add(cilindro(0.006, 0.006, 0.16, "#1f3a5f", -0.55, 0.835, 0.5).rotateZ(Math.PI / 2));
  }
}

export const CENARIOS = {
  escritorio: { nome: "Escritório", emoji: "🏢", parede: "#cfd6dc", luz: "#ffffff", montar(g) {
    base(g, { parede: "#cfd6dc", chao: "#8a7a6a" }); janela(g, 1.5, 1.9, 1.6, 1.4); estante(g, -1.55, "#e9e6e1", 11);
    planta(g, 0.55, -1.9); quadro(g, -0.2, 2.1, 0.7, 0.5, "#86a8c7"); mesa(g, "#6b4f3a"); } },
  consultorio: { nome: "Consultório", emoji: "🩺", parede: "#e9eef0", luz: "#f3fbff", montar(g) {
    base(g, { parede: "#e9eef0", chao: "#c9ccd0" });
    quadro(g, -0.9, 2.15, 0.45, 0.34, "#f6f1e3", "#8a6a3a"); quadro(g, -0.35, 2.15, 0.45, 0.34, "#f6f1e3", "#8a6a3a");
    g.add(caixa(1.2, 1.1, 0.45, "#ffffff", 1.6, 0.55, -2.1)); g.add(caixa(1.2, 0.04, 0.47, "#d9dde2", 1.6, 1.12, -2.1));
    const rel = cilindro(0.16, 0.16, 0.03, "#ffffff", 0.6, 2.3, -2.37); rel.rotation.x = Math.PI / 2; g.add(rel);
    planta(g, -1.9, -1.9); janela(g, 1.6, 2.1, 1.0, 0.8); mesa(g, "#f5f5f5"); } },
  odonto: { nome: "Clínica odontológica", emoji: "🦷", parede: "#d9f0ea", luz: "#f4fffb", montar(g) {
    base(g, { parede: "#d9f0ea", chao: "#d6d9d8" });
    g.add(caixa(1.6, 0.9, 0.5, "#ffffff", -1.4, 0.45, -2.1)); g.add(caixa(1.6, 0.04, 0.52, "#9fd8c8", -1.4, 0.92, -2.1));
    quadro(g, 0.2, 2.0, 0.8, 0.55, "#ffffff", "#9fd8c8"); g.add(esfera(0.12, "#7ec9b4", 0.2, 2.0, -2.33, 1.6, 0.6, 0.2));
    planta(g, 1.6, -1.9, 1.2, "#ffffff"); luminaria(g, 1.0, 2.3, -1.2, "#ffffff", 3); mesa(g, "#ffffff"); } },
  advocacia: { nome: "Escritório de advocacia", emoji: "⚖️", parede: "#4a3a2e", luz: "#ffe7c4", montar(g) {
    base(g, { parede: "#4a3a2e", chao: "#3a2a1e" });
    estante(g, -1.3, "#2d1f15", 5, { largura: 1.3 }); estante(g, 1.3, "#2d1f15", 9, { largura: 1.3 });
    quadro(g, 0, 2.2, 0.6, 0.45, "#c9b48a", "#c9a35b"); mesa(g, "#3b2a1e", { caneca: false });
    g.add(cilindro(0.06, 0.08, 0.04, "#c9a35b", 0.7, 0.83, 0.42)); g.add(cilindro(0.008, 0.008, 0.3, "#c9a35b", 0.7, 0.98, 0.42));
    const cupula = malha(new THREE.CylinderGeometry(0.1, 0.1, 0.3, 24, 1, false, 0, Math.PI), mat("#1f6b3a", { roughness: 0.3, side: THREE.DoubleSide }), 0.7, 1.15, 0.42);
    cupula.rotation.z = Math.PI / 2; g.add(cupula);
    const luz = new THREE.PointLight("#ffd9a0", 3, 3, 1.8); luz.position.set(0.7, 1.05, 0.42); g.add(luz); } },
  imobiliaria: { nome: "Imobiliária", emoji: "🏙️", parede: "#e6e1da", luz: "#ffffff", montar(g) {
    base(g, { parede: "#e6e1da", chao: "#b9b2a8" }); janela(g, 0.6, 1.9, 3.0, 1.9, "cidade");
    planta(g, -1.9, -1.8, 1.5, "#3b3b3b");
    g.add(caixa(0.8, 0.7, 0.5, "#ffffff", -1.5, 0.35, -2.0));
    const r = sorteio(4); for (let i = 0; i < 6; i++) g.add(caixa(0.08, 0.1 + r() * 0.25, 0.08, "#f5f5f5", -1.75 + i * 0.1, 0.75 + 0.05, -2.0));
    mesa(g, "#f0ede8"); } },
  galpao: { nome: "Galpão", emoji: "🏭", parede: "#8d8f8f", luz: "#fff3df", montar(g) {
    base(g, { parede: "#8d8f8f", chao: "#6f7070" });
    estante(g, -1.4, "#3f5a7a", 2, { largura: 1.4, itens: (r, px, y, z) => {
      const w = 0.22 + r() * 0.12; return { largura: w + 0.03, malha: caixa(w, 0.2 + r() * 0.15, 0.3, "#b8875a", px + w / 2, y + 0.15, z) }; } });
    const placa = texturaCanvas(256, 384, (c, w, h) => { c.fillStyle = "#132b52"; c.fillRect(0, 0, w, h); c.strokeStyle = "#9fb6d6"; c.lineWidth = 3;
      for (let x = 0; x <= w; x += w / 4) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, h); c.stroke(); } for (let y = 0; y <= h; y += h / 6) { c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke(); } });
    const painel = malha(new THREE.BoxGeometry(1.0, 1.6, 0.04), [mat("#9aa"), mat("#9aa"), mat("#9aa"), mat("#9aa"), mat("#fff", { map: placa, roughness: 0.25, metalness: 0.3 }), mat("#9aa")], 1.4, 0.85, -2.1);
    painel.rotation.x = -0.15; g.add(painel);
    luminaria(g, 0.2, 2.4, -1.3, "#fff3df", 5); mesa(g, "#5b6168"); } },
  academia: { nome: "Academia", emoji: "🏋️", parede: "#1d2226", luz: "#e8fff3", montar(g) {
    base(g, { parede: "#1d2226", chao: "#2a2a2a" });
    const neon = new THREE.Mesh(new THREE.BoxGeometry(5, 0.05, 0.03), new THREE.MeshBasicMaterial({ color: "#1fd57a" })); neon.position.set(0, 2.3, -2.37); g.add(neon);
    const luzNeon = new THREE.PointLight("#1fd57a", 4, 4, 1.5); luzNeon.position.set(0, 2.2, -2); g.add(luzNeon);
    g.add(caixa(1.8, 0.05, 0.45, "#444", -1.2, 0.55, -2.0), caixa(1.8, 0.05, 0.45, "#444", -1.2, 1.0, -2.0));
    for (let i = 0; i < 5; i++) [0.62, 1.07].forEach((y) => { const h = cilindro(0.06, 0.06, 0.3, "#111", -1.9 + i * 0.35, y + 0.05, -2.0, { metalness: 0.6, roughness: 0.3 }); h.rotation.z = Math.PI / 2; g.add(h); });
    [1.2, 1.6].forEach((x) => g.add(esfera(0.13, "#1a1a1a", x, 0.13, -1.9, 1, 1, 1, { metalness: 0.5, roughness: 0.4 })));
    const espelho = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1.8), mat("#9fb0b8", { metalness: 0.9, roughness: 0.15 })); espelho.position.set(1.5, 1.4, -2.38); g.add(espelho);
    mesa(g, "#2a2f35", { caneca: false }); g.add(cilindro(0.035, 0.035, 0.22, "#1fd57a", 0.62, 0.92, 0.48)); } },
  marcenaria: { nome: "Marcenaria", emoji: "🪵", parede: "#a87a52", luz: "#ffe2b8", montar(g) {
    base(g, { parede: "#c79a6c", chao: "#6b4a30" });
    for (let i = 0; i < 26; i++) g.add(caixa(0.18, 3.5, 0.04, i % 2 ? "#a87a52" : "#b88a60", -2.5 + i * 0.2, 1.75, -2.36));
    estante(g, 1.5, "#7a5536", 6, { largura: 1.1, itens: (r, px, y, z) => { const w = 0.16; return { largura: w + 0.04, malha: caixa(w, 0.22, 0.25, ["#d9b48a", "#8a5a36", "#e8d2b0", "#5a3a22"][Math.floor(r() * 4)], px + w / 2, y + 0.13, z) }; } });
    planta(g, -1.8, -1.9, 1.0, "#7a5536"); luminaria(g, -0.4, 2.3, -1.2, "#ffd29a", 5); mesa(g, "#7a5536"); } },
  loja: { nome: "Loja", emoji: "📱", parede: "#f2f4f7", luz: "#ffffff", montar(g) {
    base(g, { parede: "#f2f4f7", chao: "#d5d8dd" });
    [-1.3, 1.3].forEach((x, k) => estante(g, x, "#ffffff", 20 + k, { largura: 1.3, itens: (r, px, y, z) => {
      const tela = new THREE.Group(); tela.add(caixa(0.09, 0.18, 0.015, "#111", 0, 0, 0));
      const brilho = new THREE.Mesh(new THREE.PlaneGeometry(0.08, 0.16), new THREE.MeshBasicMaterial({ color: ["#3aa0ff", "#1fd57a", "#ff8a3a", "#b36bff"][Math.floor(r() * 4)] }));
      brilho.position.z = 0.009; tela.add(brilho); tela.position.set(px + 0.06, y + 0.14, z + 0.1); tela.rotation.x = -0.1;
      return { largura: 0.16, malha: tela }; } }));
    const led = new THREE.Mesh(new THREE.BoxGeometry(5, 0.04, 0.03), new THREE.MeshBasicMaterial({ color: "#ffffff" })); led.position.set(0, 2.45, -2.37); g.add(led);
    mesa(g, "#222222", { caneca: false }); } },
  homeoffice: { nome: "Home office", emoji: "🏠", parede: "#d8cbbd", luz: "#fff1dc", montar(g) {
    base(g, { parede: "#d8cbbd", chao: "#9c7a58" }); janela(g, -1.4, 1.9, 1.3, 1.3); estante(g, 1.5, "#f4efe8", 31, { largura: 0.9 });
    planta(g, -0.4, -1.95, 1.3, "#b86b4b"); quadro(g, 0.5, 2.1, 0.5, 0.6, "#e0a96d", "#f4efe8"); luminaria(g, 0.7, 2.2, -1.4, "#ffd9a0", 3);
    mesa(g, "#9c7a58"); } },
};

export const CENARIO_POR_NICHO = {
  "Ortopedista": "consultorio", "Dentista": "odonto", "Energia solar": "galpao", "Imobiliária": "imobiliaria",
  "Advogado": "advocacia", "Academia": "academia", "Materiais de construção": "galpao", "Móveis planejados": "marcenaria",
  "Loja de celulares": "loja",
};

// ---------- cena ----------
export function criarCena(container, personagem, cenarioId) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);

  const cena = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 40);
  const alvo = new THREE.Vector3(0, 1.38, 0);

  cena.add(new THREE.HemisphereLight("#ffffff", "#4a4540", 1.5));
  const chave = new THREE.DirectionalLight("#fff6ea", 2.4);
  chave.position.set(1.6, 3, 2.6); chave.castShadow = true;
  chave.shadow.mapSize.set(1024, 1024); chave.shadow.camera.left = -3; chave.shadow.camera.right = 3; chave.shadow.camera.top = 3; chave.shadow.camera.bottom = -1; chave.shadow.bias = -0.0005;
  cena.add(chave);
  const preenchimento = new THREE.DirectionalLight("#cfe0ff", 0.6); preenchimento.position.set(-2, 1.8, 2); cena.add(preenchimento);
  const contorno = new THREE.PointLight("#1fd57a", 2, 3, 1.5); contorno.position.set(1.3, 1.7, -1.2); cena.add(contorno);

  let ambiente = null, boneco = null;
  function trocarCenario(id) {
    const c = CENARIOS[id] || CENARIOS.escritorio;
    if (ambiente) { cena.remove(ambiente); ambiente.traverse((o) => { o.geometry?.dispose(); }); }
    ambiente = new THREE.Group(); c.montar(ambiente); cena.add(ambiente);
    cena.fog = new THREE.Fog(c.parede, 4.2, 11);
    cena.background = new THREE.Color(c.parede);
    chave.color.set(c.luz);
  }
  function trocarPersonagem(p) {
    if (boneco) { cena.remove(boneco.grupo); boneco.grupo.traverse((o) => o.geometry?.dispose()); }
    boneco = montarPersonagem(p); cena.add(boneco.grupo);
  }
  trocarCenario(cenarioId); trocarPersonagem(personagem);

  function ajustar() {
    const w = container.clientWidth || 1, h = container.clientHeight || 1;
    renderer.setSize(w, h, false); renderer.domElement.style.width = "100%"; renderer.domElement.style.height = "100%";
    camera.aspect = w / h;
    camera.fov = w / h < 1 ? 42 : 30;
    camera.updateProjectionMatrix();
  }
  const observador = new ResizeObserver(ajustar); observador.observe(container); ajustar();

  // Estado da animação
  let falandoAte = 0, abertura = 0, olharX = 0, olharY = 0, mouseX = 0, mouseY = 0;
  let proximaPiscada = 1.5, piscando = -1, proximoOlhar = 2, alvoPupila = [0, 0], volumeExterno = null;
  const relogio = new THREE.Clock();
  let ativo = true;

  function quadro() {
    if (!ativo) return;
    requestAnimationFrame(quadro);
    const t = relogio.getElapsedTime(), b = boneco, falando = performance.now() < falandoAte;

    b.torso.scale.y = 1 + Math.sin(t * 1.4) * 0.012;
    b.corpo.position.y = Math.sin(t * 1.4) * 0.004;

    olharX += (mouseX - olharX) * 0.05; olharY += (mouseY - olharY) * 0.05;
    const aceno = falando ? Math.sin(t * 5.2) * 0.035 + Math.sin(t * 2.1) * 0.02 : 0;
    b.cabeca.rotation.y = Math.sin(t * 0.5) * 0.07 + olharX * 0.22;
    b.cabeca.rotation.x = Math.sin(t * 0.7) * 0.025 + olharY * 0.1 + aceno;
    b.cabeca.rotation.z = Math.sin(t * 0.4) * 0.025;

    if (t > proximaPiscada && piscando < 0) { piscando = t; proximaPiscada = t + 2 + Math.random() * 3.5; }
    const fase = piscando >= 0 ? (t - piscando) / 0.16 : 1;
    const fechamento = fase < 1 ? 1 - Math.sin(fase * Math.PI) * 0.92 : 1;
    if (fase >= 1) piscando = -1;
    b.olhos.forEach((o) => (o.scale.y = fechamento));

    if (t > proximoOlhar) { alvoPupila = [(Math.random() - 0.5) * 0.012, (Math.random() - 0.5) * 0.006]; proximoOlhar = t + 1.2 + Math.random() * 3; }
    b.pupilas.forEach((p) => { p.position.x += (alvoPupila[0] - p.position.x) * 0.25; p.position.y += (alvoPupila[1] - p.position.y) * 0.25; });

    let alvoBoca = 0;
    if (volumeExterno != null) alvoBoca = volumeExterno;
    else if (falando) alvoBoca = 0.3 + 0.7 * Math.abs(Math.sin(t * 17) * Math.sin(t * 6.3 + 1));
    abertura += (alvoBoca - abertura) * 0.35;
    b.bocaAberta.scale.y = Math.max(0.01, abertura);
    b.bocaAberta.visible = abertura > 0.05;
    b.bocaFechada.visible = abertura <= 0.05;
    const sobe = falando ? Math.max(0, Math.sin(t * 3.1)) * 0.012 : 0;
    b.sobrancelhas.forEach((s) => (s.position.y = 0.215 + sobe));

    camera.position.set(olharX * 0.2, 1.5 - olharY * 0.06, 3.0);
    camera.lookAt(alvo);
    renderer.render(cena, camera);
  }
  quadro();

  return {
    trocarCenario, trocarPersonagem,
    falar(ms) { falandoAte = performance.now() + ms; },
    calar() { falandoAte = 0; },
    volume(v) { volumeExterno = v; },
    olhar(x, y) { mouseX = x; mouseY = y; },
    destruir() { ativo = false; observador.disconnect(); renderer.dispose(); renderer.domElement.remove(); },
  };
}
