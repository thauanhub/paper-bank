import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root' // Isto diz: "Este serviço é único para o app inteiro"
})
export class PaperBankService {
  // Este é o saldo VERDADEIRO, partilhado por todos
  saldo: number = 1500.50;
}