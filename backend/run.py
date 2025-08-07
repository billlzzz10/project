import os
from src.main import create_app
from src.config import DevelopmentConfig, ProductionConfig

# Get configuration from environment variable
# Default to DevelopmentConfig if not set
config_name = os.getenv("FLASK_CONFIG") or "development"

if config_name == "production":
    config_object = ProductionConfig
else:
    config_object = DevelopmentConfig

app = create_app(config_object)

if __name__ == "__main__":
    # Use SocketIO for running the app if it's part of the app factory
    # This part might need adjustment based on how SocketIO is initialized
    # For now, we run the standard Flask development server
    app.run(host="0.0.0.0", port=5001, debug=config_object.DEBUG)
