"""
ENHANCED Security utilities with improved JWT tokens and additional protections.

IMPROVEMENTS OVER security.py:
1. JWT tokens include tenant_id, user_type, and permissions
2. Separate functions for creating enhanced tokens
3. Token blacklisting support (requires Redis)
4. CSRF token generation

TO USE: Import from this module instead of app.core.security
"""

from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List
import re
import secrets
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import HTTPException, status
from app.core.config import settings

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash."""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Hash a password."""
    return pwd_context.hash(password)


def create_enhanced_access_token(
    user_id: str,
    tenant_id: str,
    user_type: str,
    permissions: List[str],
    expires_delta: Optional[timedelta] = None
) -> str:
    """
    Create enhanced JWT access token with additional claims.

    Enhanced payload includes:
    - sub: user_id
    - tenant_id: for multi-tenancy
    - user_type: staff/patron for quick checks
    - permissions: list of permission names for client-side UI
    - exp: expiration timestamp
    - type: token type (access)
    - iat: issued at timestamp
    - jti: JWT ID for revocation support

    Args:
        user_id: User UUID as string
        tenant_id: Tenant UUID as string
        user_type: User type (staff/patron/system)
        permissions: List of permission names
        expires_delta: Optional custom expiration

    Returns:
        JWT token string
    """
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    # Create JWT ID for revocation support
    jti = secrets.token_urlsafe(32)

    to_encode = {
        "sub": user_id,
        "tenant_id": tenant_id,
        "user_type": user_type,
        "permissions": permissions[:50],  # Limit to first 50 to avoid huge tokens
        "exp": expire,
        "iat": datetime.utcnow(),
        "type": "access",
        "jti": jti
    }

    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def create_enhanced_refresh_token(
    user_id: str,
    tenant_id: str,
) -> str:
    """
    Create enhanced refresh token.

    Refresh tokens are long-lived and should be stored securely (httpOnly cookie).

    Args:
        user_id: User UUID as string
        tenant_id: Tenant UUID as string

    Returns:
        JWT token string
    """
    expire = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    jti = secrets.token_urlsafe(32)

    to_encode = {
        "sub": user_id,
        "tenant_id": tenant_id,
        "exp": expire,
        "iat": datetime.utcnow(),
        "type": "refresh",
        "jti": jti
    }

    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def decode_token(token: str) -> Dict[str, Any]:
    """Decode and verify JWT token."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


def verify_token_type(payload: Dict[str, Any], expected_type: str) -> None:
    """Verify token type matches expected type."""
    token_type = payload.get("type")
    if token_type != expected_type:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token type. Expected {expected_type}, got {token_type}",
        )


def validate_password_strength(password: str) -> None:
    """
    Validate password meets security requirements.

    Requirements:
    - Minimum 8 characters
    - At least one uppercase letter
    - At least one lowercase letter
    - At least one number
    - At least one special character

    Args:
        password: The password to validate

    Raises:
        HTTPException: If password doesn't meet requirements
    """
    errors = []

    if len(password) < 8:
        errors.append("Password must be at least 8 characters long")

    if not re.search(r"[A-Z]", password):
        errors.append("Password must contain at least one uppercase letter")

    if not re.search(r"[a-z]", password):
        errors.append("Password must contain at least one lowercase letter")

    if not re.search(r"\d", password):
        errors.append("Password must contain at least one number")

    if not re.search(r"[!@#$%^&*(),.?\":{}|<>_\-+=\[\]\\\/;'`~]", password):
        errors.append("Password must contain at least one special character")

    if errors:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "message": "Password does not meet security requirements",
                "errors": errors
            }
        )


def generate_csrf_token() -> str:
    """Generate a CSRF token."""
    return secrets.token_urlsafe(32)


def verify_csrf_token(token: str, expected_token: str) -> bool:
    """Verify CSRF token matches."""
    return secrets.compare_digest(token, expected_token)


# Token blacklisting (requires Redis)
class TokenBlacklist:
    """
    Token blacklist for revoked tokens.

    Uses Redis to store revoked JWT IDs (jti claims).
    This allows immediate token revocation.
    """

    def __init__(self, redis_client=None):
        """Initialize with optional Redis client."""
        self.redis = redis_client

    async def revoke_token(self, jti: str, exp: int):
        """
        Add token to blacklist.

        Args:
            jti: JWT ID from token
            exp: Expiration timestamp
        """
        if not self.redis:
            return

        # Calculate TTL (time until token expires)
        ttl = exp - int(datetime.utcnow().timestamp())
        if ttl > 0:
            await self.redis.setex(f"revoked_token:{jti}", ttl, "1")

    async def is_token_revoked(self, jti: str) -> bool:
        """
        Check if token is revoked.

        Args:
            jti: JWT ID from token

        Returns:
            True if token is revoked, False otherwise
        """
        if not self.redis:
            return False

        result = await self.redis.get(f"revoked_token:{jti}")
        return result is not None
