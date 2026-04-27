import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import axios from 'axios'

// Global Axios Config for Security (CSRF & Cookies)
// baseURL is handled by vite.config.js proxy for /api during dev
axios.defaults.withCredentials = true;
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Fetch CSRF Token on app initialization
const initCSRF = async () => {
  try {
    const res = await axios.get('/api/csrf-token')
    axios.defaults.headers.common['x-csrf-token'] = res.data.csrfToken;
    console.log("🛡️ HECTATE: Security Handshake Complete.")
  } catch (err) {
    console.error('🛡️ HECTATE: Security Handshake Failed (CSRF). Admin panel might be limited.', err.message)
  }
}
initCSRF()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
