import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './b423065_App.jsx'
import { AuthProvider } from './b423065_AuthContext.jsx'
import { ToastProvider } from './b423065_Toast.jsx'
import './b423065_styles.css'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <ToastProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ToastProvider>
  </BrowserRouter>
)
