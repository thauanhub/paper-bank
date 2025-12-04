import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PaperBankService {
  private http = inject(HttpClient);
  private apiBase = 'http://localhost:8000';

  // Variáveis de Estado
  saldo: number = 0;
  nomeUsuario = '';
  
  // --- A VARIÁVEL QUE FALTAVA ---
  carregandoSaldo = false; 

  constructor() {}

  carregarSaldo() {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    // 1. Avisa que começou a carregar
    this.carregandoSaldo = true; 

    this.http.get<any>(`${this.apiBase}/saldo`, { headers: headers })
      .subscribe({
        next: (resposta) => {
          this.saldo = resposta.saldo;
          
          if (resposta.nome_cliente) {
            this.nomeUsuario = resposta.nome_cliente.split(' ')[0];
          }
          
          // 2. Avisa que terminou
          this.carregandoSaldo = false; 
        },
        error: (erro) => {
          console.error('Erro ao buscar saldo:', erro);
          
          // 3. Avisa que terminou (mesmo com erro)
          this.carregandoSaldo = false; 
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

    return this.http.post<any>(`${this.apiBase}/auth/redefinir-senha`, body, { headers });
  }

  // Método para PIX
  realizarPix(valor: number, chavePixDestino: string, senhaUsuario: string) {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    const body = {
      valor: valor,
      chave_pix: chavePixDestino,
      tipo_chave: "EMAIL",
      senha: senhaUsuario
    };

    return this.http.post<any>(`${this.apiBase}/transferir-pix`, body, { headers });
  }

  excluirConta(senha: string) {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    // O corpo que o Python espera (schemas.ContaExcluir)
    const body = { senha: senha };

    // Sintaxe especial para DELETE com Body no Angular
    return this.http.request('delete', `${this.apiBase}/conta/excluir`, { 
      body: body,
      headers: headers 
    });
  }

  listarCartoes() {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    return this.http.get<any[]>(`${this.apiBase}/cartoes`, { headers });
  }

  // 2. Criar (POST /cartao - Singular) <-- CORREÇÃO AQUI
  criarCartao() {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    
    // O teu backend espera um schema.CartaoCreate. 
    // Vamos enviar o limite e o tipo (mesmo que o back force crédito, o schema pode exigir o campo).
    const body = { 
        limite: 2000.0, 
        tipo: "CREDITO" 
    }; 

    // Nota: A URL aqui é /cartao (sem o S)
    return this.http.post<any>(`${this.apiBase}/cartao`, body, { headers });
  }

  obterExtrato() {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    
    // Chama a rota que definiste no Python
    return this.http.get<any[]>(`${this.apiBase}/extrato`, { headers });
  }

// No paper-bank.service.ts
  listarContatos() {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    // Esta rota tem de bater com o Python (/contatos)
    return this.http.get<any[]>(`${this.apiBase}/contatos`, { headers });
  }

}