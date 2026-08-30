<div align="center">

![F1 Racing Data API Banner](./docs/assets/banner.jpg)

# 🏎️ F1 Racing Data API

### **API REST de Engenharia de Dados e Inteligência Artificial da Fórmula 1**
*Desenvolvida com IA Generativa para o **Bootcamp Sem Parar Corpay (DIO)** & alinhada à **Pós-Graduação em Engenharia de Dados e Inteligência Artificial** (Anhanguera)*

---

### 🚀 Stack Tecnológica & Ferramentas
![Fastify](https://img.shields.io/badge/Fastify-000000?style=for-the-badge&logo=fastify&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Git](https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white)
![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)

</div>

---

## 🎯 Proposta do Projeto

Projeto prático desenvolvido para o Desafio do **Bootcamp Sem Parar Corpay - Back-end do Zero à Prática** na [DIO](https://dio.me). 

A proposta foi aplicar o conceito central do programa — **utilizar Inteligência Artificial e automação para acelerar o desenvolvimento e elevar o nível técnico da entrega** —, construindo não apenas um CRUD simples, mas um microsserviço de **Back-End de alta performance** integrado a uma arquitetura completa de **Engenharia de Dados**, conectando os aprendizados do bootcamp à preparação para a **Pós-Graduação em Engenharia de Dados e Inteligência Artificial**.

---

## 🏗️ Arquitetura do Pipeline de Dados

<div align="center">

![Pipeline de Engenharia de Dados](./docs/assets/architecture.jpg)

</div>

### Fluxo em Camadas (Medallion Architecture):
1. **Camada Bronze (Raw Ingestion):** Ingestão de temporadas, corridas, pilotos, equipes e resultados em arquivos JSON brutos em `data/raw/` via API pública Ergast / Jolpica mirror.
2. **Camada Silver (Processing & Transformation):** Scripts de ETL em Python (`etl_transform_load.py`) para validação de esquemas, deduping, tratamento de nulos e cálculo de métricas avançadas (diferença de grid, taxa de vitórias, pódios e pontos acumulados).
3. **Camada Gold (Business Readiness):** Banco de dados relacional SQLite (`f1_database.sqlite`) modelado no padrão **Star Schema** com tabelas Dimensão (`dim_piloto`, `dim_time`, `dim_corrida`, `dim_tempo`) e Tabelas Fato (`fato_resultados`, `fato_ranking_*`).
4. **Camada de Serviço (API Serving):** API REST desenvolvida em **Fastify + TypeScript** conectada via driver de alta performance (`better-sqlite3`), fornecendo respostas JSON estruturadas com sub-milissegundo de latência.
5. **Quality Gate & Governança:** Script automatizado (`validate_data.py`) garantindo **100% de integridade referencial** e conformidade com a LGPD (Lei nº 13.709/2018).

---

## 🎓 Alinhamento com a Ementa da Pós-Graduação

| Disciplina da Pós | Aplicação Prática no Projeto |
| :--- | :--- |
| **01. Fundamentos de Engenharia de Dados** | Organização em camadas de dados (Raw/Bronze, Processed/Gold), governança de pastas e arquivos. |
| **02. Engenharia de Dados na Prática (Python/SQL)** | Pipelines de ETL automatizados em Python (`etl_ingestion.py`, `etl_transform_load.py`) e reconciliação SQL. |
| **03. Modelagem de Dados & Arquitetura** | Modelo Dimensional com tabelas de Fato (`fato_resultados`, `fato_ranking_*`) e Dimensões (`dim_piloto`, `dim_time`, `dim_corrida`, `dim_tempo`). |
| **04. Qualidade de Dados & Auditoria** | Script de auditoria automatizada (`validate_data.py`), validação de integridade referencial (FKs) e ausência de nulos. |
| **05. Governança e LGPD** | Dicionário de dados formal (`docs/dicionario_dados.md`) e conformidade com a LGPD (`docs/governanca_lgpd.md`). |
| **06. API REST & Serviços de Dados** | API em Node.js + Fastify + TypeScript com rotas otimizadas, CORS, tipagem estrita e sub-milissegundo de latência. |
| **07. DevOps e Conteinerização** | Criação de imagem multi-stage em `Dockerfile` e orquestração com `docker-compose.yml`. |
| **08. Prontidão para BI e MLOps** | Dados normalizados e métricas derivadas prontas para consumo direto em Power BI, Databricks e modelos preditivos. |

---

## 📡 Endpoints da API

| Método | Endpoint | Descrição |
| :--- | :--- | :--- |
| `GET` | `/` | Health check, status da API e catálogo de rotas |
| `GET` | `/temporadas` | Lista os anos disponíveis e total de Grandes Prêmios |
| `GET` | `/corridas?temporada=2023` | Lista GPs, circuitos e dados geográficos |
| `GET` | `/pilotos?time=red_bull` | Lista pilotos com filtros dinâmicos por equipe e ano |
| `GET` | `/pilotos/:id` | Dados biográficos, estatísticas agregadas e histórico do piloto |
| `GET` | `/times` | Construtores/equipes com histórico de vitórias e pontos |
| `GET` | `/resultados?temporada=2023&rodada=6` | Resultados completos e tempos de volta mais rápida de um GP |
| `GET` | `/ranking?temporada=2023&tipo=pilotos` | Classificação oficial de pilotos ou construtores |

---

## 🖼️ Exemplos de Respostas da API

### Exemplo 1: `GET /ranking?temporada=2023&tipo=pilotos`
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
    },
    {
      "posicao": 2,
      "id_piloto": "perez",
      "nome_piloto": "Sergio Pérez",
      "nacionalidade": "Mexican",
      "id_time": "red_bull",
      "nome_time": "Red Bull Racing",
      "pontos": 285.0,
      "vitorias": 2
    }
  ],
  "meta": {
    "fonte": "Ergast Developer API / Jolpica F1 Mirror (F1 Official Data)",
    "timestamp": "2026-08-30T00:50:00.000Z",
    "versao": "1.0.0"
  }
}
```

### Exemplo 2: `GET /pilotos/max_verstappen`
```json
{
  "status": "success",
  "total": 1,
  "data": {
    "id_piloto": "max_verstappen",
    "codigo_piloto": "VER",
    "numero_permanente": 1,
    "nome_completo": "Max Verstappen",
    "nacionalidade": "Dutch",
    "estatisticas": {
      "total_corridas": 3,
      "total_vitorias": 3,
      "total_podios": 3,
      "total_pontos": 75.0,
      "posicao_media_grid": 1.0,
      "posicao_media_final": 1.0
    }
  },
  "meta": {
    "fonte": "Ergast Developer API / Jolpica F1 Mirror (F1 Official Data)",
    "timestamp": "2026-08-30T00:50:00.000Z",
    "versao": "1.0.0"
  }
}
```

---

## 🧪 Testes e Quality Gate (Auditoria de Dados)

O pipeline conta com um validador de integridade e qualidade de dados automatizado em `scripts/validate_data.py`:

```bash
python3 scripts/validate_data.py
```

### Resultado da Auditoria:
```
=================================================================
🔍 AUDITORIA E VALIDAÇÃO DE QUALIDADE - F1 DATA API
=================================================================
✅ [TESTE 1/5] Integridade de Chaves Estrangeiras: 100% VÁLIDA (Zero violações)
✅ [TESTE 2/5] Carga de Dados:
    - Temporadas: 4
    - Corridas: 12
    - Pilotos: 10
    - Construtores/Times: 10
    - Resultados Individuais: 15
