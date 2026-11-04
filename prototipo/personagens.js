// Personagens do simulador e o desenho de cada um (SVG gerado a partir dos traços).
window.PERSONAGENS = [
  { id: "ricardo", nome: "Dr. Ricardo", idade: 52, nicho: "Ortopedista", perfil: "Analítico", voz: "Paulo", genero: "M",
    pele: "#e8b896", cabelo: "#8d8d8d", estilo: "curto", roupa: "jaleco", cor: "#f4f5f7", detalhe: "#a9c6e8", oculos: true, fundo: "#2f4858",
    fala: "Boa tarde. Eu tenho uns 20 minutos. Antes de tudo: quanto custa e quanto eu vou ter de retorno?" },
  { id: "camila", nome: "Dra. Camila", idade: 38, nicho: "Dentista", perfil: "Comunicadora", voz: "Marcia", genero: "F",
    pele: "#d9a27e", cabelo: "#4a2c1d", estilo: "liso", roupa: "jaleco", cor: "#f4f5f7", detalhe: "#f3c6d3", fundo: "#5b3f63",
    fala: "Oi! Que bom falar com você. Olha, só aparece gente no meu Instagram querendo preço de limpeza…" },
  { id: "marcos", nome: "Marcos", idade: 45, nicho: "Energia solar", perfil: "Executor", voz: "Yuri", genero: "M",
    pele: "#a8714f", cabelo: "#1f1a17", estilo: "curto", barba: "cheia", roupa: "polo", cor: "#e07a1f", fundo: "#3d4f2f",
    fala: "Vou ser direto: já contratei agência e só veio gente pedindo orçamento e sumindo. O que você faz de diferente?" },
  { id: "fernanda", nome: "Fernanda", idade: 41, nicho: "Imobiliária", perfil: "Planejadora", voz: "Raquel", genero: "F",
    pele: "#f0c8a8", cabelo: "#a5672f", estilo: "coque", roupa: "blazer", cor: "#1f3a5f", detalhe: "#f1e6dc", fundo: "#4a5568",
    fala: "Hoje o portal já me traz lead. Eu queria entender com calma por que eu pagaria por mais um canal." },
  { id: "paulo", nome: "Dr. Paulo", idade: 60, nicho: "Advogado", perfil: "Analítico", voz: "Paulo", genero: "M",
    pele: "#e2b08f", cabelo: "#c4c4c4", estilo: "calvo", roupa: "terno", cor: "#2b2d42", detalhe: "#8b1e3f", oculos: true, fundo: "#3b3a4a",
    fala: "Pois não. Adianto que meu cliente vem de indicação, e a OAB tem regras bem claras sobre captação." },
  { id: "juliana", nome: "Juliana", idade: 33, nicho: "Academia", perfil: "Comunicadora", voz: "Marcia", genero: "F",
    pele: "#7a4a2e", cabelo: "#1b1210", estilo: "cacheado", roupa: "esportivo", cor: "#16a34a", fundo: "#1f4d4a",
    fala: "Gente, em janeiro enche sozinho! O problema é o resto do ano. Já tive uma agência e foi um desastre." },
  { id: "roberto", nome: "Roberto", idade: 50, nicho: "Materiais de construção", perfil: "Planejador", voz: "Yuri", genero: "M",
    pele: "#c68b63", cabelo: "#5b5048", estilo: "curto", barba: "bigode", roupa: "xadrez", cor: "#b23a3a", fundo: "#5a4632",
    fala: "Sinceramente, internet não funciona pro meu ramo. Meu cliente é pedreiro, ele não vê anúncio." },
  { id: "patricia", nome: "Patrícia", idade: 47, nicho: "Móveis planejados", perfil: "Analítica", voz: "Raquel", genero: "F",
    pele: "#d4a07a", cabelo: "#2e1f18", estilo: "ombro", roupa: "cardigan", cor: "#8a6d5b", detalhe: "#ffffff", fundo: "#4b3b47",
    fala: "O cliente pede três orçamentos e fecha com o mais barato. Como anúncio resolve isso?" },
  { id: "lucas", nome: "Lucas", idade: 29, nicho: "Loja de celulares", perfil: "Executor", voz: "Witalo", genero: "M",
    pele: "#e9bf9b", cabelo: "#3a2a1e", estilo: "jovem", roupa: "camiseta", cor: "#111827", fundo: "#27364a",
    fala: "Mano, eu vi um freelancer bem mais barato. Me convence rápido, que eu tenho loja pra abrir." },
];

