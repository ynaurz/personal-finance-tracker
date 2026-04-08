from sqlalchemy import select
from sqlalchemy.orm import Session

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.database import get_db
from app.models.category import Category
from app.models.transaction import Transaction
from app.models.user import User
from app.routers.auth import get_current_user
from app.schemas.transaction import (
    TransactionCreate,
    TransactionResponse,
    TransactionType,
    TransactionUpdate,
)

router = APIRouter(prefix="/transactions", tags=["Transactions"])


def validate_category_for_transaction(
    category: Category | None,
    current_user: User,
    transaction_type: str,
) -> None:
    if category is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found",
        )

    if category.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You cannot use this category",
        )

    if category.type.value != transaction_type:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Transaction type must match category type",
        )


@router.post("/", response_model=TransactionResponse, status_code=status.HTTP_201_CREATED)
def create_transaction(
    transaction_data: TransactionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    category = db.execute(
        select(Category).where(Category.id == transaction_data.category_id)
    ).scalar_one_or_none()

    validate_category_for_transaction(category, current_user, transaction_data.type.value)

    new_transaction = Transaction(
        title=transaction_data.title,
        amount=transaction_data.amount,
        type=transaction_data.type,
        note=transaction_data.note,
        transaction_date=transaction_data.transaction_date,
        category_id=transaction_data.category_id,
        user_id=current_user.id,
    )

    db.add(new_transaction)
    db.commit()
    db.refresh(new_transaction)

    return new_transaction


@router.get("/", response_model=list[TransactionResponse])
def list_transactions(
    type: TransactionType | None = Query(default=None),
    category_id: int | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = select(Transaction).where(Transaction.user_id == current_user.id)

    if type is not None:
        query = query.where(Transaction.type == type)

    if category_id is not None:
        query = query.where(Transaction.category_id == category_id)

    query = query.order_by(Transaction.transaction_date.desc(), Transaction.id.desc())

    transactions = db.execute(query).scalars().all()
    return transactions


@router.get("/{transaction_id}", response_model=TransactionResponse)
def get_transaction(
    transaction_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    transaction = db.execute(
        select(Transaction).where(
            Transaction.id == transaction_id,
            Transaction.user_id == current_user.id,
        )
    ).scalar_one_or_none()

    if transaction is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found",
        )

    return transaction


@router.put("/{transaction_id}", response_model=TransactionResponse)
def update_transaction(
    transaction_id: int,
    transaction_data: TransactionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    transaction = db.execute(
        select(Transaction).where(
            Transaction.id == transaction_id,
            Transaction.user_id == current_user.id,
        )
    ).scalar_one_or_none()

    if transaction is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found",
        )

    update_data = transaction_data.model_dump(exclude_unset=True)

    new_type = update_data.get("type", transaction.type)
    new_category_id = update_data.get("category_id", transaction.category_id)

    if "type" in update_data or "category_id" in update_data:
        category = db.execute(
            select(Category).where(Category.id == new_category_id)
        ).scalar_one_or_none()

        validate_category_for_transaction(category, current_user, new_type.value)

    for field, value in update_data.items():
        setattr(transaction, field, value)

    db.commit()
    db.refresh(transaction)

    return transaction


@router.delete("/{transaction_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_transaction(
    transaction_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    transaction = db.execute(
        select(Transaction).where(
            Transaction.id == transaction_id,
            Transaction.user_id == current_user.id,
        )
    ).scalar_one_or_none()

    if transaction is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found",
        )

    db.delete(transaction)
    db.commit()