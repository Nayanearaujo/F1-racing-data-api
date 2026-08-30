# 🛡️ Governança de Dados e Conformidade com a LGPD

Este documento formaliza as práticas de Governança, Qualidade de Dados e Conformidade Legal adotadas na **F1 Racing Data API**, em conformidade com a **Lei Geral de Proteção de Dados (Lei nº 13.709/2018 - LGPD)** e boas práticas corporativas de Engenharia de Dados.

---

## 1. Avaliação de Impacto e Dados Pessoais (LGPD)

### 1.1 Natureza dos Dados Tratados
A **F1 Racing Data API** processa exclusivamente **dados públicos e históricos esportivos** de figuras públicas (atletas profissionais e escuderias).

- **Dados Tratados**: Nome público profissional, nacionalidade, data de nascimento pública esportiva, histórico de voltas e resultados esportivos.
- **Ausência de Dados Pessoais Sensíveis**: O projeto **NÃO** coleta, armazena ou processa nenhum dado sensível categorizado pelo Art. 5º, II da LGPD (dados de saúde, biométricos, religião, filiação partidária ou dados genéticos).
- **Sem Dados Financeiros ou de Contato**: Não há tratamento de documentos de identificação civil (CPF, RG, Passaporte), e-mails, endereços residenciais ou dados de pagamento.

### 1.2 Base Legal para Tratamento (Art. 7º da LGPD)
O processamento enquadra-se no tratamento de **dados tornados manifestamente públicos pelo titular** no âmbito de atividades desportivas profissionais públicas internacionais (Art. 7º, § 4º da Lei nº 13.709/2018), com finalidade estritamente acadêmica, analítica e educacional.

---

## 2. Princípios de Governança e Qualidade

### 2.1 Princípio da Minimização de Dados (Data Minimization)
Apenas as variáveis essenciais para o cálculo das métricas de desempenho esportivo são persistidas nas camadas Silver e Gold do banco de dados relacional SQLite.

### 2.2 Integridade e Reconciliação Contínua
- **Integridade Referencial**: Todas as chaves estrangeiras são estritamente validadas (`PRAGMA foreign_keys = ON;`).
- **Idempotência**: Todos os pipelines de ETL podem ser reexecutados a qualquer momento sem duplicar dados (`INSERT OR REPLACE`).
- **Validação Automatizada**: O script `scripts/validate_data.py` atua como pipeline de Quality Gate assegurando:
  - 100% de integridade referencial;
  - Ausência de nulos em campos obrigatórios;
  - Consistência lógica de vitórias e pódios.
