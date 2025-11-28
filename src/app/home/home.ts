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
  chavePixDestino: string = '';
  senhaTransacao: string = '';
  valorEmprestimo: number | null = null;
  // Estado de Carregamento
  carregando = false;

  // --- Variáveis de Feedback ---
  feedbackAberto = false;
  feedbackMensagem = '';
  feedbackTipo: 'sucesso' | 'erro' = 'sucesso';

  // Controles de abrir/fechar
  abrirModalTransferencia() { this.exibirModalTransferencia = true; this.valorTransferencia = null; }
  abrirModalEmprestimo() { this.exibirModalEmprestimo = true; this.valorEmprestimo = null; }
  fecharModalEmprestimo() { this.exibirModalEmprestimo = false; }

  mostrarFeedback(msg: string, tipo: 'sucesso' | 'erro') {
    this.feedbackMensagem = msg;
    this.feedbackTipo = tipo;
    this.feedbackAberto = true;
    this.cdr.detectChanges();
  }

  fecharFeedback() {
    this.feedbackAberto = false;
  }

confirmarTransferencia() {
   if (this.carregando) return;

    if (!this.valorTransferencia || this.valorTransferencia <= 0) {
      this.mostrarFeedback("Valor inválido.", 'erro');
      return;
    }
    if (!this.chavePixDestino) {
      this.mostrarFeedback("Digite a chave PIX.", 'erro');
      return;
    }
    if (!this.senhaTransacao) {
      this.mostrarFeedback("Digite sua senha.", 'erro');
      return;
    }

    // 1. Bloqueia
    this.carregando = true;
    this.cdr.detectChanges();

    /// 2. Envia
    this.pb.realizarPix(this.valorTransferencia, this.chavePixDestino, this.senhaTransacao)
      .subscribe({
        next: (res) => {
          // Fecha modal de formulário
          this.fecharModalTransferencia();
          
         if (res.novo_saldo_origem !== undefined) {
             this.pb.saldo = res.novo_saldo_origem;
          } else {
             // Se não mandou, busca do jeito antigo
             this.pb.carregarSaldo();
          }

          // Feedback Positivo
          this.mostrarFeedback("PIX enviado com sucesso!", 'sucesso');
          
          // Histórico Visual (Opcional, pois o backend já registra)
          this.historico.unshift({
            tipo: 'Enviado', valor: this.valorTransferencia!, data: new Date(), entrada: false
          });

          setTimeout(() => { this.cdr.detectChanges(); }, 1000);
        },
        error: (err) => {
          console.error(err);
          const msg = err.error.detail || "Erro ao realizar PIX";
          this.mostrarFeedback("Falha: " + msg, 'erro');
        }
      })
      .add(() => {
        this.carregando = false; // Destrava o botão
        this.cdr.detectChanges(); // Atualiza a tela
      });
  }
  
  // Dica: Limpe a senha também ao fechar o modal (cancelar)
  fecharModalTransferencia() { 
      this.exibirModalTransferencia = false; 
      this.senhaTransacao = ''; 
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