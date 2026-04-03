from pydantic import BaseModel, Field
import os
from dotenv import load_dotenv
from pathlib import Path


load_dotenv(dotenv_path=Path(__file__).resolve().parents[1] / ".env")


class Settings(BaseModel):
    mongodb_uri: str = Field(default_factory=lambda: os.getenv("MONGODB_URI", "mongodb://localhost:27018"))
    db_name: str = Field(default_factory=lambda: os.getenv("MONGODB_DB", "toying_idea"))
    jwt_secret: str = Field(default_factory=lambda: os.getenv("JWT_SECRET", "change-me"))
    jwt_algorithm: str = "HS256"
    cors_origins: list[str] = Field(default_factory=lambda: (os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")))


settings = Settings()
