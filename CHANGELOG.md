# Changelog

Cada pacote zipado enviado ao repositório tem uma entrada aqui. Formato: data · versão do pacote · arquivos novos/alterados/removidos.

## 2026-10-27 · pacote 0.1
**Novos:** estrutura inicial completa.
- `README.md`, `PROTOCOLO.md` (v0.1, rascunho, não congelado), `CHANGELOG.md`
- `docs/decisoes.md` (D01–D07 pendentes), `docs/desvios.md`, `docs/fontes_dados.md`, `docs/piloto_2025.md`
- `environment.yml`, `.gitignore`
- `data/README.md`, `data/manifestos/manifesto.csv` (só cabeçalho)
- `src/README.md`, `notebooks/README.md`, `results/README.md`, `.gitkeep` em pastas vazias

## 2026-10-27 · pacote 0.2
**Novos:**
- `docs/produto_vegetacao_secundaria_c11.md` — leitura do produto MapBiomas Desmatamento e Vegetação Secundária C11 (GitHub @ `ee9707a`) e avaliação de uso.

**Alterados:**
- `PROTOCOLO.md` → v0.2: seção 1.1 (decisões tomadas); linha de idade da pastagem na §3.3.
- `docs/decisoes.md`: D01 decidida (só classe 4) com teste crítico; D10 decidida (idade = `pasture_origin_age_v2`); D02 em avaliação com ressalvas; novas D01b, D08, D09.
- `docs/fontes_dados.md`: assets `deforestation_secondary_vegetation_v5`, `..._by_coverage_v1` e `pasture_origin_age_v2`.
- `CHANGELOG.md`.

**Removidos:** nenhum.

## 2026-10-28 · pacote 0.3
**Novos:**
- `docs/verificacoes/pasture_origin_age_v2/` — subconjunto do pacote de verificação do asset de idade de pastagem: relatório, manifesto, scripts GEE finais e registros de aceite e validação.
  - `USO_NO_PROJETO.md` diz o que a verificação fecha e o que fica pendente.
  - Zip completo: SHA-256 `55b9efda…91dc`.

**Alterados:**
- `docs/decisoes.md`: D10 com a verificação anexada, teste crítico e pendências residuais.
- `docs/fontes_dados.md`: linha da idade da pastagem.
- `CHANGELOG.md`.

**Removidos:** nenhum.

## 2026-10-28 · pacote 0.4
**Novos:**
- `src/gee/00_config_comum.js`, `01_verificar_assets.js`, `02_semantica_idade_pastagem.js`, `03_conferir_codigo_515.js`, `04_contagem_eventos_produto_vs_lulc.js` — verificações da F0.
- `src/gee/README.md` — ordem de execução.
- `results/f0_diagnosticos/README.md`.

**Alterados:**
- `PROTOCOLO.md` §7: diagnósticos de F0 permitidos antes do congelamento.
- `CHANGELOG.md`.

**Removidos:**
- `src/gee/.gitkeep` (a pasta deixou de estar vazia). No GitHub, apague esse arquivo manualmente, porque o upload pelo navegador não remove nada.

## 2026-10-28 · pacote 0.5
**Novos:**
- `results/f0_diagnosticos/01_assets_20261028.txt` — saída do script 01. Os 5 assets existem, com as bandas esperadas.

**Alterados:**
- `src/gee/02_semantica_idade_pastagem.js` → versão 2. A amostragem por pontos aleatórios substitui o `stratifiedSample`, que estourava o tempo no Console. Lê os códigos ano a ano de 2010 a 2020. A análise completa sai pelo Export.
- `data/manifestos/manifesto.csv` — 5 assets registrados, com a última coluna (`sha256`) usada provisoriamente para o `system:asset_size`.
- `CHANGELOG.md`.

**Removidos:** nenhum.

