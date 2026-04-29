import os
import pandas as pd
from dotenv import load_dotenv
from gigachat import GigaChat
from gigachat.exceptions import GigaChatException

from app.services.data_loader import (
    users_df,
    accounts_df,
    loyalty_programs_df,
    loyalty_history_df,
)

# Загружаем переменные из .env файла
load_dotenv()

def get_ai_advice(user_id: int) -> str:
    """
    Собирает профиль пользователя и запрашивает персональный совет у GigaChat.
    """
    # 1. Достаем ключ
    api_key = os.getenv("GIGACHAT_CREDENTIALS")
    if not api_key:
        return "ИИ-советник недоступен: не настроен API-ключ GigaChat."

    # 2. Ищем пользователя
    user_row = users_df[users_df["id"] == user_id]
    if user_row.empty:
        raise ValueError("Пользователь не найден")
    
    segment = user_row.iloc[0]["financial_segment"]

    # 3. Собираем данные по аккаунтам, балансам и кэшбэку
    user_accounts = accounts_df[accounts_df["user_id"] == user_id].copy()
    
    if user_accounts.empty:
        portfolio_str = "У клиента пока нет активных программ лояльности."
    else:
        # Правильный join с учетом названий колонок
        user_accounts = user_accounts.merge(
            loyalty_programs_df[["loyalty_program_id", "loyalty_program_name", "cashback_currency"]],
            on="loyalty_program_id",
            how="left"
        )

        portfolio_details = []
        for _, acc in user_accounts.iterrows():
            prog_name = acc["loyalty_program_name"]
            balance = acc["current_balance"]
            currency = acc["cashback_currency"]
            acc_id = acc["account_id"]
            
            # Считаем средний кэшбэк
            acc_hist = loyalty_history_df[loyalty_history_df["account_id"] == acc_id].copy()
            avg_monthly = 0.0
            
            if not acc_hist.empty:
                acc_hist["payout_date"] = pd.to_datetime(acc_hist["payout_date"])
                acc_hist["month"] = acc_hist["payout_date"].dt.to_period("M").astype(str)
                monthly_totals = acc_hist.groupby("month")["cashback_amount"].sum()
                if not monthly_totals.empty and not pd.isna(monthly_totals.mean()):
                    avg_monthly = float(monthly_totals.mean())
                    
            portfolio_details.append(
                f"«{prog_name}» (баланс: {balance} {currency}, средний кэшбэк: {round(avg_monthly)}/мес)"
            )

        portfolio_str = ", ".join(portfolio_details)

    # 4. Формируем промпт для нейросети
    prompt = (
        f"Ты — умный финансовый помощник Т-Банка. Твоя задача — дать короткий, "
        f"полезный и персонализированный совет клиенту.\n\n"
        f"Данные клиента:\n"
        f"- Финансовый сегмент: {segment}\n"
        f"- Подключенные программы лояльности: {portfolio_str}\n\n"
        f"Дай персональный совет (2-3 предложения), как клиенту максимизировать "
        f"свою выгоду от использования программ лояльности Т-Банка. Обращайся к "
        f"клиенту на «вы», уважительно. Пиши просто, понятно, без воды. "
        f"Не выдумывай несуществующие тарифы или акции."
    )

    # 5. Отправляем запрос в GigaChat
    try:
        # verify_ssl_certs=False нужен для работы внутри Docker без проблем с сертификатами
        with GigaChat(credentials=api_key, verify_ssl_certs=False) as giga:
            response = giga.chat(prompt)
            return response.choices[0].message.content
    except GigaChatException as e:
        return f"ИИ временно недоступен. Ошибка API GigaChat: {str(e)}"
    except Exception as e:
        return f"Что-то пошло не так при генерации совета: {str(e)}"