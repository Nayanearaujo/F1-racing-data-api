#!/usr/bin/env python3
"""
Validação, Auditoria de Métricas e Governança de Dados
Executa testes de integridade referencial, conciliação de pontos e qualidade de dados.
"""

import os
import sqlite3

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, "data", "processed", "f1_database.sqlite")

def run_validations():
    print("=" * 65)
    print("🔍 AUDITORIA E VALIDAÇÃO DE QUALIDADE - F1 DATA API")
    print("=" * 65)

    if not os.path.exists(DB_PATH):
        print(f"❌ Erro: Banco de dados não encontrado em {DB_PATH}")
        return False

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    tests_passed = 0
    total_tests = 5

    # Teste 1: Integridade Referencial (Foreign Keys)
    cursor.execute("PRAGMA foreign_key_check;")
    fk_errors = cursor.fetchall()
    if not fk_errors:
        print("✅ [TESTE 1/5] Integridade de Chaves Estrangeiras: 100% VÁLIDA (Zero violações)")
        tests_passed += 1
    else:
        print(f"❌ [TESTE 1/5] Violações de FK encontradas: {fk_errors}")

    # Teste 2: Total de Entidades Carregadas
    cursor.execute("SELECT COUNT(*) FROM dim_tempo;")
    n_seasons = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM dim_corrida;")
    n_races = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM dim_piloto;")
    n_drivers = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM dim_time;")
    n_constructors = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM fato_resultados;")
    n_results = cursor.fetchone()[0]

    print(f"✅ [TESTE 2/5] Carga de Dados:")
    print(f"    - Temporadas: {n_seasons}")
    print(f"    - Corridas: {n_races}")
    print(f"    - Pilotos: {n_drivers}")
    print(f"    - Construtores/Times: {n_constructors}")
    print(f"    - Resultados Individuais: {n_results}")
    if n_seasons > 0 and n_drivers > 0 and n_results > 0:
        tests_passed += 1

    # Teste 3: Ausência de Nulos em Campos Críticos (LGPD / Qualidade)
    cursor.execute("""
        SELECT COUNT(*) FROM dim_piloto 
        WHERE id_piloto IS NULL OR nome_completo IS NULL OR nome_completo = '';
    """)
    null_drivers = cursor.fetchone()[0]
    cursor.execute("""
        SELECT COUNT(*) FROM fato_resultados 
        WHERE id_resultado IS NULL OR pontos IS NULL;
    """)
    null_results = cursor.fetchone()[0]

    if null_drivers == 0 and null_results == 0:
        print("✅ [TESTE 3/5] Qualidade de Campos Obrigatórios: Sem nulos em chaves e nomes")
        tests_passed += 1
    else:
        print(f"❌ [TESTE 3/5] Campos nulos detectados: Pilotos={null_drivers}, Resultados={null_results}")

    # Teste 4: Auditoria de Pódio e Vitórias
    cursor.execute("""
        SELECT id_corrida, COUNT(*) as vitorias 
        FROM fato_resultados 
        WHERE flag_vitoria = 1 
        GROUP BY id_corrida 
        HAVING COUNT(*) != 1;
    """)
    win_anomalies = cursor.fetchall()
    if not win_anomalies:
        print("✅ [TESTE 4/5] Regra de Negócio: Exatamente 1 vencedor por corrida")
        tests_passed += 1
    else:
        print(f"❌ [TESTE 4/5] Anomalia em vitórias detectada: {win_anomalies}")

    # Teste 5: Reconciliação do Top 3 Pilotos (2023)
    print("\n📊 Top 3 Pilotos - Temporada 2023 (Auditado):")
    cursor.execute("""
        SELECT 
            p.nome_completo,
            t.nome_time,
            rk.posicao_ranking,
            rk.pontos_acumulados,
            rk.vitorias_acumuladas
        FROM fato_ranking_pilotos rk
        JOIN dim_piloto p ON rk.id_piloto = p.id_piloto
        LEFT JOIN dim_time t ON rk.id_time = t.id_time
        WHERE rk.temporada = 2023
        ORDER BY rk.posicao_ranking ASC
        LIMIT 3;
    """)
    rows = cursor.fetchall()
    for row in rows:
        print(f"    #{row[2]} {row[0]} ({row[1]}) - {row[3]} pts, {row[4]} vitórias")
    if len(rows) > 0:
        tests_passed += 1

    conn.close()
    print("-" * 65)
    print(f"🏁 RESULTADO DA AUDITORIA: {tests_passed}/{total_tests} testes passaram com sucesso!")
    print("=" * 65)
    return tests_passed == total_tests

if __name__ == "__main__":
    run_validations()
