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
  carregando: boolean = false;

  // 1. Variáveis (incluindo as novas)
  nome: string = '';
  cpf: string = '';
  email: string = '';
  dataNascimento: string = ''; 
  senha: string = '';
  endereco: string = ''; // Novo
  telefone: string = ''; // Novo

  cadastrar() {
    const erro = this.validarFormulario();
    if (erro) {
      alert(erro);
      return;
    }

    this.carregando = true;

    // 2. PREPARA O PACOTE PARA O BACKEND
    // O segredo está aqui: As chaves deste objeto têm de ser iguais ao teu schemas.py
    const novoCliente = {
      idCliente: 0,
      nome: this.nome,
      cpf: this.limparCPF(this.cpf),
      email: this.email,
      senha: this.senha,
      
      // Novos campos:
      endereco: this.endereco,
      telefone: this.telefone,
      
      // ATENÇÃO AQUI:
      // Se no teu schemas.py está 'data_nascimento' (com underline), muda aqui.
      // Se no teu schemas.py está 'dataNascimento' (sem underline), deixa assim.
      // Pelo teu código Python (cliente_in.dataNascimento), parece ser assim:
      data_nascimento: this.dataNascimento,
      fk_idGerente: 0
    };

    console.log("Enviando para o servidor:", novoCliente); // Debug para veres o que está indo

    // 3. ENVIA (Confere se a rota é /clientes ou /registrar)
    this.http.post(' http://127.0.0.1:8000/auth/registrar', novoCliente)
      .subscribe({
        next: (resposta) => {
          console.log("Resposta do servidor:", resposta);
          alert("Conta criada com sucesso! Seu número de conta foi gerado.");
          this.router.navigate(['']);
        },
        error: (err) => {
          console.error("Erro no cadastro:", err);
          // O backend retorna o motivo no 'detail'
          const mensagemErro = err.error.detail || "Erro desconhecido ao cadastrar.";
          alert("Falha: " + mensagemErro);
          this.carregando = false;
        }
      });
  }

  // ... (mantenha as funções validarFormulario, limparCPF e validarCPF aqui)
  
  // Só não esqueça de adicionar a validação dos novos campos no validarFormulario:
  validarFormulario(): string | null {
    // A. Verifica se TUDO está preenchido
    if (!this.nome || !this.cpf || !this.endereco || !this.telefone || !this.email || !this.senha || !this.dataNascimento) {
      return "Por favor, preencha todos os campos.";
    }

    // B. Valida Email
    if (!this.email.includes('@') || !this.email.includes('.')) {
      return "Por favor, insira um e-mail válido.";
    }

    // C. Valida Senha
    if (this.senha.length < 6) {
      return "A senha deve ter pelo menos 6 caracteres.";
    }

    // D. Valida CPF
    if (!this.validarCPF(this.cpf)) {
      return "CPF inválido. Verifique os números.";
    }

    return null;
  }

  // --- Funções Auxiliares de CPF (iguais ao anterior) ---
  limparCPF(cpf: string): string {
    return cpf.replace(/\D/g, '');
  }

  validarCPF(cpf: string): boolean {
    const strCPF = this.limparCPF(cpf);
    if (strCPF.length !== 11) return false;
    if (/^(\d)\1+$/.test(strCPF)) return false;
    let soma = 0, resto;
    for (let i = 1; i <= 9; i++) soma += parseInt(strCPF.substring(i-1, i)) * (11 - i);
    resto = (soma * 10) % 11;
    if ((resto == 10) || (resto == 11)) resto = 0;
    if (resto != parseInt(strCPF.substring(9, 10))) return false;
    soma = 0;
    for (let i = 1; i <= 10; i++) soma += parseInt(strCPF.substring(i-1, i)) * (12 - i);
    resto = (soma * 10) % 11;
    if ((resto == 10) || (resto == 11)) resto = 0;
    if (resto != parseInt(strCPF.substring(10, 11))) return false;
    return true;
  }
}