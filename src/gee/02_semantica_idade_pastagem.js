/**
 * 02_semantica_idade_pastagem.js — Rege-Nat-Cerrado, fase F0   (versão 2)
 * ---------------------------------------------------------------------------
 * PERGUNTA (pendência da D10)
 *   No asset pasture_origin_age_v2, o código 2xx é IDADE (cresce 1 por ano
 *   enquanto a pastagem continua) ou ANO DE ORIGEM (fica constante)?
 *   E a idade bate com a contagem de anos consecutivos de classe 15 na LULC?
 *
 * POR QUE VERSÃO 2
 *   A v1 usava stratifiedSample no Cerrado inteiro a 30 m e estourava o tempo
 *   do Console ("Computation timed out"). Esta versão sorteia PONTOS aleatórios
 *   no Cerrado e lê os pixels só nesses pontos — muito mais leve. O resultado
 *   completo sai por Export (aba Tasks), que não tem o limite de tempo do Console.
 *
 * O QUE FAZ
 *   1. Sorteia N_PONTOS pontos no Cerrado (semente fixa).
 *   2. Mantém só os pontos que foram pastagem (15) em TODOS os anos 2010–2020
 *      e que NÃO são pastagem contínua desde 1985.
 *   3. Para cada ponto: código do asset em cada ano 2010–2020 e contagem de
 *      anos consecutivos de pastagem até 2010 calculada da própria LULC.
 *   4. Exporta a tabela (eu faço a análise a partir do CSV).
 *   5. No Console, só um TESTE RÁPIDO com poucos pontos, para você ver se funciona.
 *
 * COMO RODAR
 *   1. Run. Confira no Console o teste rápido (deve aparecer em < 1 min).
 *   2. Aba Tasks → Run em "F0_02_semantica_idade_pastagem". Baixe o CSV e me envie.
 *
 * COMO LER O TESTE RÁPIDO (Console)
 *   - diff = código2020 − código2010. Quase tudo 10 → 2xx é idade.
 *     Quase tudo 0 → 2xx é ano de origem.
 *
 * O QUE PODE QUEBRAR E COMO PERCEBER
 *   - Teste rápido com 0 pontos: aumente N_TESTE (ex.: 5000) ou confira o limite
 *     do Cerrado.
 *   - Tarefa de exportação falha por memória: reduza N_PONTOS para 50000.
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
var SEMENTE = 42;        // semente fixa (reprodutibilidade)
var N_PONTOS = 100000;   // pontos sorteados para a exportação (~10% devem ser pastagem-alvo)
var N_TESTE = 2000;      // pontos do teste rápido no Console
var ANOS_COD = [2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020];
// ---------------------------------------------------------------------------

// Bandas confirmadas pelo script 01: classification_1985 ... classification_2025.
function banda(img, ano) { return img.select('classification_' + ano); }
function intervalo(a, b) { var o = []; for (var i = a; i <= b; i++) o.push(i); return o; }

// Pastagem em todos os anos 2010–2020.
var pastContinua = ee.Image(1);
intervalo(2010, 2020).forEach(function (a) {
  pastContinua = pastContinua.and(banda(cobertura, a).eq(15));
});

// Anos consecutivos de pastagem terminando em 2010 (contando 2010), da LULC.
// Percorre 1985→2010: se é pastagem soma 1, senão zera.
var consecutivos = ee.Image(0);
intervalo(1985, 2010).forEach(function (a) {
  consecutivos = consecutivos.add(1).multiply(banda(cobertura, a).eq(15));
});

// Exclui pastagem contínua desde 1985 (essa deve receber 100, não 2xx).
var alvo = pastContinua.and(consecutivos.lt(26)).rename('alvo');  // 1985–2010 = 26 anos

// Pilha de bandas lidas em cada ponto: códigos do asset ano a ano + contagem LULC.
var pilha = consecutivos.rename('consec_lulc_2010');
ANOS_COD.forEach(function (a) {
  pilha = pilha.addBands(banda(idade, a).rename('cod' + a));
});
pilha = pilha.updateMask(alvo);   // pontos fora do alvo saem da amostra

// Lê os pixels nos pontos e acrescenta as colunas de diagnóstico.
function amostrar(nPontos) {
  var pontos = ee.FeatureCollection.randomPoints({
    region: CERRADO, points: nPontos, seed: SEMENTE, maxError: 100
  });
  return pilha.sampleRegions({
    collection: pontos, scale: 30, geometries: true, tileScale: 4
  }).map(function (f) {
    var c10 = ee.Number(f.get('cod2010'));
    var c20 = ee.Number(f.get('cod2020'));
    var cons = ee.Number(f.get('consec_lulc_2010'));
    return f.set({
      diff_2020_2010: c20.subtract(c10),
      cod2010_eh_100: c10.eq(100),                    // 100 não é 2xx
      bate_idade_consec: c10.eq(cons.add(200)),       // hipótese 2xx = 200 + idade
      bate_idade_consec_menos1: c10.eq(cons.add(199)) // idem, idade começando em 0
    });
  });
}

// --- Teste rápido no Console (poucos pontos) --------------------------------
var teste = amostrar(N_TESTE);
teste.size().evaluate(function (n) { print('Teste rápido — pontos-alvo encontrados:', n); });
teste.aggregate_histogram('diff_2020_2010').evaluate(function (h) {
  print('Teste rápido — histograma de diff (2020 − 2010):', h);
});
teste.aggregate_mean('bate_idade_consec').evaluate(function (m) {
  print('Teste rápido — fração cod2010 = 200 + consecutivos LULC:', m);
});

// --- Exportação completa (sem limite de tempo do Console) --------------------
var colunas = ['consec_lulc_2010', 'diff_2020_2010', 'cod2010_eh_100',
               'bate_idade_consec', 'bate_idade_consec_menos1']
  .concat(ANOS_COD.map(function (a) { return 'cod' + a; }));

Export.table.toDrive({
  collection: amostrar(N_PONTOS),
  description: 'F0_02_semantica_idade_pastagem',
  folder: PASTA_DRIVE,
  fileFormat: 'CSV',
  selectors: colunas.concat(['.geo'])
});
