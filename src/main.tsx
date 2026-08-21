import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './css/styles.css'
import 'sileo/styles.css'
import App from './app/App.tsx'
import { ThemeProvider, useTheme } from './context/ThemeContext'
import { Toaster } from "sileo"


function ThemedToaster() {
  const { isDarkMode } = useTheme()

  return (
    <Toaster
      position="top-center"
      theme={isDarkMode ? 'dark' : 'light'}
      options={{
        fill: isDarkMode ? '#ffffff' : '#111e23',
        styles: {
          title: isDarkMode ? 'text-slate-900!' : 'text-white!',
          description: isDarkMode ? 'text-slate-600!' : 'text-white/75!',
        },
      }}
    />
  )
}

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