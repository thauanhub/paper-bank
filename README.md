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
cd frontend
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

#### 6.2. Resultados do Terminal

<img width="1142" height="924" alt="Captura de tela 2025-11-24 181655" src="https://github.com/user-attachments/assets/b677f526-ad62-4cbf-890c-958e3c5653fc" />

---

#### 6.3. Medições do SLA

##### a) Serviço: Obter Saldo
- **Tipo**: Leitura  
- **Arquivos Envolvidos**: [auth.py](https://github.com/thauanhub/paper-bank/blob/main/backend/auth.py)  
- **Repositório de Medição**: [TestesDeCargaK6-PaperBank](https://github.com/GbosDev/TestesDeCargaK6-PaperBank.git)  
- **Data**: 16/11/2025  
- **Configurações**: Intel i5-1235U, 16GB RAM, Node.js v25.2.1, MySQL + MongoDB  

**Resultados**:
- Latência média: 30.37 ms (p95: 129.71 ms)  
- Vazão: 6.16 req/s  
- Concorrência: 1 req simultânea por VU  

##### b) Serviço: Registrar Cliente
- **Tipo**: Inserção  
- **Arquivos Envolvidos**: [auth.py](https://github.com/thauanhub/paper-bank/blob/main/backend/auth.py)  
- **Repositório de Medição**: [TestesDeCargaK6-PaperBank](https://github.com/GbosDev/TestesDeCargaK6-PaperBank.git)  
- **Data**: 16/11/2025  
- **Configurações**: Intel i5-1235U, 16GB RAM, Node.js v25.2.1, MySQL + MongoDB  

**Resultados**:
- Latência média: 543.15 ms (p95: 713.83 ms)  
- Vazão: 6.16 req/s  
- Concorrência: 1 req simultânea por VU  

---

#### 6.4. Análise dos Resultados

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

#### 6.5. Conclusão e Pontos Críticos

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

**Desenvolvido por**:  
Rhuan Soares, Thauan Fabrício, Gabriel de Oliveira  
**UNIRIO**

