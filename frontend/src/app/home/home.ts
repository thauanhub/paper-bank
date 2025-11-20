import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// 1. Definimos o "molde" de como é uma transação
interface Transacao {
  tipo: string;   // Ex: 'Transferência' ou 'Empréstimo'
  valor: number;
  data: Date;     // Data e hora
  entrada: boolean; // true se o dinheiro entra, false se sai
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomeComponent {
  saldoAtual: number = 1500.50;
  
  // 2. Criamos a lista (o caderno de anotações)
  historico: Transacao[] = [];

  exibirModalTransferencia: boolean = false;
  exibirModalEmprestimo: boolean = false;
  valorTransferencia: number | null = null;
  valorEmprestimo: number | null = null;

  abrirModalTransferencia() { this.exibirModalTransferencia = true; this.valorTransferencia = null; }
  fecharModalTransferencia() { this.exibirModalTransferencia = false; }
  abrirModalEmprestimo() { this.exibirModalEmprestimo = true; this.valorEmprestimo = null; }
  fecharModalEmprestimo() { this.exibirModalEmprestimo = false; }

  confirmarTransferencia() {
    if (!this.valorTransferencia || this.valorTransferencia <= 0) {
      alert("Valor inválido.");
      return;
    }
    if (this.valorTransferencia > this.saldoAtual) {
      alert("Saldo insuficiente.");
      return;
    }

    this.saldoAtual -= this.valorTransferencia;
    
    // 3. GRAVAR NO HISTÓRICO (unshift adiciona no início da lista)
    this.historico.unshift({
      tipo: 'Enviado',
      valor: this.valorTransferencia,
      data: new Date(),
      entrada: false
    });

    // alert("Sucesso!");
    this.fecharModalTransferencia();
  }

  confirmarEmprestimo() {
    if (!this.valorEmprestimo || this.valorEmprestimo <= 0) {
      alert("Valor inválido.");
      return;
    }

    this.saldoAtual += this.valorEmprestimo;

    // 3. GRAVAR NO HISTÓRICO
    this.historico.unshift({
      tipo: 'Recebido',
      valor: this.valorEmprestimo,
      data: new Date(),
      entrada: true
    });

    // alert("Sucesso!");
    this.fecharModalEmprestimo();
  }
}