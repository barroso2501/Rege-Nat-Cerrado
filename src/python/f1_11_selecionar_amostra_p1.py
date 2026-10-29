"""
f1_11_selecionar_amostra_p1.py — Rege-Nat-Cerrado, fase F1, passo 2 de 2

O QUE FAZ (docs/plano_validacao_P1.md §1, §2 e §4)
    A partir dos candidatos exportados pelo script GEE 10 (5 CSVs, um por ano):
      1. sorteia, por ano, 100 pontos E, 30 N e 20 P (750 no total), em ordem
         aleatória com semente fixa, respeitando a distância mínima de 500 m entre
         QUALQUER par de pontos da amostra;
      2. embaralha os 750 pontos e atribui um código neutro (P001…P750);
      3. sorteia 75 pontos (10%) para a reinterpretação cega;
      4. escreve dois arquivos:
         - amostra_p1_interpretacao.csv — o que o intérprete vê: código, lon, lat,
           ano de referência t. SEM estrato.
         - amostra_p1_CHAVE.csv — código → estrato, região e flag de reinterpretação.
           NÃO abrir até terminar a interpretação (ver README de results/f1/).
      5. registra os hashes das entradas e saídas e as contagens (tabela de atrito).

COMO RODAR (da raiz do repositório)
    python src/python/f1_11_selecionar_amostra_p1.py data/f1_candidatos/F1_10_candidatos_*.csv

O QUE PODE QUEBRAR E COMO PERCEBER
    - "Faltam pontos": um estrato não teve candidatos suficientes num ano depois da
      distância mínima. O script para; avise-me (a solução é exportar mais candidatos
      naquele ano, registrando em docs/desvios.md).
    - Só usa a biblioteca padrão.
"""

import csv
import hashlib
import json
import math
import random
import sys
from pathlib import Path

SEMENTE = 20261030
N_POR_ANO = {"1": 100, "2": 30, "3": 20}          # E, N, P
NOME = {"1": "E", "2": "N", "3": "P"}
DIST_MIN_M = 500.0
FRACAO_REINTERP = 0.10
SAIDA = Path("results/f1")


def haversine_m(a, b):
    """Distância em metros entre (lon, lat) a e b."""
    lon1, lat1, lon2, lat2 = map(math.radians, (a[0], a[1], b[0], b[1]))
    h = math.sin((lat2 - lat1) / 2) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin((lon2 - lon1) / 2) ** 2
    return 2 * 6371008.8 * math.asin(math.sqrt(h))


def sha(p: Path) -> str:
    return hashlib.sha256(p.read_bytes()).hexdigest()


def main(arquivos):
    rng = random.Random(SEMENTE)
    entradas = [Path(a) for a in sorted(arquivos)]
    candidatos = []
    for p in entradas:
        with p.open(newline="", encoding="utf-8") as fh:
            for r in csv.DictReader(fh):
                if r["zona"] == "1":          # salvaguarda: nunca usar holdout
                    continue
                candidatos.append({"ano": str(int(float(r["ano"]))), "estrato": str(int(float(r["estrato"]))),
                                   "lon": float(r["lon"]), "lat": float(r["lat"]),
                                   "regiao": str(int(float(r["regiao"]))) if r["regiao"] else ""})

    # Ordem aleatória reprodutível dos candidatos (ordena antes, para não depender da ordem do CSV).
    candidatos.sort(key=lambda c: (c["ano"], c["estrato"], c["lon"], c["lat"]))
    rng.shuffle(candidatos)

    escolhidos, atrito = [], {}
    contagem = {}
    for c in candidatos:
        chave = (c["ano"], c["estrato"])
        atrito.setdefault(chave, {"candidatos": 0, "descartados_distancia": 0, "selecionados": 0})
        atrito[chave]["candidatos"] += 1
        if contagem.get(chave, 0) >= N_POR_ANO[c["estrato"]]:
            continue
        if any(haversine_m((c["lon"], c["lat"]), (e["lon"], e["lat"])) < DIST_MIN_M for e in escolhidos):
            atrito[chave]["descartados_distancia"] += 1
            continue
        escolhidos.append(c)
        contagem[chave] = contagem.get(chave, 0) + 1
        atrito[chave]["selecionados"] += 1

    faltas = [(a, NOME[e], N_POR_ANO[e] - contagem.get((a, e), 0))
              for a in sorted({c["ano"] for c in candidatos}) for e in N_POR_ANO
              if contagem.get((a, e), 0) < N_POR_ANO[e]]
    if faltas:
        sys.exit(f"Faltam pontos (ano, estrato, quantos): {faltas}")

    # Embaralha a amostra final e atribui códigos neutros.
    rng.shuffle(escolhidos)
    for i, c in enumerate(escolhidos, start=1):
        c["codigo"] = f"P{i:03d}"
    reinterp = set(rng.sample([c["codigo"] for c in escolhidos], round(FRACAO_REINTERP * len(escolhidos))))

    SAIDA.mkdir(parents=True, exist_ok=True)
    interp = SAIDA / "amostra_p1_interpretacao.csv"
    with interp.open("w", newline="", encoding="utf-8") as fh:
        w = csv.writer(fh)
        w.writerow(["codigo", "lon", "lat", "ano_referencia_t", "categoria", "confianca", "imagens_usadas", "comentario"])
        for c in escolhidos:
            w.writerow([c["codigo"], f"{c['lon']:.6f}", f"{c['lat']:.6f}", c["ano"], "", "", "", ""])

    chave_arq = SAIDA / "amostra_p1_CHAVE.csv"
    with chave_arq.open("w", newline="", encoding="utf-8") as fh:
        w = csv.writer(fh)
        w.writerow(["codigo", "ano", "estrato", "regiao", "reinterpretar"])
        for c in sorted(escolhidos, key=lambda c: c["codigo"]):
            w.writerow([c["codigo"], c["ano"], NOME[c["estrato"]], c["regiao"], int(c["codigo"] in reinterp)])

    reg = {
        "semente": SEMENTE, "distancia_minima_m": DIST_MIN_M, "n_por_ano": {NOME[k]: v for k, v in N_POR_ANO.items()},
        "entradas": {p.name: sha(p) for p in entradas},
        "saidas": {interp.name: sha(interp), chave_arq.name: sha(chave_arq)},
        "atrito": [{"ano": a, "estrato": NOME[e], **v} for (a, e), v in sorted(atrito.items())],
        "n_total": len(escolhidos), "n_reinterpretacao": len(reinterp),
    }
    (SAIDA / "amostra_p1_registro.json").write_text(json.dumps(reg, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"Amostra: {len(escolhidos)} pontos; reinterpretação: {len(reinterp)}.")
    print("Interpretação:", interp, "| registro: results/f1/amostra_p1_registro.json")
    print("NÃO abra", chave_arq.name, "antes de terminar a interpretação.")


if __name__ == "__main__":
    main(sys.argv[1:])
