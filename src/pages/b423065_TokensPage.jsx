import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../b423065_api.js'
import { useToast } from '../b423065_Toast.jsx'
import { useFetch } from '../b423065_hooks.js'
import { DAYS, MEAL_META, MEAL_ORDER, cancellable, dayIndexOf, formatDay, money } from '../b423065_format.js'
import { Chip, EmptyState, ErrorBox, Modal, PageHead, PageLoader, Spinner } from '../components/b423065_components.jsx'

const TABS = [
  ['upcoming', 'Upcoming'],
  ['past', 'Past'],
  ['cancelled', 'Cancelled']
]

export default function TokensPage() {
  const toast = useToast()
  const tokensQ = useFetch('/tokens/mine')
  const metaQ = useFetch('/meta')
  const [tab, setTab] = useState('upcoming')
  const [target, setTarget] = useState(null)
  const [busy, setBusy] = useState(false)

  const tokens = tokensQ.data && tokensQ.data.tokens
  const meta = metaQ.data

  if (tokensQ.error || metaQ.error) {
    return (
      <div className="container page">
        <ErrorBox
          message={tokensQ.error || metaQ.error}
          onRetry={() => {
            tokensQ.reload()
            metaQ.reload()
          }}
        />
      </div>
    )
  }
  if (!tokens || !meta) return <PageLoader label="Loading your tokens" />

  const order = (a, b) =>
    a.dateKey === b.dateKey
      ? MEAL_ORDER.indexOf(a.mealType) - MEAL_ORDER.indexOf(b.mealType)
      : a.dateKey.localeCompare(b.dateKey)

  const groups = {
    upcoming: tokens.filter(token => token.status === 'booked' && token.dateKey >= meta.today).sort(order),
    past: tokens
      .filter(token => token.status === 'used' || (token.status === 'booked' && token.dateKey < meta.today))
      .sort((a, b) => order(b, a)),
    cancelled: tokens.filter(token => token.status === 'cancelled').sort((a, b) => order(b, a))
  }
  const list = groups[tab]

  async function confirmCancel() {
    setBusy(true)
    try {
      await api.post(`/tokens/${target._id}/cancel`)
      toast(`Token cancelled. ${money(target.price)} credited back to your dues.`)
      setTarget(null)
      tokensQ.reload()
      metaQ.reload()
    } catch (err) {
      toast(err.message, 'error')
      setTarget(null)
      metaQ.reload()
    } finally {
      setBusy(false)
    }
  }

  const statusChip = token => {
    if (token.status === 'used') return <Chip tone="info">Used</Chip>
    if (token.status === 'cancelled') return <Chip tone="danger">Cancelled</Chip>
    if (token.dateKey < meta.today) return <Chip>Expired</Chip>
    return <Chip tone="success">Booked</Chip>
  }

  return (
    <div className="container page">
      <PageHead
        title="My Tokens"
        subtitle="Show your token code at the mess counter."
        actions={
          <Link to="/book" className="btn btn-primary">
            Book more
          </Link>
        }
      />

      <div className="tabs">
        {TABS.map(([key, label]) => (
          <button key={key} className={`tab${tab === key ? ' active' : ''}`} onClick={() => setTab(key)}>
            {label} <span className="tab-count">{groups[key].length}</span>
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <EmptyState
          icon="🎟️"
          title={`No ${tab} tokens`}
          text={tab === 'upcoming' ? 'Book a few meals and they will show up here.' : 'Nothing to show here yet.'}
          action={
            tab === 'upcoming' && (
              <Link to="/book" className="btn btn-primary">
                Book tokens
              </Link>
            )
          }
        />
      ) : (
        <div className="grid grid-3">
          {list.map(token => (
            <article key={token._id} className={`ticket ticket-${token.status}`}>
              <div className="ticket-top">
                <span className="meal-icon big">{MEAL_META[token.mealType].icon}</span>
                <div>
                  <h3>{MEAL_META[token.mealType].label}</h3>
                  <small className="muted">
                    {DAYS[dayIndexOf(token.dateKey)]}, {formatDay(token.dateKey)}
                  </small>
                </div>
                {statusChip(token)}
              </div>
              <p className="ticket-items">{token.items.join(', ')}</p>
              <div className="ticket-code">
                <small>TOKEN CODE</small>
                <strong>{token.code}</strong>
              </div>
              <div className="ticket-foot">
                <b>{money(token.price)}</b>
                {token.status === 'booked' && cancellable(meta, token.dateKey, token.mealType) && (
                  <button className="btn btn-danger-ghost btn-sm" onClick={() => setTarget(token)}>
                    Cancel token
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {target && (
        <Modal
          title="Cancel this token?"
          onClose={() => !busy && setTarget(null)}
          footer={
            <>
              <button className="btn btn-ghost" disabled={busy} onClick={() => setTarget(null)}>
                Keep token
              </button>
              <button className="btn btn-danger" disabled={busy} onClick={confirmCancel}>
                {busy ? <Spinner size={18} /> : 'Yes, cancel'}
              </button>
            </>
          }
        >
          <p>
            {MEAL_META[target.mealType].label} on {formatDay(target.dateKey)} will be cancelled and{' '}
            <b>{money(target.price)}</b> will be deducted from your dues.
          </p>
        </Modal>
      )}
    </div>
  )
}
