"""
WebSocket Service
Real-time communication using Socket.IO
"""

import socketio
import logging
from typing import Dict, Set, Optional, Any
from uuid import UUID

logger = logging.getLogger(__name__)


class WebSocketService:
    """WebSocket service for real-time notifications"""

    def __init__(self):
        """Initialize Socket.IO server"""
        self.sio = socketio.AsyncServer(
            async_mode='asgi',
            cors_allowed_origins='*',
            logger=True,
            engineio_logger=True
        )

        # Track connected users: {user_id: set(session_ids)}
        self.user_sessions: Dict[str, Set[str]] = {}

        # Track session metadata: {session_id: {"user_id": str, "tenant_id": str}}
        self.session_metadata: Dict[str, Dict[str, str]] = {}

        # Setup event handlers
        self._setup_handlers()

    def _setup_handlers(self):
        """Setup Socket.IO event handlers"""

        @self.sio.event
        async def connect(sid, environ, auth):
            """Handle client connection"""
            logger.info(f"Client connecting: {sid}")
            logger.info(f"Auth data: {auth}")

            # Allow connection initially
            # Authentication will be verified in the 'authenticate' event
            logger.info(f"Client {sid} connected successfully (pending authentication)")
            return True

        @self.sio.event
        async def disconnect(sid):
            """Handle client disconnection"""
            logger.info(f"Client disconnected: {sid}")

            # Remove session from tracking
            if sid in self.session_metadata:
                metadata = self.session_metadata[sid]
                user_id = metadata.get("user_id")

                if user_id and user_id in self.user_sessions:
                    self.user_sessions[user_id].discard(sid)
                    if not self.user_sessions[user_id]:
                        del self.user_sessions[user_id]

                del self.session_metadata[sid]

        @self.sio.event
        async def authenticate(sid, data):
            """Authenticate user after connection"""
            user_id = data.get("user_id")
            tenant_id = data.get("tenant_id")

            if not user_id or not tenant_id:
                await self.sio.emit('error', {'message': 'Invalid authentication data'}, room=sid)
                return

            # Store session metadata
            self.session_metadata[sid] = {
                "user_id": str(user_id),
                "tenant_id": str(tenant_id)
            }

            # Track user sessions
            if user_id not in self.user_sessions:
                self.user_sessions[str(user_id)] = set()
            self.user_sessions[str(user_id)].add(sid)

            logger.info(f"User {user_id} authenticated on session {sid}")

            # Send authentication success
            await self.sio.emit('authenticated', {'status': 'success'}, room=sid)

        @self.sio.event
        async def subscribe(sid, data):
            """Subscribe to specific event channels"""
            channel = data.get("channel")
            if channel:
                await self.sio.enter_room(sid, channel)
                logger.info(f"Session {sid} subscribed to channel: {channel}")
                await self.sio.emit('subscribed', {'channel': channel}, room=sid)

        @self.sio.event
        async def unsubscribe(sid, data):
            """Unsubscribe from specific event channels"""
            channel = data.get("channel")
            if channel:
                await self.sio.leave_room(sid, channel)
                logger.info(f"Session {sid} unsubscribed from channel: {channel}")
                await self.sio.emit('unsubscribed', {'channel': channel}, room=sid)

        @self.sio.event
        async def mark_notification_read(sid, data):
            """Mark a notification as read"""
            notification_id = data.get("notification_id")
            if notification_id:
                # This would update the database
                # For now, just acknowledge
                await self.sio.emit('notification_marked_read', {
                    'notification_id': notification_id
                }, room=sid)

    async def send_notification_to_user(
        self,
        user_id: str,
        notification: Dict[str, Any]
    ):
        """
        Send notification to a specific user

        Args:
            user_id: User ID to send notification to
            notification: Notification data dict
        """
        user_id_str = str(user_id)

        if user_id_str not in self.user_sessions:
            logger.info(f"User {user_id_str} not connected, notification will be stored only")
            return

        # Send to all user's active sessions
        for session_id in self.user_sessions[user_id_str]:
            await self.sio.emit('notification', notification, room=session_id)

        logger.info(f"Notification sent to user {user_id_str} ({len(self.user_sessions[user_id_str])} sessions)")

    async def send_notification_to_tenant(
        self,
        tenant_id: str,
        notification: Dict[str, Any],
        exclude_user_id: Optional[str] = None
    ):
        """
        Send notification to all users in a tenant

        Args:
            tenant_id: Tenant ID
            notification: Notification data dict
            exclude_user_id: Optional user ID to exclude from broadcast
        """
        tenant_id_str = str(tenant_id)
        exclude_user_id_str = str(exclude_user_id) if exclude_user_id else None

        count = 0
        for session_id, metadata in self.session_metadata.items():
            if metadata.get("tenant_id") == tenant_id_str:
                # Skip excluded user
                if exclude_user_id_str and metadata.get("user_id") == exclude_user_id_str:
                    continue

                await self.sio.emit('notification', notification, room=session_id)
                count += 1

        logger.info(f"Notification broadcast to tenant {tenant_id_str} ({count} sessions)")

    async def broadcast_system_message(
        self,
        message: str,
        type: str = "info"
    ):
        """
        Broadcast system message to all connected users

        Args:
            message: Message to broadcast
            type: Message type (info, warning, error)
        """
        notification = {
            "type": "system",
            "message": message,
            "level": type
        }

        await self.sio.emit('system_message', notification)
        logger.info(f"System message broadcast: {message}")

    async def send_realtime_update(
        self,
        channel: str,
        event_type: str,
        data: Dict[str, Any]
    ):
        """
        Send real-time update to a specific channel

        Args:
            channel: Channel name (e.g., "circulation", "acquisitions")
            event_type: Event type (e.g., "checkout", "checkin")
            data: Event data
        """
        event_data = {
            "type": event_type,
            "data": data
        }

        await self.sio.emit('realtime_update', event_data, room=channel)
        logger.info(f"Real-time update sent to channel {channel}: {event_type}")

    def get_asgi_app(self):
        """Get ASGI app for integration with FastAPI"""
        return socketio.ASGIApp(
            self.sio,
            socketio_path='socket.io'
        )

    async def shutdown(self):
        """Shutdown WebSocket service"""
        logger.info("Shutting down WebSocket service")
        await self.sio.disconnect()


# Singleton instance
_websocket_service: Optional[WebSocketService] = None


def get_websocket_service() -> WebSocketService:
    """Get or create WebSocket service singleton"""
    global _websocket_service

    if _websocket_service is None:
        _websocket_service = WebSocketService()

    return _websocket_service


async def init_websocket():
    """Initialize WebSocket service"""
    service = get_websocket_service()
    logger.info("WebSocket service initialized")
    return service


async def close_websocket():
    """Close WebSocket service"""
    global _websocket_service

    if _websocket_service:
        await _websocket_service.shutdown()
        _websocket_service = None

    logger.info("WebSocket service closed")
