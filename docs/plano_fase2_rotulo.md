# Plano da Fase 2 — novo rótulo de regeneração (depois da reprovação da P1)

**Situação:** rascunho para aprovação de Mario (2026-11-12). Nada aqui é executado antes da aprovação etapa por etapa.
**Decisão de origem:** D12 (`docs/decisoes.md`). **Desvio:** `docs/desvios.md`, 2026-11-12 (b).

## Por que existe este plano

- **[D]** A P1 reprovou: o evento 15→4 acerta 67,6% (IC 95%: 63,4–71,5%; `results/f1/criterio/`). Pelo protocolo, a P2 e a P3 não seguem com esse rótulo sem um desvio que justifique outra definição.
- **[E]** As análises espaciais exploratórias não acharam um recorte que explique o erro: bioma vizinho, relevo regional e matriz de vegetação deram p de 0,26 a 0,70. O erro está no próprio rótulo, não numa região.
- **[C]** Ampliar para antrópico→natural não resolve o problema e muda a pergunta. A acurácia esperada fica perto da do produto de Vegetação Secundária (70–78%; tabela preliminar do MapBiomas).

## Etapa 1 — Definição operacional de regeneração (antes de qualquer dado novo)

O problema conceitual que o estrato N expôs: 16,7% das pastagens que o mapa manteve como pastagem receberam a categoria 1. Projetada para a área total desse estrato, essa taxa é implausível como regeneração. **[H]** A categoria 1 capturou também o **adensamento de lenhosas em pastagem manejada** ("pasto sujo").

**Rascunho da definição, para Mario editar:**

> **Regeneração natural savânica**: área que era **pastagem plantada** antes de t (formação de pastagem visível: limpeza, textura homogênea, limites retos, cercas) e onde, entre t−3 e t+3:
> (a) **cessa o manejo** — sem reforma, gradagem, roçada ou limpeza recorrente visível;
> (b) a **cobertura lenhosa e arbustiva aumenta de forma contínua** e caminha para a estrutura da savana vizinha;
> (c) o processo **persiste ≥4 anos** (t a t+3).
>
> **Não é regeneração:**
> - adensamento de lenhosas com manejo ativo (pasto sujo: gado, cercas mantidas, roçada periódica, queima de manejo);
> - área que não era pastagem plantada (campo ou savana nativa degradada, ou rebrotando depois de fogo);
> - silvicultura, pomar, ILPF;
> - regeneração florestal (fora do escopo savânico).

**Categorias revistas:**
- **1a** regeneração (definição acima);
- **1b** adensamento em pasto manejado;
- **2** sem mudança;
- **3** outra mudança;
- **4** incerto.

**Teste de viabilidade:** dá para separar 1a de 1b com Sentinel-2, Landsat e o histórico do Google Earth? Se não der com confiança, a definição precisa de outro critério observável.

## Etapa 2 — Recaracterizar os pontos da P1 com a nova definição

- **Quem e o quê:** Mario revê os pontos com categoria 1 (412) e separa 1a e 1b, cego quanto ao estrato (só os códigos P).
- **Quando:** só **depois da reinterpretação** de consistência (a partir de 21/11). Rever os mesmos pontos antes contaminaria o intervalo de 14 dias.
- **Uso:** dado de **projeto** do detector, nunca de validação final.

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
