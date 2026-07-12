import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { WalletProvider } from './contexts/WalletContext'
import { FeedbackProvider } from './contexts/FeedbackContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { DesktopFrame } from './components/DesktopFrame'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <WalletProvider>
          <DesktopFrame>
            <FeedbackProvider>
              <App />
            </FeedbackProvider>
          </DesktopFrame>
        </WalletProvider>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>,
)
