# Protocolo — Regeneração natural savânica em pastagens do Cerrado

**Versão:** 1.0-rc (candidata a congelamento) · **Data:** 2026-10-29 · **Responsável:** Mario Barroso (TNC Brasil)

**Status:** todas as decisões tomadas (`docs/decisoes.md`), exceto dois itens operacionais que fecham no congelamento (§11):
- o asset IBGE do limite do Cerrado;
- o sorteio do holdout.

Depois da tag `protocolo-v1.0`, toda mudança vai para `docs/desvios.md`.

**Marcas epistêmicas:**
- **[D]** documentado;
- **[C]** inferido de código ou método;
- **[H]** hipótese;
- **[L]** lacuna;
- **[E]** externo não documentado.

As citações da KB MapBiomas têm a forma `KB:arquivo`.

---

## 1. Escopo

- **Objeto.** Transições de **pastagem plantada (classe 15) para formação savânica (classe 4)** no Cerrado, na LULC MapBiomas Col. 11.
  - Os resultados valem só para regeneração **savânica**: não incluem campo (12) nem floresta (3) (D01).
- **Período de busca.** Eventos com início entre **2017 e 2021**, com seguimento até 2025 (D02).
- **Réplica temporal.** Início entre **2012 e 2016**, usada só no teste de transferência temporal da P3 (D08).
- **Território.** Cerrado, pelo limite IBGE (`projects/ee-barroso2501/assets/biomas_IBGE`, §11), com resultados também pelas 38 regiões de classificação do MapBiomas Cerrado (D05).
- **O que o projeto não faz:**
  - não mede aptidão ecológica intrínseca;
  - não mede regeneração em manchas menores que ~1 ha (exceto como sensibilidade);
  - não faz inferência causal.

## 2. O piloto de 2025 e o recomeço

O piloto de 2025 é exploratório e não reportável (`docs/piloto_2025.md`). Cada problema dele virou uma regra deste protocolo:

| Problema do piloto | Regra aqui |
|---|---|
| Sem controle (só pastagens que regeneraram) | Desenho de risco com todas as pastagens em risco (§6) |
| Filtro de "similaridade" pelo IC da média | Similaridade só por modelo com validação fora da amostra (§7) |
| Fonte da altura não identificada | Altura fora do projeto (D04); todo asset no manifesto |
| N divergente entre etapas | Tabela de atrito gerada pelo código |
| Col. 9, com regra pastagem > savana | Só Col. 11 (§3) |

## 3. Dados

Assets, versões e tamanhos estão em `docs/fontes_dados.md` e `data/manifestos/manifesto.csv`. Os principais:

| Uso | Asset (`.../brazil/lulc/collection11/`) |
|---|---|
| Cobertura | `mapbiomas_brazil_collection11_coverage_v3` |
| Evento | `mapbiomas_brazil_collection11_deforestation_secondary_vegetation_by_coverage_v1` (código 515) e `..._v5` |
| Idade da pastagem | `mapbiomas_brazil_collection11_pasture_origin_age_v2`. Código 2xx = 200 + anos consecutivos de 15; 100 = contínua desde 1985 (F0_02) |
| Vigor | `mapbiomas_brazil_collection11_pasture_vigor_v1` |
| Biomassa da pastagem | `mapbiomas_brazil_collection11_pasture_biomass_v1`. GPP (LUE) × fator constante, usado como índice **relativo** de produtividade (D11) |

**Restrições do mapa que o desenho incorpora:**
- **[D] Col. 11 do Cerrado** (KB:06):
  - filtro de falsa regeneração (1–3 anos de nativa entre blocos ≥4 anos de 21 viram 21);
  - a partir de 2023, nativa não substitui 21;
  - omissão de pastagem de ~12–25%, confundida com savana e floresta.
- **[D] Produto de Vegetação Secundária** (`docs/produto_vegetacao_secundaria_c11.md`):
  - o evento só existe com ≥3 anos de vegetação;
  - manchas ≤11 pixels (~1 ha) são filtradas.
- **[D] F0_04:** com a definição de §4, produto e LULC só diferem por esse filtro de ~1 ha.

## 4. Definição do evento (D01, D01b, D07, D09)

**Evento no ano t** (2017 ≤ t ≤ 2021):
1. cobertura = 15 em t−3, t−2 e t−1;
2. `by_coverage_v1`(t) = 515 (recuperação a partir de pastagem);
3. cobertura = 4 em t, t+1, t+2 e t+3.

**Conjunto em risco no ano t:** pixels com cobertura 15 em t−3, t−2 e t−1. As coortes de 2017 a 2021 são disjuntas quanto a eventos (F0_04).

**Desfecho de cada pixel-ano em risco:**
- **evento**;
- **não-evento**: qualquer outro destino. Inclui:
  - permanecer pastagem;
  - ir para outra classe;
  - regeneração "não estrita": 515 sem 4 em todos os anos de t a t+3.

