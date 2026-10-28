# Protocolo — Potencial de regeneração natural em pastagens do Cerrado

**Versão:** 0.2 (rascunho, não congelado) · **Data:** 2026-10-27 · **Responsável:** Mario Barroso (TNC Brasil)
**Status:** aguardando decisões pendentes (ver `docs/decisoes.md`). Este protocolo só é **congelado** (tag `protocolo-v1.0`) depois que essas decisões forem tomadas e **antes** de extrair qualquer dado de desfecho.

**Marcas epistêmicas** (as mesmas da KB MapBiomas):
- **[D]** documentado (ATBD, catálogo oficial, artigo)
- **[C]** inferido do código ou do método, sem confirmação documental
- **[H]** hipótese a testar
- **[L]** lacuna: não sabemos
- **[E]** externo não documentado; serve para levantar críticas, nunca como evidência isolada

As citações da KB seguem a forma `KB:arquivo`, por exemplo `KB:06_metodos_col11.md`.

---

## 1. Por que recomeçar

O piloto de 2025 (`docs/piloto_2025.md`) é tratado como **exploratório**. Nenhum número dele entra no white paper. Ele deixou cinco lições, e cada uma virou uma regra deste protocolo:

| Problema do piloto | Regra aqui |
|---|---|
| Só pastagens que regeneraram foram analisadas, sem controle | Comparação obrigatória com pastagens que **não** regeneraram (§4) |
| Filtro de "similaridade" construído com o IC da média | Proibido. Similaridade só por modelo com validação fora da amostra (§6) |
| Fonte da altura não identificada | Toda camada precisa ter asset, versão e data no manifesto antes do uso (§3) |
| N divergente entre etapas | Cada filtro registra quantos entram e quantos saem (tabela de atrito) |
| Coleção 9, com regra de prevalência pastagem > savana | Uma única coleção (11) para toda a série (§3.1) |

## 1.1 Decisões já tomadas (v0.2)

- **Destino: só classe 4 (formação savânica)** da LULC C11 (D01). Os resultados valem para regeneração savânica, não para campo nem floresta.
- **Idade da pastagem:** asset `pasture_origin_age_v2` (D10).
- Em avaliação: janela 2017–2021 / 2022–2025 (D02) e evento definido pelo código 5 do produto de Vegetação Secundária C11 cruzado com a LULC (D09).

## 2. Perguntas, em ordem de dependência

Cada pergunta tem um **portão**. Se o portão falhar, o resultado é reportado como está e as perguntas seguintes são revistas. Não se ajusta o método para "fazer passar".

- **P1. Descrição — o evento existe e é mensurável?**
  - Quanto, onde e quando a pastagem (classe 15) do Cerrado passou a vegetação nativa e permaneceu assim, na Col. 11?
  - Portão: na validação visual independente (§5), a taxa de acerto dos eventos precisa ser suficiente para usá-los como rótulo.
  - O limiar é definido em D06, **antes** da validação.
- **P2. Comparação — o estado da pastagem antes da transição difere?**
  - Nos anos t−3 a t−1, as pastagens que regeneraram diferiam das que não regeneraram, no mesmo período e na mesma região?
  - Portão: diferença com tamanho de efeito relevante, além de p pequeno (o n será grande).
  - **[H]** principal: vigor baixo, pastagem antiga, proximidade de vegetação nativa e baixa frequência de reforma estão associados à regeneração.
- **P3. Predição — dá para antecipar fora da amostra?**
  - Um modelo treinado com P2 prevê regeneração em blocos espaciais e anos que ele não viu, melhor que um modelo nulo (só região e ano)?
  - Portão: ganho sobre o nulo em validação espacial por blocos.
- **P4. Persistência — a regeneração dura?**
  - Que fração dos eventos persiste ≥ N anos, e o que separa os que persistem dos que são reconvertidos?
  - **[D]** referência interna: no Cerrado, 21% do ganho consolida ≥10 anos, medido por célula (`anexo_regeneracao`, Col. 11).
- **P5. Síntese para o white paper.**
  - "Potencial" é definido **depois** de P2–P4, a partir do que se sustentou.
  - Se P3 falhar, o white paper reporta P1, P2 e P4 e diz que o mapeamento preditivo não se sustentou.

## 3. Dados

Detalhes, asset IDs e versões estão em `docs/fontes_dados.md`. Os pontos críticos estão abaixo.

### 3.1 Uma só coleção: MapBiomas Col. 11 (1985–2025)

