from fastapi import APIRouter, Depends
from sqlalchemy import desc
from sqlalchemy.orm import Session

from app.api.deps import get_admin_user
from app.core.database import get_db
from app.models.essay import EssayReview
from app.models.user import User
from app.schemas.essay import AdminStats

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/stats", response_model=AdminStats)
def stats(db: Session = Depends(get_db), _: User = Depends(get_admin_user)):
    latest = db.query(EssayReview).order_by(desc(EssayReview.created_at)).limit(8).all()
    return AdminStats(
        users_count=db.query(User).count(),
        reviews_count=db.query(EssayReview).count(),
        latest_reviews=[
            {
                "id": item.id,
                "title": item.title,
                "user_id": item.user_id,
                "total_score": item.result["scores"]["total"],
                "created_at": item.created_at.isoformat(),
            }
            for item in latest
        ],
    )

