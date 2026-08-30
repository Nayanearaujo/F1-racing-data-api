-- =========================================================================
-- CONSULTAS SQL DE AUDITORIA, RECONCILIAÇÃO E GOVERNANÇA DE MÉTRICAS
-- F1 Racing Data API
-- =========================================================================

-- 1. Auditoria de Integridade de Chaves Estrangeiras
PRAGMA foreign_key_check;

-- 2. Total de Entidades e Volumetria por Tabela
SELECT 'dim_tempo' as tabela, COUNT(*) as registros FROM dim_tempo
UNION ALL
SELECT 'dim_time', COUNT(*) FROM dim_time
UNION ALL
SELECT 'dim_piloto', COUNT(*) FROM dim_piloto
UNION ALL
SELECT 'dim_corrida', COUNT(*) FROM dim_corrida
UNION ALL
SELECT 'fato_resultados', COUNT(*) FROM fato_resultados
UNION ALL
SELECT 'fato_ranking_pilotos', COUNT(*) FROM fato_ranking_pilotos;

-- 3. Reconciliação de Vitórias e Pódios por Piloto (Temporada 2023)
SELECT 
    p.nome_completo as piloto,
    t.nome_time as equipe,
    SUM(r.flag_vitoria) as total_vitorias,
    SUM(r.flag_podio) as total_podios,
    SUM(r.pontos) as total_pontos,
    ROUND(AVG(r.posicao_final), 2) as media_chegada,
    ROUND(AVG(r.grid_largada), 2) as media_grid
FROM fato_resultados r
JOIN dim_piloto p ON r.id_piloto = p.id_piloto
JOIN dim_time t ON r.id_time = t.id_time
WHERE r.temporada = 2023
GROUP BY p.id_piloto
ORDER BY total_pontos DESC;

-- 4. Análise de Ganho de Posições (Métrica Derivada de Performance)
SELECT 
    c.nome_corrida,
    p.nome_completo,
    r.grid_largada,
    r.posicao_final,
    r.diferenca_grid_posicao as posicoes_ganhas
FROM fato_resultados r
JOIN dim_corrida c ON r.id_corrida = c.id_corrida
JOIN dim_piloto p ON r.id_piloto = p.id_piloto
WHERE r.diferenca_grid_posicao > 0
ORDER BY r.diferenca_grid_posicao DESC
LIMIT 10;
