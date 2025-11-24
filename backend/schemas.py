from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import date, datetime
from decimal import Decimal

class GerenteSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    idGerente: Optional[int] = None
    nome: str
    email: EmailStr
    telefone: Optional[str] = None
    departamento: str

class ClienteSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    idCliente: Optional[int] = None
    nome: str
    cpf: str = Field(..., max_length=14)
    senha: str
    endereco: Optional[str] = None
    telefone: Optional[str] = None
    email: EmailStr
    dataNascimento: Optional[date] = None
    fk_idGerente: Optional[int] = None      # <-- CORRIGIDO

# --- Schemas Base (Compartilhados) ---
class ClienteBase(BaseModel):
    nome: str
    cpf: str
    email: EmailStr
    telefone: str
    endereco: str
    dataNascimento: date


# --- Input: Transação PIX ---
class PixCreate(BaseModel):
    chave_pix: str
    tipo_chave: str = "EMAIL"
    valor: Decimal
    senha: str # Senha para confirmação

# --- Output: Resposta de Token ---
class Token(BaseModel):
    access_token: str
    token_type: str

# --- Output: Resposta Completa (Igual ao seu modelo anterior) ---
class ClienteResponse(ClienteBase):
    model_config = ConfigDict(from_attributes=True)
    idCliente: int
    fk_idGerente: int

class ContaResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    numeroConta: int
    saldo: Decimal
    status: str

class TransacaoResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    idTransacao: int
    valor: Decimal
    status: str
    dataHora: datetime    

class ContaBancariaSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    numeroConta: int
    saldo: Decimal
    dataAbertura: date
    status: str
    tipoConta: str
    taxaRendimento: Optional[Decimal] = None
    fk_idCliente: int

class CartaoSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    numeroCartao: int
    validade: date
    cvv: int
    tipo: str
    limite: Decimal
    fk_idCliente: int

class FaturaSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    idFatura: Optional[int] = None
    mes: str = Field(..., pattern=r"^\d{4}-\d{2}$") # Validação YYYY-MM
    valorTotal: Decimal
    valorPago: Optional[Decimal] = Decimal(0.00)
    dataVencimento: date
    fk_numeroCartao: int

class InvestimentoSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    idInvestimento: Optional[int] = None
    tipo: str
    valorAplicado: Decimal
    rentabilidade: Optional[float] = None
    dataAplicacao: datetime
    fk_numeroConta: int

class EmprestimoSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    idEmprestimo: Optional[int] = None
    valor: Decimal
    juros: float
    parcelas: int
    dataContratacao: date
    fk_numeroConta: int

class TransacaoSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    idTransacao: Optional[int] = None
    tipo: str
    valor: Decimal
    dataHora: datetime
    status: str
    fk_contaOrigem: Optional[int] = None
    fk_contaDestino: Optional[int] = None

class PixSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    idPixTransacao: int
    chavePix: str
    tipoChave: str
# --- Schemas para MongoDB (NoSQL) ---
class detalhesFeedback(BaseModel):
        feature: Optional[str] = None
        versaoApp: Optional[str] = None
        modulo: Optional[str] = None
class FeedbackCreate(BaseModel):
    fk_idUsuario: int
    tipoUsuario: str
    dataHora: Optional[datetime] = None
    ratingGeral: int
    comentario: str
    tags: List[str]
    detalhes: detalhesFeedback
    
    
class DetalhesLog(BaseModel):
    dispositivo: Optional[str] = None
    codigoErro: Optional[str] = None
    stackTrace: Optional[str] = None
class LogCreate(BaseModel):
    dataHora: Optional[datetime] = None
    tipo: str
    fk_idUsuario: int
    ipOrigem: str
    mensagem: str
    nivelSeveridade: str
    detalhesAdicionais: DetalhesLog
    