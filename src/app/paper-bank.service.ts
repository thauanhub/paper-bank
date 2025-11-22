import { Injectable } from '@angular/core';
@Injectable({
  providedIn: 'root' // Isto diz: "Este serviço é único para o app inteiro"
})



export class PaperBankService {
  // Base da API
  private apiBase = 'http://localhost:8000';

  // Saldo atual
  saldo = 0;

  // WebSocket instance
  private ws: WebSocket | null = null;

  constructor() {}

  

}