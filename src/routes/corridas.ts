import { FastifyPluginAsync } from 'fastify';
import { db, createResponse } from '../db';
import { Corrida } from '../types/f1';

interface CorridasQuery {
  temporada?: string;
  pais?: string;
}

export const corridasRoutes: FastifyPluginAsync = async (fastify) => {
  /**
   * GET /corridas
   * Lista corridas por temporada e/ou país
   */
  fastify.get<{ Querystring: CorridasQuery }>('/corridas', async (request, reply) => {
    try {
      const { temporada, pais } = request.query;
      let query = `
        SELECT 
          id_corrida, temporada, rodada, nome_corrida, circuito_id,
          nome_circuito, localidade, pais, latitude, longitude,
          data_corrida, hora_corrida, url_wiki
        FROM dim_corrida
        WHERE 1=1
      `;
      const params: any[] = [];

      if (temporada) {
        query += ' AND temporada = ?';
        params.push(parseInt(temporada, 10));
      }
      if (pais) {
        query += ' AND LOWER(pais) LIKE LOWER(?)';
        params.push(`%${pais}%`);
      }

      query += ' ORDER BY temporada DESC, rodada ASC';

      const stmt = db.prepare(query);
      const corridas = stmt.all(...params) as Corrida[];
      return reply.send(createResponse(corridas));
    } catch (err: any) {
      fastify.log.error(err);
      return reply.status(500).send({ status: 'error', message: 'Erro ao buscar corridas' });
    }
  });
};
