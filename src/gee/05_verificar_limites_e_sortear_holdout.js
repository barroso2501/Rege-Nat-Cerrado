/**
 * 05_verificar_limites_e_sortear_holdout.js — Rege-Nat-Cerrado, fase F0 (congelamento)
 * ---------------------------------------------------------------------------
 * O QUE FAZ (PROTOCOLO §11)
 *   1. Confere que o asset IBGE do limite do Cerrado e o asset das 38 regiões
 *      de classificação existem e são legíveis.
 *   2. Calcula a área (km²) de cada região dentro do limite IBGE do Cerrado.
 *   3. Sorteia o HOLDOUT: ordena as regiões por um número aleatório com semente
 *      fixa (20261029) e acumula até atingir ≥ 10% da área do Cerrado.
 *   4. Exporta a tabela (região, área, número aleatório, posição, holdout 0/1).
 *
 * COMO RODAR
 *   1. (LIMITE_IBGE já preenchido: projects/ee-barroso2501/assets/biomas_IBGE, NM_BIOMA = 'Cerrado'.)
 *   2. Run. Confira no Console: número de regiões (38 esperadas) e as regiões
 *      sorteadas.
 *   3. Tasks → Run em "F0_05_holdout". Envie o CSV. Ele entra no repositório
 *      ANTES da tag protocolo-v1.0.
 *
 * REGRA
 *   Rode o sorteio UMA vez. Se precisar rodar de novo (por erro técnico), a
 *   semente é a mesma e o resultado deve ser idêntico; registre o motivo.
 *
 * O QUE PODE QUEBRAR E COMO PERCEBER
 *   - "Asset not found"/permissão nas regiões: o asset de terceiros não é
 *     público. Pare e me avise (alternativa: regiões do repositório MapBiomas).
 *   - Número de regiões ≠ 38: versão do asset diferente da Col. 11 — me avise.
 * ---------------------------------------------------------------------------
 */

// ----------------------------- CONFIG ---------------------------------------
var LIMITE_IBGE = 'projects/ee-barroso2501/assets/biomas_IBGE';
var CAMPO_BIOMA = 'NM_BIOMA';
var VALOR_CERRADO = 'Cerrado';

var REGIOES = 'users/dh-conciani/collection7/classification_regions/vector_v2';
var CAMPO_REGIAO = 'mapb';     // 1..38 no código MapBiomas Cerrado

var SEMENTE = 20261029;
var FRACAO_HOLDOUT = 0.10;
var PASTA_DRIVE = 'RegeNat_F0_diagnosticos';
// ---------------------------------------------------------------------------

var cerrado = ee.FeatureCollection(LIMITE_IBGE)
  .filter(ee.Filter.eq(CAMPO_BIOMA, VALOR_CERRADO)).geometry();
var regioes = ee.FeatureCollection(REGIOES);

print('Feições do limite IBGE (Cerrado):',
      ee.FeatureCollection(LIMITE_IBGE).filter(ee.Filter.eq(CAMPO_BIOMA, VALOR_CERRADO)).size());
print('Número de regiões (esperado 38):', regioes.size());
print('Valores do campo', CAMPO_REGIAO, regioes.aggregate_array(CAMPO_REGIAO).sort());

// Área de cada região dentro do Cerrado IBGE (km²), com erro máximo de 100 m.
var comArea = regioes.map(function (f) {
  var dentro = f.geometry().intersection(cerrado, 100);
  return ee.Feature(null, {
    regiao: f.get(CAMPO_REGIAO),
    area_km2: dentro.area(100).divide(1e6)
  });
});

// Número aleatório reprodutível por região, e ordenação por ele.
var ordenadas = comArea.randomColumn('aleatorio', SEMENTE).sort('aleatorio');
var areaTotal = ee.Number(ordenadas.aggregate_sum('area_km2'));

// Acumula áreas na ordem sorteada; holdout = regiões até atingir a fração-alvo
// (a região que cruza o limite entra, para garantir ≥ 10%).
var lista = ordenadas.toList(ordenadas.size());
var resultado = ee.Dictionary(lista.iterate(function (f, acc) {
  acc = ee.Dictionary(acc);
  f = ee.Feature(f);
  var acumAntes = ee.Number(acc.get('acum'));
  var dentro = acumAntes.lt(areaTotal.multiply(FRACAO_HOLDOUT));
  var acum = acumAntes.add(f.get('area_km2'));
  var pos = ee.Number(acc.get('pos')).add(1);
  var nova = f.set({posicao: pos, area_acum_km2: acum, holdout: ee.Number(dentro).int()});
  return ee.Dictionary({acum: acum, pos: pos,
                        fs: ee.List(acc.get('fs')).add(nova)});
}, ee.Dictionary({acum: 0, pos: 0, fs: ee.List([])}))).get('fs');

var tabela = ee.FeatureCollection(ee.List(resultado));

print('Área total do Cerrado nas regiões (km²):', areaTotal);
print('Regiões sorteadas para o HOLDOUT:', tabela.filter(ee.Filter.eq('holdout', 1)).aggregate_array('regiao'));
print('Fração da área no holdout:',
      ee.Number(tabela.filter(ee.Filter.eq('holdout', 1)).aggregate_sum('area_km2')).divide(areaTotal));

Export.table.toDrive({
  collection: tabela,
  description: 'F0_05_holdout',
  folder: PASTA_DRIVE,
  fileFormat: 'CSV',
  selectors: ['posicao', 'regiao', 'aleatorio', 'area_km2', 'area_acum_km2', 'holdout']
});

Map.addLayer(regioes, {color: '999999'}, 'Regiões');
Map.addLayer(cerrado, {color: '00aa00'}, 'Cerrado IBGE');
