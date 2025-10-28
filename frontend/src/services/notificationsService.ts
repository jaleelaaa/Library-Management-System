/**
 * Notifications Service
 * API calls for notification management
 */

import api from './api'
import { Notification } from './websocketService'

const notificationsService = {
  /**
   * Get user notifications
   */
  getNotifications: async (params?: {
    skip?: number
    limit?: number
    unread_only?: boolean
    notification_type?: string
  }): Promise<{ data: Notification[] }> => {
    const response = await api.get<Notification[]>('/notifications/', { params })
    return response
  },

  /**
   * Get unread notification count
   */
  getUnreadCount: async (): Promise<{ unread_count: number }> => {
    const response = await api.get<{ unread_count: number }>('/notifications/count')
    return response.data
  },

  /**
   * Mark notification as read
   */
  markAsRead: async (notificationId: string): Promise<Notification> => {
    const response = await api.put<Notification>(`/notifications/${notificationId}/mark-read`)
    return response.data
  },

  /**
   * Mark all notifications as read
   */
  markAllAsRead: async (): Promise<{ message: string }> => {
    const response = await api.put<{ message: string }>('/notifications/mark-all-read')
    return response.data
  },

  /**
   * Delete notification
   */
  deleteNotification: async (notificationId: string): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>(`/notifications/${notificationId}`)
    return response.data
  },

  /**
   * Delete all read notifications
   */
  deleteAllRead: async (): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>('/notifications/')
    return response.data
  },
}

export default notificationsService
