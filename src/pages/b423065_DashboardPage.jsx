import { Link } from 'react-router-dom'
import { useAuth } from '../b423065_AuthContext.jsx'
import { useCountUp, useFetch } from '../b423065_hooks.js'
import { DAYS, MEAL_META, MEAL_ORDER, dayIndexOf, formatDateTime, formatLong, money, slotState } from '../b423065_format.js'
import { Chip, ErrorBox, PageHead, PageLoader, StatCard } from '../components/b423065_components.jsx'

export default function DashboardPage() {
  const { user } = useAuth()
  const metaQ = useFetch('/meta')
  const menuQ = useFetch('/menu')
  const tokensQ = useFetch('/tokens/mine')
  const duesQ = useFetch('/dues')
  const noticesQ = useFetch('/notices')

  const meta = metaQ.data
  const menu = menuQ.data && menuQ.data.menu
  const tokens = tokensQ.data && tokensQ.data.tokens
  const dues = duesQ.data
  const notices = noticesQ.data && noticesQ.data.notices

  const animatedDues = useCountUp(dues ? dues.total : 0)

  const firstError = metaQ.error || menuQ.error || tokensQ.error || duesQ.error
  if (firstError) {
    return (
      <div className="container page">
        <ErrorBox message={firstError} onRetry={() => { metaQ.reload(); menuQ.reload(); tokensQ.reload(); duesQ.reload() }} />
      </div>
    )
  }
  if (!meta || !menu || !tokens || !dues) return <PageLoader label="Preparing your dashboard" />

  const month = meta.today.slice(0, 7)
  const active = tokens.filter(token => token.status !== 'cancelled')
  const upcoming = active.filter(token => token.status === 'booked' && token.dateKey >= meta.today)
  const monthTokens = active.filter(token => token.dateKey.startsWith(month))
  const monthSpend = monthTokens.reduce((sum, token) => sum + token.price, 0)
  const todayIndex = dayIndexOf(meta.today)
  const todayTokens = tokens.filter(token => token.dateKey === meta.today && token.status !== 'cancelled')
  const dueState = dues.total > 0 ? 'You owe the mess' : dues.total < 0 ? 'Advance credit' : 'All clear'

  return (
    <div className="container page">
      <PageHead
        title={`Hi, ${user.name.split(' ')[0]} 👋`}
        subtitle={formatLong(meta.today)}
        actions={
          <Link to="/book" className="btn btn-primary">
            Book tokens
          </Link>
        }
      />

      <div className="grid grid-4">
        <StatCard
          icon="💰"
          label="Total dues"
          value={money(animatedDues)}
          hint={dueState}
          tone={dues.total > 0 ? 'warn' : 'success'}
        />
        <StatCard icon="🎟️" label="Upcoming tokens" value={upcoming.length} hint="Booked and waiting" tone="primary" />
        <StatCard icon="📆" label="Tokens this month" value={monthTokens.length} hint="Excluding cancelled" tone="info" />
        <StatCard icon="🧾" label="Spend this month" value={money(monthSpend)} hint="Added to your dues" tone="accent" />
      </div>

      <div className="split">
        <section>
          <div className="section-head left">
            <h2>Today's meals · {DAYS[todayIndex]}</h2>
          </div>
          <div className="stack">
            {MEAL_ORDER.map(type => {
              const entry = menu.find(item => item.dayIndex === todayIndex && item.mealType === type)
              if (!entry) return null
              const token = todayTokens.find(item => item.mealType === type)
              const state = slotState(meta, meta.today, type)
              return (
                <article key={type} className="card row-card">
                  <span className="meal-icon big">{MEAL_META[type].icon}</span>
                  <div className="row-card-body">
                    <h3>
                      {MEAL_META[type].label} <small className="muted">{MEAL_META[type].time}</small>
                    </h3>
                    <p className="muted">{entry.items.join(', ')}</p>
                  </div>
                  <div className="row-card-side">
                    <b>{money(entry.price)}</b>
                    {token ? (
                      <Chip tone={token.status === 'used' ? 'info' : 'success'}>
                        {token.status === 'used' ? 'Used' : `Token ${token.code}`}
                      </Chip>
                    ) : state.open ? (
                      <Link to="/book" className="btn btn-ghost btn-sm">
                        Book
                      </Link>
                    ) : (
                      <Chip>Closed</Chip>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        </section>

        <section>
          <div className="section-head left">
            <h2>Notices</h2>
          </div>
          <div className="stack">
            {notices && notices.length ? (
              notices.slice(0, 4).map(notice => (
                <article key={notice._id} className="card notice">
                  <div className="notice-top">
                    <h3>{notice.pinned && '📌 '}{notice.title}</h3>
                  </div>
                  <p>{notice.body}</p>
                  <small className="muted">
                    {notice.author} · {formatDateTime(notice.createdAt)}
                  </small>
                </article>
              ))
            ) : (
              <div className="card card-pad muted">No notices right now.</div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
