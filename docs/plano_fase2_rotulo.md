# Plano da Fase 2 — novo rótulo de regeneração (depois da reprovação da P1)

**Situação:** rascunho para aprovação de Mario (2026-11-12). Nada aqui é executado antes da aprovação etapa por etapa.
**Decisão de origem:** D12 (`docs/decisoes.md`). **Desvio:** `docs/desvios.md`, 2026-11-12 (b).

## Por que existe este plano

- **[D]** A P1 reprovou: o evento 15→4 acerta 67,6% (IC 95%: 63,4–71,5%; `results/f1/criterio/`). Pelo protocolo, a P2 e a P3 não seguem com esse rótulo sem um desvio que justifique outra definição.
- **[E]** As análises espaciais exploratórias não acharam um recorte que explique o erro: bioma vizinho, relevo regional e matriz de vegetação deram p de 0,26 a 0,70. O erro está no próprio rótulo, não numa região.
- **[C]** Ampliar para antrópico→natural não resolve o problema e muda a pergunta. A acurácia esperada fica perto da do produto de Vegetação Secundária (70–78%; tabela preliminar do MapBiomas).

## Etapa 1 — Definição operacional de regeneração (antes de qualquer dado novo)

O problema conceitual que o estrato N expôs: 16,7% das pastagens que o mapa manteve como pastagem receberam a categoria 1. Projetada para a área total desse estrato, essa taxa é implausível como regeneração. **[H]** A categoria 1 capturou também o **adensamento de lenhosas em pastagem manejada** ("pasto sujo").

**Rascunho da definição — v3 (2026-11-12, com o relato de Mario sobre a inspeção da P1):**

> **Regeneração natural savânica**: área de savana que foi **convertida** (corte raso ou conversão parcial: correntão, raleamento, queima), onde foi **implantada pastagem**, e onde, **a partir de t** (ano de referência), há **trajetória de recuperação** da vegetação savânica, **com componente arbóreo presente**, persistindo até t+3 (matriz de decisão abaixo).
>
> **Não é regeneração:**
> - pasto sujo estável (categoria 2). Pasto sujo com lenhosas aumentando é 1c, uma possível etapa da regeneração, e fica separado;
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
| Q4 | A partir de t, há trajetória de recuperação com componente arbóreo? (matriz abaixo) | 1a / 1c / 1? / 2 / 4 | idem |

**Critério — trajetória (Mario, 2026-11-12, v3).** O que separa regeneração de pasto sujo é a **trajetória**, não o estado num ano:
- pasto sujo **estável** não é regeneração;
- pasto sujo com **aumento de densidade de lenhosas** pode ser uma **etapa** da regeneração;
- como o alvo é **savana**, o **componente arbóreo precisa estar presente** (remanescente ou rebrotando). Sinal só herbáceo, sem árvores, não é regeneração savânica.

**Matriz de decisão** (Q4, a partir de t, até t+3):

| Componente arbóreo | Trajetória das lenhosas | Pastoreio (estrato herbáceo) | Categoria |
|---|---|---|---|
| ausente | — | qualquer | **não é regeneração savânica** (2, ou 3 se outra mudança) |
| presente | aumenta | reduzido ou ausente (macega) | **1a** regeneração |
| presente | aumenta | ativo (pasto sujo em adensamento) | **1c** regeneração inicial sob pastoreio (possível etapa) |
| presente | estável | reduzido ou ausente (macega), **confirmado pela curva** | **1a** (Mario, 2026-11-12) |
| presente | estável | ativo | **2** pasto sujo estável |
| presente | diminui | qualquer | **2** ou **3** |
| — | sem alta resolução para ler arbóreo e herbáceo | — | **1?** ou **4** |

**Nota sobre a célula "arbóreo estável + pastoreio reduzido":**
- **o que vale:** é 1a quando a redução do pastoreio é confirmada pela curva (NDVI/Sentinel-2), além da imagem de alta resolução;
- **[H]** a assinatura esperada na curva (por exemplo, NDVI seco menos deprimido sem o consumo pelo gado, ou o oposto, pela palha seca) ainda não está descrita. Mario deve registrá-la em uma ou duas frases, para que seja aplicada sempre da mesma forma;
- **[L]** esta célula depende do NDVI por construção, então a evidência registrada é obrigatória.

**Evidência mínima:**
- presença e estrutura do arbóreo e estado do herbáceo: **≥1 imagem de alta resolução** na janela;
- trajetória: ≥2 datas de alta resolução, **ou** 1 de alta resolução + série Sentinel-2/NDVI;
- **[L]** No segundo caso, a tendência volta a depender do NDVI (ver a regra de independência na Etapa 4). Registrar qual foi usado.

**Alvo do detector, a fixar antes da Etapa 4 (proposta):** principal = **1a**; sensibilidade = **1a + 1c**. Assim o white paper pode reportar a regeneração estabelecida e, à parte, a fração "em processo", sem forçar uma escolha agora.

**Pontos sem alta resolução na janela — regra a fixar antes da Etapa 4 (proposta):**
- registrar `alta_resolucao_na_janela` = sim/não em todos os pontos;
- sem alta resolução: Q1–Q3 podem ser respondidas com Sentinel-2 e NDVI, mas Q4 recebe **"1?"** (há recuperação, mas 1a/1c não determinável) ou **4**;
- **acerto principal** calculado só nos pontos com alta resolução na janela. Isso também resolve a dependência do NDVI (Etapa 4);
- **sensibilidade:** todos os pontos, com "1 sem distinção" contado como erro;
- **[L]** A disponibilidade de alta resolução não é aleatória (varia com a região e com a proximidade de cidades e estradas). O relatório compara os pontos com e sem alta resolução por região e por ano.

**Ressalvas [H]:**
- O acúmulo de macega também ocorre com lotação baixa sem abandono. O sinal herbáceo mede **redução de pastoreio**, que é condição para a regeneração, mas não a garante.
- A macega aumenta o risco de fogo. Fogo depois do abandono é esperado e não deve, por si só, desclassificar 1a.

**Conversão parcial.** Quando a árvore é mantida (correntão, queima), a rebrota é rápida e a curva de NDVI pode nem mostrar a conversão. É o modo de regeneração típico do Cerrado, pela rebrota de órgãos subterrâneos. Fica dentro do escopo, e a intensidade (Q1b) é registrada para análise.

**Categorias revistas:** **1a** regeneração; **1c** regeneração inicial sob pastoreio (adensamento de lenhosas em pasto sujo); **1?** recuperação sem alta resolução para classificar; **2** sem mudança, incluindo pasto sujo estável; **3** outra mudança; **4** incerto. (A antiga 1b se divide em 1c, se as lenhosas aumentam, e 2, se estão estáveis.)

**Teste de viabilidade:**
- A macega é visível com segurança na alta resolução do período seco. No Sentinel-2 é visível só às vezes.
- **[H]** Proxies espectrais possíveis: refletância no SWIR alta no período seco (material seco), NDVI seco baixo com NDVI úmido alto, ou o vigor e a biomassa da pastagem do MapBiomas. A biomassa vem de GPP: mede produção verde, não a palha em pé. Precisa de teste.

## Etapa 2 — Recaracterizar os pontos da P1 com a nova definição

- **Quem e o quê:** Mario revê os pontos com categoria 1 (412) e os reclassifica pela matriz de decisão (1a, 1c, 1?, 2…), cego quanto ao estrato (só os códigos P).
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
