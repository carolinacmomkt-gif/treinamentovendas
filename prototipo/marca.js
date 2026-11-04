// Marca Closing e perfil de quem está treinando.
(function () {
  const CHAVE_PERFIL = "closing:perfil";

  window.PERFIL = (function () {
    let p = { nome: "Gustavo" };
    try { Object.assign(p, JSON.parse(localStorage.getItem(CHAVE_PERFIL)) || {}); } catch {}
    p.inicial = p.nome.trim().charAt(0).toUpperCase();
    return p;
  })();

  window.logoClosing = function (tamanho = 34) {
    return `<svg width="${tamanho}" height="${tamanho}" viewBox="0 0 64 64" aria-hidden="true">
      <defs><linearGradient id="closing-c" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1fd57a"/><stop offset="1" stop-color="#0b6b35"/></linearGradient></defs>
      <path d="M54 7 H31 A25 25 0 0 0 31 57 H55 L49 49 H31 A17 17 0 0 1 31 15 H48 Z" fill="url(#closing-c)"/>
      <path d="M14 49 L38 25" stroke="#22e07f" stroke-width="9"/>
      <path d="M29 15 H53 V39 Z" fill="#22e07f"/>
    </svg>`;
  };

  // Preenche qualquer elemento com data-marca="logo" (símbolo + nome).
  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll('[data-marca="logo"]').forEach((el) => {
      el.innerHTML = `${logoClosing(Number(el.dataset.tamanho) || 34)}<span class="wordmark">CLOSING</span>`;
    });
  });
})();
