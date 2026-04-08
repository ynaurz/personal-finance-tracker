from datetime import date, datetime
from decimal import Decimal
from enum import Enum

from pydantic import BaseModel, ConfigDict, Field


class TransactionType(str, Enum):
    INCOME = "income"
    EXPENSE = "expense"


class TransactionBase(BaseModel):
    title: str = Field(min_length=2, max_length=255)
    amount: Decimal = Field(gt=0)
    type: TransactionType
    note: str | None = Field(default=None, max_length=1000)
    transaction_date: date
    category_id: int


class TransactionCreate(TransactionBase):
    pass


class TransactionUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=2, max_length=255)
    amount: Decimal | None = Field(default=None, gt=0)
    type: TransactionType | None = None
    note: str | None = Field(default=None, max_length=1000)
    transaction_date: date | None = None
    category_id: int | None = None


class TransactionResponse(TransactionBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)