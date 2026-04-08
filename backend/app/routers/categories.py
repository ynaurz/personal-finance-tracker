from sqlalchemy import select
from sqlalchemy.orm import Session

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.database import get_db
from app.models.category import Category
from app.models.user import User
from app.routers.auth import get_current_user
from app.schemas.category import CategoryCreate, CategoryResponse

router = APIRouter(prefix="/categories", tags=["Categories"])


@router.post("/", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
def create_category(
    category_data: CategoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    existing_category = db.execute(
        select(Category).where(
            Category.user_id == current_user.id,
            Category.name == category_data.name,
            Category.type == category_data.type,
        )
    ).scalar_one_or_none()

    if existing_category:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Category with this name and type already exists",
        )

    new_category = Category(
        name=category_data.name,
        type=category_data.type,
        color=category_data.color,
        icon=category_data.icon,
        user_id=current_user.id,
    )

    db.add(new_category)
    db.commit()
    db.refresh(new_category)

    return new_category


@router.get("/", response_model=list[CategoryResponse])
def list_categories(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    categories = db.execute(
        select(Category).where(Category.user_id == current_user.id).order_by(Category.id.desc())
    ).scalars().all()

    return categories


@router.get("/{category_id}", response_model=CategoryResponse)
def get_category(
    category_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    category = db.execute(
        select(Category).where(
            Category.id == category_id,
            Category.user_id == current_user.id,
        )
    ).scalar_one_or_none()

    if category is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found",
        )

    return category


@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(
    category_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    category = db.execute(
        select(Category).where(
            Category.id == category_id,
            Category.user_id == current_user.id,
        )
    ).scalar_one_or_none()

    if category is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found",
        )

    db.delete(category)
    db.commit()