import { Component } from '@angular/core';
// Removi o RouterOutlet porque não estamos a usar rotas, apenas a Home direta
import { HomeComponent } from './home/home'; 

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [HomeComponent], // Apenas a Home é necessária aqui
  templateUrl: './app.html',
  styleUrl: './app.css'
})
// MUDANÇA IMPORTANTE AQUI EM BAIXO:
// O nome da classe deve ser 'App' para bater certo com o teu main.ts
export class App {
  title = 'paper-bank';
}