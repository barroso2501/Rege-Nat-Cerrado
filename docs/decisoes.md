# Registro de decisões

Cada decisão registra:
- as **opções** consideradas;
- a **escolha**;
- a **justificativa**;
- o **teste crítico**: o que um revisor atacaria e por que a escolha se sustenta, ou com que ressalva.

Status possíveis:
- **pendente**;
- **proposta** (sugestão em avaliação);
- **decidida** (antes do congelamento);
- **revista** (depois do congelamento, com entrada em `desvios.md`).

| ID | Decisão | Situação atual | Status |
|---|---|---|---|
| D01 | Classe de destino da regeneração | **Só classe 4 da LULC Col. 11 (formação savânica)** | **decidida** (2026-10-27, Mario) |
| D01b | Persistência mínima na classe 4 | Classe 4 em t..t+3. Sensibilidades: S1 (qualquer nativa em t+1..t+3) e S5 (persistência até 2025) | **decidida** (2026-10-29) |
| D02 | Janela temporal | Busca 2017–2021, seguimento fixo t..t+3, persistência até 2025 como complemento (P4) | **decidida** (2026-10-29) |
| D03 | Desenho analítico | Risco em tempo discreto: pixel-ano em risco, logística com efeitos fixos de ano e região, erros-padrão agrupados por blocos (PROTOCOLO §6) | **decidida** (2026-10-29) |
| D04 | Papel da altura (SVH) | Fora do projeto: nem preditor nem desfecho | **decidida** (2026-10-29) |
| D05 | Escopo geográfico | Cerrado pelo limite IBGE (`projects/ee-barroso2501/assets/biomas_IBGE`, `NM_BIOMA = 'Cerrado'`); resultados também pelas 38 regiões MapBiomas | **decidida** (2026-10-29) |
| D06 | Critério de aprovação da P1 | Acerto ≥75% e limite inferior do IC 95% ≥70%; amostra de 500 eventos + 150 não-eventos + 100 eventos < 1 ha; intérprete único (Mario), com reinterpretação de 10% (`docs/plano_validacao_P1.md`) | **decidida** (2026-10-29) |
| D07 | Origem: só 15 ou 15 + 21 | Só 15 (515); origem 21 (521) como sensibilidade S3 | **decidida** (2026-10-29) |
| D08 | Réplica temporal | Busca 2012–2016, usada só no teste de transferência temporal da P3 | **decidida** (2026-10-29) |
| D09 | Fonte do evento | Produto (`by_coverage_v1` = 515) + LULC classe 4 em t..t+3; eventos < 1 ha como sensibilidade S2 | **decidida** (2026-10-29) |
| D10 | Idade da pastagem | **Asset `mapbiomas_brazil_collection11_pasture_origin_age_v2`**. Ausência dos erros conhecidos documentada e reprodutível (`docs/verificacoes/pasture_origin_age_v2/`) | **decidida** (2026-10-27, Mario). Semântica 2xx = 200 + idade confirmada (F0_02). Pendente: cobertura do Cerrado pela grade auditada |
| D11 | Biomassa da pastagem como preditor | Incluída no grupo Pastagem (média de t−3..t−1 e tendência), como índice relativo de produtividade; sensibilidade S6 de atraso de rótulo; regra de colinearidade com o vigor | **decidida** (2026-10-29, Mario); asset confirmado pelo script 01 (bandas `biomass_2000`…`_2025`, t/ha) |

---

## D01 — Só classe 4 (formação savânica)

**Decisão:** o evento de regeneração considera apenas pixels que passam de pastagem para a **classe 4** da LULC Col. 11.

**Justificativa** (a registrar por Mario; abaixo, as razões que o desenho sustenta):
- reduz a confusão pastagem ↔ campo nativo (classe 12), a mais crítica em transições herbáceas;
- concentra o estudo na fisionomia savânica, onde a regeneração por rebrota de órgãos subterrâneos é ecologicamente plausível [H];
- dá ao white paper uma mensagem focada.

**Teste crítico:**
1. **Ainda há confusão com a pastagem.** A omissão de pastagem na Col. 11 é confundida justamente com formação florestal **e savânica** (KB:06).
   - A restrição à classe 4 reduz a confusão com campo, mas não elimina a confusão pastagem ↔ savana.
   - A validação visual (P1) continua indispensável.
2. **Escopo do resultado.** Os achados valem para regeneração savânica. Não podem ser estendidos ao "Cerrado" como um todo nem a campo (12) ou floresta (3).
   - Regeneração para campo pode ser ecologicamente importante e fica fora por construção. O white paper deve dizer isso [L].
3. **Instabilidade da fisionomia.** Um pixel pode alternar entre 4 e 3, ou entre 4 e 12, durante o seguimento.
   - Exigir classe 4 em todos os anos é estrito. Aceitar "qualquer nativa com 4 em t" é permissivo.
   - Proposta: o critério principal exige 4 em t..t+3. A sensibilidade aceita nativa (2 no produto) em t+1..t+3 com 4 em t.
   - Reportar quanto o resultado muda.
