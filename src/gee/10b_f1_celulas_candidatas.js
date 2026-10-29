/**
 * 10b_f1_celulas_candidatas.js — Rege-Nat-Cerrado, F1, amostra P1 (passo B de 4)
 * ---------------------------------------------------------------------------
 * O QUE FAZ
 *   Lê o asset do passo A e exporta UMA LINHA POR CÉLULA de ~1 km que tem
 *   alguma fração de E ou P > 0 em algum ano: centro (lon, lat), meio-lado da
 *   célula em graus e as 10 frações (E_2017…P_2021).
 *   Rápido: o asset tem resolução de 1 km.
 *
 * COMO RODAR
 *   Run → Tasks → Run em "F1_10b_celulas_candidatas". Envie o CSV SEM ABRIR
 *   (ele mostra onde estão os eventos).
 *
 * O QUE PODE QUEBRAR E COMO PERCEBER
 *   - "Asset not found": o passo A ainda não terminou.
 * ---------------------------------------------------------------------------
 */

var ASSET_ENTRADA = 'projects/ee-barroso2501/assets/RegeNat/F1_fracoes_estratos_1km_v1';
var CERRADO = ee.FeatureCollection('projects/ee-barroso2501/assets/biomas_IBGE')
  .filter(ee.Filter.eq('NM_BIOMA', 'Cerrado')).geometry();
var PASTA_DRIVE = 'RegeNat_F1';
var ANOS = [2017, 2018, 2019, 2020, 2021];

var fracao = ee.Image(ASSET_ENTRADA);
var proj = fracao.projection();
var nomes = [];
ANOS.forEach(function (t) { nomes.push('E_' + t, 'P_' + t); });

// Só células com alguma fração > 0.
var algum = fracao.select(nomes).reduce(ee.Reducer.max()).gt(0);

// Meio-lado da célula em graus (o asset está em EPSG:4326).
var meioLado = ee.Number(proj.nominalScale()).divide(111319.49079327357).divide(2);

var celulas = fracao.select(nomes).updateMask(algum).sample({
  region: CERRADO.bounds(),
  projection: proj,
  scale: proj.nominalScale(),
  geometries: true
}).map(function (f) {
  var c = f.geometry().coordinates();
  return f.set({lon: c.get(0), lat: c.get(1), meio_lado_graus: meioLado});
});

Export.table.toDrive({
  collection: celulas,
  description: 'F1_10b_celulas_candidatas',
  folder: PASTA_DRIVE,
  fileFormat: 'CSV',
  selectors: ['lon', 'lat', 'meio_lado_graus'].concat(nomes)
});
