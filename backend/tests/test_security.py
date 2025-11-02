"""
Tests for security functionality (JWT, password hashing, etc.)
"""

import pytest
from datetime import datetime, timedelta
from jose import jwt, JWTError
from fastapi import HTTPException
import time

from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    verify_token_type,
    get_password_hash,
    verify_password,
)
from app.core.config import settings


class TestJWTTokenExpiration:
    """Tests for BUG-002: JWT token expiration functionality."""

    def test_access_token_has_expiration(self):
        """Test that access tokens include an expiration time."""
        token = create_access_token(data={"sub": "test-user-id"})

        # Decode without verification to inspect payload
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )

        # Verify 'exp' field exists
        assert "exp" in payload, "Access token must have 'exp' field"

        # Verify expiration is in the future
        exp_timestamp = payload["exp"]
        current_timestamp = datetime.utcnow().timestamp()
        assert exp_timestamp > current_timestamp, "Expiration must be in the future"

        # Verify expiration is approximately ACCESS_TOKEN_EXPIRE_MINUTES from now
        # Calculate expected expiration
        now_timestamp = datetime.utcnow().timestamp()
        expected_exp_timestamp = now_timestamp + (settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60)

        # Allow 10 second tolerance for test execution time
        time_diff = abs(exp_timestamp - expected_exp_timestamp)
        assert time_diff < 10, f"Expiration time should be ~{settings.ACCESS_TOKEN_EXPIRE_MINUTES} minutes from now (diff: {time_diff}s)"

    def test_access_token_has_correct_type(self):
        """Test that access tokens have type='access'."""
        token = create_access_token(data={"sub": "test-user-id"})
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )

        assert payload.get("type") == "access", "Access token must have type='access'"

    def test_refresh_token_has_expiration(self):
        """Test that refresh tokens include an expiration time."""
        token = create_refresh_token(data={"sub": "test-user-id"})

        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )

        assert "exp" in payload, "Refresh token must have 'exp' field"

        # Verify expiration is approximately REFRESH_TOKEN_EXPIRE_DAYS from now
        exp_timestamp = payload["exp"]
        now_timestamp = datetime.utcnow().timestamp()
        expected_exp_timestamp = now_timestamp + (settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60)

        # Allow 10 second tolerance
        time_diff = abs(exp_timestamp - expected_exp_timestamp)
        assert time_diff < 10, f"Expiration time should be ~{settings.REFRESH_TOKEN_EXPIRE_DAYS} days from now (diff: {time_diff}s)"

    def test_refresh_token_has_correct_type(self):
        """Test that refresh tokens have type='refresh'."""
        token = create_refresh_token(data={"sub": "test-user-id"})
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )

        assert payload.get("type") == "refresh", "Refresh token must have type='refresh'"

    def test_expired_token_rejected(self):
        """Test that expired tokens are rejected during verification."""
        # Create token with very short expiration (1 second)
        token = create_access_token(
            data={"sub": "test-user-id"},
            expires_delta=timedelta(seconds=1)
        )

        # Token should be valid initially
        payload = decode_token(token)
        assert payload["sub"] == "test-user-id"

        # Wait for token to expire (2 seconds)
        time.sleep(2)

        # Token should now be expired
        with pytest.raises(HTTPException) as exc_info:
            decode_token(token)

        # Verify it's a 401 Unauthorized error
        assert exc_info.value.status_code == 401
        assert "credentials" in exc_info.value.detail.lower()

    def test_token_expires_after_configured_minutes(self):
        """Test that tokens have correct expiration based on configuration."""
        # Create token with short expiration for testing
        short_expire = timedelta(seconds=2)
        token = create_access_token(
            data={"sub": "test-user-id"},
            expires_delta=short_expire
        )

        # Token should work before expiration
        payload = decode_token(token)
        assert payload["sub"] == "test-user-id"

        # Wait for token to expire
        time.sleep(3)

        # Token should now be expired
        with pytest.raises(HTTPException) as exc_info:
            decode_token(token)

        assert exc_info.value.status_code == 401

    def test_custom_expiration_delta(self):
        """Test that custom expiration delta works correctly."""
        custom_minutes = 5
        token = create_access_token(
            data={"sub": "test-user-id"},
            expires_delta=timedelta(minutes=custom_minutes)
        )

        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )

        # Verify custom expiration was used
        exp_timestamp = payload["exp"]
        now_timestamp = datetime.utcnow().timestamp()
        expected_exp_timestamp = now_timestamp + (custom_minutes * 60)

        time_diff = abs(exp_timestamp - expected_exp_timestamp)
        assert time_diff < 10, f"Should use custom expiration of {custom_minutes} minutes (diff: {time_diff}s)"


