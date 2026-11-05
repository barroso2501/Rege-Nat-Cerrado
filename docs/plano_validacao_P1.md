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

### 2.0 Notas de interpretação (esclarecimentos; não mudam as categorias)

**N1 — Reconversão depois da regeneração** (orientação dada em 2026-11-03, registrada em 2026-11-04):
- **Reconversão depois da janela** (ano > t+3), com regeneração visível dentro da janela: **categoria 1**.
  - A janela define o evento (classe 4 de t a t+3, PROTOCOLO §4).
  - A persistência depois de t+3 é assunto da P4, não da P1.
  - Marcar `ja_foi_convertida` = `sim` e anotar no comentário o ano aproximado da reconversão (ex.: "regeneração 2018–2022; reconvertida ~2023").
- **Reconversão dentro da janela** (até t+3): **categoria 3** (outra mudança), com explicação no comentário. A regeneração não se sustentou no período que o evento exige.
- **Pontos interpretados antes desta nota:** não alterar a categoria. Se algum caso de reconversão dentro da janela tiver recebido outra categoria, anotar no comentário.

### 2.1 Colunas auxiliares (desvio de 2026-10-31, ver `docs/desvios.md`)

**Valores das duas colunas:** `sim` / `não` / `talvez`.

**`ja_foi_convertida`:** há evidência, nas imagens disponíveis, de **retirada total da biomassa acima do solo** em algum momento?
- Degradação, fogo e raleamento **não** contam como conversão.
- `não` significa "sem evidência no período visível". As imagens começam em t−4 e o histórico de alta resolução costuma começar nos anos 2000, então `não` não significa "nunca".
- Se a resposta for `sim`, anotar o ano aproximado no comentário.

**`ja_foi_pastagem_plantada`:** quanta certeza há de que, antes de t, a área era **pastagem plantada**, e não campo nativo nem agricultura? `sim` = certeza alta, `talvez` = intermediária, `não` = provável campo nativo ou agricultura.
- **Indícios a favor:** textura homogênea, limites retos, cercas, trilhas de gado, carreadores, ausência de estrato arbustivo antes de t.
- **Indícios de campo nativo:** mosaico irregular, transição gradual para a vegetação nativa vizinha, afloramentos.
- **Indícios de agricultura:** linhas de plantio, pivô, solo exposto sazonal.

**Orientação de coerência** (não obrigatória; Mario pode vetar). Se `ja_foi_pastagem_plantada` = `não` **e** `ja_foi_convertida` = `não`, a categoria principal tende a ser **2** (só mudança de rótulo) ou **4** (incerto), e não 1: regeneração a partir de pastagem pressupõe pastagem.

**Uso (decisão de Mario, 2026-10-31):**
- As duas colunas **não entram em nenhuma análise**: nem no critério de aprovação, nem em análise secundária.
- Servem só para **explicar** as atribuições das categorias 2, 3 e 4. Podem ser citadas descritivamente no white paper, junto com os comentários.
- O critério de aprovação (§3) **não muda** e **não pode** ser recalculado excluindo pontos por essas colunas.

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
