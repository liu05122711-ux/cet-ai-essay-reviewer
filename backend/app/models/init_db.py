from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.database import Base, engine
from app.core.security import hash_password
from app.models.essay import EssayReview
from app.models.user import User


def init_db() -> None:
    Base.metadata.create_all(bind=engine)
    seed_admin()


def seed_admin() -> None:
    settings = get_settings()
    with Session(engine) as db:
        admin = db.query(User).filter(User.email == "admin@example.com").first()
        if admin:
            return
        db.add(
            User(
                email="admin@example.com",
                name="Admin",
                hashed_password=hash_password("Admin123456"),
                is_admin=True,
            )
        )
        db.commit()

