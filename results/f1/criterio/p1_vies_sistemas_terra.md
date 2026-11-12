# Viés espacial do erro — sistemas de terras (EXPLORATÓRIO [E])

Gerado por `src/python/f1_18_vies_sistemas_terra.py`. Mapa: ST_landscape_wgs84 (Mario; ref. Silva et al. 2006).
Acerto = categoria 1. Agrupamentos de relevo e matriz fixados antes da junção. O critério da P1 não muda.
**A hipótese testada nasceu da interpretação destes mesmos pontos: o resultado gera hipótese, não a confirma.**

Geometrias inválidas corrigidas: 24. Pontos em mais de um polígono: 0. Pontos sem classe: 5.

## Relevo

| Grupo | E: acertos/n | E: acerto (IC 95%) | E erros: 'nunca pastagem plantada' | N: % cat. 1 (n) | P: % cat. 1 (n) |
|---|---|---|---|---|---|
| plano/chapada | 271/404 | 67% (62–71) | 56/133 | 16% (128) | 53% (75) |
| colinoso | 56/80 | 70% (59–79) | 6/24 | 12% (17) | 35% (17) |
| baixada | 7/12 | 58% (32–81) | 2/5 | 25% (4) | 38% (8) |
| sem classe | 4/4 | 100% (51–100) | — | 100% (1) | — |

Qui-quadrado (E, grupos com n ≥ 5): χ² = 0.71, gl = 2, p = 0.700.

## Matriz de vegetação

| Grupo | E: acertos/n | E: acerto (IC 95%) | E erros: 'nunca pastagem plantada' | N: % cat. 1 (n) | P: % cat. 1 (n) |
|---|---|---|---|---|---|
| savânica | 261/381 | 69% (64–73) | 42/120 | 15% (92) | 48% (73) |
| florestal/caatinga | 66/103 | 64% (54–73) | 20/37 | 17% (53) | 60% (20) |
| ecotonal | 7/12 | 58% (32–81) | 2/5 | 25% (4) | 29% (7) |
| sem classe | 4/4 | 100% (51–100) | — | 100% (1) | — |

Qui-quadrado (E, grupos com n ≥ 5): χ² = 1.18, gl = 2, p = 0.556.

## Relevo × matriz

| Grupo | E: acertos/n | E: acerto (IC 95%) | E erros: 'nunca pastagem plantada' | N: % cat. 1 (n) | P: % cat. 1 (n) |
|---|---|---|---|---|---|
| plano/chapada · savânica | 207/306 | 68% (62–73) | 37/99 | 16% (76) | 51% (55) |
| plano/chapada · florestal/caatinga | 64/98 | 65% (55–74) | 19/34 | 17% (52) | 60% (20) |
| colinoso · savânica | 54/75 | 72% (61–81) | 5/21 | 12% (16) | 35% (17) |
| baixada · ecotonal | 7/12 | 58% (32–81) | 2/5 | 25% (4) | 29% (7) |
| colinoso · florestal/caatinga | 2/5 | 40% (12–77) | 1/3 | 0% (1) | — |
| sem classe · sem classe | 4/4 | 100% (51–100) | — | 100% (1) | — |
| baixada · savânica | 0/0 | — | — | — | 100% (1) |

Qui-quadrado (E, grupos com n ≥ 5): χ² = 3.08, gl = 4, p = 0.545.

## Paisagem (19 classes; n pequeno)

| Grupo | E: acertos/n | E: acerto (IC 95%) | E erros: 'nunca pastagem plantada' | N: % cat. 1 (n) | P: % cat. 1 (n) |
|---|---|---|---|---|---|
| Well drained plains dominated by savanna | 201/297 | 68% (62–73) | 35/96 | 16% (76) | 52% (52) |
| Plains dominated by semidecidous and decidous forest | 53/84 | 63% (52–73) | 16/31 | 23% (30) | 58% (19) |
| Hilly terrain dominated by savanna | 54/75 | 72% (61–81) | 5/21 | 12% (16) | 35% (17) |
| Lowland depression with ecotonal vegetation | 7/12 | 58% (32–81) | 2/5 | 25% (4) | 29% (7) |
| Plains with semi-evergreen forest and others | 8/9 | 89% (57–98) | 1/1 | 9% (22) | 100% (1) |
| Plains dominated by savanna | 6/9 | 67% (35–88) | 2/3 | — | 33% (3) |
| Hilly terrain dominated by semidecidous and decidous forest | 2/5 | 40% (12–77) | 1/3 | — | — |
| sem classe | 4/4 | 100% (51–100) | — | 100% (1) | — |
| Well drained plains dominated by forest and others | 3/4 | 75% (30–95) | 1/1 | — | — |
| Plains dominated by decidous woodland caatinga | 0/1 | 0% (0–79) | 1/1 | — | — |
| Well drained hilly terrain dominated by forest and others | 0/0 | — | — | 0% (1) | — |
| Floodplains with savanna | 0/0 | — | — | — | 100% (1) |

