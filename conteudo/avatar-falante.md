# Avatar falante: comparação de serviços

Pesquisa de 04/11/2026. Objetivo: fazer os retratos dos personagens (estilo animação de cinema, gerados no Google Flow) mexerem a boca, o rosto e a cabeça em tempo real junto com a voz do ElevenLabs, durante a reunião.

Os preços vêm, em grande parte, de sites comparativos que discordam entre si. **Confirmar no site de cada serviço antes de fechar.**

## Comparação

| Serviço | Aceita desenho/animação? | Liga com ElevenLabs Agents? | Preço aproximado por minuto | Observações |
|---|---|---|---|---|
| **Runway Characters** | **Sim, declarado**: de humano realista a mascote de desenho, a partir de uma imagem | Não direto; via LiveKit | ~US$ 0,20 (2 créditos a cada 6 s) | Modelo GWM-1, 24 fps, sem treino. Uma fonte cita limite de 5 min por sessão: **verificar**, porque as reuniões passam disso |
| **Anam** | Aceita imagem enviada; estilo desenho **não confirmado** | **Sim, documentado** (modo em que só faz a boca seguir o áudio do ElevenLabs) | US$ 0,11 a 0,14 (planos de US$ 49 a 999/mês); 30 min grátis/mês | Integração mais pronta com o que já está planejado |
| **LiveAvatar (HeyGen)** | Avatar a partir de 1 imagem; desenho **não confirmado** | Sim, conector em beta (não funciona com chave gratuita do ElevenLabs) | ~US$ 0,09 (só avatar) a 0,18; cai para ~US$ 0,01 em volume | Concorrência ilimitada |
| **Simli** | Foco em rostos realistas; desenho **não confirmado** | Não direto; via LiveKit | ~US$ 0,01; 50 min grátis/mês | O mais barato, mas exige montar o fluxo de áudio por conta própria |
| **D-ID** | Avatar por foto; desenho não confirmado | Não encontrado | ~US$ 0,50 a 0,56 | Caro e com poucos minutos por plano |

## Custo de uma reunião de 20 minutos (só o avatar)

| Serviço | Custo aproximado |
|---|---|
| Simli | US$ 0,20 |
| LiveAvatar | US$ 1,80 |
| Anam | US$ 2,20 a 2,80 |
| Runway | US$ 4,00 |
| D-ID | US$ 10,00 |

A isso soma-se o ElevenLabs (voz e conversa) e o Claude (avaliação).

## Recomendação

1. **Testar primeiro o Runway Characters e o Anam com o mesmo retrato** (sugestão: Juliana) e uma fala em português. Critérios: o estilo de animação se mantém? A boca acompanha bem o português? Qual o atraso?
2. Se o Runway mantiver o estilo e não tiver limite curto de sessão, ele é o mais fiel ao visual dos retratos.
3. Se o Anam também mantiver o estilo, ele é o caminho mais simples, porque já liga oficialmente ao ElevenLabs Agents.
4. Simli e LiveAvatar ficam como opções mais baratas para quando houver muitos usuários, se aceitarem bem os retratos.

## Fontes

- Comparativo de preços de avatares em tempo real (Akapulu, set/2026): https://blog.akapulu.com/p/real-time-avatar-api-pricing-index/
- Comparativo de preços (talking-avatar.dev): https://talking-avatar.dev/compare/avatar-api-pricing
- Runway Characters: https://runway.com/product/characters
- Documentação do Runway Characters: https://docs.dev.runwayml.com/characters/
- Artigo do Runway Characters na SIGGRAPH: https://dl.acm.org/doi/10.1145/3799821.3820914
- Plugin do Runway para LiveKit: https://docs.livekit.io/agents/models/avatar/plugins/runway
- Anam com ElevenLabs Agents: https://docs.anam.ai/third-party-integrations/elevenlabs
- Exemplo Anam + ElevenLabs: https://github.com/anam-org/elevenlabs_agent_demo
- Preços do Anam (Spatius): https://www.spatius.ai/blog/real-time-ai-avatar-api-pricing-2026/
- LiveAvatar: https://www.liveavatar.com/
- Conector ElevenLabs do LiveAvatar: https://docs.liveavatar.com/docs/elevenlabs-agent-plugin
- Preços do HeyGen/LiveAvatar (Voyager): https://voyager.so/blog/heygen-pricing
- Simli: https://www.simli.com/
- Preços do Simli (Spatius): https://www.spatius.ai/blog/simli-pricing-2026/
- Simli no LiveKit: https://docs.livekit.io/agents/integrations/avatar/simli
- Preços do D-ID (Spatius): https://www.spatius.ai/blog/d-id-pricing-2026/
