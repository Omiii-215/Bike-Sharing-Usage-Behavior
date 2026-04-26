import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// ==============================================================================
// ENTRY POINT: main.jsx
// Purpose: This is the standard entry point for the React application. 
// It takes the root App component (App.jsx) and renders it into the 
// HTML DOM structure (specifically inside the element with id 'root').
// ==============================================================================

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
