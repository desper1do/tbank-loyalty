/**
 * Страница раздела лояльности пользователя.
 * 7 виджетов: профиль, балансы, график, прогноз, офферы, геймификация, ИИ.
 */
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import {
  fetchUser, fetchBalances, fetchHistory,
  fetchForecast, fetchOffers, fetchAIAdvice,
  type User, type BalanceItem, type HistoryMonthItem,
  type ForecastItem, type OfferItem,
} from '../api/index'
import { useTheme } from '../hooks/useTheme'
import GamificationBlock from '../components/GamificationBlock'
import CrossSellBlock from '../components/CrossSellBlock'

// ─── Константы ──────────────────────────────────────────────
const YELLOW = '#FFDD2D'

const PROGRAM_CFG: Record<string, { color: string; bg: string; icon: string; label: string }> = {
  'Black':        { color: '#FFFFFF', bg: '#1A1A1A', icon: '₽', label: 'рублей' },
  'All Airlines': { color: '#FFFFFF', bg: '#1A56DB', icon: '✈', label: 'миль' },
  'Bravo':        { color: '#000000', bg: YELLOW,    icon: '★', label: 'баллов' },
}

const SEGMENT_CFG = {
  LOW:    { bg: '#EF4444', color: '#fff' },
  MEDIUM: { bg: YELLOW,    color: '#000' },
  HIGH:   { bg: '#22C55E', color: '#fff' },
} as const

const CHART_COLORS = [YELLOW, '#1A56DB', '#A855F7', '#22C55E']

// ─── Мелкие переиспользуемые элементы ───────────────────────

function SunIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
}
function MoonIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
}

/** Белая/тёмная карточка с тенью */
function Card({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      backgroundColor: 'var(--bg-card)',
      borderRadius: 20,
      padding: 20,
      boxShadow: 'var(--shadow)',
    }}>
      {children}
    </div>
  )
}

function WidgetTitle({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontWeight: 700,
      fontSize: '1.25rem',   /* ~20px — крупнее, чем было 17px */
      color: 'var(--text-primary)',
      marginBottom: '1rem',
      letterSpacing: '-0.3px',
    }}>
      {children}
    </p>
  )
}

function Skeleton({ height = 24, width = '100%', radius = 10 }: { height?: number; width?: number | string; radius?: number }) {
  return <div className="skeleton" style={{ height, width, borderRadius: radius }} />
}

function ErrorMsg({ msg }: { msg: string }) {
  return <p style={{ color: '#EF4444', fontSize: 13 }}>Не удалось загрузить: {msg}</p>
}

// ─── Виджет 1: Профиль ──────────────────────────────────────
function ProfileWidget({ user }: { user: User }) {
  const initials = user.full_name.split(' ').slice(0, 2).map(w => w[0]).join('')
  const seg = SEGMENT_CFG[user.financial_segment as keyof typeof SEGMENT_CFG]
  return (
    <Card>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* Аватар — размер через em, масштабируется со шрифтом */}
        <div style={{
          width: '3.75rem', height: '3.75rem', borderRadius: '50%',
          backgroundColor: YELLOW, display: 'flex',
          alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <span style={{ fontWeight: 900, fontSize: '1.25rem', color: '#000' }}>{initials}</span>
        </div>
        {/* Инфо */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontWeight: 700, fontSize: '1.125rem', color: 'var(--text-primary)', letterSpacing: '-0.4px', marginBottom: '0.125rem' }}>
            {user.full_name}
          </p>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user.phone_number} · {user.email}
          </p>
          <span style={{
            fontSize: '0.6875rem', fontWeight: 700,
            backgroundColor: seg.bg, color: seg.color,
            padding: '0.125rem 0.625rem', borderRadius: '1.25rem',
          }}>
            {user.financial_segment}
          </span>
        </div>
      </div>
    </Card>
  )
}

