import { createContext, useCallback, useContext, useState } from 'react'

const ToastContext = createContext(() => {})

export function ToastProvider({ children }) {
  const [items, setItems] = useState([])

  const toast = useCallback((message, type = 'success') => {
    const id = `${Date.now()}-${Math.random()}`
    setItems(list => [...list, { id, message, type }])
    setTimeout(() => setItems(list => list.filter(item => item.id !== id)), 3800)
  }, [])

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="toast-stack" aria-live="polite">
        {items.map(item => (
          <div key={item.id} className={`toast toast-${item.type}`}>
            <span>{item.type === 'error' ? '⚠️' : '✅'}</span>
            <p>{item.message}</p>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
