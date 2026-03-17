from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # App
    APP_NAME: str = "Polsia MVP"
    APP_VERSION: str = "0.1.0"
    DEBUG: bool = True
    API_PREFIX: str = "/api/v1"

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://polsia:polsia@localhost:5432/polsia"

    # Auth
    SECRET_KEY: str = "change-me-in-production-use-openssl-rand-hex-32"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # OpenAI
    OPENAI_API_KEY: str = ""
    OPENAI_MODEL: str = "gpt-4"

    # Stripe
    STRIPE_SECRET_KEY: str = ""
    STRIPE_WEBHOOK_SECRET: str = ""
    STRIPE_PRICE_ID: str = ""

    # Docker
    DOCKER_NETWORK: str = "polsia-network"
    DEPLOY_BASE_DOMAIN: str = "localhost"

    # Agent
    AGENT_CYCLE_INTERVAL_HOURS: int = 24
    MAX_TASKS_FREE: int = 5
    MAX_TASKS_PAID: int = 45
    REVENUE_SHARE_PERCENT: float = 20.0

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
