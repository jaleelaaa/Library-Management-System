import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { toast } from 'react-toastify'
import { setCredentials } from '@/store/slices/authSlice'
import { authService } from '@/services/authService'
import { useLanguage } from '@/contexts/LanguageContext'
import LanguageSwitcher from '@/components/common/LanguageSwitcher'

const Login = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { t, isRTL } = useLanguage()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Step 1: Login and get tokens
      const response = await authService.login({ username, password })

      // Step 2: Store token in localStorage so API calls work
      localStorage.setItem('token', response.access_token)
      localStorage.setItem('refreshToken', response.refresh_token)

      // Step 3: Fetch complete user profile
      const userProfile = await authService.getUserProfile()

      // Step 4: Store user and token in Redux
      dispatch(setCredentials({
        user: userProfile,
        token: response.access_token
      }))

      toast.success('Login successful!')
      navigate('/dashboard')
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Login failed')
      // Clean up on error
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 relative">
      {/* Language Switcher - Top Right */}
      <div className={`absolute top-6 ${isRTL ? 'left-6' : 'right-6'} z-10`}>
        <LanguageSwitcher />
      </div>

      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-2xl" dir={isRTL ? 'rtl' : 'ltr'}>
        <div>
          <h2 className="text-center text-3xl font-bold text-gray-900">
            {t('login.title')}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {t('login.subtitle')}
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 text-start">
                {t('login.username')}
              </label>
              <input
                id="username"
                type="text"
                required
                className="folio-input mt-1 text-start"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={t('login.username')}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 text-start">
                {t('login.password')}
              </label>
              <input
                id="password"
                type="password"
                required
                className="folio-input mt-1 text-start"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('login.password')}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="folio-button-primary w-full"
          >
            {loading ? t('login.signingIn') : t('login.signIn')}
          </button>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm font-semibold text-blue-900 mb-2 text-start">
              {t('login.defaultCreds')}
            </p>
            <div className="space-y-1 text-sm text-blue-800 text-start">
              <p><strong>{t('login.admin')}:</strong> admin / Admin@123</p>
              <p><strong>{t('login.patron')}:</strong> patron / Patron@123</p>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login
