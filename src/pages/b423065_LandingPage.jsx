import { Link } from 'react-router-dom'
import { useFetch } from '../b423065_hooks.js'
import { DAYS, MEAL_META, MEAL_ORDER, dayIndexOf, money } from '../b423065_format.js'

const FEATURES = [
  { icon: '📅', title: 'Weekly menu at a glance', text: 'Breakfast, lunch and dinner for all seven days, with clear prices.' },
  { icon: '🎟️', title: 'Smart token cart', text: 'Add or remove meal tokens freely and submit them only when you are sure.' },
  { icon: '💸', title: 'Automatic dues', text: 'Every submitted token lands in your dues instantly. No payment gateway needed.' },
  { icon: '⏰', title: 'Fair cancellation', text: 'Cancel up to two hours before a meal and the amount is credited back to your dues.' },
  { icon: '⭐', title: 'Rate every meal', text: 'Share quick feedback after each meal so the kitchen keeps improving.' },
  { icon: '🛡️', title: 'Admin console', text: 'Edit menus, verify tokens at the counter, track dues and publish notices.' }
]

const STEPS = [
  { title: 'Create your account', text: 'Sign up with your roll number in under a minute.' },
  { title: 'Pick your meals', text: 'Tap meals from the weekly menu to fill your token cart.' },
  { title: 'Submit and relax', text: 'Tokens are generated and the amount joins your dues.' }
]

export default function LandingPage() {
  const menuQ = useFetch('/menu')
  const metaQ = useFetch('/meta')
  const menu = menuQ.data && menuQ.data.menu
  const today = metaQ.data && metaQ.data.today
  const dayIndex = today ? dayIndexOf(today) : null
  const todayMeals = menu && dayIndex !== null ? menu.filter(entry => entry.dayIndex === dayIndex) : []

  return (
    <div className="landing">
      <section className="hero">
        <div className="hero-glow hero-glow-a" />
        <div className="hero-glow hero-glow-b" />
        <div className="container hero-grid">
          <div className="hero-copy">
            <span className="eyebrow">IIIT Bhubaneswar · Mess Management</span>
            <h1>
              Skip the queue.
              <br />
              <span className="grad-text">Book your meals.</span>
            </h1>
            <p className="hero-sub">
              One place for the weekly menu, meal tokens and your mess dues. Plan your week in seconds and know exactly
              what you owe.
            </p>
            <div className="hero-cta">
              <Link to="/register" className="btn btn-primary btn-lg">
                Get started free
              </Link>
              <Link to="/menu" className="btn btn-ghost btn-lg">
                View weekly menu
              </Link>
            </div>
            <div className="hero-stats">
              <div>
                <b>3</b>
                <span>meals a day</span>
              </div>
              <div>
                <b>7</b>
                <span>day menu</span>
              </div>
              <div>
                <b>2 hrs</b>
                <span>free cancellation</span>
              </div>
            </div>
          </div>
          <div className="hero-visual" aria-hidden="true">
            <div className="float-card fc-1">
              <span>🌅</span>
              <div>
                <b>Breakfast</b>
                <small>Idli, Sambar, Tea</small>
              </div>
              <em>₹35</em>
            </div>
            <div className="float-card fc-2">
              <span>🍛</span>
              <div>
                <b>Lunch</b>
                <small>Rice, Dal, Sabzi</small>
              </div>
              <em>₹65</em>
            </div>
            <div className="float-card fc-3">
              <span>🌙</span>
              <div>
                <b>Dinner</b>
                <small>Pulao, Paneer, Roti</small>
              </div>
              <em>₹85</em>
            </div>
            <div className="token-ticket">
              <small>MEAL TOKEN</small>
              <strong>MT-7K4Q2X</strong>
              <span>Valid today · Lunch</span>
            </div>
          </div>
        </div>
      </section>

      <section className="container section">
        <div className="section-head">
          <h2>Today on the menu</h2>
          <p className="muted">{today ? `${DAYS[dayIndex]}'s meals and prices` : 'Fresh from the kitchen'}</p>
        </div>
        {todayMeals.length ? (
          <div className="grid grid-3">
            {MEAL_ORDER.map(type => {
              const entry = todayMeals.find(item => item.mealType === type)
              if (!entry) return null
              return (
                <article key={type} className="card meal-card">
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
        ) : (
          <div className="card card-pad muted">Menu is loading or not published yet.</div>
        )}
      </section>

      <section className="container section">
        <div className="section-head">
          <h2>Everything your mess needs</h2>
          <p className="muted">Built for students and for the mess office</p>
        </div>
        <div className="grid grid-3">
          {FEATURES.map(feature => (
            <article key={feature.title} className="card feature">
              <span className="feature-icon">{feature.icon}</span>
              <h3>{feature.title}</h3>
              <p className="muted">{feature.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="container section">
        <div className="section-head">
          <h2>How it works</h2>
        </div>
        <div className="grid grid-3">
          {STEPS.map((step, index) => (
            <article key={step.title} className="card step">
              <span className="step-num">{index + 1}</span>
              <h3>{step.title}</h3>
              <p className="muted">{step.text}</p>
            </article>
          ))}
        </div>
        <div className="cta-band">
          <div>
            <h2>Ready to plan your week?</h2>
            <p>Create an account and book your first tokens today.</p>
          </div>
          <Link to="/register" className="btn btn-light btn-lg">
            Create account
          </Link>
        </div>
      </section>
    </div>
  )
}
