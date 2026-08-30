import { FastifyPluginAsync } from 'fastify';
import { db, createResponse } from '../db';
import { ResultadoCorrida } from '../types/f1';

interface ResultadosQuery {
  temporada?: string;
  rodada?: string;
  corrida_id?: string;
  piloto?: string;
  time?: string;
}

export const resultadosRoutes: FastifyPluginAsync = async (fastify) => {
  /**
   * GET /resultados
   * Resultados detalhados por corrida, temporada, piloto ou time
   */
  fastify.get<{ Querystring: ResultadosQuery }>('/resultados', async (request, reply) => {
    try {
      const { temporada, rodada, corrida_id, piloto, time } = request.query;

      let query = `
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
        WHERE 1=1
      `;
      const params: any[] = [];

      if (temporada) {
        query += ' AND r.temporada = ?';
        params.push(parseInt(temporada, 10));
      }
      if (rodada) {
        query += ' AND r.rodada = ?';
        params.push(parseInt(rodada, 10));
      }
      if (corrida_id) {
        query += ' AND r.id_corrida = ?';
        params.push(corrida_id);
      }
      if (piloto) {
        query += ' AND (r.id_piloto = ? OR p.codigo_piloto = UPPER(?))';
        params.push(piloto, piloto);
      }
      if (time) {
        query += ' AND r.id_time = ?';
        params.push(time);
      }

      query += ' ORDER BY r.temporada DESC, r.rodada ASC, r.posicao_final ASC';

      const stmt = db.prepare(query);
      const resultados = stmt.all(...params) as ResultadoCorrida[];
      return reply.send(createResponse(resultados));
    } catch (err: any) {
      fastify.log.error(err);
      return reply.status(500).send({ status: 'error', message: 'Erro ao buscar resultados' });
    }
  });
};
