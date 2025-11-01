import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import App from './App'
import { store } from './store'
import { LanguageProvider, useLanguage } from './contexts/LanguageContext'
import { PermissionProvider } from './contexts/PermissionContext'
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

// Wrapper component to access LanguageContext for Toast positioning
const RootApp = () => {
  const { isRTL } = useLanguage()

  return (
    <>
      <App />
      <ToastContainer
        position={isRTL ? "top-left" : "top-right"}
        autoClose={3000}
        rtl={isRTL}
      />
    </>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <Provider store={store}>
        <PermissionProvider>
          <LanguageProvider>
            <QueryClientProvider client={queryClient}>
              <BrowserRouter>
                <RootApp />
              </BrowserRouter>
            </QueryClientProvider>
          </LanguageProvider>
        </PermissionProvider>
      </Provider>
    </ErrorBoundary>
  </React.StrictMode>,
)

// Service worker disabled to prevent caching issues during development
// To enable PWA functionality in production, uncomment the lines below:
// import * as serviceWorkerRegistration from './serviceWorkerRegistration'
// serviceWorkerRegistration.register()
// serviceWorkerRegistration.setupInstallPrompt()
