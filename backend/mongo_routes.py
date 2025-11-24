
from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.orm import Session
from sqlalchemy import or_
import models, auth
from database import get_db
from datetime import datetime
from pymongo import ASCENDING
import schemas
from database import mongodb

# Cria o roteador para agrupar estas rotas
mongo_router = APIRouter(tags=["MongoDB / Logs & Feedback"])

# --- Função utilitária para criar índices (chamada no startup) ---
def configurar_indices_mongo():
    if mongodb is not None:
        try:
            # Cria índice TTL para apagar logs após 90 dias (7776000s)
            mongodb.logs_eventos.create_index(
                [("dataHora", ASCENDING)],
                expireAfterSeconds=7776000
            )
            print("✅ Índice TTL do MongoDB verificado/criado.")
        except Exception as e:
            print(f"❌ Erro ao criar índice no MongoDB: {e}")

# --- Rota: Inserir Feedback ---
@mongo_router.post("/feedback", status_code=status.HTTP_201_CREATED)
def criar_feedback(feedback: schemas.FeedbackCreate):
    if mongodb is None:
        raise HTTPException(status_code=503, detail="MongoDB indisponível")

    feedback_dict = feedback.model_dump()
    
    if not feedback_dict.get("dataHora"):
        feedback_dict["dataHora"] = datetime.utcnow()
    
    resultado = mongodb.avaliacoes_feedback.insert_one(feedback_dict)
    
    return {
        "message": "Feedback recebido",
        "id_feedback": str(resultado.inserted_id)
    }

# --- Rota: Inserir Log ---
@mongo_router.post("/log", status_code=status.HTTP_201_CREATED)
def criar_log(log: schemas.LogCreate):
    if mongodb is None:
        raise HTTPException(status_code=503, detail="MongoDB indisponível")

    log_dict = log.model_dump()
    
    if not log_dict.get("dataHora"):
        log_dict["dataHora"] = datetime.utcnow()
        
    resultado = mongodb.logs_eventos.insert_one(log_dict)
    
    return {
        "message": "Log registrado",
        "id_log": str(resultado.inserted_id)
    }

# --- Rota: Popular Dados de Exemplo (Seed) ---
@mongo_router.post("/seed-mongodb")
def popular_banco_mongo():
    if mongodb is None:
        raise HTTPException(status_code=503, detail="MongoDB indisponível")

    # Dados de Feedback
    feedbacks = [
        {
            "dataHora": datetime.strptime("2025-10-15T14:45:00", "%Y-%m-%dT%H:%M:%S"),
            "tipoUsuario": "Cliente",
            "fk_idUsuario": 1,
            "ratingGeral": 4,
            "comentario": "O novo layout para transferências PIX ficou ótimo...",
            "tags": ["Sugestão", "Lentidão", "UI/UX"],
            "detalhes": {"feature": "Transferência PIX", "versaoApp": "2.1.0"}
        },
        {
            "dataHora": datetime.strptime("2025-10-18T09:10:00", "%Y-%m-%dT%H:%M:%S"),
            "tipoUsuario": "Gerente",
            "fk_idUsuario": 2,
            "ratingGeral": 5,
            "comentario": "A ferramenta de visualização de clientes...",
            "tags": ["Melhoria", "Produtividade"],
            "detalhes": {"modulo": "Backoffice - Crédito", "sistema": "Web Gerencial"}
        }
    ]

    # Dados de Logs
    logs = [
        {
            "dataHora": datetime.strptime("2025-10-23T16:00:00", "%Y-%m-%dT%H:%M:%S"),
            "tipo": "Login",
            "fk_idUsuario": 1,
            "ipOrigem": "200.145.10.1",
            "nivelSeveridade": "INFO",
            "mensagem": "Login de cliente bem-sucedido.",
            "detalhesAdicionais": {"dispositivo": "Android App", "sessaoId": "XYZ123ABC"}
        },
        {
            "dataHora": datetime.strptime("2025-10-23T16:05:30", "%Y-%m-%dT%H:%M:%S"),
            "tipo": "Erro",
            "fk_idUsuario": 2,
            "ipOrigem": "192.168.1.5",
            "nivelSeveridade": "ERROR",
            "mensagem": "Falha ao carregar lista de clientes...",
            "detalhesAdicionais": {"codigoErro": "DB-005", "stackTrace": "Erro de timeout..."}
        }
    ]
    
    mongodb.avaliacoes_feedback.insert_many(feedbacks)
    mongodb.logs_eventos.insert_many(logs)
    
    return {"message": "Dados de exemplo inseridos no MongoDB com sucesso!"}


