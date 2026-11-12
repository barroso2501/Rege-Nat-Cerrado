# Plano da Fase 2 — novo rótulo de regeneração (depois da reprovação da P1)

**Situação:** rascunho para aprovação de Mario (2026-11-12). Nada aqui é executado antes da aprovação etapa por etapa.
**Decisão de origem:** D12 (`docs/decisoes.md`). **Desvio:** `docs/desvios.md`, 2026-11-12 (b).

## Por que existe este plano

- **[D]** A P1 reprovou: o evento 15→4 acerta 67,6% (IC 95%: 63,4–71,5%; `results/f1/criterio/`). Pelo protocolo, a P2 e a P3 não seguem com esse rótulo sem um desvio que justifique outra definição.
- **[E]** As análises espaciais exploratórias não acharam um recorte que explique o erro: bioma vizinho, relevo regional e matriz de vegetação deram p de 0,26 a 0,70. O erro está no próprio rótulo, não numa região.
- **[C]** Ampliar para antrópico→natural não resolve o problema e muda a pergunta. A acurácia esperada fica perto da do produto de Vegetação Secundária (70–78%; tabela preliminar do MapBiomas).

## Etapa 1 — Definição operacional de regeneração (antes de qualquer dado novo)

O problema conceitual que o estrato N expôs: 16,7% das pastagens que o mapa manteve como pastagem receberam a categoria 1. Projetada para a área total desse estrato, essa taxa é implausível como regeneração. **[H]** A categoria 1 capturou também o **adensamento de lenhosas em pastagem manejada** ("pasto sujo").

**Rascunho da definição — v2 (2026-11-12, com o relato de Mario sobre a inspeção da P1):**

> **Regeneração natural savânica**: área de savana que foi **convertida** (corte raso ou conversão parcial: correntão, raleamento, queima), onde foi **implantada pastagem**, e onde, **a partir de t** (ano de referência), há **abandono ou forte redução do pastoreio** com recuperação da vegetação nativa, persistindo até t+3.
>
> **Não é regeneração:**
> - adensamento de lenhosas com pastoreio ativo (1b);
> - área que não foi convertida nem recebeu pastagem (campo ou savana nativa degradada, rebrota depois de fogo);
> - silvicultura, pomar, ILPF;
> - regeneração florestal (fora do escopo savânico).

**Sequência de decisão por ponto** (a que Mario passou a usar na P1). Cada pergunta registra a resposta **e a evidência** que a sustenta:

| # | Pergunta | Resposta | Evidência que decidiu |
|---|---|---|---|
| Q1 | A área foi convertida em algum momento? | sim / não / talvez + ano aprox. | alta resolução / Sentinel-2 / NDVI |
| Q1b | Intensidade da conversão | corte raso / parcial (correntão, raleamento, queima com árvores mantidas) / incerta | idem |
| Q2 | Antes da conversão, era savana? | sim / não (campo, floresta) / talvez | idem |
| Q3 | Foi implantada pastagem? | sim / não / talvez | idem |
| Q4 | A partir de t, o pastoreio cessou ou caiu muito e há recuperação? | 1a / 1b / não / incerto | idem |

**Critério 1a × 1b — composto (Mario, 2026-11-12).** A regeneração (1a) pode aparecer de três formas:
- **herbácea:** acúmulo forte de **macega seca** (biomassa herbácea não pastejada), sinal de redução ou fim do pastoreio;
- **predominantemente arbórea:** aumento claro de lenhosas;
- **as duas** juntas.

**Condição: pelo menos uma imagem de alta resolução na janela.** Sem ela, nem o sinal herbáceo nem o arbóreo podem ser lidos com segurança, e 1a não pode ser atribuída.

**Pendente (Mario):** quando o sinal é **só arbóreo** e o herbáceo mostra pastoreio ativo (baixo, verde-rasteiro, trilhas de gado), é 1a ou 1b (pasto sujo)? A definição v2 dizia 1b. Esse é justamente o caso que o estrato N sugere ter inflado a categoria 1.

**Pontos sem alta resolução na janela — regra a fixar antes da Etapa 4 (proposta):**
- registrar `alta_resolucao_na_janela` = sim/não em todos os pontos;
- sem alta resolução: Q1–Q3 podem ser respondidas com Sentinel-2 e NDVI, mas Q4 recebe **"1 sem distinção"** (há recuperação, mas 1a/1b não determinável) ou **4**;
- **acerto principal** calculado só nos pontos com alta resolução na janela. Isso também resolve a dependência do NDVI (Etapa 4);
- **sensibilidade:** todos os pontos, com "1 sem distinção" contado como erro;
- **[L]** A disponibilidade de alta resolução não é aleatória (varia com a região e com a proximidade de cidades e estradas). O relatório compara os pontos com e sem alta resolução por região e por ano.

**Ressalvas [H]:**
- O acúmulo de macega também ocorre com lotação baixa sem abandono. O sinal herbáceo mede **redução de pastoreio**, que é condição para a regeneração, mas não a garante.
- A macega aumenta o risco de fogo. Fogo depois do abandono é esperado e não deve, por si só, desclassificar 1a.

