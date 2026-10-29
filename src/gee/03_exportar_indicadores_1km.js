/**
 * 03_exportar_indicadores_1km.js — Rege-Nat-Cerrado, fase F0   (etapa 1 de 2)
 * ---------------------------------------------------------------------------
 * SUBSTITUI os antigos 03_conferir_codigo_515.js e 04_contagem_eventos_produto_vs_lulc.js.
 * Os dois estouraram 12 h: faziam uma soma única (reduceRegion) a 30 m no
 * Cerrado inteiro, que o GEE não consegue dividir entre máquinas.
 *
 * NOVA ESTRATÉGIA
 *   Etapa 1 (este script): calcula os indicadores 0/1 a 30 m e exporta para um
 *     ASSET a FRAÇÃO de cada indicador dentro de pixels de ~1 km (média dos
 *     ~1.100 pixels de 30 m). Exportação de imagem é dividida em blocos e
 *     processada em paralelo — por isso é muito mais rápida.
 *   Etapa 2 (script 04): multiplica a fração pela área de cada pixel de 1 km e
 *     soma no Cerrado. Roda em minutos.
 *   A soma final é a mesma área de 30 m (média × área = soma), sem perda,
 *   inclusive nas bordas do Cerrado (fora do Cerrado os pixels valem 0).
 *
 * INDICADORES (por ano de início t = 2017…2021; nomes "<indicador>_<t>")
 *   Conferência da codificação (D09):
 *     a515      : by_coverage(t) = 515
 *     b5e15     : v5(t) = 5 E cobertura(t-1) = 15
 *     discord   : só uma das duas acima           → deve ser ~0
 *   Contagem de eventos (D01, D01b, D09, D07):
 *     e515sav4  : 515 e cobertura 4 em t
 *     lulc      : cobertura 15 em t-3..t-1 E 4 em t..t+3      (só LULC)
 *     produto   : lulc E 515 em t                            (com o produto)
 *     soLulc    : lulc mas não produto
 *     soLulc1 / soLulc3 / soLulc5 / soLulc7 : o que o v5 diz em t nesses pixels
 *     soProduto : produto mas não lulc                        → deve ser 0
 *     sens521   : cobertura 21 em t-3..t-1, 521 em t, 4 em t..t+3   (D07)
 *
 * ATENÇÃO AO PROTOCOLO
 *   Diagnóstico de definição do evento, anterior ao congelamento (PROTOCOLO §7).
 *   Nenhum preditor é extraído. Não use as contagens para escolher a definição
 *   "que dá mais eventos".
 *
 * COMO RODAR
 *   1. Ajuste ASSET_SAIDA para uma pasta sua (ex.: projects/ee-barroso2501/assets/RegeNat/).
 *      Crie a pasta RegeNat antes, na aba Assets → NEW → Folder.
 *   2. Troque CERRADO pelo limite IBGE, se tiver.
 *   3. Run → aba Tasks → Run em "F0_03_indicadores_1km".
 *   4. Quando terminar, rode o script 04.
 *
 * O QUE PODE QUEBRAR E COMO PERCEBER
 *   - "Too many pixels in reduceResolution": aumente MAX_PIXELS_RR (ex.: 4096).
 *   - Tarefa ainda lenta (> 6 h): avise-me; dá para dividir em 5 tarefas, uma por ano.
 *   - "Asset already exists": apague o asset antigo ou mude ASSET_SAIDA.
 * ---------------------------------------------------------------------------
 */

// ----------------------------- CONFIG ---------------------------------------
var C11 = 'projects/mapbiomas-public/assets/brazil/lulc/collection11/';
var cobertura = ee.Image(C11 + 'mapbiomas_brazil_collection11_coverage_v3');
var vegsec = ee.Image(C11 + 'mapbiomas_brazil_collection11_deforestation_secondary_vegetation_v5');
var vegsecCob = ee.Image(C11 + 'mapbiomas_brazil_collection11_deforestation_secondary_vegetation_by_coverage_v1');