(function () {
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
  const cachos = {
    atras: [[66, 70], [74, 52], [90, 42], [110, 42], [126, 52], [134, 70], [60, 92], [140, 92], [58, 114], [142, 114]],
    frente: [[78, 56], [94, 49], [110, 50], [124, 58]],
  };

  function roupa(p) {
    const base = `<path d="M28 200 C30 158 60 140 100 140 C140 140 170 158 172 200Z" fill="${p.cor}"/>`;
    switch (p.roupa) {
      case "jaleco":
        return base + `<path d="M84 142 L100 172 L116 142Z" fill="${p.detalhe}"/>
          <path d="M84 142 L94 200 M116 142 L106 200" stroke="#d5d8de" stroke-width="3" fill="none"/>
          <rect x="122" y="168" width="18" height="4" rx="2" fill="#d5d8de"/>`;
      case "terno":
        return base + `<path d="M86 142 L100 168 L114 142Z" fill="#f5f5f5"/>
          <path d="M97 148 L103 148 L105 178 L100 184 L95 178Z" fill="${p.detalhe}"/>
          <path d="M86 142 L98 180 M114 142 L102 180" stroke="rgba(0,0,0,.35)" stroke-width="3" fill="none"/>`;
      case "blazer":
        return base + `<path d="M86 142 L100 166 L114 142Z" fill="${p.detalhe}"/>
          <path d="M86 142 L97 178 M114 142 L103 178" stroke="rgba(255,255,255,.18)" stroke-width="3" fill="none"/>`;
      case "polo":
        return base + `<path d="M84 141 L100 156 L116 141 L112 137 L100 148 L88 137Z" fill="rgba(0,0,0,.22)"/>
          <circle cx="100" cy="162" r="2" fill="rgba(0,0,0,.3)"/><circle cx="100" cy="172" r="2" fill="rgba(0,0,0,.3)"/>`;
      case "xadrez":
        return `<defs><pattern id="xadrez-${p.id}" width="16" height="16" patternUnits="userSpaceOnUse">
            <rect width="16" height="16" fill="${p.cor}"/><path d="M0 4h16M4 0v16" stroke="rgba(0,0,0,.3)" stroke-width="3"/>
            <path d="M0 12h16M12 0v16" stroke="rgba(255,255,255,.15)" stroke-width="2"/></pattern></defs>
          <path d="M28 200 C30 158 60 140 100 140 C140 140 170 158 172 200Z" fill="url(#xadrez-${p.id})"/>
          <path d="M86 140 L100 154 L114 140" stroke="rgba(0,0,0,.35)" stroke-width="4" fill="none"/>`;
      case "esportivo":
        return base + `<path d="M84 141 Q100 158 116 141" stroke="rgba(0,0,0,.25)" stroke-width="4" fill="none"/>
          <path d="M40 182 L160 182" stroke="rgba(255,255,255,.35)" stroke-width="4"/>`;
      case "cardigan":
        return base + `<path d="M88 141 L100 162 L112 141Z" fill="${p.detalhe}"/>
          <circle cx="104" cy="176" r="2.5" fill="rgba(0,0,0,.3)"/><circle cx="104" cy="190" r="2.5" fill="rgba(0,0,0,.3)"/>`;
      default:
        return base + `<path d="M86 141 Q100 152 114 141" stroke="rgba(255,255,255,.2)" stroke-width="4" fill="none"/>`;
    }
  }

  function barba(p) {
    if (p.barba === "cheia")
      return `<path d="M64 96 C66 124 82 136 100 136 C118 136 134 124 136 96 C132 112 120 120 110 118 C104 114 96 114 90 118 C80 120 68 112 64 96Z" fill="${p.cabelo}"/>`;
    if (p.barba === "bigode")
      return `<path d="M86 111 C92 105 108 105 114 111 C108 115 92 115 86 111Z" fill="${p.cabelo}"/>`;
    return "";
  }

  window.desenharPersonagem = function (p) {
    const atras = cabeloAtras[p.estilo] ? `<path d="${cabeloAtras[p.estilo]}" fill="${p.cabelo}"/>` : "";
    const cachosAtras = p.estilo === "cacheado" ? cachos.atras.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="15" fill="${p.cabelo}"/>`).join("") : "";
    const cachosFrente = p.estilo === "cacheado" ? cachos.frente.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="12" fill="${p.cabelo}"/>`).join("") : "";
    const frente = cabeloFrente[p.estilo] ? `<path d="${cabeloFrente[p.estilo]}" fill="${p.cabelo}"/>` : "";
    const coque = p.estilo === "coque" ? `<circle cx="100" cy="32" r="15" fill="${p.cabelo}"/>` : "";
    const oculos = p.oculos
      ? `<g fill="none" stroke="#2a2a2a" stroke-width="2.5"><rect x="74" y="82" width="22" height="16" rx="5"/><rect x="104" y="82" width="22" height="16" rx="5"/><path d="M96 89 L104 89 M74 88 L64 86 M126 88 L136 86"/></g>`
      : "";
    return `<svg class="personagem" viewBox="0 0 200 200" role="img" aria-label="${p.nome}" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="200" fill="${p.fundo}"/>
      ${atras}${cachosAtras}${coque}
      ${roupa(p)}
      <rect x="88" y="110" width="24" height="34" rx="9" fill="${p.pele}"/>
      <ellipse cx="63" cy="92" rx="7" ry="10" fill="${p.pele}"/><ellipse cx="137" cy="92" rx="7" ry="10" fill="${p.pele}"/>
      <ellipse cx="100" cy="86" rx="37" ry="44" fill="${p.pele}"/>
      ${barba(p)}
      <circle cx="78" cy="104" r="6" fill="#e06666" opacity=".15"/><circle cx="122" cy="104" r="6" fill="#e06666" opacity=".15"/>
      <ellipse class="olho" cx="86" cy="90" rx="3.5" ry="4.5" fill="#2b2118"/><ellipse class="olho" cx="114" cy="90" rx="3.5" ry="4.5" fill="#2b2118"/>
      <path d="M79 80 Q86 76 93 80 M107 80 Q114 76 121 80" stroke="${p.cabelo}" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M100 93 Q97 104 102 106" stroke="rgba(0,0,0,.22)" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path class="boca-fechada" d="M91 117 Q100 124 109 117" stroke="#7a3b2e" stroke-width="3" fill="none" stroke-linecap="round"/>
      <ellipse class="boca-aberta" cx="100" cy="119" rx="7" ry="5" fill="#5a2a22"/>
      ${frente}${cachosFrente}${oculos}
    </svg>`;
  };
})();