## 2026-10-29 · pacote 0.6
**Novos:**
- `results/f0_diagnosticos/F0_02_semantica_idade_pastagem.csv` (SHA-256 `bc4c2247…8968`) e `F0_02_resumo.md`.
- `src/python/f0_02_resumo_semantica_idade.py` — gera o resumo a partir do CSV.
- `src/gee/03_exportar_indicadores_1km.js` e `04_somar_indicadores.js` — substituem os antigos 03 e 04, que estouraram 12 h.

**Alterados:**
- `docs/decisoes.md` (D10): semântica 2xx = 200 + idade confirmada; pendente só o critério da grade.
- `docs/verificacoes/pasture_origin_age_v2/USO_NO_PROJETO.md`: atualização de 2026-10-29.
- `src/gee/README.md`.
- `CHANGELOG.md`.

**Removidos (apagar à mão no GitHub):**
- `src/gee/03_conferir_codigo_515.js`
- `src/gee/04_contagem_eventos_produto_vs_lulc.js`
- `src/python/.gitkeep`

## 2026-10-29 · pacote 0.7
**Novos:**
- `results/f0_diagnosticos/F0_04_contagem_eventos.csv` e `F0_04_resumo.md`.
- `src/python/f0_04_resumo_contagem_eventos.py`.

**Alterados:**
- `docs/decisoes.md`: D09 com o resultado do F0_04 e o teste crítico.
- `CHANGELOG.md`.

**Removidos:** nenhum.

## 2026-10-29 · pacote 0.8 — candidato a congelamento
**Novos:**
- `docs/plano_validacao_P1.md` — plano de validação visual (D06).
- `src/gee/05_verificar_limites_e_sortear_holdout.js` — confere os limites e sorteia o holdout (semente 20261029).

**Alterados:**
- `PROTOCOLO.md` → v1.0-rc, reescrito e consistente com todas as decisões: evento, conjunto em risco, sensibilidades S1–S5, critérios de aprovação de P1–P3, desenho da P2, predição da P3 e itens do congelamento (§11).
- `docs/decisoes.md`: D01b–D09 decididas.
- `README.md`.
- `CHANGELOG.md`.

**Removidos:** nenhum.

## 2026-10-29 · pacote 0.9
**Alterados:**
- Todos os scripts em `src/gee/` (00, 02, 03, 04, 05): o limite do Cerrado agora é `projects/ee-barroso2501/assets/biomas_IBGE`, com `NM_BIOMA = 'Cerrado'`.
- `PROTOCOLO.md` §1 e §11, `docs/decisoes.md` (D05) e `docs/fontes_dados.md`.
- `CHANGELOG.md`.

**Removidos:** nenhum.

## 2026-10-29 · pacote 1.0-rc2
**Alterados:**
- `PROTOCOLO.md`: biomassa da pastagem no §3 e no grupo Pastagem do §6; nova sensibilidade S6 (atraso de rótulo); regra de colinearidade; hipótese no §5; verificação do asset no §11.
- `docs/decisoes.md`: nova D11, com o teste crítico.
- `docs/fontes_dados.md`: linha da biomassa.
- `src/gee/00_config_comum.js` e `01_verificar_assets.js`: incluem o asset de biomassa.
- `CHANGELOG.md`.

**Removidos:** nenhum.

## 2026-10-29 · pacote 1.0-rc3
**Alterados:**
- `src/gee/05_verificar_limites_e_sortear_holdout.js`: correção de bug. O resultado do `iterate` era lido como `ee.List` em vez de `ee.Dictionary` (erro "Invalid argument specified for ee.Number(): fs"). A lógica do sorteio e a semente não mudaram.
- `CHANGELOG.md`.

**Removidos:** nenhum.

## 2026-10-29 · pacote 1.0-rc4
**Novos:**
- `src/gee/05b_diagnostico_sobreposicao_regioes.js` — diagnóstico de sobreposição entre as 38 regiões.
- `results/f0_diagnosticos/F0_05_holdout_tentativa1.csv` — sorteio da tentativa 1, ainda não aceito.

**Alterados:**
- `data/manifestos/manifesto.csv`: biomassa registrada.
- `docs/fontes_dados.md` e `docs/decisoes.md` (D11): asset de biomassa confirmado, com prefixo de banda `biomass_`.
- `PROTOCOLO.md` §11: biomassa confirmada; tentativa 1 do holdout com a pendência de sobreposição.
- `CHANGELOG.md`.

