import { Component } from '@angular/core';
import { Router } from '@angular/router'; // Para navegar após login
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Importante para os inputs
import { PaperBankService } from '../paper-bank.service';

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

  constructor(private router: Router, private pb: PaperBankService) {}

  // Base da API
  private apiBase = 'http://localhost:8000';

  fazerLogin() {
    // 1. Validação de FRONTEND (UX)
    if (this.email === '' || this.senha === '') {
      alert('Por favor, preencha todos os campos!');
      return;
    }

    const body = new URLSearchParams();
    body.set('username', this.email);
    body.set('password', this.senha);

    fetch(`${this.apiBase}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString()
    })
    .then(async res => {
      if (!res.ok) {
        let errDetail = 'Falha ao efetuar login';
        try { const j = await res.json(); errDetail = j.detail || j.message || JSON.stringify(j) || errDetail; } catch(_){}
        console.error('Login falhou, status:', res.status, 'body:', errDetail);
        alert(errDetail);
        return;
      }

      const data = await res.json();
      if (data && data.access_token) {
        localStorage.setItem('access_token', data.access_token);

        this.pb.carregarSaldo();
        // navegar para home (usamos navigateByUrl e logamos o resultado)
        this.router.navigateByUrl('/home')
          .then(ok => console.info('Navegação para /home:', ok))
          .catch(err => console.error('Erro ao navegar:', err));
      } else {
        alert('Resposta de login inválida do servidor');
      }
    })
    .catch(err => {
      console.error('Erro de rede no login:', err);
      alert('Erro de rede ao tentar fazer login');
    });
  }
  
  irParaCadastro() {
      // Lógica futura para ir para tela de cadastro
      //alert('Ir para tela de cadastro');
      this.router.navigate(['/register']);
  }
}