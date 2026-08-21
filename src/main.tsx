import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './css/styles.css'
import 'sileo/styles.css'
import App from './app/App.tsx'
import { ThemeProvider } from './context/ThemeContext'
import ThemedToaster from './components/common/toast/toaster.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <ThemedToaster />
        <App />
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
)