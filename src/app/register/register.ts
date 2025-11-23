import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink], 
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  private http = inject(HttpClient);
  private router = inject(Router);

  nome: string = '';
  cpf: string = '';
  email: string = '';
  dataNascimento: string = ''; 
  senha: string = '';

  // --- FUNÇÃO PRINCIPAL DE CADASTRO ---
  cadastrar() {
    // 1. Executa todas as validações
    const erro = this.validarFormulario();
    
    if (erro) {
      alert(erro); // Mostra o erro na tela
      return;      // PARA TUDO! Não envia nada para o backend.
    }

    // 2. Se passou, monta o objeto
    const novoCliente = {
      nome: this.nome,
      cpf: this.limparCPF(this.cpf), // Envia apenas números
      email: this.email,
      data_nascimento: this.dataNascimento,
      senha: this.senha
    };

    // 3. Envia
    this.http.post('http://localhost:8000/clientes', novoCliente)
      .subscribe({
        next: () => {
          alert("Cadastro realizado com sucesso!");
          this.router.navigate(['/login']);
        },
        error: (err) => {
          console.error(err);
          alert("Erro ao cadastrar. Verifique se o CPF ou Email já existem.");
        }
      });
  }

  // --- VALIDAÇÕES (O Cérebro do Frontend) ---

  validarFormulario(): string | null {
    // A. Verifica Vazios
    if (!this.nome || !this.cpf || !this.email || !this.senha || !this.dataNascimento) {
      return "Por favor, preencha todos os campos.";
    }

    // B. Valida Email (Regex simples)
    if (!this.email.includes('@') || !this.email.includes('.')) {
      return "Por favor, insira um e-mail válido.";
    }

    // C. Valida Tamanho da Senha
    if (this.senha.length < 6) {
      return "A senha deve ter pelo menos 6 caracteres.";
    }

    // D. Valida CPF (Algoritmo matemático)
    if (!this.validarCPF(this.cpf)) {
      return "CPF inválido. Verifique os números.";
    }

    return null; // Se chegou aqui, não tem erro!
  }

  // Função auxiliar para limpar pontuação (123.456 -> 123456)
  limparCPF(cpf: string): string {
    return cpf.replace(/\D/g, '');
  }

  // Algoritmo padrão de validação de CPF brasileiro
  validarCPF(cpf: string): boolean {
    const strCPF = this.limparCPF(cpf);
    
    if (strCPF.length !== 11) return false;
    
    // Verifica se todos os dígitos são iguais (ex: 111.111.111-11 é inválido mas passa no cálculo)
    if (/^(\d)\1+$/.test(strCPF)) return false;

    let soma = 0;
    let resto;

    // Validação do primeiro dígito
    for (let i = 1; i <= 9; i++) 
        soma = soma + parseInt(strCPF.substring(i-1, i)) * (11 - i);
    resto = (soma * 10) % 11;
    if ((resto == 10) || (resto == 11))  resto = 0;
    if (resto != parseInt(strCPF.substring(9, 10)) ) return false;

    // Validação do segundo dígito
    soma = 0;
    for (let i = 1; i <= 10; i++) 
        soma = soma + parseInt(strCPF.substring(i-1, i)) * (12 - i);
    resto = (soma * 10) % 11;
    if ((resto == 10) || (resto == 11))  resto = 0;
    if (resto != parseInt(strCPF.substring(10, 11) ) ) return false;

    return true;
  }
}