/* Auditoria direcionada v1.2: correção de carga, sem resultado nativo ainda.
 * Padrão desta cópia: domínio completo, produto novo, 41 anos completos.
 * Smoke aprovado: 20261016144206. Devolva todos os CSVs de domínio desta execução.
 */
var CFG = {
  mode: 'domain',      // Smoke aprovado em 16/10/2026; executar novo produto no domínio.
  product: 'new',      // 'new' ou 'old'; cada execução lê só uma idade.
  coverage: 'projects/mapbiomas-public/assets/brazil/lulc/collection11/mapbiomas_brazil_collection11_coverage_v3',
  oldAge: 'projects/mapbiomas-public/assets/brazil/lulc/collection11/mapbiomas_brazil_collection11_pasture_age_v1',
  newAge: 'projects/mapbiomas-public/assets/brazil/lulc/collection11/mapbiomas_brazil_collection11_pasture_origin_age_v2',
  grid: 'projects/ee-barroso2501/assets/grade_hex_CeAmz_selecao',
  start: 1985, end: 2025,
  nBatches: 8,
  seed: 20261015,
  tileScale: 16,
  maxPixelsPerRegion: 1000000000,
  folder: 'auditoria_pasture_origin_age_v2_v1_2',
  coveragePrefix: '', oldPrefix: '', newPrefix: ''
};

// Classes conhecidas da cobertura; 0, 27 e máscara NÃO provam não-pastagem.
// Classes não listadas são explicitamente exportadas como desconhecidas.
var KNOWN = [3,4,5,6,7,9,11,12,13,15,19,20,21,23,24,25,29,30,31,32,33,
             35,36,39,40,41,46,47,48,49,50,62];
var FLAGS = [
  'code1', 'invalid100_after_nonpas', 'reused100_after_exit',
  'code100_without_confirmed_initial', 'code100_after_gap_only',
  'age100_outside_pas', 'age_positive_outside_pas',
  'pasture_age_masked', 'pasture_age_zero', 'unexpected_age_code',
  'coverage_unknown_code', 'has_pasture', 'has_code100', 'has_2xx',
  'has_valid_coverage'
];

// Lógica compartilhada pelo processamento raster e pelo autoteste local.
// Entradas: imagens de uma banda ou objetos escalares com a mesma álgebra.
function temporalAudit(coverRows, ageRows, zero) {
  var out = {};
  FLAGS.forEach(function(k) { out[k] = zero; });
  var seenNonPas = zero;
  var seen100 = zero;
  var brokenAfter100 = zero;
  var seenGap = zero;
  var continuousInitial = null;
  coverRows.forEach(function(c, i) {
    var a = ageRows[i];
    var pas = c.valid.and(c.value.eq(15));
    var nonpas = c.valid.and(c.value.neq(15));
    var gap = c.valid.not();
    var is100 = a.valid.and(a.value.eq(100));
    var is1 = a.valid.and(a.value.eq(1));
    var positive = a.valid.and(a.value.gt(0));
    var maxCode = 200 + i; // 1986 -> 201, ..., 2025 -> 240.
    var code2xx = a.value.gte(201).and(a.value.lte(maxCode));
    if (i === 0) { continuousInitial = pas; }
    else { continuousInitial = continuousInitial.and(pas); }
    function flag(k, condition) { out[k] = out[k].or(condition); }
    flag('code1', is1);
    // Testa qualquer não-PAS observado anteriormente, não só o ano t-1.
    flag('invalid100_after_nonpas', is100.and(pas).and(seenNonPas));
    // Subconjunto exato: já houve 100, depois não-PAS e agora voltou a 100.
    flag('reused100_after_exit', is100.and(pas).and(brokenAfter100));
    flag('code100_without_confirmed_initial', is100.and(pas).and(continuousInitial.not()));
    flag('code100_after_gap_only', is100.and(pas).and(seenGap).and(seenNonPas.not()));
    flag('age100_outside_pas', is100.and(nonpas));
    flag('age_positive_outside_pas', positive.and(nonpas));
    flag('pasture_age_masked', pas.and(a.valid.not()));
    flag('pasture_age_zero', pas.and(a.valid).and(a.value.eq(0)));
    flag('unexpected_age_code', a.valid.and(a.value.neq(0))
      .and(is100.or(code2xx).not()));
    flag('coverage_unknown_code', c.unknown);
    flag('has_pasture', pas);
    flag('has_code100', is100);
    flag('has_2xx', a.valid.and(code2xx));
    flag('has_valid_coverage', c.valid);
    // Atualizações ocorrem DEPOIS de avaliar o estado do ano corrente.
    brokenAfter100 = brokenAfter100.or(nonpas.and(seen100));
    seen100 = seen100.or(is100.and(pas));
    seenNonPas = seenNonPas.or(nonpas);
    seenGap = seenGap.or(gap);
  });
  return out;
}

