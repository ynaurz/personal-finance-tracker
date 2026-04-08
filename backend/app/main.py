from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.routers.auth import router as auth_router
from app.routers.categories import router as categories_router
from app.routers.transactions import router as transactions_router
from app.routers.stats import router as stats_router

app = FastAPI(title="Personal Finance Tracker API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.backend_cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(categories_router)
app.include_router(transactions_router)
app.include_router(stats_router)

@app.get("/health")
def health_check():
    return {"status": "ok"}