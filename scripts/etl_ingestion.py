#!/usr/bin/env python3
"""
ETL Ingestion Script - Ergast F1 API
Responsável por consumir dados reais da API da Fórmula 1 e armazenar em data/raw/
"""

import json
import os
import sys
import time
from urllib.request import Request, urlopen
from urllib.error import URLError, HTTPError

RAW_DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data", "raw")
os.makedirs(RAW_DATA_DIR, exist_ok=True)

# Endpoints espelho da Ergast Developer API
API_BASE_URLS = [
    "https://api.jolpi.ca/ergast/f1",
    "http://ergast.com/api/f1"
]

SEASONS_TO_INGEST = ["2021", "2022", "2023", "2024"]

def fetch_json(endpoint: str):
    """Realiza requisição HTTP com headers apropriados e retry entre mirrors."""
    for base in API_BASE_URLS:
        url = f"{base}/{endpoint}.json?limit=1000"
        req = Request(url, headers={"User-Agent": "F1DataEngineeringBot/1.0"})
        try:
            print(f"[INGEST] Baixando: {url}")
            with urlopen(req, timeout=10) as response:
                if response.status == 200:
                    return json.loads(response.read().decode("utf-8"))
        except (HTTPError, URLError, Exception) as e:
            print(f"[AVISO] Falha ao conectar em {base}: {e}. Tentando próximo espelho...")
            time.sleep(1)
    return None

def ingest():
    print("=" * 60)
    print("🏎️  F1 RACING DATA - INGESTÃO DE DADOS (ERGAST API)")
    print("=" * 60)
    
    # 1. Ingestão de Temporadas
    seasons_data = fetch_json("seasons")
    if seasons_data:
        with open(os.path.join(RAW_DATA_DIR, "seasons.json"), "w", encoding="utf-8") as f:
            json.dump(seasons_data, f, ensure_ascii=False, indent=2)
        print("✅ Temporadas salvas em data/raw/seasons.json")
    
    # 2. Ingestão por Temporada (Corridas, Pilotos, Construtores, Resultados, Rankings)
    for year in SEASONS_TO_INGEST:
        print(f"\n--- Processando Temporada {year} ---")
        
        # Corridas
        races_data = fetch_json(f"{year}")
        if races_data:
            with open(os.path.join(RAW_DATA_DIR, f"races_{year}.json"), "w", encoding="utf-8") as f:
                json.dump(races_data, f, ensure_ascii=False, indent=2)
            print(f"✅ Corridas de {year} salvas.")

        # Pilotos
        drivers_data = fetch_json(f"{year}/drivers")
        if drivers_data:
            with open(os.path.join(RAW_DATA_DIR, f"drivers_{year}.json"), "w", encoding="utf-8") as f:
                json.dump(drivers_data, f, ensure_ascii=False, indent=2)
            print(f"✅ Pilotos de {year} salvos.")

        # Construtores (Times)
        constructors_data = fetch_json(f"{year}/constructors")
        if constructors_data:
            with open(os.path.join(RAW_DATA_DIR, f"constructors_{year}.json"), "w", encoding="utf-8") as f:
                json.dump(constructors_data, f, ensure_ascii=False, indent=2)
            print(f"✅ Construtores de {year} salvos.")

        # Resultados de todas as corridas do ano
        results_data = fetch_json(f"{year}/results")
        if results_data:
            with open(os.path.join(RAW_DATA_DIR, f"results_{year}.json"), "w", encoding="utf-8") as f:
                json.dump(results_data, f, ensure_ascii=False, indent=2)
            print(f"✅ Resultados de {year} salvos.")

        # Classificação final de Pilotos
        driver_standings = fetch_json(f"{year}/driverStandings")
        if driver_standings:
            with open(os.path.join(RAW_DATA_DIR, f"driver_standings_{year}.json"), "w", encoding="utf-8") as f:
                json.dump(driver_standings, f, ensure_ascii=False, indent=2)
            print(f"✅ Classificação de Pilotos de {year} salva.")

        # Classificação final de Construtores
        constructor_standings = fetch_json(f"{year}/constructorStandings")
        if constructor_standings:
            with open(os.path.join(RAW_DATA_DIR, f"constructor_standings_{year}.json"), "w", encoding="utf-8") as f:
                json.dump(constructor_standings, f, ensure_ascii=False, indent=2)
            print(f"✅ Classificação de Construtores de {year} salva.")
            
        time.sleep(0.5)

    print("\n🏁 Ingestão concluída com sucesso!")

if __name__ == "__main__":
    ingest()
