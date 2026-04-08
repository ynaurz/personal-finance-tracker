from datetime import date
from decimal import Decimal

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.category import Category
from app.models.transaction import Transaction, TransactionType


def get_balance_stats(db: Session, user_id: int) -> dict:
    total_income = db.execute(
        select(func.coalesce(func.sum(Transaction.amount), 0)).where(
            Transaction.user_id == user_id,
            Transaction.type == TransactionType.INCOME,
        )
    ).scalar_one()

    total_expense = db.execute(
        select(func.coalesce(func.sum(Transaction.amount), 0)).where(
            Transaction.user_id == user_id,
            Transaction.type == TransactionType.EXPENSE,
        )
    ).scalar_one()

    balance = Decimal(total_income) - Decimal(total_expense)

    return {
        "total_income": total_income,
        "total_expense": total_expense,
        "balance": balance,
    }


def get_category_stats(db: Session, user_id: int):
    result = db.execute(
        select(
            Category.id.label("category_id"),
            Category.name.label("category_name"),
            Category.type.label("category_type"),
            func.coalesce(func.sum(Transaction.amount), 0).label("total_amount"),
        )
        .join(Transaction, Transaction.category_id == Category.id)
        .where(Transaction.user_id == user_id)
        .group_by(Category.id, Category.name, Category.type)
        .order_by(func.sum(Transaction.amount).desc())
    ).all()

    return [
        {
            "category_id": row.category_id,
            "category_name": row.category_name,
            "category_type": row.category_type.value if hasattr(row.category_type, "value") else str(row.category_type),
            "total_amount": row.total_amount,
        }
        for row in result
    ]


def get_period_stats(db: Session, user_id: int, start_date: date, end_date: date) -> dict:
    total_income = db.execute(
        select(func.coalesce(func.sum(Transaction.amount), 0)).where(
            Transaction.user_id == user_id,
            Transaction.type == TransactionType.INCOME,
            Transaction.transaction_date >= start_date,
            Transaction.transaction_date <= end_date,
        )
    ).scalar_one()

    total_expense = db.execute(
        select(func.coalesce(func.sum(Transaction.amount), 0)).where(
            Transaction.user_id == user_id,
            Transaction.type == TransactionType.EXPENSE,
            Transaction.transaction_date >= start_date,
            Transaction.transaction_date <= end_date,
        )
    ).scalar_one()

    balance = Decimal(total_income) - Decimal(total_expense)

    return {
        "start_date": start_date.isoformat(),
        "end_date": end_date.isoformat(),
        "total_income": total_income,
        "total_expense": total_expense,
        "balance": balance,
    }