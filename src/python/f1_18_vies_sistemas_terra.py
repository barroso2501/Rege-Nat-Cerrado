"""
f1_18_vies_sistemas_terra.py — Rege-Nat-Cerrado, F1, análise EXPLORATÓRIA [E]

O QUE FAZ
    Cruza o acerto do estrato E (categoria 1 = regeneração real) com as paisagens do
    mapa de sistemas de terras preparado por Mario (ST_landscape_wgs84; referência:
    Silva et al. 2006, J. Biogeogr. 33:536–548, a partir de Cochrane et al. 1985).
    Junta pontos e polígonos localmente (point-in-polygon), sem GEE.

    Agrupamentos FIXADOS antes da junção (2026-11-12), a partir só dos nomes das 19
    classes do campo LANDSCAPE:
      RELEVO  — colinoso ("Hilly", "Well drained hilly"); plano/chapada ("Plains",
                "Well drained plains", "Isolated chapada"); baixada ("Floodplains",
                "Lowland depression").
      MATRIZ  — savânica (nome contém "savanna"); florestal/caatinga (forest,
                woodland caatinga); ecotonal (nome contém "ecotonal").
    Hipótese de Mario (gerada DURANTE a interpretação destes mesmos pontos, portanto
    não é teste independente): pior acerto em terreno colinoso de matriz savânica
    (cerrado aberto, solo raso, fogo) e em matriz florestal (ex.: Cocais do MA).

ENTRADAS
    - shapefile ST_landscape_wgs84 (EPSG:4326, campos LANDSCAPE e COD_LANDS);
    - <pasta privada>/p1_pontos_com_estrato.csv.

SAÍDAS
    - results/f1/criterio/p1_vies_sistemas_terra.md e .json (só agregados);
    - <pasta privada>/p1_pontos_sistemas_terra.csv (por ponto, com estrato).

COMO RODAR (da raiz do repositório)
    python src/python/f1_18_vies_sistemas_terra.py <ST_landscape_wgs84.shp> /mnt/user-data/outputs/f1_privado

O QUE PODE QUEBRAR E COMO PERCEBER
    - Geometrias inválidas no shapefile: corrigidas com make_valid (o resumo informa).
    - Ponto em dois polígonos (sobreposição): fica o de menor OBJECTID; o resumo conta.
    - Ponto fora de todos: classe "sem classe".
    - Requer geopandas (pip install geopandas).
"""

import collections
import csv
import hashlib
import json
import math
import sys
from pathlib import Path

import geopandas as gpd

SAIDA = Path("results/f1/criterio")
Z = 1.959964


def sha(p: Path) -> str:
    return hashlib.sha256(p.read_bytes()).hexdigest()


def relevo(nome):
    if nome.startswith(("Hilly", "Well drained hilly")):
        return "colinoso"
    if nome.startswith(("Plains", "Well drained plains", "Isolated chapada")):
        return "plano/chapada"
    if nome.startswith(("Floodplains", "Lowland depression")):
        return "baixada"
    return "sem classe"


def matriz(nome):
    n = nome.lower()
    if "ecotonal" in n:
        return "ecotonal"
    if "savanna" in n:
        return "savânica"
    if any(k in n for k in ("forest", "caatinga", "woodland")):
        return "florestal/caatinga"
    return "sem classe"


def wilson(k, n):
    p = k / n
    c = (p + Z * Z / (2 * n)) / (1 + Z * Z / n)
    h = Z * math.sqrt(p * (1 - p) / n + Z * Z / (4 * n * n)) / (1 + Z * Z / n)
    return p, c - h, c + h


def qui2(grupos):
    """Qui-quadrado de homogeneidade 2×k e p-valor (gama incompleta por série)."""
    k = [sum(v) for v in grupos.values()]
    n = [len(v) for v in grupos.values()]
    P = sum(k) / sum(n)
    x = sum((ki - ni * P) ** 2 / (ni * P) + ((ni - ki) - ni * (1 - P)) ** 2 / (ni * (1 - P)) for ki, ni in zip(k, n))
    gl = len(grupos) - 1
    a, t = gl / 2, x / 2
    soma, termo, i = 0.0, 1.0 / a, 0
    while termo > 1e-12 and i < 500:
        soma += termo
        i += 1
        termo *= t / (a + i)
    return x, gl, 1 - (soma * math.exp(-t + a * math.log(t) - math.lgamma(a)) if t > 0 else 0.0)


