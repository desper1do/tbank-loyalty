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

load_dotenv()

_SYSTEM_PROMPT = (
    "Ты — персональный финансовый советник Т-Банка. "
    "Твоя главная задача — помочь клиенту получить максимум выгоды от экосистемы Т-Банка, "
    "в том числе предлагая подходящие продукты: Т-Инвестиции, Т-Бизнес, Т-Мобайл, "
    "а также более выгодный финансовый сегмент, если клиент к нему близок. "
    "Обращайся на «вы», уважительно. "
    "Пиши 2-3 предложения — конкретно, без воды, без выдуманных акций и тарифов."
)

_SEGMENT_CONTEXT = {
    "LOW": (
        "Клиент в сегменте LOW. Если уместно, подскажи конкретный шаг к переходу "
        "в сегмент MEDIUM (например, подключить Т-Мобайл или открыть накопительный счёт). "
        "Сфокусируйся на росте выгоды."
    ),
    "MEDIUM": (
        "Клиент в сегменте MEDIUM. Порекомендуй Т-Инвестиции или другой продукт экосистемы, "
        "который поможет перейти в HIGH и увеличить кэшбэк. "
        "Делай акцент на конкретной дополнительной выгоде."
    ),
    "HIGH": (
        "Клиент в сегменте HIGH. Сфокусируйся на максимизации отдачи от текущих программ. "
        "Если есть незадействованные продукты экосистемы (Т-Бизнес, Т-Инвестиции) — упомяни их."
    ),
}

_advice_cache: dict[int, str] = {}


def get_ai_advice(user_id: int) -> str:
    if user_id in _advice_cache:
        return _advice_cache[user_id]

    api_key = os.getenv("GIGACHAT_CREDENTIALS")
    if not api_key:
        return "ИИ-советник недоступен: не настроен API-ключ GigaChat."

    user_row = users_df[users_df["id"] == user_id]
    if user_row.empty:
        raise ValueError("Пользователь не найден")

    segment = user_row.iloc[0]["financial_segment"]

    user_accounts = accounts_df[accounts_df["user_id"] == user_id].copy()

    if user_accounts.empty:
        portfolio_str = "У клиента пока нет активных программ лояльности."
    else:
        user_accounts = user_accounts.merge(
            loyalty_programs_df[["loyalty_program_id", "loyalty_program_name", "cashback_currency"]],
            on="loyalty_program_id",
            how="left",
        )

        portfolio_details = []
        for _, acc in user_accounts.iterrows():
            prog_name = acc["loyalty_program_name"]
            balance = acc["current_balance"]
            currency = acc["cashback_currency"]
            acc_id = acc["account_id"]

            acc_hist = loyalty_history_df[loyalty_history_df["account_id"] == acc_id].copy()
            avg_monthly = 0.0
            if not acc_hist.empty:
                acc_hist["payout_date"] = pd.to_datetime(acc_hist["payout_date"])
                acc_hist["month"] = acc_hist["payout_date"].dt.to_period("M").astype(str)
                monthly_totals = acc_hist.groupby("month")["cashback_amount"].sum()
                if not monthly_totals.empty and not pd.isna(monthly_totals.mean()):
                    avg_monthly = float(monthly_totals.mean())

            portfolio_details.append(
                f"«{prog_name}» (баланс: {round(balance)} {currency}, "
                f"средний кэшбэк: {round(avg_monthly)}/мес)"
            )

        portfolio_str = ", ".join(portfolio_details)

    segment_hint = _SEGMENT_CONTEXT.get(segment, "")

    prompt = (
        f"{_SYSTEM_PROMPT}\n\n"
        f"Данные клиента:\n"
        f"- Финансовый сегмент: {segment}\n"
        f"- Программы лояльности: {portfolio_str}\n\n"
        f"{segment_hint}\n\n"
        f"Дай персональный совет (2-3 предложения)."
    )

    try:
        with GigaChat(credentials=api_key, verify_ssl_certs=False) as giga:
            response = giga.chat(prompt)
            advice = response.choices[0].message.content
            _advice_cache[user_id] = advice
            return advice
    except GigaChatException as e:
        return f"ИИ временно недоступен. Ошибка API GigaChat: {str(e)}"
    except Exception as e:
        return f"Что-то пошло не так при генерации совета: {str(e)}"
