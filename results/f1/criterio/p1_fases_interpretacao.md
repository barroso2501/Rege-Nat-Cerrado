# P1 — Acerto por fase de interpretação (EXPLORATÓRIO [E])

**Origem:** relato de Mario em 2026-11-12 (`docs/desvios.md`, 2026-11-12 (c)). Fases aproximadas, informadas **depois** do resultado:
- P001–P100: critério "frouxo", com a janela avaliada como um todo;
- P101–P399: critério se tornando consistente;
- P400–P750: critério consistente, ancorado em t (sequência Q1–Q4).

A ordem dos códigos é aleatória (F1_11), então cada fase é uma amostra aleatória dos estratos. O critério oficial da P1 **não muda**. Calculado a partir da tabela privada `p1_pontos_com_estrato.csv` (cálculo ad hoc, registrado aqui).

| Fase | E: acertos/n | E: acerto (IC 95%) | N: % cat. 1 | P: % cat. 1 |
|---|---|---|---|---|
| P001–P100 (frouxo) | 43/67 | 64,2% (52,2–74,6) | 5,9% (1/17) | 43,8% (7/16) |
| P101–P399 (transição) | 151/201 | 75,1% (68,7–80,6) | 23,2% (13/56) | 54,8% (23/42) |
| P400–P750 (consistente) | 144/232 | 62,1% (55,7–68,1) | 14,3% (11/77) | 45,2% (19/42) |

**Estimativa ponderada por área (E):**
- só a fase consistente: **63,1%** (IC 95% 56,7–69,0; de 38 a 60 pontos por ano);
- sem a fase frouxa: 68,3% (63,9–72,5);
- oficial, todos os pontos: 67,6% (63,4–71,5).

**Leitura:**
- **[E]** A fase frouxa **não** inflou a categoria 1 (64%). O padrão não é monotônico: o acerto é maior na transição e menor na fase consistente.
- **[C]** Com o critério mais maduro, o acerto fica perto de 63%. Nenhuma fase atende ao critério: a transição tem estimativa pontual de 75,1%, mas o limite inferior do IC (68,7%) fica abaixo de 70%.
- **[L]** As fronteiras das fases são aproximadas e foram informadas depois do resultado. Esta tabela é uma sensibilidade descritiva, não uma reestimativa.