// Limite IBGE do Cerrado (D05, PROTOCOLO §11), definido em 2026-10-29.
var CERRADO = ee.FeatureCollection('projects/ee-barroso2501/assets/biomas_IBGE')
  .filter(ee.Filter.eq('NM_BIOMA', 'Cerrado')).geometry();

var ASSET_SAIDA = 'projects/ee-barroso2501/assets/RegeNat/F0_indicadores_1km_v1';
var ANOS = [2017, 2018, 2019, 2020, 2021];
var ESCALA_SAIDA = 1000;     // metros
var MAX_PIXELS_RR = 2048;    // (1000/30)^2 ≈ 1.111 pixels de 30 m por pixel de 1 km
// ---------------------------------------------------------------------------

var proj30 = cobertura.projection();

// Banda do ano, com 0 onde não há dado (para que "não" seja 0, não máscara).
function banda(img, ano) { return img.select('classification_' + ano).unmask(0); }

// 1 se o pixel tem 'valor' em todos os anos; começa de uma banda real
// (e não de ee.Image(1)) para herdar a projeção de 30 m da cobertura.
function todosIguais(img, anos, valor) {
  var m = banda(img, anos[0]).eq(valor);
  anos.slice(1).forEach(function (a) { m = m.and(banda(img, a).eq(valor)); });
  return m;
}

// Monta os indicadores de um ano t.
function indicadores(t) {
  var cod = banda(vegsecCob, t);
  var v5t = banda(vegsec, t);
  var prePasto = todosIguais(cobertura, [t - 3, t - 2, t - 1], 15);
  var posSav4 = todosIguais(cobertura, [t, t + 1, t + 2, t + 3], 4);

  var a515 = cod.eq(515);
  var b5e15 = v5t.eq(5).and(banda(cobertura, t - 1).eq(15));
  var lulc = prePasto.and(posSav4);
  var produto = lulc.and(a515);
  var soLulc = lulc.and(produto.not());
  var pre21 = todosIguais(cobertura, [t - 3, t - 2, t - 1], 21);

  var lista = [
    a515.rename('a515_' + t),
    b5e15.rename('b5e15_' + t),
    a515.neq(b5e15).rename('discord_' + t),
    a515.and(banda(cobertura, t).eq(4)).rename('e515sav4_' + t),
    lulc.rename('lulc_' + t),
    produto.rename('produto_' + t),
    soLulc.rename('soLulc_' + t),
    soLulc.and(v5t.eq(1)).rename('soLulc1_' + t),
    soLulc.and(v5t.eq(3)).rename('soLulc3_' + t),
    soLulc.and(v5t.eq(5)).rename('soLulc5_' + t),
    soLulc.and(v5t.eq(7)).rename('soLulc7_' + t),
    produto.and(lulc.not()).rename('soProduto_' + t),
    pre21.and(cod.eq(521)).and(posSav4).rename('sens521_' + t)
  ];
  return ee.Image.cat(lista);
}

// Junta os 5 anos (65 bandas), zera fora do Cerrado e fixa a projeção de 30 m.
var mascaraCerrado = ee.Image(0).paint(CERRADO, 1);
var ind = ee.Image.cat(ANOS.map(indicadores))
  .multiply(mascaraCerrado)
  .toFloat()
  .setDefaultProjection(proj30);

// Fração de cada indicador em pixels de ~1 km (média dos pixels de 30 m).
var fracao = ind.reduceResolution({
  reducer: ee.Reducer.mean(),
  maxPixels: MAX_PIXELS_RR
});

Export.image.toAsset({
  image: fracao,
  description: 'F0_03_indicadores_1km',
  assetId: ASSET_SAIDA,
  region: CERRADO.bounds(),
  crs: 'EPSG:4326',
  scale: ESCALA_SAIDA,
  maxPixels: 1e13,
  pyramidingPolicy: {'.default': 'mean'}
});

print('Bandas que serão exportadas (65 esperadas):', fracao.bandNames().size());
