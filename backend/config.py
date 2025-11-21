
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    db_user: str = "root"
    db_password: str = "" 
    db_host: str = "localhost"
    db_port: str = "3306"
    db_name: str = "paperbank"

    mongodb_url: str = "mongodb://localhost:27017"
    mongodb_db_name: str = "paperbank_logs"

    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()