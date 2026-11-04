// Conversa de verdade na sala: você fala no microfone, o Gemini responde como o cliente
// e o retrato fala a resposta. O placar ao vivo usa regras simples (sem custo).
(function () {
  const $ = (id) => document.getElementById(id);
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  const sorteia = (lista) => lista[Math.floor(Math.random() * lista.length)];

  // Estado oculto: o que o cliente só revela se você perguntar bem.
  const OCULTO = {
    dor: ["não sabe quanto custa cada cliente novo", "a agenda fica vazia nos meses fracos", "depende só de indicação e ela caiu",
      "os contatos chegam, mas ninguém responde rápido no WhatsApp", "um concorrente novo está tirando clientes"],
    orcamento: ["até R$ 1.500 por mês", "de R$ 2.000 a R$ 3.000 por mês", "R$ 5.000 por mês se enxergar resultado"],
    decisor: ["decide sozinho", "precisa falar com o sócio antes", "o cônjuge cuida das finanças e opina"],
    objecao: ["medo de repetir a experiência ruim com agência", "acha caro sem garantia de resultado",
      "não tem tempo para acompanhar", "acha que o público dele não está no Instagram"],
  };
  const VICIOS = /\b(né|tipo|então|assim|éé+|ãã+|ahn|hum)\b/gi;
  const INSEGURANCA = /\b(acho|talvez|meio que|mais ou menos|vou tentar)\b/gi;
  const PERGUNTA_ABERTA = /^(o que|como|qual|quais|quanto|quantos|quantas|por que|porque|quando|onde|quem|me conta|me fala|conta pra mim)\b/i;

  const HUMORES = ["apressado, com outra reunião logo depois", "de bom humor e falante", "desconfiado de agências",
    "curioso, mas cauteloso com dinheiro", "cansado depois de um dia cheio", "direto ao ponto, sem paciência para enrolação",
    "animado com uma ideia nova para o negócio", "preocupado porque o mês está fraco"];
  let iniciada = false, contagemTimer = null;
  let historico = [], estado = null, ouvindo = false, ocupado = false, rec = null, buffer = "", inicioFala = 0, espera = null;
  let palavrasVendedor = 0, palavrasCliente = 0, segundosVendedor = 0, vicios = 0, inseguranca = 0, alertasDados = {};

  function reiniciar() {
    pararDeOuvir();
    iniciada = false; clearInterval(contagemTimer); $("contagem")?.classList.remove("on");
    historico = []; estado = {
      humor: sorteia(HUMORES),
      dor: sorteia(OCULTO.dor), orcamento: sorteia(OCULTO.orcamento), decisor: sorteia(OCULTO.decisor), objecao: sorteia(OCULTO.objecao),
    };
    palavrasVendedor = palavrasCliente = segundosVendedor = vicios = inseguranca = 0; alertasDados = {};
    atualizarMetricas();
  }
  window.reiniciarConversa = reiniciar;

  function alertaUmaVez(chave, texto, bom) { if (alertasDados[chave]) return; alertasDados[chave] = true; alerta(texto, bom); }
  function mudarNota(d) { nota = Math.max(0, Math.min(100, nota + d)); atualizarPlacar(d); }
  function contar(texto) { return texto.split(/\s+/).filter(Boolean).length; }

  function atualizarMetricas() {
    const ppm = segundosVendedor > 3 ? Math.round((palavrasVendedor / segundosVendedor) * 60) : 0;
    $("ppm").textContent = ppm || "–";
    $("vicios").textContent = vicios;
    $("inseguranca").textContent = inseguranca;
    const total = palavrasVendedor + palavrasCliente;
    $("fala").textContent = total ? Math.round((palavrasVendedor / total) * 100) + "%" : "–";
  }

  // Regras do placar ao vivo para cada fala do vendedor.
  function avaliar(texto, segundos) {
    const palavras = contar(texto);
    palavrasVendedor += palavras; segundosVendedor += segundos;
    const v = (texto.match(VICIOS) || []).length, ins = (texto.match(INSEGURANCA) || []).length;
    vicios += v; inseguranca += ins;
    let delta = 0;
    if (etapa === 0) etapa = 1;
    const frases = texto.split(/(?<=[.!?])\s+/);
    const abertas = frases.filter((f) => PERGUNTA_ABERTA.test(f.trim())).length;
    if (abertas) { perguntas += abertas; delta += 4 * abertas; temperatura = Math.min(92, temperatura + 6 * abertas); etapa = Math.max(etapa, 2); alertaUmaVez("pergunta" + Math.min(perguntas, 3), "Boa pergunta aberta: faz o cliente contar mais.", true); }
    if (/\b(preço|valor|custa|investimento|reais|r\$|mensalidade)\b/i.test(texto) && perguntas < 2) { delta -= 6; alertaUmaVez("preco", "Falou de preço antes de entender a dor do cliente."); }
    if (/\b(desconto|abaixo|faço por|consigo fazer por)\b/i.test(texto) && !/\bse (você|vc)\b/i.test(texto)) { delta -= 6; alertaUmaVez("desconto", "Desconto sem contrapartida. Use: \"Se eu fizer X, você fecha Y?\""); }
    if (/\b(proposta|plano|campanha|anúncio|anuncio|estratégia|estrategia|funciona assim)\b/i.test(texto)) etapa = Math.max(etapa, 3);
    if (/\b(garanto|garantido|garantia de)\b/i.test(texto)) { delta -= 5; alertaUmaVez("garantia", "Evite prometer resultado garantido."); }
    if (palavras > 70) { delta -= 3; alertaUmaVez("longa" + Math.floor(palavrasVendedor / 300), "Fala longa: pare e faça uma pergunta."); }
    if (ins) { delta -= 2 * ins; alertaUmaVez("inseguranca", "\"Acho\" e \"talvez\" passam insegurança. Afirme com número e prazo."); }
    if (v >= 3) alertaUmaVez("vicios", "Muitos vícios de linguagem: troque o \"né\" por uma pausa.");
    if (/\b(quando|que dia|segunda|terça|quarta|quinta|sexta|amanhã|semana que vem)\b/i.test(texto) && etapa >= 3) delta += 3;
    if (!delta && palavras > 4) delta = 1;
    mudarNota(delta);
    atualizarMetricas();
  }

  async function perguntarAoGemini() {
    const p = atual;
    const resp = await fetch("/api/cliente", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ personagem: { nome: p.nome, idade: p.idade, nicho: p.nicho, perfil: p.perfil, fala: p.fala }, modo, dificuldade, estado, historico }),
    });
    const dados = await resp.json().catch(() => ({}));
    if (!resp.ok) throw new Error(dados.erro || `erro ${resp.status}`);
    return dados.texto || "";
  }

  async function clienteResponde(primeira, textoPronto) {
    ocupado = true; pausarReconhecimento();
    $("mic").classList.add("pensando");
    let texto = "";
    try { texto = textoPronto ? await textoPronto : await perguntarAoGemini(); }
    catch (e) {
      $("mic").classList.remove("pensando");
      ocupado = false;
      const msg = /GEMINI_API_KEY/.test(e.message) ? "Falta a chave grátis do Gemini no arquivo .env." : "O Gemini não respondeu: " + e.message.slice(0, 120);
      alerta(msg); retomarReconhecimento(); return;
    }
    $("mic").classList.remove("pensando");
    const marca = (texto.match(/\[(FECHOU|MARCOU|ENCERROU)\]/) || [])[1];
    texto = texto.replace(/\[(FECHOU|MARCOU|ENCERROU)\]/g, "").trim();
    historico.push({ quem: "cliente", texto });
    palavrasCliente += contar(texto);
    if (!primeira && etapa >= 3) etapa = Math.max(etapa, 4);
    atualizarPlacar(0); atualizarMetricas();
    await clienteFala(texto);
    if (marca === "FECHOU") fecharContrato();
    else if (marca === "MARCOU") { etapa = 5; temperatura = Math.max(temperatura, 85); mudarNota(8); alerta("Próximo passo marcado com o cliente!", true); }
    else if (marca === "ENCERROU") { temperatura = Math.min(temperatura, 15); alerta("O cliente encerrou a conversa sem acordo."); }
    ocupado = false;
    if (marca === "ENCERROU" || marca === "FECHOU") { pararDeOuvir(); return; }
    retomarReconhecimento();
  }

  function enviarFalaDoVendedor() {
    const texto = buffer.trim(); buffer = "";
    if (!texto) return;
    const segundos = Math.max(1, (performance.now() - inicioFala) / 1000);
    inicioFala = 0;
    historico.push({ quem: "vendedor", texto });
    transcrever("Você", texto);
    $("legenda").classList.remove("on");
    avaliar(texto, segundos);
    clienteResponde(false);
  }

  function criarReconhecimento() {
    const r = new SR();
    r.lang = "pt-BR"; r.continuous = true; r.interimResults = true;
    r.onresult = (ev) => {
      if (ocupado) return;
      let interino = "";
      for (let i = ev.resultIndex; i < ev.results.length; i++) {
        if (!inicioFala) inicioFala = performance.now();
        if (ev.results[i].isFinal) buffer += " " + ev.results[i][0].transcript;
        else interino += ev.results[i][0].transcript;
      }
      $("legenda").textContent = "Você: " + (buffer + " " + interino).trim();
      $("legenda").classList.add("on");
      clearTimeout(espera);
      // Espera um silêncio curto para saber que você terminou de falar.
      espera = setTimeout(enviarFalaDoVendedor, interino ? 1500 : 800);
    };
    r.onend = () => { if (ouvindo && !ocupado) try { r.start(); } catch {} };
    r.onerror = (e) => { if (e.error === "not-allowed") { alerta("Libere o microfone no navegador para conversar."); pararDeOuvir(); } };
    return r;
  }
  function pausarReconhecimento() { clearTimeout(espera); try { rec?.stop(); } catch {} }
  function retomarReconhecimento() { if (ouvindo) try { rec.start(); } catch {} }

  function comecarAOuvir() {
    if (!SR) { alerta("Este navegador não reconhece fala. Use o Chrome ou o Edge."); return; }
    rec = rec || criarReconhecimento();
    ouvindo = true;
    $("mic").classList.remove("off"); $("mic").classList.add("escutando"); $("mic").title = "Microfone ligado: pode falar";
    if (!iniciada) iniciarReuniao();
    else if (!ocupado) retomarReconhecimento();
  }
  // Contagem de 5 segundos. Enquanto conta, o Gemini já cria a abertura do cliente
  // (diferente a cada reunião) e a voz dela, para ele falar assim que chegar a zero.
  function iniciarReuniao() {
    iniciada = true; ocupado = true;
    const pessoa = atual;
    const abertura = perguntarAoGemini();
    abertura.then((t) => { if (atual === pessoa) window.retratoVivoAtual?.()?.preparar?.(t.replace(/\[(FECHOU|MARCOU|ENCERROU)\]/g, "").trim()); }).catch(() => {});
    const caixa = $("contagem"), numero = caixa.querySelector("b");
    let n = 5;
    numero.textContent = n; caixa.classList.add("on");
    contagemTimer = setInterval(() => {
      n -= 1;
      if (atual !== pessoa) { clearInterval(contagemTimer); return; }
      if (n > 0) { numero.textContent = n; numero.style.animation = "none"; void numero.offsetWidth; numero.style.animation = ""; return; }
      clearInterval(contagemTimer); caixa.classList.remove("on");
      clienteResponde(true, abertura);
    }, 1000);
  }

  function pararDeOuvir() {
    ouvindo = false; pausarReconhecimento();
    if ($("mic")) { $("mic").classList.remove("escutando"); $("mic").classList.add("off"); $("mic").title = "Ligar o microfone e conversar"; }
  }

  $("mic").onclick = () => (ouvindo ? pararDeOuvir() : comecarAOuvir());
  $("mic").title = "Ligar o microfone e conversar";
  $("mic").classList.add("off");
  reiniciar();
})();
