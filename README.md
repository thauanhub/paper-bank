# 🏦 PaperBank

Bem-vindo ao **PaperBank**! Este é um projeto de banco digital desenvolvido como uma Single Page Application (SPA) utilizando **Angular**.

Siga os passos abaixo para baixar, configurar e rodar o projeto na sua máquina.

---

## 📋 Pré-requisitos

Antes de começar, certifique-se de que tem instalado no seu computador:

1.  **[Node.js](https://nodejs.org/)** (Versão LTS recomendada).
2.  **[Git](https://git-scm.com/)**.
3.  **Angular CLI** (Opcional, mas recomendado):
    ```bash
    npm install -g @angular/cli
    ```

---

## 🚀 Como rodar o projeto

### 1. Clonar o repositório
Abra o seu terminal (CMD, PowerShell ou Terminal do VS Code) e rode o comando abaixo para baixar o código:

```bash
git clone [https://github.com/thauahub/paper-bank.git](https://github.com/SEU-USUARIO/paper-bank.git)
```

### 2. Entrar na pasta do projeto

```bash
cd paper-bank
cd src
```

### 3. Instalar as dependências

```bash
npm install
```
(Aguarde o fim da instalação)

### 4. Instalar as dependências

```bash
ng serve
```

Se o comando ng não for reconhecido, utilize:

```bash
npm start
```
### 5. Acessar o site
Assim que aparecer a mensagem "Compiled successfully", abra o seu navegador e acesse:

👉 http://localhost:4200

### 6. Relatório: 1° Medição dos Testes de Carga

---

#### 6.1. Objetivos do Projeto

##### 6.1.1. Objetivo Geral
Realizar a análise de desempenho de serviços internos do sistema através de testes de carga, identificando métricas críticas de performance e propondo hipóteses para possíveis gargalos.

##### 6.1.2. Objetivos Específicos
- Selecionar um conjunto mínimo de dois serviços internos para análise, garantindo que pelo menos um deles execute operações de escrita no banco de dados.
- Projetar e executar testes de carga nos serviços selecionados, submetendo-os a diferentes cenários de demanda.
- Coletar e analisar métricas de desempenho durante os testes, incluindo:
  - Latência (tempo médio de resposta)
  - Vazão (requisições processadas por segundo em intervalos específicos: 1s, 5s, 10s, 30s e 1min)
  - Capacidade de concorrência (número máximo de requisições simultâneas suportadas)

---

### 6.2. Resultados do Terminal

<img width="1142" height="924" alt="Captura de tela 2025-11-24 181655" src="https://github.com/user-attachments/assets/b677f526-ad62-4cbf-890c-958e3c5653fc" />

---

### 6.3. Medições do SLA

##### a) Serviço: Obter Saldo
- **Tipo**: Leitura  
- **Arquivos Envolvidos**: [auth.py](https://github.com/thauanhub/paper-bank/blob/main/backend/auth.py)  
- **Repositório de Medição**: [TestesDeCargaK6-PaperBank](https://github.com/GbosDev/TestesDeCargaK6-PaperBank.git)  
- **Data**: 23/11/2025  
- **Configurações**: Intel i5-1235U, 16GB RAM, Node.js v25.2.1, MySQL + MongoDB  

**Resultados**:
- Latência média: 30.37 ms (p95: 129.71 ms)  
- Vazão: 6.16 req/s  
- Concorrência: 1 req simultânea por VU  

##### b) Serviço: Registrar Cliente
- **Tipo**: Inserção  
- **Arquivos Envolvidos**: [auth.py](https://github.com/thauanhub/paper-bank/blob/main/backend/auth.py)  
- **Repositório de Medição**: [TestesDeCargaK6-PaperBank](https://github.com/GbosDev/TestesDeCargaK6-PaperBank.git)  
- **Data**: 23/11/2025  
- **Configurações**: Intel i5-1235U, 16GB RAM, Node.js v25.2.1, MySQL + MongoDB  

**Resultados**:
- Latência média: 543.15 ms (p95: 713.83 ms)  
- Vazão: 6.16 req/s  
- Concorrência: 1 req simultânea por VU  

---

### 6.4. Análise dos Resultados

##### 6.4.1. Latência × Tempo

<img width="990" height="564" alt="Captura de tela 2025-11-24 184551" src="https://github.com/user-attachments/assets/c030bbe0-01fb-49ff-9938-a4595ece3451" />

- A operação `GET /saldo` manteve-se rápida e estável (média: 30.38 ms).  
- A operação `POST /registrar` foi significativamente mais lenta (média: 543.15 ms) e com maior variação.  
- Comportamento esperado, uma vez que operações de escrita são naturalmente mais lentas.

##### 6.4.2. Vazão × Tempo

<img width="986" height="624" alt="Captura de tela 2025-11-24 190814" src="https://github.com/user-attachments/assets/90d231f0-9f65-432c-a59e-59b6e0c8160d" />

- Média de vazão: 12.36 req/s  
- Foram observadas flutuações frequentes, indicando instabilidade no throughput.  
- Possíveis causas: limitações na conexão com o banco ou alocação de recursos.

##### 6.4.3. Concorrência × Tempo

<img width="985" height="719" alt="Captura de tela 2025-11-24 194147" src="https://github.com/user-attachments/assets/a963ed63-074f-4f32-820c-2861296ccce6" />

- Comportamento estável para ambas as operações.  
- Aproximadamente 1 requisição simultânea processada por vez.  
- Sistema gerencia bem a distribuição entre operações rápidas e lentas.

---

### 6.5. Conclusão e Pontos Críticos

##### ✅ Pontos Positivos
- 100% das requisições processadas com sucesso.  
- Sistema confiável sob carga.

##### ⚠️ Pontos de Melhoria
1. **Operações de registro com desempenho limitado**  
   - Latência elevada no endpoint de registro.  
   - Possíveis gargalos em transações de banco ou validações.

2. **Instabilidade na vazão**  
   - Flutuações no número de req/s sob carga contínua.

3. **Capacidade limitada de processamento simultâneo**  
   - Baixa concorrência pode indicar restrições na arquitetura.

##### 🚀 Próximas Prioridades
1. Otimizar operações de registro (transações de banco).  
2. Revisar configuração de pools de conexão e recursos.  
3. Avaliar implementação de processamento assíncrono.  
4. Realizar testes de estresse para avaliar escalabilidade.

---

**Resumo**: O sistema apresenta base sólida, mas requer ajustes para melhorar o desempenho em operações de escrita e garantir vazão estável sob carga.

---

### 7. Relatório: 2° Medição dos Testes de Carga

---

#### 7.1. Objetivo Geral

Este documento demonstra o segundo teste de carga a fim de comparação entre os resultados de dois testes realizados sequencialmente no sistema.  
O 1° teste representa a configuração inicial, enquanto o 2° teste foi executado após a implementação de otimizações de performance e a adição de um novo endpoint (`DELETE /conta/excluir`).

A comparação direta dos dados permite avaliar o impacto das melhorias técnicas na capacidade de resposta e estabilidade do sistema sob carga.  
Ambos os testes mantiveram uma taxa de sucesso de **100%** em todas as requisições, demonstrando a robustez da aplicação mesmo com a expansão de funcionalidades.

Os resultados a seguir detalham a análise dos ajustes, focando em métricas críticas como **latência, vazão e concorrência** entre os dois cenários.

---

## 7.2. Descrição das Otimizações

### 7.2.1. Otimização da Consulta de Saldo
- Implementação de query seletiva utilizando `load_only` para retornar exclusivamente as colunas necessárias, reduzindo a complexidade computacional.
- Remoção da conversão redundante do saldo para `float()`, preservando a integridade dos dados no formato original.

### 7.2.2. Otimização do Processo de Registro
- Implementação de **processamento assíncrono de logs** mediante integração da biblioteca `BackgroundTasks`, permitindo que a geração de logs ocorra após a confirmação de sucesso, sem bloquear requisições subsequentes.
- Unificação das operações de banco relacionadas às entidades *Cliente* e *Conta*, substituindo múltiplos commits por `db.flush()` para garantir geração de IDs, com um único `db.commit()` final para minimizar operações de escrita.

---

## 7.3. Resultado das Medições Comparativamente

### 7.3.1. Resultado no Terminal

<img width="1047" height="812" alt="T2" src="https://github.com/user-attachments/assets/1e889e31-6aa2-4268-a2d3-46cea6f8de00" />

---

### 7.3.2. Medições do SLA

**Serviço:** Obter Saldo (`ObterSaldo.js`)  
**Tipo de operação:** leitura  
**Arquivos envolvidos:**  
- Backend: `auth.py`  
- Código de medição SLA: repositório de testes K6  
**Configurações:**  
12th Gen Intel Core i5-1235U, 16 GB RAM, 64 bits, Node.js v25.2.1, MySQL + MongoDB

---

### 📊 Medição 1  
- **Data:** 23/11/2025  
- **Latência:** 30.37 ms (média), 129.71 ms (p95)  
- **Vazão:** 6.16 req/s  
- **Concorrência:** 1 VU

**Potenciais gargalos:**
- Consultas não otimizadas retornando mais dados que o necessário.  
- Overhead na conversão/manipulação dos dados.  
- Picos iniciais indicando falta de mecanismos de aquecimento (cache/preload).

---

### 📊 Medição 2  
- **Data:** 30/11/2025  
- **Latência:** 30.11 ms (média), 120.100 ms (p95)  
- **Vazão:** 0.7761 req/s  
- **Concorrência:** 1 VU  

---

### Gráfico comparativo: Latência

<img width="1233" height="660" alt="Captura de tela 2025-12-05 182829" src="https://github.com/user-attachments/assets/8d25622b-9501-4d68-bc63-32d03aa61230" />


**Análises:**
- Redução clara dos picos de latência no Teste 2.  
- Curvas com menor dispersão e maior estabilidade.  
- O uso de `load_only` e remoção de conversões desnecessárias reduziram a variação.

---

### Melhorias/Otimizações  
**Melhorias**
- Query Seletiva com o load_only:  
  1) Retorna apenas as colunas necessárias para a consulta, diminuindo complexidade computacional.  
  2) Remoção de conversão do saldo para float(): desnecessária para garantir integridade dos dados.

**Arquivo modificado**
- https://github.com/thauanhub/paper-bank/blob/main/backend/main.py

---

## Serviço: Registrar Cliente (`RegistrarCliente.js`)
**Tipo de operação:** inserção  
**Arquivos envolvidos:** backend `auth.py`, repositório K6  
**Configurações:** mesmas do teste anterior

---

### 📊 Medição 1  
- **Data:** 23/11/2025  
- **Latência:** 543.154 ms (média), 713.834 ms (p95)  
- **Vazão:** 6.16 req/s  
- **Concorrência:** 1 VU  

**Potenciais gargalos:**
- Múltiplas operações de gravação (commits redundantes).  
- Log síncrono atrasando respostas.  
- Validações repetidas aumentando o tempo total.

---

### 📊 Medição 2  
- **Data:** 30/11/2025  
- **Latência:** 520.851 ms (média), 799.90 ms (p95)  
- **Vazão:** 0.7761 req/s  
- **Concorrência:** 1 VU  

---

### Gráfico comparativo: Latência

<img width="923" height="474" alt="Captura de tela 2025-12-09 161544" src="https://github.com/user-attachments/assets/86b0d0e2-440d-4e05-a259-32351bdf098f" />


**Análises:**
- Teste 2 com maior estabilidade e menor oscilação.  
- Menor variação entre picos e quedas.  
- Commit único e logs assíncronos reduziram bloqueios internos.

---

### Melhorias/Otimizações  
**Melhorias**
- Processamento assíncrono de logs:  
  1) Importando a biblioteca BackgroundTasks que realiza o log através de uma função auxiliar após o retorno de sucesso sem bloquear a próxima requisição.  
  2) Unificação de operações Cliente e Conta para o banco de dados:  
     - Havia mais de um commit na sessão no banco de dados, substituído pelo `db.flush()` para garantir que os ids sejam gerados e apenas no final seja realizado o `db.commit()`.

**Arquivo modificado**
- https://github.com/thauanhub/paper-bank/blob/main/backend/auth.py


---

### Outros gráficos comparativos:

### Gráfico comparativo: Throughput

<img width="926" height="486" alt="Captura de tela 2025-12-09 161602" src="https://github.com/user-attachments/assets/5179295f-c1ee-437f-8546-0ed897c6fc1d" />


### Gráfico comparativo: Concorrência

<img width="925" height="505" alt="Captura de tela 2025-12-09 161614" src="https://github.com/user-attachments/assets/c8ed8279-7767-4556-9bb0-7ac72657806f" />


---

## Serviço: Excluir Conta (`ExcluirConta.js`)
**Tipo de operação:** remoção  
**Arquivos envolvidos:** backend `auth.py`, repositório K6  
**Configurações:** mesmas anteriores

---

### 📊 Medição 1  
- **Data:** 23/11/2025  
- **Latência:** 378.77 ms (média), 492.52 ms (p95)  
- **Vazão:** 0.783 req/s  
- **Concorrência:** 1 VU  

**Potenciais gargalos:**
- Verificação + remoção múltipla (Cliente + Conta).  
- Possível falta de indexação.  
- Escritas finais no banco podem variar com concorrência.

---

# 7.4. Análise completa dos novos resultados do teste de carga

## 7.4.1. Gráfico de Latência × Tempo

<img width="1183" height="606" alt="Captura de tela 2025-11-30 130721" src="https://github.com/user-attachments/assets/70331d81-3104-4125-9a6b-107b2b380861" />

**Registrar Cliente**
- Executado principalmente no início e meio do teste.  
- Latência média entre 320–500 ms.  
- Picos de ~1000 ms.

**Obter Saldo**
- Extremamente rápido: 5–40 ms após estabilização.  
- Pequenos picos iniciais (~300 ms).  
- Excelente estabilidade.

**Excluir Conta**
- Executado mais no final.  
- Latências entre 300–450 ms, picos de ~600 ms.

### Conclusão
- **obter_saldo**: desempenho excelente.  
- **registrar_cliente**: mais sensível à carga.  
- **excluir_conta**: intermediário e estável.  
- Com 10 VUs, o sistema responde adequadamente.

---

## 7.4.2. Gráfico de Vazão (req/s) × Tempo

<img width="1232" height="683" alt="Captura de tela 2025-11-30 130738" src="https://github.com/user-attachments/assets/f30fc0be-51e6-4a88-a1f8-3c8f9aa9b70e" />

**Registrar Cliente**
- Entre 1 e 10 req/s, com alta variação.

**Obter Saldo**
- Forte atividade no meio do teste.  
- Picos próximos a 10 req/s.

**Excluir Conta**
- Vazão constante entre 2–4 req/s.

### Conclusão
- Vazão coerente com custo dos endpoints.  
- Sistema não saturou.  
- Endpoints rápidos ⇒ maior vazão; lentos ⇒ menor vazão.

---

## 7.4.3. Gráfico de Concorrência × Tempo

<img width="1185" height="576" alt="Captura de tela 2025-11-30 130638" src="https://github.com/user-attachments/assets/6b8c9bca-fcee-43d0-8289-5a6fc9929575" />

- VUs sobem para 10 rapidamente e permanecem estáveis.  
- Concorrência fixa: carga constante.  
- Nenhuma evidência de saturação.

### Conclusão
- O sistema absorveu 10 VUs sem queda.  
- Latência alta em `registrar_cliente` é natural e não gargalo de concorrência.

---

## 7.5. Conclusão Geral dos Testes

Os testes demonstram impacto positivo das otimizações aplicadas:

- **Medição 1:**  
  Latência mais irregular, vazão inconsistente e maior imprevisibilidade.

- **Medição 2:**  
  Redução de picos, maior estabilidade e melhor distribuição de custo.

**Destaques:**
- `obter_saldo`: extremamente estável após otimizações.  
- `registrar_cliente`: operação mais fluida com logs assíncronos e commit único.  
- `excluir_conta`: desempenho sólido sob 10 VUs.

**Conclusão final:**  
O sistema evoluiu de forma significativa em responsividade, estabilidade e previsibilidade, mantendo **100% de sucesso** nas requisições e criando base sólida para novos ciclos de otimização e escalabilidade.

--- 

**Desenvolvido por**:  
Rhuan Soares, Thauan Fabrício, Gabriel de Oliveira  
**UNIRIO**

