
from fastapi import APIRouter, HTTPException, status
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