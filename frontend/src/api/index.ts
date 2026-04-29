/**
 * API слой — все запросы к бэкенду.
 * Базовый URL берётся из env переменной VITE_API_URL,
 * при локальной разработке через Docker: http://localhost:8000
 */
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
})

// =============================================
// Типы (соответствуют Pydantic-схемам бэкенда)
// =============================================

export interface User {
  id: number
  full_name: string
  email: string
  phone_number: string
  financial_segment: 'LOW' | 'MEDIUM' | 'HIGH'
}

export interface BalanceItem {
  program_name: string   // "Black" | "All Airlines" | "Platinum"
  currency: string       // "rub" | "miles" | "bravo"
  current_balance: number
}

export interface HistoryMonthItem {
  month: string          // "2025-01"
  program_name: string
  total_cashback: number
}

export interface ForecastItem {
  program_name: string
  currency: string
  avg_monthly: number
  months_left: number
  forecast_amount: number
}

export interface OfferItem {
  partner_id: number
  partner_name: string
  short_description: string
  logo_url: string
  brand_color_hex: string
  cashback_percent: number
  financial_segment: string
}

export interface Badge {
  id: string
  title: string
  description: string
  earned: boolean
  icon: string
}

export interface GamificationData {
  streak_months: number
  badges: Badge[]
  next_level: string | null
  progress_percent: number | null
}

export interface AIAdviceResponse {
  advice: string
}

// =============================================
// Запросы
// =============================================

/** Список всех пользователей (для стартового экрана) */
export async function fetchUsers(): Promise<User[]> {
  const { data } = await api.get<User[]>('/users/')
  return data
}

/** Профиль одного пользователя */
export async function fetchUser(userId: number): Promise<User> {
  const { data } = await api.get<User>(`/users/${userId}`)
  return data
}

/** Балансы по всем программам лояльности пользователя */
export async function fetchBalances(userId: number): Promise<BalanceItem[]> {
  const { data } = await api.get<BalanceItem[]>(`/users/${userId}/balances`)
  return data
}

/** История начислений по месяцам (для графика) */
export async function fetchHistory(userId: number): Promise<HistoryMonthItem[]> {
  const { data } = await api.get<HistoryMonthItem[]>(`/users/${userId}/history`)
  return data
}

/** Прогноз кэшбэка до конца года */
export async function fetchForecast(userId: number): Promise<ForecastItem[]> {
  const { data } = await api.get<ForecastItem[]>(`/users/${userId}/forecast`)
  return data
}

/** Акции партнёров для сегмента пользователя */
export async function fetchOffers(userId: number): Promise<OfferItem[]> {
  const { data } = await api.get<OfferItem[]>(`/users/${userId}/offers`)
  return data
}

/** Геймификация: стрики, бейджи, прогресс */
export async function fetchGamification(userId: number): Promise<GamificationData> {
  const { data } = await api.get<GamificationData>(`/users/${userId}/gamification`)
  return data
}

/** ИИ-совет — POST-запрос, триггерится по кнопке */
export async function fetchAIAdvice(userId: number): Promise<AIAdviceResponse> {
  const { data } = await api.post<AIAdviceResponse>(`/users/${userId}/ai-advice`)
  return data
}