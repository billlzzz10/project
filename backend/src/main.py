from flask import Flask, send_from_directory
from flask_cors import CORS
import os

from .models import db
from .config import DevelopmentConfig

# Import service classes
from .services.ai_service import AIService
from .services.analytics_service import AnalyticsService
from .services.enhanced_rag_service import EnhancedRAGService
from .services.external_integrations import IntegrationManager
from .services.n8n_service import N8NService
from .services.notification_service import NotificationService
from .services.scheduler_service import SchedulerService
from .services.visualization_service import VisualizationService
from .services.notion_service import NotionService

# Import all blueprints
from .routes.chat import chat_bp
from .routes.profile import profile_bp
from .routes.sharing import sharing_bp
from .routes.analytics import analytics_bp
from .routes.automation import automation_bp
from .routes.file_upload import file_upload_bp
from .routes.integrations import integrations_bp
from .routes.notification import notification_bp
from .routes.prompt_tool import prompt_tool_bp
from .routes.visualization import visualization_bp
from .routes.notion import notion_bp


def create_app(config_object=DevelopmentConfig):
    """Create and configure an instance of the Flask application."""
    app = Flask(__name__, static_folder="../../frontend/build", static_url_path="/")
    app.config.from_object(config_object)

    # Enable CORS
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Initialize extensions
    db.init_app(app)

    # Initialize and attach services to the app context
    with app.app_context():
        app.ai_service = AIService()
        app.analytics_service = AnalyticsService()
        try:
            app.rag_service = EnhancedRAGService()
        except Exception as e:
            import logging

            logging.error(f"Failed to initialize EnhancedRAGService: {e}")
            app.rag_service = None
        app.integration_manager = IntegrationManager()
        app.n8n_service = N8NService()
        app.notification_service = NotificationService()
        app.scheduler_service = SchedulerService()
        app.visualization_service = VisualizationService()
        app.notion_service = NotionService()

    # Register blueprints
    app.register_blueprint(chat_bp)
    app.register_blueprint(profile_bp)
    app.register_blueprint(sharing_bp)
    app.register_blueprint(analytics_bp)
    app.register_blueprint(automation_bp)
    app.register_blueprint(file_upload_bp)
    app.register_blueprint(integrations_bp)
    app.register_blueprint(notification_bp)
    app.register_blueprint(prompt_tool_bp)
    app.register_blueprint(visualization_bp)
    app.register_blueprint(notion_bp)

    with app.app_context():
        # Import all models to ensure they are registered with SQLAlchemy
        from . import models

        # Create database tables for our data models
        db.create_all()

    @app.route("/health")
    def health_check():
        return "OK", 200

    @app.route("/", defaults={"path": ""})
    @app.route("/<path:path>")
    def serve(path):
        if path != "" and os.path.exists(app.static_folder + "/" + path):
            return send_from_directory(app.static_folder, path)
        else:
            return send_from_directory(app.static_folder, "index.html")

    return app


# To run this app:
# 1. Set the FLASK_APP environment variable: export FLASK_APP=src.main
# 2. Run the flask command: flask run
