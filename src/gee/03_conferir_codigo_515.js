/**
 * 03_conferir_codigo_515.js — Rege-Nat-Cerrado, fase F0
 * ---------------------------------------------------------------------------
 * PERGUNTA (D09)
 *   No asset ..._by_coverage_v1, o código 515 é exatamente
 *   "recuperação (código 5 no v5) num pixel que era pastagem (15) no ano anterior"?
 *
 * O QUE FAZ
 *   Para cada ano de 2017 a 2021, soma a área (ha) no Cerrado de:
 *     a_515      : by_coverage == 515
 *     b_5_e_15   : v5 == 5  E  cobertura(ano-1) == 15
 *     discord    : pixels onde só uma das duas condições é verdadeira
 *   Se a codificação for a documentada, discord = 0 (ou quase 0) em todos os anos.
 *   Não usa nenhum preditor.
 *
 * COMO RODAR
 *   Run → aba Tasks → Run na tarefa "F0_03_conferir_515". Pode levar de
 *   dezenas de minutos a algumas horas (soma a 30 m no Cerrado inteiro).
 *   Baixe o CSV do Drive e me envie.
 *
 * O QUE PODE QUEBRAR E COMO PERCEBER
 *   - Tarefa falha por memória: aumente tileScale para 16.
 *   - discord grande: a codificação não é a documentada. Não prossiga com D09
 *     antes de entendermos o motivo.
 * ---------------------------------------------------------------------------
 */

// ----------------------------- CONFIG ---------------------------------------
var C11 = 'projects/mapbiomas-public/assets/brazil/lulc/collection11/';
var cobertura = ee.Image(C11 + 'mapbiomas_brazil_collection11_coverage_v3');
var vegsec = ee.Image(C11 + 'mapbiomas_brazil_collection11_deforestation_secondary_vegetation_v5');
var vegsecCob = ee.Image(C11 + 'mapbiomas_brazil_collection11_deforestation_secondary_vegetation_by_coverage_v1');

// [L] TROQUE pelo limite IBGE do Cerrado (ver 00_config_comum.js).
var CERRADO = ee.FeatureCollection('RESOLVE/ECOREGIONS/2017')
  .filter(ee.Filter.eq('ECO_NAME', 'Cerrado')).geometry();

var PASTA_DRIVE = 'RegeNat_F0_diagnosticos';
var ANOS = [2017, 2018, 2019, 2020, 2021];
var TILE_SCALE = 8;
// ---------------------------------------------------------------------------

function banda(img, ano) { return img.select('classification_' + ano).unmask(0); }

// Área do pixel em hectares.
var ha = ee.Image.pixelArea().divide(1e4);

var linhas = ANOS.map(function (t) {
  var a = banda(vegsecCob, t).eq(515);
  var b = banda(vegsec, t).eq(5).and(banda(cobertura, t - 1).eq(15));
  var discord = a.neq(b);

  var img = ha.multiply(a).rename('a_515_ha')
    .addBands(ha.multiply(b).rename('b_5_e_15_ha'))
    .addBands(ha.multiply(discord).rename('discord_ha'));

  var soma = img.reduceRegion({
    reducer: ee.Reducer.sum(),
    geometry: CERRADO,
    scale: 30,
    maxPixels: 1e13,
    tileScale: TILE_SCALE
  });
  return ee.Feature(null, soma).set('ano', t);
});

Export.table.toDrive({
  collection: ee.FeatureCollection(linhas),
  description: 'F0_03_conferir_515',
  folder: PASTA_DRIVE,
  fileFormat: 'CSV',
  selectors: ['ano', 'a_515_ha', 'b_5_e_15_ha', 'discord_ha']
});

// Conferência visual rápida: 515 em 2019 sobre a cobertura de 2018.
Map.centerObject(CERRADO, 5);
Map.addLayer(banda(vegsecCob, 2019).eq(515).selfMask(), {palette: ['ff00ff']}, '515 em 2019');
