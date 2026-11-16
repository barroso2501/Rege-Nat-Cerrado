"""
f2_19_preparar_etapa2.py — Rege-Nat-Cerrado, Fase 2 (novo rótulo), Etapa 2

O QUE FAZ (docs/plano_fase2_rotulo.md, Etapa 2; D13)
    1. Seleciona os pontos da P1 com categoria 1 na análise principal
       (results/f1/interpretacao/p1_interpretacao_analise.csv, coluna `categoria`).
       Não usa a CHAVE: a planilha não tem estrato.
    2. Embaralha a ordem (semente fixa). Mantém os códigos P para rastreabilidade.
    3. Escreve:
       - results/fase2_rotulo/etapa2/etapa2_reclassificacao.csv — planilha a preencher;
       - src/gee/19_ferramenta_etapa2.js — ferramenta de inspeção (miniaturas, NDVI anual
         e observações Landsat de NDVI e NDTI de t-4 a t+4);
       - results/fase2_rotulo/etapa2/etapa2_registro.json — semente, hashes, n.

QUANDO USAR
    Só DEPOIS da reinterpretação de consistência (R01–R75, a partir de 2026-11-21):
    rever os mesmos pontos antes contaminaria o intervalo de 14 dias.

COMO RODAR (da raiz do repositório)
    python src/python/f2_19_preparar_etapa2.py

O QUE PODE QUEBRAR E COMO PERCEBER
    - FileNotFoundError: rode antes o f1_13 (gera p1_interpretacao_analise.csv).
    - "Trecho do modelo não encontrado": o modelo 19 mudou.
    - Só usa a biblioteca padrão.
"""

import csv
import hashlib
import json
import random
from pathlib import Path

SEMENTE = 20261116
ENTRADA = Path("results/f1/interpretacao/p1_interpretacao_analise.csv")
MODELO = Path("src/gee/19_modelo_ferramenta_etapa2.js.txt")
SAIDA_GEE = Path("src/gee/19_ferramenta_etapa2.js")
PASTA = Path("results/fase2_rotulo/etapa2")

# Colunas a preencher. Valores permitidos entre colchetes, na linha 2 do README da pasta.
COLUNAS = ["codigo", "lon", "lat", "ano_referencia_t",
           "alta_resolucao_na_janela",      # sim / não
           "n_datas_alta_resolucao",        # inteiro (0, 1, 2…)
           "Q1_convertida",                 # sim / não / talvez
           "Q1_ano_aprox",                  # ano ou vazio
           "Q1b_intensidade",               # corte_raso / parcial / incerta
           "Q2_era_savana",                 # sim / não / talvez
           "Q3_pastagem_implantada",        # sim / não / talvez
           "Q4_arboreo_presente",           # sim / não / indeterminado
           "Q4_trajetoria_lenhosas",        # aumenta / estavel / diminui / indeterminada
           "Q4_pastoreio",                  # reduzido / ativo / indeterminado
           "categoria_v3",                  # 1a / 1c / 1? / 2 / 3 / 4
           "evidencia_decisiva",            # alta_res / sentinel2 / curva
           "assinatura_curva",              # texto livre: o que a curva mostrou (pastoreio reduzido, conversão…)
           "comentario",
           "data_interpretacao"]            # AAAA-MM-DD


def sha(p: Path) -> str:
    return hashlib.sha256(p.read_bytes()).hexdigest()


def main():
    with ENTRADA.open(newline="", encoding="utf-8") as fh:
        pontos = [r for r in csv.DictReader(fh) if r["categoria"] == "1"]
    pontos.sort(key=lambda r: r["codigo"])
    random.Random(SEMENTE).shuffle(pontos)

    PASTA.mkdir(parents=True, exist_ok=True)
    planilha = PASTA / "etapa2_reclassificacao.csv"
    with planilha.open("w", newline="", encoding="utf-8") as fh:
        w = csv.writer(fh)
        w.writerow(COLUNAS)
        for r in pontos:
            w.writerow([r["codigo"], r["lon"], r["lat"], r["ano_referencia_t"]] + [""] * (len(COLUNAS) - 4))

    modelo = MODELO.read_text(encoding="utf-8")
    if "/*__PONTOS__*/" not in modelo:
        raise SystemExit("Trecho do modelo não encontrado: /*__PONTOS__*/")
    lista = ",\n".join(f"  ['{r['codigo']}', {r['lon']}, {r['lat']}, {int(r['ano_referencia_t'])}]" for r in pontos)
    SAIDA_GEE.write_text(modelo.replace("/*__PONTOS__*/", lista), encoding="utf-8")

    reg = {"semente": SEMENTE, "n": len(pontos), "inicio_minimo": "depois da reinterpretação (≥ 2026-11-21)",
           "entradas": {ENTRADA.name: sha(ENTRADA), MODELO.name: sha(MODELO)},
           "saidas": {planilha.name: sha(planilha), SAIDA_GEE.name: sha(SAIDA_GEE)}}
    (PASTA / "etapa2_registro.json").write_text(json.dumps(reg, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"{len(pontos)} pontos → {planilha} | ferramenta → {SAIDA_GEE}")


if __name__ == "__main__":
    main()
