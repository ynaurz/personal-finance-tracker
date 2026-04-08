from datetime import date

from sqlalchemy.orm import Session

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.database import get_db
from app.models.user import User
from app.routers.auth import get_current_user
from app.schemas.stats import (
    BalanceStatsResponse,
    CategoryStatsItem,
    PeriodStatsResponse,
)
from app.services.stats_service import (
    get_balance_stats,
    get_category_stats,
    get_period_stats,
)

router = APIRouter(prefix="/stats", tags=["Stats"])


@router.get("/balance", response_model=BalanceStatsResponse)
def read_balance_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_balance_stats(db, current_user.id)


@router.get("/categories", response_model=list[CategoryStatsItem])
def read_category_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_category_stats(db, current_user.id)


@router.get("/period", response_model=PeriodStatsResponse)
def read_period_stats(
    start_date: date = Query(...),
    end_date: date = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if start_date > end_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="start_date cannot be later than end_date",
        )

    return get_period_stats(db, current_user.id, start_date, end_date)