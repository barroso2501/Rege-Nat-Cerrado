/**
 * 02_semantica_idade_pastagem.js — Rege-Nat-Cerrado, fase F0
 * ---------------------------------------------------------------------------
 * PERGUNTA (pendência da D10)
 *   No asset pasture_origin_age_v2, o código 2xx é IDADE (cresce 1 por ano
 *   enquanto a pastagem continua) ou ANO DE ORIGEM (fica constante)?
 *   E a idade bate com a contagem de anos consecutivos de classe 15 na LULC?
 *
 * O QUE FAZ
 *   1. Sorteia até 2.000 pixels do Cerrado que foram pastagem (15) em TODOS
 *      os anos de 2010 a 2020 e que NÃO são contínuos desde 1985.
 *   2. Para cada pixel, guarda o código do asset em 2010 e 2020, e a contagem
 *      de anos consecutivos de pastagem até 2010, calculada da própria LULC.
 *   3. Imprime um resumo no Console e exporta a tabela para o Drive.
 *
 * COMO LER O RESULTADO (Console)
 *   - diff = código2020 − código2010.
 *     Se quase todos os pixels têm diff = 10 → 2xx é idade.
 *     Se quase todos têm diff = 0 → 2xx é ano de origem.
 *   - "concordância com a LULC": fração de pixels em que o código 2010 bate
 *     com 200 + anos consecutivos de 15 (se for idade). Valores baixos indicam
 *     problema de exatidão ou de convenção (ex.: idade começando em 0 ou 1).
 *
 * O QUE PODE QUEBRAR E COMO PERCEBER
 *   - Erro "band not found": o prefixo das bandas é outro. Rode o 01 e me
 *     mande a lista de bandas.
 *   - Amostra com poucos pixels: troque o limite do Cerrado (ver CONFIG).
 *   - O resumo no Console pode demorar; se der "Computation timed out", use
 *     só a tabela exportada (aba Tasks → Run).
 * ---------------------------------------------------------------------------
 */

// ----------------------------- CONFIG ---------------------------------------
var C11 = 'projects/mapbiomas-public/assets/brazil/lulc/collection11/';
var cobertura = ee.Image(C11 + 'mapbiomas_brazil_collection11_coverage_v3');
var idade = ee.Image(C11 + 'mapbiomas_brazil_collection11_pasture_origin_age_v2');

// [L] TROQUE pelo limite IBGE do Cerrado (ver 00_config_comum.js).
var CERRADO = ee.FeatureCollection('RESOLVE/ECOREGIONS/2017')
  .filter(ee.Filter.eq('ECO_NAME', 'Cerrado')).geometry();

var PASTA_DRIVE = 'RegeNat_F0_diagnosticos';
var SEMENTE = 42;          // semente fixa (reprodutibilidade)
var N_PIXELS = 2000;
// ---------------------------------------------------------------------------

function banda(img, ano) { return img.select('classification_' + ano); }
function bandaPorAno(img, ano) {
  var nomes = img.bandNames().filter(ee.Filter.stringContains('item', String(ano)));
  return img.select([ee.String(nomes.get(0))]);
}
function intervalo(a, b) { var o = []; for (var i = a; i <= b; i++) o.push(i); return o; }

// Pastagem em todos os anos 2010–2020.
var pastContinua = ee.Image(1);
intervalo(2010, 2020).forEach(function (a) {
  pastContinua = pastContinua.and(banda(cobertura, a).eq(15));
});

// Anos consecutivos de pastagem terminando em 2010 (contando 2010), da LULC.
// Percorre de 1985 a 2010: se é pastagem soma 1, senão zera.
var consecutivos = ee.Image(0);
intervalo(1985, 2010).forEach(function (a) {
  var p = banda(cobertura, a).eq(15);
  consecutivos = consecutivos.add(1).multiply(p);
});

// Exclui pastagem contínua desde 1985 (essa recebe código 100, não 2xx).
var naoDesde1985 = consecutivos.lt(26);  // 1985–2010 = 26 anos

var cod2010 = bandaPorAno(idade, 2010).rename('cod2010');
var cod2020 = bandaPorAno(idade, 2020).rename('cod2020');

var alvo = pastContinua.and(naoDesde1985).rename('alvo');

var pilha = alvo
  .addBands(cod2010)
  .addBands(cod2020)
  .addBands(consecutivos.rename('consec_lulc_2010'))
  .updateMask(alvo);

// Amostra estratificada: só a classe "alvo = 1", com semente fixa.
var amostra = pilha.stratifiedSample({
  numPoints: N_PIXELS,
  classBand: 'alvo',
  classValues: [1],
  classPoints: [N_PIXELS],
  region: CERRADO,
  scale: 30,
  seed: SEMENTE,
  tileScale: 8,
  geometries: true
}).map(function (f) {
  var c10 = ee.Number(f.get('cod2010'));
  var c20 = ee.Number(f.get('cod2020'));
  var cons = ee.Number(f.get('consec_lulc_2010'));
  return f.set({
    diff_2020_2010: c20.subtract(c10),
    // Código 100 não é 2xx: separar para não confundir com diff = 0.
    cod2010_eh_100: c10.eq(100),
    // Hipótese "2xx = 200 + idade", testada com duas convenções de início.
    bate_idade_consec: c10.eq(cons.add(200)),
    bate_idade_consec_menos1: c10.eq(cons.add(199))
  });
});

// Resumo no Console.
print('Pixels amostrados:', amostra.size());
print('Fração com código 100 em 2010 (não deveria ocorrer nesta amostra):', amostra.aggregate_mean('cod2010_eh_100'));
print('Histograma de diff (código2020 − código2010):', amostra.aggregate_histogram('diff_2020_2010'));
print('Fração com código2010 = 200 + anos consecutivos (LULC):', amostra.aggregate_mean('bate_idade_consec'));
print('Idem, convenção 199 + consecutivos:', amostra.aggregate_mean('bate_idade_consec_menos1'));
print('Exemplos (10 primeiros):', amostra.limit(10));

// Tabela completa para o Drive (anexar ao repositório em results/f0_diagnosticos/).
Export.table.toDrive({
  collection: amostra,
  description: 'F0_02_semantica_idade_pastagem',
  folder: PASTA_DRIVE,
  fileFormat: 'CSV'
});
