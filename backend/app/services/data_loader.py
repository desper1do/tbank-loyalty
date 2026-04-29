"""
Загружаем все CSV один раз при старте приложения.
Все сервисы используют эти датафреймы — не читаем файлы на каждый запрос.
"""
import os
import pandas as pd

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data")


def _load(filename: str) -> pd.DataFrame:
    path = os.path.join(DATA_DIR, filename)
    return pd.read_csv(path)


# Глобальные датафреймы — импортируй их в сервисах
users_df = _load("Users.csv")
accounts_df = _load("Accounts.csv")
loyalty_programs_df = _load("LoyaltyPrograms.csv")
loyalty_history_df = _load("LoyaltyHistory.csv")
offers_df = _load("Offers.csv")

# Приводим дату к нужному типу сразу
loyalty_history_df["payout_date"] = pd.to_datetime(loyalty_history_df["payout_date"])