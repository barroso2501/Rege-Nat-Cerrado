"""
f1_10c_sortear_celulas.py — Rege-Nat-Cerrado, F1, amostra P1 (passo C de 4)

O QUE FAZ
    Lê o CSV do passo B (células de ~1 km com frações de E e P por ano) e, para
    cada ano t e estrato (E: 400 células, P: 100 células), sorteia células SEM
    reposição com probabilidade proporcional à fração (= número de pixels
    elegíveis na célula), pelo método de Efraimidis–Spirakis, semente 20261030.
    Em seguida GERA o script GEE do passo D (src/gee/10d_f1_pixel_por_celula.js)
    com a lista de células embutida — sem upload de asset e versionado no git.

    Por que é equivalente a sorteio aleatório simples de pixels dentro do estrato:
    P(pixel) = P(célula) × 1/n(célula), e P(célula) ∝ n(célula). O sorteio sem
    reposição desvia muito pouco disso quando o número de células é grande.

COMO RODAR (da raiz do repositório)
    python src/python/f1_10c_sortear_celulas.py data/f1_candidatos/F1_10b_celulas_candidatas.csv

O QUE PODE QUEBRAR E COMO PERCEBER
    - "Células insuficientes": um estrato tem menos células que o pedido num ano.
      O script usa todas e avisa; registre no CHANGELOG.
    - Só usa a biblioteca padrão.
"""

import csv
import hashlib
import json
import random
import sys
from pathlib import Path

SEMENTE = 20261030
ANOS = [2017, 2018, 2019, 2020, 2021]
N_CELULAS = {"E": 400, "P": 100}
SAIDA_JS = Path("src/gee/10d_f1_pixel_por_celula.js")
REGISTRO = Path("results/f1/amostra_p1_passoC_registro.json")
MODELO_JS = Path("src/gee/10d_modelo.js.txt")


def main(caminho):
    entrada = Path(caminho)
    with entrada.open(newline="", encoding="utf-8") as fh:
        celulas = list(csv.DictReader(fh))
    # Ordenação estável antes do sorteio: o resultado não depende da ordem do CSV.
    celulas.sort(key=lambda r: (float(r["lon"]), float(r["lat"])))
    rng = random.Random(SEMENTE)

    escolhidas, avisos, contagem = [], [], {}
    for t in ANOS:
        for est, n in N_CELULAS.items():
            col = f"{est}_{t}"
            pesos = [(r, float(r[col] or 0)) for r in celulas]
            pesos = [(r, w) for r, w in pesos if w > 0]
            # Efraimidis–Spirakis: chave = u^(1/w); as n maiores chaves formam a amostra.
            chaves = sorted(((rng.random() ** (1.0 / w), r) for r, w in pesos),
                            key=lambda x: x[0], reverse=True)
            sel = chaves[:n]
            if len(sel) < n:
                avisos.append(f"{col}: {len(pesos)} células com fração > 0; pedido {n}")
            for _, r in sel:
                escolhidas.append({"ano": t, "estrato": est, "lon": float(r["lon"]),
                                   "lat": float(r["lat"]), "meio": float(r["meio_lado_graus"])})
            contagem[col] = {"celulas_com_fracao": len(pesos), "sorteadas": len(sel)}

    # Gera o script GEE do passo D com a lista embutida.
    linhas = ",\n".join(
        f"  [{c['ano']}, '{c['estrato']}', {c['lon']:.7f}, {c['lat']:.7f}, {c['meio']:.9f}]" for c in escolhidas)
    js = MODELO_JS.read_text(encoding="utf-8").replace("/*__CELULAS__*/", linhas)
    SAIDA_JS.write_text(js, encoding="utf-8")

    REGISTRO.parent.mkdir(parents=True, exist_ok=True)
    REGISTRO.write_text(json.dumps({
        "semente": SEMENTE, "n_celulas": N_CELULAS,
        "entrada": {entrada.name: hashlib.sha256(entrada.read_bytes()).hexdigest()},
        "saida_js": {SAIDA_JS.name: hashlib.sha256(SAIDA_JS.read_bytes()).hexdigest()},
        "contagem": contagem, "avisos": avisos}, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"{len(escolhidas)} células sorteadas → {SAIDA_JS}")
    for a in avisos:
        print("AVISO:", a)


if __name__ == "__main__":
    main(sys.argv[1])
