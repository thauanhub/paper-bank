
from datetime import date, datetime, timedelta
from decimal import Decimal
import random
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status, APIRouter
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
import schemas, models
from database import get_db, mongodb
from config import settings

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

auth_router = APIRouter(prefix="/auth", tags=["auth"])

# Contexto de criptografia (Hashing)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verificar_senha(senha_plana, senha_hash):
    """Verifica se a senha em texto plano corresponde ao hash salvo."""
    return pwd_context.verify(senha_plana, senha_hash)

def obter_hash_senha(senha):
    """Gera o hash da senha para armazenamento."""
    return pwd_context.hash(senha)

def autenticar_cliente(db: Session, email: str, senha: str):
    """
    Busca um cliente pelo email e verifica a senha.
    Retorna o objeto Cliente se sucesso, ou False se falhar.
    """
    # Busca no modelo Cliente
    cliente = db.query(models.Cliente).filter(models.Cliente.email == email).first()
    
    if not cliente:
        return False
    
    # Verifica a senha 
    if not verificar_senha(senha, cliente.senha):
        return False
        
    return cliente

def criar_token_acesso(data: dict):
    """Gera o token JWT com tempo de expiração."""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=settings.access_token_expire_minutes)
    to_encode.update({"exp": expire})
    
    encoded_jwt = jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)
    return encoded_jwt

async def obter_cliente_atual(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """
    Dependência para rotas protegidas. 
    Decodifica o token e busca o cliente no banco.
    """
    credential_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Não foi possível validar as credenciais",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        # O 'sub' no token agora guarda o idCliente (como string)
        cliente_id: str = payload.get("sub")
        
        if cliente_id is None:
            raise credential_exception
            
        # Converte para int pois o ID no banco é BigInteger/Int
        cliente_id_int = int(cliente_id)
        
    except (JWTError, ValueError):
        raise credential_exception
    
    # Busca o cliente pelo idCliente
    cliente = db.query(models.Cliente).filter(models.Cliente.idCliente == cliente_id_int).first()
    
    if cliente is None:
        raise credential_exception
        
    return cliente

# --- Rota de Registro ---
@auth_router.post("/registrar", status_code=201)
def registrar_cliente(cliente_in: schemas.ClienteSchema, db: Session = Depends(get_db)):
    
    # 1. Validar CPF
    if db.query(models.Cliente).filter(models.Cliente.cpf == cliente_in.cpf).first():
        raise HTTPException(status_code=400, detail="CPF já cadastrado")
    
    # 2. Validar Email
    if db.query(models.Cliente).filter(models.Cliente.email == cliente_in.email).first():
        raise HTTPException(status_code=400, detail="Email já cadastrado")

    # 3. Atribuir Gerente 
    gerente = db.query(models.Gerente).first()
    if not gerente:
        raise HTTPException(status_code=500, detail="Erro interno: Nenhum gerente disponível.")

    # 4. Criar Cliente
    hashed_password = obter_hash_senha(cliente_in.senha)
    
    db_cliente = models.Cliente(
        nome=cliente_in.nome,
        cpf=cliente_in.cpf,
        email=cliente_in.email,
        senha=hashed_password,
        telefone=cliente_in.telefone,
        endereco=cliente_in.endereco,
        dataNascimento=cliente_in.dataNascimento,
        fk_idGerente=gerente.idGerente
    )
    db.add(db_cliente)
    db.commit()
    db.refresh(db_cliente)

    # 5. Criar Conta Bancária Padrão
    numero_conta_gerado = int(f"{db_cliente.idCliente}{random.randint(1000,9999)}")
    
    db_conta = models.ContaBancaria(
        numeroConta=numero_conta_gerado,
        saldo=Decimal('0.00'),
        dataAbertura=date.today(),
        status="ATIVA",
        tipoConta="CORRENTE",
        fk_idCliente=db_cliente.idCliente
    )
    db.add(db_conta)
    db.commit()

    # 6. Log (MongoDB)
    try:
        mongodb.logs_eventos.insert_one({
            "tipo": "REGISTRO",
            "id_cliente": db_cliente.idCliente,
            "mensagem": f"Novo cliente registrado: {db_cliente.nome}",
            "data_hora": datetime.utcnow()
        })
    except:
        pass 
    
    return {
        "mensagem": "Cliente cadastrado com sucesso!",
        "cliente_id": db_cliente.idCliente,
        "nome": db_cliente.nome,
        "numero_conta": numero_conta_gerado
    }

# --- Rota de Login ---
@auth_router.post("/login", response_model=schemas.Token)
def login_cliente(dados_login: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # Busca cliente pelo email (agora a auth é direta na tabela Cliente)
    cliente = autenticar_cliente(db, dados_login.username, dados_login.password)
    print(1)
    if not cliente:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou senha incorretos",
        )
    
    # Cria Token JWT usando o idCliente
    access_token = criar_token_acesso(data={"sub": str(cliente.idCliente)})

    return {"access_token": access_token, "token_type": "bearer"}

# --- Rota: Minha Conta ---
@auth_router.get("/minha-conta", response_model=schemas.ClienteResponse)
def obter_minha_conta(cliente_atual: models.Cliente = Depends(obter_cliente_atual)):
    return cliente_atual