// Autoteste da MESMA função temporalAudit, sem acesso a rasters.
function scalar(x) {
  return {
    v: Number(x),
    eq: function(y) { return scalar(this.v === Number(y)); },
    neq: function(y) { return scalar(this.v !== Number(y)); },
    gt: function(y) { return scalar(this.v > Number(y)); },
    gte: function(y) { return scalar(this.v >= Number(y)); },
    lte: function(y) { return scalar(this.v <= Number(y)); },
    and: function(y) { return scalar(Boolean(this.v && y.v)); },
    or: function(y) { return scalar(Boolean(this.v || y.v)); },
    not: function() { return scalar(!this.v); }
  };
}
function syntheticAudit(c, a) {
  return temporalAudit(c.map(function(v) {
    var valid = KNOWN.indexOf(v) !== -1;
    return {value: scalar(v === null ? -9999 : v), valid: scalar(valid),
      unknown: scalar(v !== null && v !== 0 && v !== 27 && !valid)};
  }), a.map(function(v) {
    return {value: scalar(v === null ? -9999 : v), valid: scalar(v !== null)};
  }), scalar(0));
}
function runSelfTests() {
  var cases = [
    [[15,15,15],[100,100,100],{code1:0,invalid100_after_nonpas:0,reused100_after_exit:0,code100_without_confirmed_initial:0}],
    [[15,3,15],[100,null,100],{invalid100_after_nonpas:1,reused100_after_exit:1}],
    [[15,3,15,15],[100,null,201,202],{invalid100_after_nonpas:0,reused100_after_exit:0,unexpected_age_code:0}],
    [[3,15],[null,100],{invalid100_after_nonpas:1,reused100_after_exit:0}],
    [[15,15,15],[1,1,1],{code1:1}],
    [[15,null,15],[100,null,100],{invalid100_after_nonpas:0,reused100_after_exit:0,code100_after_gap_only:1}],
    [[15,27,15],[100,null,100],{invalid100_after_nonpas:0,code100_after_gap_only:1}],
    [[null,15],[null,100],{invalid100_after_nonpas:0,code100_after_gap_only:1}],
    [[15,3,27,15],[100,null,null,100],{invalid100_after_nonpas:1,reused100_after_exit:1,code100_after_gap_only:0}],
    [[15],[null],{pasture_age_masked:1,has_pasture:1}],
    [[15],[0],{pasture_age_zero:1}],
    [[3],[100],{age100_outside_pas:1}],
    [[3,15],[null,240],{unexpected_age_code:1}],
    [[15,99,15],[100,null,100],{coverage_unknown_code:1,invalid100_after_nonpas:0,code100_after_gap_only:1}]
  ];
  cases.forEach(function(t, i) {
    var got = syntheticAudit(t[0], t[1]);
    Object.keys(t[2]).forEach(function(k) {
      if (got[k].v !== t[2][k]) { throw new Error('Autoteste ' + i + ': ' + k); }
    });
  });
  return cases.length + ' casos sintéticos: PASS';
}