# --- Rota: Listar Transferências PIX Registradas no MongoDB ---
@mongo_router.get("/pix-transferencias")
def listar_transferencias_pix(
    cliente_atual: models.Cliente = Depends(auth.obter_cliente_atual),
    db: Session = Depends(get_db)
):
    if mongodb is None:
        raise HTTPException(status_code=503, detail="MongoDB indisponível")
 
    contas_cliente = db.query(models.ContaBancaria.numeroConta).filter(models.ContaBancaria.fk_idCliente == cliente_atual.idCliente).all()
    contas_lista = [c[0] for c in contas_cliente] if contas_cliente else []

    transacoes_ids = []
    if contas_lista:
        transacoes = db.query(models.Transacao.idTransacao).filter(
            or_(models.Transacao.fk_contaOrigem.in_(contas_lista), models.Transacao.fk_contaDestino.in_(contas_lista))
        ).all()
        transacoes_ids = [t[0] for t in transacoes]

    # Busca os logs do tipo TRANSFERENCIA_PIX onde o cliente logado é origem/destino ou
    or_clauses = [
        {"id_cliente_origem": cliente_atual.idCliente},
        {"id_cliente_destino": cliente_atual.idCliente}
    ]
    if transacoes_ids:
        or_clauses.append({"id_transacao": {"$in": transacoes_ids}})

    filtro = {
        "tipo": "TRANSFERENCIA_PIX",
        "$or": or_clauses
    }
    cursor = mongodb.logs_eventos.find(filtro).sort("data_hora", -1)
    resultados = []

    for log in cursor:
        id_transacao = log.get("id_transacao") or log.get("idTransacao")
        valor = log.get("valor")
        data_hora = log.get("data_hora") or log.get("dataHora")
        id_cliente_origem = log.get("id_cliente_origem") or log.get("fk_idUsuario")
        id_cliente_destino = log.get("id_cliente_destino") or log.get("fk_idUsuario_destino")

        nome_origem = None
        nome_destino = None
        id_cliente_destino = None

        # Tenta resolver pelo id_transacao primeiro
        if id_transacao:
            transacao = db.query(models.Transacao).filter(models.Transacao.idTransacao == int(id_transacao)).first()
            if transacao:
                # Origem
                if transacao.fk_contaOrigem:
                    conta_origem = db.query(models.ContaBancaria).filter(models.ContaBancaria.numeroConta == transacao.fk_contaOrigem).first()
                    if conta_origem:
                        cliente_origem = db.query(models.Cliente).filter(models.Cliente.idCliente == conta_origem.fk_idCliente).first()
                        if cliente_origem:
                            nome_origem = cliente_origem.nome
                            id_cliente_origem = cliente_origem.idCliente if not id_cliente_origem else id_cliente_origem

                # Destino
                if transacao.fk_contaDestino:
                    conta_destino = db.query(models.ContaBancaria).filter(models.ContaBancaria.numeroConta == transacao.fk_contaDestino).first()
                    if conta_destino:
                        cliente_destino = db.query(models.Cliente).filter(models.Cliente.idCliente == conta_destino.fk_idCliente).first()
                        if cliente_destino:
                            nome_destino = cliente_destino.nome
                            id_cliente_destino = cliente_destino.idCliente

                # Se não achou destino por conta, tenta usar o Pix (email chave)
                if not nome_destino:
                    pix = db.query(models.Pix).filter(models.Pix.idPixTransacao == int(id_transacao)).first()
                    if pix and pix.chavePix:
                        # Chave Pix provavelmente é email
                        cliente_destino2 = db.query(models.Cliente).filter(models.Cliente.email == pix.chavePix).first()
                        if cliente_destino2:
                            nome_destino = cliente_destino2.nome
                            id_cliente_destino = cliente_destino2.idCliente

        if not nome_origem and id_cliente_origem:
            cliente_origem = db.query(models.Cliente).filter(models.Cliente.idCliente == int(id_cliente_origem)).first()
            if cliente_origem:
                nome_origem = cliente_origem.nome

        if not nome_destino and id_cliente_destino:
            cliente_destino = db.query(models.Cliente).filter(models.Cliente.idCliente == int(id_cliente_destino)).first()
            if cliente_destino:
                nome_destino = cliente_destino.nome
   
        tipo = "enviado" if (id_cliente_origem and int(id_cliente_origem) == cliente_atual.idCliente) else "recebido"
        try:
            if cliente_atual and cliente_atual.idCliente:
                if id_cliente_origem and int(id_cliente_origem) == cliente_atual.idCliente:
                    tipo = "saida"
                elif id_cliente_destino and int(id_cliente_destino) == cliente_atual.idCliente:
                    tipo = "entrada"
        except Exception:
            pass

        resultados.append({
            "id_transacao": id_transacao,
            "data_hora": data_hora,
            "valor": valor,
            "nome_origem": nome_origem or "Desconhecido",
            "nome_destino": nome_destino or "Desconhecido",
            "tipo": tipo
        })

    return resultados