/**
 * Definições de Tipos e Interfaces da API F1 Racing Data
 */

export interface ApiResponse<T> {
  status: 'success' | 'error';
  total?: number;
  data: T;
  meta: {
    fonte: string;
    timestamp: string;
    versao: string;
  };
}

export interface Temporada {
  ano: number;
  total_corridas: number;
  url_wiki: string | null;
}

export interface Corrida {
  id_corrida: string;
  temporada: number;
  rodada: number;
  nome_corrida: string;
  circuito_id: string;
  nome_circuito: string;
  localidade: string | null;
  pais: string | null;
  latitude: number | null;
  longitude: number | null;
  data_corrida: string | null;
  hora_corrida: string | null;
  url_wiki: string | null;
}

export interface Piloto {
  id_piloto: string;
  codigo_piloto: string | null;
  numero_permanente: number | null;
  nome_completo: string;
  primeiro_nome: string | null;
  sobrenome: string | null;
  data_nascimento: string | null;
  nacionalidade: string | null;
  url_wiki: string | null;
}

export interface PilotoDetalhado extends Piloto {
  estatisticas: {
    total_corridas: number;
    total_vitorias: number;
    total_podios: number;
    total_pontos: number;
    posicao_media_grid: number;
    posicao_media_final: number;
  };
  historico_recente: ResultadoCorrida[];
}

export interface Time {
  id_time: string;
  nome_time: string;
  nacionalidade: string | null;
  url_wiki: string | null;
  total_vitorias?: number;
  total_podios?: number;
  total_pontos?: number;
}

export interface ResultadoCorrida {
  id_resultado: string;
  id_corrida: string;
  nome_corrida: string;
  temporada: number;
  rodada: number;
  data_corrida: string | null;
  id_piloto: string;
  nome_piloto: string;
  codigo_piloto: string | null;
  id_time: string;
  nome_time: string;
  grid_largada: number;
  posicao_final: number;
  pontos: number;
  voltas_completadas: number;
  status_corrida: string;
  tempo_total_formatado: string | null;
  melhor_volta_tempo: string | null;
  melhor_volta_velocidade_media: number | null;
  diferenca_grid_posicao: number;
  flag_vitoria: number;
  flag_podio: number;
}

export interface RankingPiloto {
  posicao: number;
  id_piloto: string;
  nome_piloto: string;
  nacionalidade: string;
  id_time: string;
  nome_time: string;
  pontos: number;
  vitorias: number;
}

export interface RankingTime {
  posicao: number;
  id_time: string;
  nome_time: string;
  nacionalidade: string;
  pontos: number;
  vitorias: number;
}
