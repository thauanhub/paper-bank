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

const URL = "http://127.0.0.1:8000/auth/registrar";

function gerarCpf() {
    return `${Math.floor(Math.random()*999)}.${Math.floor(Math.random()*999)}.${Math.floor(Math.random()*999)}-${Math.floor(Math.random()*99)}`;
}

function gerarEmail() {
    return `teste${Math.floor(Math.random()*10000)}@email.com`;
}

export default function () {
    concorrencia.add(__VU);

    const payload = JSON.stringify({
        nome: `Usuario ${Math.floor(Math.random()*1000)}`,
        cpf: gerarCpf(),
        senha: "1234",
        endereco: `Rua Teste, ${Math.floor(Math.random()*1000)}`,
        telefone: `21${Math.floor(900000000 + Math.random()*99999999)}`,
        email: gerarEmail(),
        dataNascimento: "1990-01-01",
        fk_idGerente: 1
    });

    const params = { headers: { "Content-Type": "application/json" } };

    const res = http.post(URL, payload, params);

    contadorReqs.add(1);

    const ok = check(res, {
        "status 200": (r) => r.status === 200,
        "cliente registrado": (r) => r.body.includes("idCliente")
    });
    sucesso.add(ok);

    if (!ok) {
        fail(`Falha na requisição para ${URL}: status ${res.status}`);
    }

    latencia.add(res.timings.duration);

    sleep(1);
}
