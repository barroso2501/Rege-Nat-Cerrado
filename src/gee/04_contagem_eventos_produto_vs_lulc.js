/**
 * 04_contagem_eventos_produto_vs_lulc.js — Rege-Nat-Cerrado, fase F0
 * ---------------------------------------------------------------------------
 * PERGUNTA (D09, D01b, D02)
 *   Quanto as regras do produto de Vegetação Secundária mudam o evento em
 *   relação a uma definição feita só com a LULC? E quanto área sobra com a
 *   definição estrita proposta?
 *
 * DEFINIÇÕES (ano de início t, de 2017 a 2021; ver docs/decisoes.md)
 *   pre_pasto : cobertura = 15 em t-3, t-2 e t-1
 *   pos_sav4  : cobertura = 4  em t, t+1, t+2 e t+3   (D01 + D01b)
 *   LULC      : pre_pasto E pos_sav4                  (sem o produto)
 *   PRODUTO   : by_coverage(t) = 515 E pre_pasto E pos_sav4   (D09)
 *
 *   Colunas exportadas (ha, por ano t):
 *     e515            : só o código 515 em t (sem outros critérios)
 *     e515_sav4_t     : 515 e cobertura 4 em t
 *     lulc            : definição só-LULC
 *     produto         : definição com o produto
 *     so_lulc         : LULC mas não PRODUTO
 *       so_lulc_v5_1 / _3 / _5 / _7 / _outros : o que o v5 diz em t nesses
 *       pixels (1 antrópico, 3 secundária, 5 recuperação, 7 outras/filtro espacial)
 *     so_produto      : PRODUTO mas não LULC (deve ser 0 por construção)
 *     sens_521        : como PRODUTO, mas com origem 21 (código 521) — D07
 *
 * ATENÇÃO AO PROTOCOLO
 *   Isto é um diagnóstico de definição do evento, ANTES do congelamento.
 *   Usa só a LULC e o produto; NENHUM preditor é extraído. Não use esses
 *   números para escolher definições "que dão mais eventos": a escolha segue
 *   o critério já registrado em docs/decisoes.md.
 *
 * COMO RODAR
 *   Run → aba Tasks → Run em "F0_04_contagem_eventos". Pode levar horas.
 *   Baixe o CSV do Drive e me envie.
 *
 * O QUE PODE QUEBRAR E COMO PERCEBER
 *   - Falha por memória: aumente TILE_SCALE para 16.
 *   - so_produto > 0: a lógica ou a codificação não é a esperada — me avise.
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
function todosIguais(img, anos, valor) {
  var m = ee.Image(1);
  anos.forEach(function (a) { m = m.and(banda(img, a).eq(valor)); });
  return m;
}

var ha = ee.Image.pixelArea().divide(1e4);

var linhas = ANOS.map(function (t) {
  var prePasto = todosIguais(cobertura, [t - 3, t - 2, t - 1], 15);
  var posSav4 = todosIguais(cobertura, [t, t + 1, t + 2, t + 3], 4);
  var cod = banda(vegsecCob, t);
  var v5t = banda(vegsec, t);

  var e515 = cod.eq(515);
  var lulc = prePasto.and(posSav4);
  var produto = e515.and(lulc);
  var soLulc = lulc.and(produto.not());
  var soProduto = produto.and(lulc.not());

  // Sensibilidade D07: origem mosaico de usos (21) — pré-período em 21.
  var pre21 = todosIguais(cobertura, [t - 3, t - 2, t - 1], 21);
  var sens521 = cod.eq(521).and(pre21).and(posSav4);

  var img = ha.multiply(e515).rename('e515')
    .addBands(ha.multiply(e515.and(banda(cobertura, t).eq(4))).rename('e515_sav4_t'))
    .addBands(ha.multiply(lulc).rename('lulc'))
    .addBands(ha.multiply(produto).rename('produto'))
    .addBands(ha.multiply(soLulc).rename('so_lulc'))
    .addBands(ha.multiply(soLulc.and(v5t.eq(1))).rename('so_lulc_v5_1'))
    .addBands(ha.multiply(soLulc.and(v5t.eq(3))).rename('so_lulc_v5_3'))
    .addBands(ha.multiply(soLulc.and(v5t.eq(5))).rename('so_lulc_v5_5'))
    .addBands(ha.multiply(soLulc.and(v5t.eq(7))).rename('so_lulc_v5_7'))
    .addBands(ha.multiply(soLulc.and(v5t.neq(1)).and(v5t.neq(3))
      .and(v5t.neq(5)).and(v5t.neq(7))).rename('so_lulc_v5_outros'))
    .addBands(ha.multiply(soProduto).rename('so_produto'))
    .addBands(ha.multiply(sens521).rename('sens_521'));

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
  description: 'F0_04_contagem_eventos',
  folder: PASTA_DRIVE,
  fileFormat: 'CSV',
  selectors: ['ano', 'e515', 'e515_sav4_t', 'lulc', 'produto', 'so_lulc',
              'so_lulc_v5_1', 'so_lulc_v5_3', 'so_lulc_v5_5', 'so_lulc_v5_7',
              'so_lulc_v5_outros', 'so_produto', 'sens_521']
});
