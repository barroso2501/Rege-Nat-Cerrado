"""
f1_17_vies_espacial_biomas.py — Rege-Nat-Cerrado, F1, análise EXPLORATÓRIA [E]

O QUE FAZ
    Cruza o acerto do estrato E (categoria 1 = regeneração real) com a distância de
    cada ponto ao bioma vizinho mais próximo (CSV exportado pelo script GEE 16).
    Classes FIXADAS antes de ver as distâncias (2026-11-12, CHANGELOG 1.13):
      - distância ao bioma vizinho mais próximo: ≤50 km | 50–150 km | >150 km (core);
      - para pontos a ≤150 km: qual é o bioma vizinho mais próximo.
    Também mostra N e P nas mesmas classes, para contexto.
    Não muda o critério da P1 (análise feita depois da abertura da CHAVE).

ENTRADAS
    - CSV do GEE 16 (colunas: um bioma por coluna, em km; `codigo`);
    - tabela por ponto com estrato (pasta privada; sai do repositório até o fim da
      reinterpretação).

SAÍDAS
    - results/f1/criterio/p1_vies_espacial_biomas.md e .json (só agregados);
    - <pasta privada>/p1_pontos_distancia_biomas.csv (por ponto, com estrato).

COMO RODAR (da raiz do repositório)
    python src/python/f1_17_vies_espacial_biomas.py <csv_gee16> /mnt/user-data/outputs/f1_privado

O QUE PODE QUEBRAR E COMO PERCEBER
    - "Códigos não batem": o CSV do GEE não tem os 750 pontos.
    - Pontos com distância 0 a outro bioma estão fora do limite IBGE do Cerrado; o
      resumo informa quantos são.
    - Só usa a biblioteca padrão.
"""

import collections
import csv
import hashlib
import json
import math
import sys
from pathlib import Path

SAIDA = Path("results/f1/criterio")
BIOMAS = ["Amazônia", "Caatinga", "Mata Atlântica", "Pantanal", "Pampa"]
Z = 1.959964


def sha(p: Path) -> str:
    return hashlib.sha256(p.read_bytes()).hexdigest()


def wilson(k, n):
    p = k / n
    c = (p + Z * Z / (2 * n)) / (1 + Z * Z / n)
    h = Z * math.sqrt(p * (1 - p) / n + Z * Z / (4 * n * n)) / (1 + Z * Z / n)
    return p, c - h, c + h


def qui2(grupos):
    """Qui-quadrado de homogeneidade 2×k (acerto × grupo) e p-valor (via gama incompleta)."""
    k = [sum(v) for v in grupos.values()]
    n = [len(v) for v in grupos.values()]
    P = sum(k) / sum(n)
    x = sum((ki - ni * P) ** 2 / (ni * P) + ((ni - ki) - ni * (1 - P)) ** 2 / (ni * (1 - P)) for ki, ni in zip(k, n))
    gl = len(grupos) - 1
    # p = Q(gl/2, x/2) por série (suficiente para gl pequeno).
    a, t = gl / 2, x / 2
    soma, termo, i = 0.0, 1.0 / a, 0
    while termo > 1e-12 and i < 500:
        soma += termo
        i += 1
        termo *= t / (a + i)
    p_inf = soma * math.exp(-t + a * math.log(t) - math.lgamma(a)) if t > 0 else 0.0
    return x, gl, 1 - p_inf


