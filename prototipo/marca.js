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
      <defs>
        <linearGradient id="closing-c" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0d6b38"/><stop offset=".28" stop-color="#2be38a"/><stop offset=".45" stop-color="#d6ffe9"/><stop offset=".6" stop-color="#25c975"/><stop offset="1" stop-color="#073d20"/></linearGradient>
        <linearGradient id="closing-s" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#139c55"/><stop offset=".55" stop-color="#e6fff2"/><stop offset=".7" stop-color="#3ff09a"/><stop offset="1" stop-color="#18b463"/></linearGradient>
      </defs>
      <path d="M54 7 H31 A25 25 0 0 0 31 57 H55 L49 49 H31 A17 17 0 0 1 31 15 H48 Z" fill="url(#closing-c)"/>
      <path d="M19 45 L36 28" stroke="url(#closing-s)" stroke-width="7"/>
      <path d="M31 20 H45 V34 Z" fill="url(#closing-s)"/>
    </svg>`;
  };

  // Preenche qualquer elemento com data-marca="logo" (símbolo + nome).
  document.addEventListener("DOMContentLoaded", () => {
    document.body.insertAdjacentHTML("afterbegin",
      '<div class="fundo-animado" aria-hidden="true"><i></i><i></i><i></i><b></b></div>');
    document.querySelectorAll('[data-marca="logo"]').forEach((el) => {
      el.innerHTML = `${logoClosing(Number(el.dataset.tamanho) || 34)}<span class="wordmark">CLOSING</span>`;
    });
  });
})();