**Sensibilidades pré-especificadas:**

| Código | Variação |
|---|---|
| S1 | Classe 4 em t; em t+1..t+3, qualquer nativa (estado 2 do produto) |
| S2 | Eventos < 1 ha incluídos (definição só-LULC) |
| S3 | Origem 21 (código 521, cobertura 21 em t−3..t−1) |
| S4 | Regeneração não estrita **excluída** dos não-eventos, em vez de contada como não-evento |
| S5 | Persistência até 2025 (complementar) |
| S6 | Atraso de rótulo: vigor e biomassa medidos só em t−3 e t−2, sem t−1. Critério pré-fixado: se, sem t−1, o OR do grupo Pastagem entrar em [0,80; 1,25] (P2) ou o IC do ganho de AUC-PR passar a incluir 0 (P3), o sinal é tratado como provável atraso de rótulo, não como precursor ecológico, e o white paper diz isso (D11) |

## 5. Perguntas e critérios de aprovação

Cada pergunta tem um critério de aprovação fixado aqui. Se ele falhar, o resultado é reportado como está e as perguntas seguintes são revistas por desvio registrado. **Não se ajusta o método para passar.**

| Pergunta | Critério de aprovação |
|---|---|
| **P1.** O evento do mapa corresponde a regeneração real? | Acerto ≥ 75% **e** limite inferior do IC 95% ≥ 70% (D06; plano em `docs/plano_validacao_P1.md`) |
| **P2.** O estado anterior da pastagem e a paisagem diferem entre pixels com e sem evento? | Ao menos um grupo de preditores com OR por amplitude interquartil ≤ 0,80 ou ≥ 1,25, com IC 95% sem o valor 1 (§6) |
| **P3.** Dá para prever fora da amostra? | Ganho de AUC-PR sobre o modelo nulo, com IC 95% bootstrap por blocos > 0, na validação espacial **e** no holdout (§7) |
| **P4.** A regeneração persiste? | Descritiva: fração dos eventos de cada coorte ainda em classe 4 (e em qualquer nativa) em 2025, sempre acompanhada da ressalva de viés entre coortes (D02) |
| **P5.** White paper | Reporta P1–P4 tal como saíram. "Potencial" só é mapeado se P1, P2 e P3 passarem |

**[H] Hipóteses principais (P2)** — estão associados a maior chance de evento:
- vigor baixo ou em queda;
- biomassa (produtividade) baixa ou em queda;
- pastagem mais antiga;
- mais vegetação nativa no entorno e menor distância a ela;
- menos fogo recente;
- relevo mais declivoso;
- solo mais arenoso.

## 6. Desenho analítico da P2 (D03)

- **Unidade.** Pixel-ano em risco, de 2017 a 2021.
- **Amostragem.** Todos os eventos de uma amostra aleatória estratificada por ano e região, mais uma amostra aleatória de não-eventos do conjunto em risco, com frações de amostragem conhecidas. Distância mínima de 500 m entre pontos do mesmo ano.
  - Tamanhos-alvo: 20.000 eventos e 100.000 não-eventos, ajustáveis na F1 com registro na tabela de atrito.
- **Pontos excluídos.** Pontos das regiões do holdout ficam fora da P2 e do treino da P3.
- **Preditores**, medidos até t−1 para evitar vazamento:

| Grupo | Variáveis |
|---|---|
| Pastagem | Vigor e biomassa (média de t−3..t−1 e tendência de cada um); idade em t−1 (`pasture_origin_age_v2`; 100 como categoria "≥ desde 1985"); número de interrupções da pastagem desde 1985 (LULC) |
| Paisagem | % de vegetação nativa em 250, 500 e 1.000 m em t−1; distância à vegetação nativa estável (nativa em todos os anos de t−10 a t−1) |
| Fogo | MapBiomas Fogo Col. 5: frequência de 2000 a t−1 e anos desde o último fogo. **[C] Circularidade:** o classificador do Cerrado usa o tempo desde o fogo, então há sensibilidade sem o grupo fogo |
| Terreno, solo e clima | Declividade e HAND; % de areia (MapBiomas Solo col. 3); déficit hídrico climatológico (TerraClimate) |

- **Colinearidade (regra pré-fixada, D11).** Se \|r\| entre vigor e biomassa for > 0,7, a P2 reporta o efeito do grupo Pastagem em conjunto (teste conjunto de Wald), e não o de cada variável. A P3 mantém as duas.
- **Conferência da idade.** A idade do asset é comparada, em cada ponto, com a contagem de anos de 15 refeita da LULC. A concordância vai para a tabela de atrito.
- **Modelo.** Regressão logística com efeitos fixos de ano e região.
  - Preditores contínuos escalados pela amplitude interquartil.
  - Erros-padrão agrupados por blocos espaciais de ~50 km.
