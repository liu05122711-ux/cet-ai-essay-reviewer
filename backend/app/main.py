from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import admin, auth, essays
from app.core.config import get_settings
from app.models.init_db import init_db

settings = get_settings()

app = FastAPI(title=settings.app_name, version="1.0.0", openapi_url=f"{settings.api_prefix}/openapi.json")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    init_db()


@app.get("/health")
def health():
    return {"status": "ok"}


app.include_router(auth.router, prefix=settings.api_prefix)
app.include_router(essays.router, prefix=settings.api_prefix)
app.include_router(admin.router, prefix=settings.api_prefix)