- **[D]** Na Col. 11 caiu a regra que fazia pastagem prevalecer sobre formação savânica no Cerrado, e o corte de probabilidade da pastagem passou de >51% para ≥40% (KB:06).
- **[C]** Consequência: transições pastagem → savana em coleções anteriores misturam mudança real com efeito de regra de integração. Por isso, nada de misturar coleções.

### 3.2 Como o mapa produz (ou apaga) regeneração — ler antes de definir o evento

- **[D]** No Cerrado, pastagem e agricultura são fundidas na classe 21 no mapa do bioma. A pastagem final vem do tema transversal, que prevalece só sobre 21 e 25 (KB:06).
  - **[C]** Logo, uma transição pastagem → nativa na Col. 11 é, na prática, uma transição 21 → nativa do classificador do bioma.
- **[D]** Filtro de falsa regeneração: 1 a 3 anos de vegetação nativa entre dois blocos de ≥4 anos de 21 viram 21 (KB:06).
  - **[C]** Regeneração curta e intercalada é invisível. A duração mínima detectável é ≥4 anos.
- **[D]** A partir de 2023, classes nativas não podem substituir 21 (KB:06).
  - **[C]** Regeneração iniciada em 2023 ou depois é invisível, o que impõe censura à direita.
  - **Janela de eventos proposta:** início entre 2003 e 2018. A pastagem existe a partir de 2000, há 3 anos de pré-transição e pelo menos 5 anos de seguimento até 2023. (D02)
- **[D]** A Col. 11 mapeou cerca de 10 Mha a mais de pastagem que a 10.1, sobretudo sobre o antigo 21. A omissão da pastagem é de ~25% no início da série e ~12% nos anos recentes, confundida com formação florestal e savânica (KB:06).
  - **[C]** Parte das "regenerações" pode ser erro de classificação, pastagem ↔ savana aberta. Daí a validação própria (§5).
- **[E]** A validação oficial é fraca justamente em transições lentas e em bordas entre classes (KB:07, E04). A acurácia oficial por classe **não** serve de justificativa para conclusões sobre regeneração.

### 3.3 Candidatos a preditor (estado antes da transição: t−3 a t−1)

| Variável | Fonte | Observação |
|---|---|---|
| Vigor da pastagem | MapBiomas Pastagem Col. 11 (2000–2025) | **[D]** normalizado por estado e por região climática (KB:06). Compara pixels dentro da mesma região, não valores absolutos entre regiões |
| Biomassa da pastagem | Col. 11 `pasture_biomass_v1` (só no catálogo `.github`) | **[D]** derivada do uGPP do Global Pasture Watch. **[L]** acesso e período a confirmar (divergência D11 da KB) |
| Idade da pastagem | `mapbiomas_brazil_collection11_pasture_origin_age_v2` (D10) | Versão corrigida; verificação a anexar ao repositório. Histórico (interrupções) pode ser derivado da LULC C11 |
| Paisagem / fonte de propágulos | LULC Col. 11 | % de vegetação nativa em raios de 250 m, 500 m e 1 km; distância à vegetação nativa remanescente (nativa estável ≥10 anos) |
| Fogo | MapBiomas Fogo Col. 5 | Frequência e tempo desde o último fogo. **[C]** circularidade: o classificador do Cerrado usa tempo desde o fogo como preditor (KB:06). Usar com análise de sensibilidade com e sem fogo |
| Terreno | FABDEM / declividade, HAND | |
| Solo | MapBiomas Solo col. 3 (beta, % areia) | Silva et al. 2023 usam areia e CTC |
| Clima | Déficit hídrico climatológico (TerraClimate) | Silva et al. 2023 |
| Contexto fundiário e legal | CAR, UCs, TIs | Para P4 (pressão), não para P2 |

**Altura (SVH).** Não é usada como preditor nem como desfecho até resolver D04:
- **[D]** o Cerrado Col. 11 usa a altura de vegetação baixa do Global Pasture Watch como filtro de amostras de treino de pastagem e campo (KB:06), e a GEDI para as classes arbóreas;
- **[C]** usar essa mesma altura para "confirmar" regeneração é parcialmente circular;
- uso possível: **validação independente** de eventos, se houver produto de altura não usado no treino do MapBiomas.

## 4. Desenho analítico (proposta; D03)

