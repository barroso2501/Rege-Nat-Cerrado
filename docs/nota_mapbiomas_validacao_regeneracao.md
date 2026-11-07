# Validação independente de eventos de regeneração pastagem → savana na Coleção 11

**Para:** Diretor Técnico do MapBiomas
**De:** Mario Barroso Ramos Neto — The Nature Conservancy (TNC Brasil)
**Data:** 5 de novembro de 2026
**Repositório:** https://github.com/barroso2501/Rege-Nat-Cerrado

---

## 1. Por que escrevo

A TNC está desenvolvendo uma análise sobre o **potencial de regeneração natural savânica em pastagens do Cerrado**, a partir da Coleção 11. Antes de usar os eventos de regeneração do mapa como dado, decidimos verificar, com interpretação visual independente, se eles correspondem a regeneração no terreno.

Essa verificação pode ser útil para as avaliações que o MapBiomas vem fazendo sobre os seus produtos. Ela mede a acurácia de uma **transição** lenta, e não de uma classe num ano. Escrevo para que o senhor tome conhecimento do trabalho enquanto ele está em andamento.

**Ainda não há resultado de acurácia.** A interpretação está em curso, e a chave que associa cada ponto ao seu estrato permanece fechada até o fim. Este texto descreve o processo e o motivo, não conclusões.

## 2. O problema que motivou a validação

**[D] Validação oficial.** A acurácia oficial da Coleção 11 é reportada **por classe e por ano**. No Cerrado:
- 89,6% no nível 1;
- 79,9% no nível 2;
- referência: 20.851 amostras, 1985–2025 (apêndice Cerrado, Col. 11).

Não há, que saibamos, acurácia reportada **para transições**, e menos ainda para transições lentas como a regeneração.

**Três características documentadas da Coleção 11 tornam a transição pastagem → formação savânica especialmente sensível:**

1. **[D] Omissão de pastagem confundida com savana.** O apêndice de Pastagem da Col. 11 informa omissão de cerca de 25% no início da série e 12% nos anos recentes, confundida sobretudo com formação florestal e savânica.
   - **[C]** Uma mudança de rótulo de 15 para 4 pode, portanto, refletir correção do classificador e não mudança no terreno.
2. **[D] Mudanças de regra na integração.** Na Col. 11 caiu a regra de prevalência pastagem > formação savânica no Cerrado, e o corte de probabilidade da pastagem passou de >51% para ≥40%.
   - **[C]** Transições 15 → 4 de coleções diferentes não são comparáveis.
3. **[D] Filtros que moldam a regeneração detectável:**
   - falsa regeneração (1–3 anos de nativa entre blocos de uso);
   - a partir de 2023, vegetação nativa não substitui a classe 21;
   - no produto de Vegetação Secundária, o evento só existe com ≥3 anos de vegetação e manchas ≤11 pixels são filtradas.

**A pergunta da validação:** quando o mapa registra pastagem → savana, o que aconteceu no terreno?

## 3. O que verificamos antes de interpretar (fase F0)

Todos os diagnósticos são reprodutíveis a partir de scripts no repositório (`src/`, `results/f0_diagnosticos/`).

| Verificação | Resultado |
|---|---|
| Código **515** do `deforestation_secondary_vegetation_by_coverage_v1` | Equivale exatamente a "código 5 no `v5` e classe 15 no ano anterior", com discordância zero em 2017–2021 |
| Produto de Vegetação Secundária × definição feita só com a LULC | Com a nossa definição de evento (15 em t−3..t−1; classe 4 em t..t+3), o produto retém 93,4–93,7% da área. Toda a diferença vem do filtro espacial de ~1 ha; as regras temporais não removem nada a mais |
| `pasture_origin_age_v2` | O código 2xx = 200 + anos consecutivos de classe 15 na `coverage_v3`, com 100% de concordância em 13.047 pixels. Uma auditoria separada não detectou os erros da versão anterior (código 1 e reuso de 100) |
| Regiões de classificação do Cerrado (`classification_regions/vector_v2`) | **As regiões vetoriais se sobrepõem** em cerca de 27% do bioma (2 a 4 regiões por pixel). A versão raster (`classification_regions/raster`) é uma partição: a soma das áreas difere 0,004% da área do Cerrado. Usamos a raster para separar treino e holdout |

**Magnitude do fenômeno:** com essa definição, os eventos pastagem → savana somam **~220–243 mil ha por ano** em 2017–2021 no Cerrado (limite provisório, antes da exclusão do holdout). A ordem de grandeza é a mesma da omissão de pastagem documentada, por isso a validação é necessária antes de qualquer uso analítico.

