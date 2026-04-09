import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { SubjectsProvider } from './contexts/SubjectsContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SubjectsProvider>
      <App />
    </SubjectsProvider>
  </StrictMode>,
)
