"""
Rate limiting middleware and utilities for protecting against brute force attacks.

USAGE:
    from app.core.rate_limiter import rate_limiter, RateLimitMiddleware

    # Add to FastAPI app
    app.add_middleware(RateLimitMiddleware)

    # Or use decorator
    @router.post("/login")
    @rate_limiter.limit("5/minute")
    async def login(...):
        ...
"""

from fastapi import Request, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware
from typing import Callable, Dict
import time
from collections import defaultdict, deque
import asyncio

class InMemoryRateLimiter:
    """
    Simple in-memory rate limiter.

    For production, use Redis-based rate limiter (slowapi or similar).
    """

    def __init__(self):
        # Store: {key: deque of timestamps}
        self.requests: Dict[str, deque] = defaultdict(deque)
        self.locks: Dict[str, asyncio.Lock] = defaultdict(asyncio.Lock)

    async def is_allowed(
        self,
        key: str,
        max_requests: int,
        window_seconds: int
    ) -> tuple[bool, int]:
        """
        Check if request is allowed under rate limit.

        Args:
            key: Unique identifier (e.g., IP address, user ID)
            max_requests: Maximum requests allowed
            window_seconds: Time window in seconds

        Returns:
            Tuple of (is_allowed, retry_after_seconds)
        """
        async with self.locks[key]:
            now = time.time()
            window_start = now - window_seconds

            # Remove old timestamps outside the window
            while self.requests[key] and self.requests[key][0] < window_start:
                self.requests[key].popleft()

            # Check if under limit
            if len(self.requests[key]) < max_requests:
                self.requests[key].append(now)
                return True, 0
            else:
                # Calculate retry-after
                oldest_request = self.requests[key][0]
                retry_after = int(oldest_request + window_seconds - now) + 1
                return False, retry_after

    async def reset(self, key: str):
        """Reset rate limit for a key."""
        async with self.locks[key]:
            if key in self.requests:
                self.requests[key].clear()

# Global rate limiter instance
_rate_limiter = InMemoryRateLimiter()


class RateLimitMiddleware(BaseHTTPMiddleware):
    """
    Middleware to apply global rate limiting.

    Applies per-IP rate limiting to all requests.
    """

    def __init__(self, app, calls: int = 100, period: int = 60):
        """
        Initialize rate limit middleware.

        Args:
            app: FastAPI application
            calls: Number of calls allowed
            period: Time period in seconds
        """
        super().__init__(app)
        self.calls = calls
        self.period = period

    async def dispatch(self, request: Request, call_next):
        # Get client IP
        client_ip = request.client.host if request.client else "unknown"

        # Skip rate limiting for certain paths
        skip_paths = ["/docs", "/redoc", "/openapi.json", "/health"]
        if any(request.url.path.startswith(path) for path in skip_paths):
            return await call_next(request)

        # Check rate limit
        allowed, retry_after = await _rate_limiter.is_allowed(
            f"global:{client_ip}",
            self.calls,
            self.period
        )

        if not allowed:
            return HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Rate limit exceeded. Retry after {retry_after} seconds.",
                headers={"Retry-After": str(retry_after)}
            )

        response = await call_next(request)
        return response


def rate_limit(max_requests: int = 5, window_seconds: int = 60):
    """
    Decorator for rate limiting specific endpoints.

    Args:
        max_requests: Maximum requests allowed
        window_seconds: Time window in seconds

    Example:
        @router.post("/login")
        @rate_limit(max_requests=5, window_seconds=60)
        async def login(...):
            ...
    """
    def decorator(func: Callable):
        async def wrapper(request: Request, *args, **kwargs):
            # Get client identifier (IP or username from body)
            client_ip = request.client.host if request.client else "unknown"
            key = f"endpoint:{func.__name__}:{client_ip}"

            # For login endpoints, also check username-based limiting
            if func.__name__ == "login":
                try:
                    body = await request.json()
                    if "username" in body:
                        username_key = f"username:{body['username']}"
                        allowed, retry_after = await _rate_limiter.is_allowed(
                            username_key,
                            max_requests=3,  # Stricter limit per username
                            window_seconds=300  # 5 minutes
                        )
                        if not allowed:
                            raise HTTPException(
                                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                                detail=f"Too many login attempts. Please try again in {retry_after} seconds.",
                                headers={"Retry-After": str(retry_after)}
                            )
                except:
                    pass

            # Check IP-based rate limit
            allowed, retry_after = await _rate_limiter.is_allowed(
                key,
                max_requests,
                window_seconds
            )

            if not allowed:
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail=f"Too many requests. Please try again in {retry_after} seconds.",
                    headers={"Retry-After": str(retry_after)}
                )

            return await func(*args, **kwargs)

        return wrapper
    return decorator


# Login attempt tracker for account lockout
class LoginAttemptTracker:
    """
    Track failed login attempts and implement account lockout.
    """

    def __init__(self):
        # Store: {username: [timestamps]}
        self.failed_attempts: Dict[str, deque] = defaultdict(deque)
        self.locked_accounts: Dict[str, float] = {}  # {username: unlock_timestamp}

    async def record_failed_attempt(self, username: str):
        """Record a failed login attempt."""
        now = time.time()
        self.failed_attempts[username].append(now)

        # Keep only last 10 attempts
        while len(self.failed_attempts[username]) > 10:
            self.failed_attempts[username].popleft()

    async def record_successful_login(self, username: str):
        """Clear failed attempts on successful login."""
        if username in self.failed_attempts:
            self.failed_attempts[username].clear()
        if username in self.locked_accounts:
            del self.locked_accounts[username]

    async def is_locked(self, username: str) -> tuple[bool, int]:
        """
        Check if account is locked.

        Returns:
            Tuple of (is_locked, unlock_after_seconds)
        """
        # Check if already locked
        if username in self.locked_accounts:
            unlock_time = self.locked_accounts[username]
            if time.time() < unlock_time:
                retry_after = int(unlock_time - time.time()) + 1
                return True, retry_after
            else:
                # Lock expired, remove it
                del self.locked_accounts[username]

        # Check if should be locked
        now = time.time()
        recent_window = now - 300  # Last 5 minutes

        # Count failures in last 5 minutes
        recent_failures = [
            ts for ts in self.failed_attempts[username]
            if ts >= recent_window
        ]

        if len(recent_failures) >= 5:
            # Lock for 15 minutes
            lockout_duration = 900  # 15 minutes
            self.locked_accounts[username] = now + lockout_duration
            return True, lockout_duration

        return False, 0

    async def reset(self, username: str):
        """Reset tracking for a username."""
        if username in self.failed_attempts:
            self.failed_attempts[username].clear()
        if username in self.locked_accounts:
            del self.locked_accounts[username]

# Global login attempt tracker
login_tracker = LoginAttemptTracker()
