from flask import Flask
from flask_cors import CORS


def setup_cors(app: Flask):
    """Configure CORS for the app."""
    CORS(
        app,
        origins=[
            "http://localhost:5000",
            "http://127.0.0.1:5000",
            "http://localhost:5500",
            "http://127.0.0.1:5500",
        ],
        supports_credentials=True,
    )
