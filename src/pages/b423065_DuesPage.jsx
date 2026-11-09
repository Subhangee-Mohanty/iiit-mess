import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCountUp, useFetch } from '../b423065_hooks.js'
import { formatDateTime, money, prettyDescription } from '../b423065_format.js'
import { Chip, EmptyState, ErrorBox, PageHead, PageLoader } from '../components/b423065_components.jsx'

const FILTERS = [
  ['all', 'All'],
  ['charge', 'Charges'],
  ['refund', 'Refunds'],
  ['payment', 'Payments']
]

const TONES = { charge: 'warn', refund: 'info', payment: 'success' }
const LABELS = { charge: 'Charge', refund: 'Refund', payment: 'Payment' }

export default function DuesPage() {
  const duesQ = useFetch('/dues')
  const [filter, setFilter] = useState('all')
  const dues = duesQ.data
  const animated = useCountUp(dues ? dues.total : 0)

  if (duesQ.error) {
    return (
      <div className="container page">
        <ErrorBox message={duesQ.error} onRetry={duesQ.reload} />
      </div>
    )
  }
  if (!dues) return <PageLoader label="Loading your dues" />

  const entries = dues.entries.filter(entry => filter === 'all' || entry.type === filter)
  const state = dues.total > 0 ? 'Amount you owe the mess' : dues.total < 0 ? 'Advance credit with the mess' : 'You have no pending dues'

  return (
    <div className="container page printable">
      <PageHead
        title="My Dues"
        subtitle="Every token you submit is added here automatically."
        actions={
          <button className="btn btn-ghost" onClick={() => window.print()}>
            🖨️ Print statement
          </button>
        }
      />

      <div className="dues-hero">
        <div>
          <p>{state}</p>
          <h2>{money(animated)}</h2>
          <small>Payments are made at the mess office and recorded by the admin. No online payment is needed.</small>
        </div>
        <div className="dues-breakdown">
          <div>
            <span>Total charged</span>
            <b>{money(dues.charges)}</b>
          </div>
          <div>
            <span>Refunded</span>
            <b>{money(dues.refunds)}</b>
          </div>
          <div>
            <span>Paid</span>
            <b>{money(dues.payments)}</b>
          </div>
        </div>
      </div>

      <div className="tabs no-print">
        {FILTERS.map(([key, label]) => (
          <button key={key} className={`tab${filter === key ? ' active' : ''}`} onClick={() => setFilter(key)}>
            {label}
          </button>
        ))}
      </div>

      {entries.length === 0 ? (
        <EmptyState
          icon="🧾"
          title="No entries yet"
          text="Book some tokens and your ledger will fill up."
          action={
            <Link to="/book" className="btn btn-primary">
              Book tokens
            </Link>
          }
        />
      ) : (
        <div className="card table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Type</th>
                <th className="num">Amount</th>
              </tr>
            </thead>
            <tbody>
              {entries.map(entry => (
                <tr key={entry._id}>
                  <td className="nowrap">{formatDateTime(entry.createdAt)}</td>
                  <td>{prettyDescription(entry.description)}</td>
                  <td>
                    <Chip tone={TONES[entry.type]}>{LABELS[entry.type]}</Chip>
                  </td>
                  <td className={`num amount ${entry.type === 'charge' ? 'plus' : 'minus'}`}>
                    {entry.type === 'charge' ? '+' : '−'}
                    {money(entry.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
