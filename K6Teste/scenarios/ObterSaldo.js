import http from "k6/http";
import { sleep, check, fail } from "k6";
import { Trend, Rate, Gauge, Counter } from "k6/metrics";

// Métricas
let latencia = new Trend("latencia_media");       // Tempo de resposta médio
let sucesso = new Rate("req_sucesso");            // Percentual de requisições bem-sucedidas
let concorrencia = new Gauge("usuarios_ativos");  // Usuários simultâneos ativos
let contadorReqs = new Counter("total_reqs");     // Total de requisições

// Configuração do teste
export const options = {
  vus: 10,            
  duration: "30s",    
  thresholds: {
    "req_sucesso": ["rate>0.95"],      // >=95% das requisições devem ter sucesso
    "latencia_media": ["p(95)<500"]    // 95% das requisições < 500ms
  }
};

const URL = "http://127.0.0.1:8000/saldo"; 


export default function () {
  // Marca a concorrência atual
  concorrencia.add(__VU);

  // Realiza a requisição 
  const res = http.get(URL);

  // Conta a requisição
  contadorReqs.add(1);

  // Verifica se a resposta foi OK
  const ok = check(res, {
    "status 200": (r) => r.status === 200
  });
  sucesso.add(ok);

  // Falha crítica se a requisição não for bem-sucedida
  if (!ok) {
    fail(`Falha na requisição para ${URL}: status ${res.status}`);
  }

  // Registra a latência
  latencia.add(res.timings.duration);

  
  sleep(1);
}
