import Fastify from 'fastify';
import cors from '@fastify/cors';
import { temporadasRoutes } from './routes/temporadas';
import { corridasRoutes } from './routes/corridas';
import { pilotosRoutes } from './routes/pilotos';
import { timesRoutes } from './routes/times';
import { resultadosRoutes } from './routes/resultados';
import { rankingRoutes } from './routes/ranking';

const server = Fastify({
  logger: {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true
      }
    }
  }
});

async function start() {
  try {
    // Configura CORS
    await server.register(cors, {
      origin: true,
      methods: ['GET']
    });

    // Rota Raiz - Health Check e Metadados
    server.get('/', async () => {
      return {
        nome: 'F1 Racing Data API',
        descricao: 'API REST de Dados da Fórmula 1 - Engenharia de Dados & IA',
        status: 'online',
        rotas_disponiveis: [
          '/temporadas',
          '/corridas',
          '/pilotos',
          '/pilotos/:id',
          '/times',
          '/resultados',
          '/ranking'
        ],
        documentacao: 'Consulte o README.md e a pasta docs/'
      };
    });

    // Registro das rotas
    await server.register(temporadasRoutes);
    await server.register(corridasRoutes);
    await server.register(pilotosRoutes);
    await server.register(timesRoutes);
    await server.register(resultadosRoutes);
    await server.register(rankingRoutes);

    // Tratamento de 404
    server.setNotFoundHandler((request, reply) => {
      reply.status(404).send({
        status: 'error',
        message: `Rota ${request.method} ${request.url} não encontrada.`
      });
    });

    const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
    const HOST = process.env.HOST || '0.0.0.0';

    await server.listen({ port: PORT, host: HOST });
    console.log(`🏎️  Servidor F1 Racing Data API rodando em http://${HOST}:${PORT}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

start();
