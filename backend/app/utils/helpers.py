from app.models.category import Category, CategoryType


def get_default_categories(user_id: int) -> list[Category]:
    return [
        Category(name="Salary", type=CategoryType.INCOME, color="#22C55E", icon="wallet", user_id=user_id),
        Category(name="Freelance", type=CategoryType.INCOME, color="#16A34A", icon="briefcase", user_id=user_id),
        Category(name="Gift", type=CategoryType.INCOME, color="#4ADE80", icon="gift", user_id=user_id),

        Category(name="Food", type=CategoryType.EXPENSE, color="#EF4444", icon="utensils", user_id=user_id),
        Category(name="Transport", type=CategoryType.EXPENSE, color="#F97316", icon="car", user_id=user_id),
        Category(name="Shopping", type=CategoryType.EXPENSE, color="#EC4899", icon="shopping-bag", user_id=user_id),
        Category(name="Entertainment", type=CategoryType.EXPENSE, color="#8B5CF6", icon="film", user_id=user_id),
        Category(name="Health", type=CategoryType.EXPENSE, color="#06B6D4", icon="heart", user_id=user_id),
    ]