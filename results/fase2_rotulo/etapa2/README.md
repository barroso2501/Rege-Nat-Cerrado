# Etapa 2 — Reclassificação dos pontos da P1 pela matriz v3 (D13)

**Começar só depois da reinterpretação** (R01–R75, a partir de 2026-11-21).

**Ferramenta:** `src/gee/19_ferramenta_etapa2.js`. Mostra:
- as miniaturas por ano;
- o NDVI anual do período seco;
- um **segundo gráfico** com cada observação Landsat de t−4 a t+4: NDVI e NDTI. O NDTI responde a material seco [H].

**Planilha:** `etapa2_reclassificacao.csv`. São os 412 pontos com categoria 1 na P1, em ordem embaralhada, sem estrato.

| Coluna | Valores |
|---|---|
| alta_resolucao_na_janela | sim / não |
| n_datas_alta_resolucao | 0, 1, 2… |
| Q1_convertida | sim / não / talvez |
| Q1_ano_aprox | ano ou vazio |
| Q1b_intensidade | corte_raso / parcial / incerta |
| Q2_era_savana | sim / não / talvez |
| Q3_pastagem_implantada | sim / não / talvez |
| Q4_arboreo_presente | sim / não / indeterminado |
| Q4_trajetoria_lenhosas | aumenta / estavel / diminui / indeterminada |
| Q4_pastoreio | reduzido / ativo / indeterminado |
| categoria_v3 | 1a / 1c / 1? / 2 / 3 / 4 |
| evidencia_decisiva | alta_res / sentinel2 / curva |
| assinatura_curva | texto livre |
| comentario | texto livre |
| data_interpretacao | AAAA-MM-DD |

**Pastoreio reduzido** (Mario, 2026-11-16): na imagem, **macega seca no início ou no meio da estação seca**, indicando que não houve pastejo intenso na época úmida. Na `assinatura_curva`, descreva o que a curva mostra nesses casos. Nos primeiros ~30 pontos com esse padrão, escreva com detalhe: é daí que sai a regra escrita da curva (pendência da D13).

**Coerência:** depois do preenchimento, um script confere se a `categoria_v3` bate com a matriz derivada de Q4 (presença de árvores, trajetória, pastoreio). As divergências são listadas para você decidir; nenhuma é corrigida automaticamente.
