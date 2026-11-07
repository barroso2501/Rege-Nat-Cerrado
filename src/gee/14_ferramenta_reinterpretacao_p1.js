/**
 * 14_ferramenta_reinterpretacao_p1.js — Rege-Nat-Cerrado, F1, REINTERPRETAÇÃO CEGA (P1 §4)
 * GERADO por src/python/f1_14_preparar_reinterpretacao.py a partir de
 * results/f1/reinterpretacao/amostra_p1_reinterpretacao.csv (sem estrato) — não edite a lista à mão.
 * ---------------------------------------------------------------------------
 * PARA QUE SERVE
 *   Mostrar, ponto a ponto, as imagens necessárias para responder:
 *   "Entre t-3 e t+3, a área deixou de ser pastagem manejada e passou a ter
 *    vegetação savânica em recuperação?" (docs/plano_validacao_P1.md §2)
 *
 * O QUE MOSTRA (só imagens; NENHUMA camada MapBiomas — cegamento)   — VERSÃO 2
 *   - MINIATURAS no painel, uma por ano de t-4 a 2025 (janela de 1,2 km, período
 *     seco mai–set): Sentinel-2 a partir de 2016, Landsat antes. Anos da janela
 *     t-3..t+3 com rótulo em preto. O ponto (pixel de 30 m) em vermelho.
 *   - mapa com a imagem de satélite atual do Google e o ponto;
 *   - gráfico do NDVI do período seco, 1985–2025, no pixel, com t marcado;
 *   - link para o Google Earth Web (imagens históricas de alta resolução).
 *
 * COMO USAR
 *   1. Run. Escolha o código (R01…R75) no menu ou use "Próximo".
 *   2. Leia as miniaturas e o NDVI; use o Google Earth Web (link) para a alta
 *      resolução histórica quando as miniaturas não bastarem.
 *   3. Registre na planilha amostra_p1_reinterpretacao.csv: categoria (1 regeneração
 *      real; 2 sem mudança aparente; 3 outra mudança; 4 incerto), confiança
 *      (alta/baixa), imagens usadas e comentário curto.
 *   Interprete na ordem dos códigos. Não volte para alterar respostas antigas
 *   depois de ver outros pontos (se precisar, registre no comentário).
 *
 * O QUE PODE QUEBRAR E COMO PERCEBER
 *   - Gráfico demora ou dá timeout: espere ou clique no ponto de novo.
 *   - Composição vazia (cinza) num ano: poucas imagens sem nuvem; use os anos vizinhos.
 * ---------------------------------------------------------------------------
 */