def main(csv_gee: str, pasta_privada: str):
    gee_path = Path(csv_gee)
    privada = Path(pasta_privada)
    pontos_path = privada / "p1_pontos_com_estrato.csv"
    with gee_path.open(newline="", encoding="utf-8") as fh:
        dist = {r["codigo"]: {b: float(r[b]) for b in BIOMAS} for r in csv.DictReader(fh)}
    with pontos_path.open(newline="", encoding="utf-8") as fh:
        pontos = list(csv.DictReader(fh))
    if set(dist) != {p["codigo"] for p in pontos}:
        sys.exit("Códigos não batem entre o CSV do GEE e os pontos")

    for p in pontos:
        d = dist[p["codigo"]]
        viz = min(d, key=d.get)
        p["bioma_vizinho"], p["dist_km"] = viz, d[viz]
        p["classe_dist"] = "1: ≤50 km" if d[viz] <= 50 else ("2: 50–150 km" if d[viz] <= 150 else "3: >150 km (core)")
        p["transicao"] = viz if d[viz] <= 150 else "core (>150 km)"
        p["acerto"] = 1 if p["categoria"] == "1" else 0

    fora = sum(1 for p in pontos if p["dist_km"] == 0)

    def tabela(chave, estrato):
        g = collections.defaultdict(list)
        for p in pontos:
            if p["estrato"] == estrato:
                g[p[chave]].append(p["acerto"])
        return dict(sorted(g.items()))

    res = {"entradas": {gee_path.name: sha(gee_path)}, "pontos_fora_do_cerrado_ibge": fora, "tabelas": {}}
    L = ["# Viés espacial do erro — distância aos biomas vizinhos (EXPLORATÓRIO [E])", "",
         "Gerado por `src/python/f1_17_vies_espacial_biomas.py`. Classes fixadas antes de ver as distâncias.",
         "Acerto = categoria 1 (regeneração real). O critério da P1 não muda.", "",
         f"Pontos com distância 0 a outro bioma (fora do limite IBGE do Cerrado): {fora}.", ""]
    for chave, titulo in (("classe_dist", "Distância ao bioma vizinho mais próximo"),
                          ("transicao", "Transição (≤150 km) por bioma vizinho × core")):
        L += [f"## {titulo}", "", "| Grupo | E: acertos/n | E: acerto (IC 95%) | N: % cat. 1 (n) | P: % cat. 1 (n) |", "|---|---|---|---|---|"]
        tE, tN, tP = tabela(chave, "E"), tabela(chave, "N"), tabela(chave, "P")
        res["tabelas"][chave] = {}
        for g in sorted(set(tE) | set(tN) | set(tP)):
            e = tE.get(g, [])
            linha = {"E_n": len(e), "E_acertos": sum(e)}
            if e:
                p, lo, hi = wilson(sum(e), len(e))
                linha.update({"E_p": p, "E_ic": [lo, hi]})
                txt_e = f"{sum(e)}/{len(e)} | {100*p:.0f}% ({100*lo:.0f}–{100*hi:.0f})"
            else:
                txt_e = "0/0 | —"
            fmt = lambda v: f"{100*sum(v)/len(v):.0f}% ({len(v)})" if v else "—"
            L.append(f"| {g} | {txt_e} | {fmt(tN.get(g, []))} | {fmt(tP.get(g, []))} |")
            res["tabelas"][chave][g] = linha
        x, gl, pv = qui2({k: v for k, v in tE.items() if v})
        res["tabelas"][chave]["_qui2_E"] = {"qui2": x, "gl": gl, "p": pv}
        L += ["", f"Qui-quadrado de homogeneidade (E): χ² = {x:.2f}, gl = {gl}, p = {pv:.3f}.", ""]

    SAIDA.mkdir(parents=True, exist_ok=True)
    (SAIDA / "p1_vies_espacial_biomas.md").write_text("\n".join(L) + "\n", encoding="utf-8")
    (SAIDA / "p1_vies_espacial_biomas.json").write_text(json.dumps(res, indent=2, ensure_ascii=False), encoding="utf-8")
    with (privada / "p1_pontos_distancia_biomas.csv").open("w", newline="", encoding="utf-8") as fh:
        cols = ["codigo", "estrato", "lon", "lat", "ano_referencia_t", "categoria", "acerto", "bioma_vizinho", "dist_km",
                "classe_dist", "transicao", "ja_foi_convertida", "ja_foi_pastagem_plantada", "confianca"]
        w = csv.DictWriter(fh, fieldnames=cols, extrasaction="ignore")
        w.writeheader()
        w.writerows(pontos)
    print("\n".join(L))


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
