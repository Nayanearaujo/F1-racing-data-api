import { FastifyPluginAsync } from 'fastify';
import { db, createResponse } from '../db';
import { Time } from '../types/f1';

export const timesRoutes: FastifyPluginAsync = async (fastify) => {
  /**
   * GET /times
   * Lista times (construtores) e estatísticas acumuladas
   */
  fastify.get('/times', async (_request, reply) => {
    try {
      const stmt = db.prepare<[], Time>(`
        SELECT 
          t.id_time,
          t.nome_time,
          t.nacionalidade,
          t.url_wiki,
          COALESCE(SUM(r.flag_vitoria), 0) as total_vitorias,
          COALESCE(SUM(r.flag_podio), 0) as total_podios,
          COALESCE(SUM(r.pontos), 0) as total_pontos
        FROM dim_time t
        LEFT JOIN fato_resultados r ON t.id_time = r.id_time
        GROUP BY t.id_time
        ORDER BY total_pontos DESC
      `);
      const times = stmt.all();
      return reply.send(createResponse(times));
    } catch (err: any) {
      fastify.log.error(err);
      return reply.status(500).send({ status: 'error', message: 'Erro ao buscar times' });
    }
  });
};