## 4. Como a validação está sendo feita

O protocolo foi **congelado antes** da extração de qualquer preditor e antes da interpretação (tag `protocolo-v1.0` no GitHub). Mudanças posteriores ficam em `docs/desvios.md`.

**Amostra (750 pontos, 2017–2021, fora de um holdout espacial):**

| Estrato | n | O que é |
|---|---|---|
| E — eventos | 500 (100 por ano) | 15 em t−3..t−1, código 515 em t, classe 4 em t..t+3. **Define o critério de aprovação** |
| N — pastagens sem evento | 150 | Continuaram classe 15 de t a t+3. Indicam regeneração que o mapa não registra |
| P — eventos < 1 ha | 100 | Mesma transição, removida pelo filtro espacial do produto |

**Desenho da amostra:**
- Sorteio aleatório por pixel dentro de cada estrato, com sementes gravadas.
- Distância mínima de 500 m entre pontos.
- Hashes SHA-256 de todas as entradas e saídas.

**Interpretação:**
- **Cegamento.** O intérprete não conhece o estrato do ponto nem consulta camadas do MapBiomas. A chave fica fechada, e o hash dela foi publicado antes da interpretação.
- **Imagens:** série Landsat e Sentinel-2 do período seco, NDVI 1985–2025 e alta resolução histórica.
- **Pergunta:** entre t−3 e t+3, a área deixou de ser pastagem manejada e passou a ter vegetação savânica em recuperação?
- **Categorias:**
  1. regeneração real;
  2. sem mudança aparente (só rótulo);
  3. outra mudança;
  4. incerto.
- **Consistência:** 10% dos pontos são reinterpretados às cegas depois de ≥14 dias.

**Critério pré-fixado:**
- Os eventos do mapa servem como rótulo se o acerto da categoria 1 nos 500 eventos for **≥75%**, com limite inferior do IC 95% **≥70%**.
- "Incerto" conta como erro.
- O resultado será publicado tal como sair, aprovado ou não.

**Andamento:** 229 de 750 pontos interpretados até 4 de novembro de 2026.

## 5. Por que isto pode interessar ao MapBiomas

- **Acurácia de uma transição lenta, medida diretamente.** Complementa a acurácia por classe e ano, que não captura bem bordas e mudanças graduais.
- **Separação entre os tipos de erro de regeneração.** A amostra distingue erro de comissão do evento (estrato E), regeneração não detectada (N) e efeito do filtro de área mínima (P). Isso pode informar ajustes de regras temporais e espaciais.
- **Diagnósticos de dados úteis para usuários.** Entre eles, a sobreposição das regiões vetoriais e a semântica confirmada do `pasture_origin_age_v2`.
- **Material aberto.** Protocolo, scripts e resultados ficam no repositório. Ao fim da interpretação, a tabela de pontos com as categorias e os comentários do intérprete pode ser compartilhada com as equipes de Cerrado, Pastagem e Vegetação Secundária, se houver interesse.

## 6. Limites que já reconhecemos

- **Intérprete único.** A reinterpretação mede consistência, não viés do intérprete.
- **Escopo do resultado.** Vale para a transição 15 → 4 no Cerrado, em 2017–2021. Não se estende a campo (12), floresta (3), outros biomas ou outros períodos.
- **Dependência do mapa.** A amostra vem do próprio mapa. Regeneração fora da classe 15 → 4 não entra.
- **Fim da série.** A confirmação de persistência (P4) depende dos anos 2022–2025, que a próxima coleção reprocessará.

## 7. Onde olhar no repositório

| Arquivo | Conteúdo |
|---|---|
| `PROTOCOLO.md` | Protocolo congelado (v1.0) |
| `docs/plano_validacao_P1.md` | Plano de validação, com as notas de interpretação |
| `docs/decisoes.md` / `docs/desvios.md` | Decisões, com teste crítico, e desvios depois do congelamento |
| `docs/produto_vegetacao_secundaria_c11.md` | Leitura do produto de Vegetação Secundária C11 (repositório `brazil-deforestation-sec-vegetation` @ `ee9707a`) |
| `results/f0_diagnosticos/` | Diagnósticos de F0 com resumos reprodutíveis |
| `results/f1/` | Amostra de validação (sem estratos) e registro de hashes |

Comentários críticos sobre o desenho são bem-vindos, sobretudo se houver informação sobre as regras ou os produtos que não esteja documentada publicamente.

Mario Barroso Ramos Neto
The Nature Conservancy — Brasil
