import { useFetch } from '../../b423065_hooks.js'
import { MEAL_META, MEAL_ORDER, SHORT_DAYS, dayIndexOf, money } from '../../b423065_format.js'
import { ErrorBox, PageLoader, StatCard } from '../../components/b423065_components.jsx'

export default function AdminOverview() {
  const statsQ = useFetch('/admin/stats')
  const stats = statsQ.data

  if (statsQ.error) return <ErrorBox message={statsQ.error} onRetry={statsQ.reload} />
  if (!stats) return <PageLoader label="Loading overview" />

  const peak = Math.max(1, ...stats.week.map(day => day.count))
  const todayTotal = MEAL_ORDER.reduce((sum, type) => sum + stats.todayMeals[type], 0)

  return (
    <div className="stack-lg">
      <div className="grid grid-4">
        <StatCard icon="🎓" label="Students" value={stats.students} hint="Registered accounts" tone="primary" />
        <StatCard icon="💰" label="Outstanding dues" value={money(stats.outstanding)} hint="Across all students" tone="warn" />
        <StatCard icon="✅" label="Payments recorded" value={money(stats.collected)} hint="Collected at the office" tone="success" />
        <StatCard
          icon="⭐"
          label="Average rating"
          value={stats.rating.count ? `${stats.rating.average} / 5` : 'N/A'}
          hint={`${stats.rating.count} review${stats.rating.count === 1 ? '' : 's'}`}
          tone="accent"
        />
      </div>

      <div className="grid grid-2">
        <section className="card card-pad">
          <h3>Today's token count</h3>
          <p className="muted">{todayTotal} tokens booked for today</p>
          <div className="meal-counts">
            {MEAL_ORDER.map(type => (
              <div key={type} className="meal-count">
                <span>{MEAL_META[type].icon}</span>
                <b>{stats.todayMeals[type]}</b>
                <small>{MEAL_META[type].label}</small>
              </div>
            ))}
          </div>
        </section>

        <section className="card card-pad">
          <h3>Next 7 days</h3>
          <p className="muted">Tokens booked per day, useful for kitchen planning</p>
          <div className="bars">
            {stats.week.map(day => (
              <div key={day.dateKey} className="bar-col">
                <b>{day.count}</b>
                <div className="bar-track">
                  <div className="bar-fill" style={{ height: `${(day.count / peak) * 100}%` }} />
                </div>
                <small>{SHORT_DAYS[dayIndexOf(day.dateKey)]}</small>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