// [codigo, lon, lat, t]
var PONTOS = [
  ['R01', -48.369292, -11.416464, 2018],
  ['R02', -45.467105, -18.748065, 2021],
  ['R03', -52.005313, -15.626509, 2017],
  ['R04', -50.593162, -14.289277, 2019],
  ['R05', -48.249906, -11.456350, 2018],
  ['R06', -44.759951, -13.026695, 2017],
  ['R07', -46.549126, -12.207161, 2018],
  ['R08', -43.979765, -6.520556, 2018],
  ['R09', -49.594415, -12.859338, 2021],
  ['R10', -45.561428, -18.865025, 2019],
  ['R11', -57.436168, -15.983320, 2020],
  ['R12', -54.978108, -14.994813, 2020],
  ['R13', -47.186750, -17.674937, 2017],
  ['R14', -49.166457, -11.908292, 2019],
  ['R15', -47.621984, -17.462306, 2018],
  ['R16', -56.563545, -21.958284, 2020],
  ['R17', -46.952290, -15.492300, 2017],
  ['R18', -54.819915, -15.038472, 2018],
  ['R19', -54.453941, -17.051327, 2017],
  ['R20', -43.365317, -17.765757, 2020],
  ['R21', -43.633464, -6.627007, 2018],
  ['R22', -53.816856, -16.486197, 2018],
  ['R23', -48.468736, -10.327167, 2018],
  ['R24', -48.113003, -17.522134, 2018],
  ['R25', -47.043649, -14.664683, 2017],
  ['R26', -48.629355, -9.339200, 2017],
  ['R27', -49.391755, -12.862303, 2020],
  ['R28', -48.300032, -10.431192, 2019],
  ['R29', -45.091160, -18.146283, 2021],
  ['R30', -53.834373, -19.114847, 2021],
  ['R31', -54.483316, -21.226337, 2017],
  ['R32', -48.261495, -7.631952, 2021],
  ['R33', -56.134779, -14.926631, 2018],
  ['R34', -46.455881, -20.170726, 2018],
  ['R35', -52.045468, -18.102625, 2019],
  ['R36', -50.078158, -16.622291, 2021],
  ['R37', -44.654849, -15.645912, 2019],
  ['R38', -48.962989, -15.648877, 2020],
  ['R39', -48.056679, -15.277783, 2020],
  ['R40', -52.850718, -17.659037, 2019],
  ['R41', -46.327332, -20.181776, 2020],
  ['R42', -43.141367, -16.347946, 2021],
  ['R43', -44.173801, -6.471778, 2019],
  ['R44', -46.116318, -16.526890, 2019],
  ['R45', -43.204159, -17.071808, 2021],
  ['R46', -55.592556, -15.461039, 2018],
  ['R47', -46.953368, -16.740330, 2020],
  ['R48', -58.766124, -15.082669, 2020],
  ['R49', -55.024192, -14.977566, 2020],
  ['R50', -49.051922, -19.512621, 2021],
  ['R51', -46.552629, -16.491317, 2017],
  ['R52', -54.041345, -17.528063, 2018],
  ['R53', -44.073279, -18.990071, 2019],
  ['R54', -49.146784, -9.747754, 2021],
  ['R55', -42.141812, -4.278900, 2020],
  ['R56', -47.786915, -8.325092, 2020],
  ['R57', -53.519064, -16.409121, 2018],
  ['R58', -57.022764, -21.184565, 2017],
  ['R59', -56.627684, -15.648607, 2019],
  ['R60', -51.307861, -18.330617, 2019],
  ['R61', -48.637170, -11.977552, 2017],
  ['R62', -47.043649, -15.184538, 2020],
  ['R63', -42.403221, -16.534706, 2020],
  ['R64', -52.241660, -16.395107, 2017],
  ['R65', -52.672851, -16.021588, 2017],
  ['R66', -46.756367, -12.322505, 2018],
  ['R67', -51.813972, -17.118161, 2017],
  ['R68', -56.118879, -14.536403, 2019],
  ['R69', -55.326295, -14.862492, 2018],
  ['R70', -48.722330, -9.404687, 2019],
  ['R71', -52.345146, -18.048726, 2020],
  ['R72', -46.290142, -17.093368, 2021],
  ['R73', -54.806440, -19.871587, 2019],
  ['R74', -48.485714, -15.732151, 2021],
  ['R75', -48.217836, -18.788219, 2021]
];

