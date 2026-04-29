from datetime import datetime
from typing import List

import pandas as pd

from app.services.data_loader import (
    accounts_df,
    loyalty_history_df,
    loyalty_programs_df,
    users_df,
)
from app.models.schemas import ForecastItem


def get_forecast(user_id: int) -> List[ForecastItem]:
    """
    Возвращает прогноз кэшбэка до конца текущего года
    по каждой программе лояльности пользователя.
    """
    # ── 1. Проверяем, что пользователь существует ────────────────────────
    if user_id not in users_df["id"].values:
        return []  # Вызывающий роутер поднимет 404 раньше этой точки

    # ── 2. Аккаунты пользователя ─────────────────────────────────────────
    user_accounts = accounts_df[accounts_df["user_id"] == user_id].copy()

    if user_accounts.empty:
        return []

    # Добавляем program_name и currency через join с loyalty_programs
    # ИСПРАВЛЕНИЕ: Используем правильные названия колонок
    user_accounts = user_accounts.merge(
        loyalty_programs_df[["loyalty_program_id", "loyalty_program_name", "cashback_currency"]],
        on="loyalty_program_id",
        how="left",
    )

    # ── 3. История начислений для этих аккаунтов ─────────────────────────
    account_ids = user_accounts["account_id"].tolist()
    history = loyalty_history_df[
        loyalty_history_df["account_id"].isin(account_ids)
    ].copy()

    # ── 4. Определяем «последние 3 полных месяца» ─────────────────────────
    now = datetime.now()
    current_period = pd.Period(now, "M")
    lookback_periods = [str(current_period - i) for i in range(1, 4)]

    # ── 5. Количество оставшихся до конца года месяцев ────────────────────
    months_left = 12 - now.month

    # ── 6. Считаем avg по каждой программе ───────────────────────────────
    results: List[ForecastItem] = []

    for _, account_row in user_accounts.iterrows():
        acc_id = account_row["account_id"]
        
        # ИСПРАВЛЕНИЕ: Берем данные из правильных колонок
        program_name = account_row["loyalty_program_name"]
        currency = account_row["cashback_currency"]

        # История только для этого аккаунта
        acc_history = history[history["account_id"] == acc_id].copy()

        if acc_history.empty:
            avg_monthly = 0.0
        else:
            # Принудительно конвертируем текст в дату
            acc_history["payout_date"] = pd.to_datetime(acc_history["payout_date"])
            
            # Добавляем колонку period
            acc_history["month"] = (
                acc_history["payout_date"]
                .dt.to_period("M")
                .astype(str)
            )

            # Фильтруем по lookback-окну
            recent = acc_history[acc_history["month"].isin(lookback_periods)]

            if recent.empty:
                monthly_totals = (
                    acc_history.groupby("month")["cashback_amount"]
                    .sum()
                )
            else:
                monthly_totals = (
                    recent.groupby("month")["cashback_amount"]
                    .sum()
                )

            # Защита от NaN
            if monthly_totals.empty or pd.isna(monthly_totals.mean()):
                avg_monthly = 0.0
            else:
                avg_monthly = float(monthly_totals.mean())

        forecast_amount = round(avg_monthly * months_left, 2)
        avg_monthly = round(avg_monthly, 2)

        results.append(
            ForecastItem(
                program_name=program_name,
                currency=currency,
                avg_monthly=avg_monthly,
                months_left=months_left,
                forecast_amount=forecast_amount,
            )
        )

    return results