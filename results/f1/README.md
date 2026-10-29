# results/f1 — Fase F1: amostra e validação visual (P1)

## Arquivos

| Arquivo | Conteúdo | Quem pode abrir |
|---|---|---|
| `amostra_p1_interpretacao.csv` | 750 pontos com código neutro, lon/lat e ano de referência t. As colunas de interpretação ficam em branco | Mario (intérprete) |
| `amostra_p1_registro.json` | Semente, tabela de atrito e hashes SHA-256 das entradas e saídas, **inclusive da CHAVE** | Qualquer pessoa |
| `amostra_p1_CHAVE.csv` | Código → estrato (E/N/P), região e marcação de reinterpretação | **Ninguém até o fim da interpretação** |

## Cegamento

A CHAVE **não entra no GitHub** antes do fim da interpretação. O hash dela, gravado no `amostra_p1_registro.json`, prova depois que o arquivo não foi alterado.

Durante a interpretação, **não consulte camadas do MapBiomas** (cobertura, vegetação secundária, pastagem) nos pontos: elas revelam o estrato. Use só imagens:
- série Landsat;
- Sentinel-2;
- alta resolução (Google Earth Pro);
- Planet NICFI.

Os 75 pontos da reinterpretação (10%) recebem uma nova lista, com códigos novos, ≥14 dias depois.

## Ordem dos passos

1. `src/gee/10_f1_candidatos_amostra_p1.js` gera os candidatos, que ficam em `data/f1_candidatos/` (fora do git).
2. `src/python/f1_11_selecionar_amostra_p1.py` gera os três arquivos acima.
3. Ferramenta de interpretação (próximo pacote).