// ─── Виджет 2: Балансы ──────────────────────────────────────
function BalancesWidget({ userId }: { userId: number }) {
  const [data, setData] = useState<BalanceItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchBalances(userId).then(setData).catch(e => setError(e.message)).finally(() => setLoading(false))
  }, [userId])

  return (
    <Card>
      <WidgetTitle>Мои бонусы</WidgetTitle>
      {loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10 }}>
          {[1,2,3].map(i => <Skeleton key={i} height={100} radius={14} />)}
        </div>
      )}
      {error && <ErrorMsg msg={error} />}
      {!loading && !error && (
        /* minmax(8.75rem, 1fr) = minmax(140px, 1fr) — на узких экранах
           переходит в одну колонку автоматически */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(8.75rem, 1fr))', gap: '0.625rem' }}>
          {data.map(item => {
            const cfg = PROGRAM_CFG[item.program_name] ?? { color: '#fff', bg: '#555', icon: '◆', label: item.currency }
            return (
              <div key={item.program_name} style={{
                backgroundColor: cfg.bg, borderRadius: '1rem',
                padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem',
                color: cfg.color,
              }}>
                <span style={{ fontSize: '1.375rem', color: cfg.color, lineHeight: 1 }}>{cfg.icon}</span>
                <p style={{ fontSize: '0.6875rem', color: cfg.color, opacity: 0.8, fontWeight: 500 }}>{item.program_name}</p>
                <p style={{ fontSize: '1.375rem', fontWeight: 900, color: cfg.color, letterSpacing: '-0.5px' }}>
                  {item.current_balance.toLocaleString('ru-RU', { maximumFractionDigits: 0 })}
                </p>
                <p style={{ fontSize: '0.6875rem', color: cfg.color, opacity: 0.6 }}>{cfg.label}</p>
              </div>
            )
          })}
        </div>
      )}
    </Card>
  )
}

// ─── Виджет 3: График ───────────────────────────────────────
function buildChartData(history: HistoryMonthItem[]) {
  const map: Record<string, Record<string, number>> = {}
  const programs = new Set<string>()
  history.forEach(({ month, program_name, total_cashback }) => {
    if (!map[month]) map[month] = {}
    map[month][program_name] = total_cashback
    programs.add(program_name)
  })
  return {
    data: Object.keys(map).sort().map(m => ({ month: m, ...map[m] })),
    programs: Array.from(programs),
  }
}

function HistoryWidget({ userId }: { userId: number }) {
  const [history, setHistory] = useState<HistoryMonthItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { theme } = useTheme()

  useEffect(() => {
    fetchHistory(userId).then(setHistory).catch(e => setError(e.message)).finally(() => setLoading(false))
  }, [userId])

  const gridColor = theme === 'dark' ? '#2C2C2E' : '#E5E7EB'
  const textColor = theme === 'dark' ? '#8E8E93' : '#6B7280'

  return (
    <Card>
      <WidgetTitle>История кэшбэка</WidgetTitle>
      {loading && <Skeleton height={200} />}
      {error && <ErrorMsg msg={error} />}
      {!loading && !error && (() => {
        const { data, programs } = buildChartData(history)
        return (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: textColor }} tickFormatter={m => m.slice(2)} />
              <YAxis tick={{ fontSize: 11, fill: textColor }} />
              <Tooltip contentStyle={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 12, fontSize: 12,
                color: 'var(--text-primary)',
              }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              {programs.map((prog, i) => (
                <Line key={prog} type="monotone" dataKey={prog}
                  stroke={CHART_COLORS[i % CHART_COLORS.length]}
                  strokeWidth={2} dot={false} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )
      })()}
    </Card>
  )
}

// ─── Виджет 4: Прогноз ──────────────────────────────────────
function ForecastWidget({ userId }: { userId: number }) {
  const [data, setData] = useState<ForecastItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchForecast(userId).then(setData).catch(e => setError(e.message)).finally(() => setLoading(false))
  }, [userId])

  return (
    <Card>
      <WidgetTitle>Прогноз до конца года</WidgetTitle>
      {loading && <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}><Skeleton height={56} /><Skeleton height={56} /></div>}
      {error && <ErrorMsg msg={error} />}
      {!loading && !error && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {data.map(item => {
            const cfg = PROGRAM_CFG[item.program_name] ?? { color: '#fff', bg: '#555', icon: '◆', label: item.currency }
            return (
              <div key={item.program_name} style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                backgroundColor: 'var(--bg-primary)', borderRadius: '0.875rem', padding: '0.75rem 0.875rem',
              }}>
                <div style={{
                  width: '2.5rem', height: '2.5rem', borderRadius: '0.75rem', flexShrink: 0,
                  backgroundColor: cfg.bg, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: '1.125rem', fontWeight: 700, color: cfg.color,
                }}>
                  {cfg.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)', marginBottom: '0.125rem' }}>
                    {item.program_name} · ещё {item.months_left} мес.
                  </p>
                  <p style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
                    +{item.forecast_amount.toLocaleString('ru-RU', { maximumFractionDigits: 0 })} {cfg.label}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '0.625rem', color: 'var(--text-secondary)' }}>в среднем / мес</p>
                  <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {item.avg_monthly.toLocaleString('ru-RU', { maximumFractionDigits: 0 })}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </Card>
  )
}

