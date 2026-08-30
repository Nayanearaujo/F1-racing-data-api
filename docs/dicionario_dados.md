# 📖 Dicionário de Dados — F1 Racing Data API

Este documento descreve todas as entidades, campos, tipos, restrições e origens de dados do modelo dimensional da **F1 Racing Data API**.

---

## 1. Tabela: `dim_tempo` (Dimensão Tempo / Temporada)

Armazena as safras/temporadas oficiais da Fórmula 1.

| Campo | Tipo | Nulo? | Chave | Descrição | Origem |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `ano` | INTEGER | Não | PK | Ano da temporada oficial da Fórmula 1 (ex: 2023) | `MRData.SeasonTable.Seasons[].season` |
| `total_corridas` | INTEGER | Não | - | Total de grandes prêmios realizados na temporada | Campo derivado via agregação |
| `url_wiki` | TEXT | Sim | - | Link da Wikipédia para a temporada | `MRData.SeasonTable.Seasons[].url` |

---

## 2. Tabela: `dim_time` (Dimensão Construtores / Equipes)

Armazena os dados cadastrais das escuderias/construtores da F1.

| Campo | Tipo | Nulo? | Chave | Descrição | Origem |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id_time` | TEXT | Não | PK | Identificador único textual da equipe (ex: `red_bull`, `ferrari`) | `ConstructorTable.Constructors[].constructorId` |
| `nome_time` | TEXT | Não | - | Nome oficial da escuderia (ex: `Red Bull Racing`) | `ConstructorTable.Constructors[].name` |
| `nacionalidade` | TEXT | Sim | - | País de registro da equipe (ex: `Austrian`, `Italian`) | `ConstructorTable.Constructors[].nationality` |
| `url_wiki` | TEXT | Sim | - | Link de referência oficial | `ConstructorTable.Constructors[].url` |

---

## 3. Tabela: `dim_piloto` (Dimensão Pilotos)

Armazena os registros cadastrais públicos dos pilotos participantes.

| Campo | Tipo | Nulo? | Chave | Descrição | Origem |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id_piloto` | TEXT | Não | PK | Slug identificador do piloto (ex: `max_verstappen`, `hamilton`) | `DriverTable.Drivers[].driverId` |
| `codigo_piloto` | TEXT | Sim | - | Sigla oficial de 3 letras na cronometragem (ex: `VER`, `HAM`) | `DriverTable.Drivers[].code` |
| `numero_permanente` | INTEGER | Sim | - | Número de corrida fixo do piloto (ex: `1`, `44`) | `DriverTable.Drivers[].permanentNumber` |
| `nome_completo` | TEXT | Não | - | Nome completo formatado | `givenName + familyName` |
| `primeiro_nome` | TEXT | Sim | - | Primeiro nome | `DriverTable.Drivers[].givenName` |
| `sobrenome` | TEXT | Sim | - | Sobrenome | `DriverTable.Drivers[].familyName` |
| `data_nascimento` | TEXT | Sim | - | Data de nascimento no formato ISO `YYYY-MM-DD` | `DriverTable.Drivers[].dateOfBirth` |
| `nacionalidade` | TEXT | Sim | - | Nacionalidade do piloto | `DriverTable.Drivers[].nationality` |
| `url_wiki` | TEXT | Sim | - | Artigo biográfico da Wikipédia | `DriverTable.Drivers[].url` |

---

## 4. Tabela: `dim_corrida` (Dimensão Corridas / Grandes Prêmios)

Registra os Grandes Prêmios, pistas e localizações geográficas.