function selectAnnual(info, prefix) {
  var names = info.bands.map(function(b) { return b.id; });
  var selected = [];
  for (var y = CFG.start; y <= CFG.end; y++) {
    var matches = names.filter(function(n) {
      return prefix ? n === prefix + y : new RegExp('(^|_)' + y + '$').test(n);
    });
    if (matches.length !== 1) {
      throw new Error('Ano ' + y + ': bandas candidatas ' + JSON.stringify(matches) +
        '. Ajuste o prefixo em CFG. Bandas: ' + names.join(', '));
    }
    selected.push(matches[0]);
  }
  return selected;
}
function assertGrid(info, bands, ref) {
  bands.forEach(function(name) {
    var b = info.bands.filter(function(x) { return x.id === name; })[0];
    var t = b.crs_transform;
    var r = ref.crs_transform;
    if (!t || !r || b.crs !== ref.crs || t[1] !== 0 || t[3] !== 0 ||
        r[1] !== 0 || r[3] !== 0 || Math.abs(t[0]-r[0]) > 1e-12 ||
        Math.abs(t[4]-r[4]) > 1e-12) {
      throw new Error('Grade incompatível: ' + name + '. Não reamostrar automaticamente.');
    }
    var col = (t[2]-r[2])/r[0];
    var row = (t[5]-r[5])/r[4];
    if (Math.abs(col-Math.round(col)) > 1e-5 || Math.abs(row-Math.round(row)) > 1e-5) {
      throw new Error('Origem fora da malha nativa: ' + name);
    }
  });
}

