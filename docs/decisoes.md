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
| D01b | Persistência mínima na classe 4 | Proposta: classe 4 em t, t+1, t+2 e t+3 (seguimento fixo de 4 anos); persistência até 2025 como critério complementar | proposta |
| D02 | Janela temporal | Sugestão de Mario: busca 2017–2021, confirmação 2022–2025 | proposta, em avaliação |
| D03 | Desenho analítico | A: risco em tempo discreto; B: caso-controle pareado. Proposta: A | pendente |
| D04 | Papel da altura (SVH) | Proposta: só validação, e só com produto não usado no treino do MapBiomas | pendente |
| D05 | Escopo geográfico | Proposta: Cerrado inteiro, com resultados por ecorregião | pendente |
| D06 | Critério de aprovação da P1 (validação visual) | Tamanho da amostra e acerto mínimo, definidos antes de olhar os pontos | pendente |
| D07 | Origem: só 15 ou 15 + 21 | Proposta: só 15 (código 515); 21 (521) como sensibilidade | pendente |
| D08 | Réplica temporal (busca 2012–2016, confirmação 2017–2020) para testar transferência no tempo | Opcional; recomendada para a P3 | pendente |
| D09 | Fonte do evento | Proposta: código 5 do produto Desmatamento e Vegetação Secundária C11 (`by_coverage_v1` = 515) + LULC `coverage_v3` = 4 nos anos exigidos. Ver `produto_vegetacao_secundaria_c11.md` | proposta |
| D10 | Idade da pastagem | **Asset `mapbiomas_brazil_collection11_pasture_origin_age_v2`**. Ausência dos erros conhecidos documentada e reprodutível (`docs/verificacoes/pasture_origin_age_v2/`) | **decidida** (2026-10-27, Mario). Semântica 2xx = 200 + idade confirmada (F0_02). Pendente: cobertura do Cerrado pela grade auditada |

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
