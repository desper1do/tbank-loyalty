/**
 * Виджет 8 — Кросс-селл продуктов экосистемы Т-Банка.
 * Влад: frontend/src/components/CrossSellBlock.tsx
 *
 * Данные статичные (хардкод) — бэкенд не нужен.
 * Принимает пропс segment: "LOW" | "MEDIUM" | "HIGH"
 * и рендерит 2-3 персонализированных карточки продуктов.
 *
 * Гипотеза: Кросс-селл размещён после офферов партнёров и геймификации,
 * но до ИИ-советника. Пользователь уже "разогрет" выгодными офферами
 * и достижениями, поэтому предложение продуктов экосистемы воспринимается
 * как следующий логичный шаг, а не как навязчивая реклама в начале экрана.
 *
 * Все размеры в rem/em — адаптируется под системный шрифт пользователя.
 */

// ─── Типы ────────────────────────────────────────────────────

type Segment = 'LOW' | 'MEDIUM' | 'HIGH'

interface CrossSellProduct {
  id: string
  icon: string
  title: string
  subtitle: string
  description: string
  accentColor: string
  ctaText: string
}

interface Props {
  segment: Segment
}

// ─── Данные по сегментам ──────────────────────────────────────

const PRODUCTS_BY_SEGMENT: Record<Segment, CrossSellProduct[]> = {
  LOW: [
    {
      id: 'tmobile-1',
      icon: '📱',
      title: 'Т-Мобайл',
      subtitle: 'Мобильная связь',
      description: 'Подключи связь и получай кэшбэк за звонки и интернет',
      accentColor: '#FFDD2D',
      ctaText: 'Подключить',
    },
    {
      id: 'tmobile-2',
      icon: '🎁',
      title: 'Т-Мобайл Плюс',
      subtitle: 'Больше выгоды',
      description: 'Безлимитный интернет и двойной кэшбэк за первые 3 месяца',
      accentColor: '#FF9500',
      ctaText: 'Узнать больше',
    },
  ],
  MEDIUM: [
    {
      id: 'invest-1',
      icon: '📈',
      title: 'Т-Инвестиции',
      subtitle: 'Начни инвестировать',
      description: 'Инвестируй от 1 000 ₽ и получи бонус на первую сделку',
      accentColor: '#22C55E',
      ctaText: 'Начать',
    },
    {
      id: 'invest-2',
      icon: '💰',
      title: 'Накопительный счёт',
      subtitle: 'До 18% годовых',
      description: 'Размести свободные средства с повышенной ставкой',
      accentColor: '#FFDD2D',
      ctaText: 'Открыть счёт',
    },
    {
      id: 'tmobile-medium',
      icon: '📱',
      title: 'Т-Мобайл',
      subtitle: 'Для клиентов Т-Банка',
      description: 'Специальные условия на связь с кэшбэком рублями',
      accentColor: '#1A56DB',
      ctaText: 'Подключить',
    },
  ],
  HIGH: [
    {
      id: 'business-1',
      icon: '💼',
      title: 'Т-Бизнес',
      subtitle: 'Бизнес-счёт',
      description: 'Открой бизнес-счёт с повышенным кэшбэком на все операции',
      accentColor: '#FFDD2D',
      ctaText: 'Открыть счёт',
    },
    {
      id: 'business-2',
      icon: '🏢',
      title: 'Т-Бизнес Про',
      subtitle: 'Премиум для бизнеса',
      description: 'Персональный менеджер, эквайринг 0% и бесплатные переводы',
      accentColor: '#22C55E',
      ctaText: 'Узнать больше',
    },
    {
      id: 'invest-high',
      icon: '📊',
      title: 'Т-Инвестиции Про',
      subtitle: 'Для серьёзных вложений',
      description: 'ИИС, брокерский счёт и аналитика для опытных инвесторов',
      accentColor: '#A855F7',
      ctaText: 'Перейти',
    },
  ],
}

// ─── Компонент ───────────────────────────────────────────────

export default function CrossSellBlock({ segment }: Props) {
  const products = PRODUCTS_BY_SEGMENT[segment] ?? PRODUCTS_BY_SEGMENT.LOW

  return (
    <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Заголовок */}
      <div>
        <p style={{
          fontWeight: 700, fontSize: '1.25rem',
          color: 'var(--text-primary)',
          letterSpacing: '-0.3px',
          marginBottom: '0.25rem',
        }}>
          Продукты экосистемы Т
        </p>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
          Подобрано специально для вашего уровня
        </p>
      </div>

      {/* Карточки продуктов */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
        {products.map((product) => (
          <CrossSellCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}

// ─── Карточка одного продукта ─────────────────────────────────

function CrossSellCard({ product }: { product: CrossSellProduct }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'nowrap',
        gap: '0.75rem',
        backgroundColor: 'var(--bg-primary)',
        borderRadius: '1rem',
        padding: '0.75rem 0.875rem',
        border: '1px solid var(--border-color)',
        cursor: 'pointer',
        overflow: 'hidden',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLDivElement
        el.style.transform = 'translateY(-1px)'
        el.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)'
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLDivElement
        el.style.transform = 'translateY(0)'
        el.style.boxShadow = 'none'
      }}
    >
      {/* Иконка — фиксированный размер 3.5rem (56px), не сжимается */}
      <div style={{
        width: '3.5rem',
        height: '3.5rem',
        minWidth: '3.5rem',
        flexShrink: 0,
        borderRadius: '0.875rem',
        backgroundColor: product.accentColor,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1.375rem',
        boxShadow: product.accentColor === '#FFDD2D'
          ? '0 2px 8px rgba(255,221,45,0.4)'
          : `0 2px 8px ${product.accentColor}40`,
      }}>
        {product.icon}
      </div>

      {/* Текст — растягивается, обрезается если не влезает */}
      <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
        <p style={{
          fontWeight: 700,
          fontSize: '0.875rem',
          color: 'var(--text-primary)',
          letterSpacing: '-0.2px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          marginBottom: '0.0625rem',
        }}>
          {product.title}
        </p>
        <p style={{
          fontSize: '0.6875rem',
          color: 'var(--text-secondary)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          marginBottom: '0.125rem',
        }}>
          {product.subtitle}
        </p>
        <p style={{
          fontSize: '0.75rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.4,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {product.description}
        </p>
      </div>

      {/* Кнопка — не сжимается, ширина по контенту */}
      <a
        href="#"
        onClick={e => e.preventDefault()}
        style={{
          flexShrink: 0,
          backgroundColor: product.accentColor,
          color: product.accentColor === '#FFDD2D' ? '#000' : '#fff',
          fontSize: '0.75rem',
          fontWeight: 700,
          padding: '0.4375rem 0.75rem',
          borderRadius: '0.625rem',
          textDecoration: 'none',
          whiteSpace: 'nowrap',
          display: 'block',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.opacity = '0.85' }}
        onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.opacity = '1' }}
      >
        {product.ctaText}
      </a>
    </div>
  )
}