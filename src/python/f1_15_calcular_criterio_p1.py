"""
f1_15_calcular_criterio_p1.py — Rege-Nat-Cerrado, F1, critério de aprovação da P1

O QUE FAZ (docs/plano_validacao_P1.md §3; desvios de 2026-11-07 e 2026-11-12)
    1. Confere o hash da CHAVE contra results/f1/amostra_p1_registro.json e junta a
       CHAVE (estrato, região) à interpretação validada (p1_interpretacao_analise.csv).
    2. Estrato E — acerto = proporção de categoria 1:
         - por ano (n = 100 cada);
         - ponderado pela área de eventos de cada ano (produto_ha, F0_04);
         - IC 95% de Wilson para a proporção ponderada, com n efetivo
           (n_ef = p(1−p)/Var), e um bootstrap estratificado por ano como conferência.
       Quatro cenários:
         principal      — categoria (correções mecânicas), "incerto" = erro;
         sens_incerto   — "incerto" (4) fora do denominador;
         sens_janela    — categoria_sens (inclui casos de julgamento P350/P438);
         bruta          — categoria original do intérprete, sem nenhuma correção.
    3. Relatórios adicionais: acerto de E por região e por confiança; distribuição das
       categorias em E, N e P.
    4. Escreve results/f1/criterio/p1_criterio.json, p1_criterio_resumo.md e, na PASTA PRIVADA (fora do
       repositório até o fim da reinterpretação: revela o estrato por ponto),
       a tabela unida p1_pontos_com_estrato.csv.

COMO RODAR (da raiz do repositório)
    python src/python/f1_15_calcular_criterio_p1.py /mnt/user-data/outputs/f1_privado/amostra_p1_CHAVE.csv /mnt/user-data/outputs/f1_privado

O QUE PODE QUEBRAR E COMO PERCEBER
    - "Hash da CHAVE não confere": a CHAVE mudou desde o sorteio. Pare.
    - "Códigos não batem": a interpretação validada e a CHAVE têm códigos diferentes.
    - O bootstrap usa semente fixa; se o IC de Wilson e o do bootstrap divergirem
      mais de ~1 p.p., o resumo avisa e o plano manda preferir o bootstrap.
    - Só usa a biblioteca padrão.
"""

import collections
import csv
import hashlib
import json
import math
import random
import sys
from pathlib import Path

INTERP = Path("results/f1/interpretacao/p1_interpretacao_analise.csv")
REGISTRO_F1 = Path("results/f1/amostra_p1_registro.json")
AREAS = Path("results/f0_diagnosticos/F0_04_contagem_eventos.csv")
SAIDA = Path("results/f1/criterio")
LIMIAR, LIMIAR_IC = 0.75, 0.70
Z = 1.959964
SEMENTE_BOOT, N_BOOT = 20261112, 20000


def sha(p: Path) -> str:
    return hashlib.sha256(p.read_bytes()).hexdigest()


def ler(p: Path):
    with p.open(newline="", encoding="utf-8") as fh:
        return list(csv.DictReader(fh))


def wilson(p, n):
    """IC de Wilson para proporção p com n (pode ser n efetivo, não inteiro)."""
    if n <= 0:
        return (float("nan"), float("nan"))
    centro = (p + Z * Z / (2 * n)) / (1 + Z * Z / n)
    meia = Z * math.sqrt(p * (1 - p) / n + Z * Z / (4 * n * n)) / (1 + Z * Z / n)
    return (centro - meia, centro + meia)


def acerto(pontos, coluna, excluir_incerto=False):
    """Lista de 0/1 (acerto) para os pontos, segundo a coluna de categoria."""
    ok = [p for p in pontos if not (excluir_incerto and p[coluna] == "4")]
    return [1 if p[coluna] == "1" else 0 for p in ok]


