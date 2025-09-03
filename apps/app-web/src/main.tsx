import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

import { Sentry } from './sentry.client'
import { App } from './App'

const rootEl = document.getElementById('root')!
createRoot(rootEl).render(
  <React.StrictMode>
    <BrowserRouter>
      <Sentry.ErrorBoundary fallback={<p>Algo deu errado.</p>}>
        <App />
      </Sentry.ErrorBoundary>
    </BrowserRouter>
  </React.StrictMode>
)