| Campo | Tipo | Nulo? | Chave | Descrição | Origem |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id_corrida` | TEXT | Não | PK | Identificador composto `{temporada}_{rodada}` (ex: `2023_1`) | Gerado no pipeline |
| `temporada` | INTEGER | Não | FK | Ano da temporada (ref. `dim_tempo.ano`) | `RaceTable.Races[].season` |
| `rodada` | INTEGER | Não | - | Número da etapa no calendário oficial (1, 2, 3...) | `RaceTable.Races[].round` |
| `nome_corrida` | TEXT | Não | - | Nome do Grande Prêmio (ex: `Bahrain Grand Prix`) | `RaceTable.Races[].raceName` |
| `circuito_id` | TEXT | Não | - | Identificador do autódromo (ex: `bahrain`, `interlagos`) | `Circuit.circuitId` |
| `nome_circuito` | TEXT | Não | - | Nome oficial do autódromo | `Circuit.circuitName` |
| `localidade` | TEXT | Sim | - | Cidade ou região do autódromo | `Circuit.Location.locality` |
| `pais` | TEXT | Sim | - | País onde a corrida ocorre | `Circuit.Location.country` |
| `latitude` | REAL | Sim | - | Coordenada geográfica (latitude) | `Circuit.Location.lat` |
| `longitude` | REAL | Sim | - | Coordenada geográfica (longitude) | `Circuit.Location.long` |
| `data_corrida` | TEXT | Sim | - | Data da corrida (`YYYY-MM-DD`) | `RaceTable.Races[].date` |
| `hora_corrida` | TEXT | Sim | - | Horário UTC da largada | `RaceTable.Races[].time` |
| `url_wiki` | TEXT | Sim | - | Artigo de cobertura da corrida | `RaceTable.Races[].url` |

---

## 5. Tabela: `fato_resultados` (Tabela Fato — Granularidade: Piloto x Corrida)

Registra o desempenho individual de cada piloto em cada Grande Prêmio.

| Campo | Tipo | Nulo? | Chave | Descrição | Origem / Cálculo |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id_resultado` | TEXT | Não | PK | Identificador único `{id_corrida}_{id_piloto}` | Gerado no pipeline |
| `id_corrida` | TEXT | Não | FK | Referência para `dim_corrida.id_corrida` | Pipeline |
| `temporada` | INTEGER | Não | FK | Referência para `dim_tempo.ano` | Ergast API |
| `rodada` | INTEGER | Não | - | Número da rodada | Ergast API |
| `id_piloto` | TEXT | Não | FK | Referência para `dim_piloto.id_piloto` | Ergast API |
| `id_time` | TEXT | Não | FK | Referência para `dim_time.id_time` | Ergast API |
| `grid_largada` | INTEGER | Sim | - | Posição de largada no grid | `Results[].grid` |
| `posicao_final` | INTEGER | Sim | - | Posição final oficial de chegada | `Results[].position` |
| `posicao_ordem` | INTEGER | Sim | - | Ordem de classificação numérica | `Results[].positionOrder` |
| `pontos` | REAL | Não | - | Pontuação conquistada na corrida | `Results[].points` |
| `voltas_completadas` | INTEGER | Sim | - | Número total de voltas percorridas | `Results[].laps` |
| `status_corrida` | TEXT | Sim | - | Status (ex: `Finished`, `Engine`, `Collision`) | `Results[].status` |
| `tempo_total_ms` | INTEGER | Sim | - | Tempo total de corrida em milissegundos | `Results[].Time.millis` |
| `tempo_total_formatado`| TEXT | Sim | - | Tempo formatado ou gap para o líder | `Results[].Time.time` |
| `melhor_volta_numero` | INTEGER | Sim | - | Volta em que marcou seu melhor tempo | `FastestLap.lap` |
| `melhor_volta_tempo` | TEXT | Sim | - | Tempo da volta mais rápida (ex: `1:13.422`) | `FastestLap.Time.time` |
| `melhor_volta_velocidade_media` | REAL | Sim | - | Velocidade média na melhor volta em km/h | `FastestLap.AverageSpeed.speed` |
| `diferenca_grid_posicao` | INTEGER | Não | - | Ganho/perda de posições: `grid_largada - posicao_final` | **Métrica Derivada** |
| `flag_vitoria` | INTEGER | Não | - | `1` se `posicao_final == 1`, senão `0` | **Métrica Derivada** |
| `flag_podio` | INTEGER | Não | - | `1` se `posicao_final <= 3`, senão `0` | **Métrica Derivada** |
| `flag_pontuou` | INTEGER | Não | - | `1` se `pontos > 0`, senão `0` | **Métrica Derivada** |

---

## 6. Tabelas: `fato_ranking_pilotos` & `fato_ranking_times`

Tabelas com os pontos acumulados e classificação final por temporada e construtor.