class TestTokenTypeValidation:
    """Tests for token type validation."""

    def test_verify_access_token_type(self):
        """Test that access token type validation passes for access tokens."""
        token = create_access_token(data={"sub": "test-user-id"})
        payload = decode_token(token)

        # Should not raise exception
        verify_token_type(payload, "access")

    def test_verify_refresh_token_type(self):
        """Test that refresh token type validation passes for refresh tokens."""
        token = create_refresh_token(data={"sub": "test-user-id"})
        payload = decode_token(token)

        # Should not raise exception
        verify_token_type(payload, "refresh")

    def test_reject_wrong_token_type(self):
        """Test that using wrong token type raises exception."""
        access_token = create_access_token(data={"sub": "test-user-id"})
        payload = decode_token(access_token)

        # Try to verify as refresh token (should fail)
        with pytest.raises(HTTPException) as exc_info:
            verify_token_type(payload, "refresh")

        assert exc_info.value.status_code == 401
        assert "token type" in exc_info.value.detail.lower()

    def test_missing_token_type(self):
        """Test handling of tokens without type field."""
        # Create token without type (simulating old token format)
        to_encode = {"sub": "test-user-id"}
        expire = datetime.utcnow() + timedelta(minutes=30)
        to_encode.update({"exp": expire})

        token = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])

        # Should raise exception for missing type
        with pytest.raises(HTTPException) as exc_info:
            verify_token_type(payload, "access")

        assert exc_info.value.status_code == 401


class TestPasswordHashing:
    """Tests for password hashing functionality."""

    def test_password_hashing(self):
        """Test that passwords are hashed correctly."""
        plain_password = "TestPassword123!"
        hashed = get_password_hash(plain_password)

        # Hash should be different from plain password
        assert hashed != plain_password

        # Hash should be a string
        assert isinstance(hashed, str)

        # Hash should not be empty
        assert len(hashed) > 0

    def test_password_verification(self):
        """Test that password verification works correctly."""
        plain_password = "TestPassword123!"
        hashed = get_password_hash(plain_password)

        # Correct password should verify
        assert verify_password(plain_password, hashed) is True

        # Wrong password should not verify
        assert verify_password("WrongPassword", hashed) is False

    def test_same_password_different_hashes(self):
        """Test that same password produces different hashes (salted)."""
        password = "TestPassword123!"
        hash1 = get_password_hash(password)
        hash2 = get_password_hash(password)

        # Hashes should be different (bcrypt uses salt)
        assert hash1 != hash2

        # But both should verify correctly
        assert verify_password(password, hash1) is True
        assert verify_password(password, hash2) is True


class TestTokenPayloadIntegrity:
    """Tests for token payload integrity."""

    def test_token_contains_subject(self):
        """Test that tokens contain the subject (user ID)."""
        user_id = "test-user-12345"
        token = create_access_token(data={"sub": user_id})
        payload = decode_token(token)

        assert payload["sub"] == user_id

    def test_token_preserves_custom_data(self):
        """Test that custom data in token is preserved."""
        data = {
            "sub": "user-123",
            "email": "test@example.com",
            "roles": ["admin", "user"]
        }
        token = create_access_token(data=data)
        payload = decode_token(token)

        # All custom data should be preserved
        assert payload["sub"] == data["sub"]
        assert payload["email"] == data["email"]
        assert payload["roles"] == data["roles"]

    def test_invalid_token_rejected(self):
        """Test that invalid tokens are rejected."""
        invalid_token = "invalid.token.here"

        with pytest.raises(HTTPException) as exc_info:
            decode_token(invalid_token)

        assert exc_info.value.status_code == 401

    def test_tampered_token_rejected(self):
        """Test that tampered tokens are rejected."""
        token = create_access_token(data={"sub": "user-123"})

        # Tamper with token (change a character)
        tampered_token = token[:-10] + "X" + token[-9:]

        with pytest.raises(HTTPException) as exc_info:
            decode_token(tampered_token)

        assert exc_info.value.status_code == 401
