# Regeneração natural em pastagens do Cerrado

Repositório: https://github.com/barroso2501/Rege-Nat-Cerrado

O projeto identifica onde pastagens do Cerrado passaram a vegetação nativa e se o estado anterior da pastagem e o contexto da paisagem permitem antecipar esse processo.

O produto final é um white paper para a TNC Brasil.

**Comece por `PROTOCOLO.md`.** Ele define perguntas, portões e regras antes de qualquer resultado.

## Estrutura

```
PROTOCOLO.md             perguntas, desenho, portões, regras de honestidade
docs/decisoes.md         decisões metodológicas (pendentes / decididas / revistas)
docs/desvios.md          mudanças após o congelamento do protocolo
docs/fontes_dados.md     assets, versões, marcas epistêmicas
docs/piloto_2025.md      histórico do piloto (não reportável)
CHANGELOG.md             o que mudou em cada pacote enviado ao repositório
src/gee/                 scripts Earth Engine, numerados por ordem de execução
src/python/              análise em Python, numerada
notebooks/exploratorio/  exploração; não gera número reportável
data/manifestos/         o que foi exportado, de qual asset/versão, quando, com hash
results/                 saídas geradas por src/ (tabelas e figuras), nunca editadas à mão
```

## Status

| Fase | Situação |
|---|---|
| F0 — protocolo e repositório | em andamento (protocolo v0.1, decisões pendentes) |
| F1–F5 | não iniciadas |

## Reprodutibilidade

Nível intermediário: git, `environment.yml`, manifesto de dados, sementes fixas e scripts numerados (ver `PROTOCOLO.md` §8).

## Autoria

Mario Barroso Ramos Neto — The Nature Conservancy, Brasil.
