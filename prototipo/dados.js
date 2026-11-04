// Histórico de reuniões, níveis, XP e conquistas. No protótipo fica no navegador (localStorage);
// na v1 isso vem do banco de dados.
(function () {
  const CHAVE = "treino-vendas:historico";

  const NIVEIS = [
    { nome: "Estagiário", xp: 0 }, { nome: "SDR", xp: 500 }, { nome: "Vendedor", xp: 1500 },
    { nome: "Closer", xp: 3000 }, { nome: "Closer Sênior", xp: 5000 }, { nome: "Head de Vendas", xp: 8000 },
    { nome: "Lenda", xp: 12000 },
  ];

  const MODOS = { prospeccao: "Prospecção", diagnostico: "Diagnóstico", fechamento: "Apresentação e fechamento" };
  const RESULTADOS = {
    fechou: { rotulo: "Fechou", icone: "✓" },
    proximo: { rotulo: "Próximo passo", icone: "→" },
    perdeu: { rotulo: "Perdeu", icone: "✕" },
  };

  function xpDaReuniao(r) {
    const bonus = { fechou: 250, proximo: 100, perdeu: 0 }[r.resultado];
    const dificuldade = { facil: 0, medio: 50, dificil: 120 }[r.dificuldade] || 0;
    return r.nota * 2 + bonus + (r.resultado === "perdeu" ? 0 : dificuldade);
  }

  // Dados de exemplo para o protótipo não abrir vazio.
  function exemplo() {
    const plano = [
      [20, "roberto", "diagnostico", "medio", 46, 52, "perdeu"],
      [19, "camila", "diagnostico", "facil", 52, 55, "proximo"],
      [17, "marcos", "prospeccao", "medio", 50, 58, "perdeu"],
      [16, "fernanda", "fechamento", "medio", 58, 60, "fechou"],
      [14, "lucas", "prospeccao", "facil", 55, 57, "proximo"],
      [13, "paulo", "diagnostico", "dificil", 61, 63, "perdeu"],
      [11, "juliana", "fechamento", "facil", 63, 66, "fechou"],
      [9, "patricia", "diagnostico", "medio", 60, 64, "proximo"],
      [8, "ricardo", "fechamento", "medio", 68, 67, "fechou"],
      [6, "marcos", "fechamento", "dificil", 66, 70, "perdeu"],
      [4, "roberto", "prospeccao", "medio", 72, 71, "fechou"],
      [3, "camila", "fechamento", "medio", 70, 74, "fechou"],
      [1, "lucas", "fechamento", "dificil", 75, 73, "proximo"],
      [0, "fernanda", "fechamento", "medio", 78, 77, "fechou"],
    ];
    return plano.map(([dias, personagem, modo, dificuldade, nota, comunicacao, resultado], i) => {
      const data = new Date();
      data.setDate(data.getDate() - dias);
      data.setHours(10 + (i % 7), 15, 0, 0);
      const r = {
        id: `ex-${i}`, data: data.toISOString(), personagem, modo, dificuldade, nota, comunicacao, resultado,
        duracao: 12 + (i * 7) % 15, perguntas: 4 + (i % 6), vicios: Math.max(0, 9 - i), inseguranca: Math.max(0, 6 - Math.floor(i / 2)),
        descobriu: Math.min(4, 1 + Math.floor(i / 4)), cedeuDesconto: i < 5 && resultado === "fechou",
      };
      r.xp = xpDaReuniao(r);
      return r;
    });
  }

  function carregar() {
    try {
      const salvo = JSON.parse(localStorage.getItem(CHAVE));
      if (Array.isArray(salvo) && salvo.length) return salvo;
    } catch {}
    return exemplo();
  }

  function salvar(lista) {
    try { localStorage.setItem(CHAVE, JSON.stringify(lista)); } catch {}
  }

  function registrar(reuniao) {
    const lista = carregar();
    reuniao.id = "r-" + Date.now();
    reuniao.data = new Date().toISOString();
    reuniao.xp = xpDaReuniao(reuniao);
    lista.push(reuniao);
    salvar(lista);
    return reuniao;
  }

  function nivel(xp) {
    let i = NIVEIS.length - 1;
    while (i > 0 && xp < NIVEIS[i].xp) i--;
    const proximo = NIVEIS[i + 1];
    return {
      indice: i, nome: NIVEIS[i].nome, proximo: proximo ? proximo.nome : null,
      progresso: proximo ? (xp - NIVEIS[i].xp) / (proximo.xp - NIVEIS[i].xp) : 1,
      faltam: proximo ? proximo.xp - xp : 0,
    };
  }

  function diaDe(iso) { const d = new Date(iso); d.setHours(0, 0, 0, 0); return d.getTime(); }

  function sequencia(lista) {
    const dias = new Set(lista.map((r) => diaDe(r.data)));
    const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
    let n = 0;
    for (let d = hoje.getTime(); dias.has(d); d -= 86400000) n++;
    return n;
  }

  function resumo(lista, inicio, fim) {
    const sel = lista.filter((r) => { const t = new Date(r.data).getTime(); return t >= inicio && t < fim; });
    const fechou = sel.filter((r) => r.resultado === "fechou").length;
    return {
      reunioes: sel.length,
      taxa: sel.length ? fechou / sel.length : 0,
      nota: sel.length ? sel.reduce((s, r) => s + r.nota, 0) / sel.length : 0,
      xp: sel.reduce((s, r) => s + r.xp, 0),
    };
  }

  function estatisticas(lista) {
    const agora = Date.now(), semana = 7 * 86400000;
    const total = resumo(lista, 0, Infinity);
    return {
      ...total,
      fechamentos: lista.filter((r) => r.resultado === "fechou").length,
      estaSemana: resumo(lista, agora - semana, Infinity),
      semanaPassada: resumo(lista, agora - 2 * semana, agora - semana),
      sequencia: sequencia(lista),
      nivel: nivel(total.xp),
    };
  }

  function conquistas(lista) {
    const fechadas = lista.filter((r) => r.resultado === "fechou");
    const pessoa = (id) => window.PERSONAGENS.find((p) => p.id === id) || {};
    const distintos = (arr, f) => new Set(arr.map(f)).size;
    const maximo = (f) => lista.reduce((m, r) => Math.max(m, f(r)), 0);
    return [
      { id: "primeira", nome: "Primeira venda", desc: "Feche o primeiro contrato", atual: fechadas.length, meta: 1, icone: "💰" },
      { id: "closer", nome: "Máquina de fechar", desc: "Feche 10 contratos", atual: fechadas.length, meta: 10, icone: "🏆" },
      { id: "perguntador", nome: "Perguntador profissional", desc: "8 perguntas abertas numa reunião", atual: maximo((r) => r.perguntas), meta: 8, icone: "❓" },
      { id: "detetive", nome: "Detetive", desc: "Descubra tudo que o cliente escondia", atual: maximo((r) => r.descobriu), meta: 4, icone: "🔎" },
      { id: "voz-firme", nome: "Voz firme", desc: "Uma reunião sem \"acho\" nem \"talvez\"", atual: lista.some((r) => r.inseguranca === 0) ? 1 : 0, meta: 1, icone: "🎙️" },
      { id: "sem-vicios", nome: "Sem vícios", desc: "Menos de 3 vícios de linguagem", atual: lista.some((r) => r.vicios < 3) ? 1 : 0, meta: 1, icone: "✨" },
      { id: "sem-desconto", nome: "Nada de desconto", desc: "Feche 3 vezes sem ceder no preço", atual: fechadas.filter((r) => !r.cedeuDesconto).length, meta: 3, icone: "🛡️" },
      { id: "sequencia", nome: "Constância", desc: "Treine 7 dias seguidos", atual: sequencia(lista), meta: 7, icone: "🔥" },
      { id: "rodado", nome: "Rodado", desc: "Feche em 9 nichos diferentes", atual: distintos(fechadas, (r) => pessoa(r.personagem).nicho), meta: 9, icone: "🗺️" },
      { id: "leitor", nome: "Leitor de gente", desc: "Feche com os 4 perfis de cliente", atual: distintos(fechadas, (r) => pessoa(r.personagem).perfil), meta: 4, icone: "🧠" },
      { id: "elenco", nome: "Todas as vozes", desc: "Treine com os 9 personagens", atual: distintos(lista, (r) => r.personagem), meta: 9, icone: "🎭" },
      { id: "dificil", nome: "Domador de céticos", desc: "Feche um cliente difícil", atual: fechadas.filter((r) => r.dificuldade === "dificil").length, meta: 1, icone: "🦁" },
    ].map((c) => ({ ...c, atual: Math.min(c.atual, c.meta), feita: c.atual >= c.meta }));
  }

  window.DADOS = { carregar, registrar, estatisticas, conquistas, nivel, xpDaReuniao, NIVEIS, MODOS, RESULTADOS };
})();
