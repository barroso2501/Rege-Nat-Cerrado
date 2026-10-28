# Verificação de qualidade do novo asset de idade de pastagem

**Projeto:** Contabilidade  
**Data desta consolidação:** 28 de outubro de 2026  
**Data do aceite técnico original:** 20 de outubro de 2026  
**Status:** auditoria direcionada aceita para os controles e o domínio definidos neste relatório.

## 1. Conclusão

Na série de 1985 a 2025 e na grade selecionada de 21.869 células, não foram detectados o código literal de idade `1`, o código `100` após não-pastagem observada ou a sequência de reutilização `100 → saída → 100`. Os controles de idade mascarada ou zero em pastagem, códigos de idade inesperados e cobertura não reconhecida também terminaram em zero.

Esses resultados são compatíveis com a correção dos problemas específicos anteriormente comunicados ao MapBiomas, dentro do suporte e das regras examinados. A auditoria não comprova a exatidão de toda idade numérica em cada pixel e não estabelece ausência dos problemas em todo o Brasil.

As 82 células inicialmente pendentes foram rechecadas com sucesso. A pendência era causada pela omissão de códigos na lista de cobertura do auditor. Na rechecagem aceita, os casos foram explicados pelos códigos de cobertura `75` e `91`, e nenhum indicador de erro de idade passou a ser positivo. As avaliações intermediárias que mantinham essa pendência são históricas e foram superadas pelo aceite de 20/10/2026.

## 2. Origem e objetivo da verificação

No asset anterior, foram identificados pixels com código `1` persistindo por vários anos, em vez de uma idade consecutiva, e casos de atribuição/reutilização de `100` após interrupções observadas da pastagem. O MapBiomas disponibilizou um novo asset após a comunicação desses problemas pelo projeto.

O objetivo desta auditoria foi verificar a presença ou ausência desses comportamentos no novo produto, sem reexecutar a contabilidade de estoques e fluxos. Os CSVs do presente pacote não formam uma comparação pareada antiga/nova de toda a grade: a execução de domínio aqui aceita examinou o produto novo em relação à cobertura anual de referência.

## 3. Fontes e suporte

| Componente | Identificação |
|---|---|
| Novo produto de idade | `projects/mapbiomas-public/assets/brazil/lulc/collection11/mapbiomas_brazil_collection11_pasture_origin_age_v2` |
| Cobertura anual de referência | `projects/mapbiomas-public/assets/brazil/lulc/collection11/mapbiomas_brazil_collection11_coverage_v3` |
| Produto anterior, registrado como contexto | `projects/mapbiomas-public/assets/brazil/lulc/collection11/mapbiomas_brazil_collection11_pasture_age_v1` |
| Grade auditada | `projects/ee-barroso2501/assets/grade_hex_CeAmz_selecao` |
| Células auditadas | 21.869 |
| Período | 1985–2025, 41 observações anuais |
| Projeção | EPSG:4326; malha nativa da cobertura |
| Execução inicial do domínio | `20261016150312` — oito lotes |
| Rechecagem aceita | `20261020151405` — 82 células |

Transformação afim utilizada:

```text
[0.00026949458523585647, 0, -74.02073025380652,
 0, -0.00026949458523585647, 5.405791885246045]
```

A grade auditada de 21.869 células é distinta da grade analítica canônica de 24.889 células do projeto. O aceite não deve ser ampliado automaticamente a esse outro domínio.

## 4. Regras de verificação

Cada pixel foi acompanhado cronologicamente. Pastagem corresponde à classe de cobertura `15`. Uma observação reconhecida de qualquer outra classe de cobertura encerra a continuidade da pastagem. Máscara, zero de cobertura e classe `27` (NODATA) não comprovam uma saída: são tratados separadamente como lacunas. Classes fora da lista reconhecida também recebem controle próprio.

Os principais testes foram:

1. **Código literal `1`:** presença no raster de idade em qualquer ano, independentemente da classe de cobertura.
2. **`100` após não-pastagem:** ocorrência de `100` em pastagem quando já existia uma observação anterior reconhecida de não-pastagem. O teste não se limita ao ano imediatamente anterior.
3. **Reutilização ordenada de `100`:** sequência em que o mesmo pixel teve `100` em pastagem, saiu para não-pastagem observada e depois retornou à pastagem com `100`.
4. **Continuidade inicial:** `100` em pastagem sem continuidade confirmada de pastagem desde 1985; lacunas sem saída comprovada são identificadas separadamente.
5. **Disponibilidade e coerência:** idade mascarada ou zero em pastagem, idade positiva em não-pastagem reconhecida e códigos fora de `100` e da faixa anual admitida para `200 + idade`.

O último controle verifica codificação e limites anuais, não demonstra que cada valor `2xx` seja a idade numericamente correta. A auditoria tampouco faz validação independente da classificação de cobertura usando imagens ou dados de campo.

A saída é um indicador binário por célula: `1` significa pelo menos uma ocorrência em algum pixel e ano; `0` significa nenhuma ocorrência detectada. As contagens não representam pixels, hectares, número de eventos ou distribuições de idade. Não se usou escala mais grosseira para tornar a busca de pixels isolados mais rápida.

## 5. Execuções e encerramento das 82 células

A execução inicial utilizou o script de domínio v1.2, com um único produto de idade por execução, oito lotes, `tileScale=16` e `maxPixelsPerRegion=1.000.000.000`. Os lotes contêm respectivamente 2.771, 2.741, 2.778, 2.730, 2.700, 2.752, 2.740 e 2.657 linhas, totalizando 21.869 identidades únicas. Os indicadores de idade eram zero, mas 82 células apresentaram cobertura não reconhecida pela lista inicial do auditor.

