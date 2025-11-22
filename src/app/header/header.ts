import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router'; 
import { CommonModule } from '@angular/common'; 

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, CommonModule], 
  // Aqui sim deve apontar para header.html
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header {
  
  // Injetamos o Router para saber se é login
  constructor(public router: Router) {}

 ehPaginaLogin(): boolean {
    const url = this.router.url;
    
    // Esconde o menu se:
    // 1. Estiver na raiz '/' (Login)
    // 2. Estiver no '/cadastro'
    // 3. Estiver no '/login' (caso exista)
    return url === '/' || url.includes('/register') || url.includes('/login');
  }
}