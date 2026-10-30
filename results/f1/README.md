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

## Ordem dos passos (revista em 2026-10-29)

1. `src/gee/10a_f1_fracoes_estratos_1km.js` (Mario): calcula a fração de pixels E e P em células de ~1 km e exporta como asset. Leva horas.
2. `src/gee/10b_f1_celulas_candidatas.js` (Mario): gera a tabela das células com E ou P. Leva minutos. CSV enviado **sem abrir**.
3. `src/python/f1_10c_sortear_celulas.py` (Claude): sorteia as células com probabilidade proporcional à fração e gera `src/gee/10d_f1_pixel_por_celula.js`.
4. `src/gee/10d_f1_pixel_por_celula.js` (Mario):
   - escolhe um pixel por célula com `ee.Image.random`, que é determinístico;
   - seleciona o estrato N por pontos aleatórios.

   Gera 5 CSVs, enviados **sem abrir**.
5. `src/python/f1_11_selecionar_amostra_p1.py` (Claude): faz o sorteio final, com distância mínima de 500 m, códigos neutros e a reinterpretação de 10%.
6. Ferramenta de interpretação (próximo pacote).

Os candidatos ficam em `data/f1_candidatos/`, fora do git até o fim da interpretação.

**Por que a revisão.** O `stratifiedSample` a 30 m no Cerrado inteiro (script 10, removido) ficou 5 h em "Running" sem consumir processamento.

**Por que o resultado é equivalente.** A nova estratégia continua equivalente a um sorteio aleatório simples de pixels dentro de cada estrato: P(pixel) = P(célula) × 1/n(célula), com P(célula) ∝ n(célula).

## Situação em 2026-10-29

- **Amostra gerada:** 750 pontos (100 E, 30 N e 20 P por ano) e 75 para reinterpretação. Atrito em `amostra_p1_registro.json`:
  - 2 células sem pixel elegível no passo D (2017: uma célula E e uma célula P);
  - 2 descartes pela distância de 500 m.
- **CHAVE:** `amostra_p1_CHAVE.csv`, SHA-256 `eecc54b8…98d9`.
  - Entregue a Mario num zip separado, `NAO_ABRIR_ate_fim_interpretacao.zip`, junto com o `10d_f1_pixel_por_celula.js`.
  - Os dois só entram no repositório depois da interpretação.
  - **[L] Limitação:** o cegamento depende da disciplina do intérprete, que também guarda a CHAVE. O hash prova que a chave não mudou, mas não que não foi aberta.
- **Ferramenta:** `src/gee/12_ferramenta_interpretacao_p1.js`. Gerada por `src/python/f1_12_gerar_ferramenta.py` a partir do arquivo de interpretação, sem estrato.
