import { Component } from '@angular/core';
import { Router } from '@angular/router'; // Para navegar após login
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Importante para os inputs

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule], 
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  
  // Variáveis para guardar os dados
  email: string = '';
  senha: string = '';

  constructor(private router: Router) {}

  fazerLogin() {
    // 1. Validação de FRONTEND (UX)
    if (this.email === '' || this.senha === '') {
      alert("Por favor, preencha todos os campos!");
      return;
    }

    // 2. Simulação de envio para o Backend (FastAPI)
    console.log("Enviando para API:", this.email, this.senha);

    // Aqui, no futuro, faremos a chamada real para o FastAPI.
    // Por enquanto, vamos fingir que deu certo:
    
    alert("Login realizado com sucesso!");
    this.router.navigate(['/home']); // Redireciona para a Home
  }
  
  irParaCadastro() {
      // Lógica futura para ir para tela de cadastro
      alert("Ir para tela de cadastro");
      this.router.navigate(['/register']);
  }
}