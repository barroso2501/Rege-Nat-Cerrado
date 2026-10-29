# F0_02 — Semântica do código de idade em `pasture_origin_age_v2`

Gerado por `src/python/f0_02_resumo_semantica_idade.py`.
Entrada: `F0_02_semantica_idade_pastagem.csv` (SHA-256 `bc4c2247c88a6880aa399683d54478ebc8cbdf24f34905b4bb4c7d8f3c0c8968`).

## Amostra
- 13047 pixels do Cerrado: pastagem (15) em todos os anos de 2010 a 2020 e não contínua desde 1985.
- Pontos aleatórios, semente 42. Limite do Cerrado: ecorregião RESOLVE (provisório).

## Resultados
- **Incrementos anuais do código, 2010→2020** (130470 pares ano-a-ano): {1: 130470}
- **código2010 − (200 + anos consecutivos de 15 na LULC até 2010, inclusive)**: {0: 13047}
- **Código 100 em 2010:** 0 pixels. Esperado 0, porque a amostra exclui a pastagem contínua desde 1985.
- **Faixa de código2010:** 201 a 225.

## Leitura
- Se todos os incrementos são 1 e todos os resíduos são 0, então **2xx = 200 + idade**.
- Idade = número de anos consecutivos de pastagem, contando o ano corrente; vale 1 no primeiro ano.
- O código **não** é ano de origem.
