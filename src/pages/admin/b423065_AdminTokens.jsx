import { useEffect, useState } from 'react'
import { api } from '../../b423065_api.js'
import { useToast } from '../../b423065_Toast.jsx'
import { useFetch } from '../../b423065_hooks.js'
import { MEAL_META, MEAL_ORDER, money } from '../../b423065_format.js'
import { Chip, EmptyState, ErrorBox, PageLoader, Spinner } from '../../components/b423065_components.jsx'

export default function AdminTokens() {
  const toast = useToast()
  const metaQ = useFetch('/meta')
  const [date, setDate] = useState('')
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState(null)
  const [mealFilter, setMealFilter] = useState('all')

  useEffect(() => {
    if (!date && metaQ.data) setDate(metaQ.data.today)
  }, [date, metaQ.data])

  const listQ = useFetch(date ? `/admin/tokens?date=${date}` : '', Boolean(date))

  if (metaQ.error) return <ErrorBox message={metaQ.error} onRetry={metaQ.reload} />
  if (!metaQ.data || !date) return <PageLoader label="Loading counter" />

  async function redeem(event) {
    event.preventDefault()
    setBusy(true)
    setResult(null)
    try {
      const data = await api.post('/admin/redeem', { code })
      setResult({ ok: true, token: data.token })
      toast(`${data.token.user.name} served`)
      setCode('')
      listQ.reload()
    } catch (err) {
      setResult({ ok: false, message: err.message })
    } finally {
      setBusy(false)
    }
  }

  const data = listQ.data
  const tokens = data ? data.tokens.filter(token => mealFilter === 'all' || token.mealType === mealFilter) : []
  const sorted = [...tokens].sort((a, b) => MEAL_ORDER.indexOf(a.mealType) - MEAL_ORDER.indexOf(b.mealType))

  return (
    <div className="stack-lg">
      <section className="card card-pad">
        <h3>Verify a token</h3>
        <p className="muted">Enter the code shown by the student. Valid tokens are marked as used.</p>
        <form className="inline-form" onSubmit={redeem}>
          <input
            className="input code-input"
            placeholder="MT-XXXXXX"
            value={code}
            onChange={event => setCode(event.target.value.toUpperCase())}
            required
          />
          <button className="btn btn-primary" disabled={busy}>
            {busy ? <Spinner size={18} /> : 'Verify & serve'}
          </button>
        </form>
        {result && result.ok && (
          <div className="alert alert-success">
            ✅ {result.token.user.name} ({result.token.user.rollNo}) · {MEAL_META[result.token.mealType].label} served
          </div>
        )}
        {result && !result.ok && <div className="alert alert-error">⚠️ {result.message}</div>}
      </section>

      <section className="card card-pad">
        <div className="toolbar">
          <div>
            <h3>Tokens for the day</h3>
            <p className="muted">Active tokens grouped for the kitchen and the counter.</p>
          </div>
          <input className="input date-input" type="date" value={date} onChange={event => setDate(event.target.value)} />
        </div>

        {listQ.error && <ErrorBox message={listQ.error} onRetry={listQ.reload} />}
        {!data && !listQ.error && <PageLoader label="Loading tokens" />}

        {data && (
          <>
            <div className="meal-counts">
              <button className={`meal-count${mealFilter === 'all' ? ' active' : ''}`} onClick={() => setMealFilter('all')}>
                <span>🍽️</span>
                <b>{data.tokens.length}</b>
                <small>All</small>
              </button>
              {MEAL_ORDER.map(type => (
                <button
                  key={type}
                  className={`meal-count${mealFilter === type ? ' active' : ''}`}
                  onClick={() => setMealFilter(type)}
                >
                  <span>{MEAL_META[type].icon}</span>
                  <b>{data.counts[type]}</b>
                  <small>{MEAL_META[type].label}</small>
                </button>
              ))}
            </div>

            {sorted.length === 0 ? (
              <EmptyState icon="🎟️" title="No tokens" text="Nobody has booked a meal for this selection." />
            ) : (
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Code</th>
                      <th>Student</th>
                      <th>Hostel</th>
                      <th>Meal</th>
                      <th>Status</th>
                      <th className="num">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sorted.map(token => (
                      <tr key={token._id}>
                        <td>
                          <code>{token.code}</code>
                        </td>
                        <td>
                          <b>{token.user ? token.user.name : 'Deleted user'}</b>
                          <br />
                          <small className="muted">{token.user && token.user.rollNo}</small>
                        </td>
                        <td>
                          {token.user && token.user.hostel} {token.user && token.user.room}
                        </td>
                        <td>
                          {MEAL_META[token.mealType].icon} {MEAL_META[token.mealType].label}
                        </td>
                        <td>
                          <Chip tone={token.status === 'used' ? 'info' : 'success'}>
                            {token.status === 'used' ? 'Served' : 'Pending'}
                          </Chip>
                        </td>
                        <td className="num">{money(token.price)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  )
}