A lista foi ampliada de 32 para 39 códigos observados, mantendo NODATA fora dos estados que comprovam não-pastagem. A rechecagem se restringiu às 82 células sinalizadas. Os retornos anteriores com reduções nulas foram rejeitados e preservados. A versão final acrescentou verificações de geometria real, suporte constante, campos de saída, transporte de propriedades e comparação de métodos de redução em uma célula de pré-verificação.

O retorno aceito contém todas as 82 identidades, sem reduções faltantes. Na célula IC-201 (`cell_id=5045`), os métodos direto e por coleção produziram resultados completos e iguais; essa comparação de dois métodos se refere a uma célula. A exportação de produção usou redução direta por célula, e todas as 82 linhas passaram separadamente pelos controles de integridade e auditoria.

As ocorrências que explicaram a pendência foram:

| Código de cobertura | Células |
|---|---:|
| `75` | 60 |
| `91` | 24 |
| Ambos | 2 |
| Somente `75` | 58 |
| Somente `91` | 22 |

Nenhuma das 82 células ficou sem uma dessas explicações. Os demais códigos adicionados à lista (`1`, `10`, `22`, `26` e `84`) não ocorreram na rechecagem. Código de cobertura `1` e código de idade `1` são variáveis distintas.

No painel final, 82 linhas foram substituídas pelos resultados da rechecagem e 21.787 foram reutilizadas, com a origem da evidência identificada por linha. Qualquer ocorrência observada de um código adicionado à lista teria ativado o controle antigo de cobertura desconhecida; por isso, as células sem esse controle não precisaram de nova execução. Esse reaproveitamento pressupõe os mesmos conteúdos dos assets referenciados: os rasters remotos não foram independentemente fixados por hash.

## 6. Resultado final

| Indicador de ocorrência, qualquer pixel e ano | Células |
|---|---:|
| Código literal de idade `1` | **0** |
| `100` em pastagem após não-pastagem observada | **0** |
| Reutilização ordenada de `100` após saída | **0** |
| `100` sem continuidade inicial confirmada | **0** |
| `100` após lacunas apenas | **0** |
| `100` fora de pastagem reconhecida | **0** |
| Idade positiva fora de pastagem reconhecida | **0** |
| Pastagem com idade mascarada | **0** |
| Pastagem com idade zero | **0** |
| Código numérico de idade inesperado | **0** |
| Cobertura desconhecida remanescente | **0** |
| Pastagem presente em pelo menos um ano | 21.036 |
| Família de idade `100` presente | 16.004 |
| Família de idade `2xx` presente | 21.033 |
| Cobertura reconhecida presente | 21.869 |

As únicas 82 mudanças de indicadores entre o painel inicial e o final foram no controle de cobertura desconhecida, de `1` para `0`. Nenhum indicador de erro de idade mudou. O resultado final é **não detectado no domínio completo selecionado**, sem controles pendentes nesta auditoria.

## 7. Integridade e reprodução

O pacote conserva os oito CSVs nativos do domínio, o CSV nativo aceito da rechecagem, os registros históricos de validação e o painel combinado. Os validadores verificam identidades, completude, metadados, valores binários, nulos, configurações e hashes. Os arquivos de origem e os registros históricos não foram reescritos nesta consolidação.

O CSV da rechecagem aceita tem SHA-256:

```text
04eca93b8c1820030241a532afc42014968e55afebc7d1bf7569786d2c322f10
```

Na consolidação de 28/10/2026, a validação local foi reproduzida e os produtos regenerados coincidiram byte a byte com os aceitos. Foram repetidos os 14 casos sintéticos do script de domínio, os 14 casos retidos da rechecagem e três casos adicionais de cobertura. Isso verifica o software e os resultados arquivados; não constitui nova consulta ou execução raster em 28/10.

Os scripts distribuídos estão incluídos e seus hashes constam do manifesto. O hash do texto efetivamente executado pelo operador no Earth Engine continua sem atestação independente (`executed_script_sha256=null`). Não foi convertida a disponibilidade do código em comprovação dessa identidade de execução.

Para reproduzir localmente, da raiz extraída do ZIP:

```bash
python3 -B analysis/reproduzir_validacao_local.py
```

## 8. Limites e consequência para o projeto

O aceite cobre os códigos e a consistência temporal definidos neste relatório, nesse suporte espacial e nessa série. Não cobre todo o território brasileiro, a totalidade da grade canônica, a idade numérica exata de cada pixel ou a acurácia temática independente da cobertura. Não quantifica uma melhora nacional em relação ao produto antigo.

Não é necessário repetir a auditoria de domínio ou a rechecagem para documentar este resultado. O aceite não implica migração automática de fonte, alteração dos resultados canônicos ou reexecução da contabilidade. Essas decisões e outras verificações de idade numérica ou cronologia permanecem fora desta auditoria direcionada.

## 9. Registros que sustentam esta consolidação

- `docs/validation/pasture_v2_targeted_domain_audit_acceptance_v1.md`: aceite original de 20/10/2026.
- `outputs/validation/pasture_v2_coverage_recheck82_v3/pasture_v2_targeted_audit_acceptance_v1.json`: resumo estruturado do aceite.
- `outputs/validation/pasture_v2_coverage_recheck82_v3/pasture_v2_coverage_recheck82_20261020151405_v3_validation.json`: validação da rechecagem e do painel combinado.
- `outputs/validation/pasture_v2_v1_2/domain_new/pasture_v2_mem12_domain_new_20261016150312_validation.json`: validação histórica dos oito lotes, preservada com sua qualificação original.
- `provenance/consolidacao_20261028.json`: identificação dos pacotes recuperados e da reprodução local desta entrega.
