import { useState } from 'react'
import { api } from '../../b423065_api.js'
import { useToast } from '../../b423065_Toast.jsx'
import { useFetch } from '../../b423065_hooks.js'
import { DAYS, MEAL_META, MEAL_ORDER, SHORT_DAYS } from '../../b423065_format.js'
import { ErrorBox, PageLoader, Spinner } from '../../components/b423065_components.jsx'

function MenuEditor({ entry, onSaved }) {
  const toast = useToast()
  const [dishes, setDishes] = useState(entry.items.join('\n'))
  const [price, setPrice] = useState(String(entry.price))
  const [busy, setBusy] = useState(false)

  const changed = dishes !== entry.items.join('\n') || Number(price) !== entry.price

  async function save() {
    setBusy(true)
    try {
      const items = dishes
        .split('\n')
        .map(line => line.trim())
        .filter(Boolean)
      await api.put(`/menu/${entry._id}`, { items, price: Number(price) })
      toast(`${DAYS[entry.dayIndex]} ${MEAL_META[entry.mealType].label} updated`)
      onSaved()
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <article className="card card-pad form-stack">
      <h3>
        {MEAL_META[entry.mealType].icon} {MEAL_META[entry.mealType].label}
      </h3>
      <label className="field">
        <span>Dishes (one per line)</span>
        <textarea className="input textarea" rows={5} value={dishes} onChange={event => setDishes(event.target.value)} />
      </label>
      <label className="field">
        <span>Price per token (₹)</span>
        <input className="input" type="number" min="0" max="2000" value={price} onChange={event => setPrice(event.target.value)} />
      </label>
      <button className="btn btn-primary" disabled={!changed || busy} onClick={save}>
        {busy ? <Spinner size={18} /> : 'Save changes'}
      </button>
    </article>
  )
}

export default function AdminMenu() {
  const menuQ = useFetch('/menu')
  const [day, setDay] = useState(0)
  const menu = menuQ.data && menuQ.data.menu

  if (menuQ.error) return <ErrorBox message={menuQ.error} onRetry={menuQ.reload} />
  if (!menu) return <PageLoader label="Loading menu" />

  return (
    <div className="stack-lg">
      <div className="pills">
        {DAYS.map((name, index) => (
          <button key={name} className={`pill${day === index ? ' active' : ''}`} onClick={() => setDay(index)}>
            {SHORT_DAYS[index]}
          </button>
        ))}
      </div>
      <p className="muted">
        Editing {DAYS[day]}. Changes apply to the weekly menu and to tokens booked from now on. Already booked tokens keep their
        original price.
      </p>
      <div className="grid grid-3">
        {MEAL_ORDER.map(type => {
          const entry = menu.find(item => item.dayIndex === day && item.mealType === type)
          if (!entry) return null
          return <MenuEditor key={`${entry._id}-${entry.updatedAt}`} entry={entry} onSaved={menuQ.reload} />
        })}
      </div>
    </div>
  )
}
