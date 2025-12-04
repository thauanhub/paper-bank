import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaperBankService } from '../paper-bank.service'; 

@Component({
  selector: 'app-carteira',
  standalone: true,
  imports: [CommonModule], 
  templateUrl: './carteira.html',
  styleUrl: './carteira.css'
})
export class Carteira implements OnInit {
  
  constructor(
    public pb: PaperBankService, 
    private cdr: ChangeDetectorRef 
  ) {}

  // Listas de dados
  meiosDePagamento: any[] = [];
  meusContatos: any[] = []; // Lista de contatos

  ngOnInit() {
    // 1. Carrega o Saldo
    this.pb.carregarSaldo();

    // 2. Carrega os Cartões
    this.carregarMeusCartoes();
    
    // 3. Carrega os Contatos (ESTA LINHA É CRUCIAL!)
    this.carregarContatos();

    // Força atualização visual
    setTimeout(() => { this.cdr.detectChanges(); }, 500);
  }

  // --- Funções de Busca ---

  carregarMeusCartoes() {
    this.pb.listarCartoes().subscribe({
      next: (listaCartoes) => {
        console.log("Cartões recebidos:", listaCartoes);
        this.meiosDePagamento = listaCartoes;
        this.cdr.detectChanges();
      },
      error: (err) => console.error("Erro ao listar cartões", err)
    });
  }

  carregarContatos() {
    // Chama o serviço para buscar quem recebeu PIX seu
    this.pb.listarContatos().subscribe({
      next: (lista) => {
        // AQUI ESTÁ O LOG QUE FALTAVA NO TEU PRINT
        console.log("Contatos encontrados:", lista);
        this.meusContatos = lista;
        this.cdr.detectChanges();
      },
      error: (err) => console.error("Erro ao buscar contatos", err)
    });
  }

  // --- Lógica do Botão Novo Cartão ---
  solicitarNovoCartao() {
    // (Opcional) Limita visualmente a 1 cartão
    if (this.meiosDePagamento.length >= 1) {
        alert("Máximo 1 cartão por enquanto!");
        return;
    }

    this.pb.criarCartao().subscribe({
      next: (res) => {
        alert("Cartão criado com sucesso!");
        this.carregarMeusCartoes(); // Atualiza a lista
      },
      error: (err) => {
        console.error(err);
        const msg = err.error?.detail || "Erro ao criar cartão";
        alert("Falha: " + msg);
      }
    });
  }
}