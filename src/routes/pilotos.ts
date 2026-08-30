import { FastifyPluginAsync } from 'fastify';
import { db, createResponse } from '../db';
import { Piloto, PilotoDetalhado, ResultadoCorrida } from '../types/f1';

interface PilotosQuery {
  temporada?: string;
  time?: string;
}

interface PilotoParams {
  id: string;
}

export const pilotosRoutes: FastifyPluginAsync = async (fastify) => {
  /**
   * GET /pilotos
   * Lista pilotos com filtros opcionais por temporada e time
   */
  fastify.get<{ Querystring: PilotosQuery }>('/pilotos', async (request, reply) => {
    try {
      const { temporada, time } = request.query;
      let query = `
        SELECT DISTINCT
          p.id_piloto, p.codigo_piloto, p.numero_permanente, p.nome_completo,
          p.primeiro_nome, p.sobrenome, p.data_nascimento, p.nacionalidade, p.url_wiki
        FROM dim_piloto p
      `;
      const params: any[] = [];

      if (temporada || time) {
        query += ` JOIN fato_resultados r ON p.id_piloto = r.id_piloto WHERE 1=1`;
        if (temporada) {
          query += ` AND r.temporada = ?`;
          params.push(parseInt(temporada, 10));
        }
        if (time) {
          query += ` AND (LOWER(r.id_time) = LOWER(?) OR LOWER(r.id_time) LIKE LOWER(?))`;
          params.push(time, `%${time}%`);
        }
      }

      query += ` ORDER BY p.nome_completo ASC`;

      const stmt = db.prepare(query);
      const pilotos = stmt.all(...params) as Piloto[];
      return reply.send(createResponse(pilotos));
    } catch (err: any) {
      fastify.log.error(err);
      return reply.status(500).send({ status: 'error', message: 'Erro ao buscar pilotos' });
    }
  });

  /**
   * GET /pilotos/:id
   * Dados detalhados, estatísticas consolidadas e histórico de corridas do piloto
   */
  fastify.get<{ Params: PilotoParams }>('/pilotos/:id', async (request, reply) => {
    try {
      const { id } = request.params;

      const pilotoStmt = db.prepare<[string], Piloto>(`
        SELECT * FROM dim_piloto WHERE id_piloto = ? OR codigo_piloto = UPPER(?)
      `);
      const piloto = pilotoStmt.get(id, id);

      if (!piloto) {
        return reply.status(404).send({ status: 'error', message: `Piloto '${id}' não encontrado.` });
      }

      // Estatísticas agregadas
      const statsStmt = db.prepare<[string], any>(`
        SELECT 
          COUNT(*) as total_corridas,
          COALESCE(SUM(flag_vitoria), 0) as total_vitorias,
          COALESCE(SUM(flag_podio), 0) as total_podios,
          COALESCE(SUM(pontos), 0) as total_pontos,
          ROUND(AVG(CASE WHEN grid_largada > 0 THEN grid_largada ELSE NULL END), 2) as posicao_media_grid,
          ROUND(AVG(CASE WHEN posicao_final > 0 THEN posicao_final ELSE NULL END), 2) as posicao_media_final
        FROM fato_resultados
        WHERE id_piloto = ?
      `);
      const stats = statsStmt.get(piloto.id_piloto);

      // Histórico de corridas
      const histStmt = db.prepare<[string], ResultadoCorrida>(`
        SELECT 
          r.id_resultado, r.id_corrida, c.nome_corrida, r.temporada, r.rodada,
          c.data_corrida, r.id_piloto, p.nome_completo as nome_piloto, p.codigo_piloto,
          r.id_time, t.nome_time, r.grid_largada, r.posicao_final, r.pontos,
          r.voltas_completadas, r.status_corrida, r.tempo_total_formatado,
          r.melhor_volta_tempo, r.melhor_volta_velocidade_media, r.diferenca_grid_posicao,
          r.flag_vitoria, r.flag_podio
        FROM fato_resultados r
        JOIN dim_corrida c ON r.id_corrida = c.id_corrida
        JOIN dim_piloto p ON r.id_piloto = p.id_piloto
        JOIN dim_time t ON r.id_time = t.id_time
        WHERE r.id_piloto = ?
        ORDER BY r.temporada DESC, r.rodada DESC
      `);
      const historico = histStmt.all(piloto.id_piloto);

      const detalhado: PilotoDetalhado = {
        ...piloto,
        estatisticas: {
          total_corridas: stats.total_corridas || 0,
          total_vitorias: stats.total_vitorias || 0,
          total_podios: stats.total_podios || 0,
          total_pontos: stats.total_pontos || 0,
          posicao_media_grid: stats.posicao_media_grid || 0,
          posicao_media_final: stats.posicao_media_final || 0
        },
        historico_recente: historico
      };

      return reply.send(createResponse(detalhado));
    } catch (err: any) {
      fastify.log.error(err);
      return reply.status(500).send({ status: 'error', message: 'Erro ao buscar detalhes do piloto' });
    }
  });
};
