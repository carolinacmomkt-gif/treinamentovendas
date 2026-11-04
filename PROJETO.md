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

## 8. Relatório final

1. **Nota geral** e resultado (fechou / marcou próximo passo / perdeu).
2. **Gráfico radar** com os 12 critérios.
3. **Estado oculto revelado:** o que o cliente tinha de verdade e o que você descobriu ✔ ou deixou passar ✘.
4. **3 pontos fortes**, com o trecho da conversa.
5. **3 pontos de melhoria**, cada um com:
   - **O quê:** o erro, com o trecho exato.
   - **Por quê:** o impacto na venda, segundo o método.
   - **Como:** a frase alternativa pronta para usar.
6. **Momento decisivo:** onde a venda foi ganha ou perdida.
7. **Exercício para a próxima rodada:** cenário e foco sugeridos.
8. Opção de **ouvir de novo** trechos da conversa (gravação).

## 9. Histórico e evolução

- Lista de treinos com data, nicho, modo e nota.
- Gráfico de evolução por critério.
- **Ponto fraco recorrente:** ex.: "Fechamento abaixo de 5 em 4 dos últimos 5 treinos".
- Exportar o relatório em PDF.

## 10. Arquitetura técnica

```
Navegador (site no Netlify)
 ├─ Tela de configuração  →  monta o personagem (ficha do nicho + escolhas)
 ├─ Reunião por voz  ←→  ElevenLabs Agents (fala ↔ texto, voz, turnos, interrupção)
 │                          └─ cérebro do cliente: Claude (prompt do personagem)
 ├─ A cada fala sua  →  Netlify Function "avaliar-turno"  →  Claude Haiku (rápido e barato)  →  placar
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

## 11. Versões

**v1: para você treinar**
- Modos: Prospecção, Diagnóstico, Apresentação e fechamento
- 12 nichos com ficha
- Configuração do cliente + estado oculto
- Reunião por voz (ElevenLabs Agents)
- Placar ao vivo
- Relatório final completo
- Histórico local

**v2: para vender**
- Login, planos e pagamento
- Modos Negociação e Renovação
- "Reunião de amanhã" com cliente real
- Gravação para ouvir de novo
- Exportar PDF
- Painel do gestor de agência (ver a evolução do time)

## 12. O que preciso antes de construir

- [ ] Conta no ElevenLabs com acesso a Agents e uma chave de API
- [ ] Chave de API da Anthropic (Claude)
- [ ] Conta no Netlify (e, se quiser, um repositório no GitHub ligado a ela)
- [ ] Sua oferta padrão: serviços, preço, formato de contrato, diferenciais
- [ ] 2 ou 3 cases reais para a IA saber o que você pode citar (e para cobrar se você não citar)
