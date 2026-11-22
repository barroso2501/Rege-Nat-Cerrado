"""
f1_21_consistencia_reinterpretacao.py — Rege-Nat-Cerrado, F1, consistência intra-intérprete

O QUE FAZ (plano P1 §4; desvios de 2026-11-07 e 2026-11-12)
    1. Confere o hash do mapa R → P contra results/f1/reinterpretacao/reinterp_registro.json
       e confere que os 75 códigos, coordenadas e anos t batem com a planilha gerada.
    2. Compara a categoria da 2ª rodada com a da 1ª (`categoria_bruta`, saída crua do
       intérprete; a `categoria` corrigida entra como conferência).
    3. Calcula a concordância e o kappa de Cohen (IC 95% por bootstrap):
         - 4 categorias (1, 2, 3, 4);
         - binário (1 × não 1), que é o que entra no critério da P1.
    4. Detalha:
         - matriz de confusão 1ª × 2ª rodada;
         - direção das mudanças (1 → não 1; não 1 → 1);
         - por fase da 1ª interpretação (P001–100, P101–399, P400–750; relato de Mario);
         - por estrato (agregado; a CHAVE já foi aberta);
         - acerto de E na 1ª e na 2ª rodada, só nos pontos E reinterpretados.
    5. Escreve:
         - results/f1/criterio/p1_consistencia.md e .json (só agregados);
         - <pasta privada>/p1_reinterp_comparacao.csv (por ponto, com estrato).

COMO RODAR (da raiz do repositório)
    python src/python/f1_21_consistencia_reinterpretacao.py results/f1/reinterpretacao/p1_reinterpretacao_bruta_2026-11-22.csv /mnt/user-data/outputs/f1_privado

O QUE PODE QUEBRAR E COMO PERCEBER
    - "Hash do mapa não confere": o mapa R → P mudou desde a preparação. Pare.
    - "Divergência": a planilha da 2ª rodada tem códigos/coordenadas diferentes.
    - "Categoria fora de 1–4": valor inesperado na 2ª rodada.
    - Só usa a biblioteca padrão.
"""

import collections
import csv
import hashlib
import json
import random
import sys
from pathlib import Path

REG_REINTERP = Path("results/f1/reinterpretacao/reinterp_registro.json")
PLANILHA_R = Path("results/f1/reinterpretacao/amostra_p1_reinterpretacao.csv")
SAIDA = Path("results/f1/criterio")
CATS = ["1", "2", "3", "4"]
SEMENTE, N_BOOT = 20261122, 10000


def sha(p: Path) -> str:
    return hashlib.sha256(p.read_bytes()).hexdigest()


def ler(p: Path):
    with p.open(newline="", encoding="utf-8") as fh:
        return list(csv.DictReader(fh))


def kappa(a, b, cats):
    n = len(a)
    po = sum(x == y for x, y in zip(a, b)) / n
    ca, cb = collections.Counter(a), collections.Counter(b)
    pe = sum(ca[c] * cb[c] for c in cats) / (n * n)
    return po, (po - pe) / (1 - pe) if pe < 1 else float("nan")


def ic_boot(a, b, cats, rng):
    idx = list(range(len(a)))
    ks = []
    for _ in range(N_BOOT):
        s = [rng.choice(idx) for _ in idx]
        k = kappa([a[i] for i in s], [b[i] for i in s], cats)[1]
        if k == k:
            ks.append(k)
    ks.sort()
    return ks[int(0.025 * len(ks))], ks[int(0.975 * len(ks)) - 1]


def fase(codigo):
    i = int(codigo[1:])
    return "P001–100 (frouxo)" if i <= 100 else ("P101–399 (transição)" if i <= 399 else "P400–750 (consistente)")


