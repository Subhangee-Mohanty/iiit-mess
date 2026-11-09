import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../b423065_api.js'
import { useAuth } from '../b423065_AuthContext.jsx'
import { useToast } from '../b423065_Toast.jsx'
import { useFetch } from '../b423065_hooks.js'
import {
  DAYS,
  MEAL_META,
  MEAL_ORDER,
  addDays,
  dayIndexOf,
  formatDay,
  money,
  slotState,
  weekStart
} from '../b423065_format.js'
import { ErrorBox, Modal, PageHead, PageLoader, Spinner } from '../components/b423065_components.jsx'

const readCart = key => {
  try {
    const saved = JSON.parse(localStorage.getItem(key))
    return Array.isArray(saved) ? saved : []
  } catch {
    return []
  }
}

export default function BookPage() {
  const { user } = useAuth()
  const toast = useToast()
  const menuQ = useFetch('/menu')
  const metaQ = useFetch('/meta')
  const tokensQ = useFetch('/tokens/mine')
  const duesQ = useFetch('/dues')
  const cartKey = `mess_cart_${user.rollNo}`

  const [week, setWeek] = useState(0)
  const [cart, setCart] = useState(() => readCart(cartKey))
  const [reviewing, setReviewing] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [issues, setIssues] = useState([])
  const [done, setDone] = useState(null)

  const menu = menuQ.data && menuQ.data.menu
  const meta = metaQ.data
  const tokens = tokensQ.data && tokensQ.data.tokens
  const dues = duesQ.data

  const menuMap = useMemo(() => {
    const map = {}
    ;(menu || []).forEach(entry => {
      map[`${entry.dayIndex}-${entry.mealType}`] = entry
    })
    return map
  }, [menu])

  const booked = useMemo(() => {
    const set = new Set()
    ;(tokens || []).forEach(token => {
      if (token.status !== 'cancelled') set.add(`${token.dateKey}|${token.mealType}`)
    })
    return set
  }, [tokens])

  useEffect(() => {
    try {
      localStorage.setItem(cartKey, JSON.stringify(cart))
    } catch {
      return
    }
  }, [cart, cartKey])

  useEffect(() => {
    if (!meta || !tokens) return
    setCart(current => {
      const kept = current.filter(key => {
        const [dateKey, mealType] = key.split('|')
        return slotState(meta, dateKey, mealType).open && !booked.has(key)
      })
      return kept.length === current.length ? current : kept
    })
  }, [meta, tokens, booked])

  const firstError = menuQ.error || metaQ.error || tokensQ.error || duesQ.error
  if (firstError) {
    return (
      <div className="container page">
        <ErrorBox
          message={firstError}
          onRetry={() => {
            menuQ.reload()
            metaQ.reload()
            tokensQ.reload()
            duesQ.reload()
          }}
        />
      </div>
    )
  }
  if (!menu || !meta || !tokens || !dues) return <PageLoader label="Loading menu and tokens" />

  const lines = cart
    .map(key => {
      const [dateKey, mealType] = key.split('|')
      const entry = menuMap[`${dayIndexOf(dateKey)}-${mealType}`]
      return { key, dateKey, mealType, price: entry ? entry.price : 0, items: entry ? entry.items : [] }
    })
    .sort((a, b) =>
      a.dateKey === b.dateKey
        ? MEAL_ORDER.indexOf(a.mealType) - MEAL_ORDER.indexOf(b.mealType)
        : a.dateKey.localeCompare(b.dateKey)
    )
  const total = lines.reduce((sum, line) => sum + line.price, 0)

  const start = weekStart(meta.today, week)
  const days = Array.from({ length: 7 }, (_, index) => addDays(start, index))

  const toggle = key => setCart(current => (current.includes(key) ? current.filter(item => item !== key) : [...current, key]))

  const toggleDay = (selectable, allInCart) => {
    const keys = selectable.map(item => item.key)
    setCart(current => (allInCart ? current.filter(item => !keys.includes(item)) : [...new Set([...current, ...keys])]))
  }

  const openReview = () => {
    setIssues([])
    setReviewing(true)
  }

  async function submit() {
    setSubmitting(true)
    setIssues([])
    try {
      const selections = lines.map(line => ({ dateKey: line.dateKey, mealType: line.mealType }))
      const result = await api.post('/tokens/submit', { selections })
      setCart([])
      setReviewing(false)
      setDone(result)
      toast(`${result.tokens.length} token${result.tokens.length === 1 ? '' : 's'} booked`)
      tokensQ.reload()
      duesQ.reload()
    } catch (err) {
      if (err.issues && err.issues.length) {
        setIssues(err.issues)
        metaQ.reload()
        tokensQ.reload()
      } else {
        toast(err.message, 'error')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container page">
      <PageHead
        title="Book Tokens"
        subtitle="Tap meals to add them to your cart. Nothing is charged until you submit."
        actions={
          <div className="segmented">
            <button className={week === 0 ? 'active' : ''} onClick={() => setWeek(0)}>
              This week
            </button>
            <button className={week === 1 ? 'active' : ''} onClick={() => setWeek(1)}>
              Next week
            </button>
          </div>
        }
      />

      <div className="book-layout">
        <div className="book-days">
          {days.map(dateKey => {
            const index = dayIndexOf(dateKey)
            const isToday = dateKey === meta.today
            const dayMeals = MEAL_ORDER.map(type => ({
              type,
              entry: menuMap[`${index}-${type}`],
              key: `${dateKey}|${type}`,
              state: slotState(meta, dateKey, type)
            }))
            const selectable = dayMeals.filter(item => item.entry && item.state.open && !booked.has(item.key))
            const allInCart = selectable.length > 0 && selectable.every(item => cart.includes(item.key))

            return (
              <article key={dateKey} className={`day-card${isToday ? ' today' : ''}`}>
                <header className="day-head">
                  <div>
                    <h3>{DAYS[index]}</h3>
                    <span className="muted">
                      {formatDay(dateKey)}
                      {isToday && <em className="today-tag">Today</em>}
                    </span>
                  </div>
                  <button
                    className="btn btn-ghost btn-sm"
                    disabled={!selectable.length}
                    onClick={() => toggleDay(selectable, allInCart)}
                  >
                    {allInCart ? 'Remove day' : 'Add whole day'}
                  </button>
                </header>
                <div className="meal-row">
                  {dayMeals.map(({ type, entry, key, state }) => {
                    const isBooked = booked.has(key)
                    const inCart = cart.includes(key)
                    const disabled = isBooked || !state.open || !entry
                    return (
                      <button
                        key={type}
                        type="button"
                        disabled={disabled}
                        className={`meal-tile${inCart ? ' selected' : ''}${isBooked ? ' booked' : ''}`}
                        onClick={() => toggle(key)}
                      >
                        <span className="meal-tile-top">
                          <span className="meal-icon">{MEAL_META[type].icon}</span>
                          <b>{MEAL_META[type].label}</b>
                          <span className="meal-price">{entry ? money(entry.price) : '-'}</span>
                        </span>
                        <span className="meal-items">{entry ? entry.items.join(', ') : 'Not available'}</span>
                        <span className="meal-tile-foot">
                          {isBooked
                            ? '✓ Already booked'
                            : inCart
                              ? '✓ In cart · tap to remove'
                              : state.open
                                ? '+ Add token'
                                : state.reason}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </article>
            )
          })}
        </div>

        <aside className="cart card">
          <div className="cart-head">
            <h3>🛒 Token cart</h3>
            {lines.length > 0 && (
              <button className="link-btn" onClick={() => setCart([])}>
                Clear all
              </button>
            )}
          </div>

          {lines.length === 0 ? (
            <div className="cart-empty">
              <span>🍽️</span>
              <p className="muted">Your cart is empty. Pick some meals from the calendar.</p>
            </div>
          ) : (
            <ul className="cart-list">
              {lines.map(line => (
                <li key={line.key}>
                  <div>
                    <b>
                      {MEAL_META[line.mealType].icon} {MEAL_META[line.mealType].label}
                    </b>
                    <span className="muted">{formatDay(line.dateKey)}</span>
                  </div>
                  <div className="cart-right">
                    <b>{money(line.price)}</b>
                    <button className="icon-btn" onClick={() => toggle(line.key)} aria-label="Remove token">
                      ✕
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className="cart-sums">
            <div>
              <span>
                {lines.length} token{lines.length === 1 ? '' : 's'}
              </span>
              <b>{money(total)}</b>
            </div>
            <div>
              <span>Current dues</span>
              <span>{money(dues.total)}</span>
            </div>
            <div className="strong">
              <span>Dues after submit</span>
              <span>{money(dues.total + total)}</span>
            </div>
          </div>

          <button className="btn btn-primary btn-block btn-lg" disabled={!lines.length} onClick={openReview}>
            Review &amp; submit
          </button>
          <p className="fineprint">No payment now. The total is added to your dues and settled at the mess office.</p>
        </aside>
      </div>

      {lines.length > 0 && (
        <div className="cart-bar">
          <span>
            <b>{lines.length}</b> token{lines.length === 1 ? '' : 's'} · <b>{money(total)}</b>
          </span>
          <button className="btn btn-primary btn-sm" onClick={openReview}>
            Review
          </button>
        </div>
      )}

      {reviewing && (
        <Modal
          title="Confirm your tokens"
          onClose={() => !submitting && setReviewing(false)}
          footer={
            <>
              <button className="btn btn-ghost" disabled={submitting} onClick={() => setReviewing(false)}>
                Keep editing
              </button>
              <button className="btn btn-primary" disabled={submitting || !lines.length} onClick={submit}>
                {submitting ? <Spinner size={18} /> : `Submit ${lines.length} token${lines.length === 1 ? '' : 's'}`}
              </button>
            </>
          }
        >
          {issues.length > 0 && (
            <div className="alert alert-error">
              <b>Some meals could not be booked:</b>
              <ul>
                {issues.map(issue => (
                  <li key={`${issue.dateKey}${issue.mealType}`}>
                    {issue.dateKey && formatDay(issue.dateKey)} {issue.mealType && MEAL_META[issue.mealType] ? MEAL_META[issue.mealType].label : ''}:{' '}
                    {issue.message}
                  </li>
                ))}
              </ul>
              <p>Remove them from your cart and submit again.</p>
            </div>
          )}
          <ul className="review-list">
            {lines.map(line => (
              <li key={line.key}>
                <span>
                  {MEAL_META[line.mealType].icon} {formatDay(line.dateKey)} · {MEAL_META[line.mealType].label}
                </span>
                <b>{money(line.price)}</b>
              </li>
            ))}
          </ul>
          <div className="review-total">
            <span>Amount added to your dues</span>
            <b>{money(total)}</b>
          </div>
          <p className="fineprint">
            Dues will change from {money(dues.total)} to {money(dues.total + total)}. You can cancel a token up to two hours
            before its meal.
          </p>
        </Modal>
      )}

      {done && (
        <Modal
          title="Tokens booked 🎉"
          onClose={() => setDone(null)}
          footer={
            <>
              <Link to="/dues" className="btn btn-ghost" onClick={() => setDone(null)}>
                View dues
              </Link>
              <Link to="/tokens" className="btn btn-primary" onClick={() => setDone(null)}>
                See my tokens
              </Link>
            </>
          }
        >
          <div className="success-box">
            <span className="success-icon">✅</span>
            <h3>
              {done.tokens.length} token{done.tokens.length === 1 ? '' : 's'} confirmed
            </h3>
            <p className="muted">{money(done.totalCharged)} has been added to your dues.</p>
            <p>
              Total dues now: <b>{money(done.dues.total)}</b>
            </p>
          </div>
        </Modal>
      )}
    </div>
  )
}
