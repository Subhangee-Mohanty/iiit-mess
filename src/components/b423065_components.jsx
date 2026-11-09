import { useEffect } from 'react'

export function Logo() {
  return (
    <span className="logo">
      <span className="logo-mark">🍛</span>
      <span className="logo-text">
        <b>IIIT</b> Mess
      </span>
    </span>
  )
}

export function Spinner({ size = 22 }) {
  return <span className="spinner" style={{ width: size, height: size }} />
}

export function PageLoader({ label = 'Loading' }) {
  return (
    <div className="page-loader">
      <Spinner size={36} />
      <p>{label}…</p>
    </div>
  )
}

export function ErrorBox({ message, onRetry }) {
  return (
    <div className="error-box">
      <p>{message}</p>
      {onRetry && (
        <button className="btn btn-ghost btn-sm" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  )
}

export function Modal({ title, onClose, children, footer, wide = false }) {
  useEffect(() => {
    const onKey = event => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <div
      className="modal-backdrop"
      onMouseDown={event => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div className={`modal${wide ? ' modal-wide' : ''}`} role="dialog" aria-modal="true" aria-label={title}>
        <div className="modal-head">
          <h3>{title}</h3>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </div>
  )
}

export function EmptyState({ icon = '🍽️', title, text, action }) {
  return (
    <div className="empty">
      <span className="empty-icon">{icon}</span>
      <h3>{title}</h3>
      {text && <p>{text}</p>}
      {action}
    </div>
  )
}

export function Chip({ tone = 'muted', children }) {
  return <span className={`chip chip-${tone}`}>{children}</span>
}

export function StatCard({ icon, label, value, hint, tone = 'primary' }) {
  return (
    <div className={`stat stat-${tone}`}>
      <span className="stat-icon">{icon}</span>
      <div>
        <p className="stat-label">{label}</p>
        <p className="stat-value">{value}</p>
        {hint && <p className="stat-hint">{hint}</p>}
      </div>
    </div>
  )
}

export function PageHead({ title, subtitle, actions }) {
  return (
    <div className="page-head">
      <div>
        <h1>{title}</h1>
        {subtitle && <p className="muted">{subtitle}</p>}
      </div>
      {actions && <div className="page-head-actions">{actions}</div>}
    </div>
  )
}

export function Stars({ value = 0, onChange, size = 26 }) {
  return (
    <div className="stars" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map(number => (
        <button
          type="button"
          key={number}
          className={`star${number <= value ? ' on' : ''}`}
          style={{ fontSize: size }}
          disabled={!onChange}
          onClick={() => onChange && onChange(number)}
          aria-label={`${number} star${number === 1 ? '' : 's'}`}
        >
          ★
        </button>
      ))}
    </div>
  )
}
