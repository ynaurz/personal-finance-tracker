from datetime import datetime
from enum import Enum

from pydantic import BaseModel, ConfigDict, Field


class CategoryType(str, Enum):
    INCOME = "income"
    EXPENSE = "expense"


class CategoryBase(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    type: CategoryType
    color: str = Field(default="#4F46E5", max_length=20)
    icon: str = Field(default="wallet", max_length=50)


class CategoryCreate(CategoryBase):
    pass


class CategoryResponse(CategoryBase):
    id: int
    user_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)