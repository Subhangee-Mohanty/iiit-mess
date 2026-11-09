import { NavLink, Outlet } from 'react-router-dom'
import { PageHead } from '../../components/b423065_components.jsx'

const TABS = [
  ['/admin', 'Overview', true],
  ['/admin/tokens', 'Counter'],
  ['/admin/students', 'Students & Dues'],
  ['/admin/menu', 'Menu'],
  ['/admin/notices', 'Notices'],
  ['/admin/feedback', 'Feedback']
]

export default function AdminLayout() {
  return (
    <div className="container page">
      <PageHead title="Admin Console" subtitle="Run the mess: tokens, dues, menu and notices." />
      <div className="tabs scroll-x">
        {TABS.map(([to, label, end]) => (
          <NavLink key={to} to={to} end={Boolean(end)} className={({ isActive }) => `tab${isActive ? ' active' : ''}`}>
            {label}
          </NavLink>
        ))}
      </div>
      <Outlet />
    </div>
  )
}
