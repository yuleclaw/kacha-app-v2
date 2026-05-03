import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/variables.css'
import './styles/global.css'

// Initialize Capacitor plugins (safe in browser)
try {
  const { Capacitor } = require('@capacitor/core')
  if (Capacitor.isNativePlatform()) {
    require('@capacitor/status-bar')
  }
} catch {}

const root = ReactDOM.createRoot(document.getElementById('root')!)
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
