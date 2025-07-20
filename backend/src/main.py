from flask import Flask, send_from_directory
from flask_cors import CORS
import os

from .models import db
from .config import DevelopmentConfig, ProductionConfig

# Import all blueprints
from .chat import chat_bp
from .routes.profile import profile_bp
from .routes.sharing import sharing_bp
# Assuming other blueprints are in src/routes
from .routes.analytics_service import analytics_bp
from .routes.automation import automation_bp
from .routes.file_upload import file_upload_bp
from .routes.integrations import integrations_bp
from .routes.notification_service import notification_bp
from .routes.prompt_tool import prompt_tool_bp
from .routes.visualization_service import visualization_bp
# Note: user_bp is missing from the provided file structure, assuming it exists
# from .routes.user import user_bp


def create_app(config_object=DevelopmentConfig):
    """Create and configure an instance of the Flask application."""
    app = Flask(__name__, static_folder='../../frontend/build', static_url_path='/')
    app.config.from_object(config_object)

    # Enable CORS
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Initialize extensions
    db.init_app(app)

    # Register blueprints
    app.register_blueprint(chat_bp, url_prefix='/api/chat')
    app.register_blueprint(profile_bp, url_prefix='/api/profile')
    app.register_blueprint(sharing_bp, url_prefix='/api/sharing')
    app.register_blueprint(analytics_bp, url_prefix='/api/analytics')
    app.register_blueprint(automation_bp, url_prefix='/api/automation')
    app.register_blueprint(file_upload_bp, url_prefix='/api/files')
    app.register_blueprint(integrations_bp, url_prefix='/api/integrations')
    app.register_blueprint(notification_bp, url_prefix='/api/notifications')
    app.register_blueprint(prompt_tool_bp, url_prefix='/api/prompt-tool')
    app.register_blueprint(visualization_bp, url_prefix='/api/visualization')
    # app.register_blueprint(user_bp, url_prefix='/api/users')


    with app.app_context():
        # Import all models to ensure they are registered with SQLAlchemy
        from . import models
        # Create database tables for our data models
        db.create_all()

    @app.route('/health')
    def health_check():
        return "OK", 200

    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def serve(path):
        if path != "" and os.path.exists(app.static_folder + '/' + path):
            return send_from_directory(app.static_folder, path)
        else:
            return send_from_directory(app.static_folder, 'index.html')

    return app

# To run this app:
# 1. Set the FLASK_APP environment variable: export FLASK_APP=src.main
# 2. Run the flask command: flask run
