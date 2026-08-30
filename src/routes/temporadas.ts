import { FastifyPluginAsync } from 'fastify';
import { db, createResponse } from '../db';
import { Temporada } from '../types/f1';

export const temporadasRoutes: FastifyPluginAsync = async (fastify) => {
  /**
   * GET /temporadas
   * Retorna a lista de temporadas disponíveis com total de corridas
   */
  fastify.get('/temporadas', async (_request, reply) => {
    try {
      const stmt = db.prepare<[], Temporada>(`
        SELECT ano, total_corridas, url_wiki 
        FROM dim_tempo 
        ORDER BY ano DESC
      `);
      const temporadas = stmt.all();
      return reply.send(createResponse(temporadas));
    } catch (err: any) {
      fastify.log.error(err);
      return reply.status(500).send({ status: 'error', message: 'Erro ao buscar temporadas' });
    }
  });
};
