export const MEAL_ORDER = ['breakfast', 'lunch', 'dinner']

export const MEAL_META = {
  breakfast: { label: 'Breakfast', icon: '🌅', time: '7:30 – 9:30 AM' },
  lunch: { label: 'Lunch', icon: '🍛', time: '12:30 – 2:30 PM' },
  dinner: { label: 'Dinner', icon: '🌙', time: '7:30 – 9:30 PM' }
}

export const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export const SHORT_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export const HOSTELS = ['Boys Hostel 1', 'Boys Hostel 2', 'Boys Hostel 3', 'Girls Hostel 1', 'Girls Hostel 2', 'Other']

export function money(value) {
  const number = Number(value || 0)
  const sign = number < 0 ? '-' : ''
  return `${sign}₹${Math.abs(number).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`
}

export function addDays(key, count) {
  const date = new Date(`${key}T00:00:00Z`)
  date.setUTCDate(date.getUTCDate() + count)
  return date.toISOString().slice(0, 10)
}

export function dayIndexOf(key) {
  return (new Date(`${key}T00:00:00Z`).getUTCDay() + 6) % 7
}

export function weekStart(todayKey, offset) {
  return addDays(todayKey, -dayIndexOf(todayKey) + offset * 7)
}

export function formatDay(key) {
  return new Date(`${key}T00:00:00Z`).toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC'
  })
}

export function formatLong(key) {
  return new Date(`${key}T00:00:00Z`).toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC'
  })
}

export function formatDateTime(iso) {
  return new Date(iso).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'Asia/Kolkata'
  })
}

export function prettyDescription(text) {
  return String(text || '').replace(/\d{4}-\d{2}-\d{2}/g, match => formatDay(match))
}

export function cancellable(meta, dateKey, mealType) {
  if (!meta) return false
  if (dateKey < meta.today) return false
  if (dateKey > meta.today) return true
  return meta.minutes <= meta.meals[mealType].startMin - meta.cutoffMinutes
}

export function slotState(meta, dateKey, mealType) {
  if (!meta) return { open: false, reason: 'Loading' }
  if (dateKey < meta.today) return { open: false, reason: 'Date passed' }
  if (dateKey > addDays(meta.today, meta.windowDays - 1)) return { open: false, reason: 'Not open yet' }
  if (!cancellable(meta, dateKey, mealType)) return { open: false, reason: 'Booking closed' }
  return { open: true, reason: '' }
}
