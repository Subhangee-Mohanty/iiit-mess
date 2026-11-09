import { useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useAuth } from './b423065_AuthContext.jsx'
import Navbar from './components/b423065_Navbar.jsx'
import { PageLoader } from './components/b423065_components.jsx'
import LandingPage from './pages/b423065_LandingPage.jsx'
import LoginPage from './pages/b423065_LoginPage.jsx'
import RegisterPage from './pages/b423065_RegisterPage.jsx'
import MenuPage from './pages/b423065_MenuPage.jsx'
import DashboardPage from './pages/b423065_DashboardPage.jsx'
import BookPage from './pages/b423065_BookPage.jsx'
import TokensPage from './pages/b423065_TokensPage.jsx'
import DuesPage from './pages/b423065_DuesPage.jsx'
import FeedbackPage from './pages/b423065_FeedbackPage.jsx'
import ProfilePage from './pages/b423065_ProfilePage.jsx'
import NotFoundPage from './pages/b423065_NotFoundPage.jsx'
import AdminLayout from './pages/admin/b423065_AdminLayout.jsx'
import AdminOverview from './pages/admin/b423065_AdminOverview.jsx'
import AdminTokens from './pages/admin/b423065_AdminTokens.jsx'
import AdminStudents from './pages/admin/b423065_AdminStudents.jsx'
import AdminMenu from './pages/admin/b423065_AdminMenu.jsx'
import AdminNotices from './pages/admin/b423065_AdminNotices.jsx'
import AdminFeedback from './pages/admin/b423065_AdminFeedback.jsx'

const homeFor = user => (user.role === 'admin' ? '/admin' : '/dashboard')

function Guard({ role, children }) {
  const { user, loading } = useAuth()
  const location = useLocation()
  if (loading) return <PageLoader label="Signing you in" />
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  if (role && user.role !== role) return <Navigate to={homeFor(user)} replace />
  return children
}

function GuestOnly({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <PageLoader label="Loading" />
  if (user) return <Navigate to={homeFor(user)} replace />
  return children
}

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname])
  return null
}

export default function App() {
  return (
    <div className="app">
      <ScrollToTop />
      <Navbar />
      <main className="main">
        <Routes>
          <Route
            path="/"
            element={
              <GuestOnly>
                <LandingPage />
              </GuestOnly>
            }
          />
          <Route
            path="/login"
            element={
              <GuestOnly>
                <LoginPage />
              </GuestOnly>
            }
          />
          <Route
            path="/register"
            element={
              <GuestOnly>
                <RegisterPage />
              </GuestOnly>
            }
          />
          <Route path="/menu" element={<MenuPage />} />

          <Route
            path="/dashboard"
            element={
              <Guard role="student">
                <DashboardPage />
              </Guard>
            }
          />
          <Route
            path="/book"
            element={
              <Guard role="student">
                <BookPage />
              </Guard>
            }
          />
          <Route
            path="/tokens"
            element={
              <Guard role="student">
                <TokensPage />
              </Guard>
            }
          />
          <Route
            path="/dues"
            element={
              <Guard role="student">
                <DuesPage />
              </Guard>
            }
          />
          <Route
            path="/feedback"
            element={
              <Guard role="student">
                <FeedbackPage />
              </Guard>
            }
          />
          <Route
            path="/profile"
            element={
              <Guard>
                <ProfilePage />
              </Guard>
            }
          />

          <Route
            path="/admin"
            element={
              <Guard role="admin">
                <AdminLayout />
              </Guard>
            }
          >
            <Route index element={<AdminOverview />} />
            <Route path="tokens" element={<AdminTokens />} />
            <Route path="students" element={<AdminStudents />} />
            <Route path="menu" element={<AdminMenu />} />
            <Route path="notices" element={<AdminNotices />} />
            <Route path="feedback" element={<AdminFeedback />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <footer className="footer">
        <p>IIIT Bhubaneswar · Mess Management System · Built with MongoDB, Express, React and Node.js</p>
      </footer>
    </div>
  )
}
