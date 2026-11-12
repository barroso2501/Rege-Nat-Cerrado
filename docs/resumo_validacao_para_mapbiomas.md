# Validação visual dos eventos pastagem → formação savânica (Coleção 11, Cerrado)

**Autor:** Mario Barroso Ramos Neto — The Nature Conservancy (TNC Brasil)
**Data:** 9 de novembro de 2026
**Repositório:** https://github.com/barroso2501/Rege-Nat-Cerrado

**Situação:** a interpretação dos 750 pontos está concluída. Ainda **não há resultado de acurácia**: a chave que associa cada ponto ao seu estrato só será aberta depois da reinterpretação de consistência, prevista para começar em 21/11/2026.

Convenção usada no texto:
- **[D]** fato documentado;
- **[C]** consequência que tiramos dele.

---

## 1. O que estamos validando

Validamos os **eventos de regeneração de pastagem para formação savânica** no Cerrado, na Coleção 11, entre **2017 e 2021**.

**Definição do evento, a mesma do protocolo:**

| Momento | Condição | Fonte |
|---|---|---|
| t−3 a t−1 | classe 15 (pastagem) nos três anos | `coverage_v3` |
| t | código **515** (recuperação a partir de pastagem) | `deforestation_secondary_vegetation_by_coverage_v1` |
| t a t+3 | classe 4 (formação savânica) nos quatro anos | `coverage_v3` |

**A pergunta da validação:** quando o mapa registra esse evento, houve **regeneração de vegetação savânica no terreno**, ou só mudou o rótulo?

**Os três estratos da amostra:**
- **E (eventos)** mede o erro de comissão do evento. **É o único estrato que decide a aprovação.**
- **N (pastagens que continuaram classe 15)** indica regeneração que o mapa não registra (omissão).
- **P (eventos menores que ~1 ha)** mostra o que o filtro espacial do produto de Vegetação Secundária remove.

## 2. Por que estamos validando

A TNC prepara um white paper sobre o **potencial de regeneração natural savânica em pastagens do Cerrado**. Os eventos do MapBiomas seriam o rótulo de "regeneração" de um modelo. Antes de usá-los, precisamos saber quanto eles correspondem ao que acontece no terreno.

**Quatro razões:**

1. **[D]** A acurácia oficial da Coleção 11 é reportada **por classe e por ano**. No Cerrado é de 89,6% no nível 1 e 79,9% no nível 2. **[C]** Isso não informa a acurácia de uma **transição**, menos ainda de uma transição lenta como a regeneração. Para regeneração, o erro de dois anos se combina e se concentra justamente nas áreas que mudam.
2. **[D]** O apêndice de Pastagem documenta omissão de pastagem de ~25% no início da série e de ~12% nos anos recentes, confundida sobretudo com formação florestal e savânica. **[C]** Parte das mudanças 15 → 4 pode ser correção do classificador, e não mudança no terreno.
3. **[D]** Duas regras de integração mudaram na Coleção 11:
   - caiu a regra de prevalência pastagem > formação savânica no Cerrado;
   - o corte de probabilidade da pastagem passou de >51% para ≥40%.

   **[C]** O que conta como transição depende dessas regras.
4. **[D]** Filtros moldam a regeneração detectável:
   - filtro de falsa regeneração;
   - exigência de ≥3 anos de vegetação no produto de Vegetação Secundária;
   - remoção de manchas de até 11 pixels.

**Magnitude:** com a nossa definição, esses eventos somam **~220–243 mil ha por ano** no Cerrado, em 2017–2021. A ordem de grandeza é a mesma da omissão de pastagem documentada. Por isso não dá para assumir que os eventos são regeneração.

## 3. Como estamos avaliando

### 3.1 Verificações antes da amostragem

Todas são reprodutíveis pelos scripts do repositório (`results/f0_diagnosticos/`).

