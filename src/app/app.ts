import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './header/header';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Header],
  // O erro estava aqui em baixo, ele deve apontar para app.html
  templateUrl: './app.html', 
  styleUrl: './app.css'
})
// O erro TS2305 acontecia porque o nome aqui estava errado
export class App { 
  title = 'paper-bank';
}