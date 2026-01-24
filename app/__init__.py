from flask import Flask

from app.extensions import db
from app.models.tasks import Base
from app.api.v1.routes.tasks import tasks_bp
from app.api.v1.routes.main import main_bp

def create_app() -> Flask:
    app: Flask = Flask(
        __name__, template_folder="views/templates", static_folder="views/static"
    )

    app.config["SQLALCHEMY_ENGINES"] = {"default": "sqlite:///db.sqlite"}

    db.init_app(app)

    with app.app_context():
        Base.metadata.create_all(db.engine)

    app.register_blueprint(tasks_bp, url_prefix="/api/v1")
    app.register_blueprint(main_bp, url_prefix="/")


    return app
