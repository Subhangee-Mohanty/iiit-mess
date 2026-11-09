import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../b423065_AuthContext.jsx'
import { useTheme } from '../b423065_hooks.js'
import { Logo } from './b423065_components.jsx'

const GUEST_LINKS = [
  ['/', 'Home'],
  ['/menu', 'Weekly Menu']
]

const STUDENT_LINKS = [
  ['/dashboard', 'Dashboard'],
  ['/menu', 'Menu'],
  ['/book', 'Book Tokens'],
  ['/tokens', 'My Tokens'],
  ['/dues', 'My Dues'],
  ['/feedback', 'Feedback']
]

const ADMIN_LINKS = [
  ['/admin', 'Console'],
  ['/menu', 'Menu']
]

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [theme, toggleTheme] = useTheme()
  const [open, setOpen] = useState(false)

  const links = !user ? GUEST_LINKS : user.role === 'admin' ? ADMIN_LINKS : STUDENT_LINKS
  const home = !user ? '/' : user.role === 'admin' ? '/admin' : '/dashboard'
  const close = () => setOpen(false)

  const handleLogout = () => {
    logout()
    close()
    navigate('/')
  }

  return (
    <header className="nav">
      <div className="nav-inner">
        <Link to={home} className="brand" onClick={close}>
          <Logo />
        </Link>
        <button className="icon-btn nav-toggle" onClick={() => setOpen(value => !value)} aria-label="Toggle menu">
          {open ? '✕' : '☰'}
        </button>
        <nav className={`nav-links${open ? ' open' : ''}`}>
          {links.map(([to, label]) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/' || to === '/admin'}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
              onClick={close}
            >
              {label}
            </NavLink>
          ))}
          <div className="nav-actions">
            <button className="icon-btn" onClick={toggleTheme} aria-label="Switch theme">
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            {user ? (
              <>
                <Link to="/profile" className="user-pill" onClick={close}>
                  <span className="avatar">{user.name.charAt(0).toUpperCase()}</span>
                  <span>{user.rollNo}</span>
                </Link>
                <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-ghost btn-sm" onClick={close}>
                  Login
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm" onClick={close}>
                  Sign up
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  )
}
