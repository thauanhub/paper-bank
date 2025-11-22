import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaperBankService } from '../paper-bank.service'; 

// 1. Definimos o molde da Transação novamente
interface Transacao {
  tipo: string;
  valor: number;
  data: Date;
  entrada: boolean;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule], 
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomeComponent {
  // 2. Conexão com o Cofre (Service)
  private paperBankService = inject(PaperBankService);

  // Getter para ler o saldo do Cofre
  get saldoAtual(): number {
    return this.paperBankService.saldo;
  }

  // 3. A Lista do Histórico (Voltou!)
  historico: Transacao[] = [];

  // Variáveis dos Modais
  exibirModalTransferencia: boolean = false;
  exibirModalEmprestimo: boolean = false;
  valorTransferencia: number | null = null;
  valorEmprestimo: number | null = null;

  // Controles de abrir/fechar
  abrirModalTransferencia() { this.exibirModalTransferencia = true; this.valorTransferencia = null; }
  fecharModalTransferencia() { this.exibirModalTransferencia = false; }
  abrirModalEmprestimo() { this.exibirModalEmprestimo = true; this.valorEmprestimo = null; }
  fecharModalEmprestimo() { this.exibirModalEmprestimo = false; }

  // 4. Lógica de Transferência (Atualiza Saldo E Histórico)
  confirmarTransferencia() {
    if (!this.valorTransferencia || this.valorTransferencia <= 0) {
      alert("Valor inválido.");
      return;
    }
    if (this.valorTransferencia > this.saldoAtual) {
      alert("Saldo insuficiente.");
      return;
    }

    // A. Tira do Cofre Central
    this.paperBankService.saldo -= this.valorTransferencia;

    // B. Anota no Histórico Local
    this.historico.unshift({
      tipo: 'Enviado',
      valor: this.valorTransferencia,
      data: new Date(),
      entrada: false
    });
    
    alert(`Transferência enviada!`);
    this.fecharModalTransferencia();
  }

  // 5. Lógica de Empréstimo (Atualiza Saldo E Histórico)
  confirmarEmprestimo() {
    if (!this.valorEmprestimo || this.valorEmprestimo <= 0) {
      alert("Valor inválido.");
      return;
    }

    // A. Coloca no Cofre Central
    this.paperBankService.saldo += this.valorEmprestimo;

    // B. Anota no Histórico Local
    this.historico.unshift({
      tipo: 'Recebido',
      valor: this.valorEmprestimo,
      data: new Date(),
      entrada: true
    });
    
    alert(`Empréstimo recebido!`);
    this.fecharModalEmprestimo();
  }
}