import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PaperBankService {
  private http = inject(HttpClient);
  private apiBase = 'http://localhost:8000';

  // Variável que guarda o saldo para o site todo usar
  saldo: number = 0;
  nomeUsuario = '';

  constructor() {}

  carregarSaldo() {
    // 1. Pega o token que o Login salvou
    const token = localStorage.getItem('access_token');

    if (!token) return;

    // 2. Prepara o cabeçalho com a "carteira de identidade" (Token)
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    // 3. Faz o pedido ao FastAPI
    // (Certifique-se que a rota no Python é /saldo ou ajuste aqui)
    // ... dentro do carregarSaldo ...
    this.http.get<any>(`${this.apiBase}/saldo`, { headers: headers })
      .subscribe({
        next: (resposta) => {
          // A ATUALIZAÇÃO
          this.saldo = resposta.saldo; 

          if (resposta.nome_cliente) {
            // Divide o texto nos espaços e pega a primeira parte
            const primeiroNome = resposta.nome_cliente.split(' ')[0];
            this.nomeUsuario = primeiroNome;
          }
        },
        error: (erro) => {
          console.error('Erro ao buscar saldo:', erro);
        }
      });
  }

  // Método para redefinir a senha
  redefinirSenha(senhaAtual: string, novaSenha: string, confirmacao: string) {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    const body = {
      senha_atual: senhaAtual,
      nova_senha: novaSenha,
      confirmar_nova_senha: confirmacao
    };

    // Retorna o Observable para o componente lidar com sucesso/erro
    return this.http.post<any>(`${this.apiBase}/auth/redefinir-senha`, body, { headers });
  }

}