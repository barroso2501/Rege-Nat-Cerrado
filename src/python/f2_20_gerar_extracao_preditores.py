"""
f2_20_gerar_extracao_preditores.py — Rege-Nat-Cerrado, Fase 2, Etapa 3 (preparação)

O QUE FAZ
    Gera src/gee/20_extrair_preditores_p1.js com os 750 pontos da P1 embutidos
    (código, lon, lat; SEM estrato e SEM categoria). O script GEE extrai, por ponto e
    por ano, os candidatos a preditor do detector (plano da Fase 2, Etapa 3):
      Tarefa A (MapBiomas C11 + MODIS):
        - idade da pastagem (pasture_origin_age_v2), 1985–2025;
        - vigor da pastagem (pasture_vigor_v1), 2000–2025;
        - biomassa da pastagem (pasture_biomass_v1), 2000–2025;
        - área queimada MODIS MCD64A1 (0/1 por ano, 500 m), 2001–2025;
        - (opcional) MapBiomas Fogo, se FOGO_ASSET for preenchido no script.
      Tarefas B, C, D (Landsat C2 L2, medianas sazonais, 1990–2025):
        - NDVI e NDTI = (SWIR1−SWIR2)/(SWIR1+SWIR2) [H: sensível a material seco/macega]
        - estações: úmida (jan–mar), início da seca (mai–jul), fim da seca (ago–set).
    Nenhum rótulo entra: pode rodar antes da reclassificação da Etapa 2.

COMO RODAR (da raiz do repositório)
    python src/python/f2_20_gerar_extracao_preditores.py
    No GEE: cole e rode src/gee/20_extrair_preditores_p1.js e inicie as 4 tarefas
    (F2_20A_mapbiomas_modis, F2_20B_landsat_umida, F2_20C_landsat_seca_ini,
    F2_20D_landsat_seca_fim). Mande-me os 4 CSVs.

O QUE PODE QUEBRAR E COMO PERCEBER
    - FileNotFoundError: rode da raiz do repositório.
    - Só usa a biblioteca padrão.
"""

import csv
from pathlib import Path

ENTRADA = Path("results/f1/amostra_p1_interpretacao.csv")
SAIDA = Path("src/gee/20_extrair_preditores_p1.js")

