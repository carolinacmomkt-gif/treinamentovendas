"""Servidor local do protótipo do Closing.

Serve os arquivos do projeto e tem duas rotas:
- /api/voz: fala o texto com a voz aprovada do ElevenLabs.
- /api/cliente: o Gemini (plano grátis) responde no papel do cliente.
As chaves ficam só no arquivo .env deste computador.

Uso, na pasta do projeto:  python servidor.py   (abre em http://127.0.0.1:5173)
"""
import hashlib
import json
import os
import urllib.error
import urllib.parse
import urllib.request
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

RAIZ = Path(__file__).resolve().parent
CACHE = RAIZ / ".cache-voz"
API = "https://api.elevenlabs.io/v1"
MODELO = "eleven_flash_v2_5"  # metade dos créditos do modelo padrão e resposta mais rápida

# Nome de cada voz aprovada como aparece na biblioteca do ElevenLabs.
VOZES = {
    "Paulo": "Paulo - Natural Brazilian Voice",
    "Yuri": "Yuri - Natural Brazilian",
    "Witalo": "Witalo - Young Male",
    "Marcia": "Marcia - Portuguese",
    "Raquel": "Raquel - Expressive and Energetic",
}


def ler_chave(nome="ELEVENLABS_API_KEY"):
    env = RAIZ / ".env"
    if env.exists():
        for linha in env.read_text(encoding="utf-8").splitlines():
            if linha.startswith(nome + "="):
                return linha.split("=", 1)[1].strip()
    return os.environ.get(nome, "")


def chamar(caminho, chave, metodo="GET", corpo=None):
    req = urllib.request.Request(
        API + caminho,
        method=metodo,
        data=json.dumps(corpo).encode() if corpo is not None else None,
        headers={"xi-api-key": chave, "Content-Type": "application/json"},
    )
    with urllib.request.urlopen(req, timeout=60) as resp:
        return resp.read()


def id_da_voz(apelido, chave):
    """Acha o id da voz: primeiro em 'Minhas vozes', senão na biblioteca pública (e adiciona)."""
    CACHE.mkdir(exist_ok=True)
    arquivo = CACHE / "ids.json"
    ids = json.loads(arquivo.read_text(encoding="utf-8")) if arquivo.exists() else {}
    if apelido in ids:
        return ids[apelido]
    nome = VOZES[apelido]
    minhas = json.loads(chamar("/voices", chave)).get("voices", [])
    achada = next((v for v in minhas if v["name"].lower().startswith(nome.split(" - ")[0].lower())), None)
    if achada:
        voz_id = achada["voice_id"]
    else:
        busca = urllib.parse.urlencode({"search": nome, "page_size": 10})
        publicas = json.loads(chamar(f"/shared-voices?{busca}", chave)).get("voices", [])
        v = next((p for p in publicas if p["name"].lower() == nome.lower()), publicas[0] if publicas else None)
        if not v:
            raise RuntimeError(f"Voz não encontrada no ElevenLabs: {nome}")
        chamar(f"/voices/add/{v['public_owner_id']}/{v['voice_id']}", chave, "POST", {"new_name": nome})
        voz_id = v["voice_id"]
    ids[apelido] = voz_id
    arquivo.write_text(json.dumps(ids, indent=2), encoding="utf-8")
    return voz_id


# ---------- cliente (Gemini) ----------
GEMINI = "https://generativelanguage.googleapis.com/v1beta/models/{}:generateContent"
MODELOS_GEMINI = ["gemini-2.5-flash", "gemini-flash-latest", "gemini-2.0-flash"]
DIFICULDADE = {
    "facil": "Você é receptivo. Revela a dor real logo e tem 1 ou 2 objeções simples.",
    "medio": "Você começa com uma objeção falsa (cortina). Só revela a objeção verdadeira se o vendedor isolar a objeção com uma boa pergunta.",
    "dificil": "Você é cético e impaciente. Faz 4 ou mais objeções, volta numa objeção já respondida e testa se o vendedor dá desconto. Se ele ceder sem contrapartida, peça mais desconto.",
}
MODOS = {
    "prospeccao": "É uma ligação de prospecção: o vendedor quer marcar uma reunião. Você está ocupado.",
    "diagnostico": "É a primeira reunião de diagnóstico: o vendedor quer entender seu negócio.",
    "fechamento": "É a reunião de apresentação e fechamento: o vendedor vai apresentar a proposta.",
}


def instrucoes_cliente(p):
    pers, estado = p.get("personagem", {}), p.get("estado", {})
    objecoes = (RAIZ / "conteudo" / "objecoes.md").read_text(encoding="utf-8")
    return f"""Você é {pers.get('nome')}, {pers.get('idade')} anos, {pers.get('nicho')}, perfil comportamental {pers.get('perfil')}.
Você está numa reunião por vídeo com um vendedor de agência de tráfego pago e marketing. Você é o CLIENTE, nunca o vendedor.
{MODOS.get(p.get('modo'), MODOS['diagnostico'])}
{DIFICULDADE.get(p.get('dificuldade'), DIFICULDADE['medio'])}

Seu jeito: comece pela ideia desta frase: "{pers.get('fala')}".

Informações que você só revela se o vendedor perguntar bem (estado oculto):
- Dor real: {estado.get('dor')}
- Orçamento possível por mês: {estado.get('orcamento')}
- Quem decide: {estado.get('decisor')}
- Objeção verdadeira: {estado.get('objecao')}

Regras de fala:
- Fale sempre em português do Brasil, como numa conversa falada: frases curtas, 1 a 3 frases por vez, sem listas, sem emojis, sem markdown.
- Reaja ao que o vendedor acabou de dizer. Se ele enrolar ou falar demais, demonstre impaciência. Se fizer uma boa pergunta, abra um pouco mais.
- Use as objeções do banco abaixo que combinam com o seu nicho, com suas palavras.
- Não facilite: só aceite o próximo passo quando o vendedor entender sua dor e responder a objeção verdadeira.
- Quando aceitar fechar o contrato, termine a fala com a marca [FECHOU]. Quando aceitar só marcar uma próxima reunião, termine com [MARCOU]. Quando encerrar a conversa sem acordo, termine com [ENCERROU]. Não use essas marcas em outros casos.

Banco de objeções (referência):
{objecoes}"""


