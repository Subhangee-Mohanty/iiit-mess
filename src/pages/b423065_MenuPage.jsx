import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../b423065_AuthContext.jsx'
import { useFetch } from '../b423065_hooks.js'
import { DAYS, MEAL_META, MEAL_ORDER, SHORT_DAYS, dayIndexOf, money } from '../b423065_format.js'
import { ErrorBox, PageHead, PageLoader } from '../components/b423065_components.jsx'

export default function MenuPage() {
  const { user } = useAuth()
  const menuQ = useFetch('/menu')
  const metaQ = useFetch('/meta')
  const [view, setView] = useState('day')
  const [selected, setSelected] = useState(null)

  const menu = menuQ.data && menuQ.data.menu
  const today = metaQ.data && metaQ.data.today
  const todayIndex = today ? dayIndexOf(today) : 0

  useEffect(() => {
    if (selected === null && today) setSelected(todayIndex)
  }, [selected, today, todayIndex])

  if (menuQ.error) return <div className="container page"><ErrorBox message={menuQ.error} onRetry={menuQ.reload} /></div>
  if (!menu || selected === null) return <PageLoader label="Loading menu" />

  const find = (dayIndex, mealType) => menu.find(entry => entry.dayIndex === dayIndex && entry.mealType === mealType)
  const dayTotal = dayIndex => MEAL_ORDER.reduce((sum, type) => sum + ((find(dayIndex, type) || {}).price || 0), 0)

  return (
    <div className="container page">
      <PageHead
        title="Weekly Menu"
        subtitle="Three meals a day, same menu every week. Prices are per meal token."
        actions={
          <div className="segmented">
            <button className={view === 'day' ? 'active' : ''} onClick={() => setView('day')}>
              Day view
            </button>
            <button className={view === 'week' ? 'active' : ''} onClick={() => setView('week')}>
              Full week
            </button>
          </div>
        }
      />

      {view === 'day' ? (
        <>
          <div className="pills">
            {DAYS.map((day, index) => (
              <button
                key={day}
                className={`pill${selected === index ? ' active' : ''}${index === todayIndex ? ' is-today' : ''}`}
                onClick={() => setSelected(index)}
              >
                {SHORT_DAYS[index]}
              </button>
            ))}
          </div>
          <div className="day-summary">
            <h2>{DAYS[selected]}</h2>
            <span className="chip chip-info">Full day: {money(dayTotal(selected))}</span>
          </div>
          <div className="grid grid-3">
            {MEAL_ORDER.map(type => {
              const entry = find(selected, type)
              if (!entry) return null
              return (
                <article key={type} className="card meal-card pop">
                  <div className="meal-card-top">
                    <span className="meal-icon big">{MEAL_META[type].icon}</span>
                    <div>
                      <h3>{MEAL_META[type].label}</h3>
                      <small className="muted">{MEAL_META[type].time}</small>
                    </div>
                    <span className="price-tag">{money(entry.price)}</span>
                  </div>
                  <ul className="dish-list">
                    {entry.items.map(dish => (
                      <li key={dish}>{dish}</li>
                    ))}
                  </ul>
                </article>
              )
            })}
          </div>
        </>
      ) : (
        <div className="card table-wrap">
          <table className="table menu-table">
            <thead>
              <tr>
                <th>Day</th>
                {MEAL_ORDER.map(type => (
                  <th key={type}>
                    {MEAL_META[type].icon} {MEAL_META[type].label}
                  </th>
                ))}
                <th>Full day</th>
              </tr>
            </thead>
            <tbody>
              {DAYS.map((day, index) => (
                <tr key={day} className={index === todayIndex ? 'row-today' : ''}>
                  <td>
                    <b>{day}</b>
                  </td>
                  {MEAL_ORDER.map(type => {
                    const entry = find(index, type)
                    return (
                      <td key={type}>
                        {entry ? (
                          <>
                            <span className="cell-items">{entry.items.join(', ')}</span>
                            <b className="cell-price">{money(entry.price)}</b>
                          </>
                        ) : (
                          '-'
                        )}
                      </td>
                    )
                  })}
                  <td>
                    <b>{money(dayTotal(index))}</b>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="cta-inline">
        {user && user.role === 'student' ? (
          <Link to="/book" className="btn btn-primary btn-lg">
            Book tokens for this week
          </Link>
        ) : !user ? (
          <Link to="/register" className="btn btn-primary btn-lg">
            Sign up to book tokens
          </Link>
        ) : null}
      </div>
    </div>
  )
}
