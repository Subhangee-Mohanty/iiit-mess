const TIME_ZONE = 'Asia/Kolkata'

export const MEALS = {
  breakfast: { label: 'Breakfast', start: '07:30', end: '09:30', startMin: 450 },
  lunch: { label: 'Lunch', start: '12:30', end: '14:30', startMin: 750 },
  dinner: { label: 'Dinner', start: '19:30', end: '21:30', startMin: 1170 }
}

export const MEAL_TYPES = Object.keys(MEALS)

export const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export const CUTOFF_MINUTES = 120

export const BOOKING_WINDOW_DAYS = 14

export function nowIST() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23'
  }).formatToParts(new Date())
  const get = type => parts.find(part => part.type === type).value
  return {
    dateKey: `${get('year')}-${get('month')}-${get('day')}`,
    minutes: (Number(get('hour')) % 24) * 60 + Number(get('minute'))
  }
}

export function isValidDateKey(key) {
  if (typeof key !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(key)) return false
  const date = new Date(`${key}T00:00:00Z`)
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === key
}

export function addDays(key, count) {
  const date = new Date(`${key}T00:00:00Z`)
  date.setUTCDate(date.getUTCDate() + count)
  return date.toISOString().slice(0, 10)
}

export function dayIndexOf(key) {
  return (new Date(`${key}T00:00:00Z`).getUTCDay() + 6) % 7
}

export function beforeCutoff(dateKey, mealType) {
  const now = nowIST()
  if (dateKey < now.dateKey) return false
  if (dateKey > now.dateKey) return true
  return now.minutes <= MEALS[mealType].startMin - CUTOFF_MINUTES
}

export function bookingStatus(dateKey, mealType) {
  const now = nowIST()
  if (dateKey < now.dateKey) return { open: false, reason: 'This date has already passed' }
  if (dateKey > addDays(now.dateKey, BOOKING_WINDOW_DAYS - 1)) {
    return { open: false, reason: `Booking opens only ${BOOKING_WINDOW_DAYS} days ahead` }
  }
  if (!beforeCutoff(dateKey, mealType)) return { open: false, reason: 'Booking is closed for this meal' }
  return { open: true, reason: '' }
}
