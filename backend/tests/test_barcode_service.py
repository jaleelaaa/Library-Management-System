"""
Test Barcode Service
Test barcode generation, validation, and image generation
"""

import pytest
from app.services.barcode_service import BarcodeService


class TestBarcodeService:
    """Test suite for BarcodeService"""

    def test_generate_barcode_number(self):
        """Test barcode number generation"""
        service = BarcodeService()

        # Generate with default prefix
        barcode = service.generate_barcode_number()
        assert barcode.startswith("ITM")
        assert len(barcode) == 15  # ITM + 12 characters

        # Generate with custom prefix
        barcode_custom = service.generate_barcode_number(prefix="USR")
        assert barcode_custom.startswith("USR")
        assert len(barcode_custom) == 15

        # Check uniqueness
        barcode1 = service.generate_barcode_number()
        barcode2 = service.generate_barcode_number()
        assert barcode1 != barcode2

    def test_validate_barcode(self):
        """Test barcode validation"""
        service = BarcodeService()

        # Valid barcodes
        assert service.validate_barcode("ITM123456789ABC") == True
        assert service.validate_barcode("USR-001-00123") == True
        assert service.validate_barcode("BOOK_12345") == True

        # Invalid barcodes
        assert service.validate_barcode("") == False
        assert service.validate_barcode("AB") == False
        assert service.validate_barcode(None) == False

    def test_generate_code128_image(self):
        """Test Code128 barcode image generation"""
        service = BarcodeService()

        image_bytes = service.generate_code128_image("TEST123456")

        # Check that image was generated
        assert image_bytes is not None
        assert len(image_bytes) > 0

        # Check PNG header
        assert image_bytes.startswith(b'\x89PNG')

    def test_generate_qr_code_image(self):
        """Test QR code generation"""
        service = BarcodeService()

        image_bytes = service.generate_qr_code_image("https://library.example.com/items/12345")

        # Check that image was generated
        assert image_bytes is not None
        assert len(image_bytes) > 0

        # Check PNG header
        assert image_bytes.startswith(b'\x89PNG')

    def test_generate_barcode_label(self):
        """Test barcode label generation"""
        service = BarcodeService()

        label_bytes = service.generate_barcode_label(
            barcode="ITM123456789ABC",
            title="The Great Gatsby",
            location="Fiction - Shelf A3"
        )

        # Check that label was generated
        assert label_bytes is not None
        assert len(label_bytes) > 0

        # Check PNG header
        assert label_bytes.startswith(b'\x89PNG')

    def test_generate_bulk_labels(self):
        """Test bulk label generation"""
        service = BarcodeService()

        items = [
            {"barcode": "ITM001", "title": "Book 1", "location": "Shelf A1"},
            {"barcode": "ITM002", "title": "Book 2", "location": "Shelf A2"},
            {"barcode": "ITM003", "title": "Book 3", "location": "Shelf A3"},
        ]

        sheet_bytes = service.generate_bulk_labels(items)

        # Check that sheet was generated
        assert sheet_bytes is not None
        assert len(sheet_bytes) > 0

        # Check PNG header
        assert sheet_bytes.startswith(b'\x89PNG')

    def test_barcode_label_formats(self):
        """Test different barcode formats"""
        service = BarcodeService()

        # Code128 format
        label_code128 = service.generate_barcode_label(
            barcode="TEST123",
            title="Test Item",
            format="code128"
        )
        assert label_code128 is not None

        # QR format
        label_qr = service.generate_barcode_label(
            barcode="TEST123",
            title="Test Item",
            format="qr"
        )
        assert label_qr is not None

        # Both should be different
        assert label_code128 != label_qr


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
