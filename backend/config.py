import os
from datetime import timedelta

BASE_DIR = os.path.abspath(os.path.dirname(__file__))

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "academic-bloom-secret-key-2026-super-secure-production-ready-64bit")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "academic-bloom-jwt-secret-2026-super-secure-production-ready-64bit")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=7)
    
    # Database: Supports PostgreSQL (production/Render/Supabase) with SQLite fallback for local development
    database_url = os.getenv("DATABASE_URL")
    if database_url and database_url.startswith("postgres://"):
        database_url = database_url.replace("postgres://", "postgresql://", 1)
    
    SQLALCHEMY_DATABASE_URI = database_url or f"sqlite:///{os.path.join(BASE_DIR, 'learning_bloom.db')}"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # File Uploads
    UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads")
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max upload
    ALLOWED_EXTENSIONS = {"pdf", "doc", "docx", "ppt", "pptx", "txt", "png", "jpg", "jpeg"}
    
    # Gemini AI API Key
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
