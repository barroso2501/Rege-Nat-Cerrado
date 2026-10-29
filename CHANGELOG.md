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
