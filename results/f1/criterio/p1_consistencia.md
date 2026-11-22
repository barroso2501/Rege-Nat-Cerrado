# P1 — Consistência intra-intérprete (reinterpretação cega de 75 pontos)

Gerado por `src/python/f1_21_consistencia_reinterpretacao.py`. 1ª rodada = `categoria_bruta`.

| Medida | Concordância | Kappa (IC 95% bootstrap) |
|---|---|---|
| 4 categorias | 76% | 0.49 (0.28–0.68) |
| Binário (1 × não 1) | 76% | 0.48 (0.26–0.67) |

Direção das mudanças (binário): 1 → não 1 = 5; não 1 → 1 = 13.

## Matriz de confusão (linhas = 1ª rodada; colunas = 2ª)

| | 1 | 2 | 3 | 4 |
|---|---|---|---|---|
| **1** | 40 | 5 | 0 | 0 |
| **2** | 10 | 17 | 0 | 0 |
| **3** | 3 | 0 | 0 | 0 |
| **4** | 0 | 0 | 0 | 0 |

## Por fase da 1ª rodada

| Grupo | n | Concordância (binário) | 1 → não 1 | não 1 → 1 | % cat. 1: 1ª → 2ª |
|---|---|---|---|---|---|
| P001–100 (frouxo) | 10 | 90% | 0 | 1 | 50% → 60% |
| P101–399 (transição) | 29 | 83% | 2 | 3 | 69% → 72% |
| P400–750 (consistente) | 36 | 67% | 3 | 9 | 56% → 72% |

## Por estrato

| Grupo | n | Concordância (binário) | 1 → não 1 | não 1 → 1 | % cat. 1: 1ª → 2ª |
|---|---|---|---|---|---|
| E | 56 | 73% | 5 | 10 | 71% → 80% |
| N | 12 | 75% | 0 | 3 | 0% → 25% |
| P | 7 | 100% | 0 | 0 | 71% → 71% |

**[L]** Na 2ª rodada, o intérprete não consultou o histórico de alta resolução do Google Earth (só a imagem atual, a série Sentinel-2 e a curva). As condições não foram idênticas às da 1ª rodada.

## Leitura (2026-11-22)

- **[D]** O kappa binário é 0,48 (IC 0,26–0,67), uma concordância moderada. Concordância simples de 76%.
- **[D]** As mudanças são **assimétricas**: 13 pontos passaram de não 1 para 1 e 5 de 1 para não 1 (McNemar exato, p ≈ 0,10). Nos 56 pontos E, a categoria 1 foi de 71% para 80%.
- **[C]** Vários pontos que viraram 1 tinham, na 1ª rodada, comentários de **"sem sinal de conversão"**, "área natural", "agrofloresta" ou "sem implementação de pastagem". Esses julgamentos dependem do **histórico de alta resolução**, que não foi consultado na 2ª rodada.
- **[H]** Sem o histórico de alta resolução, o intérprete tende a aceitar como regeneração o que a curva e o Sentinel-2 sugerem, que é o mesmo tipo de sinal que o mapa usa. A referência fica mais "parecida com o mapa".
- **Consequências:**
  1. O kappa mistura três efeitos que não dá para separar: inconsistência aleatória, mudança de critério ao longo da 1ª rodada e **mudança da evidência disponível**. Ele não mede só a consistência.
  2. A estimativa da P1 (67,6%) vem da rodada que seguiu o plano (§2: alta resolução histórica). A 2ª rodada **não a substitui**.
  3. A P1 é **sensível à evidência**: o acerto do mapa medido por interpretação visual depende de haver histórico de alta resolução. Isso reforça a exigência de alta resolução na Fase 2 (D13) e a regra de independência entre referência e detector.

