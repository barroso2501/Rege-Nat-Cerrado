# Registro de decisões

Cada decisão tem quatro partes:
- **opções** consideradas;
- **escolha**;
- **justificativa**;
- **teste crítico**: o que um revisor atacaria e por que a escolha se sustenta mesmo assim.

Status possíveis: **pendente**, **decidida** (antes do congelamento) e **revista** (depois do congelamento, com entrada em `desvios.md`).

| ID | Decisão | Opções | Proposta inicial | Status |
|---|---|---|---|---|
| D01 | Definição de "regeneração" | Classes de destino: só savana; todas as nativas (3, 4, 11, 12, 29…). Persistência mínima: 4, 6 ou 10 anos | Todas as nativas, estratificadas por classe. Persistência ≥4 anos, o mínimo que o filtro de falsa regeneração deixa ver. 6 e 10 anos como sensibilidade | pendente |
| D02 | Janela temporal dos eventos | 2003–2018; 2003–2020 | 2003–2018. Pré-transição a partir de 2000 e ≥5 anos de seguimento antes de 2023, quando a regra da Col. 11 impede nativa substituir 21 | pendente |
| D03 | Desenho analítico | A: risco em tempo discreto; B: caso-controle pareado | A | pendente |
| D04 | Papel da altura (SVH) | Excluir; usar só como validação; usar como preditor | Só validação, e só com produto não usado no treino do MapBiomas. Antes, identificar o produto do piloto | pendente |
| D05 | Escopo geográfico | Cerrado inteiro; MT+GO (como no piloto); recorte TNC | Cerrado inteiro, com resultados por ecorregião | pendente |
| D06 | Portão de P1 | Tamanho da amostra de validação; acerto mínimo (por exemplo, 70% ou 80%) | Definir com base no uso pretendido, antes de olhar os pontos | pendente |
| D07 | Destino da classe 21 | Pastagem só = 15; 15 + 21 | Só 15. 21 em análise de sensibilidade (KB:07, E01) | pendente |

## Teste crítico das propostas iniciais (rascunho)

- **D01 — persistência de 4 anos.**
  - Ataque: 4 anos ainda podem ser pousio.
  - Defesa parcial: é o mínimo observável. A sensibilidade com 6 e 10 anos mostra se as conclusões dependem disso.
  - **[L]** não sabemos a taxa de pousio longo no Cerrado.
- **D01 — incluir campo (12).**
  - Ataque: pastagem degradada e campo nativo se confundem espectralmente. A omissão de pastagem na Col. 11 vai justamente para formação florestal e savânica (KB:06).
  - Defesa: a estratificação por classe de destino e a validação visual medem isso em vez de supor.
- **D03 — Opção A.**
  - Ataque: autocorrelação temporal dentro do pixel.
  - Defesa: o pixel sai do conjunto em risco após o evento, os efeitos de ano são modelados e os erros são agrupados por bloco.
