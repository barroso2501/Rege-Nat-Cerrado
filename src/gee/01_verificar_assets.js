/**
 * 01_verificar_assets.js — Rege-Nat-Cerrado, fase F0
 * ---------------------------------------------------------------------------
 * O QUE FAZ
 *   Para cada asset usado no projeto, imprime no Console:
 *   - se o asset existe e você consegue ler;
 *   - número de bandas, primeira e última banda, tipo de dado;
 *   - metadados de identidade (updateTime, sizeBytes, propriedades), que vão
 *     para data/manifestos/manifesto.csv.
 *   Não processa nenhum pixel. Roda em segundos.
 *
 * COMO RODAR
 *   1. Cole no Code Editor (code.earthengine.google.com) e clique em Run.
 *   2. No Console, copie TODO o bloco que começa com "=== MANIFESTO ===" e
 *      salve como results/f0_diagnosticos/01_assets_<data>.txt.
 *
 * O QUE PODE QUEBRAR E COMO PERCEBER
 *   - "Asset not found" ou "permission denied": o asset mudou de nome ou não
 *     é público. Pare e me avise; não substitua por outro asset.
 *   - Banda final diferente de 2025: a série publicada mudou.
 * ---------------------------------------------------------------------------
 */

var C11 = 'projects/mapbiomas-public/assets/brazil/lulc/collection11/';
var ASSETS = {
  cobertura: C11 + 'mapbiomas_brazil_collection11_coverage_v3',
  vegsec: C11 + 'mapbiomas_brazil_collection11_deforestation_secondary_vegetation_v5',
  vegsecCob: C11 + 'mapbiomas_brazil_collection11_deforestation_secondary_vegetation_by_coverage_v1',
  idadePastagem: C11 + 'mapbiomas_brazil_collection11_pasture_origin_age_v2',
  vigor: C11 + 'mapbiomas_brazil_collection11_pasture_vigor_v1'
};

print('=== MANIFESTO === executado em', new Date().toISOString());

// Para cada asset, pede os metadados ao servidor (assíncrono: não trava o editor).
Object.keys(ASSETS).forEach(function (chave) {
  var id = ASSETS[chave];
  ee.data.getAsset(id, function (info, erro) {
    if (erro) {
      print('ERRO', chave, id, erro);
      return;
    }
    var bandas = info.bands || [];
    var resumo = {
      chave: chave,
      asset_id: id,
      tipo: info.type,
      updateTime: info.updateTime,
      sizeBytes: info.sizeBytes,
      n_bandas: bandas.length,
      primeira_banda: bandas.length ? bandas[0].id : null,
      ultima_banda: bandas.length ? bandas[bandas.length - 1].id : null,
      tipo_dado_primeira: bandas.length ? JSON.stringify(bandas[0].dataType) : null,
      propriedades: JSON.stringify(info.properties || {})
    };
    // Uma linha JSON por asset: fácil de copiar para o manifesto.
    print(JSON.stringify(resumo));
  });
});

// Lista completa de bandas da idade da pastagem (prefixo ainda não confirmado).
ee.Image(ASSETS.idadePastagem).bandNames().evaluate(function (nomes) {
  print('Bandas de pasture_origin_age_v2:', nomes);
});