**Opção A, recomendada: risco em tempo discreto (sobrevivência).**
- Unidade: o par pixel-ano de pastagem em risco.
- Evento: a transição para nativa que persiste ≥4 anos.
- Como todo pixel de pastagem está "em risco" a cada ano, o controle é natural e o atrito vira censura modelada, não viés.
- A amostragem é estratificada por ecorregião (Sano et al. 2019, as 38 regiões da KB) e por ano.

**Opção B: caso-controle pareado.**
- Cada evento é pareado a pixels de pastagem sem evento, no mesmo ano e na mesma ecorregião, com idade de pastagem semelhante.
- É mais simples, mas depende das escolhas de pareamento.

Nos dois casos:
- **O tamanho de efeito vem na frente da significância.** A matriz de correlação entre preditores é reportada.
- **O espaço é tratado na amostragem e na inferência:** espaçamento mínimo entre pontos e erros com blocos espaciais.

## 5. Validação dos eventos (P1)

- **Amostra:** estratificada por ano de transição, ecorregião e classe de destino (savana, campo, floresta).
- **Interpretação:** visual, com série Landsat e imagens de alta resolução quando houver.
- **Dupla interpretação** em uma subamostra, com taxa de concordância e categoria "incerto" (KB:07, E04).
- **Pergunta ao intérprete:** "houve abandono e recuperação de vegetação nativa, ou é erro ou oscilação de uso?"
- O **limiar do portão e o tamanho da amostra** são definidos em D06 **antes** de olhar os pontos.

## 6. Predição e mapeamento (P3), só se P2 passar

- **Validação:** por blocos espaciais (ecorregiões ou blocos de ~50–100 km) e temporal (treina 2003–2012, testa 2013–2018).
- **Modelo nulo obrigatório:** só ecorregião e ano.
- **Métricas:** AUC-PR (o evento é raro), calibração e taxa de acerto no decil superior de risco.
- **Comparação com Silva et al. 2023** (*Environ Monit Assess* 195:1038), que mapeou potencial com 186 parcelas de campo e RF: concordância espacial entre os dois mapas. É um teste de convergência, não de verdade.
- **O mapa final declara o que ele é:** probabilidade de transição observada no passado recente, condicionada ao regime de uso. **Não** é aptidão ecológica intrínseca.

## 7. Regras de honestidade

1. **Congelamento.** Antes de extrair desfechos, a tag `protocolo-v1.0` fixa perguntas, definições, desenho e portões.
2. **Desvios.** Toda mudança posterior vai para `docs/desvios.md`, com data, motivo e se foi feita antes ou depois de ver resultados.
3. **Holdout.** Uma ecorregião (ou conjunto delas) é sorteada e trancada até a avaliação final de P3.
4. **Reportar tudo.** Resultados nulos ou contrários às hipóteses entram no white paper com o mesmo destaque.
5. **Uma afirmação, uma marca.** No texto final, cada afirmação traz [D], [C], [H] ou [L], ou deriva de resultado reprodutível do repositório.
6. **Análise exploratória separada.** Notebooks exploratórios ficam em `notebooks/exploratorio/` e não geram números reportáveis.

## 8. Reprodutibilidade (nível aplicado: intermediário)

**O que está implementado:**
- **Git** para código e documentos.
- **`environment.yml`** com versões fixadas.
- **Manifesto de dados** (`data/manifestos/`): asset GEE, versão, banda, data de acesso e hash dos exports.
- **Sementes fixas.**
- **Scripts reexecutáveis em ordem numerada** (`src/`).
- **Tabela de atrito** gerada pelo código.
- **Registro de decisões** (`docs/decisoes.md`).

**O que fica de fora, de propósito:**
- DVC e MLflow, por desproporcionais neste estágio. A reavaliar em P3 se houver muitos experimentos de modelo.
- Containers.

**[L] O que falta:**
- conta e repositório GitHub;
- projeto GEE dedicado;
- local de armazenamento dos exports (Drive ou bucket).

## 9. Fases e entregáveis

| Fase | Entrega | Portão |
|---|---|---|
| F0 | Repositório + protocolo v1.0 congelado | Decisões D01–D06 tomadas |
| F1 | Definição operacional do evento; mapa e série de eventos; tabela de atrito; validação visual | Taxa de acerto ≥ limiar D06 |
| F2 | Comparação pré-transição (P2) | Efeito relevante |
| F3 | Modelo e mapa com validação espacial (P3) | Ganho sobre o nulo |
| F4 | Persistência e pressão (P4) | — |
| F5 | White paper (EN) com tudo marcado | Revisão crítica independente |
