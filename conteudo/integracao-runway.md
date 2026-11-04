# Integração: Runway Characters + ElevenLabs Agents na sala do Closing

Decisão de 04/11/2026: o Gustavo testou Runway e Anam com a Juliana e escolheu o **Runway Characters** para dar vida aos retratos.

## Como as peças se encaixam

```
Navegador (sala do Closing)
 ├─ Vídeo do cliente  ←WebRTC←  Runway (faz a boca e o rosto do retrato acompanharem o áudio)
 ├─ Microfone  →  Runway  →  ElevenLabs Agent (entende a fala, pensa com o Claude, responde com a voz aprovada)
 └─ Placar ao vivo  ←  reconhecimento de voz do próprio navegador (a fala do vendedor) + Claude Haiku

Servidor (Netlify Function /api/reuniao/iniciar)
 └─ Guarda as chaves, pede ao ElevenLabs um link assinado e cria a sessão no Runway
```

- **ElevenLabs** cuida da conversa: entende o que o vendedor fala, gera a resposta do cliente (com o Claude como cérebro, configurado no agente) e fala com a voz aprovada (Paulo, Yuri, Witalo, Marcia, Raquel).
- **Runway** só faz o rosto: recebe o áudio do ElevenLabs e mexe a boca, o rosto e a cabeça do retrato, enviando o vídeo para o navegador.
- **Servidor** guarda as chaves. Nenhuma chave vai para o navegador nem para o GitHub.

Isso segue o guia oficial do Runway para ElevenLabs Agents (pacotes `@runwayml/avatars` no servidor e `@runwayml/avatars-react` no navegador).

## O que precisa ser criado

1. **9 personagens no portal de desenvolvedor do Runway** (dev.runwayml.com), um por retrato. Os criados no app do Runway não servem para a API: dão erro "Could not find Avatar".
2. **9 agentes no ElevenLabs**, um por personagem, cada um com:
   - a voz aprovada do personagem;
   - o Claude como modelo;
   - as instruções do personagem (nicho, perfil, objeções do banco, estado oculto) com variáveis para o modo e a dificuldade da reunião;
   - formato de áudio de entrada "PCM 16000 Hz" (exigido pelo Runway).
3. **Função no Netlify** `/api/reuniao/iniciar` que recebe o personagem, o modo e a dificuldade e devolve os dados da sessão.
4. **Sala:** trocar o retrato parado pelo vídeo do Runway e encerrar a sessão no botão "Encerrar" (o Runway cobra enquanto a sessão estiver aberta).

## Placar ao vivo

No caminho Runway + ElevenLabs, o navegador não recebe o texto da conversa em tempo real. Solução:
- a fala do **vendedor** (que é o que se avalia) é transcrita no próprio navegador, como já acontece na Oratória;
- a transcrição completa das duas partes chega do ElevenLabs depois da chamada e alimenta o relatório final.

## Custos

| Item | Valor |
|---|---|
| Runway | US$ 0,01 por crédito; 2 créditos ao iniciar + 2 a cada 6 s, ou seja, **~US$ 0,20 por minuto** |
| Reunião de 20 minutos (só o rosto) | **~US$ 4,02** |
| ElevenLabs Agents | Cobrado à parte, por minuto de conversa, conforme o plano |
| Claude | Avaliação ao vivo (Haiku) e relatório final |

## Limites do Runway (por projeto)

| Nível | Sessões ao mesmo tempo | Como chegar |
|---|---|---|
| 1 | 1 a 2 | Inicial |
| 2 | 3 | Depois de comprar US$ 50 em créditos |
| 3 | 5 | Depois de US$ 100 |
| 4 | 10 | Depois de US$ 1.000 |

Para uso próprio na v1, o nível 1 basta. Para vender a outros gestores, é preciso subir de nível conforme o número de usuários ao mesmo tempo.

## Pontos a confirmar

- Se a API tem limite de duração por sessão (a documentação não informa).
- Se a marca d'água "AI-generated with runway" do plano grátis aparece também pela API.
- O preço por minuto do ElevenLabs Agents no plano escolhido.

## O que o Gustavo precisa providenciar

- Conta no portal de desenvolvedor do Runway, compra de créditos e chave da API (colocada por ele no Netlify).
- Plano pago do ElevenLabs com Agents e chave da API (colocada por ele no Netlify).

## Fontes

- Visão geral do Runway Characters: https://docs.dev.runwayml.com/characters/
- Runway + ElevenLabs Agents: https://docs.dev.runwayml.com/characters/elevenlabs
- Preços da API do Runway: https://docs.dev.runwayml.com/guides/pricing/
- Níveis de uso: https://docs.dev.runwayml.com/usage/tiers/
- Plugin do Runway para LiveKit (alternativa com controle total): https://docs.livekit.io/agents/models/avatar/plugins/runway
