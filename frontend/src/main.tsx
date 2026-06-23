import React from 'react'
import ReactDOM from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import { Toaster } from 'react-hot-toast'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HelmetProvider>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#2d3561',
            color: '#fff',
            border: '2px solid #7ec8a3',
            fontWeight: 600,
          },
          success: {
            iconTheme: { primary: '#7ec8a3', secondary: '#2d3561' },
          },
          error: {
            iconTheme: { primary: '#ff5555', secondary: '#fff' },
          },
        }}
      />
    </HelmetProvider>
  </React.StrictMode>,
)