**Removidos:** nenhum.

## 2026-10-29 · pacote 1.0-rc5
**Alterados:**
- `src/gee/05_verificar_limites_e_sortear_holdout.js` → versão 2:
  - partição pelo raster de regiões, sem sobreposição;
  - mesma ordem de sorteio;
  - autoverificação de área;
  - zona de exclusão de 10 km exportada como asset.
- `PROTOCOLO.md` §11: resultado do 05b e proposta da versão 2.
- `CHANGELOG.md`.

**Removidos:** nenhum.

## 2026-10-29 · pacote 1.0-rc6
**Novos:**
- `results/f0_diagnosticos/F0_05_holdout_tentativa2.csv` — registro histórico.
- `results/f0_diagnosticos/F0_05_holdout.csv` — holdout **definitivo**: regiões 13, 9, 28, 16 (11,56%).
- `src/python/f0_05_holdout_final.py` — gera o CSV definitivo.

**Alterados:**
- `src/gee/05_verificar_limites_e_sortear_holdout.js` → versão 3: holdout fixo, nada aleatório; só confere a fração e exporta a zona de exclusão.
- `PROTOCOLO.md` §11, `docs/decisoes.md` (holdout) e `README.md`.
- `CHANGELOG.md`.

**Removidos:** nenhum.

## 2026-10-29 · pacote 1.0 — PROTOCOLO CONGELADO
**Alterados:**
- `PROTOCOLO.md` → versão 1.0, congelada.
- `docs/decisoes.md` (D06): reinterpretação cega de 10% mantida.
- `data/manifestos/manifesto.csv`: asset da zona de exclusão registrado.
- `README.md`: F0 concluída.
- `CHANGELOG.md`.

**Removidos:** nenhum.

**Depois deste pacote:** criar a tag `protocolo-v1.0` no GitHub. Toda mudança posterior vai para `docs/desvios.md`.

## 2026-10-29 · pacote 1.1 — início da F1 (pós-congelamento)
**Novos:**
- `src/gee/10_f1_candidatos_amostra_p1.js` — candidatos da amostra P1 por ano e estrato, fora do holdout.
- `src/python/f1_11_selecionar_amostra_p1.py` — sorteio final com semente 20261030, distância mínima de 500 m, códigos neutros e os 10% da reinterpretação. Separa o arquivo de interpretação da CHAVE.
- `results/f1/README.md` — regras de cegamento.

**Alterados:**
- `CHANGELOG.md`.

**Removidos:** nenhum.

**Desvios do protocolo:** nenhum. A implementação segue `docs/plano_validacao_P1.md`. Detalhe de execução: o sorteio final é feito em Python, não no GEE, pela lição do F0_05.

## 2026-10-29 · pacote 1.2
**Novos:**
- `src/gee/10a_f1_fracoes_estratos_1km.js`, `src/gee/10b_f1_celulas_candidatas.js`, `src/gee/10d_modelo.js.txt` (modelo do script 10d).
- `src/python/f1_10c_sortear_celulas.py` — sorteio das células e geração do script 10d.

**Alterados:**
- `src/python/f1_11_selecionar_amostra_p1.py`: entrada passa a ser `F1_10d_candidatos_*.csv`.
- `results/f1/README.md`: nova ordem dos passos.
- `CHANGELOG.md`.

**Removidos (apagar à mão no GitHub):**
- `src/gee/10_f1_candidatos_amostra_p1.js`. O `stratifiedSample` não processou em 5 h; as tarefas foram canceladas.

**Desvios do protocolo:** nenhum. Mudança de implementação: o sorteio continua equivalente a um sorteio aleatório simples por pixel dentro de cada estrato.

## 2026-10-29 · pacote 1.3
**Novos:**
- `results/f1/amostra_p1_passoC_registro.json` — semente, hashes e contagem de células do passo C.
  - Entrada: 407.480 células.
  - Sorteadas: 400 células E e 100 células P por ano.