// ─── Виджет 5: Офферы ───────────────────────────────────────
function OffersWidget({ userId }: { userId: number }) {
  const [data, setData] = useState<OfferItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchOffers(userId).then(setData).catch(e => setError(e.message)).finally(() => setLoading(false))
  }, [userId])

  return (
    <Card>
      <WidgetTitle>Акции партнёров</WidgetTitle>
      {loading && (
        <div style={{ display: 'flex', gap: 10, overflow: 'hidden' }}>
          {[1,2,3].map(i => <Skeleton key={i} height={148} width={160} radius={14} />)}
        </div>
      )}
      {error && <ErrorMsg msg={error} />}
      {!loading && !error && (
        <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 }}>
          {data.map(offer => (
            <div key={offer.partner_id} style={{
              flexShrink: 0, width: 160, borderRadius: 16, padding: 14,
              backgroundColor: offer.brand_color_hex,
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
              minHeight: 148,
            }}>
              <img
                src={offer.logo_url} alt={offer.partner_name}
                style={{ width: 40, height: 40, borderRadius: 10, objectFit: 'contain', marginBottom: 10, mixBlendMode: 'multiply' }}
                onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
              />
              <div>
                <p style={{ fontWeight: 700, fontSize: 13, color: '#fff', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {offer.partner_name}
                </p>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)', marginBottom: 8, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {offer.short_description}
                </p>
                <div style={{ backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 8, padding: '3px 8px', display: 'inline-block' }}>
                  <span style={{ color: '#fff', fontWeight: 900, fontSize: 14 }}>{offer.cashback_percent}%</span>
                  <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 11, marginLeft: 4 }}>кэшбэк</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}

// ─── Виджет 7: ИИ-советник ──────────────────────────────────
function AIAdviceWidget({ userId }: { userId: number }) {
  const [advice, setAdvice] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleClick = () => {
    if (advice) return
    setLoading(true)
    setError(null)
    fetchAIAdvice(userId)
      .then(res => setAdvice(res.advice))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }

  return (
    <Card>
      <WidgetTitle>ИИ-советник</WidgetTitle>
      {!advice && (
        <button onClick={handleClick} disabled={loading} style={{
          width: '100%', backgroundColor: loading ? '#E5C800' : YELLOW,
          color: '#000', border: 'none', borderRadius: '0.875rem',
          padding: '0.875rem 1.25rem', fontSize: '0.875rem', fontWeight: 700,
          cursor: loading ? 'not-allowed' : 'pointer', transition: 'opacity 0.15s',
        }}>
          {loading ? 'Анализирую профиль...' : '✦ Получить персональный совет'}
        </button>
      )}
      {loading && (
        <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <Skeleton height={14} /><Skeleton height={14} width="80%" />
        </div>
      )}
      {error && <div style={{ marginTop: '0.5rem' }}><ErrorMsg msg={error} /></div>}
      {advice && (
        <div style={{
          backgroundColor: 'var(--bg-primary)', borderRadius: '0.875rem',
          padding: '1rem', border: '1px solid var(--border-color)',
        }}>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
            <div style={{
              width: '2rem', height: '2rem', borderRadius: '0.625rem', backgroundColor: YELLOW,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.875rem', flexShrink: 0,
            }}>✦</div>
            <p style={{ fontSize: '0.875rem', lineHeight: 1.6, color: 'var(--text-primary)' }}>{advice}</p>
          </div>
          <button onClick={() => { setAdvice(null); setError(null) }} style={{
            marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--text-secondary)',
            background: 'none', border: 'none', cursor: 'pointer', padding: 0,
          }}>
            Обновить совет
          </button>
        </div>
      )}
    </Card>
  )
}

// ─── Главный компонент ───────────────────────────────────────
export default function UserPage() {
  const { id } = useParams<{ id: string }>()
  const userId = Number(id)
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()

  const [user, setUser] = useState<User | null>(null)
  const [userLoading, setUserLoading] = useState(true)
  const [userError, setUserError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) return
    fetchUser(userId).then(setUser).catch(e => setUserError(e.message)).finally(() => setUserLoading(false))
  }, [userId])

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>

      {/* Шапка */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 10,
        backgroundColor: 'var(--bg-card)',
        borderBottom: '1px solid var(--border-color)',
      }}>
        <div style={{
          padding: '12px 20px',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <button onClick={() => navigate('/')} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-primary)', fontSize: 14, fontWeight: 500, padding: 0,
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Назад
          </button>
          <div style={{ flex: 1 }} />
          <div style={{
            width: 30, height: 30, borderRadius: 8,
            backgroundColor: YELLOW, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontWeight: 900, fontSize: 13, color: '#000' }}>Т</span>
          </div>
          <button onClick={toggleTheme} style={{
            width: 36, height: 36, borderRadius: 10,
            backgroundColor: 'var(--bg-primary)', border: 'none',
            cursor: 'pointer', color: 'var(--text-secondary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>
        </div>
      </header>

      {/* Контент */}
      <main style={{
        maxWidth: 720, margin: '0 auto',
        padding: '20px 16px 40px',
        display: 'flex', flexDirection: 'column', gap: 12,
      }}>
        {userLoading && <Skeleton height={96} radius={20} />}
        {userError && <Card><ErrorMsg msg={userError} /></Card>}
        {user && <ProfileWidget user={user} />}

        <BalancesWidget userId={userId} />
        <HistoryWidget userId={userId} />
        <ForecastWidget userId={userId} />
        <OffersWidget userId={userId} />
        {/* Виджет 8 — Кросс-селл продуктов экосистемы Т (между офферами и геймификацией) */}
        {user && (
          <div style={{
            backgroundColor: 'var(--bg-card)',
            borderRadius: 20,
            boxShadow: 'var(--shadow)',
            overflow: 'hidden',
          }}>
            <CrossSellBlock segment={user.financial_segment} />
          </div>
        )}
        {/* Оборачиваем в нашу Card, чтобы стили совпадали с остальными виджетами */}
        <div style={{
          backgroundColor: 'var(--bg-card)',
          borderRadius: 20,
          boxShadow: 'var(--shadow)',
          overflow: 'hidden',
        }}>
          <GamificationBlock userId={userId} />
        </div>
        <AIAdviceWidget userId={userId} />
      </main>
    </div>
  )
}