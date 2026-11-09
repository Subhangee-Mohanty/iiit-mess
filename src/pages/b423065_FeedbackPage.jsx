import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../b423065_api.js'
import { useToast } from '../b423065_Toast.jsx'
import { useFetch } from '../b423065_hooks.js'
import { DAYS, MEAL_META, dayIndexOf, formatDay } from '../b423065_format.js'
import { Chip, EmptyState, ErrorBox, PageHead, PageLoader, Spinner, Stars } from '../components/b423065_components.jsx'

function FeedbackCard({ token, existing, onSaved }) {
  const toast = useToast()
  const [rating, setRating] = useState(existing ? existing.rating : 0)
  const [comment, setComment] = useState(existing ? existing.comment : '')
  const [busy, setBusy] = useState(false)

  async function save() {
    if (!rating) {
      toast('Choose a star rating first', 'error')
      return
    }
    setBusy(true)
    try {
      await api.post('/feedback', { dateKey: token.dateKey, mealType: token.mealType, rating, comment })
      toast(existing ? 'Feedback updated' : 'Thanks for your feedback!')
      onSaved()
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <article className="card feedback-card">
      <div className="feedback-top">
        <span className="meal-icon big">{MEAL_META[token.mealType].icon}</span>
        <div>
          <h3>{MEAL_META[token.mealType].label}</h3>
          <small className="muted">
            {DAYS[dayIndexOf(token.dateKey)]}, {formatDay(token.dateKey)}
          </small>
        </div>
        {existing && <Chip tone="success">Reviewed</Chip>}
      </div>
      <p className="muted">{token.items.join(', ')}</p>
      <Stars value={rating} onChange={setRating} />
      <textarea
        className="input textarea"
        rows={2}
        maxLength={500}
        placeholder="Anything we should know? (optional)"
        value={comment}
        onChange={event => setComment(event.target.value)}
      />
      <button className="btn btn-primary btn-sm" disabled={busy} onClick={save}>
        {busy ? <Spinner size={16} /> : existing ? 'Update review' : 'Submit review'}
      </button>
    </article>
  )
}

export default function FeedbackPage() {
  const tokensQ = useFetch('/tokens/mine')
  const feedbackQ = useFetch('/feedback/mine')
  const metaQ = useFetch('/meta')

  const error = tokensQ.error || feedbackQ.error || metaQ.error
  if (error) {
    return (
      <div className="container page">
        <ErrorBox
          message={error}
          onRetry={() => {
            tokensQ.reload()
            feedbackQ.reload()
            metaQ.reload()
          }}
        />
      </div>
    )
  }
  if (!tokensQ.data || !feedbackQ.data || !metaQ.data) return <PageLoader label="Loading your meals" />

  const today = metaQ.data.today
  const eligible = tokensQ.data.tokens.filter(token => token.status !== 'cancelled' && token.dateKey <= today).slice(0, 30)
  const reviews = new Map(feedbackQ.data.feedback.map(item => [`${item.dateKey}|${item.mealType}`, item]))

  return (
    <div className="container page">
      <PageHead title="Meal Feedback" subtitle="Rate the meals you have had so the mess can improve." />
      {eligible.length === 0 ? (
        <EmptyState
          icon="⭐"
          title="Nothing to review yet"
          text="Once the day of a booked meal arrives, you can rate it here."
          action={
            <Link to="/book" className="btn btn-primary">
              Book tokens
            </Link>
          }
        />
      ) : (
        <div className="grid grid-3">
          {eligible.map(token => {
            const existing = reviews.get(`${token.dateKey}|${token.mealType}`)
            return (
              <FeedbackCard
                key={`${token._id}-${existing ? existing.updatedAt : 'new'}`}
                token={token}
                existing={existing}
                onSaved={feedbackQ.reload}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
