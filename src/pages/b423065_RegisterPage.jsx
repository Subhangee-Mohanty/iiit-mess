import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../b423065_AuthContext.jsx'
import { useToast } from '../b423065_Toast.jsx'
import { HOSTELS } from '../b423065_format.js'
import { Spinner } from '../components/b423065_components.jsx'

const EMPTY = {
  rollNo: '',
  name: '',
  email: '',
  phone: '',
  hostel: HOSTELS[0],
  room: '',
  password: '',
  confirm: ''
}

function validate(form) {
  if (!/^[A-Za-z0-9]{6,12}$/.test(form.rollNo.trim())) return 'Enter a valid roll number such as B423065'
  if (form.name.trim().length < 2) return 'Enter your full name'
  if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) return 'Enter a valid email address'
  if (form.phone.trim() && !/^[0-9+\-\s]{8,15}$/.test(form.phone.trim())) return 'Enter a valid phone number'
  if (form.password.length < 6) return 'Password must be at least 6 characters'
  if (form.password !== form.confirm) return 'Passwords do not match'
  return ''
}

export default function RegisterPage() {
  const { register } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [form, setForm] = useState(EMPTY)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const update = field => event => setForm(current => ({ ...current, [field]: event.target.value }))

  async function submit(event) {
    event.preventDefault()
    const problem = validate(form)
    if (problem) {
      setError(problem)
      return
    }
    setError('')
    setBusy(true)
    try {
      const { confirm, ...payload } = form
      const user = await register(payload)
      toast(`Account created. Welcome, ${user.name.split(' ')[0]}!`)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth">
      <aside className="auth-side">
        <div className="auth-side-inner">
          <span className="eyebrow light">Join the mess portal</span>
          <h2>Book meals in seconds and never wonder about your dues again.</h2>
          <ul className="auth-points">
            <li>⚡ Quick token booking</li>
            <li>🧾 Transparent ledger</li>
            <li>🔔 Notices from the mess office</li>
          </ul>
        </div>
      </aside>
      <section className="auth-main">
        <form className="auth-card auth-card-wide" onSubmit={submit}>
          <h1>Create account</h1>
          <p className="muted">It only takes a minute.</p>

          {error && <div className="alert alert-error">{error}</div>}

          <div className="form-grid">
            <label className="field">
              <span>Roll number</span>
              <input className="input" value={form.rollNo} onChange={update('rollNo')} placeholder="B423065" required />
            </label>
            <label className="field">
              <span>Full name</span>
              <input className="input" value={form.name} onChange={update('name')} placeholder="Your name" required />
            </label>
            <label className="field">
              <span>Email</span>
              <input
                className="input"
                type="email"
                value={form.email}
                onChange={update('email')}
                placeholder="you@iiit-bh.ac.in"
                required
              />
            </label>
            <label className="field">
              <span>Phone (optional)</span>
              <input className="input" value={form.phone} onChange={update('phone')} placeholder="9876543210" />
            </label>
            <label className="field">
              <span>Hostel</span>
              <select className="input" value={form.hostel} onChange={update('hostel')}>
                {HOSTELS.map(hostel => (
                  <option key={hostel}>{hostel}</option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Room number</span>
              <input className="input" value={form.room} onChange={update('room')} placeholder="A-204" />
            </label>
            <label className="field">
              <span>Password</span>
              <input
                className="input"
                type="password"
                value={form.password}
                onChange={update('password')}
                placeholder="At least 6 characters"
                autoComplete="new-password"
                required
              />
            </label>
            <label className="field">
              <span>Confirm password</span>
              <input
                className="input"
                type="password"
                value={form.confirm}
                onChange={update('confirm')}
                placeholder="Repeat password"
                autoComplete="new-password"
                required
              />
            </label>
          </div>

          <button className="btn btn-primary btn-block btn-lg" disabled={busy}>
            {busy ? <Spinner size={18} /> : 'Create account'}
          </button>

          <p className="auth-switch">
            Already registered? <Link to="/login">Log in</Link>
          </p>
        </form>
      </section>
    </div>
  )
}