// Os 100 pontos preparados no diagnóstico anterior serão inseridos abaixo.
var KNOWN_POINTS = [["MB1_001",-58.96123808353424,-16.131541630340514],["MB1_002",-50.91116532795397,-10.674545773899656],["MB1_003",-44.72383914552394,-4.043900998756643],["MB1_004",-57.67440143903303,-15.937775023555933],["MB1_005",-51.28441532850563,-11.554445594694728],["MB1_006",-45.05235304492645,-4.50015533156095],["MB1_007",-57.26288320737788,-15.357014192372665],["MB1_008",-52.85287381457832,-13.465431698602185],["MB1_009",-49.67256821420997,-7.913843242743543],["MB1_010",-56.64115919923876,-14.016817619994749],["MB1_011",-50.71551225907274,-19.41398567851325],["MB1_012",-48.56817940391343,-8.561438731065305],["MB1_013",-56.05500847635077,-13.7661876557254],["MB1_014",-48.96164149835779,-8.484363279687852],["MB1_015",-48.18388012536711,-5.554418149003619],["MB1_016",-57.4577277925034,-13.524181518183603],["MB1_017",-47.7305902330004,-5.299745765955735],["MB1_018",-45.61963914684793,-4.866398472896479],["MB1_019",-58.46806299255263,-15.060300654027984],["MB1_020",-57.113583207157205,-15.15165931842294],["MB1_021",-47.13446821045868,-5.490817426887957],["MB1_022",-53.45465522340999,-13.553286933389074],["MB1_023",-48.38141965634499,-7.408271400841076],["MB1_024",-60.13434801306592,-12.870657148986652],["MB1_025",-55.56614529873292,-12.645898664899946],["MB1_026",-58.02204945398728,-13.000014549899864],["MB1_027",-54.0117005310925,-13.67860191552375],["MB1_028",-49.0368304876386,-8.11488620332949],["MB1_029",-58.04226154787997,-16.134236576192873],["MB1_030",-56.098397104573735,-12.672578628838297],["MB1_031",-55.767727248489344,-12.461025379428149],["MB1_032",-56.39996154545266,-13.219383142281847],["MB1_033",-50.471619659434296,-10.189455520475114],["MB1_034",-50.01159240243668,-8.073653531788406],["MB1_035",-56.94110667260626,-14.165039641874468],["MB1_036",-56.15337399996186,-12.144908230946488],["MB1_037",-45.79103770305794,-5.148828798223655],["MB1_038",-59.51019855365968,-14.424832422041836],["MB1_039",-55.160016958782485,-13.156860398507131],["MB1_040",-43.99566477621666,-3.1613062321092142],["MB1_041",-51.56010828920192,-12.59631166121655],["MB1_042",-43.90592307933312,-2.828749913928168],["MB1_043",-59.92495072033766,-13.296458593659302],["MB1_044",-48.6708568408883,-9.13627068137339],["MB1_045",-50.015904315800455,-7.710374830890472],["MB1_046",-48.023261352566536,-6.683061471971386],["MB1_047",-59.95351714637266,-12.45455750938249],["MB1_048",-57.74042761241581,-15.84614686457574],["MB1_049",-58.21878050120946,-12.40685696779574],["MB1_050",-51.87056605139362,-10.916012922270983],["MB1_051",-56.78857273736277,-14.79781292800826],["MB1_052",-56.35576443347398,-12.608438917552164],["MB1_053",-51.91826659298037,-13.021574116718728],["MB1_054",-58.1266133530588,-14.871923938948122],["MB1_055",-51.39679457054899,-11.909369963450349],["MB1_056",-48.78970395297731,-8.828507865034041],["MB1_057",-59.35955108051284,-11.876491624051576],["MB1_058",-57.17044656464198,-13.651921951585395],["MB1_059",-43.94958120214133,-3.42568042022559],["MB1_060",-56.55303446986663,-13.606646861265771],["MB1_061",-51.40083698932752,-11.868676281079736],["MB1_062",-51.14023572540445,-12.27372664268923],["MB1_063",-59.83386155052794,-13.546010579587705],["MB1_064",-49.56396189635993,-7.523345588736787],["MB1_065",-48.59054745448802,-7.919502629033496],["MB1_066",-51.58301532894696,-10.80578963690952],["MB1_067",-50.01132290785145,-8.730681330593423],["MB1_068",-56.92736244875923,-13.671864550892852],["MB1_069",-50.047165687687816,-8.470888550426057],["MB1_070",-58.77097490635773,-16.044494879309333],["MB1_071",-58.42898627769343,-16.147172316284195],["MB1_072",-49.54590575914912,-8.636627720346109],["MB1_073",-46.68036983433626,-5.376551722747954],["MB1_074",-60.42890559472872,-12.54160426041367],["MB1_075",-54.476039701453885,-13.55355642797431],["MB1_076",-58.755613714999285,-15.040088560135295],["MB1_077",-57.7425835690977,-13.211567799310007],["MB1_078",-50.227188070625374,-9.405226277438771],["MB1_079",-58.41497255926116,-16.061203543593955],["MB1_080",-57.78705017566162,-12.465606787377158],["MB1_081",-50.00754998365815,-9.063237648774471],["MB1_082",-59.59131642381568,-14.045923035200222],["MB1_083",-58.26243862401766,-15.993560402699757],["MB1_084",-56.54468013772431,-14.403542349808202],["MB1_085",-49.594414784491576,-8.194656600559306],["MB1_086",-45.506720915634105,-4.454341252070853],["MB1_087",-56.97155956073792,-13.85727682553512],["MB1_088",-44.33792289946619,-3.350760925530021],["MB1_089",-58.97228736152891,-14.99939487776468],["MB1_090",-58.021510464816814,-15.81623296561456],["MB1_091",-58.08996208946672,-16.412354988156277],["MB1_092",-49.288268935663645,-8.330212376932941],["MB1_093",-58.2379146167612,-16.458708056816842],["MB1_094",-51.57627796431606,-11.26231346429906],["MB1_095",-59.77834566596936,-13.794754081760402],["MB1_096",-52.43893013165604,-13.31047231209157],["MB1_097",-58.32819530281522,-15.914328994640414],["MB1_098",-58.2416875409545,-16.58725697397435],["MB1_099",-57.576844399177645,-14.323771952578388],["MB1_100",-57.379574362785,-15.565603001345217]];

