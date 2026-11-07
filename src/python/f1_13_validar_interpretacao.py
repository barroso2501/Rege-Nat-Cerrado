"""
f1_13_validar_interpretacao.py — Rege-Nat-Cerrado, F1, validação visual (P1)

O QUE FAZ (roda ANTES de abrir a CHAVE; não lê a CHAVE)
    1. Confere a planilha preenchida pelo intérprete contra a amostra original
       (results/f1/amostra_p1_interpretacao.csv): mesmos 750 códigos, mesmas
       coordenadas e mesmo ano t. Qualquer divergência interrompe o script.
    2. Confere o vocabulário de cada coluna (categoria 1–4; confiança; sim/não/talvez).
    3. Aplica as correções documentadas em
       results/f1/interpretacao/correcoes_pre_desbloqueio.csv:
         - aplicar_em = principal     → entram na coluna `categoria` (análise principal);
         - aplicar_em = sensibilidade → entram só na coluna `categoria_sens`.
       A categoria original fica sempre em `categoria_bruta`.
    4. Escreve:
         - results/f1/interpretacao/p1_interpretacao_analise.csv (colunas normalizadas);
         - results/f1/interpretacao/p1_validacao_registro.json (hashes, contagens, checagens).
    Nada aqui usa o estrato: as contagens são do conjunto dos 750 pontos.

COMO RODAR (da raiz do repositório)
    python src/python/f1_13_validar_interpretacao.py results/f1/interpretacao/p1_interpretacao_bruta_2026-11-07.csv

O QUE PODE QUEBRAR E COMO PERCEBER
    - "Divergência de coordenadas/t": a planilha foi editada nessas colunas ou
      linhas foram reordenadas/apagadas. O script para e lista os códigos.
    - "Valor fora do vocabulário": um valor novo apareceu (ex.: digitação). Corrija
      registrando a linha em correcoes_pre_desbloqueio.csv, nunca direto no bruto.
    - "Correção não confere": o valor_bruto da tabela de correções não bate com a
      planilha (a correção foi escrita para outra versão). O script para.
    - Só usa a biblioteca padrão.
"""

import collections
import csv
import hashlib
import json
import sys
from pathlib import Path

ORIGINAL = Path("results/f1/amostra_p1_interpretacao.csv")
CORRECOES = Path("results/f1/interpretacao/correcoes_pre_desbloqueio.csv")
SAIDA_CSV = Path("results/f1/interpretacao/p1_interpretacao_analise.csv")
SAIDA_JSON = Path("results/f1/interpretacao/p1_validacao_registro.json")

# Nomes de coluna da planilha (como o intérprete os escreveu) → nomes normalizados.
RENOMEAR = {"ja foi convertida": "ja_foi_convertida",
            "já foi pastagem plantada?": "ja_foi_pastagem_plantada"}
VOCAB = {"categoria": {"1", "2", "3", "4"},
         # 'media' não estava no plano (alta/baixa); aceito e registrado em docs/desvios.md.
         "confianca": {"alta", "media", "baixa"},
         "ja_foi_convertida": {"sim", "não", "talvez"},
         "ja_foi_pastagem_plantada": {"sim", "não", "talvez"}}


def sha(p: Path) -> str:
    return hashlib.sha256(p.read_bytes()).hexdigest()


def ler(p: Path):
    with p.open(newline="", encoding="utf-8") as fh:
        return list(csv.DictReader(fh))


