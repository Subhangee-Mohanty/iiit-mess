import { useFetch } from '../../b423065_hooks.js'
import { MEAL_META, MEAL_ORDER, dayIndexOf, formatDateTime, formatDay, DAYS } from '../../b423065_format.js'
import { EmptyState, ErrorBox, PageLoader, Stars } from '../../components/b423065_components.jsx'

export default function AdminFeedback() {
  const feedbackQ = useFetch('/feedback/admin/all')
  const data = feedbackQ.data

  if (feedbackQ.error) return <ErrorBox message={feedbackQ.error} onRetry={feedbackQ.reload} />
  if (!data) return <PageLoader label="Loading feedback" />

  return (
    <div className="stack-lg">
      <div className="grid grid-3">
        {MEAL_ORDER.map(type => {
          const row = data.summary.find(item => item.mealType === type)
          return (
            <article key={type} className="card card-pad rating-card">
              <span className="meal-icon big">{MEAL_META[type].icon}</span>
              <h3>{MEAL_META[type].label}</h3>
              <p className="rating-value">{row ? row.average.toFixed(1) : '–'}</p>
              <Stars value={row ? Math.round(row.average) : 0} size={20} />
              <small className="muted">{row ? `${row.count} review${row.count === 1 ? '' : 's'}` : 'No reviews yet'}</small>
            </article>
          )
        })}
      </div>

      <section className="card card-pad">
        <h3>Latest reviews</h3>
        {data.recent.length === 0 ? (
          <EmptyState icon="💬" title="No feedback yet" text="Student reviews will appear here." />
        ) : (
          <div className="review-feed">
            {data.recent.map(item => (
              <article key={item._id} className="review">
                <div className="review-top">
                  <b>
                    {MEAL_META[item.mealType].icon} {MEAL_META[item.mealType].label} · {DAYS[dayIndexOf(item.dateKey)]},{' '}
                    {formatDay(item.dateKey)}
                  </b>
                  <Stars value={item.rating} size={16} />
                </div>
                {item.comment && <p>{item.comment}</p>}
                <small className="muted">
                  {item.user ? `${item.user.name} (${item.user.rollNo})` : 'Student'} · {formatDateTime(item.updatedAt)}
                </small>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