function main() {
  print('AUTOTESTE LOCAL (não nativo)', runSelfTests());
  if (['smoke','domain','points'].indexOf(CFG.mode)<0 ||
      ['new','old'].indexOf(CFG.product)<0 || CFG.start!==1985 || CFG.end!==2025) {
    throw new Error('Configuração inválida. Preserve a série completa.');
  }
  var coverage=ee.Image(CFG.coverage);
  var age=ee.Image(CFG.product==='new'?CFG.newAge:CFG.oldAge);
  // Metadados pequenos; não se trazem pixels ou geometrias para o cliente.
  var ci=coverage.getInfo(), ai=age.getInfo();
  var cb=selectAnnual(ci,CFG.coveragePrefix);
  var ab=selectAnnual(ai,CFG.product==='new'?CFG.newPrefix:CFG.oldPrefix);
  var ref=ci.bands.filter(function(b){return b.id===cb[0];})[0];
  assertGrid(ci,cb,ref); assertGrid(ai,ab,ref);
  var proj=coverage.select(cb[0]).projection();
  var zero=ee.Image.constant(0).rename('b').setDefaultProjection(proj).toByte();
  function unpack(image,name,isCoverage) {
    var raw=image.select(name).rename('b');
    var present=raw.mask().unmask(0,false).gt(0);
    var value=raw.toInt16().unmask(-9999,false);
    if (!isCoverage) return {value:value,valid:present};
    var known=value.remap(KNOWN,KNOWN.map(function(){return 1;}),0).eq(1);
    return {value:value,valid:present.and(known),
      unknown:present.and(value.neq(0)).and(value.neq(27)).and(known.not())};
  }
  var cs=cb.map(function(n){return unpack(coverage,n,true);});
  var ages=ab.map(function(n){return unpack(age,n,false);});
  var today=new Date().toISOString();
  var stamp=today.replace(/[^0-9]/g,'').slice(0,14);
  var common={script_version:'pasture-v2-targeted-audit-v1.2',mode:CFG.mode,
    product:CFG.product,run_id:stamp,generated_at_utc:today,
    coverage_asset:CFG.coverage,new_asset:CFG.newAge,old_asset:CFG.oldAge,
    compared_age_asset:CFG.product==='new'?CFG.newAge:CFG.oldAge,
    grid_asset:CFG.grid,year_start:1985,year_end:2025,
    crs:ref.crs,crs_transform:JSON.stringify(ref.crs_transform),
    tile_scale:CFG.tileScale,max_pixels_per_region:CFG.maxPixelsPerRegion,
    partition_seed:CFG.seed,partition_rule:'seeded_system_index_uniform_floor_v1',
    known_coverage_codes_json:JSON.stringify(KNOWN)};
  var name='pasture_v2_mem12_'+CFG.mode+'_'+CFG.product+'_'+stamp;

  if (CFG.mode==='points') {
    // Nenhum grafo de auditoria é anexado aos históricos. Os indicadores
    // podem ser calculados depois, localmente, sem reabrir os 41 rasters.
    var points=ee.FeatureCollection(KNOWN_POINTS.map(function(p){
      return ee.Feature(ee.Geometry.Point([p[1],p[2]]),{
        sample_id:p[0],longitude:p[1],latitude:p[2]});
    }));
    var histories=ee.Image.cat(cs.map(function(c,i){
      return c.value.rename('coverage_'+(1985+i)).addBands(
        ages[i].value.rename(CFG.product+'_age_'+(1985+i)));
    }));
    var samples=histories.sampleRegions({collection:points,
      properties:['sample_id','longitude','latitude'],projection:proj,
      tileScale:CFG.tileScale,geometries:false}).map(function(f){
        return f.set(common).set('expected_sample_points',100);
      });
    Export.table.toDrive({collection:samples,description:name,fileNamePrefix:name,
      folder:CFG.folder,fileFormat:'CSV'});
    print('UMA tarefa de históricos, sem redução do domínio:',name);
    return;
  }
  var grid=ee.FeatureCollection(CFG.grid);
  var nGrid=grid.size().getInfo();
  if (!nGrid) throw new Error('Grade vazia.');
  var selected=grid;
  if (CFG.mode==='smoke') {
    // Região indicada no erro anterior de limite de pixels. Testa uma
    // célula INTEIRA que intercepta o retângulo, sem recortar a geometria.
    var failedBounds=ee.Geometry.Rectangle([
      -50.31598067903074,-24.70858866830845,
      -50.13364524700144,-24.573868275953263],ref.crs,false);
    selected=grid.filterBounds(failedBounds).sort('system:index').limit(1);
    if (selected.size().getInfo()!==1)
      throw new Error('Nenhuma célula na região do teste; envie esta mensagem.');
  }
  var nSelected=CFG.mode==='smoke'?1:nGrid;
  var batches=CFG.mode==='smoke'?1:CFG.nBatches;
  // Não existe toList(nGrid): cada feição recebe ID estável e lote
  // determinístico no servidor, sem materializar toda a lista de geometrias.
  var indexed=selected.randomColumn('audit_random',CFG.seed,'uniform',['system:index'])
    .map(function(f){
      return f.set('audit_id',ee.String(f.get('system:index')))
        .set('audit_batch',ee.Number(f.get('audit_random')).multiply(batches).floor());
    });
  var rawCounts=indexed.aggregate_histogram('audit_batch').getInfo();
  var counts={};
  Object.keys(rawCounts).forEach(function(k){counts[String(Number(k))]=rawCounts[k];});
  common.expected_grid_features=nSelected;
  common.expected_full_grid_features=nGrid;
  common.expected_batches=batches;
  common.expected_batch_counts_json=JSON.stringify(counts);
  var flags=temporalAudit(cs,ages,zero);
  var audit=ee.Image.cat(FLAGS.map(function(k){
    return ee.Image(flags[k]).rename(CFG.product+'_'+k).toByte();
  }));
  var fields=['audit_id','audit_batch','cell_id','GRID_ID']
    .concat(Object.keys(common)).concat(FLAGS.map(function(k){return CFG.product+'_'+k;}));
  for (var b=0;b<batches;b++) {
    if (!(counts[String(b)]>0)) continue;
    var cells=indexed.filter(ee.Filter.eq('audit_batch',b));
    var reduced=audit.reduceRegions({collection:cells,reducer:ee.Reducer.max(),
      crs:ref.crs,crsTransform:ref.crs_transform,tileScale:CFG.tileScale,
      maxPixelsPerRegion:CFG.maxPixelsPerRegion});
    var output=reduced.map(function(f){
      return ee.Feature(null,f.toDictionary()).set(common);
    });
    Export.table.toDrive({collection:output,description:name+'_b'+b,
      fileNamePrefix:name+'_b'+b,folder:CFG.folder,fileFormat:'CSV',selectors:fields});
  }
  print('MODO',CFG.mode,'PRODUTO',CFG.product,'CÉLULAS',nSelected,
    'GRADE COMPLETA',nGrid,'LINHAS POR LOTE',counts);
  print(CFG.mode==='smoke'?'Inicie APENAS a única tarefa de teste e devolva o CSV.':
    'Todos os lotes não vazios são necessários para avaliar ausência no domínio.');
}

if (typeof module!=='undefined' && module.exports) {
  module.exports={temporalAudit:temporalAudit,syntheticAudit:syntheticAudit,
    runSelfTests:runSelfTests,FLAGS:FLAGS,CFG:CFG};
} else { main(); }
