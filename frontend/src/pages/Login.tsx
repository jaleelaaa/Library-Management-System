import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { toast } from 'react-toastify'
import { motion } from 'framer-motion'
import { setCredentials } from '@/store/slices/authSlice'
import { authService } from '@/services/authService'
import { useLanguage } from '@/contexts/LanguageContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import LanguageSwitcher from '@/components/common/LanguageSwitcher'
import { BookOpen, Loader2, Lock, User, Info } from 'lucide-react'

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

      toast.success(t('login.success'))
      navigate('/dashboard')
    } catch (error: any) {
      toast.error(error.response?.data?.detail || t('login.error.failed'))
      // Clean up on error
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <motion.div
        className="absolute inset-0 opacity-30"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ duration: 2 }}
      >
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl animate-blob" />
        <div className="absolute top-40 right-20 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-40 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000" />
      </motion.div>

      {/* Language Switcher - Top Right */}
      <div className={`absolute top-6 ${isRTL ? 'left-6' : 'right-6'} z-10`}>
        <LanguageSwitcher />
      </div>

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md px-4 z-10"
      >
        <Card className="shadow-2xl border-0 backdrop-blur-sm bg-white/95">
          <CardHeader className="space-y-3 text-center pb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg"
            >
              <BookOpen className="w-8 h-8 text-white" />
            </motion.div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {t('login.title')}
            </CardTitle>
            <CardDescription className="text-base">
              {t('login.subtitle')}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {t('login.username')}
                </Label>
                <Input
                  id="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={t('login.username')}
                  className="h-11 transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  {t('login.password')}
                </Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('login.password')}
                  className="h-11 transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="ms-2">{t('login.signingIn')}</span>
                  </>
                ) : (
                  t('login.signIn')
                )}
              </Button>

              <Alert className="bg-blue-50/80 border-blue-200">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-sm">
                  <p className="font-semibold text-blue-900 mb-2">
                    {t('login.defaultCreds')}
                  </p>
                  <div className="space-y-1 text-blue-800">
                    <p><strong>{t('login.admin')}:</strong> admin / Admin@123</p>
                    <p><strong>{t('login.patron')}:</strong> patron / Patron@123</p>
                  </div>
                </AlertDescription>
              </Alert>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-6 text-sm text-gray-600"
        >
          FOLIO Library Management System
        </motion.p>
      </motion.div>
    </div>
  )
}

export default Login
