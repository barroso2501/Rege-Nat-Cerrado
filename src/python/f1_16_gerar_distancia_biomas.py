"""
f1_16_gerar_distancia_biomas.py — Rege-Nat-Cerrado, F1, análise EXPLORATÓRIA [E]

O QUE FAZ
    Gera src/gee/16_distancia_biomas_p1.js, com os 750 pontos da P1 embutidos
    (código, lon, lat; SEM estrato, vindos de results/f1/amostra_p1_interpretacao.csv).
    O script GEE calcula, para cada ponto, a distância (km) até cada bioma vizinho do
    asset IBGE e exporta um CSV para o Drive.

PARA QUE SERVE
    Testar se o erro do evento (estrato E) tem viés espacial: zonas de transição
    (Amazônia, Caatinga, Mata Atlântica, Pantanal) × área core do Cerrado.
    Classes FIXADAS ANTES de ver as distâncias (2026-11-12):
      - distância ao bioma vizinho mais próximo: ≤50 km | 50–150 km | >150 km (core);
      - para pontos a ≤150 km: qual é o bioma vizinho mais próximo.
    É análise exploratória, depois da abertura da CHAVE: não muda o critério da P1.

COMO RODAR (da raiz do repositório)
    python src/python/f1_16_gerar_distancia_biomas.py
    Depois, no GEE: cole e rode src/gee/16_distancia_biomas_p1.js, inicie a task
    "F1_16_distancia_biomas" e me envie o CSV.

O QUE PODE QUEBRAR E COMO PERCEBER
    - FileNotFoundError: rode da raiz do repositório.
    - Só usa a biblioteca padrão.
"""

import csv
from pathlib import Path

ENTRADA = Path("results/f1/amostra_p1_interpretacao.csv")
SAIDA = Path("src/gee/16_distancia_biomas_p1.js")

CABECALHO = r"""/**
 * 16_distancia_biomas_p1.js — Rege-Nat-Cerrado, F1, análise EXPLORATÓRIA [E]
 * GERADO por src/python/f1_16_gerar_distancia_biomas.py — não edite a lista à mão.
 * ---------------------------------------------------------------------------
 * O QUE FAZ
 *   Para cada um dos 750 pontos da P1 (sem estrato), calcula a distância em km até
 *   cada bioma IBGE diferente do Cerrado e exporta uma tabela para o Drive.
 *   Os limites são simplificados a 1 km (erro de distância da ordem de 1 km,
 *   desprezível frente às classes de 50 e 150 km).
 *
 * COMO USAR
 *   1. Run. O Console mostra os nomes dos biomas encontrados no asset.
 *   2. Em Tasks, rode "F1_16_distancia_biomas" (CSV na pasta RegeNat do Drive).
 *
 * O QUE PODE QUEBRAR E COMO PERCEBER
 *   - Erro "Collection.loadTable": confira o caminho do asset IBGE abaixo.
 *   - Task demora mais de ~30 min: os polígonos são pesados; aumente SIMPLIF_M para 5000.
 * ---------------------------------------------------------------------------
 */

var BIOMAS = ee.FeatureCollection('projects/ee-barroso2501/assets/biomas_IBGE');
var CAMPO = 'NM_BIOMA';
var SIMPLIF_M = 1000;

// [codigo, lon, lat]
var PONTOS = [
/*__PONTOS__*/
];

// Nomes dos biomas vizinhos (todos menos o Cerrado), lidos do próprio asset.
var nomes = BIOMAS.aggregate_array(CAMPO).distinct().remove('Cerrado');
print('Biomas vizinhos considerados:', nomes);

// Uma geometria simplificada por bioma vizinho (calculada uma vez só).
var geoms = nomes.map(function (n) {
  return BIOMAS.filter(ee.Filter.eq(CAMPO, n)).geometry().simplify(SIMPLIF_M);
});

var fc = ee.FeatureCollection(PONTOS.map(function (p) {
  return ee.Feature(ee.Geometry.Point([p[1], p[2]]), {codigo: p[0]});
}));

// Distância (km) de cada ponto a cada bioma vizinho.
var saida = fc.map(function (f) {
  var d = geoms.map(function (g) {
    return f.geometry().distance(ee.Geometry(g), SIMPLIF_M).divide(1000);
  });
  return ee.Feature(null, ee.Dictionary.fromLists(nomes, d))
    .set('codigo', f.get('codigo'));
});

Export.table.toDrive({
  collection: saida,
  description: 'F1_16_distancia_biomas',
  folder: 'RegeNat',
  fileFormat: 'CSV'
});
"""

with ENTRADA.open(newline="", encoding="utf-8") as fh:
    linhas = list(csv.DictReader(fh))
pontos = ",\n".join(f"  ['{r['codigo']}', {r['lon']}, {r['lat']}]" for r in linhas)
SAIDA.write_text(CABECALHO.replace("/*__PONTOS__*/", pontos), encoding="utf-8")
print(f"{len(linhas)} pontos → {SAIDA}")
