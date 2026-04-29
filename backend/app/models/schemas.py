"""
Pydantic-схемы для всех ответов API.
Данил: добавляй сюда новые схемы по мере необходимости.
"""
from pydantic import BaseModel
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
    program_name: str
    currency: str
    avg_monthly: float
    months_left: int
    forecast_amount: float   # avg_monthly * months_left


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