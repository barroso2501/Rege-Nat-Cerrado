# Produto MapBiomas "Desmatamento e Vegetação Secundária" — Coleção 11: uso neste projeto

**Fonte:** repositório `mapbiomas/brazil-deforestation-sec-vegetation` @ `ee9707a` (2026-10-16), pasta `collection11/`.

**Documentos lidos por inteiro:**
- `README.md`
- `collection11/README.md`
- `collection11/docs/products.md`
- `collection11/docs/temporal-rules.md` (revisão 2, 2026-08-11)

O repositório informa que o código é cópia do pipeline interno `mapbiomas-pipeline` @ `c50594f` (2026-10-15).

**Marcas:**
- **[D]** documentado no repositório acima;
- **[C]** nossa inferência a partir do código ou das regras;
- **[H]** hipótese;
- **[L]** lacuna.

> **Atualização para a KB MapBiomas.** A KB v0.5 (captura de 2026-10-14) registra que o código deste produto está só na Col. 9 (divergência D01). O código da Col. 11 foi publicado em 2026-10-15/16, um dia depois da captura. A D01 deve ser revista no próximo ciclo da KB.

---

## 1. O que o produto é

- **[D] Origem e método.** É derivado da LULC integrada da Col. 11 (`classification-ft`, versão `0-4-14-c84-5`) por **regras temporais aplicadas pixel a pixel**. Não há classificação espectral própria.
- **[D] Agregação.** As classes LULC viram três estados antes das regras:

| Estado agregado | Classes LULC incluídas |
|---|---|
| 1, antrópico | 15 (pastagem) e **21 (mosaico de usos)**, entre outras |
| 2, vegetação | **todas as nativas juntas**: 3, 4, 5, 6, 11, 12, 13, 49, 50… |
| 7, outros | inclui 29 (afloramento) e água |

- **[D] Saída: códigos 0–7.**

| Código | Significado |
|---|---|
| 0 | sem dado |
| 1 | antrópico |
| 2 | vegetação primária |
| 3 | vegetação secundária |
| 4 | supressão de vegetação primária |
| 5 | recuperação para secundária, marcada no **primeiro ano** de regeneração |
| 6 | supressão de vegetação secundária |
| 7 | outras transições |

> **Atenção à colisão de nomes.** O "4" deste produto (supressão primária) não tem relação com a classe 4 da LULC (formação savânica).

## 2. Assets públicos (verificados pelo MapBiomas no GEE em 2026-10-15) [D]

| Asset (`projects/mapbiomas-public/assets/brazil/lulc/collection11/`) | Bandas | Conteúdo |
|---|---|---|
| `mapbiomas_brazil_collection11_deforestation_secondary_vegetation_v5` | `classification_1987` … `_2025`, uint8 | Transições 0–7, com filtro espacial. Produto oficial |
| `mapbiomas_brazil_collection11_deforestation_secondary_vegetation_by_coverage_v1` | `classification_1987` … `_2025`, uint16 | `transição*100 + cobertura(ano−1)`, com a legenda pública da C11 (13 → 77) |

- **Não publicados** (só internos): idade da vegetação secundária, acumulados e frequência de desmatamento.
- **[C]** A idade, se precisarmos dela, pode ser recalculada a partir do `v5` com a fórmula documentada: `idade(t) = (idade(t−1) + sv(t)) * sv(t)`, onde sv = classe 3 ou 5.

## 3. Regras que importam para nós [D]

1. **Estabelecimento.** A sequência antrópico → vegetação → vegetação → vegetação vira `1 5 3 3`.
   - O ano de recuperação (5) exige **3 anos seguidos de vegetação**.
   - O ano anterior precisa ser antrópico, um só ano basta.
2. **Blocos curtos são apagados.**
   - 1 ano de vegetação entre usos volta a antrópico (filtro de "blip").
   - 2 anos de vegetação seguidos de uso também voltam a antrópico (no interior da série pela supressão + reversão; no fim, pela reversão ancorada).
3. **Correção por frequência.** Qualquer vegetação num pixel que já foi antrópico alguma vez vira **secundária (3)**.
   - [C] Consequência: a classe 3 não indica regeneração **recente**, só uso antrópico em algum momento desde 1985.
4. **Fim da série** (regras ancoradas em 2020–2025):
   - regeneração iniciada em 2024–2025 é detectada usando o histórico anterior (4–5 anos antrópicos);
   - em 2025, a supressão é marcada com um único ano antrópico, com menor confiança, como o próprio documento diz.
5. **Filtro espacial.** Manchas de até 11 pixels (~1 ha) de regeneração (3, 5) ou de desmatamento (4, 6) **no mesmo ano** viram 7.

**[C] Interação com os filtros da LULC.** O produto herda os filtros do mapa do Cerrado da Col. 11 (KB:06), aplicados antes das regras acima:
- falsa regeneração: 1–3 anos de nativa entre blocos de ≥4 anos de 21 viram 21;
- a partir de 2023, nativa não pode substituir 21.

Há, portanto, duas camadas de supressão de regeneração curta, uma na LULC e outra neste produto.

## 4. Podemos usar? Avaliação para este projeto

**Sim, como fonte do evento.** O uso precisa respeitar três condições [C]:

- **(a) O evento é o código 5, não o 3.** Usar só o 3 confunde regeneração recente com nativa antiga em área de uso antigo.
  - Recuperação a partir de pastagem = código **515** no `by_coverage_v1`, isto é, recuperação (5) com cobertura 15 no ano anterior.
  - Com 21 (D07), seria o **521**.
- **(b) A classe de destino não está no produto.** "Vegetação" junta todas as nativas.
  - Para restringir à **classe 4 (formação savânica)**, cruzar com `coverage_v3` (LULC Col. 11) no ano t e nos anos de seguimento.
- **(c) O produto confirma o evento com 3 anos de vegetação** (t, t+1, t+2).
  - A definição proposta no protocolo é mais estrita: pastagem em t−3..t−1 e classe 4 em t..t+3.
  - Ela precisa ser aplicada **por nós** sobre o `v5` + LULC. O produto sozinho não garante esses critérios.

**Vantagens de usar o produto** (em vez de só a LULC):
- regras documentadas, testadas (50 testes) e versionadas;
- comparabilidade com números oficiais do MapBiomas;
- o tratamento do fim da série já está resolvido e descrito.

**Riscos:**
- **[C] Mínimo de ~1 ha.** O filtro espacial elimina regenerações menores que ~1 ha por ano. Regeneração em pequenas manchas (bordas, árvores isoladas em pasto) fica fora por construção.
- **[C] O resultado é condicional ao mapa.** A confusão pastagem ↔ formação savânica da LULC (omissão de pastagem de ~12–25%, KB:06) passa direto para o produto.
  - Um "515" pode ser pastagem que o classificador passou a chamar de savana sem mudança no terreno.
  - Isso **reforça a necessidade da validação visual** (protocolo §5) e não a substitui.
- **[L]** Não há avaliação de acurácia publicada para este produto. Não se localizou ATBD/apêndice de Desmatamento e Vegetação Secundária da Col. 11 (KB:06, "O que não foi lido").

## 5. Verificações a fazer no GEE antes de congelar o protocolo

1. Confirmar que os dois assets existem, com as bandas e tipos acima. Registrar no manifesto.
2. Confirmar a codificação 515 no `by_coverage_v1` numa amostra pequena.
3. Comparar, para 2017–2021, o número de pixels "515 + classe 4 em t" com a mesma contagem refeita só com a LULC. A diferença mostra quanto as regras do produto alteram o evento, sem olhar nenhum preditor.