MODELO = r"""/**
 * 20_extrair_preditores_p1.js — Rege-Nat-Cerrado, Fase 2, Etapa 3 (preparação)
 * GERADO por src/python/f2_20_gerar_extracao_preditores.py — não edite a lista à mão.
 * ---------------------------------------------------------------------------
 * O QUE FAZ
 *   Extrai, para os 750 pontos da P1 (sem estrato, sem categoria), os candidatos a
 *   preditor do detector, em formato largo (uma coluna por variável e ano):
 *     A. idade, vigor e biomassa da pastagem (MapBiomas C11) e área queimada MODIS;
 *     B–D. medianas sazonais Landsat de NDVI e NDTI, 1990–2025 (úmida; início da seca;
 *          fim da seca).
 *
 * COMO USAR
 *   1. Run. Em Tasks, rode as 4 tarefas (CSV na pasta RegeNat do Drive).
 *   2. Opcional: preencha FOGO_ASSET com o asset anual de área queimada do MapBiomas
 *      Fogo (Coleção 5) antes do Run; a tarefa A ganha as colunas fogo_mb_AAAA.
 *
 * O QUE PODE QUEBRAR E COMO PERCEBER
 *   - "Image.select: band not found": o nome das bandas de um asset mudou; o Console
 *     mostra os nomes (print abaixo). Me envie o erro.
 *   - Tarefas B–D lentas (horas): são 750 pontos × 36 anos de medianas Landsat.
 *     Se passarem de ~6 h, me avise para dividir por período.
 *   - Valores vazios num ano: sem imagem sem nuvem na estação (normal antes de ~2000
 *     no norte do bioma).
 * ---------------------------------------------------------------------------
 */

var C11 = 'projects/mapbiomas-public/assets/brazil/lulc/collection11/';
var IDADE = ee.Image(C11 + 'mapbiomas_brazil_collection11_pasture_origin_age_v2');
var VIGOR = ee.Image(C11 + 'mapbiomas_brazil_collection11_pasture_vigor_v1');
var BIOMASSA = ee.Image(C11 + 'mapbiomas_brazil_collection11_pasture_biomass_v1');
var FOGO_ASSET = '';   // opcional: asset MapBiomas Fogo anual (bandas com o ano no nome)
var PASTA = 'RegeNat';

print('Bandas idade:', IDADE.bandNames().slice(0, 3), 'vigor:', VIGOR.bandNames().slice(0, 3),
      'biomassa:', BIOMASSA.bandNames().slice(0, 3));

// [codigo, lon, lat]
var PONTOS = [
/*__PONTOS__*/
];
var fc = ee.FeatureCollection(PONTOS.map(function (p) {
  return ee.Feature(ee.Geometry.Point([p[1], p[2]]), {codigo: p[0]});
}));

function anos(a, b) { var o = []; for (var i = a; i <= b; i++) o.push(i); return o; }

// Seleciona a banda cujo nome contém o ano (prefixos variam entre assets).
function bandaPorAno(img, ano, nome) {
  var n = img.bandNames().filter(ee.Filter.stringContains('item', String(ano)));
  return img.select([ee.String(n.get(0))]).rename(nome);
}

// ---------- Tarefa A: MapBiomas + MODIS ----------
var pilhaA = ee.Image.cat(anos(1985, 2025).map(function (a) { return bandaPorAno(IDADE, a, 'idade_' + a); }))
  .addBands(ee.Image.cat(anos(2000, 2025).map(function (a) { return bandaPorAno(VIGOR, a, 'vigor_' + a); })))
  .addBands(ee.Image.cat(anos(2000, 2025).map(function (a) { return bandaPorAno(BIOMASSA, a, 'biomassa_' + a); })));
if (FOGO_ASSET) {
  var FOGO = ee.Image(FOGO_ASSET);
  pilhaA = pilhaA.addBands(ee.Image.cat(anos(1985, 2025).map(function (a) {
    return bandaPorAno(FOGO, a, 'fogo_mb_' + a).gt(0).unmask(0);
  })));
}
var MODIS = ee.ImageCollection('MODIS/061/MCD64A1').select('BurnDate');
var pilhaModis = ee.Image.cat(anos(2001, 2025).map(function (a) {
  var col = MODIS.filterDate(ee.Date.fromYMD(a, 1, 1), ee.Date.fromYMD(a + 1, 1, 1));
  // Ano sem imagens (ex.: último ano incompleto): coluna vazia, em vez de erro.
  return ee.Image(ee.Algorithms.If(col.size().gt(0),
    col.max().gt(0).unmask(0).rename('fogo_modis_' + a),
    ee.Image.constant(0).rename('fogo_modis_' + a).updateMask(0)));
}));
var tabA = pilhaA.reduceRegions({collection: fc, reducer: ee.Reducer.first(), scale: 30});
tabA = pilhaModis.reduceRegions({collection: tabA, reducer: ee.Reducer.first(), scale: 500});
Export.table.toDrive({collection: tabA, description: 'F2_20A_mapbiomas_modis', folder: PASTA, fileFormat: 'CSV'});

// ---------- Tarefas B–D: Landsat sazonal ----------
function prepLandsat(img, verm, nir, swir1, swir2) {
  var qa = img.select('QA_PIXEL');
  var limpo = qa.bitwiseAnd(1 << 3).eq(0).and(qa.bitwiseAnd(1 << 4).eq(0));
  return img.select([verm, nir, swir1, swir2], ['verm', 'nir', 'swir1', 'swir2'])
    .multiply(0.0000275).add(-0.2).updateMask(limpo)
    .copyProperties(img, ['system:time_start']);
}
var regiao = fc.geometry().bounds();
var LANDSAT = ee.ImageCollection('LANDSAT/LT05/C02/T1_L2').filterBounds(regiao).map(function (i) { return prepLandsat(i, 'SR_B3', 'SR_B4', 'SR_B5', 'SR_B7'); })
  .merge(ee.ImageCollection('LANDSAT/LE07/C02/T1_L2').filterBounds(regiao).map(function (i) { return prepLandsat(i, 'SR_B3', 'SR_B4', 'SR_B5', 'SR_B7'); }))
  .merge(ee.ImageCollection('LANDSAT/LC08/C02/T1_L2').filterBounds(regiao).map(function (i) { return prepLandsat(i, 'SR_B4', 'SR_B5', 'SR_B6', 'SR_B7'); }))
  .merge(ee.ImageCollection('LANDSAT/LC09/C02/T1_L2').filterBounds(regiao).map(function (i) { return prepLandsat(i, 'SR_B4', 'SR_B5', 'SR_B6', 'SR_B7'); }));

// estação: [nome, mês inicial, mês final (inclusive)]
var ESTACOES = [['umida', 1, 3], ['seca_ini', 5, 7], ['seca_fim', 8, 9]];
var letras = {umida: 'B', seca_ini: 'C', seca_fim: 'D'};

ESTACOES.forEach(function (e) {
  var pilha = ee.Image.cat(anos(1990, 2025).map(function (a) {
    var nomes = ['NDVI_' + e[0] + '_' + a, 'NDTI_' + e[0] + '_' + a];
    var col = LANDSAT.filterDate(ee.Date.fromYMD(a, e[1], 1), ee.Date.fromYMD(a, e[2], 1).advance(1, 'month'));
    var med = col.median();
    var ind = med.normalizedDifference(['nir', 'verm']).addBands(med.normalizedDifference(['swir1', 'swir2'])).rename(nomes);
    // Estação sem imagens: colunas vazias, em vez de erro.
    return ee.Image(ee.Algorithms.If(col.size().gt(0), ind, ee.Image.constant([0, 0]).rename(nomes).updateMask(0)));
  }));
  var tab = pilha.reduceRegions({collection: fc, reducer: ee.Reducer.first(), scale: 30});
  Export.table.toDrive({collection: tab, description: 'F2_20' + letras[e[0]] + '_landsat_' + e[0],
                        folder: PASTA, fileFormat: 'CSV'});
});
"""

with ENTRADA.open(newline="", encoding="utf-8") as fh:
    linhas = list(csv.DictReader(fh))
pontos = ",\n".join(f"  ['{r['codigo']}', {r['lon']}, {r['lat']}]" for r in linhas)
SAIDA.write_text(MODELO.replace("/*__PONTOS__*/", pontos), encoding="utf-8")
print(f"{len(linhas)} pontos → {SAIDA}")