def ponderado(e_por_ano, pesos, coluna, excluir_incerto, rng):
    """Proporção ponderada por área, IC de Wilson (n efetivo) e IC bootstrap estratificado."""
    anos = sorted(e_por_ano)
    w = {a: pesos[a] / sum(pesos[x] for x in anos) for a in anos}
    ys = {a: acerto(e_por_ano[a], coluna, excluir_incerto) for a in anos}
    p_ano = {a: sum(ys[a]) / len(ys[a]) for a in anos}
    p = sum(w[a] * p_ano[a] for a in anos)
    var = sum(w[a] ** 2 * p_ano[a] * (1 - p_ano[a]) / len(ys[a]) for a in anos)
    n_ef = p * (1 - p) / var if var > 0 else sum(len(ys[a]) for a in anos)
    lo, hi = wilson(p, n_ef)
    # Bootstrap estratificado por ano (reamostra dentro de cada ano).
    boot = []
    for _ in range(N_BOOT):
        boot.append(sum(w[a] * sum(rng.choice(ys[a]) for _ in ys[a]) / len(ys[a]) for a in anos))
    boot.sort()
    b_lo, b_hi = boot[int(0.025 * N_BOOT)], boot[int(0.975 * N_BOOT) - 1]
    return {"p": p, "ic_wilson": [lo, hi], "n_efetivo": n_ef, "ic_bootstrap": [b_lo, b_hi],
            "n": sum(len(ys[a]) for a in anos),
            "por_ano": {a: {"n": len(ys[a]), "acertos": sum(ys[a]), "p": p_ano[a],
                            "ic_wilson": list(wilson(p_ano[a], len(ys[a])))} for a in anos},
            "pesos": w,
            "aprovado": p >= LIMIAR and lo >= LIMIAR_IC}


