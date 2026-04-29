/**
 * Страница выбора пользователя.
 * Показывает сетку всех 30 пользователей с сегментами.
 * Клик по карточке → переход в раздел лояльности /users/:id
 */
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchUsers, type User } from '../api/index'
import { useTheme } from '../hooks/useTheme'

// Цвета и подписи для каждого сегмента
const SEGMENT_CONFIG = {
  LOW:    { bg: '#EF4444', text: '#FFFFFF', label: 'LOW' },
  MEDIUM: { bg: '#FFDD2D', text: '#000000', label: 'MEDIUM' },
  HIGH:   { bg: '#22C55E', text: '#FFFFFF', label: 'HIGH' },
} as const

function SegmentBadge({ segment }: { segment: User['financial_segment'] }) {
  const cfg = SEGMENT_CONFIG[segment]
  return (
    <span
      className="text-xs font-bold px-2.5 py-0.5 rounded-full"
      style={{ backgroundColor: cfg.bg, color: cfg.text }}
    >
      {cfg.label}
    </span>
  )
}

function Avatar({ name }: { name: string }) {
  const initials = name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
  return (
    <div className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0"
      style={{ backgroundColor: '#FFDD2D' }}>
      <span className="font-bold text-sm" style={{ color: '#000' }}>{initials}</span>
    </div>
  )
}

function CardSkeleton() {
  return (
    <div className="rounded-2xl p-4 flex items-center gap-3"
      style={{ backgroundColor: 'var(--bg-card)', boxShadow: 'var(--shadow)' }}>
      <div className="skeleton w-11 h-11 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-3 w-1/2 rounded" />
        <div className="skeleton h-5 w-16 rounded-full" />
      </div>
    </div>
  )
}

// Иконки темы без эмодзи
function SunIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5"/>
      <line x1="12" y1="1" x2="12" y2="3"/>
      <line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1" y1="12" x2="3" y2="12"/>
      <line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
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

      {/* Шапка */}
      <header className="sticky top-0 z-10 border-b"
        style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
        <div className="px-6 py-3 flex items-center gap-4">
          {/* Логотип */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: '#FFDD2D' }}>
              <span className="font-black text-sm" style={{ color: '#000' }}>Т</span>
            </div>
            <span className="font-semibold text-base tracking-tight hidden sm:block"
              style={{ color: 'var(--text-primary)' }}>
              Лояльность
            </span>
          </div>

          {/* Поиск */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Поиск по имени или сегменту..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full max-w-md px-4 py-2 rounded-xl text-sm outline-none border"
              style={{
                backgroundColor: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                borderColor: 'var(--border-color)',
              }}
            />
          </div>

          {/* Переключатель темы — SVG иконки */}
          <button
            onClick={toggleTheme}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors cursor-pointer flex-shrink-0"
            style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-secondary)' }}
            aria-label="Переключить тему"
          >
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>
        </div>
      </header>

      {/* Контент */}
      <main className="px-6 py-8">
        <h1 className="font-bold mb-1"
          style={{ fontSize: '28px', color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
          Выберите пользователя
        </h1>
        <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
          {loading ? 'Загрузка...' : `${filtered.length} из ${users.length} пользователей`}
        </p>

        {/* Ошибка */}
        {error && (
          <div className="rounded-2xl p-4 mb-6 border"
            style={{ backgroundColor: '#FEF2F2', borderColor: '#FECACA' }}>
            <p className="text-sm" style={{ color: '#DC2626' }}>⚠ {error}</p>
          </div>
        )}

        {/* Скелетоны */}
        {loading && (
          <div className="grid gap-3"
            style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
            {Array.from({ length: 9 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        )}

        {/* Карточки */}
        {!loading && !error && (
          <div className="grid gap-3"
            style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
            {filtered.map(user => (
              <button
                key={user.id}
                onClick={() => navigate(`/users/${user.id}`)}
                className="rounded-2xl p-4 flex items-center gap-3.5 text-left w-full transition-transform duration-100 active:scale-[0.98] cursor-pointer"
                style={{
                  backgroundColor: 'var(--bg-card)',
                  boxShadow: 'var(--shadow)',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--bg-card-hover)'
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--bg-card)'
                }}
              >
                <Avatar name={user.full_name} />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate mb-0.5"
                    style={{ color: 'var(--text-primary)' }}>
                    {user.full_name}
                  </p>
                  <p className="text-xs truncate mb-2"
                    style={{ color: 'var(--text-secondary)' }}>
                    {user.phone_number}
                  </p>
                  <SegmentBadge segment={user.financial_segment} />
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                  style={{ color: 'var(--text-secondary)', flexShrink: 0 }}>
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </button>
            ))}

            {filtered.length === 0 && (
              <div className="col-span-full text-center py-20">
                <p className="text-3xl mb-3">🔍</p>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Никого не нашлось по запросу «{search}»
                </p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}