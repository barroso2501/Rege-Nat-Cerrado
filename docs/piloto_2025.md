# Piloto 2025 — registro histórico (exploratório, não reportável)

O piloto foi feito entre fevereiro e julho de 2025 em notebooks Colab, com a Coleção 9. Os números abaixo ficam registrados por transparência e **não** sustentam conclusões.

## O que foi feito

- **Amostra:** 5.000 pixels sorteados no produto de idade da vegetação secundária (Col. 9), com idade de 1 a 10 anos, em MT e GO. Transições pastagem → savana. Os N das etapas seguintes divergem: 3.901 e 3.313.
- **Variáveis extraídas** nos anos t−2 a t: GPP, vigor e idade da pastagem (Col. 9).
- **Altura** de t−2 a t+8, a partir de rasters `cropped_output{ano}.tif`, 2000–2022. **[L]** produto não identificado.
- **Resultados descritivos:**
  - aumento médio de 6,8 cm entre t e t+8, mas só para n = 626;
  - aumento da altura já antes da transição.
- **Filtro de similaridade:** feito com o intervalo de confiança da média de GPP. Erro de método.
- **Teste paralelo na Mata Atlântica (Mantiqueira):** Kendall calculado sobre as médias anuais.

## Problemas que motivaram o recomeço

Ver `PROTOCOLO.md` §1. Além deles:
- na Col. 9 ainda valia a regra pastagem > savana na integração, o que contamina as transições pastagem → savana;
- a curva média de altura mistura coortes, com viés de sobrevivência.

## O que vale aproveitar

- **A pergunta:** o estado da pastagem antes da transição contém sinal?
- **[H]** a subida da altura antes da transição pode ser um precursor real, ou atraso da classificação. Fica como hipótese para F2, testada contra controles.
- **A literatura reunida** (pasta de referências do Drive).

## Localização (Google Drive)

- Notebook: `Colab Notebooks/Regeracao_pontos_partes_raster.ipynb`
- Dados: `Trabalho/Regeneracao/`, `Trabalho/RegeneracaoMA/`
- Notas: `Potencial de Regeneração Natural no Cerrado.md`, `Potencial de Regeneração Natural 2.md`
