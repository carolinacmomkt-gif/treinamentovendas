// Personagens do simulador e o desenho de cada um (SVG gerado a partir dos traços).
window.PERSONAGENS = [
  { id: "ricardo", foto: "personagens/ricardo-a.jpg", olhos: "#5a7a8c", nome: "Dr. Ricardo", idade: 52, nicho: "Ortopedista", perfil: "Analítico", voz: "Paulo", genero: "M",
    pele: "#e8b896", cabelo: "#8d8d8d", estilo: "curto", roupa: "jaleco", cor: "#f4f5f7", detalhe: "#a9c6e8", oculos: true, fundo: "#2f4858",
    fala: "Boa tarde. Eu tenho uns 20 minutos. Antes de tudo: quanto custa e quanto eu vou ter de retorno?" },
  { id: "camila", foto: "personagens/camila-a.jpg", olhos: "#5b3a22", nome: "Dra. Camila", idade: 38, nicho: "Dentista", perfil: "Comunicadora", voz: "Marcia", genero: "F",
    pele: "#d9a27e", cabelo: "#4a2c1d", estilo: "liso", roupa: "jaleco", cor: "#f4f5f7", detalhe: "#f3c6d3", fundo: "#5b3f63",
    fala: "Oi! Que bom falar com você. Olha, só aparece gente no meu Instagram querendo preço de limpeza…" },
  { id: "marcos", foto: "personagens/marcos-a.jpg", olhos: "#3a2414", nome: "Marcos", idade: 45, nicho: "Energia solar", perfil: "Executor", voz: "Yuri", genero: "M",
    pele: "#a8714f", cabelo: "#1f1a17", estilo: "curto", barba: "cheia", roupa: "polo", cor: "#e07a1f", fundo: "#3d4f2f",
    fala: "Vou ser direto: já contratei agência e só veio gente pedindo orçamento e sumindo. O que você faz de diferente?" },
  { id: "fernanda", foto: "personagens/fernanda-a.jpg", olhos: "#6b8f5e", nome: "Fernanda", idade: 41, nicho: "Imobiliária", perfil: "Planejadora", voz: "Raquel", genero: "F",
    pele: "#f0c8a8", cabelo: "#a5672f", estilo: "coque", roupa: "blazer", cor: "#1f3a5f", detalhe: "#f1e6dc", fundo: "#4a5568",
    fala: "Hoje o portal já me traz lead. Eu queria entender com calma por que eu pagaria por mais um canal." },
  { id: "paulo", foto: "personagens/paulo-a.jpg", olhos: "#4f5f6b", nome: "Dr. Paulo", idade: 60, nicho: "Advogado", perfil: "Analítico", voz: "Paulo", genero: "M",
    pele: "#e2b08f", cabelo: "#c4c4c4", estilo: "calvo", roupa: "terno", cor: "#2b2d42", detalhe: "#8b1e3f", oculos: true, fundo: "#3b3a4a",
    fala: "Pois não. Adianto que meu cliente vem de indicação, e a OAB tem regras bem claras sobre captação." },
  { id: "juliana", foto: "personagens/juliana-a.jpg", olhos: "#2e1a0e", nome: "Juliana", idade: 33, nicho: "Academia", perfil: "Comunicadora", voz: "Marcia", genero: "F",
    pele: "#7a4a2e", cabelo: "#1b1210", estilo: "cacheado", roupa: "esportivo", cor: "#16a34a", fundo: "#1f4d4a",
    fala: "Gente, em janeiro enche sozinho! O problema é o resto do ano. Já tive uma agência e foi um desastre." },
  { id: "roberto", foto: "personagens/roberto-a.jpg", olhos: "#4a3020", nome: "Roberto", idade: 50, nicho: "Materiais de construção", perfil: "Planejador", voz: "Yuri", genero: "M",
    pele: "#c68b63", cabelo: "#5b5048", estilo: "curto", barba: "bigode", roupa: "xadrez", cor: "#b23a3a", fundo: "#5a4632",
    fala: "Sinceramente, internet não funciona pro meu ramo. Meu cliente é pedreiro, ele não vê anúncio." },
  { id: "patricia", foto: "personagens/patricia-a.jpg", olhos: "#5b3a22", nome: "Patrícia", idade: 47, nicho: "Móveis planejados", perfil: "Analítica", voz: "Raquel", genero: "F",
    pele: "#d4a07a", cabelo: "#2e1f18", estilo: "ombro", roupa: "cardigan", cor: "#8a6d5b", detalhe: "#ffffff", fundo: "#4b3b47",
    fala: "O cliente pede três orçamentos e fecha com o mais barato. Como anúncio resolve isso?" },
  { id: "lucas", foto: "personagens/lucas-a.jpg", olhos: "#6b4a2b", nome: "Lucas", idade: 29, nicho: "Loja de celulares", perfil: "Executor", voz: "Witalo", genero: "M",
    pele: "#e9bf9b", cabelo: "#3a2a1e", estilo: "jovem", roupa: "camiseta", cor: "#111827", fundo: "#27364a",
    fala: "Mano, eu vi um freelancer bem mais barato. Me convence rápido, que eu tenho loja pra abrir." },
];

