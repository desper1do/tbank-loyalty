"""
Логика геймификации: стрики, бейджи, прогресс до следующего уровня.
Даша: этот файл твой — backend/app/services/gamification.py
"""
from datetime import datetime
from app.services.data_loader import (
    users_df, accounts_df, loyalty_programs_df, loyalty_history_df
)


def get_gamification_data(user_id: int) -> dict:
    # --- Данные пользователя ---
    user_row = users_df[users_df["id"] == user_id]
    if user_row.empty:
        raise ValueError(f"Пользователь {user_id} не найден")
    user = user_row.iloc[0]
    segment = user["financial_segment"]  # LOW | MEDIUM | HIGH

    # --- Аккаунты пользователя ---
    user_accounts = accounts_df[accounts_df["user_id"] == user_id]
    account_ids = user_accounts["account_id"].tolist()

    # --- История транзакций пользователя ---
    history = loyalty_history_df[loyalty_history_df["account_id"].isin(account_ids)].copy()

    # ================================================================
    # СТРИК — сколько последних месяцев подряд были начисления
    # ================================================================
    streak_months = 0
    if not history.empty:
        # Берём все месяцы где было хоть одно начисление
        months_with_cashback = (
            history["payout_date"]
            .dt.to_period("M")
            .drop_duplicates()
            .sort_values(ascending=False)
            .tolist()
        )

        # Считаем streak: идём назад от последнего завершённого месяца
        # (текущий месяц ещё не закончился, поэтому начинаем с предыдущего)
        current_period = datetime.now()
        if current_period.month == 1:
            check = datetime(current_period.year - 1, 12, 1)
        else:
            check = datetime(current_period.year, current_period.month - 1, 1)

        import pandas as pd
        for period in months_with_cashback:
            period_dt = period.to_timestamp()
            if period_dt.year == check.year and period_dt.month == check.month:
                streak_months += 1
                # Переходим на месяц назад
                if check.month == 1:
                    check = datetime(check.year - 1, 12, 1)
                else:
                    check = datetime(check.year, check.month - 1, 1)
            else:
                break

    # ================================================================
    # БЕЙДЖИ
    # ================================================================
    total_balance = user_accounts["current_balance"].sum()

    # Есть ли программа All Airlines
    user_program_ids = user_accounts["loyalty_program_id"].tolist()
    program_names = loyalty_programs_df[
        loyalty_programs_df["loyalty_program_id"].isin(user_program_ids)
    ]["loyalty_program_name"].tolist()
    has_airlines = any("Airlines" in name for name in program_names)

    badges = [
        {
            "id": "first_cashback",
            "title": "Первый кэшбэк",
            "description": "Получил первое начисление",
            "earned": not history.empty,
            "icon": "🎉",
        },
        {
            "id": "thousander",
            "title": "Тысячник",
            "description": "Суммарный баланс превысил 1 000 единиц",
            "earned": total_balance > 1_000,
            "icon": "💰",
        },
        {
            "id": "traveler",
            "title": "Путешественник",
            "description": "Подключена программа All Airlines",
            "earned": has_airlines,
            "icon": "✈️",
        },
        {
            "id": "loyal_client",
            "title": "Верный клиент",
            "description": "Стрик 3 месяца и более",
            "earned": streak_months >= 3,
            "icon": "🔒",
        },
        {
            "id": "high_roller",
            "title": "Большой игрок",
            "description": "Сегмент HIGH",
            "earned": segment == "HIGH",
            "icon": "👑",
        },
    ]

    # ================================================================
    # ПРОГРЕСС ДО СЛЕДУЮЩЕГО УРОВНЯ
    # ================================================================
    if segment == "LOW":
        next_level = "MEDIUM"
        target = 500_000
        progress_percent = min(int(total_balance / target * 100), 99)
    elif segment == "MEDIUM":
        next_level = "HIGH"
        target = 2_000_000
        progress_percent = min(int(total_balance / target * 100), 99)
    else:  # HIGH — уже максимум
        next_level = None
        progress_percent = None

    return {
        "streak_months": streak_months,
        "badges": badges,
        "next_level": next_level,
        "progress_percent": progress_percent,
    }