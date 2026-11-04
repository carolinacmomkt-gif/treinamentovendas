"""Servidor local do protótipo do Closing.

Serve os arquivos do projeto e tem uma rota /api/voz que fala o texto com a voz
aprovada do ElevenLabs. A chave fica só no arquivo .env deste computador.

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


def ler_chave():
    env = RAIZ / ".env"
    if env.exists():
        for linha in env.read_text(encoding="utf-8").splitlines():
            if linha.startswith("ELEVENLABS_API_KEY="):
                return linha.split("=", 1)[1].strip()
    return os.environ.get("ELEVENLABS_API_KEY", "")


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