- `src/gee/10d_f1_pixel_por_celula.js` — gerado no passo C. **Entregue fora do pacote e fora do GitHub até o fim da interpretação**, porque contém os centros das células por estrato. O hash está no registro.

**Conferência de consistência** (área implícita nas frações × área da célula, mil ha por ano):
- E: 197, 211, 196, 190 e 191 (2017–2021);
- P: 13–15.
- Comparação com o F0_04 (230–243 e 15–17), que tinha limite RESOLVE e incluía o holdout: a razão ~0,86–0,87 é compatível com a exclusão de 11,6% do holdout mais a troca de limite. Sem anomalia.

**Alterados:**
- `CHANGELOG.md`.

**Removidos:** nenhum.

## 2026-10-29 · pacote 1.4
**Alterados:**
- `src/gee/10d_modelo.js.txt` → versão 2. A versão 1 esgotou a memória em 2017, 2018 e 2020. Mudanças:
  - a zona e o limite do Cerrado são lidos do asset de zona, sem rasterizar o polígono;
  - um `reduceRegions` por estrato, em vez de 500 `reduceRegion`;
  - os pontos N são sorteados no retângulo envolvente, com rejeição;
  - 15 tarefas (ano × estrato) em vez de 5.
- `src/gee/10d_f1_pixel_por_celula.js` regenerado (entregue fora do pacote). **Lista de células idêntica** à versão 1, porque a semente e a entrada são as mesmas. Novo hash em `results/f1/amostra_p1_passoC_registro.json`.
- `src/python/f1_11_selecionar_amostra_p1.py`: padrão de entrada `F1_10d_candidatos_*_*.csv`.
- `CHANGELOG.md`.

**Removidos:** nenhum.

**Desvios do protocolo:** nenhum.

## 2026-10-29 · pacote 1.5 — amostra P1 pronta para interpretação
**Novos:**
- `results/f1/amostra_p1_interpretacao.csv` — 750 pontos sem estrato.
- `results/f1/amostra_p1_registro.json` — semente, atrito e hashes, inclusive da CHAVE.
- `src/gee/12_modelo_ferramenta_interpretacao.js.txt` e `src/gee/12_ferramenta_interpretacao_p1.js` — ferramenta de interpretação no GEE: Landsat e Sentinel-2 do período seco, NDVI 1985–2025 e link para o Google Earth.
- `src/python/f1_12_gerar_ferramenta.py`.

**Alterados:**
- `results/f1/README.md`.
- `CHANGELOG.md`.

**Fora do pacote:** `NAO_ABRIR_ate_fim_interpretacao.zip`, com a CHAVE e o script 10d.

**Desvios do protocolo:** nenhum.

## 2026-10-30 · pacote 1.6
**Alterados:**
- `src/gee/12_modelo_ferramenta_interpretacao.js.txt` e `12_ferramenta_interpretacao_p1.js` → versão 2.
  - Motivo: Mario levou ~6 min por ponto nos 10 primeiros, usando só Sentinel-2 e Google Earth.
  - Miniaturas por ano (t−4 a 2025) no painel, em vez de camadas no mapa: Sentinel-2 a partir de 2016, Landsat antes.
  - Rótulo "centro da janela (t)" no lugar de "ano de referência".
  - Camada NICFI removida.
- `CHANGELOG.md`.

**Removidos:** nenhum.

**Desvios do protocolo:** nenhum. A amostra e as categorias são as mesmas.

## 2026-10-31 · pacote 1.7
**Alterados:**
- `docs/desvios.md`: **primeiro desvio registrado**, com as colunas auxiliares da validação visual (antes de qualquer resultado).
- `docs/plano_validacao_P1.md`: novo §2.1 com as definições (`sim` / `não` / `talvez`), uma orientação de coerência não obrigatória e o uso: as colunas não entram em análise e só explicam as categorias 2–4 (decisão de Mario, 2026-10-31).
- `results/f1/amostra_p1_interpretacao.csv`: colunas `ja_foi_convertida` e `ja_foi_pastagem_plantada`.
- `src/gee/12_modelo_ferramenta_interpretacao.js.txt` e `12_ferramenta_interpretacao_p1.js`: legenda das colunas.
- `CHANGELOG.md`.

