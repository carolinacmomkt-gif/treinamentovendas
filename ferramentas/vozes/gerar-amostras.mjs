// Gera amostras das vozes brasileiras do ElevenLabs falando a mesma fala de cliente,
// para comparar qual soa mais humana. Uso (na pasta do projeto):
//   node --env-file=.env ferramentas/vozes/gerar-amostras.mjs [--por-genero 6] [--modelo eleven_multilingual_v2]
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const API = "https://api.elevenlabs.io/v1";
const CHAVE = process.env.ELEVENLABS_API_KEY;
const PASTA = join(dirname(fileURLToPath(import.meta.url)), "amostras");

const args = process.argv.slice(2);
const arg = (nome, padrao) => {
  const i = args.indexOf(`--${nome}`);
  return i >= 0 ? args[i + 1] : padrao;
};
const POR_GENERO = Number(arg("por-genero", 6));
const MODELO = arg("modelo", "eleven_multilingual_v2");

// Fala de um cliente desconfiado, com hesitações, para testar naturalidade.
const FALA =
  "Olha... sinceramente? Eu já contratei uma agência no ano passado e não deu em nada. " +
  "Gastava uns três mil por mês, e o telefone não tocava. Então assim, me explica: " +
  "o que vocês fazem de diferente? Porque eu não tô com muito tempo, não.";

if (!CHAVE) {
  console.error("Falta ELEVENLABS_API_KEY no arquivo .env (veja .env.example).");
  process.exit(1);
}

async function api(caminho, opcoes = {}) {
  const resp = await fetch(`${API}${caminho}`, {
    ...opcoes,
    headers: { "xi-api-key": CHAVE, "Content-Type": "application/json", ...opcoes.headers },
  });
  if (!resp.ok) throw new Error(`${resp.status} ${await resp.text()}`);
  return resp;
}

async function buscarVozes(genero) {
  const qs = new URLSearchParams({
    language: "pt",
    accent: "brazilian",
    gender: genero,
    page_size: "30",
    sort: "usage_character_count_1y",
  });
  const { voices } = await (await api(`/shared-voices?${qs}`)).json();
  return voices.slice(0, POR_GENERO).map((v) => ({
    id: v.voice_id,
    dono: v.public_owner_id,
    nome: v.name,
    genero,
    idade: v.age,
    descricao: [v.descriptive, v.use_case].filter(Boolean).join(", "),
  }));
}

async function falar(voz) {
  const corpo = JSON.stringify({ text: FALA, model_id: MODELO });
  const tts = () =>
    api(`/text-to-speech/${voz.id}?output_format=mp3_44100_128`, { method: "POST", body: corpo });
  try {
    return await tts();
  } catch {
    // Algumas vozes da biblioteca só funcionam depois de adicionadas à conta.
    await api(`/voices/add/${voz.dono}/${voz.id}`, {
      method: "POST",
      body: JSON.stringify({ new_name: voz.nome }),
    });
    return tts();
  }
}

await mkdir(PASTA, { recursive: true });
const vozes = [...(await buscarVozes("female")), ...(await buscarVozes("male"))];
const geradas = [];

for (const voz of vozes) {
  const arquivo = `${voz.genero}-${voz.id}.mp3`;
  try {
    const audio = await falar(voz);
    await writeFile(join(PASTA, arquivo), Buffer.from(await audio.arrayBuffer()));
    geradas.push({ ...voz, arquivo, modelo: MODELO });
    console.log(`ok   ${voz.genero.padEnd(6)} ${voz.nome}`);
  } catch (erro) {
    console.log(`erro ${voz.genero.padEnd(6)} ${voz.nome}: ${erro.message.slice(0, 160)}`);
  }
}

await writeFile(join(PASTA, "vozes.js"), `window.VOZES = ${JSON.stringify(geradas, null, 2)};\nwindow.FALA = ${JSON.stringify(FALA)};\n`);
console.log(`\n${geradas.length} amostras em ${PASTA}. Abra ferramentas/vozes/index.html para ouvir.`);
