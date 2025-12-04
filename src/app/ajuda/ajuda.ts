import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PaperBankService } from '../paper-bank.service';

@Component({
  selector: 'app-ajuda',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ajuda.html',
  styleUrl: './ajuda.css'
})
export class Ajuda {
  
  constructor(
    private pb: PaperBankService,
    private cdr: ChangeDetectorRef, // Essencial para atualizar a tela rápido
    private router: Router
  ) {}

  // --- Variáveis do Modal de Senha ---
  modalAberto = false;
  senhaAtual = '';
  novaSenha = '';
  confirmacao = '';
  carregando = false; // Trava o botão

  // --- Variáveis do Modal de Feedback ---
  feedbackAberto = false;
  feedbackMensagem = '';
  feedbackTipo: 'sucesso' | 'erro' = 'sucesso';

  // --- Métodos de Controle Visual ---
  abrirModal() {
    this.modalAberto = true;
    this.senhaAtual = '';
    this.novaSenha = '';
    this.confirmacao = '';
  }

  fecharModal() {
    this.modalAberto = false;
  }

  fecharFeedback() {
    this.feedbackAberto = false;
  }

  mostrarFeedback(msg: string, tipo: 'sucesso' | 'erro') {
    this.feedbackMensagem = msg;
    this.feedbackTipo = tipo;
    this.feedbackAberto = true;
    this.cdr.detectChanges(); // Garante que o feedback aparece na hora
  }

enviarRedefinicao() {
    if (this.carregando) return;

    if (!this.senhaAtual || !this.novaSenha || !this.confirmacao) {
        this.mostrarFeedback("Preencha todos os campos.", 'erro');
        return;
    }

    if (this.novaSenha !== this.confirmacao) {
      this.mostrarFeedback("A nova senha e a confirmação não conferem.", 'erro');
      return;
    }

    // 1. Bloqueia
    this.carregando = true;
    this.cdr.detectChanges(); 

    this.pb.redefinirSenha(this.senhaAtual, this.novaSenha, this.confirmacao)
      .subscribe({
        next: (res) => {
          // SUCESSO
          this.fecharModal();
          this.senhaAtual = ''; this.novaSenha = ''; this.confirmacao = '';
          this.mostrarFeedback(res.mensagem, 'sucesso');
        },
        error: (err) => {
          // ERRO
          console.error("Erro no processo:", err);
          const msg = err.error?.detail || "Erro de conexão com o servidor.";
          this.mostrarFeedback("Erro: " + msg, 'erro');
        }
      })
      // 2. O SEGREDO: O '.add' roda SEMPRE, seja sucesso ou erro.
      .add(() => {
         console.log("Processo finalizado. Destravando botão.");
         this.carregando = false;
         this.cdr.detectChanges();
      });
  }

  modalExcluirAberto = false;
  senhaExclusao = '';
  
  abrirModalExcluir() {
    this.modalExcluirAberto = true;
    this.senhaExclusao = '';
  }

  fecharModalExcluir() {
    this.modalExcluirAberto = false;
  }

  confirmarExclusaoConta() {
    if (!this.senhaExclusao || this.senhaExclusao == '') {
      this.fecharModalExcluir();
      this.mostrarFeedback("Digite sua senha para confirmar.", 'erro');
      return;
    }

    // Bloqueia botão (opcional, se quiseres usar a var carregando)
    // this.carregando = true;

    this.pb.excluirConta(this.senhaExclusao)
      .subscribe({
        next: (res: any) => {
          this.fecharModalExcluir();
          
          // Feedback final antes do adeus
          alert("Conta excluída com sucesso. Sentiremos sua falta!");
          
          // 3. LIMPEZA TOTAL E LOGOUT
          localStorage.clear(); // Limpa o token
          this.router.navigate(['/']); // Manda para o login
        },
        error: (err) => {
          console.error(err);
          const msg = err.error.detail || "Erro ao excluir conta.";
          this.mostrarFeedback("Falha: " + msg, 'erro');
        }
      });
  }

}