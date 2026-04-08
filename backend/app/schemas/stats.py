from decimal import Decimal
from pydantic import BaseModel


class BalanceStatsResponse(BaseModel):
    total_income: Decimal
    total_expense: Decimal
    balance: Decimal


class CategoryStatsItem(BaseModel):
    category_id: int
    category_name: str
    category_type: str
    total_amount: Decimal


class PeriodStatsResponse(BaseModel):
    start_date: str
    end_date: str
    total_income: Decimal
    total_expense: Decimal
    balance: Decimal