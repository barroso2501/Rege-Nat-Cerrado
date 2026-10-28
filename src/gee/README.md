# src/gee — scripts Earth Engine (Code Editor, JavaScript)

## Fase F0: verificações antes do congelamento do protocolo

Nenhum destes scripts extrai preditor. Todos são diagnóstico de dados ou da definição do evento.

| Ordem | Script | Pergunta | Saída | Tempo |
|---|---|---|---|---|
| — | `00_config_comum.js` | (referência: configuração e funções comuns, copiadas no topo de cada script) | — | — |
| 1 | `01_verificar_assets.js` | Os assets existem? Que bandas e metadados têm? | Console → `results/f0_diagnosticos/01_assets_<data>.txt` | segundos |
| 2 | `02_semantica_idade_pastagem.js` | O código 2xx de `pasture_origin_age_v2` é idade ou ano de origem? A idade bate com a LULC? (D10) | Console + CSV `F0_02_semantica_idade_pastagem` | minutos |
| 3 | `03_conferir_codigo_515.js` | 515 = recuperação (5) sobre pastagem (15) no ano anterior? (D09) | CSV `F0_03_conferir_515` | horas |
| 4 | `04_contagem_eventos_produto_vs_lulc.js` | Quanto o produto muda o evento em relação à LULC pura, 2017–2021? (D09, D01b, D02) | CSV `F0_04_contagem_eventos` | horas |

**Antes de rodar 02, 03 e 04:** troque o limite do Cerrado (`CERRADO` no CONFIG) pelo asset IBGE de biomas. O padrão (ecorregião RESOLVE) é provisório.

Os CSVs vão para a pasta `RegeNat_F0_diagnosticos` do Drive. Depois, entram no repositório em `results/f0_diagnosticos/`.
