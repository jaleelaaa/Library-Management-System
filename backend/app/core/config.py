"""
Core configuration settings for the FOLIO LMS application.
Uses Pydantic Settings for environment variable management.
"""

import json
from typing import List, Union, Annotated
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import BeforeValidator


def parse_cors(v):
    """Parse CORS origins from string or list."""
    if isinstance(v, str):
        if v.startswith("["):
            # Parse JSON array
            return json.loads(v)
        else:
            # Parse comma-separated string
            return [i.strip() for i in v.split(",")]
    return v


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True,
        extra="ignore",
    )

    # Application Info
    APP_NAME: str = "FOLIO LMS"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    ENVIRONMENT: str = "development"

    # API Configuration
    API_V1_PREFIX: str = "/api/v1"

    # Database
    DATABASE_URL: str

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # Elasticsearch
    ELASTICSEARCH_URL: str = "http://localhost:9200"

    # JWT Authentication
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # SMTP/Email Configuration
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USERNAME: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM_EMAIL: str = "noreply@folio-lms.com"
    SMTP_FROM_NAME: str = "FOLIO Library Management System"
    SMTP_USE_TLS: bool = True
    SMTP_USE_SSL: bool = False

    # CORS
    BACKEND_CORS_ORIGINS: Annotated[List[str], BeforeValidator(parse_cors)] = ["http://localhost:3000"]

    # Pagination
    DEFAULT_PAGE_SIZE: int = 10
    MAX_PAGE_SIZE: int = 100

    # Multi-tenancy
    DEFAULT_TENANT: str = "default"
    ENABLE_MULTI_TENANCY: bool = True

    # File Upload
    MAX_UPLOAD_SIZE: int = 10485760  # 10MB
    ALLOWED_EXTENSIONS: List[str] = ["pdf", "epub", "mobi", "jpg", "jpeg", "png"]


# Global settings instance
settings = Settings()
