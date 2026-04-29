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
// Каждый сегмент видит свой набор продуктов:
// LOW    → базовые продукты для старта: Т-Мобайл (связь = экономия)
// MEDIUM → продукты для роста: Т-Инвестиции (первые инвестиции)
// HIGH   → продукты для бизнеса: Т-Бизнес (бизнес-счёт)

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
    <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Заголовок */}
      <div>
        <p style={{
          fontWeight: 700, fontSize: 17,
          color: 'var(--text-primary)',
          letterSpacing: '-0.3px',
          marginBottom: 4,
        }}>
          Продукты экосистемы Т
        </p>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          Подобрано специально для вашего уровня
        </p>
      </div>

      {/* Карточки продуктов */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
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
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      backgroundColor: 'var(--bg-primary)',
      borderRadius: 16,
      padding: '14px 16px',
      border: '1px solid var(--border-color)',
      transition: 'transform 0.15s ease, box-shadow 0.15s ease',
      cursor: 'pointer',
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
      {/* Иконка продукта */}
      <div style={{
        width: 48,
        height: 48,
        borderRadius: 14,
        backgroundColor: product.accentColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 22,
        flexShrink: 0,
        // Для тёмной темы желтый цвет немного приглушаем через box-shadow
        boxShadow: product.accentColor === '#FFDD2D'
          ? '0 2px 8px rgba(255,221,45,0.4)'
          : `0 2px 8px ${product.accentColor}40`,
      }}>
        {product.icon}
      </div>

      {/* Текст */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 2 }}>
          <p style={{
            fontWeight: 700,
            fontSize: 14,
            color: 'var(--text-primary)',
            letterSpacing: '-0.2px',
          }}>
            {product.title}
          </p>
          <span style={{
            fontSize: 11,
            color: 'var(--text-secondary)',
            whiteSpace: 'nowrap',
          }}>
            {product.subtitle}
          </span>
        </div>
        <p style={{
          fontSize: 12,
          color: 'var(--text-secondary)',
          lineHeight: 1.4,
          // Обрезаем в 2 строки чтобы не раздувать карточку
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {product.description}
        </p>
      </div>

      {/* Кнопка — фиксированная ширина чтобы все кнопки были одной длины */}
      <a
        href="#"
        onClick={e => e.preventDefault()}
        style={{
          flexShrink: 0,
          width: 120,
          backgroundColor: product.accentColor,
          color: product.accentColor === '#FFDD2D' ? '#000' : '#fff',
          fontSize: 12,
          fontWeight: 700,
          padding: '7px 0',
          borderRadius: 10,
          textDecoration: 'none',
          whiteSpace: 'nowrap',
          textAlign: 'center',
          display: 'block',
          transition: 'opacity 0.15s',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.opacity = '0.85' }}
        onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.opacity = '1' }}
      >
        {product.ctaText}
      </a>
    </div>
  )
}