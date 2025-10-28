/**
 * Notifications Redux Slice
 * State management for real-time notifications
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import notificationsService from '../../services/notificationsService'
import { Notification } from '../../services/websocketService'

// ============================================================================
// STATE INTERFACE
// ============================================================================

interface NotificationsState {
  notifications: Notification[]
  unreadCount: number
  loading: boolean
  error: string | null
  showDropdown: boolean
}

const initialState: NotificationsState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
  showDropdown: false,
}

// ============================================================================
// ASYNC THUNKS
// ============================================================================

/**
 * Fetch notifications
 */
export const fetchNotifications = createAsyncThunk(
  'notifications/fetch',
  async (params?: { skip?: number; limit?: number; unread_only?: boolean }, { rejectWithValue }) => {
    try {
      const response = await notificationsService.getNotifications(params)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch notifications')
    }
  }
)

/**
 * Fetch unread count
 */
export const fetchUnreadCount = createAsyncThunk(
  'notifications/fetchUnreadCount',
  async (_, { rejectWithValue }) => {
    try {
      const response = await notificationsService.getUnreadCount()
      return response.unread_count
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch unread count')
    }
  }
)

/**
 * Mark notification as read
 */
export const markNotificationAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (notificationId: string, { rejectWithValue }) => {
    try {
      const response = await notificationsService.markAsRead(notificationId)
      return response
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to mark notification as read')
    }
  }
)

/**
 * Mark all notifications as read
 */
export const markAllNotificationsAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async (_, { rejectWithValue }) => {
    try {
      await notificationsService.markAllAsRead()
      return true
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to mark all as read')
    }
  }
)

/**
 * Delete notification
 */
export const deleteNotification = createAsyncThunk(
  'notifications/delete',
  async (notificationId: string, { rejectWithValue }) => {
    try {
      await notificationsService.deleteNotification(notificationId)
      return notificationId
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to delete notification')
    }
  }
)

/**
 * Delete all read notifications
 */
export const deleteAllReadNotifications = createAsyncThunk(
  'notifications/deleteAllRead',
  async (_, { rejectWithValue }) => {
    try {
      await notificationsService.deleteAllRead()
      return true
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to delete notifications')
    }
  }
)

// ============================================================================
// SLICE
// ============================================================================

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    // Add new notification (from WebSocket)
    addNotification: (state, action: PayloadAction<Notification>) => {
      // Add to beginning of list
      state.notifications.unshift(action.payload)

      // Update unread count if notification is unread
      if (!action.payload.is_read) {
        state.unreadCount += 1
      }
    },

    // Update notification
    updateNotification: (state, action: PayloadAction<Notification>) => {
      const index = state.notifications.findIndex((n) => n.id === action.payload.id)
      if (index !== -1) {
        const wasUnread = !state.notifications[index].is_read
        const isNowRead = action.payload.is_read

        state.notifications[index] = action.payload

        // Update unread count
        if (wasUnread && isNowRead) {
          state.unreadCount = Math.max(0, state.unreadCount - 1)
        }
      }
    },

    // Remove notification
    removeNotification: (state, action: PayloadAction<string>) => {
      const index = state.notifications.findIndex((n) => n.id === action.payload)
      if (index !== -1) {
        const wasUnread = !state.notifications[index].is_read
        state.notifications.splice(index, 1)

        if (wasUnread) {
          state.unreadCount = Math.max(0, state.unreadCount - 1)
        }
      }
    },

    // Toggle dropdown
    toggleDropdown: (state) => {
      state.showDropdown = !state.showDropdown
    },

    // Set dropdown state
    setDropdownOpen: (state, action: PayloadAction<boolean>) => {
      state.showDropdown = action.payload
    },

    // Clear error
    clearError: (state) => {
      state.error = null
    },

    // Reset state
    resetNotifications: (state) => {
      state.notifications = []
      state.unreadCount = 0
      state.error = null
      state.showDropdown = false
    },
  },
  extraReducers: (builder) => {
    // Fetch Notifications
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false
        state.notifications = action.payload
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // Fetch Unread Count
    builder
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload
      })

    // Mark As Read
    builder
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        const index = state.notifications.findIndex((n) => n.id === action.payload.id)
        if (index !== -1) {
          const wasUnread = !state.notifications[index].is_read
          state.notifications[index] = action.payload

          if (wasUnread) {
            state.unreadCount = Math.max(0, state.unreadCount - 1)
          }
        }
      })

    // Mark All As Read
    builder
      .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
        state.notifications.forEach((notification) => {
          notification.is_read = true
          notification.read_at = new Date().toISOString()
        })
        state.unreadCount = 0
      })

    // Delete Notification
    builder
      .addCase(deleteNotification.fulfilled, (state, action) => {
        const index = state.notifications.findIndex((n) => n.id === action.payload)
        if (index !== -1) {
          const wasUnread = !state.notifications[index].is_read
          state.notifications.splice(index, 1)

          if (wasUnread) {
            state.unreadCount = Math.max(0, state.unreadCount - 1)
          }
        }
      })

    // Delete All Read
    builder
      .addCase(deleteAllReadNotifications.fulfilled, (state) => {
        state.notifications = state.notifications.filter((n) => !n.is_read)
      })
  },
})

export const {
  addNotification,
  updateNotification,
  removeNotification,
  toggleDropdown,
  setDropdownOpen,
  clearError,
  resetNotifications,
} = notificationsSlice.actions

export default notificationsSlice.reducer
