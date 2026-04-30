// Android emulator: 10.0.2.2 | Real device/APK: замени на IP машины или deployed URL
const API = "http://10.0.2.2:8000";

export async function fetchUsers() {
  const r = await fetch(`${API}/users/`);
  if (!r.ok) throw new Error("Ошибка загрузки пользователей");
  return r.json();
}

export async function fetchBalances(userId: number) {
  const r = await fetch(`${API}/users/${userId}/balances`);
  if (!r.ok) return [];
  return r.json();
}

export async function fetchOffers(userId: number) {
  const r = await fetch(`${API}/users/${userId}/offers`);
  if (!r.ok) return [];
  return r.json();
}

export async function fetchGamification(userId: number) {
  const r = await fetch(`${API}/users/${userId}/gamification`);
  if (!r.ok) return null;
  return r.json();
}

export async function fetchForecast(userId: number) {
  const r = await fetch(`${API}/users/${userId}/forecast`);
  if (!r.ok) return [];
  return r.json();
}

export async function fetchHistory(userId: number) {
  const r = await fetch(`${API}/users/${userId}/history`);
  if (!r.ok) return [];
  return r.json();
}

export async function fetchAIAdvice(userId: number, refresh = false): Promise<string> {
  const url = refresh
    ? `${API}/users/${userId}/ai-advice?refresh=true`
    : `${API}/users/${userId}/ai-advice`;
  const r = await fetch(url, { method: "POST" });
  if (!r.ok) throw new Error(`Ошибка ${r.status}`);
  const data = await r.json();
  return data.advice as string;
}
