import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HomeComponent } from './home/home'; 
import { Header } from './header/header';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Header], // Apenas a Home é necessária aqui
  templateUrl: './app.html',
  styleUrl: './app.css'
})
// MUDANÇA IMPORTANTE AQUI EM BAIXO:
// O nome da classe deve ser 'App' para bater certo com o teu main.ts
export class App {
  title = 'paper-bank';
}