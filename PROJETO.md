# Projeto: Simulador de Reunião de Vendas (tráfego pago e agência)

Versão do documento: 04/11/2026

## 1. O que é

Um simulador onde você conversa **por voz** com uma IA que faz o papel de um cliente real (dono de clínica, advogado, imobiliária etc.). Enquanto você conduz a reunião, uma segunda IA avalia cada fala sua e mostra um placar ao vivo. No final, sai um relatório com o que melhorar, por que e como, com base no **VENDE-C**.

Primeiro uso: você. Depois: vender como assinatura para outros gestores de tráfego e donos de agência.

## 2. Modos de treino

| Modo | Situação simulada | Objetivo da rodada |
|---|---|---|
| **Prospecção** | Ligação fria ou retorno de DM/WhatsApp, cliente ocupado e desconfiado | Marcar a reunião (exposição) |
| **Reunião de diagnóstico** | Primeira reunião, cliente não conhece você | Qualificar, achar a dor real, marcar a apresentação ou fechar |
| **Apresentação e fechamento** | Cliente já qualificado, você apresenta a proposta | Fechar ou agendar uma data concreta |
| **Negociação** | Cliente quer desconto, compara com outra agência | Fechar sem ceder sem contrapartida |
| **Renovação / cliente insatisfeito** | Cliente com resultado abaixo do esperado ameaça sair | Reter e reposicionar a expectativa |

## 3. Nichos (v1)

Baseados na sua lista de prospecção de 30/10/2026 e na Essence. Beleza e estética ficam de fora.

1. Profissional da saúde / clínica médica
2. Odontologia
3. Advocacia
4. Imobiliária / corretor
5. Energia solar
6. Móveis planejados / marcenaria
7. Academia / centro de treinamento
8. Materiais de construção
9. Restaurante / alimentação
10. Automotivo (loja de veículos, oficina)
11. Varejo / e-commerce local
12. Infoprodutor

Cada nicho tem uma **ficha** (arquivo de configuração) com:
- Dores típicas (ex.: energia solar: "lead desqualificado que só quer orçamento"; advocacia: "só vem cliente sem dinheiro").
- Objeções típicas do nicho (ex.: "já impulsionei e não deu nada", "meu cliente vem de indicação").
- Ticket médio do negócio e quanto costuma investir em anúncio.
- Vocabulário e jeito de falar.
- Regras do setor que o vendedor precisa respeitar (CFM, CFO, OAB). Prometer resultado na saúde ou na advocacia tira pontos.

## 4. Configuração do cliente (antes de começar)

### Galeria de personagens
Personagens prontos, **masculinos e femininos**, cada um com nome, idade, foto ilustrada, voz própria (sotaque brasileiro, timbre e ritmo diferentes) e um jeito de falar. Exemplos:

| Personagem | Idade | Voz | Perfil padrão |
|---|---|---|---|
| Dr. Ricardo | 52 | grave, pausada | Ortopedista analítico, quer números |
| Dra. Camila | 38 | animada, rápida | Dentista comunicadora, decide pela conexão |
| Marcos | 45 | direta, seca | Dono de empresa de energia solar, executor, sem paciência |
| Fernanda | 41 | firme, educada | Dona de imobiliária, planejadora, cautelosa |
| Dr. Paulo | 60 | formal | Advogado tradicional, "meu cliente vem de indicação" |
| Juliana | 33 | descontraída | Dona de academia, já teve agência ruim |
| Roberto | 50 | desconfiada | Dono de loja de materiais de construção, "internet não funciona pro meu ramo" |
| Patrícia | 47 | calma | Dona de marcenaria de móveis planejados, ticket alto, compara orçamento |

### Vozes escolhidas (teste de 04/11/2026)
Testadas no ElevenLabs com a mesma fala de cliente desconfiado. Aprovadas:

| Voz ElevenLabs | Gênero | Uso sugerido |
|---|---|---|
| **Paulo** (Natural Brazilian Voice) | Masculina | Dr. Ricardo, Dr. Paulo (mais formais e maduros) |
| **Yuri** (Natural Brazilian, tom de conversa) | Masculina | Marcos, Roberto (donos de empresa, mais diretos) |
| **Marcia** (Portuguese, jovem) | Feminina | Juliana, Dra. Camila |
| **Raquel** (Expressive and Energetic) | Feminina | Fernanda, Patrícia |

Reprovadas: Fabi, Eric, Fabio Oliveira. Indisponíveis no plano gratuito: Pri, Leo, Eduardo, Guilherme, Senhor M. (plano Creator).

