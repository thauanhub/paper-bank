import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common'; // Importante para *ngFor e Pipes
import { PaperBankService } from '../paper-bank.service';

@Component({
  selector: 'app-atividades',
  standalone: true,
  imports: [CommonModule], 
  templateUrl: './atividades.html',
  styleUrl: './atividades.css',
})
export class Atividades implements OnInit {

  constructor(
    public pb: PaperBankService,
    private cdr: ChangeDetectorRef
  ) {}

  historico: any[] = [];
  carregando = true;

  ngOnInit() {
    // 1. Garante que temos os dados do usuário (Nome, Conta)
    this.pb.carregarSaldo();

    // 2. Busca o histórico completo
    this.carregarHistorico();
  }

  carregarHistorico() {
    this.pb.obterExtrato().subscribe({
      next: (lista) => {
        console.log("Atividades carregadas:", lista);
        this.historico = lista;
        this.carregando = false;
        this.cdr.detectChanges(); // Atualiza a tela
      },
      error: (err) => {
        console.error(err);
        this.carregando = false;
      }
    });
  }
}