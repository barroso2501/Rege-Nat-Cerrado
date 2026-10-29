# Plano de validação visual — P1 (D06)

**Pergunta:** o evento de §4 do protocolo (pastagem → classe 4, código 515, persistência t..t+3) corresponde a regeneração real de vegetação savânica, ou a mudança de rótulo sem mudança no terreno?

**Fixado antes de ver qualquer ponto.** Mudanças só por `docs/desvios.md`.

## 1. Amostra

| Estrato | n | Como é sorteado | Para quê |
|---|---|---|---|
| E — eventos | 500 (100 por ano, 2017–2021) | Aleatório simples dentro de cada ano, fora do holdout, semente fixa | **Critério de aprovação** |
| N — pastagens sem evento | 150 (30 por ano) | Aleatório no conjunto em risco, com cobertura 15 em t..t+3 | Detectar regeneração que o mapa não vê (contexto, sem critério de aprovação) |
| P — eventos < 1 ha | 100 (20 por ano) | Aleatório nos eventos só-LULC | Informar a sensibilidade S2 |

- O sorteio é feito por um script GEE na F1, depois do congelamento. A semente é registrada.
- Distância mínima de 500 m entre pontos.

## 2. Interpretação

- **Ordem:** os 750 pontos são embaralhados. **O intérprete não vê o estrato nem a classe do mapa.**
- **Imagens por ponto:**
  - série Landsat anual de t−4 a 2025 (composições do período seco);
  - Sentinel-2 a partir de 2017;
  - alta resolução histórica (Google Earth Pro);
  - Planet NICFI, se o acesso estiver disponível.
- **Pergunta ao intérprete:** "entre t−3 e t+3, a área deixou de ser pastagem manejada e passou a ter vegetação savânica em recuperação?"
- **Categorias:**
  1. **Regeneração real.** Sinais: abandono de manejo; aumento de lenhosas e arbustos; mudança de textura e fenologia compatível com savana.
  2. **Sem mudança aparente.** Continua pastagem; a mudança é só de rótulo.
  3. **Outra mudança** (agricultura, solo exposto, fogo etc.).
  4. **Incerto** (imagem insuficiente ou ambígua).
- **Registro por ponto:** categoria, imagens usadas, confiança (alta/baixa) e comentário curto.

## 3. Critério de aprovação

- **Acerto (estrato E)** = n(regeneração real) / n(E).
  - **Principal:** "incerto" conta como **não acerto** (conservador).
  - **Sensibilidade:** "incerto" excluído do denominador.
- **Estimativa:** média dos cinco anos, cada ano com peso igual à sua área de eventos (F0_04). IC 95% de Wilson para a proporção ponderada (ou bootstrap estratificado se a aproximação de Wilson for inadequada).
- **Aprovado** se o acerto for ≥ 75% **e** o limite inferior do IC for ≥ 70%.
  - Com n = 500 e acerto de 75%, a meia-largura do IC é de ~3,8 p.p.
- **Relatórios adicionais:**
  - acerto por ano, por região e pela confiança do intérprete;
  - proporções do estrato N e do estrato P.
- **Se reprovar:** reportar como está. A P2 e a P3 não prosseguem com esses rótulos sem um desvio registrado que justifique outra definição.

## 4. Consistência

- **Intérprete único (Mario).** Uma amostra aleatória de 10% (75 pontos) é reinterpretada às cegas depois de ≥14 dias.
- **Relatório:** concordância e kappa intra-intérprete.
- **[L]** Sem segundo intérprete, não há medida de viés sistemático do intérprete. O white paper declara essa limitação, coerente com a crítica à referência de validação oficial (KB:07, E04).
