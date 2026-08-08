from flask import Flask
from flask_cors import CORS


def setup_cors(app: Flask):
    """Configure CORS for the app."""
    CORS(
        app,
        origins=app.config["CORS_ORIGINS"],
        supports_credentials=True,
    )
