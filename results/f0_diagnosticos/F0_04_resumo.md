# F0_04 — Contagem de eventos: produto × só-LULC (2017–2021)

Gerado por `src/python/f0_04_resumo_contagem_eventos.py`.
Entrada: `F0_04_contagem_eventos.csv` (SHA-256 `3f0a22994671eb864b24dc547eedfcf3b6bd80d3107db271cadff382e22de7d5`).
Valores em **milhares de hectares**. Limite do Cerrado: ecorregião RESOLVE (**provisório**).
As áreas vêm de frações a ~1 km × área do pixel (script GEE 03), o que equivale à soma a 30 m.

## Definições
- **Evento só-LULC** (ano t): classe 15 em t−3..t−1 e classe 4 em t..t+3.
- **Evento com produto:** o mesmo, mais o código 515 em t.

| Ano | 515 (todas as nativas) | 515 + classe 4 em t | Evento só-LULC | Evento com produto | Produto / LULC | Removido pelo produto | ...pelo filtro espacial (v5=7) | Discordância 515 | soProduto | Sensib. origem 21 |
|---|---|---|---|---|---|---|---|---|---|---|
| 2017 | 328.2 | 251.6 (77%) | 246.9 | 230.6 | 93.4% | 16.3 | 16.3 | 0.0 | 0.0 | 27.0 |
| 2018 | 334.6 | 263.4 (79%) | 259.9 | 243.3 | 93.6% | 16.5 | 16.5 | 0.0 | 0.0 | 30.5 |
| 2019 | 311.1 | 249.3 (80%) | 243.2 | 227.9 | 93.7% | 15.3 | 15.3 | 0.0 | 0.0 | 28.0 |
| 2020 | 300.4 | 241.7 (80%) | 235.5 | 220.5 | 93.6% | 15.0 | 15.0 | 0.0 | 0.0 | 36.2 |
| 2021 | 289.0 | 240.4 (83%) | 237.6 | 221.9 | 93.4% | 15.7 | 15.7 | 0.0 | 0.0 | 34.7 |

**Totais 2017–2021:**
- só-LULC: 1.22 Mha;
- com produto: 1.14 Mha;
- sensibilidade de origem 21: 0.16 Mha.

**Disjunção entre coortes.** As coortes desta janela são disjuntas: para t e t′ com |t − t′| ≤ 4, os critérios de pré e pós-transição se contradizem. Por isso os totais não contam o mesmo pixel duas vezes.

## Conferências
- **Discordância 515** = 0 em todos os anos: 515 ≡ (v5 = 5 e cobertura(t−1) = 15), como documentado.
- **soProduto** = 0 em todos os anos: conferência de construção.
- **Área removida pelo produto atribuída a outras regras** (v5 = 1, 3 ou 5): 0.0 ha. Toda a diferença vem do filtro espacial do produto (manchas ≤ 11 pixels ≈ 1 ha, código 7).
