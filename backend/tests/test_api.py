import re
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_get_all_users_returns_30():
    """Проверяет что возвращается ровно 30 пользователей."""
    response = client.get("/users/")
    assert response.status_code == 200
    assert len(response.json()) == 30

def test_get_user_by_id_valid():
    """Проверка получения существующего пользователя."""
    response = client.get("/users/1")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == 1
    assert "full_name" in data
    assert "financial_segment" in data

def test_get_user_not_found():
    """Несуществующий пользователь возвращает 404."""
    response = client.get("/users/99999")
    assert response.status_code == 404
    assert "не найден" in response.json()["detail"]

def test_get_user_balances_valid():
    """Балансы возвращают правильную структуру."""
    response = client.get("/users/1/balances")
    assert response.status_code == 200
    data = response.json()
    for item in data:
        assert "program_name" in item
        assert "currency" in item
        assert "current_balance" in item
        assert isinstance(item["current_balance"], (int, float))

def test_get_user_history_aggregated_by_month():
    """История должна быть сгруппирована по месяцам."""
    response = client.get("/users/1/history")
    assert response.status_code == 200
    data = response.json()
    for item in data:
        assert "month" in item
        assert "program_name" in item
        assert "total_cashback" in item
        assert len(item["month"]) == 7
        assert item["month"][4] == "-"

def test_offers_filtered_by_segment():
    """Офферы должны соответствовать сегменту пользователя."""
    # Получаем пользователя
    user_response = client.get("/users/1")
    user_segment = user_response.json()["financial_segment"]
    offers_response = client.get("/users/1/offers")
    offers = offers_response.json()
    for offer in offers:
        assert offer["financial_segment"] == user_segment

def test_get_user_forecast_structure():
    """Прогноз должен возвращать корректную структуру"""
    response = client.get("/users/1/forecast")
    assert response.status_code == 200
    data = response.json()

    for item in data:
        assert "program_name" in item
        assert "currency" in item
        assert "avg_monthly" in item
        assert "months_left" in item
        assert "forecast_amount" in item
        assert isinstance(item["months_left"], int)
        assert item["months_left"] >= 0

def test_gamification_returns_data():
    """Геймификация возвращает все необходимые поля"""
    response = client.get("/users/1/gamification")
    assert response.status_code == 200
    data = response.json()

    assert "streak_months" in data
    assert "badges" in data
    assert isinstance(data["badges"], list)

    if data["badges"]:
        badge = data["badges"][0]
        assert "id" in badge
        assert "title" in badge
        assert "earned" in badge

def test_offers_have_required_fields():
    """Каждый оффер содержит поля partner_name и cashback_percent."""
    response = client.get("/users/1/offers")
    assert response.status_code == 200
    for offer in response.json():
        assert "partner_name" in offer
        assert "cashback_percent" in offer
        assert isinstance(offer["cashback_percent"], (int, float))

def test_gamification_has_streak():
    """Поле streak_months — неотрицательное целое число."""
    response = client.get("/users/1/gamification")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data["streak_months"], int)
    assert data["streak_months"] >= 0

def test_history_month_format():
    """Поле month в истории соответствует формату YYYY-MM."""
    response = client.get("/users/1/history")
    assert response.status_code == 200
    for item in response.json():
        assert re.match(r"^\d{4}-\d{2}$", item["month"]), f"Неверный формат: {item['month']}"

def test_health_check():
    """Проверка health эндпоинта"""
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"