def main(arq_r: str, pasta_privada: str):
    r_path, priv = Path(arq_r), Path(pasta_privada)
    mapa_path = priv / "reinterp_mapa_R_P.csv"
    esperado = json.loads(REG_REINTERP.read_text(encoding="utf-8"))["saidas"]["reinterp_mapa_R_P.csv (privado)"]
    if sha(mapa_path) != esperado:
        sys.exit("Hash do mapa R → P não confere")
    mapa = {r["codigo_R"]: r["codigo_P"] for r in ler(mapa_path)}
    gerada = {r["codigo"]: r for r in ler(PLANILHA_R)}
    seg = ler(r_path)
    div = [r["codigo"] for r in seg if r["codigo"] not in gerada
           or abs(float(r["lon"]) - float(gerada[r["codigo"]]["lon"])) > 1e-6
           or abs(float(r["lat"]) - float(gerada[r["codigo"]]["lat"])) > 1e-6
           or r["ano_referencia_t"] != gerada[r["codigo"]]["ano_referencia_t"]]
    if div or len(seg) != 75:
        sys.exit(f"Divergência: {div} | n = {len(seg)}")
    fora = [r["codigo"] for r in seg if r["categoria"].strip() not in CATS]
    if fora:
        sys.exit(f"Categoria fora de 1–4: {fora}")

    prim = {r["codigo"]: r for r in ler(priv / "p1_pontos_com_estrato.csv")}
    linhas = []
    for r in seg:
        p = prim[mapa[r["codigo"]]]
        linhas.append({"codigo_R": r["codigo"], "codigo_P": p["codigo"], "estrato": p["estrato"],
                       "fase_1a_rodada": fase(p["codigo"]),
                       "cat_1a_bruta": p["categoria_bruta"], "cat_1a_principal": p["categoria"],
                       "cat_2a": r["categoria"].strip(),
                       "conf_1a": p["confianca"], "conf_2a": r["confianca"].strip(),
                       "coment_1a": p["comentario"], "coment_2a": r["comentario"]})

    rng = random.Random(SEMENTE)
    a = [l["cat_1a_bruta"] for l in linhas]
    b = [l["cat_2a"] for l in linhas]
    ab = ["1" if x == "1" else "n" for x in a]
    bb = ["1" if x == "1" else "n" for x in b]
    po4, k4 = kappa(a, b, CATS)
    po2, k2 = kappa(ab, bb, ["1", "n"])
    ic4, ic2 = ic_boot(a, b, CATS, rng), ic_boot(ab, bb, ["1", "n"], rng)
    pc, kc = kappa([l["cat_1a_principal"] for l in linhas], b, CATS)
    conf = {c1: {c2: sum(1 for x, y in zip(a, b) if x == c1 and y == c2) for c2 in CATS} for c1 in CATS}
    dir_ = {"1→não1": sum(1 for x, y in zip(ab, bb) if x == "1" and y == "n"),
            "não1→1": sum(1 for x, y in zip(ab, bb) if x == "n" and y == "1")}

    def grupo(ch):
        g = collections.defaultdict(list)
        for l in linhas:
            g[l[ch]].append(l)
        out = {}
        for k, v in sorted(g.items()):
            x = ["1" if l["cat_1a_bruta"] == "1" else "n" for l in v]
            y = ["1" if l["cat_2a"] == "1" else "n" for l in v]
            out[k] = {"n": len(v), "concordancia_binaria": sum(i == j for i, j in zip(x, y)) / len(v),
                      "1→não1": sum(1 for i, j in zip(x, y) if i == "1" and j == "n"),
                      "não1→1": sum(1 for i, j in zip(x, y) if i == "n" and j == "1"),
                      "prop1_1a": x.count("1") / len(v), "prop1_2a": y.count("1") / len(v)}
        return out

    por_fase, por_estrato = grupo("fase_1a_rodada"), grupo("estrato")
    res = {"entradas": {r_path.name: sha(r_path), "reinterp_mapa_R_P.csv (privado)": sha(mapa_path)},
           "n": len(linhas),
           "quatro_categorias": {"concordancia": po4, "kappa": k4, "kappa_ic95_bootstrap": ic4},
           "binario_1_vs_nao1": {"concordancia": po2, "kappa": k2, "kappa_ic95_bootstrap": ic2},
           "conferencia_com_categoria_principal": {"concordancia": pc, "kappa": kc},
           "matriz_confusao_1a_x_2a": conf, "direcao": dir_,
           "por_fase_1a_rodada": por_fase, "por_estrato": por_estrato}
    SAIDA.mkdir(parents=True, exist_ok=True)
    (SAIDA / "p1_consistencia.json").write_text(json.dumps(res, indent=2, ensure_ascii=False), encoding="utf-8")

    f = lambda x: f"{100 * x:.0f}%"
    L = ["# P1 — Consistência intra-intérprete (reinterpretação cega de 75 pontos)", "",
         "Gerado por `src/python/f1_21_consistencia_reinterpretacao.py`. 1ª rodada = `categoria_bruta`.",
         "", "| Medida | Concordância | Kappa (IC 95% bootstrap) |", "|---|---|---|",
         f"| 4 categorias | {f(po4)} | {k4:.2f} ({ic4[0]:.2f}–{ic4[1]:.2f}) |",
         f"| Binário (1 × não 1) | {f(po2)} | {k2:.2f} ({ic2[0]:.2f}–{ic2[1]:.2f}) |", "",
         f"Direção das mudanças (binário): 1 → não 1 = {dir_['1→não1']}; não 1 → 1 = {dir_['não1→1']}.", "",
         "## Matriz de confusão (linhas = 1ª rodada; colunas = 2ª)", "", "| | 1 | 2 | 3 | 4 |", "|---|---|---|---|---|"]
    for c1 in CATS:
        L.append(f"| **{c1}** | " + " | ".join(str(conf[c1][c2]) for c2 in CATS) + " |")
    for titulo, t in (("Por fase da 1ª rodada", por_fase), ("Por estrato", por_estrato)):
        L += ["", f"## {titulo}", "", "| Grupo | n | Concordância (binário) | 1 → não 1 | não 1 → 1 | % cat. 1: 1ª → 2ª |",
              "|---|---|---|---|---|---|"]
        for k, v in t.items():
            L.append(f"| {k} | {v['n']} | {f(v['concordancia_binaria'])} | {v['1→não1']} | {v['não1→1']} | {f(v['prop1_1a'])} → {f(v['prop1_2a'])} |")
    L += ["", "**[L]** Na 2ª rodada, o intérprete não consultou o histórico de alta resolução do Google Earth (só a imagem atual, a série Sentinel-2 e a curva). As condições não foram idênticas às da 1ª rodada."]
    (SAIDA / "p1_consistencia.md").write_text("\n".join(L) + "\n", encoding="utf-8")
    with (priv / "p1_reinterp_comparacao.csv").open("w", newline="", encoding="utf-8") as fh:
        w = csv.DictWriter(fh, fieldnames=list(linhas[0].keys()))
        w.writeheader()
        w.writerows(linhas)
    print("\n".join(L))


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
