# Viés espacial do erro — distância aos biomas vizinhos (EXPLORATÓRIO [E])

Gerado por `src/python/f1_17_vies_espacial_biomas.py`. Classes fixadas antes de ver as distâncias.
Acerto = categoria 1 (regeneração real). O critério da P1 não muda.

Pontos com distância 0 a outro bioma (fora do limite IBGE do Cerrado): 0.

## Distância ao bioma vizinho mais próximo

| Grupo | E: acertos/n | E: acerto (IC 95%) | N: % cat. 1 (n) | P: % cat. 1 (n) |
|---|---|---|---|---|
| 1: ≤50 km | 93/149 | 62% (54–70) | 18% (60) | 62% (32) |
| 2: 50–150 km | 115/167 | 69% (61–75) | 16% (50) | 47% (19) |
| 3: >150 km (core) | 130/184 | 71% (64–77) | 15% (40) | 41% (49) |

Qui-quadrado de homogeneidade (E): χ² = 2.73, gl = 2, p = 0.255.

## Transição (≤150 km) por bioma vizinho × core

| Grupo | E: acertos/n | E: acerto (IC 95%) | N: % cat. 1 (n) | P: % cat. 1 (n) |
|---|---|---|---|---|
| Amazônia | 59/92 | 64% (54–73) | 45% (20) | 65% (17) |
| Caatinga | 50/77 | 65% (54–75) | 33% (3) | 36% (14) |
| Mata Atlântica | 55/86 | 64% (53–73) | 10% (61) | 60% (10) |
| Pantanal | 44/61 | 72% (60–82) | 12% (26) | 70% (10) |
| core (>150 km) | 130/184 | 71% (64–77) | 15% (40) | 41% (49) |

Qui-quadrado de homogeneidade (E): χ² = 2.63, gl = 4, p = 0.621.