(function () {
  let contador = 0;

  // Clareia (f > 0) ou escurece (f < 0) uma cor hex.
  function tom(hex, f) {
    const n = parseInt(hex.slice(1), 16), alvo = f < 0 ? 0 : 255, k = Math.abs(f);
    const c = [n >> 16, (n >> 8) & 255, n & 255].map((v) => Math.round(v + (alvo - v) * k));
    return "#" + c.map((v) => v.toString(16).padStart(2, "0")).join("");
  }

  const cabeloAtras = {
    liso: "M60 90 C56 46 78 34 100 34 C124 34 146 46 140 90 L146 162 C120 172 80 172 54 162Z",
    ombro: "M60 88 C56 46 78 34 100 34 C124 34 146 46 140 88 L143 134 C130 141 70 141 57 134Z",
  };
  const cabeloFrente = {
    curto: "M63 82 C60 50 80 38 100 38 C122 38 142 50 137 82 C134 66 122 58 112 56 C104 62 86 62 76 58 C70 64 65 72 63 82Z",
    jovem: "M64 80 C60 46 84 34 104 36 C126 36 142 52 136 80 C132 62 124 54 116 52 L110 58 L102 49 L94 58 L86 51 C76 56 68 66 64 80Z",
    liso: "M63 84 C62 52 80 40 100 40 C122 40 140 54 137 84 C130 64 116 54 100 52 C92 60 76 66 63 84Z",
    ombro: "M63 84 C62 52 80 40 100 40 C122 40 140 54 137 84 C130 64 116 54 100 52 C92 60 76 66 63 84Z",
    coque: "M63 80 C62 52 80 42 100 42 C120 42 138 52 137 80 C128 62 114 56 100 56 C86 56 72 62 63 80Z",
    calvo: "M63 98 C59 82 61 70 68 63 L73 66 C68 75 68 86 69 98Z M137 98 C141 82 139 70 132 63 L127 66 C132 75 132 86 131 98Z",
  };
  const brilhoCabelo = {
    curto: "M82 46 C92 41 108 41 118 46", jovem: "M86 42 C96 38 110 39 120 44", liso: "M78 50 C88 43 104 42 116 46",
    ombro: "M78 50 C88 43 104 42 116 46", coque: "M82 48 C92 44 108 44 118 48",
  };
  const cachos = {
    atras: [[66, 70], [74, 52], [90, 42], [110, 42], [126, 52], [134, 70], [60, 92], [140, 92], [58, 114], [142, 114]],
    frente: [[78, 56], [94, 49], [110, 50], [124, 58]],
  };
  const CORPO = "M28 200 C30 158 60 140 100 140 C140 140 170 158 172 200Z";

  function roupa(p, u) {
    const base = `<path d="${CORPO}" fill="url(#${u}-roupa)"/>`;
    const escuro = tom(p.cor, -.35);
    let det = "";
    switch (p.roupa) {
      case "jaleco":
        det = `<path d="M84 142 L100 172 L116 142Z" fill="${p.detalhe}"/><path d="M84 142 L100 172 L116 142" fill="none" stroke="${tom(p.detalhe, -.25)}" stroke-width="1.5"/>
          <path d="M84 142 L94 200 M116 142 L106 200" stroke="${tom(p.cor, -.18)}" stroke-width="3" fill="none"/>
          <rect x="122" y="168" width="18" height="4" rx="2" fill="${tom(p.cor, -.2)}"/>`; break;
      case "terno":
        det = `<path d="M86 142 L100 168 L114 142Z" fill="#f2f2f2"/>
          <path d="M97 148 L103 148 L105 178 L100 184 L95 178Z" fill="${p.detalhe}"/><path d="M98 150 L100 176" stroke="${tom(p.detalhe, .25)}" stroke-width="1.2"/>
          <path d="M86 142 L98 180 M114 142 L102 180" stroke="${tom(p.cor, -.45)}" stroke-width="3" fill="none"/>`; break;
      case "blazer":
        det = `<path d="M86 142 L100 166 L114 142Z" fill="${p.detalhe}"/>
          <path d="M86 142 L97 178 M114 142 L103 178" stroke="${tom(p.cor, .2)}" stroke-width="2.5" fill="none"/>`; break;
      case "polo":
        det = `<path d="M84 141 L100 156 L116 141 L112 137 L100 148 L88 137Z" fill="${escuro}"/>
          <circle cx="100" cy="162" r="2" fill="${escuro}"/><circle cx="100" cy="172" r="2" fill="${escuro}"/>`; break;
      case "xadrez":
        return `<defs><pattern id="${u}-xadrez" width="16" height="16" patternUnits="userSpaceOnUse">
            <rect width="16" height="16" fill="${p.cor}"/><path d="M0 4h16M4 0v16" stroke="rgba(0,0,0,.3)" stroke-width="3"/>
            <path d="M0 12h16M12 0v16" stroke="rgba(255,255,255,.15)" stroke-width="2"/></pattern></defs>
          <path d="${CORPO}" fill="url(#${u}-xadrez)"/><path d="${CORPO}" fill="url(#${u}-dobra)"/>
          <path d="M86 140 L100 154 L114 140" stroke="rgba(0,0,0,.4)" stroke-width="4" fill="none"/>`;
      case "esportivo":
        det = `<path d="M84 141 Q100 158 116 141" stroke="${escuro}" stroke-width="4" fill="none"/>
          <path d="M40 182 L160 182" stroke="rgba(255,255,255,.4)" stroke-width="4"/>`; break;
      case "cardigan":
        det = `<path d="M88 141 L100 162 L112 141Z" fill="${p.detalhe}"/>
          <circle cx="104" cy="176" r="2.5" fill="${escuro}"/><circle cx="104" cy="190" r="2.5" fill="${escuro}"/>`; break;
      default:
        det = `<path d="M86 141 Q100 152 114 141" stroke="${tom(p.cor, .25)}" stroke-width="4" fill="none"/>`;
    }
    return base + `<path d="${CORPO}" fill="url(#${u}-dobra)"/>` + det;
  }

  function olhos(p) {
    const iris = p.olhos || "#4a2f1d", palpebra = tom(p.pele, -.45);
    return [86, 114].map((x) => `
      <ellipse cx="${x}" cy="90" rx="6.2" ry="4.6" fill="#fbf7f2"/>
      <g class="p-pupila"><circle cx="${x}" cy="90.4" r="3.4" fill="${iris}"/><circle cx="${x}" cy="90.4" r="1.7" fill="#120c08"/>
        <circle cx="${x + 1.3}" cy="89.1" r="1.1" fill="#fff"/><circle cx="${x - 1.2}" cy="91.6" r=".5" fill="#fff" opacity=".7"/></g>
      <path d="M${x - 6.6} 89.4 Q${x} 84.2 ${x + 6.6} 89.4" stroke="${palpebra}" stroke-width="1.8" fill="none" stroke-linecap="round"/>`).join("");
  }

  function barba(p, u) {
    if (p.barba === "cheia")
      return `<path d="M64 96 C66 124 82 136 100 136 C118 136 134 124 136 96 C132 112 120 120 110 118 C104 114 96 114 90 118 C80 120 68 112 64 96Z" fill="url(#${u}-cabelo)"/>
        <path d="M72 112 Q86 128 100 130" stroke="${tom(p.cabelo, .3)}" stroke-width="1.2" fill="none" opacity=".5"/>`;
    if (p.barba === "bigode")
      return `<path d="M86 111 C92 105 108 105 114 111 C108 115 92 115 86 111Z" fill="url(#${u}-cabelo)"/>`;
    return "";
  }

  window.desenharPersonagem = function (p) {
    const u = `p${++contador}`, atraso = -((contador * 1.7) % 5).toFixed(2);
    const cab = `url(#${u}-cabelo)`;
    const atras = cabeloAtras[p.estilo] ? `<path d="${cabeloAtras[p.estilo]}" fill="${cab}"/>` : "";
    const cachosAtras = p.estilo === "cacheado" ? cachos.atras.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="15" fill="${cab}"/>`).join("") : "";
    const coque = p.estilo === "coque" ? `<circle cx="100" cy="32" r="15" fill="${cab}"/><path d="M92 25 Q100 20 108 25" stroke="${tom(p.cabelo, .45)}" stroke-width="2" fill="none" opacity=".6"/>` : "";
    const sombraFrente = cabeloFrente[p.estilo] && p.estilo !== "calvo" ? `<path d="${cabeloFrente[p.estilo]}" transform="translate(0 3.5)" fill="rgba(0,0,0,.2)"/>` : "";
    const frente = cabeloFrente[p.estilo] ? `<path d="${cabeloFrente[p.estilo]}" fill="${cab}"/>` : "";
    const brilho = brilhoCabelo[p.estilo] ? `<path d="${brilhoCabelo[p.estilo]}" stroke="${tom(p.cabelo, .5)}" stroke-width="2.5" fill="none" stroke-linecap="round" opacity=".45"/>` : "";
    const cachosFrente = p.estilo === "cacheado"
      ? cachos.frente.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="12" fill="${cab}"/><circle cx="${x - 3}" cy="${y - 4}" r="3" fill="${tom(p.cabelo, .4)}" opacity=".5"/>`).join("") : "";
    const careca = p.estilo === "calvo" ? `<ellipse cx="92" cy="52" rx="12" ry="6" fill="#fff" opacity=".12"/>` : "";
    const oculos = p.oculos
      ? `<g fill="rgba(200,230,255,.08)" stroke="#262626" stroke-width="2.4"><rect x="74" y="82" width="22" height="16" rx="5"/><rect x="104" y="82" width="22" height="16" rx="5"/></g>
         <path d="M96 89 L104 89 M74 88 L64 86 M126 88 L136 86" stroke="#262626" stroke-width="2.4" fill="none"/>
         <path d="M78 86 L84 84 M108 86 L114 84" stroke="#fff" stroke-width="1.5" opacity=".5" stroke-linecap="round"/>`
      : "";

    return `<svg class="personagem" viewBox="0 0 200 200" role="img" aria-label="${p.nome}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="${u}-fundo" cx="50%" cy="38%" r="75%"><stop offset="0" stop-color="${tom(p.fundo, .22)}"/><stop offset="1" stop-color="${tom(p.fundo, -.45)}"/></radialGradient>
        <radialGradient id="${u}-pele" cx="42%" cy="36%" r="68%"><stop offset="0" stop-color="${tom(p.pele, .2)}"/><stop offset=".55" stop-color="${p.pele}"/><stop offset="1" stop-color="${tom(p.pele, -.25)}"/></radialGradient>
        <linearGradient id="${u}-pescoco" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${tom(p.pele, -.38)}"/><stop offset=".6" stop-color="${tom(p.pele, -.12)}"/></linearGradient>
        <radialGradient id="${u}-roupa" cx="50%" cy="0%" r="110%"><stop offset="0" stop-color="${tom(p.cor, .22)}"/><stop offset=".45" stop-color="${p.cor}"/><stop offset="1" stop-color="${tom(p.cor, -.35)}"/></radialGradient>
        <radialGradient id="${u}-dobra" cx="50%" cy="10%" r="90%"><stop offset=".45" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".35"/></radialGradient>
        <linearGradient id="${u}-cabelo" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${tom(p.cabelo, .28)}"/><stop offset=".5" stop-color="${p.cabelo}"/><stop offset="1" stop-color="${tom(p.cabelo, -.35)}"/></linearGradient>
        <radialGradient id="${u}-rubor"><stop offset="0" stop-color="#e8605f" stop-opacity=".35"/><stop offset="1" stop-color="#e8605f" stop-opacity="0"/></radialGradient>
      </defs>
      <g class="p-camada" style="--d:1"><rect x="-20" y="-20" width="240" height="240" fill="url(#${u}-fundo)"/>
        <ellipse cx="100" cy="206" rx="84" ry="20" fill="#000" opacity=".35"/></g>
      <g class="p-camada" style="--d:3"><g class="p-cabeca">${atras}${cachosAtras}${coque}</g></g>
      <g class="p-camada" style="--d:2"><g class="p-respira">
        ${roupa(p, u)}
        <path d="M144 143 C160 151 169 168 171 196" stroke="rgba(31,213,122,.4)" stroke-width="2" fill="none" stroke-linecap="round"/>
        <rect x="88" y="108" width="24" height="36" rx="9" fill="url(#${u}-pescoco)"/>
      </g></g>
      <g class="p-camada" style="--d:4"><g class="p-cabeca">
        <ellipse cx="63" cy="92" rx="7" ry="10" fill="${tom(p.pele, -.12)}"/><ellipse cx="64" cy="93" rx="3.5" ry="5.5" fill="${tom(p.pele, -.32)}"/>
        <ellipse cx="137" cy="92" rx="7" ry="10" fill="${tom(p.pele, -.12)}"/><ellipse cx="136" cy="93" rx="3.5" ry="5.5" fill="${tom(p.pele, -.32)}"/>
        <ellipse cx="100" cy="86" rx="37" ry="44" fill="url(#${u}-pele)"/>
        <path d="M123.8 52.3 A37 44 0 0 1 132 108" stroke="rgba(31,213,122,.45)" stroke-width="2" fill="none" stroke-linecap="round"/>
        ${careca}
        <ellipse cx="100" cy="127" rx="20" ry="4" fill="${tom(p.pele, -.4)}" opacity=".35"/>
        ${barba(p, u)}
        <circle cx="77" cy="105" r="9" fill="url(#${u}-rubor)"/><circle cx="123" cy="105" r="9" fill="url(#${u}-rubor)"/>
        <g class="p-olhos" style="animation-delay:${atraso}s">${olhos(p)}</g>
        <g class="p-sobrancelhas"><path d="M78 80 Q86 75.5 94 79.5 M106 79.5 Q114 75.5 122 80" stroke="${tom(p.cabelo, -.15)}" stroke-width="3.4" fill="none" stroke-linecap="round"/></g>
        <path d="M99 93 Q95.5 103.5 99 107 Q102 108.5 106 106.5" stroke="${tom(p.pele, -.32)}" stroke-width="2" fill="none" stroke-linecap="round"/>
        <ellipse cx="101.5" cy="99" rx="1.6" ry="4.2" fill="#fff" opacity=".18"/>
        <g class="boca-fechada"><path d="M90 116.5 Q100 123 110 116.5" stroke="${tom(p.pele, -.55)}" stroke-width="2.6" fill="none" stroke-linecap="round"/>
          <path d="M95 121 Q100 123 105 121" stroke="${tom(p.pele, .2)}" stroke-width="1.4" fill="none" stroke-linecap="round" opacity=".6"/></g>
        <g class="boca-aberta"><ellipse cx="100" cy="118.5" rx="7.5" ry="5.5" fill="#3b1410"/>
          <path d="M93.5 115.6 Q100 113.6 106.5 115.6 L106 117.4 Q100 116.2 94 117.4Z" fill="#f4efe8"/>
          <ellipse cx="100" cy="122.2" rx="4.2" ry="2" fill="#c45a58"/></g>
        ${sombraFrente}${frente}${brilho}${cachosFrente}${oculos}
      </g></g>
    </svg>`;
  };
})();

// Retrato do personagem: a foto gerada no estilo de animação, ou o desenho 2D se não houver foto.
window.retratoPersonagem = function (p) {
  return p.foto ? `<img class="retrato" src="${p.foto}" alt="${p.nome}" loading="lazy">` : window.desenharPersonagem(p);
};
