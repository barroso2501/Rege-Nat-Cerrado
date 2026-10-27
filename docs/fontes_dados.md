# Fontes de dados

Os IDs de asset começam por `projects/mapbiomas-public/assets/brazil/`; nas tabelas, esse prefixo foi omitido.

**Fonte primária:** KB MapBiomas v0.5, captura de 2026-10-14 (`KB:03_produtos_assets.md`, `KB:06_metodos_col11.md`).

**Antes de usar qualquer asset:**
1. confirmar que ele ainda existe e quais bandas tem (script `src/gee/00_verificar_assets.js`, a fazer);
2. registrar no manifesto (`data/manifestos/`).

| Camada | Asset (Col. 11 salvo indicação) | Período | Marca | Observações |
|---|---|---|---|---|
| LULC | `lulc/collection11/mapbiomas_brazil_collection11_coverage_v3` | 1985–2025 | [D] | Legenda Col. 11 (`KB:04_legenda_lulc.md`). Nunca aplicar a legenda de outra coleção (D09 da KB) |
| Desmatamento e vegetação secundária | `lulc/collection11/mapbiomas_brazil_collection11_deforestation_secondary_vegetation_v5` | 1987–2025 | [D] | **[L]** o toolkit da Col. 11 não lista banda de idade da vegetação secundária. Calculamos a idade a partir da LULC |
| Vigor da pastagem | `lulc/collection11/mapbiomas_brazil_collection11_pasture_vigor_v1` | 2000–2025 | [D] | Normalizado por estado e por região climática |
| Biomassa da pastagem | `mapbiomas_brazil_collection11_pasture_biomass_v1` (só no catálogo `.github`) | [L] | [D]/[L] | Divergência D11 da KB. Derivada do uGPP do GPW |
| Fogo | `fire/collection5/...` (frequência, ano do último fogo, intervalo desde o fogo) | 1985–2025 | [D] | Circularidade com a LULC do Cerrado (KB:06) |
| Solo | `soil/collection3/mapbiomas_brazil_collection3_soil_sand_fraction_v1` | — | [D] beta | |
| Regiões de classificação | 38 regiões do Cerrado (Sano et al. 2019, refinadas) | — | [D] | **[L]** localizar o asset ou shapefile no repositório `mapbiomas/brazil-cerrado` |
| Terreno | FABDEM; HAND (Geomorpho90m) | — | [D] | |
| Clima | TerraClimate, déficit hídrico | — | — | |

## Comparadores e literatura-base

- Silva, T.R. et al. 2023. Mapping the regeneration potential of native vegetation in cultivated pastures of the Brazilian Cerrado. *Environ Monit Assess* 195:1038. doi:10.1007/s10661-023-11606-x
- Silva, T.R. et al. 2023. Factors affecting savanna and forest regeneration in pastures across the Cerrado. *J Environ Manage*.
- Veldman, J.W. et al. 2016. Clarifying the confusion: old-growth savannahs and tropical ecosystem degradation. *Phil Trans R Soc B* (para a crítica "regeneração ≠ árvore").
- PDFs na pasta de referências do Drive (inventário: `docs/piloto_2025.md`).