- **Relatório.** OR com IC 95%, correlação entre preditores e VIF. O tamanho de efeito vem na frente do p-valor.

## 7. Predição da P3 (D08)

- **Modelos:**
  - (i) a logística da P2;
  - (ii) gradient boosting (`HistGradientBoostingClassifier`), com grade pequena fixa e ajuste aninhado;
  - **nulo:** só ano e região.
- **Validação espacial.** Cinco folds por blocos de ~100 km, fora do holdout.
- **Transferência temporal.** Treina na réplica 2012–2016 e testa em 2017–2021.
- **Holdout.** As regiões sorteadas (§11) são avaliadas **uma única vez**, no fim.
- **Métricas.** AUC-PR (métrica principal), calibração e taxa de eventos no decil superior.
- **Comparador.** Concordância espacial com Silva et al. 2023 (*Environ Monit Assess* 195:1038), como teste de convergência.
- **O que o mapa final é:** probabilidade de transição observada sob o regime recente de uso. **Não** é aptidão ecológica.

## 8. Validação visual (P1, D06)

O plano completo está em `docs/plano_validacao_P1.md`. Em resumo:
- **Amostra:** 500 eventos (100 por ano), 150 pastagens sem evento e 100 eventos < 1 ha.
- **Ordem:** aleatória, com o intérprete cego quanto ao estrato.
- **Intérprete:** Mario.
- **Consistência intra-intérprete:** 10% da amostra é reinterpretada às cegas depois de ≥14 dias.
- **Critério de aprovação:** calculado sobre o estrato de eventos.

## 9. Regras de honestidade

1. **Congelamento.** A tag `protocolo-v1.0` precede qualquer extração de preditores e a validação visual.
2. **Desvios.** Toda mudança posterior vai para `docs/desvios.md`, com data, motivo e se ocorreu antes ou depois de ver resultados.
3. **Holdout.** As regiões sorteadas no congelamento ficam trancadas até a avaliação final da P3.
4. **Reportar tudo.** Resultados nulos e contrários às hipóteses entram no white paper com o mesmo destaque.
5. **Uma afirmação, uma marca.** Cada afirmação do texto final tem marca epistêmica ou vem de resultado reprodutível do repositório.
6. **Diagnósticos de F0.** Foram feitos antes do congelamento (`results/f0_diagnosticos/`). Não envolveram preditores e não foram usados para escolher definições pelo número de eventos.
7. **Exploração separada.** Notebooks exploratórios ficam em `notebooks/exploratorio/` e não geram números reportáveis.

## 10. Reprodutibilidade (nível intermediário)

- Git.
- `environment.yml`.
- Manifesto com asset, versão e `system:asset_size`.
- Sementes fixas.
- Scripts numerados.
- Tabela de atrito.
- Registro de decisões e desvios.

DVC e MLflow ficam de fora de propósito; reavaliar na F3 se houver muitos experimentos.

## 11. Itens que fecham no ato do congelamento

1. **Asset IBGE do limite do Cerrado:** `projects/ee-barroso2501/assets/biomas_IBGE`, filtro `NM_BIOMA = 'Cerrado'` (informado por Mario em 2026-10-29).
   - Substitui o limite RESOLVE provisório em todos os scripts.
   - Os diagnósticos de F0 com RESOLVE não são refeitos: foram só de definição.
   - **Biomassa:** o asset `pasture_biomass_v1` precisa ser confirmado pelo script 01 (bandas 2000–2025) e registrado no manifesto antes da tag (D11).
2. **Regiões de classificação:** `users/dh-conciani/collection7/classification_regions/vector_v2`, campo `mapb` (1–38).
   - **[C]** É o asset usado no código Col. 10/11 de `mapbiomas/brazil-cerrado` @ `93826bc`.
   - **[L]** A região 38 foi redesenhada na Col. 11 (KB:06). Verificar o acesso e a versão com `src/gee/05_verificar_limites_e_sortear_holdout.js`.
3. **Sorteio do holdout:** regiões ordenadas por número aleatório com semente **20261029**, acumuladas até ≥10% da área do Cerrado. O resultado é registrado em `results/f0_diagnosticos/F0_05_holdout.csv` antes da tag.

## 12. Fases

| Fase | Entrega | Critério de aprovação |
|---|---|---|
| F0 | Protocolo v1.0 congelado | §11 concluído |
| F1 | Eventos, tabela de atrito, validação visual (P1) | P1 |
| F2 | Comparação (P2) | P2 |
| F3 | Predição e mapa (P3) | P3 |
| F4 | Persistência (P4) | — |
| F5 | White paper (EN) | Revisão crítica independente |
