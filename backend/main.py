
from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, date
from dateutil.relativedelta import relativedelta
from decimal import Decimal
import random 
import models, schemas,auth
from database import engine, get_db, mongodb
import mongo_routes
from fastapi.middleware.cors import CORSMiddleware
# Cria tabelas se não existirem
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Paper Bank API")
app.include_router(mongo_routes.mongo_router)
app.include_router(auth.auth_router)
origins = [
    "http://localhost:4200",
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:4200",
    "http://localhost:8000",   
    "http://127.0.0.1:8000"
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    # Chama a função que está no arquivo mongo_routes para criar os índices
    mongo_routes.configurar_indices_mongo()
    

# --- Rota: Saldo ---
@app.get("/saldo")
def obter_saldo(
    cliente_atual: models.Cliente = Depends(auth.obter_cliente_atual),
    db: Session = Depends(get_db)
):
    # Busca a conta vinculada ao cliente logado
    conta = db.query(models.ContaBancaria).filter(
        models.ContaBancaria.fk_idCliente == cliente_atual.idCliente
    ).first()
    
    if not conta:
        raise HTTPException(status_code=404, detail="Conta bancária não encontrada")
    
    return {
        "nome_cliente": cliente_atual.nome,
        "numero_conta": conta.numeroConta,
        "saldo": float(conta.saldo),
        "status": conta.status
    }

# --- Rota: Transferência PIX ---
@app.post("/transferir-pix", response_model=schemas.TransacaoResponse)
def transferir_pix(
    transacao_in: schemas.PixCreate,
    cliente_atual: models.Cliente = Depends(auth.obter_cliente_atual),
    db: Session = Depends(get_db)
):
    # 1. Verificar senha transacional
    if not auth.verificar_senha(transacao_in.senha, cliente_atual.senha):
        raise HTTPException(status_code=400, detail="Senha transacional incorreta")
    
    # 2. Obter conta origem
    conta_origem = db.query(models.ContaBancaria).filter(
        models.ContaBancaria.fk_idCliente == cliente_atual.idCliente
    ).first()
    
    if not conta_origem:
        raise HTTPException(status_code=404, detail="Conta de origem não encontrada")

    # 3. Verificar saldo 
    if conta_origem.saldo < transacao_in.valor:
        raise HTTPException(status_code=400, detail="Saldo insuficiente")
    
    # 4. Obter conta destino (Busca simplificada: Email = Chave Pix)
    cliente_destino = db.query(models.Cliente).filter(
        models.Cliente.email == transacao_in.chave_pix
    ).first()
    
    if not cliente_destino:
        raise HTTPException(status_code=404, detail="Chave PIX (Email) não encontrada")
    
    conta_destino = db.query(models.ContaBancaria).filter(
        models.ContaBancaria.fk_idCliente == cliente_destino.idCliente
    ).first()
    
    if not conta_destino:
        raise HTTPException(status_code=404, detail="Conta de destino não encontrada")
    
    # Bloquear auto-transferência
    if conta_origem.numeroConta == conta_destino.numeroConta:
        raise HTTPException(status_code=400, detail="Não é possível transferir para a mesma conta")

    # 5. Criar Transação
    db_transacao = models.Transacao(
        tipo="PIX",
        valor=transacao_in.valor,
        dataHora=datetime.now(),
        status="CONCLUIDA",
        fk_contaOrigem=conta_origem.numeroConta,
        fk_contaDestino=conta_destino.numeroConta
    )
    db.add(db_transacao)
    db.flush() # Gera o ID da transação sem commitar tudo ainda
    
    # 6. Registrar Detalhe PIX
    db_pix = models.Pix(
        idPixTransacao=db_transacao.idTransacao,
        chavePix=transacao_in.chave_pix,
        tipoChave=transacao_in.tipo_chave
    )
    db.add(db_pix)
    
    # 7. Atualizar Saldos
    conta_origem.saldo -= transacao_in.valor
    conta_destino.saldo += transacao_in.valor
    
    db.commit()
    db.refresh(db_transacao)
    
    # 8. Log
    try:
        mongodb.logs_eventos.insert_one({
            "tipo": "TRANSFERENCIA_PIX",
            "id_cliente_origem": cliente_atual.idCliente,
            "id_cliente_destino": cliente_destino.idCliente,
            "valor": float(transacao_in.valor),
            "data_hora": datetime.utcnow(),
            "id_transacao": db_transacao.idTransacao
        })
    except:
        pass

    return db_transacao


# --- Rota: Criar Cartão de Crédito ---
@app.post("/cartao", response_model=schemas.CartaoSchema, status_code=201)
def criar_cartao(
    cartao_in: schemas.CartaoCreate,
    cliente_atual: models.Cliente = Depends(auth.obter_cliente_atual),
    db: Session = Depends(get_db)
):
    # Gera número do cartão de forma simples: prefixado pelo idCliente + dígitos aleatórios
    # Repetimos até garantir unicidade na tabela
    numero_cartao = int(f"{cliente_atual.idCliente}{random.randint(100000000,999999999)}")
    while db.query(models.Cartao).filter(models.Cartao.numeroCartao == numero_cartao).first():
        numero_cartao = int(f"{cliente_atual.idCliente}{random.randint(100000000,999999999)}")

    # Validade (3 anos a partir de hoje)
    validade = date.today() + relativedelta(years=3)

    # CVV aleatório de 3 dígitos
    cvv = random.randint(100, 999)

    # Criar cartao
    db_cartao = models.Cartao(
        numeroCartao=numero_cartao,
        validade=validade,
        cvv=cvv,
        tipo= "CREDITO",
        limite=cartao_in.limite,
        fk_idCliente=cliente_atual.idCliente
    )

    db.add(db_cartao)
    db.commit()
    db.refresh(db_cartao)

    # Log (Mongo)
    try:
        mongodb.logs_eventos.insert_one({
            "tipo": "CRIAR_CARTAO",
            "fk_idUsuario": cliente_atual.idCliente,
            "id_cartao": db_cartao.numeroCartao,
            "data_hora": datetime.utcnow(),
            "mensagem": "Cartão criado com sucesso"
        })
    except:
        pass

    return db_cartao

# --- Rota: Extrato ---
@app.get("/extrato")
def obter_extrato(
    cliente_atual: models.Cliente = Depends(auth.obter_cliente_atual),
    db: Session = Depends(get_db)
):
    conta = db.query(models.ContaBancaria).filter(
        models.ContaBancaria.fk_idCliente == cliente_atual.idCliente
    ).first()
    
    if not conta:
        return []

    # Busca transações onde a conta é origem OU destino
    transacoes = db.query(models.Transacao).filter(
        (models.Transacao.fk_contaOrigem == conta.numeroConta)
        (models.Transacao.fk_contaDestino == conta.numeroConta)
    ).order_by(models.Transacao.dataHora.desc()).limit(50).all()
    
    return transacoes