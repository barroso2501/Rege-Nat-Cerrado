# Verificação de qualidade do asset de idade de pastagem — v2

**Documentação consolidada em 28/10/2026. Resultado aceito em 20/10/2026.**

Os problemas específicos de código de idade `1` e atribuição/reutilização de `100` após interrupções de pastagem **não foram detectados no novo asset**, no domínio selecionado de **21.869 células**, durante **1985–2025**. A pendência inicial de 82 células foi encerrada pela rechecagem aceita; não é necessário executar novamente os oito lotes nem a rechecagem para reproduzir esta documentação.

Leia primeiro [RELATORIO_VERIFICACAO_QUALIDADE_PT.md](RELATORIO_VERIFICACAO_QUALIDADE_PT.md). O relatório explica o método, os resultados, o encerramento da pendência e os limites da conclusão. Registros antigos de falhas estão preservados como histórico e não substituem o resultado final.

## Arquivos principais

| Conteúdo | Caminho |
|---|---|
| Relatório em português | `RELATORIO_VERIFICACAO_QUALIDADE_PT.md` |
| Script GEE do domínio completo | `gee/auditar_pasture_origin_age_v2_dominio_novo_v1_2.js` |
| Script GEE final da rechecagem das 82 células | `gee/recheck_pasture_v2_82cells_v3.js` |
| Validador dos oito lotes originais | `analysis/validar_auditoria_pasture_v2_v1_2.py` |
| Validador da rechecagem aceita | `analysis/validate_pasture_v2_recheck82_v3.py` |
| Reprodução local em um comando | `analysis/reproduzir_validacao_local.py` |
| Oito resultados originais do domínio | `outputs/native/pasture_v2_v1_2/domain_new/` |
| Resultado original da rechecagem aceita | `outputs/native/pasture_v2_coverage_recheck82_v3/` |
| Painel combinado, alterações e validação final | `outputs/validation/pasture_v2_coverage_recheck82_v3/` |
| Registro de aceite | `docs/validation/pasture_v2_targeted_domain_audit_acceptance_v1.md` |
| Conferência desta consolidação | `provenance/consolidacao_20261028.json` |
| Integridade de todos os arquivos | `MANIFEST_SHA256.json` |

O script GEE do domínio conserva seus comentários originais de preparação, inclusive menções a execução então pendente. Para o estado final, consulte este README e o registro de aceite. Não foi modificado o conteúdo dos scripts recuperados.

## Reproduzir a validação dos arquivos

Extraia o ZIP mantendo todas as pastas. Na raiz extraída, execute com Python 3.10 ou posterior:

```bash
python3 -B analysis/reproduzir_validacao_local.py
```

No Windows, `python` pode substituir `python3`. Esse comando usa apenas a biblioteca padrão, não exige acesso ao Earth Engine e não altera os resultados de origem. Confere a integridade, executa os validadores em uma pasta temporária e compara os produtos regenerados aos registros aceitos.

O validador original do domínio preserva a pendência histórica de 82 células. A validação final da rechecagem é que fecha essa pendência e produz o painel combinado. Por isso, interpretar o JSON do domínio isoladamente não representa o estado final da verificação.

## Escopo

Esta entrega documenta uma auditoria direcionada de códigos e consistência temporal. Não constitui validação de todas as idades numéricas, validação temática independente, comparação nacional pareada entre versões ou migração da contabilidade do projeto para outro asset.
