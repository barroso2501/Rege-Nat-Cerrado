"""
f0_05_holdout_final.py — Rege-Nat-Cerrado, fase F0 (congelamento)

O QUE FAZ
    Aplica a regra do holdout aprovada em 2026-10-29 (PROTOCOLO §11):
      - ORDEM das regiões: a do sorteio da tentativa 1 (semente 20261029),
        lida de results/f0_diagnosticos/F0_05_holdout_tentativa1.csv;
      - ÁREAS: as da partição raster (sem sobreposição), lidas da tentativa 2,
        results/f0_diagnosticos/F0_05_holdout_tentativa2.csv;
      - acumula as áreas nessa ordem até atingir >= 10% da área do Cerrado
        (raster); a região que cruza o limite entra.
    Escreve results/f0_diagnosticos/F0_05_holdout.csv (definitivo).
    Usa só a biblioteca padrão; não depende do Earth Engine.

POR QUE ASSIM
    O randomColumn do GEE gerou números diferentes na tentativa 2, mesmo com a
    mesma semente, porque a coleção foi montada de outro modo. A regra registrada
    antes da tentativa 2 era "mesma ordem da tentativa 1". Mario manteve essa regra.

COMO RODAR (da raiz do repositório)
    python src/python/f0_05_holdout_final.py

O QUE PODE QUEBRAR E COMO PERCEBER
    - KeyError numa região: as duas tabelas não têm as mesmas 38 regiões.
"""

import csv
import hashlib
from pathlib import Path

DIR = Path("results/f0_diagnosticos")
AREA_CERRADO_RASTER_KM2 = 2004377.5106875002   # autoverificação do script 05 v2 (2026-10-29)
FRACAO = 0.10


def sha(p: Path) -> str:
    return hashlib.sha256(p.read_bytes()).hexdigest()


def main() -> None:
    t1, t2 = DIR / "F0_05_holdout_tentativa1.csv", DIR / "F0_05_holdout_tentativa2.csv"
    ordem = [r["regiao"] for r in sorted(csv.DictReader(t1.open()), key=lambda r: int(r["posicao"]))]
    area = {r["regiao"]: float(r["area_km2"]) for r in csv.DictReader(t2.open())}
    assert sorted(ordem, key=int) == sorted(area, key=int) and len(ordem) == 38

    linhas, acum = [], 0.0
    for pos, reg in enumerate(ordem, start=1):
        dentro = acum < FRACAO * AREA_CERRADO_RASTER_KM2   # testa ANTES de somar
        acum += area[reg]
        linhas.append({"posicao": pos, "regiao": reg, "area_km2_raster": round(area[reg], 3),
                       "area_acum_km2": round(acum, 3), "holdout": int(dentro)})

    saida = DIR / "F0_05_holdout.csv"
    with saida.open("w", newline="") as fh:
        w = csv.DictWriter(fh, fieldnames=list(linhas[0]))
        w.writeheader()
        w.writerows(linhas)

    h = [l for l in linhas if l["holdout"]]
    frac = sum(l["area_km2_raster"] for l in h) / AREA_CERRADO_RASTER_KM2
    print("Holdout:", [l["regiao"] for l in h], f"fração = {frac:.4f}")
    print("Entradas:", t1.name, sha(t1)[:12], "|", t2.name, sha(t2)[:12])
    print("Saída:", saida, sha(saida)[:12])


if __name__ == "__main__":
    main()
