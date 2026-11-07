"""
f1_14_preparar_reinterpretacao.py — Rege-Nat-Cerrado, F1, consistência (plano P1 §4)

O QUE FAZ
    Prepara a reinterpretação cega de 10% (75 pontos), sorteados em F1_11 e marcados
    na CHAVE (coluna `reinterpretar`).
      1. Confere o hash da CHAVE contra results/f1/amostra_p1_registro.json.
      2. Lê da CHAVE SÓ as colunas `codigo` e `reinterpretar`. Estrato e região não
         são lidos nem impressos.
      3. Embaralha os 75 pontos (semente fixa) e dá códigos novos R01…R75, para que a
         ordem e o código não lembrem a primeira interpretação.
      4. Escreve:
         - results/f1/reinterpretacao/amostra_p1_reinterpretacao.csv (o que o intérprete
           preenche: R-código, lon, lat, t e colunas em branco);
         - src/gee/14_ferramenta_reinterpretacao_p1.js (mesma ferramenta da 1ª rodada,
           sem lon/lat no painel);
         - <pasta privada>/reinterp_mapa_R_P.csv (R → P). FORA do repositório: com ele
           o intérprete acharia a própria resposta anterior;
         - results/f1/reinterpretacao/reinterp_registro.json (semente, hashes, data mínima).

COMO RODAR (da raiz do repositório)
    python src/python/f1_14_preparar_reinterpretacao.py /mnt/user-data/outputs/f1_privado/amostra_p1_CHAVE.csv /mnt/user-data/outputs/f1_privado

O QUE PODE QUEBRAR E COMO PERCEBER
    - "Hash da CHAVE não confere": a CHAVE mudou desde o sorteio. Pare e investigue.
    - "Esperava 75 pontos": a coluna `reinterpretar` não tem 75 marcações.
    - "Trecho do modelo não encontrado": o modelo da ferramenta (12_modelo...) mudou;
      ajuste os textos em TROCAS.
    - Só usa a biblioteca padrão.
"""

import csv
import hashlib
import json
import random
import sys
from pathlib import Path

SEMENTE = 20261107
DATA_MINIMA = "2026-11-21"   # ≥14 dias depois do último dia da 1ª rodada (2026-11-07)
REGISTRO_F1 = Path("results/f1/amostra_p1_registro.json")
ORIGINAL = Path("results/f1/amostra_p1_interpretacao.csv")
MODELO = Path("src/gee/12_modelo_ferramenta_interpretacao.js.txt")
SAIDA_GEE = Path("src/gee/14_ferramenta_reinterpretacao_p1.js")
PASTA = Path("results/f1/reinterpretacao")

# Textos do modelo trocados para a 2ª rodada. Cada um precisa existir no modelo.
TROCAS = [
    ("12_ferramenta_interpretacao_p1.js — Rege-Nat-Cerrado, F1, validação visual (P1)",
     "14_ferramenta_reinterpretacao_p1.js — Rege-Nat-Cerrado, F1, REINTERPRETAÇÃO CEGA (P1 §4)"),
    ("GERADO por src/python/f1_12_gerar_ferramenta.py a partir de\n * results/f1/amostra_p1_interpretacao.csv (sem estrato)",
     "GERADO por src/python/f1_14_preparar_reinterpretacao.py a partir de\n * results/f1/reinterpretacao/amostra_p1_reinterpretacao.csv (sem estrato)"),
    ("Escolha o código (P001…P750)", "Escolha o código (R01…R75)"),
    ("Registre na planilha amostra_p1_interpretacao.csv", "Registre na planilha amostra_p1_reinterpretacao.csv"),
    ("'Validação visual P1 — Rege-Nat-Cerrado'", "'Reinterpretação cega P1 — Rege-Nat-Cerrado (não consulte a 1ª rodada)'"),
    # Sem coordenadas no painel: reduz a chance de reconhecer o ponto pela 1ª planilha.
    ("'  ·  lon ' + lon.toFixed(5) + ', lat ' + lat.toFixed(5) +\n                ", ""),
]


def sha(p: Path) -> str:
    return hashlib.sha256(p.read_bytes()).hexdigest()


def main(chave_arq: str, pasta_privada: str):
    chave_path, privada = Path(chave_arq), Path(pasta_privada)
    esperado = json.loads(REGISTRO_F1.read_text(encoding="utf-8"))["saidas"]["amostra_p1_CHAVE.csv"]
    if sha(chave_path) != esperado:
        sys.exit("Hash da CHAVE não confere com amostra_p1_registro.json")

    # Só codigo e reinterpretar; o resto da linha é descartado na leitura.
    with chave_path.open(newline="", encoding="utf-8") as fh:
        marcados = sorted(r["codigo"] for r in csv.DictReader(fh) if r["reinterpretar"] == "1")
    if len(marcados) != 75:
        sys.exit(f"Esperava 75 pontos para reinterpretação, encontrei {len(marcados)}")

    with ORIGINAL.open(newline="", encoding="utf-8") as fh:
        pontos = {r["codigo"]: r for r in csv.DictReader(fh)}

    rng = random.Random(SEMENTE)
    ordem = marcados[:]
    rng.shuffle(ordem)
    mapa = [(f"R{i:02d}", p) for i, p in enumerate(ordem, start=1)]

    PASTA.mkdir(parents=True, exist_ok=True)
    planilha = PASTA / "amostra_p1_reinterpretacao.csv"
    with planilha.open("w", newline="", encoding="utf-8") as fh:
        w = csv.writer(fh)
        w.writerow(["codigo", "lon", "lat", "ano_referencia_t", "categoria", "confianca", "imagens_usadas",
                    "ja_foi_convertida", "ja_foi_pastagem_plantada", "comentario", "data_interpretacao"])
        for r_cod, p in mapa:
            o = pontos[p]
            w.writerow([r_cod, o["lon"], o["lat"], o["ano_referencia_t"], "", "", "", "", "", "", ""])

    privada.mkdir(parents=True, exist_ok=True)
    mapa_arq = privada / "reinterp_mapa_R_P.csv"
    with mapa_arq.open("w", newline="", encoding="utf-8") as fh:
        w = csv.writer(fh)
        w.writerow(["codigo_R", "codigo_P"])
        w.writerows(mapa)

    # Ferramenta GEE: mesmo modelo da 1ª rodada, com as trocas acima.
    modelo = MODELO.read_text(encoding="utf-8")
    for velho, novo in TROCAS:
        if velho not in modelo:
            sys.exit(f"Trecho do modelo não encontrado: {velho[:60]}…")
        modelo = modelo.replace(velho, novo)
    lista = ",\n".join(f"  ['{r_cod}', {pontos[p]['lon']}, {pontos[p]['lat']}, {int(pontos[p]['ano_referencia_t'])}]"
                       for r_cod, p in mapa)
    SAIDA_GEE.write_text(modelo.replace("/*__PONTOS__*/", lista), encoding="utf-8")

    reg = {"semente": SEMENTE, "n": len(mapa), "data_minima_inicio": DATA_MINIMA,
           "entradas": {"amostra_p1_CHAVE.csv (só codigo/reinterpretar)": sha(chave_path), ORIGINAL.name: sha(ORIGINAL)},
           "saidas": {planilha.name: sha(planilha), SAIDA_GEE.name: sha(SAIDA_GEE),
                      "reinterp_mapa_R_P.csv (privado)": sha(mapa_arq)}}
    (PASTA / "reinterp_registro.json").write_text(json.dumps(reg, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"{len(mapa)} pontos → {planilha} | ferramenta → {SAIDA_GEE} | mapa privado → {mapa_arq}")


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
