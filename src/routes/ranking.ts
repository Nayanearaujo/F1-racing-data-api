import { FastifyPluginAsync } from 'fastify';
import { db, createResponse } from '../db';
import { RankingPiloto, RankingTime } from '../types/f1';

interface RankingQuery {
  temporada?: string;
  tipo?: 'pilotos' | 'construtores';
}

export const rankingRoutes: FastifyPluginAsync = async (fastify) => {
  /**
   * GET /ranking
   * Classificação de pilotos ou construtores por temporada
   */
  fastify.get<{ Querystring: RankingQuery }>('/ranking', async (request, reply) => {
    try {
      const temporada = request.query.temporada ? parseInt(request.query.temporada, 10) : 2023;
      const tipo = request.query.tipo || 'pilotos';

      if (tipo === 'construtores') {
        const stmt = db.prepare<[number], RankingTime>(`
          SELECT 
            rk.posicao_ranking as posicao,
            rk.id_time,
            t.nome_time,
            t.nacionalidade,
            rk.pontos_acumulados as pontos,
            rk.vitorias_acumuladas as vitorias
          FROM fato_ranking_times rk
          JOIN dim_time t ON rk.id_time = t.id_time
          WHERE rk.temporada = ?
          ORDER BY rk.posicao_ranking ASC
        `);
        const ranking = stmt.all(temporada);
        return reply.send(createResponse(ranking));
      } else {
        const stmt = db.prepare<[number], RankingPiloto>(`
          SELECT 
            rk.posicao_ranking as posicao,
            rk.id_piloto,
            p.nome_completo as nome_piloto,
            p.nacionalidade,
            rk.id_time,
            COALESCE(t.nome_time, 'N/A') as nome_time,
            rk.pontos_acumulados as pontos,
            rk.vitorias_acumuladas as vitorias
          FROM fato_ranking_pilotos rk
          JOIN dim_piloto p ON rk.id_piloto = p.id_piloto
          LEFT JOIN dim_time t ON rk.id_time = t.id_time
          WHERE rk.temporada = ?
          ORDER BY rk.posicao_ranking ASC
        `);
        const ranking = stmt.all(temporada);
        return reply.send(createResponse(ranking));
      }
    } catch (err: any) {
      fastify.log.error(err);
      return reply.status(500).send({ status: 'error', message: 'Erro ao buscar ranking' });
    }
  });
};