// ---------- Landsat Coleção 2 nível 2: harmonização, máscara de nuvem, escala ----------
function prepLandsat(img, azul, verde, verm, nir, swir1, swir2) {
  var qa = img.select('QA_PIXEL');
  var limpo = qa.bitwiseAnd(1 << 3).eq(0).and(qa.bitwiseAnd(1 << 4).eq(0));   // nuvem e sombra
  return img.select([azul, verde, verm, nir, swir1, swir2], ['azul', 'verde', 'verm', 'nir', 'swir1', 'swir2'])
    .multiply(0.0000275).add(-0.2).updateMask(limpo)
    .copyProperties(img, ['system:time_start']);
}
var L5 = ee.ImageCollection('LANDSAT/LT05/C02/T1_L2').map(function (i) { return prepLandsat(i, 'SR_B1', 'SR_B2', 'SR_B3', 'SR_B4', 'SR_B5', 'SR_B7'); });
var L7 = ee.ImageCollection('LANDSAT/LE07/C02/T1_L2').map(function (i) { return prepLandsat(i, 'SR_B1', 'SR_B2', 'SR_B3', 'SR_B4', 'SR_B5', 'SR_B7'); });
var L8 = ee.ImageCollection('LANDSAT/LC08/C02/T1_L2').map(function (i) { return prepLandsat(i, 'SR_B2', 'SR_B3', 'SR_B4', 'SR_B5', 'SR_B6', 'SR_B7'); });
var L9 = ee.ImageCollection('LANDSAT/LC09/C02/T1_L2').map(function (i) { return prepLandsat(i, 'SR_B2', 'SR_B3', 'SR_B4', 'SR_B5', 'SR_B6', 'SR_B7'); });
var LANDSAT = L5.merge(L7).merge(L8).merge(L9);

// Composição mediana do período seco (maio a setembro) de um ano, recortada perto do ponto.
function secaLandsat(ano, regiao) {
  return LANDSAT.filterBounds(regiao)
    .filterDate(ee.Date.fromYMD(ano, 5, 1), ee.Date.fromYMD(ano, 10, 1))
    .median().clip(regiao);
}
function secaS2(ano, regiao) {
  return ee.ImageCollection('COPERNICUS/S2_HARMONIZED').filterBounds(regiao)
    .filterDate(ee.Date.fromYMD(ano, 5, 1), ee.Date.fromYMD(ano, 10, 1))
    .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20))
    .median().divide(10000).clip(regiao);
}

var VIS_NAT = {bands: ['verm', 'verde', 'azul'], min: 0.0, max: 0.15, gamma: 1.3};
var VIS_FALSA = {bands: ['swir1', 'nir', 'verm'], min: 0.0, max: 0.4};
var VIS_S2 = {bands: ['B4', 'B3', 'B2'], min: 0.0, max: 0.15, gamma: 1.3};

// ---------- Interface ----------
Map.setOptions('SATELLITE');
var painel = ui.Panel({style: {width: '560px'}});
ui.root.insert(0, painel);

var codigos = PONTOS.map(function (p) { return p[0]; });
var seletor = ui.Select({items: codigos, placeholder: 'Escolha o ponto'});
var info = ui.Label('');
var linkGE = ui.Label('', {color: '1a73e8'});
var areaGrafico = ui.Panel();
var areaMini = ui.Panel({layout: ui.Panel.Layout.flow('horizontal', true)});
var botaoAnt = ui.Button('◀ Anterior');
var botaoProx = ui.Button('Próximo ▶');

painel.add(ui.Label('Reinterpretação cega P1 — Rege-Nat-Cerrado (não consulte a 1ª rodada)', {fontWeight: 'bold', fontSize: '16px'}));
painel.add(ui.Label('Categorias: 1 regeneração real · 2 sem mudança aparente · 3 outra mudança · 4 incerto'));
painel.add(ui.Label('Já foi convertida? (retirada total da biomassa; fogo/degradação não) — sim/não/talvez', {fontSize: '12px'}));
painel.add(ui.Label('Já foi pastagem plantada? (vs. campo nativo/agricultura) — sim/não/talvez', {fontSize: '12px'}));
painel.add(ui.Label('Colunas auxiliares: só explicam as categorias 2–4; não entram na análise.', {fontSize: '12px', color: '666666'}));
painel.add(seletor);
painel.add(ui.Panel([botaoAnt, botaoProx], ui.Panel.Layout.flow('horizontal')));
painel.add(info);
painel.add(linkGE);
painel.add(areaMini);
painel.add(areaGrafico);

