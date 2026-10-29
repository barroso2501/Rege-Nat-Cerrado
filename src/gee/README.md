# src/gee — scripts Earth Engine (Code Editor, JavaScript)

## Fase F0: verificações antes do congelamento do protocolo

Nenhum destes scripts extrai preditor. Todos são diagnóstico de dados ou da definição do evento.

| Ordem | Script | Pergunta | Saída | Tempo |
|---|---|---|---|---|
| — | `00_config_comum.js` | (referência: configuração e funções comuns, copiadas no topo de cada script) | — | — |
| 1 | `01_verificar_assets.js` | Os assets existem? Que bandas e metadados têm? | Console → `results/f0_diagnosticos/01_assets_<data>.txt` | segundos |
| 2 | `02_semantica_idade_pastagem.js` | O código 2xx de `pasture_origin_age_v2` é idade ou ano de origem? A idade bate com a LULC? (D10) | Console + CSV `F0_02_semantica_idade_pastagem` | minutos |
| 3 | `03_exportar_indicadores_1km.js` | Etapa 1: indicadores de codificação 515 (D09) e de eventos 2017–2021 (D01, D01b, D07), exportados como frações a ~1 km para um asset | Asset `RegeNat/F0_indicadores_1km_v1` | horas (exportação paralela) |
| 4 | `04_somar_indicadores.js` | Etapa 2: soma as áreas (ha) por indicador e ano | Console + CSV `F0_04_contagem_eventos` | minutos |

As versões anteriores de 03 e 04 usavam uma soma única a 30 m no Cerrado inteiro e estouraram o limite de 12 h (2026-10-28). Foram removidas.

**Antes de rodar 02, 03 e 04:** troque o limite do Cerrado (`CERRADO` no CONFIG) pelo asset IBGE de biomas. O padrão (ecorregião RESOLVE) é provisório.

Os CSVs vão para a pasta `RegeNat_F0_diagnosticos` do Drive. Depois, entram no repositório em `results/f0_diagnosticos/`.