4. **Vínculo com o produto.** O produto de Vegetação Secundária não distingue fisionomias. A restrição à classe 4 vem do cruzamento com a LULC (D09).

**Situação:** decidida, com a justificativa formal pendente de redação por Mario e a sensibilidade do item 3 a definir em D01b.

## D02 — Janela 2017–2021 / 2022–2025 (em avaliação)

**A favor:**
- regime de uso e de política atuais;
- evita problemas antigos da série;
- volume de eventos provavelmente suficiente.

**Ressalvas** (detalhe em `produto_vegetacao_secundaria_c11.md` §3 e KB:06):
1. **2022–2025 é confirmação de persistência, não validação.** É o mesmo classificador. A validação é a visual (P1).
2. **Viés entre coortes.** Os filtros de falsa regeneração (LULC) e a reversão de blocos curtos (produto) apagam reconversões rápidas nas coortes antigas e não nas recentes.
   - A persistência parece maior nas coortes antigas por artefato.
   - Mitigação: seguimento fixo (D01b) e comparação entre coortes sempre acompanhada deste aviso.
3. **Fim da série.**
   - Os anos 2024–2025 usam regras específicas e confiança menor.
   - Serão reprocessados na Col. 12.
   - Congelar `coverage_v3` e `v5` no manifesto.

## D10 — Idade da pastagem

**Asset:** `projects/mapbiomas-public/assets/brazil/lulc/collection11/mapbiomas_brazil_collection11_pasture_origin_age_v2`

**Verificação** (anexada em 2026-10-28): auditoria direcionada de Mario, aceita em 2026-10-20 e reproduzida localmente em 2026-10-28 com `PASS`.
- Domínio: 21.869 células, Cerrado + Amazônia, 1985–2025.
- Não foram detectados o código 1, o 100 após não-pastagem nem o reuso de 100.
- Detalhe e limites: `docs/verificacoes/pasture_origin_age_v2/USO_NO_PROJETO.md`.
- Com isso, a afirmação deixa de ser [E].

**Teste crítico** (o que um revisor ainda atacaria):
1. **A auditoria verifica códigos, não idades.**
   - O valor 2xx só foi checado quanto à faixa.
   - Resposta: a extração do projeto compara a idade do asset com a contagem de anos consecutivos de classe 15 em cada ponto usado, e reporta a concordância.
2. **O domínio auditado pode não cobrir todo o Cerrado.** Resposta: depende do critério da grade de seleção [L]. Pontos fora do domínio entram como sensibilidade.
3. **O asset remoto pode mudar sem aviso.** Resposta: os metadados do asset vão para o manifesto no momento da extração.

**Resultado F0_02 (2026-10-29)** — pendência da semântica do 2xx **fechada**:
- Amostra: 13.047 pixels do Cerrado com pastagem em todos os anos de 2010 a 2020, não contínua desde 1985 (`results/f0_diagnosticos/F0_02_resumo.md`).
- **2xx = 200 + idade.** A idade é o número de anos consecutivos de classe 15 na `coverage_v3`, contando o ano corrente (vale 1 no primeiro ano).
- Concordância com a contagem refeita a partir da LULC: 100%. Incremento anual: +1 em todos os 130.470 pares de anos.
- O reinício da contagem após uma interrupção da pastagem anterior a 2010 está implicitamente confirmado: a contagem da LULC zera nas interrupções e bateu em 100%.
- **Consequência [C]:** a idade é derivada deterministicamente da própria LULC. Ela não traz informação independente da série de cobertura; é uma conveniência, não uma segunda fonte. Erros de classificação da pastagem na LULC passam integralmente para a idade.
- **Não testado:** o comportamento em lacunas (NODATA/27) dentro de um episódio, e fora da amostra (pastagem que começou depois de 2010).

**Pendente** (deixado em aberto por decisão de Mario, 2026-10-28):
- confirmar o critério da grade `grade_hex_CeAmz_selecao`.

## D09 — Fonte do evento: resultado do diagnóstico F0_04 (2026-10-29)

Detalhe: `results/f0_diagnosticos/F0_04_resumo.md`. Limite do Cerrado provisório (RESOLVE).

**Achados [D: reprodutível]:**
1. **A codificação 515 confere.** 515 ≡ (v5 = 5 e cobertura(t−1) = 15), com discordância 0 em 2017–2021.
2. **Diferença entre produto e só-LULC.**
   - Com a definição estrita, o produto retém 93,4–93,7% da área dos eventos só-LULC.
   - **Os 6–7% removidos vêm só do filtro espacial do produto:** manchas ≤ 11 pixels (~1 ha), código 7.
   - As regras temporais do produto não removem nada além do que a definição estrita já exclui.