**Removidos:** nenhum.

## 2026-11-04 · pacote 1.8
**Alterados:**
- `docs/plano_validacao_P1.md`: novo §2.0 com a nota de interpretação N1 (reconversão depois da regeneração).
- `docs/desvios.md`: registro do esclarecimento N1.
- `CHANGELOG.md`.

**Andamento da P1:** 229 de 750 pontos interpretados. Máximo de 70 pontos num dia.
- Mantido o tamanho da amostra (750). A redução de N e P, considerada em 2026-10-30, não é necessária.

**Removidos:** nenhum.

## 2026-11-05 · pacote 1.9
**Novos:**
- `docs/nota_mapbiomas_validacao_regeneracao.md` — nota ao Diretor Técnico do MapBiomas: motivo e processo da validação visual dos eventos pastagem → savana (P1). Sem resultados de acurácia; interpretação em andamento (229/750).

**Alterados:** nenhum. **Removidos:** nenhum.

## 2026-11-07 · pacote 1.10
**Interpretação P1 concluída (750/750).** CHAVE ainda fechada.

**Novos:**
- `results/f1/interpretacao/p1_interpretacao_bruta_2026-11-07.csv` — planilha do intérprete, sem edição.
- `results/f1/interpretacao/correcoes_pre_desbloqueio.csv` — 5 correções documentadas (3 na análise principal, 2 só na sensibilidade).
- `src/python/f1_13_validar_interpretacao.py` → `results/f1/interpretacao/p1_interpretacao_analise.csv` e `p1_validacao_registro.json`.
- `src/python/f1_14_preparar_reinterpretacao.py` → `results/f1/reinterpretacao/amostra_p1_reinterpretacao.csv`, `reinterp_registro.json` e `src/gee/14_ferramenta_reinterpretacao_p1.js`.

**Alterados:**
- `docs/desvios.md`: desvio de 2026-11-07 (confiança em 3 níveis; regra das correções; data e forma da reinterpretação; CHAVE fechada até o fim dela).
- `results/f1/README.md`: situação em 2026-11-07.
- `CHANGELOG.md`.

**Removidos:** nenhum.


## 2026-11-09 · pacote 1.11
**Novos:**
- `docs/resumo_validacao_para_mapbiomas.md` — resumo para a equipe do MapBiomas: o que, por que e como validamos (situação: interpretação concluída, chave fechada, sem resultado).

**Alterados:** `CHANGELOG.md`. **Removidos:** nenhum.

## 2026-11-12 · pacote 1.12
**Critério da P1 calculado: reprovado** (E: 67,6%, IC 95% 63,4–71,5%). Preliminar quanto à consistência.

**Novos:**
- `src/python/f1_15_calcular_criterio_p1.py`.
- `results/f1/criterio/p1_criterio.json` e `results/f1/criterio/p1_criterio_resumo.md`.

**Alterados:**
- `docs/desvios.md`: desvio de 2026-11-12 (CHAVE aberta antes da reinterpretação), registrado antes da abertura.
- `results/f1/README.md`: situação em 2026-11-12.
- `CHANGELOG.md`.

**Removidos:** nenhum. **Fora do repositório até o fim da reinterpretação:** CHAVE, mapa R → P e `p1_pontos_com_estrato.csv`.


## 2026-11-12 · pacote 1.13
**Análise exploratória [E] do viés espacial do erro (estrato E).** Não muda o critério da P1.

**Novos:**
- `src/python/f1_16_gerar_distancia_biomas.py` → `src/gee/16_distancia_biomas_p1.js`: distância de cada ponto aos biomas vizinhos (asset IBGE). Classes fixadas antes de ver as distâncias: ≤50, 50–150 e >150 km.

**Alterados:** `CHANGELOG.md`. **Removidos:** nenhum.
