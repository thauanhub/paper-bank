import http from "k6/http";
import { sleep, check, fail } from "k6";
import { Trend, Rate, Gauge, Counter } from "k6/metrics";

// Métricas
let latencia = new Trend("latencia_media");
let sucesso = new Rate("req_sucesso");
let concorrencia = new Gauge("usuarios_ativos");
let contadorReqs = new Counter("total_reqs");

export const options = {
  vus: 10,
  duration: "30s",
  thresholds: {
    "req_sucesso": ["rate>0.95"],
    "latencia_media": ["p(95)<500"]
  }
};

const URL = "http://127.0.0.1:8000/transferir-pix";

function gerarChaveEmail() {
    return `teste${Math.floor(Math.random()*10000)}@email.com`;
}

export default function () {
    concorrencia.add(__VU);

    const payload = JSON.stringify({
        chave_pix: gerarChaveEmail(),
        tipo_chave: "EMAIL",
        valor: Math.floor(Math.random()*1000) + 1,  // valor aleatório entre 1 e 1000
        senha: "1234"
    });

    const params = { headers: { "Content-Type": "application/json" } };

    const res = http.post(URL, payload, params);

    contadorReqs.add(1);

    const ok = check(res, {
        "status 200": (r) => r.status === 200,
        "transferência realizada": (r) => r.body.includes("sucesso")
    });
    sucesso.add(ok);

    if (!ok) {
        fail(`Falha na requisição para ${URL}: status ${res.status}`);
    }

    latencia.add(res.timings.duration);

    sleep(1);
}
