import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Config:
    """Base configuration."""
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'a_very_secret_key'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    # Add other base configurations here

class DevelopmentConfig(Config):
    """Development configuration."""
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = os.environ.get('DEV_DATABASE_URL') or f"sqlite:///{os.path.join(os.path.abspath(os.path.dirname(__file__)), 'app_dev.db')}"
    
    # AI API Keys
    GOOGLE_API_KEY = os.environ.get('GOOGLE_API_KEY')
    HUGGINGFACE_API_KEY = os.environ.get('HUGGINGFACE_API_KEY')
    
    # External APIs
    N8N_WEBHOOK_URL = os.environ.get('N8N_WEBHOOK_URL')
    GOOGLE_DRIVE_CREDENTIALS = os.environ.get('GOOGLE_DRIVE_CREDENTIALS')
    GOOGLE_SHEETS_CREDENTIALS = os.environ.get('GOOGLE_SHEETS_CREDENTIALS')
    NOTION_API_KEY = os.environ.get('NOTION_API_KEY')
    AIRTABLE_API_KEY = os.environ.get('AIRTABLE_API_KEY')

class ProductionConfig(Config):
    """Production configuration."""
    DEBUG = False
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') # Use a robust DB like PostgreSQL in production
    
    # Load production keys from environment variables
    GOOGLE_API_KEY = os.environ.get('GOOGLE_API_KEY')
    HUGGINGFACE_API_KEY = os.environ.get('HUGGINGFACE_API_KEY')
    N8N_WEBHOOK_URL = os.environ.get('N8N_WEBHOOK_URL')
    GOOGLE_DRIVE_CREDENTIALS = os.environ.get('GOOGLE_DRIVE_CREDENTIALS')
    GOOGLE_SHEETS_CREDENTIALS = os.environ.get('GOOGLE_SHEETS_CREDENTIALS')
    NOTION_API_KEY = os.environ.get('NOTION_API_KEY')
    AIRTABLE_API_KEY = os.environ.get('AIRTABLE_API_KEY')

class TestingConfig(Config):
    """Testing configuration."""
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:' # Use in-memory SQLite database for tests
