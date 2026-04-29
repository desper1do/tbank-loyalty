"""
Pydantic-схемы для всех ответов API.
Данил: добавляй сюда новые схемы по мере необходимости.
"""
from pydantic import BaseModel, Field
from typing import Optional


# --- Пользователи ---

class UserShort(BaseModel):
    id: int
    full_name: str
    email: str
    phone_number: str
    financial_segment: str  # LOW | MEDIUM | HIGH


class UserDetail(UserShort):
    pass


# --- Программы лояльности ---

class LoyaltyProgram(BaseModel):
    loyalty_program_id: int
    loyalty_program_name: str
    cashback_currency: str


# --- Балансы ---

class BalanceItem(BaseModel):
    program_name: str
    currency: str
    current_balance: float


# --- История (агрегировано по месяцам для графика) ---

class HistoryMonthItem(BaseModel):
    month: str          # "2025-01"
    program_name: str
    total_cashback: float


# --- Прогноз ---

class ForecastItem(BaseModel):
    """Прогноз накоплений по одной программе лояльности до конца года."""
 
    program_name: str = Field(
        ...,
        description="Название программы лояльности (Black / All Airlines / Platinum)",
        examples=["Black"],
    )
    currency: str = Field(
        ...,
        description="Единица кэшбэка: rub / miles / bravo",
        examples=["rub"],
    )
    avg_monthly: float = Field(
        ...,
        description="Средний кэшбэк за последние 3 месяца",
        examples=[3200.0],
    )
    months_left: int = Field(
        ...,
        description="Количество полных месяцев до конца текущего года",
        examples=[8],
    )
    forecast_amount: float = Field(
        ...,
        description="Прогнозируемая сумма кэшбэка: avg_monthly × months_left",
        examples=[25600.0],
    )
 
    class Config:
        json_schema_extra = {
            "example": {
                "program_name": "Black",
                "currency": "rub",
                "avg_monthly": 3200.0,
                "months_left": 8,
                "forecast_amount": 25600.0,
            }
        }


# --- Офферы ---

class OfferItem(BaseModel):
    partner_id: int
    partner_name: str
    short_description: str
    logo_url: str
    brand_color_hex: str
    cashback_percent: int
    financial_segment: str


# --- Геймификация ---

class Badge(BaseModel):
    id: str
    title: str
    description: str
    earned: bool
    icon: str           # эмодзи или название иконки


class GamificationData(BaseModel):
    streak_months: int
    badges: list[Badge]
    next_level: Optional[str]       # следующий сегмент (LOW→MEDIUM→HIGH)
    progress_percent: Optional[int] # прогресс до следующего уровня


# --- ИИ совет ---

class AIAdviceResponse(BaseModel):
    advice: str