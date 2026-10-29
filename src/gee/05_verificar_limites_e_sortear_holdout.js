/**
 * 05_verificar_limites_e_sortear_holdout.js — Rege-Nat-Cerrado, fase F0 (congelamento)
 * VERSÃO 3 (2026-10-29) — HOLDOUT FIXO + ZONA DE EXCLUSÃO
 * ---------------------------------------------------------------------------
 * HISTÓRICO
 *   - Tentativa 1: regiões vetoriais (sobrepostas). Ordem do sorteio com semente
 *     20261029: 13, 9, 28, 16, 30, … Descartada pela sobreposição (05b).
 *   - Tentativa 2: partição raster; o randomColumn gerou outra ordem (17, 27, …)
 *     porque a coleção foi montada de outro modo — os números aleatórios do GEE
 *     dependem da construção da coleção, não só da semente.
 *   - Decisão de Mario (2026-10-29): vale a regra registrada antes da tentativa 2 —
 *     ORDEM da tentativa 1 + ÁREAS da partição raster. Resultado calculado por
 *     src/python/f0_05_holdout_final.py → results/f0_diagnosticos/F0_05_holdout.csv:
 *     HOLDOUT = regiões 13, 9, 28, 16 (11,56% do Cerrado).
 *
 * O QUE ESTE SCRIPT FAZ AGORA (nada aleatório)
 *   1. Confere no Console a fração do Cerrado coberta pelo holdout fixo (≈ 0,1156).
 *   2. Exporta a ZONA de exclusão como asset: 1 = holdout; 2 = faixa de 10 km ao
 *      redor (descartada do treino); 0 = disponível para treino.
 *
 * COMO RODAR
 *   Run → confira a fração no Console → Tasks → Run em "F0_05_holdout_zona_exclusao".
 *   Me avise quando o asset estiver pronto (não há CSV a enviar).
 *
 * O QUE PODE QUEBRAR E COMO PERCEBER
 *   - Fração no Console muito diferente de 0,1156: me avise antes de exportar.
 *   - "Asset already exists": apague o asset da tentativa 2 (mesmo nome) antes.
 * ---------------------------------------------------------------------------
 */

// ----------------------------- CONFIG ---------------------------------------
var LIMITE_IBGE = 'projects/ee-barroso2501/assets/biomas_IBGE';
var CAMPO_BIOMA = 'NM_BIOMA';
var VALOR_CERRADO = 'Cerrado';
var REGIOES_RASTER = 'users/dh-conciani/collection7/classification_regions/raster';

var HOLDOUT = [13, 9, 28, 16];       // results/f0_diagnosticos/F0_05_holdout.csv
var BUFFER_EXCLUSAO_M = 10000;       // 10 km
var ESCALA_CONFERENCIA = 1000;       // só para a conferência no Console
var ASSET_ZONA = 'projects/ee-barroso2501/assets/RegeNat/F0_holdout_zona_exclusao_v1';
// ---------------------------------------------------------------------------

var cerrado = ee.FeatureCollection(LIMITE_IBGE)
  .filter(ee.Filter.eq(CAMPO_BIOMA, VALOR_CERRADO)).geometry();
var regRaster = ee.Image(REGIOES_RASTER).select(0);
var mascaraCerrado = ee.Image(0).paint(cerrado, 1);

// 1 nas regiões do holdout, 0 nas demais.
var mascaraHoldout = regRaster.remap(HOLDOUT, [1, 1, 1, 1], 0).unmask(0);

// Conferência da fração (km², a 1 km).
var areaKm2 = ee.Image.pixelArea().divide(1e6).multiply(mascaraCerrado);
var somas = areaKm2.multiply(mascaraHoldout).rename('holdout')
  .addBands(areaKm2.rename('cerrado'))
  .reduceRegion({reducer: ee.Reducer.sum(), geometry: cerrado.bounds(),
                 scale: ESCALA_CONFERENCIA, maxPixels: 1e10, tileScale: 4});
print('Fração do Cerrado no holdout (esperado ≈ 0,1156):',
      ee.Number(somas.get('holdout')).divide(ee.Number(somas.get('cerrado'))));

// Distância (m) ao holdout, para a faixa de exclusão de 10 km.
var distHoldout = mascaraHoldout.selfMask()
  .fastDistanceTransform(512, 'pixels', 'squared_euclidean').sqrt()
  .multiply(ee.Image.pixelArea().sqrt());        // pixels → metros (aprox.)
var zona = ee.Image(0)
  .where(distHoldout.lte(BUFFER_EXCLUSAO_M), 2)
  .where(mascaraHoldout.eq(1), 1)
  .updateMask(mascaraCerrado)
  .rename('zona').toByte();

Export.image.toAsset({
  image: zona,
  description: 'F0_05_holdout_zona_exclusao',
  assetId: ASSET_ZONA,
  region: cerrado.bounds(),
  scale: 30,
  maxPixels: 1e13,
  pyramidingPolicy: {'.default': 'mode'}
});

Map.centerObject(cerrado, 5);
Map.addLayer(zona.updateMask(zona.gt(0)), {min: 1, max: 2, palette: ['0000ff', 'ffaa00']},
             'Holdout (azul) e exclusão 10 km (laranja)');
