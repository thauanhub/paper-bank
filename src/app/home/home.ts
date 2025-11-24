import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; // 1. Importa OnInit
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaperBankService } from '../paper-bank.service'; 

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
export class HomeComponent implements OnInit {
  
  // 2. Mantemos SÓ este (o public permite usar 'pb' direto no HTML)
  constructor(public pb: PaperBankService, private cdr: ChangeDetectorRef) {}

  // 3. Ao iniciar a Home, pedimos ao serviço para buscar o saldo atualizado
  ngOnInit() {
    // 1. Pede o saldo
    this.pb.carregarSaldo();

    // 2. Truque: Espera meio segundo e força a tela a pintar de novo
    setTimeout(() => {
      this.cdr.detectChanges();
    }, 500);
  }

  // Histórico Local
  historico: Transacao[] = [];

  // Variáveis dos Modais
  exibirModalTransferencia = false;
  exibirModalEmprestimo = false;
  valorTransferencia: number | null = null;
  valorEmprestimo: number | null = null;

  // Controles de abrir/fechar
  abrirModalTransferencia() { this.exibirModalTransferencia = true; this.valorTransferencia = null; }
  fecharModalTransferencia() { this.exibirModalTransferencia = false; }
  abrirModalEmprestimo() { this.exibirModalEmprestimo = true; this.valorEmprestimo = null; }
  fecharModalEmprestimo() { this.exibirModalEmprestimo = false; }

  // --- Lógica de Transferência ---
  confirmarTransferencia() {
    if (!this.valorTransferencia || this.valorTransferencia <= 0) {
      alert("Valor inválido.");
      return;
    }
    // Usamos 'this.pb.saldo' agora
    if (this.valorTransferencia > this.pb.saldo) {
      alert("Saldo insuficiente.");
      return;
    }

    // Atualiza no Service (Cofre)
    this.pb.saldo -= this.valorTransferencia;

    this.historico.unshift({
      tipo: 'Enviado',
      valor: this.valorTransferencia,
      data: new Date(),
      entrada: false
    });
    
    alert(`Transferência enviada!`);
    this.fecharModalTransferencia();
  }

  // --- Lógica de Empréstimo ---
  confirmarEmprestimo() {
    if (!this.valorEmprestimo || this.valorEmprestimo <= 0) {
      alert("Valor inválido.");
      return;
    }

    // Atualiza no Service (Cofre)
    this.pb.saldo += this.valorEmprestimo;

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