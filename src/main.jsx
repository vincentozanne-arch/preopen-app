import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import PreOpenApp from './PreOpenApp.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <PreOpenApp />
  </StrictMode>,
)
