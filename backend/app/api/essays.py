from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import desc
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.essay import EssayReview
from app.models.user import User
from app.schemas.essay import EssayListItem, EssayReviewRequest, EssayReviewResponse
from app.services.ai_review import review_essay

router = APIRouter(prefix="/essays", tags=["essays"])


@router.post("/review", response_model=EssayReviewResponse)
async def create_review(payload: EssayReviewRequest, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    result = await review_essay(payload.text, payload.prompt)
    review = EssayReview(
        user_id=user.id,
        title=payload.title or "Untitled Essay",
        prompt=payload.prompt,
        original_text=payload.text,
        result=result.model_dump(),
    )
    db.add(review)
    db.commit()
    db.refresh(review)
    return review


@router.get("", response_model=list[EssayListItem])
def list_reviews(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    reviews = (
        db.query(EssayReview)
        .filter(EssayReview.user_id == user.id)
        .order_by(desc(EssayReview.created_at))
        .limit(50)
        .all()
    )
    return [
        EssayListItem(
            id=item.id,
            title=item.title,
            total_score=item.result["scores"]["total"],
            cet6_prediction=item.result["scores"]["cet6_prediction"],
            cet4_prediction=item.result["scores"]["cet4_prediction"],
            created_at=item.created_at,
        )
        for item in reviews
    ]


@router.get("/{review_id}", response_model=EssayReviewResponse)
def get_review(review_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    review = db.get(EssayReview, review_id)
    if not review or review.user_id != user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review not found")
    return review