**Conversão parcial.** Quando a árvore é mantida (correntão, queima), a rebrota é rápida e a curva de NDVI pode nem mostrar a conversão. É o modo de regeneração típico do Cerrado, pela rebrota de órgãos subterrâneos. Fica dentro do escopo, e a intensidade (Q1b) é registrada para análise.

**Categorias revistas:** **1a** regeneração; **1b** adensamento em pasto manejado; **1?** recuperação sem alta resolução para distinguir 1a/1b; **2** sem mudança; **3** outra mudança; **4** incerto.

**Teste de viabilidade:**
- A macega é visível com segurança na alta resolução do período seco. No Sentinel-2 é visível só às vezes.
- **[H]** Proxies espectrais possíveis: refletância no SWIR alta no período seco (material seco), NDVI seco baixo com NDVI úmido alto, ou o vigor e a biomassa da pastagem do MapBiomas. A biomassa vem de GPP: mede produção verde, não a palha em pé. Precisa de teste.

## Etapa 2 — Recaracterizar os pontos da P1 com a nova definição

- **Quem e o quê:** Mario revê os pontos com categoria 1 (412) e separa 1a e 1b, cego quanto ao estrato (só os códigos P).
- **Quando:** só **depois da reinterpretação** de consistência (a partir de 21/11). Rever os mesmos pontos antes contaminaria o intervalo de 14 dias.
- **Uso:** dado de **projeto** do detector, nunca de validação final.
- **Registrar também** `alta_resolucao_na_janela` (sim/não). Assim se sabe quantas das 412 atribuições da P1 tiveram alta resolução e quantas dependeram do NDVI.

## Etapa 3 — Projetar o detector

Os candidatos são comparados nos pontos da P1. O detector é escolhido **uma vez**, antes da Etapa 4.

| Candidato | Ideia | Risco |
|---|---|---|
| A. Evento do mapa + filtros | 515/15→4 mais pastagem plantada antiga (idade da pastagem), queda de vigor e biomassa antes de t, persistência | Herda a omissão do mapa; só filtra a comissão |
| B. Trajetória de imagem | Tendência de NDVI ou lenhosas (Landsat, período seco) dentro de pastagens, independente do rótulo 15→4 | Mais trabalho; pasto sujo também aumenta NDVI |
| C. Combinação de A e B | — | Mais graus de liberdade: maior risco de sobreajuste aos 750 pontos |

## Etapa 4 — Validar o detector numa amostra nova e cega

**Onde (decisão de Mario):**
- **Recomendado:** amostra **nova fora do holdout**, a ≥5 km dos pontos da P1. Preserva o holdout para a avaliação final da P3 (PROTOCOLO §9.3).
- **Alternativa:** usar o holdout. É independente no espaço, mas consome a única reserva que temos para a P3.

**Critério, fixado antes do sorteio:** o mesmo da P1 (acerto da categoria 1a ≥75% e limite inferior do IC ≥70%), com a mesma regra de "incerto" e o mesmo desenho de estratos (detecção, não detecção, borda).

**Independência da referência (lição da P1).** Na P1 a curva de NDVI decidia os casos de dúvida. Se o detector usar a trajetória de NDVI (candidato B), validá-lo contra interpretações decididas pelo NDVI mede o NDVI contra ele mesmo e infla a concordância. Por isso, na Etapa 4:
- registrar por ponto a **evidência que decidiu** cada pergunta (Q1–Q4) e se havia alta resolução na janela;
- não mostrar ao intérprete a curva de NDVI quando o detector usar NDVI, **ou** reportar o acerto principal só nos pontos com alta resolução disponível na janela e informar quantos são;
- a escolha entre essas duas opções é fixada antes do sorteio.

**Ancoragem no ano t.** A pergunta passa a ser explícita: a recuperação começa **a partir de t** (Q4). Na P1, isso só foi aplicado depois de certo ponto (ver `docs/desvios.md`, 2026-11-12 (c)).

**Uma tentativa só.** Se reprovar, o resultado é reportado como está. Redesenhar e revalidar exigiria outra amostra nova.

## Etapa 5 — Antes e depois

Só com o rótulo aprovado: P2 (estado anterior e paisagem) e P3 (predição), como no protocolo.

## O que o white paper pode afirmar já, sem esperar o detector

- O evento 15→4 do MapBiomas Col. 11 é regeneração real em ~2/3 dos casos. O erro está espalhado pelo bioma, sem viés espacial simples. **[D]**, preliminar quanto à consistência.
- Uma validação preliminar independente do próprio MapBiomas converge para o mesmo valor (savana no Cerrado: 70,3%). **[D]**, citar com permissão e com o método.
- O que caracteriza a regeneração confirmada: os pontos 1a da Etapa 2, de forma descritiva.

## Prazos estimados

| Etapa | Duração |
|---|---|
| 1 — definição | 1–2 dias |
| 2 — recaracterização | 412 pontos, ~6–8 dias a 50–70 pontos/dia; depois de 21/11 |
| 3 — detector | ~1 semana |
| 4 — validação | interpretação de ~500–750 pontos, 2–3 semanas |

Total de 5 a 7 semanas a partir da aprovação da definição.
