import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router'; 
import { CommonModule } from '@angular/common'; 

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, CommonModule], 
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header {
  
  constructor(public router: Router) {}

  ehPaginaLogin(): boolean {
    return this.router.url === '/' || this.router.url.includes('/login');
  }

  // --- FUNÇÃO DE LOGOUT ---
  logout() {
    // 1. Limpa o token de segurança
    localStorage.clear();
    
    // 2. Manda o usuário para a tela de login
    this.router.navigate(['/']);
  }
}