- **Código 515.** Equivale exatamente a "código 5 no `deforestation_secondary_vegetation_v5` e classe 15 em t−1", com discordância zero em 2017–2021.
- **Produto de Vegetação Secundária × LULC.** Com a nossa definição, o produto retém 93,4–93,7% da área dos eventos definidos só pela LULC. A diferença vem toda do filtro espacial de ~1 ha.
- **`pasture_origin_age_v2`.** O código 2xx corresponde a 200 + anos consecutivos de classe 15, com 100% de concordância em 13.047 pixels.
- **Regiões de classificação.** As regiões vetoriais (`classification_regions/vector_v2`) se sobrepõem em ~27% do Cerrado. Para separar o holdout espacial usamos a versão raster, que é uma partição.

### 3.2 Protocolo congelado antes de olhar os dados

O protocolo foi fixado (tag `protocolo-v1.0`) **antes** do sorteio e da interpretação. Toda mudança posterior está registrada, com data e motivo, em `docs/desvios.md`.

### 3.3 Amostra

750 pontos em 2017–2021, fora de um holdout espacial de 4 regiões (~11,6% do Cerrado):

| Estrato | n | Como foi sorteado |
|---|---|---|
| E | 500 (100 por ano) | aleatório simples de pixels no estrato |
| N | 150 (30 por ano) | aleatório simples de pixels no estrato |
| P | 100 (20 por ano) | aleatório simples de pixels no estrato |

- Sementes fixas e distância mínima de 500 m entre pontos.
- Hashes SHA-256 de todas as entradas e saídas.

### 3.4 Interpretação cega

**O que o intérprete não vê:**
- Os pontos recebem códigos neutros (P001–P750) em ordem aleatória.
- O intérprete não vê o estrato nem consulta camadas do MapBiomas.
- A chave código → estrato ficou fechada. O hash dela foi registrado antes da interpretação.

**O que o intérprete usa:**
- composições Sentinel-2 e Landsat do período seco, ano a ano, de t−4 a 2025;
- NDVI do período seco de 1985 a 2025 no pixel;
- alta resolução histórica no Google Earth.

**Pergunta:** entre t−3 e t+3, a área deixou de ser pastagem manejada e passou a ter vegetação savânica em recuperação?

**Categorias:**
1. regeneração real;
2. sem mudança aparente (só rótulo);
3. outra mudança (agricultura, silvicultura, reconversão dentro da janela etc.);
4. incerto.

**Reconversão depois de t+3** não invalida o evento e conta como categoria 1. A persistência é avaliada separadamente.

**Também registrados:** confiança (alta/média/baixa), comentário e duas colunas descritivas que **não entram na análise**: já foi convertida? e já foi pastagem plantada?

### 3.5 Critério de aprovação, fixado antes

- **Acerto** = proporção de pontos do estrato E na categoria 1. A média dos anos é ponderada pela área de eventos de cada ano.
- "Incerto" conta como erro. Uma sensibilidade exclui os incertos.
- **Aprovado** se o acerto for **≥75%** e o limite inferior do IC 95% for **≥70%**.
- O resultado será reportado como sair, aprovado ou não. Também serão reportados:
  - o acerto por ano, por região e por confiança;
  - as proporções dos estratos N e P.

### 3.6 Controles de qualidade

- **Correções feitas antes de abrir a chave.** Erros mecânicos (digitação, aplicação de regra já escrita) entram no resultado principal. Casos de julgamento ficam só numa análise de sensibilidade. A planilha original não é editada.
- **Reinterpretação de consistência.** 10% dos pontos (75) são reinterpretados às cegas, com códigos novos, ≥14 dias depois. Medimos a concordância e o kappa intra-intérprete.

### 3.7 Limites que já reconhecemos

- **Intérprete único.** A reinterpretação mede consistência, não viés do intérprete.
- **A amostra parte do próprio mapa.** Regeneração fora da transição 15 → 4 não é avaliada, exceto o que o estrato N captar.
- **Escopo.** O resultado vale para 15 → 4 no Cerrado em 2017–2021. Não se estende a campo (12), floresta (3), outros biomas ou outros períodos.
- **Fim da série.** A confirmação de persistência depende dos anos finais da série, que a próxima coleção pode reprocessar.

---

Comentários sobre o desenho são bem-vindos, sobretudo informações sobre regras ou produtos que não estejam documentadas publicamente. Ao fim da análise, a tabela de pontos, com as categorias e os comentários, pode ser compartilhada com as equipes de Cerrado, Pastagem e Vegetação Secundária.
