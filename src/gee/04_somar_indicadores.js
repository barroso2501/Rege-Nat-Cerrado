/**
 * 04_somar_indicadores.js — Rege-Nat-Cerrado, fase F0   (etapa 2 de 2)
 * ---------------------------------------------------------------------------
 * O QUE FAZ
 *   Lê o asset gerado pelo script 03 (frações a ~1 km), multiplica pela área
 *   de cada pixel e soma no Cerrado. Resultado: área em hectares de cada
 *   indicador, por ano de início (2017–2021).
 *   Exporta uma tabela (uma linha por ano) e mostra o mesmo no Console.
 *
 * COMO RODAR
 *   1. Confirme ASSET_ENTRADA = ASSET_SAIDA do script 03, e o mesmo CERRADO.
 *   2. Run. O Console deve mostrar a tabela em poucos minutos.
 *   3. Aba Tasks → Run em "F0_04_contagem_eventos". Envie o CSV.
 *
 * COMO LER
 *   - discord deve ser ~0 em todos os anos (a codificação 515 está como documentada).
 *   - soProduto deve ser 0 (por construção).
 *   - produto ≤ lulc; a diferença (soLulc) é quanto as regras do produto
 *     removem; as colunas soLulc1/3/5/7 dizem como o produto classificou esses pixels.
 *
 * O QUE PODE QUEBRAR E COMO PERCEBER
 *   - "Asset not found": o script 03 ainda não terminou ou o caminho difere.
 * ---------------------------------------------------------------------------
 */

// ----------------------------- CONFIG ---------------------------------------
var ASSET_ENTRADA = 'projects/ee-barroso2501/assets/RegeNat/F0_indicadores_1km_v1';

// Limite IBGE do Cerrado (D05) — o mesmo do script 03.
var CERRADO = ee.FeatureCollection('projects/ee-barroso2501/assets/biomas_IBGE')
  .filter(ee.Filter.eq('NM_BIOMA', 'Cerrado')).geometry();

var PASTA_DRIVE = 'RegeNat_F0_diagnosticos';
var ANOS = [2017, 2018, 2019, 2020, 2021];
var INDICADORES = ['a515', 'b5e15', 'discord', 'e515sav4', 'lulc', 'produto', 'soLulc',
                   'soLulc1', 'soLulc3', 'soLulc5', 'soLulc7', 'soProduto', 'sens521'];
// ---------------------------------------------------------------------------

var fracao = ee.Image(ASSET_ENTRADA);
var proj1km = fracao.projection();

// Fração × área do pixel de 1 km (em ha) = área em ha do indicador naquele pixel.
var areaHa = fracao.multiply(ee.Image.pixelArea().divide(1e4));

var somas = areaHa.reduceRegion({
  reducer: ee.Reducer.sum(),
  geometry: CERRADO.bounds(),   // fora do Cerrado as frações já são 0
  crs: proj1km,
  scale: proj1km.nominalScale(),
  maxPixels: 1e10
});

// Reorganiza: uma linha por ano, uma coluna por indicador.
var linhas = ANOS.map(function (t) {
  var props = {ano: t};
  INDICADORES.forEach(function (k) { props[k + '_ha'] = somas.get(k + '_' + t); });
  return ee.Feature(null, props);
});
var tabela = ee.FeatureCollection(linhas);

print('Área (ha) por indicador e ano:', tabela);

Export.table.toDrive({
  collection: tabela,
  description: 'F0_04_contagem_eventos',
  folder: PASTA_DRIVE,
  fileFormat: 'CSV',
  selectors: ['ano'].concat(INDICADORES.map(function (k) { return k + '_ha'; }))
});