3. **Magnitude:** 220–243 mil ha/ano de eventos com o produto. Total de 1,14 Mha em 2017–2021, com coortes disjuntas.
   - Cerca de 77–83% de toda a recuperação a partir de pastagem (515) já é classe 4 no primeiro ano.
4. **Origem 21 (D07):** soma 27–36 mil ha/ano a mais, cerca de 12–16% do principal.

**Implicação [C].** Para a definição estrita, a escolha entre produto e LULC se reduz a uma escolha de **área mínima mapeável**. Usar o produto:
- dá comparabilidade com números oficiais do MapBiomas;
- deixa a área mínima documentada por terceiros.

O custo é excluir regeneração em manchas < 1 ha. Ela fica medida como sensibilidade (`soLulc`, cerca de 15–17 mil ha/ano).

**Teste crítico:**
- **Viés espacial da área mínima.** Excluir manchas < 1 ha pode deslocar a análise para paisagens com regeneração em blocos maiores. Mitigação: comparar a distribuição espacial dos eventos `soLulc` e `produto` na fase F1.
- **A contagem não valida o evento.** Uma área de ~230 mil ha/ano de pastagem → savana é compatível tanto com regeneração real quanto com confusão pastagem ↔ savana do classificador (omissão de pastagem de ~12% nos anos recentes, KB:06). **Só a validação visual (P1, D06) separa as duas.**
- **Ressalva de protocolo.** Esta contagem foi vista antes do congelamento. A proposta acima segue o critério que já estava registrado (o produto como fonte, por comparabilidade), não o número de eventos.

## Decisões de 2026-10-29 — aprovadas por Mario para congelar o protocolo

Mario aprovou D01b, D02, D03, D04, D07, D08 e D09 conforme as propostas. Para D05 e D06, fez as escolhas registradas na tabela. O teste crítico de cada uma está nas seções acima e no PROTOCOLO. Abaixo, só o que é novo.

### D06 — Intérprete único

**Escolha de Mario:** só Mario interpreta.

**Teste crítico:**
- Sem segundo intérprete, não há como medir viés sistemático do intérprete. Isso é justamente a crítica que o projeto faz à validação oficial (KB:07, E04).
- **Mitigação incluída:** reinterpretação cega de 10% depois de ≥14 dias, com kappa intra-intérprete.
  - Mede consistência, não viés.
- **O white paper declara a limitação.**
- Se Mario preferir, a reinterpretação de 10% pode sair. Nesse caso, precisa sair **antes** da tag.

### D04 — Altura fora

**Teste crítico:** perde-se um indicador estrutural de regeneração.

**Resposta:**
- não há produto de altura anual independente do treino do MapBiomas (KB:06);
- o produto do piloto não foi identificado.

Fica como [L] para trabalho futuro.

### D03 — Desfecho binário com regeneração não estrita contada como não-evento

**Teste crítico:** isso dilui o contraste entre pixels com e sem evento.

**Resposta:** a sensibilidade S4 exclui esses pixels dos não-eventos.

### D11 — Biomassa da pastagem (aprovada por Mario em 2026-10-29)

**Origem.** O produto estava entre os candidatos na v0.1. Saiu da v1.0-rc por omissão, sem decisão registrada, e foi reincluído antes do congelamento.

**Asset:** `projects/mapbiomas-public/assets/brazil/lulc/collection11/mapbiomas_brazil_collection11_pasture_biomass_v1`.

**[D] Método**, pela descrição do MapBiomas e KB:06:
- GPP estimado de Landsat por modelo LUE (0,5 gC/m²/dia/MJ), a partir do uGPP do Global Pasture Watch;
- convertido em biomassa por fator constante (0,0115);
- GPP validado com torres de fluxo; conversão para forragem validada só em caráter preliminar.

**Uso.** Índice relativo de produtividade. Como o fator é constante, equivale ao GPP para comparar pixels. Os valores em t/ha **não** são interpretados.

**Teste crítico:**
1. **Atraso de rótulo [C].** A LULC e a biomassa vêm das mesmas imagens Landsat. Biomassa alta em t−1 pode ser regeneração já em curso que o classificador ainda chama de pastagem.
   - Isso inflaria a P3 sem conteúdo preditivo real.
   - O mesmo vale para o vigor.
   - **Mitigação:** a sensibilidade S6 mede vigor e biomassa só em t−3 e t−2.
2. **Colinearidade com o vigor.** Mitigação pela regra pré-fixada: se |r| > 0,7, efeito do grupo em conjunto na P2.
3. **[L] Disponibilidade.** O asset aparece só no catálogo `.github`, não no toolkit (D11 da KB). Confirmar pelo script 01 antes da tag.
4. **[L] Confiabilidade no Cerrado.** Não sabemos quantas torres de fluxo da validação do GPP estão em pastagens do Cerrado.
