import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import App from './App'
import { store } from './store'
import { LanguageProvider } from './contexts/LanguageContext'
import ErrorBoundary from './components/common/ErrorBoundary'
import './assets/styles/index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <Provider store={store}>
        <LanguageProvider>
          <QueryClientProvider client={queryClient}>
            <BrowserRouter>
              <App />
              <ToastContainer position="top-right" autoClose={3000} />
            </BrowserRouter>
          </QueryClientProvider>
        </LanguageProvider>
      </Provider>
    </ErrorBoundary>
  </React.StrictMode>,
)

// Service worker disabled to prevent caching issues during development
// To enable PWA functionality in production, uncomment the lines below:
// import * as serviceWorkerRegistration from './serviceWorkerRegistration'
// serviceWorkerRegistration.register()
// serviceWorkerRegistration.setupInstallPrompt()