function mostrar(codigo) {
  var p = PONTOS.filter(function (x) { return x[0] === codigo; })[0];
  var lon = p[1], lat = p[2], t = p[3];
  var ponto = ee.Geometry.Point([lon, lat]);
  var regiao = ponto.buffer(1500).bounds();

  Map.layers().reset();
  Map.centerObject(ponto, 16);   // fundo: imagem de satélite atual do Google

  // Contorno do pixel de 30 m, para o mapa e para as miniaturas.
  var contorno = ee.Image().paint(ee.FeatureCollection([ee.Feature(ponto.buffer(15).bounds())]), 1, 2)
    .visualize({palette: ['ff0000']});
  Map.addLayer(contorno, {}, 'Ponto (30 m)');

  // MINIATURAS (v2): uma por ano, de t-4 a 2025, todas na mesma janela de 1,2 km.
  // Sentinel-2 (10 m) a partir de 2016; Landsat (30 m) antes disso.
  // Carregam em paralelo e são bem mais rápidas que camadas no mapa.
  var caixa = ponto.buffer(600).bounds();
  areaMini.clear();
  for (var ano = t - 4; ano <= 2025; ano++) {
    var usaS2 = ano >= 2016;
    var base = usaS2 ? secaS2(ano, caixa).visualize(VIS_S2) : secaLandsat(ano, caixa).visualize(VIS_NAT);
    var rot = ano + (ano === t ? ' (t)' : '') + (usaS2 ? ' S2' : ' L');
    var corRot = (ano >= t - 3 && ano <= t + 3) ? '000000' : '999999';   // janela em preto
    areaMini.add(ui.Panel([
      ui.Label(rot, {fontSize: '11px', margin: '0', color: corRot}),
      ui.Thumbnail({image: base.blend(contorno), params: {region: caixa, dimensions: 120, format: 'png'},
                    style: {margin: '0'}})
    ], ui.Panel.Layout.flow('vertical'), {margin: '2px'}));
  }

  info.setValue(codigo + '  ·  centro da janela t = ' + t + '  ·  janela de interpretação: ' + (t - 3) + '–' + (t + 3));
  linkGE.setValue('Abrir no Google Earth Web (alta resolução, histórico)');
  linkGE.setUrl('https://earth.google.com/web/@' + lat + ',' + lon + ',600a,800d,35y,0h,0t,0r');

  // NDVI do período seco, 1985–2025, no ponto.
  var anos = ee.List.sequence(1985, 2025);
  var serie = ee.ImageCollection(anos.map(function (ano) {
    ano = ee.Number(ano);
    var img = LANDSAT.filterBounds(ponto)
      .filterDate(ee.Date.fromYMD(ano, 5, 1), ee.Date.fromYMD(ano, 10, 1)).median();
    var ndvi = ee.Algorithms.If(img.bandNames().size().gt(0),
      img.normalizedDifference(['nir', 'verm']).rename('NDVI'),
      ee.Image().rename('NDVI'));
    return ee.Image(ndvi).set('system:time_start', ee.Date.fromYMD(ano, 7, 1).millis());
  }));
  var grafico = ui.Chart.image.series({imageCollection: serie, region: ponto.buffer(15), reducer: ee.Reducer.mean(), scale: 30})
    .setOptions({title: 'NDVI período seco (mai–set) — t = ' + t + '; janela ' + (t - 3) + '–' + (t + 3),
                 hAxis: {title: 'Ano'}, vAxis: {title: 'NDVI', viewWindow: {min: 0, max: 0.9}},
                 lineWidth: 1, pointSize: 3, legend: {position: 'none'}});
  areaGrafico.clear();
  areaGrafico.add(grafico);
}

seletor.onChange(mostrar);
function passo(delta) {
  var i = codigos.indexOf(seletor.getValue());
  var j = Math.min(codigos.length - 1, Math.max(0, (i < 0 ? 0 : i + delta)));
  seletor.setValue(codigos[j]);   // dispara mostrar()
}
botaoProx.onClick(function () { passo(1); });
botaoAnt.onClick(function () { passo(-1); });
seletor.setValue(codigos[0]);
