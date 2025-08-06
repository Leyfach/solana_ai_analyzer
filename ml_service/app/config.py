from pydantic import BaseSettings

class Settings(BaseSettings):
    app_name: str = "Solana Token ML Scorer"
    debug: bool = True
    cors_origins: list = ["http://localhost:3000", "http://127.0.0.1:3000"]
    
    class Config:
        env_file = ".env"

settings = Settings()