/**
 * 00_config_comum.js — Rege-Nat-Cerrado
 * ---------------------------------------------------------------------------
 * Configuração e funções compartilhadas pelos scripts de verificação F0.
 *
 * NÃO é executado sozinho. Cada script (01, 02, 03, 04) tem uma cópia deste
 * bloco no topo, porque o Code Editor não importa arquivos locais sem
 * publicar um repositório GEE. Se mudar algo aqui, mude nas cópias também.
 *
 * Referência das escolhas: docs/decisoes.md (D01, D02, D07, D09, D10).
 * ---------------------------------------------------------------------------
 */

// Pasta pública da Coleção 11 do MapBiomas.
var C11 = 'projects/mapbiomas-public/assets/brazil/lulc/collection11/';

var ASSETS = {
  // LULC anual integrada (legenda pública C11). Bandas: classification_1985 ... _2025
  cobertura: C11 + 'mapbiomas_brazil_collection11_coverage_v3',
  // Desmatamento e vegetação secundária: códigos 0–7. Bandas: classification_1987 ... _2025
  vegsec: C11 + 'mapbiomas_brazil_collection11_deforestation_secondary_vegetation_v5',
  // Idem, codificado como transição*100 + cobertura(ano-1). 515 = recuperação a partir de pastagem
  vegsecCob: C11 + 'mapbiomas_brazil_collection11_deforestation_secondary_vegetation_by_coverage_v1',
  // Idade/origem da pastagem (D10). Prefixo das bandas a confirmar no script 01.
  idadePastagem: C11 + 'mapbiomas_brazil_collection11_pasture_origin_age_v2',
  // Vigor da pastagem C11 (preditor futuro; aqui só verificamos que existe).
  vigor: C11 + 'mapbiomas_brazil_collection11_pasture_vigor_v1'
};

// [L] LIMITE DO CERRADO — TROQUE pelo asset IBGE de biomas que você usa.
// O padrão abaixo (ecorregião "Cerrado" da RESOLVE 2017) é só provisório:
// os limites NÃO coincidem com o bioma IBGE usado pelo MapBiomas.
var CERRADO = ee.FeatureCollection('RESOLVE/ECOREGIONS/2017')
  .filter(ee.Filter.eq('ECO_NAME', 'Cerrado'))
  .geometry();
// Exemplo de troca (ajuste o caminho e o filtro):
// var CERRADO = ee.FeatureCollection('users/SEU_USUARIO/biomas_IBGE_2019')
//   .filter(ee.Filter.eq('Bioma', 'Cerrado')).geometry();

// Pasta do Google Drive para onde vão as tabelas exportadas.
var PASTA_DRIVE = 'RegeNat_F0_diagnosticos';

// Seleciona a banda "classification_<ano>" (padrão dos assets MapBiomas).
function banda(img, ano) {
  return img.select('classification_' + ano);
}

// Para assets com prefixo de banda desconhecido: pega a banda cujo nome contém o ano.
function bandaPorAno(img, ano) {
  var nomes = img.bandNames().filter(ee.Filter.stringContains('item', String(ano)));
  return img.select([ee.String(nomes.get(0))]);
}

// Máscara 1/0: o pixel tem 'valor' em TODOS os anos da lista.
function todosIguais(img, anos, valor) {
  var m = ee.Image(1);
  anos.forEach(function (a) { m = m.and(banda(img, a).eq(valor)); });
  return m;
}

// Lista de inteiros [a, b] (cliente).
function intervalo(a, b) {
  var out = [];
  for (var i = a; i <= b; i++) out.push(i);
  return out;
}
