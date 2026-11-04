"""Servidor local do protótipo do Closing.

Serve os arquivos do projeto e tem duas rotas, ambas com o Gemini:
- /api/cliente: o Gemini responde no papel do cliente.
- /api/voz: o Gemini fala a resposta com a voz do personagem.
A chave fica só no arquivo .env deste computador.

Uso, na pasta do projeto:  python servidor.py   (abre em http://127.0.0.1:5173)
"""
import base64
import hashlib
import io
import json
import os
import urllib.error
import urllib.parse
import urllib.request
import wave
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

RAIZ = Path(__file__).resolve().parent
CACHE = RAIZ / ".cache-voz"
GEMINI = "https://generativelanguage.googleapis.com/v1beta/models/{}:generateContent"
MODELOS_GEMINI = ["gemini-2.5-flash", "gemini-flash-latest", "gemini-2.0-flash"]
MODELOS_VOZ = ["gemini-2.5-flash-preview-tts", "gemini-2.5-flash-tts"]

# Cada voz do projeto vira uma voz do Gemini com perfil parecido, mais um jeito de falar.
VOZES = {
    "Paulo": ("Charon", "com voz madura, calma e formal"),
    "Yuri": ("Orus", "com voz firme, direta e um pouco impaciente"),
    "Witalo": ("Puck", "com voz jovem, rápida e animada"),
    "Marcia": ("Leda", "com voz jovem, simpática e animada"),
    "Raquel": ("Kore", "com voz firme, educada e cuidadosa"),
}


def ler_chave(nome="GEMINI_API_KEY"):
    env = RAIZ / ".env"
    if env.exists():
        for linha in env.read_text(encoding="utf-8").splitlines():
            if linha.startswith(nome + "="):
                return linha.split("=", 1)[1].strip()
    return os.environ.get(nome, "")


def chamar_gemini(modelos, corpo, chave, timeout=40):
    """Tenta os modelos em ordem; pula os que não existem mais (404)."""
    ultimo_erro = None
    for modelo in modelos:
        req = urllib.request.Request(GEMINI.format(modelo), data=json.dumps(corpo(modelo)).encode(),
                                     headers={"x-goog-api-key": chave, "Content-Type": "application/json"})
        try:
            with urllib.request.urlopen(req, timeout=timeout) as resp:
                return json.loads(resp.read())
        except urllib.error.HTTPError as e:
            ultimo_erro = e
            if e.code != 404:
                raise
    raise ultimo_erro


# ---------- cliente ----------
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
    chave = ler_chave()
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

    def corpo(modelo):
        config = {"temperature": 0.9, "maxOutputTokens": 220}
        if modelo.startswith("gemini-2.5") or modelo == "gemini-flash-latest":
            config["thinkingConfig"] = {"thinkingBudget": 0}  # resposta rápida, sem "pensar" antes
        return {"systemInstruction": {"parts": [{"text": instrucoes_cliente(pedido)}]}, "contents": conteudo, "generationConfig": config}

    modelos = [ler_chave("GEMINI_MODEL") or MODELOS_GEMINI[0]] + MODELOS_GEMINI
    dados = chamar_gemini(modelos, corpo, chave)
    partes = dados["candidates"][0]["content"]["parts"]
    return " ".join(x.get("text", "") for x in partes).strip()


# ---------- voz ----------
def falar(texto, apelido):
    """Gera a fala com a voz do Gemini e devolve um WAV. Falas repetidas vêm do cache."""
    chave = ler_chave()
    if not chave:
        raise PermissionError("Falta GEMINI_API_KEY no arquivo .env")
    voz, jeito = VOZES[apelido]
    arquivo = CACHE / (hashlib.sha1(f"{voz}|{jeito}|{texto}".encode()).hexdigest() + ".wav")
    if arquivo.exists():
        return arquivo.read_bytes()

    def corpo(_modelo):
        return {
            "contents": [{"parts": [{"text": f"Fale em português do Brasil, {jeito}, como numa conversa natural: {texto}"}]}],
            "generationConfig": {"responseModalities": ["AUDIO"],
                                 "speechConfig": {"voiceConfig": {"prebuiltVoiceConfig": {"voiceName": voz}}}},
        }

    dados = chamar_gemini(MODELOS_VOZ, corpo, chave, timeout=60)
    parte = dados["candidates"][0]["content"]["parts"][0]["inlineData"]
    pcm = base64.b64decode(parte["data"])
    taxa = int((parte.get("mimeType", "").split("rate=") + ["24000"])[1].split(";")[0] or 24000)
    saida = io.BytesIO()
    with wave.open(saida, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(taxa)
        w.writeframes(pcm)
    CACHE.mkdir(exist_ok=True)
    arquivo.write_bytes(saida.getvalue())
    return saida.getvalue()


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
        if self.path not in ("/api/cliente", "/api/voz"):
            return self.responder_json(404, {"erro": "rota não existe"})
        try:
            pedido = json.loads(self.rfile.read(int(self.headers.get("Content-Length", 0))) or b"{}")
            if self.path == "/api/cliente":
                return self.responder_json(200, {"texto": responder_cliente(pedido)})
            texto, apelido = pedido.get("texto", "").strip(), pedido.get("voz")
            if apelido not in VOZES or not texto:
                return self.responder_json(400, {"erro": "voz ou texto inválido"})
            audio = falar(texto, apelido)
            self.send_response(200)
            self.send_header("Content-Type", "audio/wav")
            self.send_header("Content-Length", str(len(audio)))
            self.end_headers()
            self.wfile.write(audio)
        except PermissionError as e:
            self.responder_json(503, {"erro": str(e)})
        except urllib.error.HTTPError as e:
            self.responder_json(e.code, {"erro": e.read().decode("utf-8", "replace")[:400]})
        except Exception as e:  # noqa: BLE001 - o navegador só precisa saber que falhou
            self.responder_json(500, {"erro": str(e)[:400]})


if __name__ == "__main__":
    print("Closing em http://127.0.0.1:5173/prototipo/index.html")
    ThreadingHTTPServer(("127.0.0.1", 5173), Manipulador).serve_forever()
