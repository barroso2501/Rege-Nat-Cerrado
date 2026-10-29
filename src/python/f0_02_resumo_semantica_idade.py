"""
f0_02_resumo_semantica_idade.py — Rege-Nat-Cerrado, fase F0

O QUE FAZ
    Lê o CSV exportado pelo script GEE src/gee/02_semantica_idade_pastagem.js
    e responde à pendência da D10: o código 2xx do asset pasture_origin_age_v2
    é idade (cresce 1 por ano) ou ano de origem (constante)? E bate com a
    contagem de anos consecutivos de pastagem (classe 15) da LULC C11?
    Escreve um resumo em Markdown ao lado do CSV.

COMO RODAR (da raiz do repositório)
    python src/python/f0_02_resumo_semantica_idade.py \
        results/f0_diagnosticos/F0_02_semantica_idade_pastagem.csv

O QUE PODE QUEBRAR E COMO PERCEBER
    - KeyError numa coluna 'codAAAA': o CSV veio de outra versão do script GEE.
    - Só usa a biblioteca padrão do Python, de propósito (roda em qualquer máquina).
"""

import csv
import hashlib
import sys
from collections import Counter
from pathlib import Path

ANOS = list(range(2010, 2021))


def main(caminho_csv: str) -> None:
    caminho = Path(caminho_csv)
    # Hash do arquivo de entrada: registra exatamente qual CSV gerou o resumo.
    sha = hashlib.sha256(caminho.read_bytes()).hexdigest()

    with caminho.open(newline="", encoding="utf-8") as f:
        linhas = list(csv.DictReader(f))
    n = len(linhas)

    # 1) Incrementos ano a ano do código: 1 em todos os casos => é idade.
    incrementos = Counter()
    for r in linhas:
        cods = [int(float(r[f"cod{a}"])) for a in ANOS]
        incrementos.update(b - a for a, b in zip(cods, cods[1:]))

    # 2) Código em 2010 menos (200 + anos consecutivos de pastagem pela LULC).
    residuo = Counter(
        int(float(r["cod2010"])) - 200 - int(float(r["consec_lulc_2010"])) for r in linhas
    )

    # 3) Faixa de valores observada em 2010.
    cods2010 = [int(float(r["cod2010"])) for r in linhas]
    n100 = sum(1 for c in cods2010 if c == 100)

    texto = f"""# F0_02 — Semântica do código de idade em `pasture_origin_age_v2`

Gerado por `src/python/f0_02_resumo_semantica_idade.py`.
Entrada: `{caminho.name}` (SHA-256 `{sha}`).

## Amostra
- {n} pixels do Cerrado: pastagem (15) em todos os anos de 2010 a 2020 e não contínua desde 1985.
- Pontos aleatórios, semente 42. Limite do Cerrado: ecorregião RESOLVE (provisório).

## Resultados
- **Incrementos anuais do código, 2010→2020** ({sum(incrementos.values())} pares ano-a-ano): {dict(incrementos)}
- **código2010 − (200 + anos consecutivos de 15 na LULC até 2010, inclusive)**: {dict(residuo)}
- **Código 100 em 2010:** {n100} pixels. Esperado 0, porque a amostra exclui a pastagem contínua desde 1985.
- **Faixa de código2010:** {min(cods2010)} a {max(cods2010)}.

## Leitura
- Se todos os incrementos são 1 e todos os resíduos são 0, então **2xx = 200 + idade**.
- Idade = número de anos consecutivos de pastagem, contando o ano corrente; vale 1 no primeiro ano.
- O código **não** é ano de origem.
"""
    saida = caminho.with_name("F0_02_resumo.md")
    saida.write_text(texto, encoding="utf-8")
    print(texto)


if __name__ == "__main__":
    main(sys.argv[1])
