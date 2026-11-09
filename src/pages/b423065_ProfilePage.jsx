import { useState } from 'react'
import { api } from '../b423065_api.js'
import { useAuth } from '../b423065_AuthContext.jsx'
import { useToast } from '../b423065_Toast.jsx'
import { HOSTELS } from '../b423065_format.js'
import { PageHead, Spinner } from '../components/b423065_components.jsx'

export default function ProfilePage() {
  const { user, setUser } = useAuth()
  const toast = useToast()
  const [profile, setProfile] = useState({
    name: user.name,
    phone: user.phone || '',
    hostel: user.hostel || HOSTELS[0],
    room: user.room || ''
  })
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirm: '' })
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)

  const updateProfile = field => event => setProfile(current => ({ ...current, [field]: event.target.value }))
  const updatePassword = field => event => setPasswords(current => ({ ...current, [field]: event.target.value }))

  async function saveProfile(event) {
    event.preventDefault()
    setSavingProfile(true)
    try {
      const data = await api.put('/auth/profile', profile)
      setUser(data.user)
      toast('Profile updated')
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setSavingProfile(false)
    }
  }

  async function savePassword(event) {
    event.preventDefault()
    if (passwords.newPassword !== passwords.confirm) {
      toast('New passwords do not match', 'error')
      return
    }
    setSavingPassword(true)
    try {
      await api.put('/auth/password', {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword
      })
      setPasswords({ currentPassword: '', newPassword: '', confirm: '' })
      toast('Password changed')
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setSavingPassword(false)
    }
  }

  return (
    <div className="container page">
      <PageHead title="My Profile" subtitle="Keep your details up to date." />

      <div className="profile-banner card">
        <span className="avatar xl">{user.name.charAt(0).toUpperCase()}</span>
        <div>
          <h2>{user.name}</h2>
          <p className="muted">
            {user.rollNo} · {user.email}
          </p>
          <span className="chip chip-info">{user.role === 'admin' ? 'Administrator' : 'Student'}</span>
        </div>
      </div>

      <div className="grid grid-2">
        <form className="card card-pad form-stack" onSubmit={saveProfile}>
          <h3>Personal details</h3>
          <label className="field">
            <span>Full name</span>
            <input className="input" value={profile.name} onChange={updateProfile('name')} required />
          </label>
          <label className="field">
            <span>Phone</span>
            <input className="input" value={profile.phone} onChange={updateProfile('phone')} />
          </label>
          <div className="form-grid">
            <label className="field">
              <span>Hostel</span>
              <select className="input" value={profile.hostel} onChange={updateProfile('hostel')}>
                {HOSTELS.concat(profile.hostel && !HOSTELS.includes(profile.hostel) ? [profile.hostel] : []).map(hostel => (
                  <option key={hostel}>{hostel}</option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Room</span>
              <input className="input" value={profile.room} onChange={updateProfile('room')} />
            </label>
          </div>
          <button className="btn btn-primary" disabled={savingProfile}>
            {savingProfile ? <Spinner size={18} /> : 'Save changes'}
          </button>
        </form>

        <form className="card card-pad form-stack" onSubmit={savePassword}>
          <h3>Change password</h3>
          <label className="field">
            <span>Current password</span>
            <input
              className="input"
              type="password"
              value={passwords.currentPassword}
              onChange={updatePassword('currentPassword')}
              autoComplete="current-password"
              required
            />
          </label>
          <label className="field">
            <span>New password</span>
            <input
              className="input"
              type="password"
              value={passwords.newPassword}
              onChange={updatePassword('newPassword')}
              autoComplete="new-password"
              required
            />
          </label>
          <label className="field">
            <span>Confirm new password</span>
            <input
              className="input"
              type="password"
              value={passwords.confirm}
              onChange={updatePassword('confirm')}
              autoComplete="new-password"
              required
            />
          </label>
          <button className="btn btn-primary" disabled={savingPassword}>
            {savingPassword ? <Spinner size={18} /> : 'Update password'}
          </button>
        </form>
      </div>
    </div>
  )
}
