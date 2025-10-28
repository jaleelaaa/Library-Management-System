/**
 * WebSocket Service
 * Real-time communication using Socket.IO
 */

import { io, Socket } from 'socket.io-client'
import { toast } from 'react-toastify'

export interface Notification {
  id: string
  user_id: string
  type: string
  title: string
  message: string
  metadata: Record<string, any>
  is_read: boolean
  read_at: string | null
  entity_type: string | null
  entity_id: string | null
  priority: string
  expires_at: string | null
  created_date: string
  updated_date: string
}

type NotificationCallback = (notification: Notification) => void
type SystemMessageCallback = (message: any) => void
type RealTimeUpdateCallback = (update: any) => void

class WebSocketService {
  private socket: Socket | null = null
  private notificationCallbacks: NotificationCallback[] = []
  private systemMessageCallbacks: SystemMessageCallback[] = []
  private realTimeUpdateCallbacks: Map<string, RealTimeUpdateCallback[]> = new Map()
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5

  /**
   * Connect to WebSocket server
   */
  connect(token: string, userId: string, tenantId: string): void {
    if (this.socket?.connected) {
      console.log('WebSocket already connected')
      return
    }

    const wsUrl = import.meta.env.VITE_WS_URL || 'http://localhost:8000/ws'

    this.socket = io(wsUrl, {
      auth: {
        token,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: this.maxReconnectAttempts,
    })

    this.setupEventHandlers(userId, tenantId)
  }

  /**
   * Setup Socket.IO event handlers
   */
  private setupEventHandlers(userId: string, tenantId: string): void {
    if (!this.socket) return

    // Connection events
    this.socket.on('connect', () => {
      console.log('WebSocket connected')
      this.reconnectAttempts = 0

      // Authenticate after connection
      this.socket?.emit('authenticate', {
        user_id: userId,
        tenant_id: tenantId,
      })

      toast.success('Real-time connection established', { autoClose: 2000 })
    })

    this.socket.on('authenticated', (data) => {
      console.log('WebSocket authenticated:', data)
    })

    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason)
      toast.warning('Real-time connection lost', { autoClose: 3000 })
    })

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error)
      this.reconnectAttempts++

      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        toast.error('Failed to establish real-time connection', { autoClose: 5000 })
      }
    })

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('WebSocket reconnected after', attemptNumber, 'attempts')
      this.reconnectAttempts = 0
      toast.success('Real-time connection restored', { autoClose: 2000 })
    })

    // Notification event
    this.socket.on('notification', (notification: Notification) => {
      console.log('Received notification:', notification)

      // Call all registered callbacks
      this.notificationCallbacks.forEach((callback) => {
        try {
          callback(notification)
        } catch (error) {
          console.error('Error in notification callback:', error)
        }
      })

      // Show toast notification
      const toastOptions = {
        autoClose: 5000,
      }

      switch (notification.type) {
        case 'success':
          toast.success(notification.message, toastOptions)
          break
        case 'warning':
          toast.warning(notification.message, toastOptions)
          break
        case 'error':
          toast.error(notification.message, toastOptions)
          break
        default:
          toast.info(notification.message, toastOptions)
      }
    })

    // System message event
    this.socket.on('system_message', (message: any) => {
      console.log('Received system message:', message)

      this.systemMessageCallbacks.forEach((callback) => {
        try {
          callback(message)
        } catch (error) {
          console.error('Error in system message callback:', error)
        }
      })

      // Show toast for system messages
      const toastMessage = message.message || 'System notification'
      switch (message.level) {
        case 'warning':
          toast.warning(toastMessage, { autoClose: 10000 })
          break
        case 'error':
          toast.error(toastMessage, { autoClose: 10000 })
          break
        default:
          toast.info(toastMessage, { autoClose: 5000 })
      }
    })

    // Real-time update event
    this.socket.on('realtime_update', (update: any) => {
      console.log('Received real-time update:', update)

      const callbacks = this.realTimeUpdateCallbacks.get(update.type) || []
      callbacks.forEach((callback) => {
        try {
          callback(update.data)
        } catch (error) {
          console.error('Error in real-time update callback:', error)
        }
      })
    })

    // Subscription events
    this.socket.on('subscribed', (data) => {
      console.log('Subscribed to channel:', data.channel)
    })

    this.socket.on('unsubscribed', (data) => {
      console.log('Unsubscribed from channel:', data.channel)
    })

    // Error event
    this.socket.on('error', (error) => {
      console.error('WebSocket error:', error)
      toast.error(error.message || 'WebSocket error occurred', { autoClose: 5000 })
    })
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      console.log('WebSocket disconnected manually')
    }
  }

  /**
   * Subscribe to a channel
   */
  subscribe(channel: string): void {
    if (this.socket?.connected) {
      this.socket.emit('subscribe', { channel })
    }
  }

  /**
   * Unsubscribe from a channel
   */
  unsubscribe(channel: string): void {
    if (this.socket?.connected) {
      this.socket.emit('unsubscribe', { channel })
    }
  }

  /**
   * Register a notification callback
   */
  onNotification(callback: NotificationCallback): () => void {
    this.notificationCallbacks.push(callback)

    // Return unsubscribe function
    return () => {
      const index = this.notificationCallbacks.indexOf(callback)
      if (index > -1) {
        this.notificationCallbacks.splice(index, 1)
      }
    }
  }

  /**
   * Register a system message callback
   */
  onSystemMessage(callback: SystemMessageCallback): () => void {
    this.systemMessageCallbacks.push(callback)

    return () => {
      const index = this.systemMessageCallbacks.indexOf(callback)
      if (index > -1) {
        this.systemMessageCallbacks.splice(index, 1)
      }
    }
  }

  /**
   * Register a real-time update callback
   */
  onRealTimeUpdate(eventType: string, callback: RealTimeUpdateCallback): () => void {
    if (!this.realTimeUpdateCallbacks.has(eventType)) {
      this.realTimeUpdateCallbacks.set(eventType, [])
    }

    this.realTimeUpdateCallbacks.get(eventType)!.push(callback)

    return () => {
      const callbacks = this.realTimeUpdateCallbacks.get(eventType)
      if (callbacks) {
        const index = callbacks.indexOf(callback)
        if (index > -1) {
          callbacks.splice(index, 1)
        }
      }
    }
  }

  /**
   * Check if WebSocket is connected
   */
  isConnected(): boolean {
    return this.socket?.connected || false
  }

  /**
   * Mark notification as read
   */
  markNotificationAsRead(notificationId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('mark_notification_read', { notification_id: notificationId })
    }
  }
}

// Singleton instance
const websocketService = new WebSocketService()

export default websocketService
