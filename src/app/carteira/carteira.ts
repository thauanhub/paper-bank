import { Component, inject } from '@angular/core'; // Importa inject
import { CommonModule } from '@angular/common';
import { PaperBankService } from '../paper-bank.service'; // Importa o Service

@Component({
  selector: 'app-carteira',
  standalone: true,
  imports: [CommonModule], 
  templateUrl: './carteira.html',
  styleUrl: './carteira.css'
})
export class Carteira {
  // 1. Conecta ao cofre
  private paperBankService = inject(PaperBankService);

  // 2. Removemos a variável 'saldo = 1500' antiga.
  // 3. Criamos o Getter para ler do cofre
  get saldo(): number {
    return this.paperBankService.saldo;
  }

  meiosDePagamento: any[] = [];

  solicitarNovoCartao() {
    // ... lógica igual ...
    if (this.meiosDePagamento.length >= 1) {
      alert("Máximo 1 cartão!");
      return;
    }
    this.meiosDePagamento.push({
      tipo: 'Crédito',
      numero: '**** 8899',
      validade: '12/29'
    });
    alert("Cartão criado!");
  }
}