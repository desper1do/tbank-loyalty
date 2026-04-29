export interface User {
  id: number;
  full_name: string;
  email: string;
  financial_segment: string;
}

export interface Balance {
  program_name: string;
  currency: string;
  current_balance: number;
}

export interface Offer {
  partner_id: number;
  partner_name: string;
  short_description: string;
  cashback_percent: number;
  brand_color_hex: string;
}

export interface Badge {
  id: string;
  title: string;
  icon: string;
  earned: boolean;
  description: string;
}

export interface Gamification {
  streak_months: number;
  badges: Badge[];
  next_level: string | null;
  progress_percent: number | null;
}

export interface ForecastItem {
  program_name: string;
  currency: string;
  avg_monthly: number;
  months_left: number;
  forecast_amount: number;
}
