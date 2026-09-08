import warnings

warnings.filterwarnings("ignore", message=".*Pydantic V1.*")

from app import create_app  # noqa: E402

app = create_app()

if __name__ == "__main__":
    app.run(debug=app.debug)
