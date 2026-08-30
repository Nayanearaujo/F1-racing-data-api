<div align="center">

![F1 Racing Data API Banner](./docs/assets/banner.jpg)

# F1 Racing Data API

API REST de dados de Fórmula 1, construída com um pipeline de engenharia de dados completo: ingestão, transformação, modelagem dimensional e validação de qualidade.

Projeto desenvolvido para o desafio do **Bootcamp Sem Parar Corpay (DIO)**, em paralelo à **Pós-Graduação em Engenharia de Dados e Inteligência Artificial** na Faculdade Anhanguera.

**Tecnologias:** Fastify · TypeScript · Node.js · Python · SQLite · Docker

</div>

---

## Proposta

O objetivo foi construir um serviço de backend conectado a um pipeline de dados real: da ingestão bruta até uma API servindo dados já validados e modelados no formato Star Schema.

---

## Arquitetura do pipeline

O fluxo de dados foi estruturado em etapas:

1. **Ingestão (raw):** Coleta de temporadas, corridas, pilotos, equipes e resultados em JSON bruto a partir da API pública Ergast/Jolpica, armazenados em `data/raw/`.
2. **Transformação:** O script `scripts/etl_transform_load.py` valida o esquema, trata valores nulos e calcula métricas derivadas (diferença de grid, vitórias, pódios e pontos acumulados).
3. **Modelagem dimensional:** Armazenamento em banco SQLite (`data/processed/f1_database.sqlite`) estruturado em Star Schema com tabelas de dimensão (`dim_piloto`, `dim_time`, `dim_corrida`, `dim_tempo`) e fatos (`fato_resultados`, `fato_ranking_pilotos`, `fato_ranking_times`).
4. **API:** Servidor Fastify com TypeScript, conectado ao SQLite via `better-sqlite3`, servindo respostas JSON com baixa latência.
5. **Qualidade e Governança:** O script `scripts/validate_data.py` audita a integridade referencial e regras de negócio antes do consumo.

---

## Endpoints da API

| Método | Endpoint | Descrição |
| :--- | :--- | :--- |
| `GET` | `/` | Health check e catálogo de rotas |
| `GET` | `/temporadas` | Anos disponíveis e total de Grandes Prêmios |
| `GET` | `/corridas?temporada=2023` | Corridas por temporada e dados geográficos |
| `GET` | `/pilotos?time=red_bull` | Pilotos com filtro por equipe e ano |
| `GET` | `/pilotos/:id` | Dados biográficos e estatísticas agregadas do piloto |
| `GET` | `/times` | Construtores, com histórico de vitórias e pontos |
| `GET` | `/resultados?temporada=2023&rodada=6` | Resultados completos de um GP |
| `GET` | `/ranking?temporada=2023&tipo=pilotos` | Classificação oficial de pilotos ou construtores |

---

## Exemplo de resposta

`GET /ranking?temporada=2023&tipo=pilotos`

```json
{
  "status": "success",
  "total": 8,
  "data": [
    {
      "posicao": 1,
      "id_piloto": "max_verstappen",
      "nome_piloto": "Max Verstappen",
      "nacionalidade": "Dutch",
      "id_time": "red_bull",
      "nome_time": "Red Bull Racing",
      "pontos": 575.0,
      "vitorias": 19
    }
  ],
  "meta": {
    "fonte": "Ergast Developer API / Jolpica F1 Mirror",
    "timestamp": "2026-08-30T00:50:00.000Z",
    "versao": "1.0.0"
  }
}
```

---

## Validação de qualidade dos dados

```bash
python3 scripts/validate_data.py
```

O script confere:
* Integridade referencial (ausência de violações de chave estrangeira);
* Ausência de nulos em campos obrigatórios;
* Regra de negócio de exatamente um vencedor por corrida;
* Reconciliação dos dados dos pilotos contra os resultados oficiais da temporada.

---

## Como executar

### Com Docker

```bash
# 1. Clonar o repositório
git clone https://github.com/Nayanearaujo/F1-racing-data-api.git
cd F1-racing-data-api

# 2. Subir o container
docker compose up --build -d

# 3. Testar a API
curl http://localhost:3000/
curl "http://localhost:3000/ranking?temporada=2023&tipo=pilotos"
```

### Localmente

Pré-requisitos: Node.js 18+ e Python 3.9+

```bash
# Executar o pipeline de dados
python3 scripts/etl_transform_load.py

# Validar a qualidade
python3 scripts/validate_data.py

# Instalar dependências e iniciar a API
npm install
npm run dev
```

---

## Estrutura do repositório

```
f1-racing-data-api/
├── data/
│   ├── raw/                        # Dados brutos em JSON
│   └── processed/                  # Banco SQLite modelado
├── docs/
│   ├── assets/                     # Imagens do projeto
│   ├── arquitetura.md
│   ├── dicionario_dados.md
│   └── governanca_lgpd.md
├── scripts/
│   ├── etl_ingestion.py
│   ├── etl_transform_load.py
│   └── validate_data.py
├── src/
│   ├── db.ts
│   ├── index.ts
│   ├── routes/
│   └── types/
├── Dockerfile
├── docker-compose.yml
├── package.json
├── requirements.txt
└── README.md
```

---

## Autoria

Desenvolvido por [Nayane Araujo](https://github.com/Nayanearaujo).