Segunda rodada masculina gerada: Yuri (aprovado), Daniel, Ale Garcia, Eduardo S., Alex Pinhol, Moutella, Witalo (aguardando avaliação).

Na v1: 8 personagens (4 homens e 4 mulheres). Dá para escolher pela galeria, filtrar por gênero ou sortear. O nicho e o perfil podem ser trocados em qualquer personagem: a voz e o rosto continuam, e a ficha muda.

- **Nicho** (lista acima).
- **Perfil DISC:** Executor, Comunicador, Planejador ou Analítico.
- **Nível de consciência:** 1 (não sabe que tem o problema) a 4 (já busca agência).
- **Dificuldade:** fácil, médio ou difícil. Muda a paciência, o número de objeções e a facilidade de revelar a dor.
- **Histórico:** nunca anunciou / impulsiona sozinho / já teve agência ruim / tem agência hoje.
- **Sua oferta:** serviço, preço, formato de contrato e diferenciais. Fica salvo como "minha oferta" para não preencher toda vez.
- **Opção "reunião de amanhã":** você descreve o cliente real (nome do negócio, o que sabe dele) e a IA monta o personagem.
- **Opção "cliente surpresa":** tudo sorteado.

### Estado oculto do cliente
Cada personagem nasce com informações que **você precisa descobrir** perguntando:
- Dor real (que nem sempre é a primeira que ele fala)
- Orçamento disponível
- Quem decide (ele, sócio, cônjuge)
- Objeção verdadeira (a que está por trás das falsas)
- Urgência de 0 a 10

O cliente só revela isso se você fizer as perguntas certas. A avaliação final mostra o que você descobriu e o que deixou passar.

## 5. A reunião (voz)

- Conversa por voz em tempo real, com interrupção natural: você pode cortar o cliente e ele pode cortar você.
- Vozes brasileiras diferentes por personagem (homem/mulher, idade, tom).
- O cliente reage ao que você faz: perde interesse se você enrola, fica impaciente se você fala demais, se abre se você faz uma boa pergunta.
- Botão de encerrar. O cliente também pode encerrar a reunião se você for mal ("olha, preciso ir").
- Transcrição na tela durante a conversa (pode ser escondida).

## 6. Placar ao vivo

A cada fala sua, a IA avaliadora atualiza:
- **Nota geral de 0 a 100**, com seta de subida ou queda.
- **Termômetro do cliente:** frio, morno, quente, pronto para fechar.
- **Etapa atual:** abertura → conexão → diagnóstico → apresentação → objeções → fechamento.
- **Alerta curto** quando você erra. Exemplos: "Falou de preço antes de achar a dor"; "Mensagem terminou sem pergunta"; "Cedeu desconto sem contrapartida".
- **Proporção de fala:** você x cliente (meta: cliente falar ~60%).
- **Painel de comunicação:** ritmo (palavras por minuto), contador de vícios de linguagem e de palavras de insegurança, atualizados enquanto você fala (detalhes na seção 8).
- **Modo prova:** esconde o placar e só mostra no fim.

## 7. Critérios de avaliação (VENDE-C)

Cada critério vale de 0 a 10. O peso muda conforme o modo (na prospecção, fechamento quer dizer "marcou a reunião").

| # | Critério | O que a IA observa | Base no VENDE-C |
|---|---|---|---|
| 1 | Abertura e agenda | Apresentou-se, pediu tempo, definiu o roteiro da reunião | Estrutura de script (abertura) |
| 2 | Conexão | Personalizou, espelhou o tom, gerou confiança | "Pessoas compram primeiro você"; F.O.R.M. |
| 3 | Qualificação | Checou necessidade, momento, orçamento e decisor | 3 visões da qualificação |
| 4 | Diagnóstico | Perguntas abertas, explorou impacto e custo do problema | "Perguntador profissional" |
| 5 | Escuta ativa | Usou as palavras do cliente, fez backtracking | Backtracking |
| 6 | Apresentação de valor | Respondeu "é verdade? o que eu ganho? é pra mim?"; benefício, não característica; case ou história | 3 perguntas do cliente; storytelling |
| 7 | Adaptação ao perfil | Ajustou a comunicação ao DISC do cliente | Perfis comportamentais |
| 8 | Objeções | Ouviu → isolou → respondeu com pergunta; não rebateu nem cedeu rápido | Método dos 3 passos |
| 9 | Negociação | Concessão só com contrapartida ("se eu…, você…?") | Negociação ganha-ganha |
| 10 | Fechamento / próximo passo | Pediu a venda ou marcou data concreta; nunca "vamos nos falando" | Técnicas de fechamento; follow-up |
| 11 | Ética e conformidade | Não prometeu resultado garantido; respeitou CFM/OAB | Regras Essence |
| 12 | Segurança e clareza | Sem "acho", "talvez", "mais ou menos"; frases curtas | "A complexidade é a maior inimiga" |

