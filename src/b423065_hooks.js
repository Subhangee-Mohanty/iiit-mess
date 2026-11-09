import { useCallback, useEffect, useState } from 'react'
import { api } from './b423065_api.js'

export function useFetch(path, enabled = true) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(Boolean(enabled && path))
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    if (!enabled || !path) return
    setLoading(true)
    try {
      setData(await api.get(path))
      setError('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [path, enabled])

  useEffect(() => {
    load()
  }, [load])

  return { data, loading, error, reload: load, setData }
}

export function useCountUp(target, duration = 900) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    let frame
    const start = performance.now()
    const tick = now => {
      const progress = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(target * eased))
      if (progress < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [target, duration])

  return value
}

export function useTheme() {
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('mess_theme') || 'light'
    } catch {
      return 'light'
    }
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    try {
      localStorage.setItem('mess_theme', theme)
    } catch {
      return
    }
  }, [theme])

  const toggle = useCallback(() => setTheme(current => (current === 'light' ? 'dark' : 'light')), [])
  return [theme, toggle]
}
