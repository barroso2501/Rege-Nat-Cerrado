"""
f0_04_resumo_contagem_eventos.py — Rege-Nat-Cerrado, fase F0

O QUE FAZ
    Lê o CSV exportado por src/gee/04_somar_indicadores.js e escreve um resumo
    (Markdown) com:
      - conferência da codificação 515 (discord deve ser 0);
      - conferência de construção (soProduto deve ser 0);
      - quanto o produto de Vegetação Secundária remove em relação à definição
        só-LULC, e por qual regra (colunas soLulc1/3/5/7);
      - frações entre etapas do filtro (515 → 515 com classe 4 → evento estrito);
      - sensibilidade com origem 21 (D07).
    Diagnóstico de F0 (PROTOCOLO §7): só descreve as definições; não escolhe nenhuma.

COMO RODAR (da raiz do repositório)
    python src/python/f0_04_resumo_contagem_eventos.py \
        results/f0_diagnosticos/F0_04_contagem_eventos.csv

O QUE PODE QUEBRAR E COMO PERCEBER
    - KeyError numa coluna: o CSV veio de outra versão do script GEE 04.
    - Só usa a biblioteca padrão do Python.
"""

import csv
import hashlib
import sys
from pathlib import Path


def f(x: str) -> float:
    return float(x) if x not in ("", None) else 0.0


def main(caminho_csv: str) -> None:
    caminho = Path(caminho_csv)
    sha = hashlib.sha256(caminho.read_bytes()).hexdigest()
    with caminho.open(newline="", encoding="utf-8") as fh:
        linhas = list(csv.DictReader(fh))

    # Tabela por ano, em milhares de hectares, com as razões entre etapas.
    cab = ("| Ano | 515 (todas as nativas) | 515 + classe 4 em t | Evento só-LULC | Evento com produto "
           "| Produto / LULC | Removido pelo produto | ...pelo filtro espacial (v5=7) | Discordância 515 "
           "| soProduto | Sensib. origem 21 |")
    sep = "|" + "---|" * 11
    corpo = []
    tot = {"lulc": 0.0, "produto": 0.0, "sens": 0.0}
    for r in linhas:
        a515, sav4 = f(r["a515_ha"]), f(r["e515sav4_ha"])
        lulc, prod = f(r["lulc_ha"]), f(r["produto_ha"])
        so, so7 = f(r["soLulc_ha"]), f(r["soLulc7_ha"])
        tot["lulc"] += lulc
        tot["produto"] += prod
        tot["sens"] += f(r["sens521_ha"])
        corpo.append(
            f"| {r['ano']} | {a515/1e3:.1f} | {sav4/1e3:.1f} ({100*sav4/a515:.0f}%) | {lulc/1e3:.1f} "
            f"| {prod/1e3:.1f} | {100*prod/lulc:.1f}% | {so/1e3:.1f} | {so7/1e3:.1f} "
            f"| {f(r['discord_ha']):.1f} | {f(r['soProduto_ha']):.1f} | {f(r['sens521_ha'])/1e3:.1f} |"
        )
    outras = sum(f(r[c]) for r in linhas for c in ("soLulc1_ha", "soLulc3_ha", "soLulc5_ha"))

    texto = f"""# F0_04 — Contagem de eventos: produto × só-LULC (2017–2021)

Gerado por `src/python/f0_04_resumo_contagem_eventos.py`.
Entrada: `{caminho.name}` (SHA-256 `{sha}`).
Valores em **milhares de hectares**. Limite do Cerrado: ecorregião RESOLVE (**provisório**).
As áreas vêm de frações a ~1 km × área do pixel (script GEE 03), o que equivale à soma a 30 m.

## Definições
- **Evento só-LULC** (ano t): classe 15 em t−3..t−1 e classe 4 em t..t+3.
- **Evento com produto:** o mesmo, mais o código 515 em t.

{cab}
{sep}
{chr(10).join(corpo)}

**Totais 2017–2021:**
- só-LULC: {tot['lulc']/1e6:.2f} Mha;
- com produto: {tot['produto']/1e6:.2f} Mha;
- sensibilidade de origem 21: {tot['sens']/1e6:.2f} Mha.

**Disjunção entre coortes.** As coortes desta janela são disjuntas: para t e t′ com |t − t′| ≤ 4, os critérios de pré e pós-transição se contradizem. Por isso os totais não contam o mesmo pixel duas vezes.

## Conferências
- **Discordância 515** = 0 em todos os anos: 515 ≡ (v5 = 5 e cobertura(t−1) = 15), como documentado.
- **soProduto** = 0 em todos os anos: conferência de construção.
- **Área removida pelo produto atribuída a outras regras** (v5 = 1, 3 ou 5): {outras:.1f} ha. Toda a diferença vem do filtro espacial do produto (manchas ≤ 11 pixels ≈ 1 ha, código 7).
"""
    saida = caminho.with_name("F0_04_resumo.md")
    saida.write_text(texto, encoding="utf-8")
    print(texto)


if __name__ == "__main__":
    main(sys.argv[1])
