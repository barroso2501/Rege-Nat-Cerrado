"""
f1_12_gerar_ferramenta.py — Rege-Nat-Cerrado, F1

O QUE FAZ
    Gera src/gee/12_ferramenta_interpretacao_p1.js embutindo a lista de pontos de
    results/f1/amostra_p1_interpretacao.csv (código, lon, lat, t — SEM estrato)
    no modelo src/gee/12_modelo_ferramenta_interpretacao.js.txt.
    O script gerado pode ir para o GitHub: não revela o estrato.

COMO RODAR (da raiz do repositório)
    python src/python/f1_12_gerar_ferramenta.py

O QUE PODE QUEBRAR E COMO PERCEBER
    - FileNotFoundError: rode antes o f1_11_selecionar_amostra_p1.py.
"""

import csv
from pathlib import Path

ENTRADA = Path("results/f1/amostra_p1_interpretacao.csv")
MODELO = Path("src/gee/12_modelo_ferramenta_interpretacao.js.txt")
SAIDA = Path("src/gee/12_ferramenta_interpretacao_p1.js")

with ENTRADA.open(newline="", encoding="utf-8") as fh:
    linhas = list(csv.DictReader(fh))
pontos = ",\n".join(f"  ['{r['codigo']}', {r['lon']}, {r['lat']}, {int(r['ano_referencia_t'])}]" for r in linhas)
SAIDA.write_text(MODELO.read_text(encoding="utf-8").replace("/*__PONTOS__*/", pontos), encoding="utf-8")
print(f"{len(linhas)} pontos → {SAIDA}")