**Diagnóstico de perda:** se não fechou, a IA aponta qual dos 5 motivos do VENDE-C pesou (relacionamento fraco, dor não identificada, não qualificou, não explorou o impacto, não conectou solução à necessidade).

## 8. Comunicação: dicção e vocabulário

Avaliação separada da técnica de vendas, porque dá para vender bem e falar mal (e o contrário). Vira uma **nota de comunicação de 0 a 100**.

### Dicção e ritmo
| Métrica | Como mede | Faixa boa |
|---|---|---|
| Ritmo | Palavras por minuto em cada fala sua | 130 a 160 ppm |
| Vícios de linguagem | Contagem de "né", "tipo", "então", "assim", "éé", "ããh" | Menos de 3 a cada 5 minutos |
| Fluidez | Frases interrompidas, recomeços ("eu… a gente… o que eu quero dizer") | Poucas |
| Pausas | Silêncios longos no meio da frase x pausas estratégicas depois de uma pergunta | Pausar depois de perguntar |
| Clareza | Trechos que o reconhecimento de voz não entendeu (sinal de fala embolada ou baixa) | Quase nenhum |
| Pronúncia (opcional, v2) | Nota de pronúncia, fluência e entonação por um serviço de avaliação de fala em português | Acima de 80 |

### Vocabulário
| Métrica | O que observa |
|---|---|
| Palavras de insegurança | "acho", "talvez", "meio que", "mais ou menos", "vou tentar" |
| Jargão sem explicação | CTR, CPA, ROAS, pixel, funil usados com um cliente leigo sem traduzir |
| Variedade | Repetição excessiva das mesmas palavras e expressões |
| Palavras de valor | Fala em benefício e resultado ("mais pacientes particulares") e não só em tarefa ("vou subir anúncio") |
| Linguagem do cliente | Usa as palavras que o cliente usou (backtracking) |
| Formalidade | Ajusta o tom ao personagem (formal com Dr. Paulo, leve com Juliana) |

No relatório, cada problema vem com o trecho, o porquê e a troca sugerida. Exemplo: "Você disse *acho que dá pra gerar resultado* 4 vezes. Isso passa insegurança. Troque por *o plano é gerar X em Y dias*."

**Ponto técnico a validar na v1:** muitos transcritores limpam "éé" e "né" automaticamente. A transcrição precisa ser literal para contar vícios; isso será testado logo no começo.

## 9. Relatório final

1. **Nota geral** e resultado (fechou / marcou próximo passo / perdeu), com a nota de vendas e a nota de comunicação separadas.
2. **Gráfico radar** com os 12 critérios + resumo de comunicação (ritmo, vícios, palavras de insegurança, jargão).
3. **Estado oculto revelado:** o que o cliente tinha de verdade e o que você descobriu ✔ ou deixou passar ✘.
4. **3 pontos fortes**, com o trecho da conversa.
5. **3 pontos de melhoria**, cada um com:
   - **O quê:** o erro, com o trecho exato.
   - **Por quê:** o impacto na venda, segundo o método.
   - **Como:** a frase alternativa pronta para usar.
6. **Momento decisivo:** onde a venda foi ganha ou perdida.
7. **Exercício para a próxima rodada:** cenário e foco sugeridos.
8. **Conquistas desbloqueadas** e XP ganho na rodada.
9. Opção de **ouvir de novo** trechos da conversa (gravação).

## 10. Conquistas, níveis e evolução

### XP e níveis
Cada treino dá XP pela nota, pela dificuldade e pelas conquistas. Os níveis:

1. Estagiário → 2. SDR → 3. Vendedor → 4. Closer → 5. Closer Sênior → 6. Head de Vendas → 7. Lenda

### Conquistas
Cada conquista tem bronze, prata e ouro (ex.: fazer algo 1, 5 e 20 vezes).

**Método de vendas**
- **Perguntador profissional:** 8 ou mais perguntas abertas numa reunião
- **Detetive:** descobriu todo o estado oculto do cliente (dor, orçamento, decisor, objeção real)
- **Descascador:** ouviu, isolou e respondeu uma objeção com pergunta
- **Nada de desconto:** fechou uma negociação sem ceder sem contrapartida
- **Próximo passo:** nunca terminou uma reunião sem data marcada (sequência)
- **Primeira venda / Fechamento difícil / Domador de céticos**