def responder_cliente(pedido):
    chave = ler_chave("GEMINI_API_KEY")
    if not chave:
        raise PermissionError("Falta GEMINI_API_KEY no arquivo .env")
    conteudo = []
    for fala in pedido.get("historico", [])[-30:]:
        papel = "model" if fala.get("quem") == "cliente" else "user"
        if conteudo and conteudo[-1]["role"] == papel:
            conteudo[-1]["parts"][0]["text"] += " " + fala["texto"]
        else:
            conteudo.append({"role": papel, "parts": [{"text": fala["texto"]}]})
    if not conteudo or conteudo[0]["role"] != "user":
        conteudo.insert(0, {"role": "user", "parts": [{"text": "(O vendedor entrou na reunião.)"}]})
    corpo = {
        "systemInstruction": {"parts": [{"text": instrucoes_cliente(pedido)}]},
        "contents": conteudo,
        "generationConfig": {"temperature": 0.9, "maxOutputTokens": 220, "thinkingConfig": {"thinkingBudget": 0}},
    }
    ultimo_erro = None
    for modelo in [ler_chave("GEMINI_MODEL") or MODELOS_GEMINI[0]] + MODELOS_GEMINI:
        corpo_modelo = dict(corpo)
        if not modelo.startswith("gemini-2.5") and modelo != "gemini-flash-latest":
            corpo_modelo["generationConfig"] = {k: v for k, v in corpo["generationConfig"].items() if k != "thinkingConfig"}
        req = urllib.request.Request(GEMINI.format(modelo), data=json.dumps(corpo_modelo).encode(),
                                     headers={"x-goog-api-key": chave, "Content-Type": "application/json"})
        try:
            with urllib.request.urlopen(req, timeout=40) as resp:
                dados = json.loads(resp.read())
            partes = dados["candidates"][0]["content"]["parts"]
            return " ".join(x.get("text", "") for x in partes).strip()
        except urllib.error.HTTPError as e:
            ultimo_erro = e
            if e.code != 404:
                raise
    raise ultimo_erro


class Manipulador(SimpleHTTPRequestHandler):
    def __init__(self, *a, **k):
        super().__init__(*a, directory=str(RAIZ), **k)

    def do_GET(self):
        # Nunca entrega arquivos ocultos (.env, .git, cache de voz).
        partes = urllib.parse.unquote(urllib.parse.urlsplit(self.path).path).split("/")
        if any(p.startswith(".") for p in partes if p):
            return self.responder_json(404, {"erro": "não encontrado"})
        return super().do_GET()

    def responder_json(self, codigo, dados):
        corpo = json.dumps(dados).encode()
        self.send_response(codigo)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(corpo)))
        self.end_headers()
        self.wfile.write(corpo)

    def do_POST(self):
        if self.path == "/api/cliente":
            try:
                pedido = json.loads(self.rfile.read(int(self.headers.get("Content-Length", 0))) or b"{}")
                return self.responder_json(200, {"texto": responder_cliente(pedido)})
            except PermissionError as e:
                return self.responder_json(503, {"erro": str(e)})
            except urllib.error.HTTPError as e:
                return self.responder_json(e.code, {"erro": e.read().decode("utf-8", "replace")[:400]})
            except Exception as e:  # noqa: BLE001
                return self.responder_json(500, {"erro": str(e)[:400]})
        if self.path != "/api/voz":
            return self.responder_json(404, {"erro": "rota não existe"})
        chave = ler_chave()
        if not chave:
            return self.responder_json(503, {"erro": "Falta ELEVENLABS_API_KEY no arquivo .env"})
        try:
            pedido = json.loads(self.rfile.read(int(self.headers.get("Content-Length", 0))) or b"{}")
            texto, apelido = pedido["texto"].strip(), pedido["voz"]
            if apelido not in VOZES or not texto:
                return self.responder_json(400, {"erro": "voz ou texto inválido"})
            # Mesma fala com a mesma voz não gasta crédito de novo.
            nome_cache = hashlib.sha1(f"{apelido}|{MODELO}|{texto}".encode()).hexdigest() + ".mp3"
            arquivo = CACHE / nome_cache
            if not arquivo.exists():
                voz_id = id_da_voz(apelido, chave)
                audio = chamar(f"/text-to-speech/{voz_id}?output_format=mp3_44100_128", chave, "POST",
                               {"text": texto, "model_id": MODELO})
                CACHE.mkdir(exist_ok=True)
                arquivo.write_bytes(audio)
            dados = arquivo.read_bytes()
            self.send_response(200)
            self.send_header("Content-Type", "audio/mpeg")
            self.send_header("Content-Length", str(len(dados)))
            self.end_headers()
            self.wfile.write(dados)
        except urllib.error.HTTPError as e:
            self.responder_json(e.code, {"erro": e.read().decode("utf-8", "replace")[:400]})
        except Exception as e:  # noqa: BLE001 - o navegador só precisa saber que falhou
            self.responder_json(500, {"erro": str(e)[:400]})


if __name__ == "__main__":
    print("Closing em http://127.0.0.1:5173/prototipo/index.html")
    ThreadingHTTPServer(("127.0.0.1", 5173), Manipulador).serve_forever()
