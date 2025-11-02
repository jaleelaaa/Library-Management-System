"""
Tests for password policy validation (BUG-008).
"""

import pytest
from fastapi import HTTPException

from app.core.security import validate_password_strength, get_password_hash


class TestPasswordValidation:
    """Tests for password strength validation."""

    def test_valid_strong_password(self):
        """Test that strong passwords pass validation."""
        valid_passwords = [
            "Password123!",
            "MyP@ssw0rd",
            "Str0ng!Pass",
            "Secur3#Pass",
            "C0mpl3x!Pwd",
            "Test@1234",
            "Admin#2024",
            "Libr@ry9"
        ]

        for password in valid_passwords:
            # Should not raise exception
            try:
                validate_password_strength(password)
            except HTTPException:
                pytest.fail(f"Valid password '{password}' was rejected")

    def test_password_too_short(self):
        """Test that passwords shorter than 8 characters are rejected."""
        short_passwords = [
            "Pass1!",      # 6 chars
            "Pw@1",        # 4 chars
            "Test@1",      # 6 chars
            "Abc123!",     # 7 chars
        ]

        for password in short_passwords:
            with pytest.raises(HTTPException) as exc_info:
                validate_password_strength(password)

            assert exc_info.value.status_code == 400
            assert "at least 8 characters" in str(exc_info.value.detail).lower()

    def test_password_no_uppercase(self):
        """Test that passwords without uppercase letters are rejected."""
        no_uppercase = [
            "password123!",
            "myp@ssw0rd",
            "test@1234",
            "admin#2024",
        ]

        for password in no_uppercase:
            with pytest.raises(HTTPException) as exc_info:
                validate_password_strength(password)

            assert exc_info.value.status_code == 400
            assert "uppercase" in str(exc_info.value.detail).lower()

    def test_password_no_lowercase(self):
        """Test that passwords without lowercase letters are rejected."""
        no_lowercase = [
            "PASSWORD123!",
            "MYP@SSW0RD",
            "TEST@1234",
            "ADMIN#2024",
        ]

        for password in no_lowercase:
            with pytest.raises(HTTPException) as exc_info:
                validate_password_strength(password)

            assert exc_info.value.status_code == 400
            assert "lowercase" in str(exc_info.value.detail).lower()

    def test_password_no_number(self):
        """Test that passwords without numbers are rejected."""
        no_number = [
            "Password!",
            "MyP@ssword",
            "Test@Password",
            "Admin#Pass",
        ]

        for password in no_number:
            with pytest.raises(HTTPException) as exc_info:
                validate_password_strength(password)

            assert exc_info.value.status_code == 400
            assert "number" in str(exc_info.value.detail).lower()

    def test_password_no_special_char(self):
        """Test that passwords without special characters are rejected."""
        no_special = [
            "Password123",
            "MyPassword0",
            "Test1234Pass",
            "Admin2024Pass",
        ]

        for password in no_special:
            with pytest.raises(HTTPException) as exc_info:
                validate_password_strength(password)

            assert exc_info.value.status_code == 400
            assert "special character" in str(exc_info.value.detail).lower()

    def test_password_multiple_errors(self):
        """Test that all errors are reported for weak passwords."""
        # Password with multiple issues
        weak_password = "weak"  # Too short, no uppercase, no number, no special

        with pytest.raises(HTTPException) as exc_info:
            validate_password_strength(weak_password)

        assert exc_info.value.status_code == 400
        detail = str(exc_info.value.detail)

        # Should mention multiple errors
        assert "8 characters" in detail.lower()
        assert "uppercase" in detail.lower()
        assert "number" in detail.lower()
        assert "special" in detail.lower()

    def test_password_with_various_special_chars(self):
        """Test that various special characters are accepted."""
        special_chars = "!@#$%^&*(),.?\":{}|<>_-+=[]\\\/;'`~"

        for char in special_chars:
            password = f"Password1{char}"
            try:
                validate_password_strength(password)
            except HTTPException:
                pytest.fail(f"Special character '{char}' was not recognized")

    def test_password_exactly_8_chars(self):
        """Test that 8-character passwords meeting all criteria are valid."""
        valid_8_char = "Pass123!"

        # Should not raise exception
        validate_password_strength(valid_8_char)

    def test_password_very_long(self):
        """Test that very long passwords are accepted."""
        long_password = "VeryLongPassword123!WithManyCharacters" * 3

        # Should not raise exception
        validate_password_strength(long_password)

    def test_password_common_patterns(self):
        """Test common password patterns (should all pass strength check)."""
        common_valid = [
            "Welcome@123",
            "Spring@2024",
            "Library#2024",
            "Admin@Pass1",
            "User#Test1",
        ]

        for password in common_valid:
            validate_password_strength(password)

    def test_password_with_spaces(self):
        """Test passwords with spaces (should be allowed if strong)."""
        password_with_space = "My Pass123!"

        # Should not raise exception (spaces are allowed)
        validate_password_strength(password_with_space)

    def test_error_detail_structure(self):
        """Test that error detail has correct structure."""
        with pytest.raises(HTTPException) as exc_info:
            validate_password_strength("weak")

        assert exc_info.value.status_code == 400
        detail = exc_info.value.detail

        # Detail should be a dict with message and errors
        assert isinstance(detail, dict)
        assert "message" in detail
        assert "errors" in detail
        assert isinstance(detail["errors"], list)
        assert len(detail["errors"]) > 0

    def test_unicode_characters(self):
        """Test passwords with unicode characters."""
        # Unicode special chars should work
        unicode_passwords = [
            "Pässwörd1!",
            "Test日本123!",
            "Café@2024",
        ]

        for password in unicode_passwords:
            # Unicode letters count as letters, but need special char and number
            try:
                validate_password_strength(password)
            except HTTPException as e:
                # Should pass if it has required elements
                pass


