/**
 * 05b_diagnostico_sobreposicao_regioes.js — Rege-Nat-Cerrado, fase F0 (congelamento)
 * ---------------------------------------------------------------------------
 * POR QUE EXISTE
 *   O sorteio do script 05 somou 2.595.485 km² para as 38 regiões dentro do
 *   Cerrado IBGE. O Cerrado IBGE tem ~1,98 milhão de km². A diferença (~31%)
 *   indica que (a) as regiões se SOBREPÕEM, ou (b) a interseção com o limite
 *   não funcionou. Se houver sobreposição, um mesmo pixel pode cair no holdout
 *   e no treino — vazamento. Precisa ser resolvido ANTES da tag.
 *
 * O QUE FAZ (rápido: resolução de 1 km)
 *   1. Área do Cerrado IBGE (vetor).
 *   2. Para cada região: área total e área dentro do Cerrado (vetor).
 *   3. Imagem com o NÚMERO de regiões que cobrem cada pixel (raster, 1 km):
 *      área com 0, 1, 2, 3… regiões dentro do Cerrado.
 *   4. Área (raster) das 4 regiões do holdout sorteado e fração do Cerrado.
 *
 * COMO RODAR
 *   Run. Tudo aparece no Console (não há exportação). Copie o Console inteiro
 *   e me envie.
 *
 * O QUE PODE QUEBRAR E COMO PERCEBER
 *   - Timeout em algum print: rode de novo; se persistir, me envie o que saiu.
 * ---------------------------------------------------------------------------
 */

// ----------------------------- CONFIG ---------------------------------------
var CERRADO_FC = ee.FeatureCollection('projects/ee-barroso2501/assets/biomas_IBGE')
  .filter(ee.Filter.eq('NM_BIOMA', 'Cerrado'));
var CERRADO = CERRADO_FC.geometry();
var REGIOES = ee.FeatureCollection('users/dh-conciani/collection7/classification_regions/vector_v2');
var CAMPO_REGIAO = 'mapb';
var HOLDOUT_SORTEADO = [13, 9, 28, 16];   // resultado do script 05 (2026-10-29)
var ESCALA = 1000;                        // metros (diagnóstico, não contagem fina)
// ---------------------------------------------------------------------------

// 1) Área do Cerrado IBGE pelo vetor (km²).
print('1) Área Cerrado IBGE, vetor (km²):', CERRADO.area(100).divide(1e6));

// 2) Por região: área total e área dentro do Cerrado (km²).
var porRegiao = REGIOES.map(function (f) {
  return ee.Feature(null, {
    regiao: f.get(CAMPO_REGIAO),
    area_total_km2: f.geometry().area(100).divide(1e6),
    area_no_cerrado_km2: f.geometry().intersection(CERRADO, 100).area(100).divide(1e6)
  });
}).sort('regiao');
print('2) Soma das áreas totais das regiões (km²):', porRegiao.aggregate_sum('area_total_km2'));
print('2) Soma das áreas dentro do Cerrado (km²):', porRegiao.aggregate_sum('area_no_cerrado_km2'));
print('2) Tabela por região:', porRegiao);

// 3) Número de regiões que cobrem cada pixel (rasterizado a 1 km).
//    Cada região vira uma imagem 0/1; a soma conta as sobreposições.
var contagem = ee.ImageCollection(REGIOES.map(function (f) {
  return ee.Image(0).paint(ee.FeatureCollection([f]), 1).rename('n');
})).sum();
var areaKm2 = ee.Image.pixelArea().divide(1e6);
var histograma = areaKm2.addBands(contagem.rename('n')).reduceRegion({
  reducer: ee.Reducer.sum().group({groupField: 1, groupName: 'n_regioes'}),
  geometry: CERRADO,
  scale: ESCALA,
  maxPixels: 1e10,
  tileScale: 4
});
print('3) Área do Cerrado (km²) por número de regiões que cobrem o pixel:', histograma);

// 4) Área do holdout sorteado dentro do Cerrado, por raster (sem dupla contagem).
var holdoutFC = REGIOES.filter(ee.Filter.inList(CAMPO_REGIAO, HOLDOUT_SORTEADO));
var mascaraHoldout = ee.Image(0).paint(holdoutFC, 1);
var somas = areaKm2.multiply(mascaraHoldout).rename('holdout')
  .addBands(areaKm2.rename('cerrado'))
  .reduceRegion({reducer: ee.Reducer.sum(), geometry: CERRADO, scale: ESCALA,
                 maxPixels: 1e10, tileScale: 4});
print('4) Holdout e Cerrado, raster (km²):', somas);
print('4) Fração do Cerrado no holdout (raster):',
      ee.Number(somas.get('holdout')).divide(ee.Number(somas.get('cerrado'))));

// Visual: sobreposições em vermelho.
Map.centerObject(CERRADO, 5);
Map.addLayer(contagem.updateMask(contagem.gt(1)), {min: 2, max: 3, palette: ['ff8800', 'ff0000']}, 'Sobreposição de regiões');
Map.addLayer(holdoutFC, {color: '0000ff'}, 'Holdout sorteado');
Map.addLayer(CERRADO_FC, {color: '00aa00'}, 'Cerrado IBGE', false);