**Comunicação**
- **Voz firme:** reunião inteira sem palavras de insegurança
- **Sem vícios:** menos de 3 vícios de linguagem na reunião
- **Ritmo de locutor:** ritmo na faixa ideal o tempo todo
- **Tradutor:** usou termos técnicos sempre explicando para o leigo
- **Camaleão:** ajustou a formalidade a 5 personagens diferentes
- **Escuta de ouro:** cliente falou mais de 60% do tempo

**Constância e variedade**
- **Sequência:** treinou 3, 7 e 30 dias seguidos
- **Rodado:** fechou em todos os 12 nichos
- **Leitor de gente:** fechou com os 4 perfis DISC
- **Todas as vozes:** treinou com todos os personagens

### Evolução
- Lista de treinos com data, personagem, nicho, modo e notas.
- Gráfico de evolução da nota de vendas, da nota de comunicação e de cada critério.
- Recordes pessoais (maior nota, menos vícios, maior sequência).
- **Ponto fraco recorrente:** ex.: "Fechamento abaixo de 5 em 4 dos últimos 5 treinos" ou "Vícios subiram nesta semana".
- **Desafio da semana:** gerado a partir do ponto fraco (ex.: "3 reuniões sem dizer *acho*").
- Exportar o relatório em PDF.

## 11. Arquitetura técnica

```
Navegador (site no Netlify)
 ├─ Tela de configuração  →  monta o personagem (ficha do nicho + escolhas)
 ├─ Reunião por voz  ←→  ElevenLabs Agents (fala ↔ texto, voz, turnos, interrupção)
 │                          └─ cérebro do cliente: Claude (prompt do personagem)
 ├─ A cada fala sua  →  Netlify Function "avaliar-turno"  →  Claude Haiku (rápido e barato)  →  placar
 ├─ Métricas de comunicação (ritmo, vícios, palavras)  →  calculadas no navegador a partir da transcrição e do tempo de cada fala
 ├─ Conquistas e XP  →  regras fixas aplicadas ao resultado de cada treino
 └─ Ao encerrar  →  Netlify Background Function "relatorio"  →  Claude Opus (transcrição completa)  →  relatório
```

**Por que o ElevenLabs Agents (e não montar peça por peça):** ele já resolve reconhecimento de fala, voz, detecção de quem está falando e interrupção, com baixa latência. É o que deixa a conversa com cara de real. Montar isso na mão com MiniMax (só voz) exigiria juntar reconhecimento de fala + IA + voz e cuidar da latência, e a conversa ficaria mais robótica. O MiniMax fica como alternativa mais barata para vozes, se o custo por minuto pesar quando abrir para outros gestores.

**Chaves de API** (ElevenLabs, Anthropic) ficam só nas Netlify Functions, nunca no navegador.

**Atenção ao limite do Netlify:** funções comuns têm tempo curto; o relatório final roda em background function e a tela espera o resultado.

### Dados
- **v1 (só você):** histórico salvo no navegador. Sem login.
- **v2 (vender):** Supabase para login, histórico por usuário e limite de minutos por plano; pagamento por assinatura (Stripe ou Hubla).

### Custo a acompanhar
O custo principal é por **minuto de voz** (ElevenLabs) + avaliação (Claude). Antes de definir o preço para outros gestores, medir quanto custa uma reunião de 20 minutos na v1.

## 12. Versões

**v1: para você treinar**
- Modos: Prospecção, Diagnóstico, Apresentação e fechamento
- 12 nichos com ficha
- 8 personagens (4 masculinos e 4 femininos) com voz própria
- Configuração do cliente + estado oculto
- Reunião por voz ao vivo (ElevenLabs Agents)
- Placar ao vivo + painel de comunicação
- Avaliação de dicção (ritmo, vícios, fluidez) e vocabulário
- Relatório final completo
- XP, níveis, conquistas e desafio da semana
- Histórico local

**v2: para vender**
- Login, planos e pagamento
- Modos Negociação e Renovação
- "Reunião de amanhã" com cliente real
- Gravação para ouvir de novo
- Exportar PDF
- Painel do gestor de agência (ver a evolução do time)
- Nota de pronúncia por serviço especializado
- Ranking entre usuários (opcional, com quem quiser participar)
- Mais personagens

## 13. O que preciso antes de construir

- [ ] Conta no ElevenLabs com acesso a Agents e uma chave de API
- [ ] Chave de API da Anthropic (Claude)
- [ ] Conta no Netlify (e, se quiser, um repositório no GitHub ligado a ela)
- [ ] Sua oferta padrão: serviços, preço, formato de contrato, diferenciais
- [ ] 2 ou 3 cases reais para a IA saber o que você pode citar (e para cobrar se você não citar)