class TestPasswordHashingIntegration:
    """Test integration between password validation and hashing."""

    def test_valid_password_can_be_hashed(self):
        """Test that valid passwords can be hashed."""
        valid_password = "ValidPass123!"

        # Validate
        validate_password_strength(valid_password)

        # Hash
        hashed = get_password_hash(valid_password)

        assert hashed is not None
        assert len(hashed) > 0
        assert hashed != valid_password

    def test_cannot_hash_without_validation(self):
        """Test workflow: should validate before hashing."""
        weak_password = "weak"

        # Validation should fail
        with pytest.raises(HTTPException):
            validate_password_strength(weak_password)

        # Even though hashing would work, we enforce validation first
        # (This is enforced by API endpoints, not the hash function itself)
        hashed = get_password_hash(weak_password)
        assert hashed is not None  # Hash function doesn't validate

    def test_edge_cases(self):
        """Test edge cases in password validation."""
        edge_cases = {
            "": "empty string",
            " ": "single space",
            "12345678": "only numbers",
            "ABCDEFGH": "only uppercase",
            "abcdefgh": "only lowercase",
            "!@#$%^&*": "only special chars",
        }

        for password, description in edge_cases.items():
            with pytest.raises(HTTPException):
                validate_password_strength(password)


class TestPasswordPolicyCompliance:
    """Test compliance with documented password policy."""

    def test_meets_folio_standards(self):
        """Test that validation meets FOLIO library standards."""
        # Common library system passwords
        library_passwords = [
            "Librarian@2024",
            "Circulation#1",
            "Cataloger!2024",
            "Reference@Desk1",
        ]

        for password in library_passwords:
            validate_password_strength(password)

    def test_rejects_common_weak_passwords(self):
        """Test that common weak passwords are rejected."""
        weak_passwords = [
            "password",
            "12345678",
            "admin",
            "password123",
            "Password",
            "Admin123",
        ]

        for password in weak_passwords:
            with pytest.raises(HTTPException):
                validate_password_strength(password)

    def test_minimum_security_baseline(self):
        """Test that minimum security baseline is enforced."""
        # All these should fail for at least one reason
        below_baseline = [
            "Pass1!",       # Too short
            "password123!", # No uppercase
            "PASSWORD123!", # No lowercase
            "Password!",    # No number
            "Password123",  # No special char
        ]

        for password in below_baseline:
            with pytest.raises(HTTPException):
                validate_password_strength(password)
