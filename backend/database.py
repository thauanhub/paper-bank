
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from pymongo import MongoClient
from config import settings

# --- 1. Configuração do MySQL (SQLAlchemy) ---
# Note que agora usamos minúsculas: settings.db_user, settings.db_password, etc.
SQLALCHEMY_DATABASE_URL = (
    f"mysql+pymysql://{settings.db_user}:{settings.db_password}"
    f"@{settings.db_host}:{settings.db_port}/{settings.db_name}"
)

engine = create_engine(SQLALCHEMY_DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- 2. Configuração do MongoDB (PyMongo) ---
try:
    mongo_client = MongoClient(settings.mongodb_url)
    mongodb = mongo_client[settings.mongodb_db_name]
    print("Conexão com MongoDB estabelecida.")
except Exception as e:
    print(f"Erro ao conectar ao MongoDB: {e}")
    mongodb = None