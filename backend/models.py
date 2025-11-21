from typing import Optional, List
from datetime import date, datetime
from decimal import Decimal
from sqlalchemy import String, Integer, BigInteger, DECIMAL, Date, DateTime, Float, ForeignKey
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship

class Base(DeclarativeBase):
    pass

class Gerente(Base):
    __tablename__ = "gerente"

    idGerente: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    nome: Mapped[str] = mapped_column(String(255))
    email: Mapped[str] = mapped_column(String(255), unique=True)
    telefone: Mapped[Optional[str]] = mapped_column(String(20))
    departamento: Mapped[str] = mapped_column(String(100))
 
    clientes: Mapped[List["Cliente"]] = relationship(back_populates="gerente")


class Cliente(Base):
    __tablename__ = "cliente"

    idCliente: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    nome: Mapped[str] = mapped_column(String(255))
    cpf: Mapped[str] = mapped_column(String(14), unique=True)
    senha: Mapped[str] = mapped_column(String(255))
    endereco: Mapped[Optional[str]] = mapped_column(String(255))
    telefone: Mapped[Optional[str]] = mapped_column(String(20))
    email: Mapped[str] = mapped_column(String(255), unique=True)
    dataNascimento: Mapped[Optional[date]] = mapped_column(Date)
    fk_idGerente: Mapped[int] = mapped_column(BigInteger, ForeignKey("gerente.idGerente"))

    gerente: Mapped["Gerente"] = relationship(back_populates="clientes")
    contas: Mapped[List["ContaBancaria"]] = relationship(back_populates="cliente")
    cartoes: Mapped[List["Cartao"]] = relationship(back_populates="cliente")


class ContaBancaria(Base):
    __tablename__ = "conta_bancaria"

    numeroConta: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    saldo: Mapped[Decimal] = mapped_column(DECIMAL(15, 2), default=0.00)
    dataAbertura: Mapped[date] = mapped_column(Date)
    status: Mapped[str] = mapped_column(String(20))
    tipoConta: Mapped[str] = mapped_column(String(20))
    taxaRendimento: Mapped[Optional[Decimal]] = mapped_column(DECIMAL(5, 2))
    fk_idCliente: Mapped[int] = mapped_column(BigInteger, ForeignKey("cliente.idCliente"))

    cliente: Mapped["Cliente"] = relationship(back_populates="contas")
    investimentos: Mapped[List["Investimento"]] = relationship(back_populates="conta")
    emprestimos: Mapped[List["Emprestimo"]] = relationship(back_populates="conta")
    
    
    transacoes_origem: Mapped[List["Transacao"]] = relationship("Transacao", foreign_keys="[Transacao.fk_contaOrigem]")
    transacoes_destino: Mapped[List["Transacao"]] = relationship("Transacao", foreign_keys="[Transacao.fk_contaDestino]")


class Cartao(Base):
    __tablename__ = "cartao"

    numeroCartao: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    validade: Mapped[date] = mapped_column(Date)
    cvv: Mapped[int] = mapped_column(Integer)
    tipo: Mapped[str] = mapped_column(String(20))
    limite: Mapped[Decimal] = mapped_column(DECIMAL(15, 2))
    fk_idCliente: Mapped[int] = mapped_column(BigInteger, ForeignKey("cliente.idCliente"))

    cliente: Mapped["Cliente"] = relationship(back_populates="cartoes")
    faturas: Mapped[List["Fatura"]] = relationship(back_populates="cartao")


class Fatura(Base):
    __tablename__ = "fatura"

    idFatura: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    mes: Mapped[str] = mapped_column(String(7)) # YYYY-MM
    valorTotal: Mapped[Decimal] = mapped_column(DECIMAL(15, 2))
    valorPago: Mapped[Optional[Decimal]] = mapped_column(DECIMAL(15, 2), default=0.00)
    dataVencimento: Mapped[date] = mapped_column(Date)
    fk_numeroCartao: Mapped[int] = mapped_column(BigInteger, ForeignKey("cartao.numeroCartao"))

    cartao: Mapped["Cartao"] = relationship(back_populates="faturas")


class Investimento(Base):
    __tablename__ = "investimento"

    idInvestimento: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    tipo: Mapped[str] = mapped_column(String(100))
    valorAplicado: Mapped[Decimal] = mapped_column(DECIMAL(15, 2))
    rentabilidade: Mapped[Optional[float]] = mapped_column(Float)
    dataAplicacao: Mapped[datetime] = mapped_column(DateTime)
    fk_numeroConta: Mapped[int] = mapped_column(BigInteger, ForeignKey("conta_bancaria.numeroConta"))

    conta: Mapped["ContaBancaria"] = relationship(back_populates="investimentos")


class Emprestimo(Base):
    __tablename__ = "emprestimo"

    idEmprestimo: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    valor: Mapped[Decimal] = mapped_column(DECIMAL(15, 2))
    juros: Mapped[float] = mapped_column(Float)
    parcelas: Mapped[int] = mapped_column(Integer)
    dataContratacao: Mapped[date] = mapped_column(Date)
    fk_numeroConta: Mapped[int] = mapped_column(BigInteger, ForeignKey("conta_bancaria.numeroConta"))

    conta: Mapped["ContaBancaria"] = relationship(back_populates="emprestimos")


class Transacao(Base):
    __tablename__ = "transacao"

    idTransacao: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    tipo: Mapped[str] = mapped_column(String(50))
    valor: Mapped[Decimal] = mapped_column(DECIMAL(15, 2))
    dataHora: Mapped[datetime] = mapped_column(DateTime)
    status: Mapped[str] = mapped_column(String(20))
    fk_contaOrigem: Mapped[Optional[int]] = mapped_column(BigInteger, ForeignKey("conta_bancaria.numeroConta"))
    fk_contaDestino: Mapped[Optional[int]] = mapped_column(BigInteger, ForeignKey("conta_bancaria.numeroConta"))


class Pix(Base):
    __tablename__ = "pix"

    idPixTransacao: Mapped[int] = mapped_column(BigInteger, ForeignKey("transacao.idTransacao"), primary_key=True)
    chavePix: Mapped[str] = mapped_column(String(255))
    tipoChave: Mapped[str] = mapped_column(String(20))

   
    transacao: Mapped["Transacao"] = relationship()