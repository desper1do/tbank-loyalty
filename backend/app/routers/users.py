"""
Роутер для пользователей.
Данил: реализуй логику в services/, здесь только маршруты.
"""
from fastapi import APIRouter, HTTPException
from typing import List
from app.models.schemas import ForecastItem
from app.services.forecast import get_forecast
from app.services.data_loader import users_df

from app.models.schemas import (
    UserShort, UserDetail, BalanceItem,
    HistoryMonthItem, ForecastItem, GamificationData, AIAdviceResponse
)
from app.services import data_loader as dl

router = APIRouter()


@router.get("/", response_model=list[UserShort])
def get_all_users():
    """Список всех пользователей — для стартового экрана выбора."""
    users = dl.users_df.to_dict(orient="records")
    return users


@router.get("/{user_id}", response_model=UserDetail)
def get_user(user_id: int):
    """Профиль одного пользователя."""
    row = dl.users_df[dl.users_df["id"] == user_id]
    if row.empty:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    return row.iloc[0].to_dict()


@router.get("/{user_id}/balances", response_model=list[BalanceItem])
def get_user_balances(user_id: int):
    """Текущие балансы по всем программам лояльности пользователя."""
    # TODO Данил: реализовать через join accounts + loyalty_programs
    raise HTTPException(status_code=501, detail="Not implemented yet")


@router.get("/{user_id}/history", response_model=list[HistoryMonthItem])
def get_user_history(user_id: int):
    """История начислений кэшбэка по месяцам (для графика)."""
    # TODO Данил: агрегировать LoyaltyHistory по месяцам
    raise HTTPException(status_code=501, detail="Not implemented yet")


@router.get("/{user_id}/offers", response_model=list)
def get_user_offers(user_id: int):
    """Акции партнёров для сегмента пользователя."""
    # TODO Данил: фильтр Offers по financial_segment юзера
    raise HTTPException(status_code=501, detail="Not implemented yet")


@router.get(
    "/{user_id}/forecast",
    response_model=List[ForecastItem],
    summary="Прогноз кэшбэка до конца года",
    description=(
        "Возвращает прогнозируемую сумму кэшбэка по каждой программе лояльности "
        "пользователя до конца текущего года. "
        "Средний кэшбэк считается по последним 3 полным месяцам. "
        "Если пользователь не найден — 404."
    ),
    tags=["users"],
)
def get_user_forecast(user_id: int):
    """
    GET /users/{user_id}/forecast
 
    Алгоритм:
      - Проверяем существование пользователя.
      - Для каждой программы лояльности: считаем avg за 3 месяца.
      - months_left = 12 - текущий_месяц (не включая текущий).
      - forecast_amount = avg_monthly * months_left.
    """
    # Проверка: существует ли пользователь
    if user_id not in users_df["id"].values:
        raise HTTPException(
            status_code=404,
            detail=f"Пользователь с id={user_id} не найден",
        )
 
    forecast = get_forecast(user_id)
    return forecast

@router.get("/{user_id}/gamification", response_model=GamificationData)
def get_user_gamification(user_id: int):
    """Геймификация: стрики, бейджи, прогресс — Даша реализует логику."""
    # TODO Даша: логика в services/gamification.py
    raise HTTPException(status_code=501, detail="Not implemented yet")


@router.post("/{user_id}/ai-advice", response_model=AIAdviceResponse)
def get_ai_advice(user_id: int):
    """ИИ-совет по профилю пользователя — Данила реализует."""
    # TODO Данила: вызов OpenAI/Anthropic API
    raise HTTPException(status_code=501, detail="Not implemented yet")