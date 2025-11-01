import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { FiMenu, FiUser, FiLogOut } from 'react-icons/fi'
import { RootState } from '@/store'
import { logout } from '@/store/slices/authSlice'
import NotificationBell from './NotificationBell'
import LanguageSwitcher from '../common/LanguageSwitcher'
import websocketService from '../../services/websocketService'

const Header = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user, token } = useSelector((state: RootState) => state.auth)
  const [showUserMenu, setShowUserMenu] = useState(false)

  // Initialize WebSocket connection when user is authenticated
  useEffect(() => {
    if (token && user) {
      const tenantId = localStorage.getItem('tenant_id') || 'default-tenant'
      websocketService.connect(token, user.id, tenantId)

      // Cleanup on unmount
      return () => {
        websocketService.disconnect()
      }
    }
  }, [token, user])

  const handleLogout = () => {
    // Disconnect WebSocket before logout
    websocketService.disconnect()
    dispatch(logout())
    navigate('/login')
  }

  return (
    <header className="folio-header h-14 flex items-center justify-between px-4">
      <div className="flex items-center space-x-4">
        <button className="text-white hover:bg-folio-primary/80 p-2 rounded">
          <FiMenu size={20} />
        </button>
        <h1 className="text-xl font-bold">FOLIO LMS</h1>
      </div>

      <div className="flex items-center space-x-4">
        {/* Language Switcher */}
        <LanguageSwitcher />

        {/* Notifications */}
        <div className="text-white">
          <NotificationBell />
        </div>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center space-x-2 text-white hover:bg-folio-primary/80 px-3 py-2 rounded"
          >
            <FiUser size={20} />
            <span className="text-sm">{user?.username || 'User'}</span>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <FiLogOut className="me-2" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
