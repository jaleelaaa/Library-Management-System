/**
 * Notification Bell Component
 * Displays real-time notifications with dropdown
 */

import { useEffect, useRef } from 'react'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import {
  fetchNotifications,
  fetchUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  toggleDropdown,
  setDropdownOpen,
  addNotification,
} from '../../store/slices/notificationsSlice'
import websocketService from '../../services/websocketService'
import { FiBell, FiCheck, FiTrash2, FiCheckCircle } from 'react-icons/fi'
import { formatDistanceToNow } from 'date-fns'

const NotificationBell = () => {
  const dispatch = useAppDispatch()
  const { notifications, unreadCount, showDropdown, loading } = useAppSelector(
    (state) => state.notifications
  )
  const { user } = useAppSelector((state) => state.auth)

  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Fetch initial notifications and count
    dispatch(fetchNotifications({ limit: 20 }))
    dispatch(fetchUnreadCount())

    // Setup WebSocket listener
    const unsubscribe = websocketService.onNotification((notification) => {
      dispatch(addNotification(notification))
    })

    // Cleanup
    return () => {
      unsubscribe()
    }
  }, [dispatch])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        dispatch(setDropdownOpen(false))
      }
    }

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showDropdown, dispatch])

  const handleMarkAsRead = async (notificationId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    await dispatch(markNotificationAsRead(notificationId))
  }

  const handleMarkAllAsRead = async () => {
    await dispatch(markAllNotificationsAsRead())
    dispatch(fetchUnreadCount())
  }

  const handleDelete = async (notificationId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    await dispatch(deleteNotification(notificationId))
    dispatch(fetchUnreadCount())
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
      case 'checkout':
      case 'checkin':
        return '✓'
      case 'warning':
      case 'overdue':
        return '⚠'
      case 'error':
        return '✕'
      case 'hold_available':
        return '📚'
      default:
        return 'ℹ'
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success':
      case 'checkout':
      case 'checkin':
        return 'text-green-600 bg-green-50'
      case 'warning':
      case 'overdue':
        return 'text-yellow-600 bg-yellow-50'
      case 'error':
        return 'text-red-600 bg-red-50'
      case 'hold_available':
        return 'text-blue-600 bg-blue-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon */}
      <button
        onClick={() => dispatch(toggleDropdown())}
        className="relative p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
      >
        <FiBell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full min-w-[20px]">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-[600px] flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50 rounded-t-lg">
            <h3 className="font-semibold text-gray-800">
              Notifications {unreadCount > 0 && `(${unreadCount})`}
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <FiCheckCircle size={14} />
                Mark all read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto flex-1">
            {loading ? (
              <div className="p-8 text-center text-gray-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-sm">Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <FiBell size={48} className="mx-auto mb-4 text-gray-300" />
                <p className="text-sm">No notifications</p>
                <p className="text-xs mt-1">You're all caught up!</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 transition-colors ${
                      !notification.is_read ? 'bg-blue-50/50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Icon */}
                      <div
                        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm ${getNotificationColor(
                          notification.type
                        )}`}
                      >
                        {getNotificationIcon(notification.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 mb-1">
                          {notification.title}
                        </p>
                        <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                        <p className="text-xs text-gray-400">
                          {formatDistanceToNow(new Date(notification.created_date), {
                            addSuffix: true,
                          })}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex-shrink-0 flex items-center gap-1">
                        {!notification.is_read && (
                          <button
                            onClick={(e) => handleMarkAsRead(notification.id, e)}
                            className="p-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded"
                            title="Mark as read"
                          >
                            <FiCheck size={16} />
                          </button>
                        )}
                        <button
                          onClick={(e) => handleDelete(notification.id, e)}
                          className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                          title="Delete"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 bg-gray-50 rounded-b-lg">
              <button
                onClick={() => {
                  dispatch(setDropdownOpen(false))
                  // Navigate to notifications page if it exists
                }}
                className="w-full text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default NotificationBell
