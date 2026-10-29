/**
 * 10_f1_candidatos_amostra_p1.js — Rege-Nat-Cerrado, fase F1, passo 1 de 2
 * ---------------------------------------------------------------------------
 * O QUE FAZ (docs/plano_validacao_P1.md §1)
 *   Exporta CANDIDATOS para a amostra da validação visual, por ano t (2017–2021)
 *   e por estrato, fora do holdout:
 *     E = evento (PROTOCOLO §4): 15 em t-3..t-1, código 515 em t, classe 4 em t..t+3
 *     N = pastagem sem evento:  15 em t-3..t-1 e 15 em t..t+3
 *     P = evento < 1 ha:        15 em t-3..t-1, classe 4 em t..t+3, e o produto
 *                                marcou o pixel como 7 (removido pelo filtro de ~1 ha)
 *   O sorteio FINAL (quantidade por estrato, distância mínima de 500 m, ordem
 *   embaralhada, os 10% da reinterpretação) é feito no passo 2, em Python, com
 *   semente gravada — lição do F0_05: o GEE não garante a mesma aleatoriedade
 *   entre versões de script. Os candidatos ficam em data/f1_candidatos/ (fora do
 *   git até o fim da interpretação, porque têm a coluna de estrato); os hashes vão
 *   para results/f1/amostra_p1_registro.json.
 *
 * QUANTIDADES DE CANDIDATOS (por ano)
 *   E: 400 · N: 150 · P: 100   (≈ 4–5× o necessário, para sobrar após a distância mínima)
 *
 * COMO RODAR
 *   Run → aba Tasks → Run nas 5 tarefas "F1_10_candidatos_<ano>". Elas podem
 *   rodar em paralelo. Baixe os 5 CSVs da pasta RegeNat_F1 do Drive e me envie SEM ABRIR
 *   (eles têm a coluna de estrato).
 *
 * NÃO ABRA OS CSVs NO MAPA nem examine os pontos: você é o intérprete, e o
 * estrato de cada ponto deve ficar escondido de você até o fim da interpretação.
 *
 * O QUE PODE QUEBRAR E COMO PERCEBER
 *   - Tarefa lenta (> 6 h) ou falha por memória: aumente TILE_SCALE para 16.
 *   - Menos candidatos que o pedido num estrato: normal se o estrato for raro
 *     naquele ano; o passo 2 informa se faltar ponto.
 * ---------------------------------------------------------------------------
 */

// ----------------------------- CONFIG ---------------------------------------
var C11 = 'projects/mapbiomas-public/assets/brazil/lulc/collection11/';
var cobertura = ee.Image(C11 + 'mapbiomas_brazil_collection11_coverage_v3');
var vegsec = ee.Image(C11 + 'mapbiomas_brazil_collection11_deforestation_secondary_vegetation_v5');
var vegsecCob = ee.Image(C11 + 'mapbiomas_brazil_collection11_deforestation_secondary_vegetation_by_coverage_v1');

var CERRADO = ee.FeatureCollection('projects/ee-barroso2501/assets/biomas_IBGE')
  .filter(ee.Filter.eq('NM_BIOMA', 'Cerrado')).geometry();
var ZONA = ee.Image('projects/ee-barroso2501/assets/RegeNat/F0_holdout_zona_exclusao_v1');   // 1 = holdout
var REGIOES = ee.Image('users/dh-conciani/collection7/classification_regions/raster').select(0);

var ANOS = [2017, 2018, 2019, 2020, 2021];
var CANDIDATOS = {E: 400, N: 150, P: 100};
var SEMENTE = 20261030;
var TILE_SCALE = 8;
var PASTA_DRIVE = 'RegeNat_F1';
// ---------------------------------------------------------------------------

function banda(img, ano) { return img.select('classification_' + ano).unmask(0); }
function todosIguais(img, anos, valor) {
  var m = banda(img, anos[0]).eq(valor);
  anos.slice(1).forEach(function (a) { m = m.and(banda(img, a).eq(valor)); });
  return m;
}

ANOS.forEach(function (t) {
  var pre15 = todosIguais(cobertura, [t - 3, t - 2, t - 1], 15);
  var pos4 = todosIguais(cobertura, [t, t + 1, t + 2, t + 3], 4);
  var pos15 = todosIguais(cobertura, [t, t + 1, t + 2, t + 3], 15);

  var E = pre15.and(pos4).and(banda(vegsecCob, t).eq(515));
  var N = pre15.and(pos15);
  var P = pre15.and(pos4).and(banda(vegsec, t).eq(7));

  // Código do estrato: 1 = E, 2 = N, 3 = P (mutuamente exclusivos por construção).
  var estrato = ee.Image(0).where(E, 1).where(N, 2).where(P, 3)
    .updateMask(ZONA.neq(1))          // fora do holdout
    .selfMask()
    .rename('estrato').toInt();

  var pilha = estrato
    .addBands(REGIOES.rename('regiao').toInt())
    .addBands(ZONA.rename('zona').toInt());

  var amostra = pilha.stratifiedSample({
    numPoints: 0,
    classBand: 'estrato',
    classValues: [1, 2, 3],
    classPoints: [CANDIDATOS.E, CANDIDATOS.N, CANDIDATOS.P],
    region: CERRADO,
    scale: 30,
    seed: SEMENTE + t,
    tileScale: TILE_SCALE,
    geometries: true
  }).map(function (f) {
    var c = f.geometry().coordinates();
    return f.set({ano: t, lon: c.get(0), lat: c.get(1)});
  });

  Export.table.toDrive({
    collection: amostra,
    description: 'F1_10_candidatos_' + t,
    folder: PASTA_DRIVE,
    fileFormat: 'CSV',
    selectors: ['ano', 'estrato', 'lon', 'lat', 'regiao', 'zona']
  });
});