def main(chave_arq: str, pasta_privada: str):
    chave_path = Path(chave_arq)
    esperado = json.loads(REGISTRO_F1.read_text(encoding="utf-8"))["saidas"]["amostra_p1_CHAVE.csv"]
    if sha(chave_path) != esperado:
        sys.exit("Hash da CHAVE não confere com amostra_p1_registro.json")

    chave = {r["codigo"]: r for r in ler(chave_path)}
    pontos = ler(INTERP)
    if {p["codigo"] for p in pontos} != set(chave):
        sys.exit("Códigos não batem entre a interpretação e a CHAVE")
    for p in pontos:
        k = chave[p["codigo"]]
        if k["ano"] != p["ano_referencia_t"]:
            sys.exit(f"Ano diverge em {p['codigo']}")
        p["estrato"], p["regiao"], p["reinterpretar"] = k["estrato"], k["regiao"], k["reinterpretar"]

    pesos = {r["ano"]: float(r["produto_ha"]) for r in ler(AREAS)}
    E = [p for p in pontos if p["estrato"] == "E"]
    e_por_ano = collections.defaultdict(list)
    for p in E:
        e_por_ano[p["ano_referencia_t"]].append(p)

    rng = random.Random(SEMENTE_BOOT)
    cenarios = {
        "principal": ponderado(e_por_ano, pesos, "categoria", False, rng),
        "sens_incerto": ponderado(e_por_ano, pesos, "categoria", True, rng),
        "sens_janela": ponderado(e_por_ano, pesos, "categoria_sens", False, rng),
        "bruta": ponderado(e_por_ano, pesos, "categoria_bruta", False, rng),
    }

    def tabela(grupo_chave, subconj):
        g = collections.defaultdict(list)
        for p in subconj:
            g[p[grupo_chave]].append(1 if p["categoria"] == "1" else 0)
        return {k: {"n": len(v), "acertos": sum(v), "p": sum(v) / len(v), "ic_wilson": list(wilson(sum(v) / len(v), len(v)))}
                for k, v in sorted(g.items())}

    dist = {e: dict(sorted(collections.Counter(p["categoria"] for p in pontos if p["estrato"] == e).items()))
            for e in ("E", "N", "P")}
    prop1 = {e: tabela("estrato", [p for p in pontos if p["estrato"] == e])[e] for e in ("E", "N", "P")}

    res = {
        "observacao": "Resultado preliminar quanto à consistência: reinterpretação de 10% pendente (a partir de 2026-11-21).",
        "criterio": {"limiar": LIMIAR, "limiar_ic_inferior": LIMIAR_IC},
        "entradas": {INTERP.name: sha(INTERP), "amostra_p1_CHAVE.csv": sha(chave_path), AREAS.name: sha(AREAS)},
        "cenarios_E": cenarios,
        "E_por_regiao": tabela("regiao", E),
        "E_por_confianca": tabela("confianca", E),
        "categorias_por_estrato": dist,
        "proporcao_categoria1_por_estrato": prop1,
        "aux_E_categoria_nao1": {
            "ja_foi_convertida": dict(collections.Counter(p["ja_foi_convertida"] for p in E if p["categoria"] != "1")),
            "ja_foi_pastagem_plantada": dict(collections.Counter(p["ja_foi_pastagem_plantada"] for p in E if p["categoria"] != "1")),
        },
    }
    SAIDA.mkdir(parents=True, exist_ok=True)
    (SAIDA / "p1_criterio.json").write_text(json.dumps(res, indent=2, ensure_ascii=False), encoding="utf-8")

    Path(pasta_privada).mkdir(parents=True, exist_ok=True)
    with (Path(pasta_privada) / "p1_pontos_com_estrato.csv").open("w", newline="", encoding="utf-8") as fh:
        cols = list(pontos[0].keys())
        w = csv.DictWriter(fh, fieldnames=cols)
        w.writeheader()
        w.writerows(pontos)

    # Resumo legível.
    f = lambda x: f"{100 * x:.1f}%"
    L = ["# P1 — Critério de aprovação (resultado preliminar quanto à consistência)", "",
         "Gerado por `src/python/f1_15_calcular_criterio_p1.py`. Critério: acerto ≥ 75% **e** limite inferior do IC 95% ≥ 70%.", "",
         "| Cenário (estrato E, n=500) | Acerto ponderado | IC 95% Wilson (n efetivo) | IC 95% bootstrap | Aprovado? |",
         "|---|---|---|---|---|"]
    for nome, c in cenarios.items():
        L.append(f"| {nome} | {f(c['p'])} | {f(c['ic_wilson'][0])}–{f(c['ic_wilson'][1])} | "
                 f"{f(c['ic_bootstrap'][0])}–{f(c['ic_bootstrap'][1])} | {'**sim**' if c['aprovado'] else '**não**'} |")
    L += ["", "## E por ano (cenário principal)", "", "| Ano | Peso (área) | Acertos/n | Acerto | IC 95% |", "|---|---|---|---|---|"]
    for a, v in cenarios["principal"]["por_ano"].items():
        L.append(f"| {a} | {f(cenarios['principal']['pesos'][a])} | {v['acertos']}/{v['n']} | {f(v['p'])} | {f(v['ic_wilson'][0])}–{f(v['ic_wilson'][1])} |")
    for titulo, t in (("E por confiança", res["E_por_confianca"]), ("E por região de classificação", res["E_por_regiao"])):
        L += ["", f"## {titulo}", "", "| Grupo | Acertos/n | Acerto | IC 95% |", "|---|---|---|---|"]
        for k, v in t.items():
            L.append(f"| {k} | {v['acertos']}/{v['n']} | {f(v['p'])} | {f(v['ic_wilson'][0])}–{f(v['ic_wilson'][1])} |")
    L += ["", "## Categorias por estrato", "", "| Estrato | 1 | 2 | 3 | 4 | n | % categoria 1 (IC 95%) |", "|---|---|---|---|---|---|---|"]
    for e in ("E", "N", "P"):
        d, v = dist[e], prop1[e]
        L.append(f"| {e} | {d.get('1',0)} | {d.get('2',0)} | {d.get('3',0)} | {d.get('4',0)} | {v['n']} | {f(v['p'])} ({f(v['ic_wilson'][0])}–{f(v['ic_wilson'][1])}) |")
    dif = max(abs(cenarios["principal"]["ic_wilson"][i] - cenarios["principal"]["ic_bootstrap"][i]) for i in (0, 1))
    L += ["", f"Diferença máxima Wilson × bootstrap (principal): {100*dif:.2f} p.p." + (" **> 1 p.p.: preferir bootstrap.**" if dif > 0.01 else "")]
    (SAIDA / "p1_criterio_resumo.md").write_text("\n".join(L) + "\n", encoding="utf-8")
    print("\n".join(L))


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
