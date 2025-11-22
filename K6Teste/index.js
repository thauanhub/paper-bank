import ObterSaldo from "./scenarios/ObterSaldo.js";
import TransferirPix from "./scenarios/TransferirPix.js";
import RegistrarCliente from "./scenarios/RegistrarCliente.js";
import { group, sleep } from "k6";

export default function () {
    group('Obter Saldo', () => {
        ObterSaldo();
    });

    group('Transferir PIX', () => {
        TransferirPix();
    });

    group('Registrar Cliente', () => {
        RegistrarCliente();
    });

    sleep(1);
}
