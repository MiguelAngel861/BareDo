from flask import Flask, render_template

from app.routes.tasks import tasks_bp
from app.extensions import db
from app.models.tasks import Base

def create_app() -> Flask:
    app: Flask = Flask(__name__, template_folder="views/templates", static_folder="views/static")
    
    app.config["SQLALCHEMY_ENGINES"] = {
        "default": "sqlite:///db.sqlite"
    }
    
    db.init_app(app)
    
    with app.app_context():
        Base.metadata.create_all(db.engine)

    app.register_blueprint(tasks_bp, url_prefix="/api/v1")
    
    @app.route("/")
    def index():
        return render_template("index.html")

    return app
