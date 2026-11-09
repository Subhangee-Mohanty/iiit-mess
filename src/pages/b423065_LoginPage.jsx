import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../b423065_AuthContext.jsx'
import { useToast } from '../b423065_Toast.jsx'
import { Spinner } from '../components/b423065_components.jsx'

export default function LoginPage() {
  const { login } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ identifier: '', password: '' })
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const update = field => event => setForm(current => ({ ...current, [field]: event.target.value }))

  async function submit(event) {
    event.preventDefault()
    setError('')
    setBusy(true)
    try {
      const user = await login(form.identifier, form.password)
      toast(`Welcome back, ${user.name.split(' ')[0]}!`)
      const target = user.role === 'admin' ? '/admin' : (location.state && location.state.from) || '/dashboard'
      navigate(target, { replace: true })
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
          <span className="eyebrow light">Welcome back</span>
          <h2>Your meals, your tokens, your dues. All in one place.</h2>
          <ul className="auth-points">
            <li>🍽️ Browse the weekly menu</li>
            <li>🎟️ Build your token cart</li>
            <li>📊 Track dues in real time</li>
          </ul>
        </div>
      </aside>
      <section className="auth-main">
        <form className="auth-card" onSubmit={submit}>
          <h1>Log in</h1>
          <p className="muted">Use your roll number or email to continue.</p>

          {error && <div className="alert alert-error">{error}</div>}

          <label className="field">
            <span>Roll number or email</span>
            <input
              className="input"
              value={form.identifier}
              onChange={update('identifier')}
              placeholder="B423065"
              autoComplete="username"
              required
            />
          </label>

          <label className="field">
            <span>Password</span>
            <div className="input-wrap">
              <input
                className="input"
                type={show ? 'text' : 'password'}
                value={form.password}
                onChange={update('password')}
                placeholder="Your password"
                autoComplete="current-password"
                required
              />
              <button type="button" className="input-action" onClick={() => setShow(value => !value)}>
                {show ? 'Hide' : 'Show'}
              </button>
            </div>
          </label>

          <button className="btn btn-primary btn-block btn-lg" disabled={busy}>
            {busy ? <Spinner size={18} /> : 'Log in'}
          </button>

          <button
            type="button"
            className="btn btn-ghost btn-block"
            onClick={() => setForm({ identifier: 'DEMO001', password: 'Student@123' })}
          >
            Fill demo student credentials
          </button>

          <p className="auth-switch">
            New here? <Link to="/register">Create an account</Link>
          </p>
        </form>
      </section>
    </div>
  )
}
