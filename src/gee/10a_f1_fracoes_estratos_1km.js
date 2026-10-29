/**
 * 10a_f1_fracoes_estratos_1km.js — Rege-Nat-Cerrado, F1, amostra P1 (passo A de 4)
 * ---------------------------------------------------------------------------
 * POR QUE EXISTE (substitui o 10_f1_candidatos_amostra_p1.js)
 *   O stratifiedSample a 30 m no Cerrado inteiro ficou 5 h em "Running" sem
 *   consumir processamento (2026-10-29). Nova estratégia em 4 passos, toda ela
 *   com sorteio equivalente a aleatório simples por pixel dentro de cada estrato:
 *     A (este) — fração de pixels E e P em células de ~1 km (exportação paralela);
 *     B — tabela das células com E ou P > 0;
 *     C (Python) — sorteio das células com probabilidade ∝ fração (semente gravada);
 *     D — em cada célula sorteada, UM pixel elegível escolhido por ee.Image.random
 *         (determinístico); estrato N por pontos aleatórios (estrato comum).
 *   Probabilidade de um pixel = P(célula) × 1/n(célula) ∝ 1 → uniforme no estrato.
 *
 * DEFINIÇÕES (PROTOCOLO §4; plano_validacao_P1 §1), ano t = 2017…2021
 *   E = 15 em t-3..t-1, 515 em t, classe 4 em t..t+3
 *   P = 15 em t-3..t-1, classe 4 em t..t+3, produto = 7 em t (removido pelo filtro de ~1 ha)
 *   Holdout (zona = 1) e área fora do Cerrado IBGE valem 0 já a 30 m.
 *   (Não reaproveita o asset F0_indicadores_1km_v1: ele foi gerado com o limite
 *    RESOLVE provisório.)
 *
 * COMO RODAR
 *   Run → Tasks → Run em "F1_10a_fracoes_estratos_1km". Leva algumas horas
 *   (como o F0_03). Avise quando terminar.
 *
 * O QUE PODE QUEBRAR E COMO PERCEBER
 *   - "Too many pixels in reduceResolution": aumente MAX_PIXELS_RR para 4096.
 *   - "Asset already exists": apague o asset ou mude ASSET_SAIDA.
 * ---------------------------------------------------------------------------
 */

// ----------------------------- CONFIG ---------------------------------------
var C11 = 'projects/mapbiomas-public/assets/brazil/lulc/collection11/';
var cobertura = ee.Image(C11 + 'mapbiomas_brazil_collection11_coverage_v3');
var vegsec = ee.Image(C11 + 'mapbiomas_brazil_collection11_deforestation_secondary_vegetation_v5');
var vegsecCob = ee.Image(C11 + 'mapbiomas_brazil_collection11_deforestation_secondary_vegetation_by_coverage_v1');
var CERRADO = ee.FeatureCollection('projects/ee-barroso2501/assets/biomas_IBGE')
  .filter(ee.Filter.eq('NM_BIOMA', 'Cerrado')).geometry();
var ZONA = ee.Image('projects/ee-barroso2501/assets/RegeNat/F0_holdout_zona_exclusao_v1');

var ASSET_SAIDA = 'projects/ee-barroso2501/assets/RegeNat/F1_fracoes_estratos_1km_v1';
var ANOS = [2017, 2018, 2019, 2020, 2021];
var ESCALA_SAIDA = 1000;
var MAX_PIXELS_RR = 2048;
// ---------------------------------------------------------------------------

var proj30 = cobertura.projection();
function banda(img, ano) { return img.select('classification_' + ano).unmask(0); }
function todosIguais(img, anos, valor) {
  var m = banda(img, anos[0]).eq(valor);
  anos.slice(1).forEach(function (a) { m = m.and(banda(img, a).eq(valor)); });
  return m;
}

// Elegível = dentro do Cerrado IBGE e fora do holdout.
var elegivel = ee.Image(0).paint(CERRADO, 1).and(ZONA.unmask(0).neq(1));

var bandas = [];
ANOS.forEach(function (t) {
  var pre15 = todosIguais(cobertura, [t - 3, t - 2, t - 1], 15);
  var pos4 = todosIguais(cobertura, [t, t + 1, t + 2, t + 3], 4);
  bandas.push(pre15.and(pos4).and(banda(vegsecCob, t).eq(515)).rename('E_' + t));
  bandas.push(pre15.and(pos4).and(banda(vegsec, t).eq(7)).rename('P_' + t));
});

var fracao = ee.Image.cat(bandas)
  .multiply(elegivel)
  .toFloat()
  .setDefaultProjection(proj30)
  .reduceResolution({reducer: ee.Reducer.mean(), maxPixels: MAX_PIXELS_RR});

Export.image.toAsset({
  image: fracao,
  description: 'F1_10a_fracoes_estratos_1km',
  assetId: ASSET_SAIDA,
  region: CERRADO.bounds(),
  crs: 'EPSG:4326',
  scale: ESCALA_SAIDA,
  maxPixels: 1e13,
  pyramidingPolicy: {'.default': 'mean'}
});
