from flask import Flask
from flask_cors import CORS


def setup_cors(app: Flask):
    """Configure CORS for the app."""
    # Auth usa Bearer token en Authorization header, no cookies.
    # supports_credentials=True era peso muerto y amplía superficie de ataque.
    CORS(
        app,
        origins=app.config["CORS_ORIGINS"],
    )
