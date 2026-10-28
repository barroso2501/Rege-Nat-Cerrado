# Verificação do asset `pasture_origin_age_v2`: o que ela cobre para este projeto

**Data:** 2026-10-28 · **Decisão relacionada:** D10

**Asset:** `projects/mapbiomas-public/assets/brazil/lulc/collection11/mapbiomas_brazil_collection11_pasture_origin_age_v2`

## Origem desta pasta

Esta pasta traz um subconjunto do pacote de verificação de Mario Barroso, produzido no projeto Contabilidade (pasture-crop-dynamic).

| Item | Valor |
|---|---|
| Pacote completo | `verificacao_qualidade_pasture_origin_age_v2_20261028.zip` |
| SHA-256 do zip | `55b9efdadd9ad76a81b6400ca1880811090b42f7843541f8c6cea8156ca891dc` |
| Aceite técnico | 2026-10-20 |
| Consolidação | 2026-10-28 |

**Incluídos aqui:**
- o relatório, `RELATORIO_VERIFICACAO_QUALIDADE_PT.md`;
- o manifesto de hashes;
- os dois scripts GEE finais;
- os registros de aceite e de validação.

**Ficam só no pacote completo:** os CSVs nativos (~25 MB), os validadores Python, os testes e o histórico de execuções rejeitadas.

**Reprodução (2026-10-28, sessão Claude):** `python3 -B analysis/reproduzir_validacao_local.py`, executado no pacote completo.
- Resultado: `PASS`, integridade de 61 arquivos, 21.869 células, nenhum controle pendente.
- É uma reprodução dos resultados arquivados, não uma nova consulta ao Earth Engine.

## O que fica fechado [D: documentado e reprodutível]

No domínio auditado (21.869 células hexagonais Cerrado + Amazônia, 1985–2025), os defeitos do asset anterior **não foram detectados**:
- código literal 1;
- código 100 após não-pastagem observada;
- reuso de 100 após saída.

Também deram zero:
- idade mascarada ou zero em pastagem;
- idade positiva fora de pastagem;
- código inesperado.

**Para este projeto, a afirmação "o novo asset não tem os erros conhecidos" deixa de ser [E] e passa a ser documentada e reprodutível, com o escopo acima.**

## O que não fica fechado (o próprio relatório declara estes limites)

1. **[L] Significado e exatidão do valor 2xx.**
   - A auditoria verifica só a faixa admitida: 201 ≤ código ≤ 200 + (ano − 1985).
   - Ela não verifica se o número é a idade correta, nem se o 2xx codifica **idade** (cresce ano a ano) ou **ano de origem** (fica constante).
   - Como a idade entra como preditor, isso precisa estar resolvido antes do uso.
2. **[L] Cobertura espacial do Cerrado.**
   - O domínio é a grade `grade_hex_CeAmz_selecao`, distinta da grade canônica de 24.889 células.
   - O critério de seleção não está descrito no pacote. Não sabemos se toda área de pastagem do Cerrado está dentro das 21.869 células.
3. **[L] Identidade remota do asset.**
   - O raster não foi fixado por hash, e o hash do script efetivamente executado no GEE é `null`.
   - Se o MapBiomas republicar o asset com o mesmo nome, a verificação não detecta.

## Como fechar o que falta, sem nova auditoria pesada

1. **Semântica do 2xx.** Ler os metadados e a descrição do asset no GEE (`ee.data.getAsset`). Num punhado de pixels de pastagem contínua, verificar se o código muda de um ano para outro.
2. **Exatidão da idade nos pixels que usaremos.**
   - A análise extrai de qualquer forma a série `coverage_v3` de cada ponto (eventos e controles).
   - O script de extração compara a idade do asset em t−1 com a contagem de anos consecutivos de classe 15 calculada da própria série.
   - A taxa de concordância vai para a tabela de atrito.
   - Isso valida o asset **exatamente onde ele é usado**.
3. **Cobertura espacial.** Mario informa o critério da grade de seleção. Se o Cerrado não estiver todo coberto, os pontos fora do domínio auditado são marcados e entram numa sensibilidade.
4. **Identidade do asset.** No momento da extração, registrar no manifesto os metadados do asset retornados pelo GEE (`updateTime`, `sizeBytes`, propriedades).