def main(arq_bruto: str):
    bruto_path = Path(arq_bruto)
    original = {r["codigo"]: r for r in ler(ORIGINAL)}
    linhas = [{RENOMEAR.get(k, k): (v or "").strip() for k, v in r.items()} for r in ler(bruto_path)]

    # 1. Integridade: mesmos códigos, coordenadas e t da amostra sorteada.
    codigos = [r["codigo"] for r in linhas]
    divergentes = [r["codigo"] for r in linhas
                   if r["codigo"] not in original
                   or abs(float(r["lon"]) - float(original[r["codigo"]]["lon"])) > 1e-6
                   or abs(float(r["lat"]) - float(original[r["codigo"]]["lat"])) > 1e-6
                   or r["ano_referencia_t"] != original[r["codigo"]]["ano_referencia_t"]]
    faltando = sorted(set(original) - set(codigos))
    repetidos = [c for c, n in collections.Counter(codigos).items() if n > 1]
    if divergentes or faltando or repetidos:
        sys.exit(f"Divergência de coordenadas/t: {divergentes} | faltando: {faltando} | repetidos: {repetidos}")

    # 2. Correções documentadas: confere que o valor bruto bate antes de aplicar.
    por_codigo = {r["codigo"]: r for r in linhas}
    correcoes = ler(CORRECOES)
    for c in correcoes:
        atual = por_codigo[c["codigo"]][c["campo"]]
        if atual != c["valor_bruto"]:
            sys.exit(f"Correção não confere: {c['codigo']} {c['campo']} bruto='{atual}', tabela='{c['valor_bruto']}'")

    for r in linhas:
        r["categoria_bruta"] = r["categoria"]
        r["correcao"] = ""
    for c in correcoes:
        r = por_codigo[c["codigo"]]
        if c["campo"] == "categoria":
            if c["aplicar_em"] == "principal":
                r["categoria"] = c["valor_corrigido"]
            r.setdefault("_sens", c["valor_corrigido"])
            if c["aplicar_em"] == "sensibilidade":
                r["_sens"] = c["valor_corrigido"]
        else:
            r[c["campo"]] = c["valor_corrigido"]
        r["correcao"] = (r["correcao"] + "; " if r["correcao"] else "") + f"{c['tipo']}:{c['campo']}->{c['aplicar_em']}"
    for r in linhas:
        # categoria_sens = principal + correções de sensibilidade.
        r["categoria_sens"] = r.pop("_sens", r["categoria"])

    # 3. Vocabulário (depois das correções).
    fora = [(r["codigo"], col, r[col]) for r in linhas for col, ok in VOCAB.items() if r[col] not in ok]
    if fora:
        sys.exit(f"Valor fora do vocabulário (codigo, coluna, valor): {fora}")

    # 4. Saídas.
    colunas = ["codigo", "lon", "lat", "ano_referencia_t", "categoria_bruta", "categoria", "categoria_sens",
               "confianca", "imagens_usadas", "ja_foi_convertida", "ja_foi_pastagem_plantada", "comentario", "correcao"]
    SAIDA_CSV.parent.mkdir(parents=True, exist_ok=True)
    with SAIDA_CSV.open("w", newline="", encoding="utf-8") as fh:
        w = csv.DictWriter(fh, fieldnames=colunas, extrasaction="ignore")
        w.writeheader()
        w.writerows(sorted(linhas, key=lambda r: r["codigo"]))

    conta = lambda col: dict(sorted(collections.Counter(r[col] for r in linhas).items()))
    reg = {
        "observacao": "Validação feita SEM abrir a CHAVE. Contagens do conjunto dos 750 pontos, sem estrato.",
        "entradas": {bruto_path.name: sha(bruto_path), ORIGINAL.name: sha(ORIGINAL), CORRECOES.name: sha(CORRECOES)},
        "saidas": {SAIDA_CSV.name: sha(SAIDA_CSV)},
        "checagens": {"n_pontos": len(linhas), "coordenadas_e_t_iguais_a_amostra": True,
                      "codigos_faltando": 0, "codigos_repetidos": 0, "vocabulario_ok": True},
        "correcoes": [{k: c[k] for k in ("codigo", "campo", "valor_bruto", "valor_corrigido", "tipo", "aplicar_em")}
                      for c in correcoes],
        "contagens": {"categoria_bruta": conta("categoria_bruta"), "categoria": conta("categoria"),
                      "categoria_sens": conta("categoria_sens"), "confianca": conta("confianca"),
                      "ja_foi_convertida": conta("ja_foi_convertida"),
                      "ja_foi_pastagem_plantada": conta("ja_foi_pastagem_plantada")},
    }
    SAIDA_JSON.write_text(json.dumps(reg, indent=2, ensure_ascii=False), encoding="utf-8")
    print(json.dumps(reg["contagens"], ensure_ascii=False))
    print("OK →", SAIDA_CSV, "|", SAIDA_JSON)


if __name__ == "__main__":
    main(sys.argv[1])