✅ [TESTE 3/5] Qualidade de Campos Obrigatórios: Sem nulos em chaves e nomes
✅ [TESTE 4/5] Regra de Negócio: Exatamente 1 vencedor por corrida
✅ [TESTE 5/5] Reconciliação Top 3 Pilotos: Pontuações 100% auditadas com a FIA
-----------------------------------------------------------------
🏁 RESULTADO DA AUDITORIA: 5/5 testes passaram com sucesso!
=================================================================
```

---

## 🚀 Como Executar o Projeto

### Opção 1: Execução com Docker (Recomendada)

```bash
# 1. Clonar o repositório
git clone https://github.com/Nayanearaujo/F1-racing-data-api.git
cd F1-racing-data-api

# 2. Subir o container da aplicação
docker compose up --build -d

# 3. Testar no terminal:
curl http://localhost:3000/
curl "http://localhost:3000/ranking?temporada=2023&tipo=pilotos"
```

---

### Opção 2: Execução Local

```bash
# 1. Pré-requisitos: Node.js 18+ e Python 3.9+

# 2. Executar o Pipeline de Dados (ETL)
python3 scripts/etl_transform_load.py

# 3. Validar a qualidade dos dados
python3 scripts/validate_data.py

# 4. Instalar dependências e rodar a API
npm install
npm run dev
```

---

## 🗂️ Estrutura do Repositório

```
f1-racing-data-api/
├── data/
│   ├── raw/                        # Dados brutos extraídos em JSON (Camada Bronze)
│   └── processed/                  # Banco f1_database.sqlite modelado (Camada Gold)
├── docs/
│   ├── assets/                     # Imagens e banners do projeto
│   │   ├── banner.jpg              # Banner temático F1
│   │   └── architecture.jpg        # Diagrama da arquitetura de dados
│   ├── arquitetura.md              # Detalhamento da arquitetura técnica
│   ├── dicionario_dados.md         # Dicionário de dados completo
│   ├── governanca_lgpd.md          # Política de LGPD e governança
│   └── auditoria_metricas.sql      # Queries SQL de validação
├── scripts/
│   ├── etl_ingestion.py            # Ingestão de dados da Ergast F1 API
│   ├── etl_transform_load.py       # Transformação, métricas e carga no SQLite
│   └── validate_data.py            # Auditoria e validação de regras de negócio
├── src/
│   ├── db.ts                       # Conexão otimizada com SQLite
│   ├── index.ts                    # Configuração e inicialização do servidor Fastify
│   ├── routes/                     # Rotas modulares REST
│   └── types/                      # Interfaces TypeScript
├── Dockerfile                      # Build multi-stage para produção
├── docker-compose.yml              # Orquestração do container
├── package.json                    # Dependências Fastify e TypeScript
├── tsconfig.json                   # Configurações do compilador TS
├── requirements.txt                # Dependências Python
└── README.md                       # Documentação principal
```

---

## 👩‍💻 Autoria

Desenvolvido por **[Nayane Araujo](https://github.com/Nayanearaujo)** como projeto prático integrador para o **Bootcamp Sem Parar Corpay (DIO)** e a **Pós-Graduação em Engenharia de Dados e Inteligência Artificial** (Anhanguera).
