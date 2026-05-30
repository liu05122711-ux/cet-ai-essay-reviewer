from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class EssayReviewRequest(BaseModel):
    title: str = Field(default="Untitled Essay", max_length=160)
    prompt: str | None = None
    text: str = Field(min_length=30, max_length=8000)


class HighlightSpan(BaseModel):
    start: int
    end: int
    type: str
    message: str
    suggestion: str | None = None


class Issue(BaseModel):
    text: str
    explanation: str
    suggestion: str | None = None


class Scores(BaseModel):
    total: int
    vocabulary: int
    grammar: int
    sentence_variety: int
    coherence: int
    task_completion: int
    cet6_prediction: int
    cet4_prediction: int


class ReviewResult(BaseModel):
    scores: Scores
    current_level: str
    excellent_gap_analysis: list[str]
    improve_to_80: list[str]
    improve_to_90: list[str]
    highlights: list[HighlightSpan]
    grammar_errors: list[Issue]
    spelling_errors: list[Issue]
    advanced_expressions: list[str]
    vocabulary_replacements: list[Issue]
    improvement_suggestions: list[str]
    polished_version: str
    high_score_sample: str
    optimized_translation: str
    version_80: str
    version_90: str
    full_score_sample: str


class EssayReviewResponse(BaseModel):
    id: int
    title: str
    prompt: str | None
    original_text: str
    result: ReviewResult
    created_at: datetime

    model_config = {"from_attributes": True}


class EssayListItem(BaseModel):
    id: int
    title: str
    total_score: int
    cet6_prediction: int
    cet4_prediction: int
    created_at: datetime


class AdminStats(BaseModel):
    users_count: int
    reviews_count: int
    latest_reviews: list[dict[str, Any]]
