/**
 * Страница выбора пользователя.
 * Показывает сетку всех пользователей с сегментами.
 */
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchUsers, type User } from '../api/index'
import { useTheme } from '../hooks/useTheme'

// ─── Константы и компоненты ──────────────────────────────────

const SEGMENT_CONFIG = {
  LOW:    { bg: '#EF4444', text: '#FFFFFF' },
  MEDIUM: { bg: '#FFDD2D', text: '#000000' },
  HIGH:   { bg: '#22C55E', text: '#FFFFFF' },
} as const

function SegmentBadge({ segment }: { segment: User['financial_segment'] }) {
  const cfg = SEGMENT_CONFIG[segment]
  return (
    <span
      className="inline-flex items-center justify-center"
      style={{ 
        backgroundColor: cfg.bg, 
        color: cfg.text,
        fontSize: '11px',
        fontWeight: 700,
        padding: '2px 10px',
        borderRadius: '20px',
        lineHeight: 'normal',
      }}
    >
      {segment}
    </span>
  )
}

function Avatar({ name }: { name: string }) {
  const initials = name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
  return (
    <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
      style={{ backgroundColor: '#FFDD2D' }}>
      <span className="font-bold text-sm" style={{ color: '#000' }}>{initials}</span>
    </div>
  )
}

function CardSkeleton() {
  return (
    <div className="rounded-2xl flex items-center"
      style={{ 
        backgroundColor: 'var(--bg-card)', 
        boxShadow: 'var(--shadow)',
        padding: '24px 24px 24px 15px',
        columnGap: '20px', 
      }}>
      <div className="skeleton w-12 h-12 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-3 w-1/2 rounded" />
        <div className="skeleton h-5 w-16 rounded-full" />
      </div>
    </div>
  )
}

function SunIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  )
}

// ─── Главная страница ────────────────────────────────────────

export default function HomePage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()

  useEffect(() => {
    fetchUsers()
      .then(setUsers)
      .catch(e => setError(e.message ?? 'Не удалось загрузить пользователей'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = users.filter(u =>
    u.full_name.toLowerCase().includes(search.toLowerCase()) ||
    u.financial_segment.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      
      {/* ШАПКА КАК НА СКРИНШОТАХ */}
      <header className="sticky top-0 z-20 border-b"
        style={{ 
          backgroundColor: 'var(--bg-card)', 
          borderColor: 'var(--border-color)' 
        }}>
        <div className="w-full flex items-center justify-between relative"
          style={{ padding: '12px 20px' }}>
          
          {/* Лево: Лого */}
          <div className="flex items-center gap-3 z-10">
            <div className="w-[30px] h-[30px] rounded-lg flex items-center justify-center"
              style={{ backgroundColor: '#FFDD2D' }}>
              <span className="font-black text-[13px]" style={{ color: '#000' }}>Т</span>
            </div>
            <span className="font-semibold text-base tracking-tight hidden sm:block"
              style={{ color: 'var(--text-primary)' }}>
              Лояльность
            </span>
          </div>

          <div className="absolute left-1/2 -translate-x-1/2 w-full max-w-[540px] px-4 hidden md:block">
            <div className="relative">
              {/* Иконка лупы */}
              <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none flex items-center">
                <svg 
                  width="18" 
                  height="18" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  style={{ color: 'var(--text-secondary)', opacity: 0.5 }}
                >
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </div>

            <input
              type="text"
              placeholder="Поиск"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pr-4 rounded-[12px] text-[15px] transition-all outline-none focus:bg-white focus:ring-1 focus:ring-black/80"
              style={{
                backgroundColor: theme === 'dark' ? 'var(--bg-primary)' : '#F0F2F5',
                color: 'var(--text-primary)',
                border: 'none',
                height: '42px',
                paddingLeft: '44px',
              }}
            />
            </div>
          </div>

          <div className="z-10">
            <button
              onClick={toggleTheme}
              className="flex items-center justify-center transition-colors cursor-pointer"
              style={{ 
                width: 36, height: 36, borderRadius: 10,
                backgroundColor: 'var(--bg-primary)', border: 'none',
                color: 'var(--text-secondary)' 
              }}
            >
              {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
            </button>
          </div>
        </div>
      </header>

      <main className="w-full flex flex-col items-center" style={{ padding: '40px 16px', boxSizing: 'border-box' }}>
        <div className="w-full max-w-7xl text-left">
          <h1 className="font-bold mb-1"
            style={{ fontSize: '32px', color: 'var(--text-primary)', letterSpacing: '-0.8px' }}>
            Выберите пользователя
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)', marginBottom: '10px' }}>
            {loading ? 'Загрузка...' : `${filtered.length} из ${users.length} профилей в системе`}
          </p>
        </div>

        <div className="w-full max-w-7xl grid gap-5"
          style={{
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(380px, 100%), 1fr))',
            paddingTop: '8px'
          }}>
          
          {loading && Array.from({ length: 9 }).map((_, i) => <CardSkeleton key={i} />)}

          {!loading && !error && filtered.map(user => (
            <button
              key={user.id}
              onClick={() => navigate(`/users/${user.id}`)}
              className="group rounded-[24px] flex items-center text-left w-full transition-all duration-200 active:scale-[0.98] cursor-pointer"
              style={{
                backgroundColor: 'var(--bg-card)',
                boxShadow: 'var(--shadow)',
                padding: '24px 24px 24px 15px',
                columnGap: '20px', 
              }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--bg-card)'}
            >
              <Avatar name={user.full_name} />
              
              <div className="flex-1 min-w-0 flex flex-col gap-1">
                <p className="font-bold text-lg truncate pr-2" style={{ color: 'var(--text-primary)' }}>
                  {user.full_name}
                </p>
                <p className="text-sm truncate opacity-60" style={{ color: 'var(--text-secondary)' }}>
                  {user.phone_number}
                </p>
                <div className="mt-1">
                  <SegmentBadge segment={user.financial_segment} />
                </div>
              </div>

              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                style={{ color: 'var(--text-secondary)', opacity: 0.3, flexShrink: 0 }}>
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          ))}
        </div>
      </main>
    </div>
  )
}