def main(shp: str, pasta_privada: str):
    shp_path, privada = Path(shp), Path(pasta_privada)
    st = gpd.read_file(shp_path)
    invalidas = int((~st.geometry.is_valid).sum())
    st["geometry"] = st.geometry.make_valid()

    with (privada / "p1_pontos_com_estrato.csv").open(newline="", encoding="utf-8") as fh:
        pontos = list(csv.DictReader(fh))
    pts = gpd.GeoDataFrame(pontos, geometry=gpd.points_from_xy([float(p["lon"]) for p in pontos],
                                                                [float(p["lat"]) for p in pontos]), crs="EPSG:4326")
    j = gpd.sjoin(pts, st[["OBJECTID", "LANDSCAPE", "COD_LANDS", "geometry"]], how="left", predicate="within")
    multiplos = int(j.duplicated("codigo").sum())
    j = j.sort_values(["codigo", "OBJECTID"]).drop_duplicates("codigo")
    por_cod = {r.codigo: (r.LANDSCAPE if isinstance(r.LANDSCAPE, str) else "sem classe") for r in j.itertuples()}

    for p in pontos:
        p["paisagem"] = por_cod[p["codigo"]]
        p["relevo"], p["matriz"] = relevo(p["paisagem"]), matriz(p["paisagem"])
        p["relevo_matriz"] = f"{p['relevo']} · {p['matriz']}"
        p["acerto"] = 1 if p["categoria"] == "1" else 0
    sem = sum(1 for p in pontos if p["paisagem"] == "sem classe")

    res = {"entradas": {shp_path.name: sha(shp_path)}, "geometrias_invalidas_corrigidas": invalidas,
           "pontos_em_mais_de_um_poligono": multiplos, "pontos_sem_classe": sem, "tabelas": {}}
    L = ["# Viés espacial do erro — sistemas de terras (EXPLORATÓRIO [E])", "",
         "Gerado por `src/python/f1_18_vies_sistemas_terra.py`. Mapa: ST_landscape_wgs84 (Mario; ref. Silva et al. 2006).",
         "Acerto = categoria 1. Agrupamentos de relevo e matriz fixados antes da junção. O critério da P1 não muda.",
         "**A hipótese testada nasceu da interpretação destes mesmos pontos: o resultado gera hipótese, não a confirma.**", "",
         f"Geometrias inválidas corrigidas: {invalidas}. Pontos em mais de um polígono: {multiplos}. Pontos sem classe: {sem}.", ""]
    for chave, titulo in (("relevo", "Relevo"), ("matriz", "Matriz de vegetação"),
                          ("relevo_matriz", "Relevo × matriz"), ("paisagem", "Paisagem (19 classes; n pequeno)")):
        g = {e: collections.defaultdict(list) for e in "ENP"}
        nao_plant = collections.defaultdict(lambda: [0, 0])
        for p in pontos:
            g[p["estrato"]][p[chave]].append(p["acerto"])
            if p["estrato"] == "E" and p["acerto"] == 0:
                nao_plant[p[chave]][1] += 1
                nao_plant[p[chave]][0] += p["ja_foi_pastagem_plantada"] == "não"
        L += [f"## {titulo}", "",
              "| Grupo | E: acertos/n | E: acerto (IC 95%) | E erros: 'nunca pastagem plantada' | N: % cat. 1 (n) | P: % cat. 1 (n) |",
              "|---|---|---|---|---|---|"]
        res["tabelas"][chave] = {}
        for k in sorted(set(g["E"]) | set(g["N"]) | set(g["P"]), key=lambda k: -len(g["E"].get(k, []))):
            e = g["E"].get(k, [])
            if e:
                p_, lo, hi = wilson(sum(e), len(e))
                te = f"{sum(e)}/{len(e)} | {100*p_:.0f}% ({100*lo:.0f}–{100*hi:.0f})"
                res["tabelas"][chave][k] = {"E_n": len(e), "E_acertos": sum(e), "E_p": p_, "E_ic": [lo, hi]}
            else:
                te = "0/0 | —"
            npl = nao_plant.get(k, [0, 0])
            tn = f"{npl[0]}/{npl[1]}" if npl[1] else "—"
            fmt = lambda v: f"{100*sum(v)/len(v):.0f}% ({len(v)})" if v else "—"
            L.append(f"| {k} | {te} | {tn} | {fmt(g['N'].get(k, []))} | {fmt(g['P'].get(k, []))} |")
        if chave != "paisagem":
            grupos = {k: v for k, v in g["E"].items() if len(v) >= 5}
            x, gl, pv = qui2(grupos)
            res["tabelas"][chave]["_qui2_E_grupos_n>=5"] = {"qui2": x, "gl": gl, "p": pv}
            L += ["", f"Qui-quadrado (E, grupos com n ≥ 5): χ² = {x:.2f}, gl = {gl}, p = {pv:.3f}."]
        L.append("")

    SAIDA.mkdir(parents=True, exist_ok=True)
    (SAIDA / "p1_vies_sistemas_terra.md").write_text("\n".join(L) + "\n", encoding="utf-8")
    (SAIDA / "p1_vies_sistemas_terra.json").write_text(json.dumps(res, indent=2, ensure_ascii=False), encoding="utf-8")
    with (privada / "p1_pontos_sistemas_terra.csv").open("w", newline="", encoding="utf-8") as fh:
        cols = ["codigo", "estrato", "lon", "lat", "categoria", "acerto", "paisagem", "relevo", "matriz",
                "ja_foi_convertida", "ja_foi_pastagem_plantada", "comentario"]
        w = csv.DictWriter(fh, fieldnames=cols, extrasaction="ignore")
        w.writeheader()
        w.writerows(pontos)
    print("\n".join(L))


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
