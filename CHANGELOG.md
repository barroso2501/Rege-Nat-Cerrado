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
