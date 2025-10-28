"""
Barcode Generation Service
Generate barcodes in various formats (Code128, Code39, QR Code)
"""

import io
import uuid
from typing import Optional, Literal
from PIL import Image, ImageDraw, ImageFont
import qrcode
import logging

logger = logging.getLogger(__name__)

BarcodeFormat = Literal["code128", "code39", "qr", "ean13"]


class BarcodeService:
    """Service for generating and managing barcodes"""

    @staticmethod
    def generate_barcode_number(prefix: str = "ITM") -> str:
        """
        Generate a unique barcode number

        Args:
            prefix: Prefix for the barcode (e.g., "ITM" for items, "USR" for users)

        Returns:
            Unique barcode string
        """
        # Generate UUID and take first 12 characters
        unique_id = str(uuid.uuid4()).replace("-", "")[:12].upper()
        return f"{prefix}{unique_id}"

    @staticmethod
    def validate_barcode(barcode: str) -> bool:
        """
        Validate barcode format

        Args:
            barcode: Barcode string to validate

        Returns:
            True if valid, False otherwise
        """
        if not barcode or len(barcode) < 3:
            return False

        # Check for valid characters (alphanumeric)
        return barcode.replace("-", "").replace("_", "").isalnum()

    @staticmethod
    def generate_code128_image(data: str, width: int = 300, height: int = 100) -> bytes:
        """
        Generate Code128 barcode image

        Args:
            data: Data to encode
            width: Image width in pixels
            height: Image height in pixels

        Returns:
            PNG image bytes
        """
        try:
            # Create a simple barcode representation
            # In production, use python-barcode library
            img = Image.new('RGB', (width, height), color='white')
            draw = ImageDraw.Draw(img)

            # Draw bars (simplified Code128)
            bar_width = width // (len(data) + 2)
            x = 10

            for i, char in enumerate(data):
                # Alternate black and white bars based on character
                if ord(char) % 2 == 0:
                    draw.rectangle([x, 10, x + bar_width - 2, height - 30], fill='black')
                x += bar_width

            # Add text below barcode
            try:
                font = ImageFont.truetype("arial.ttf", 16)
            except:
                font = ImageFont.load_default()

            text_bbox = draw.textbbox((0, 0), data, font=font)
            text_width = text_bbox[2] - text_bbox[0]
            text_x = (width - text_width) // 2
            draw.text((text_x, height - 25), data, fill='black', font=font)

            # Convert to bytes
            output = io.BytesIO()
            img.save(output, format='PNG')
            return output.getvalue()

        except Exception as e:
            logger.error(f"Error generating Code128 barcode: {e}")
            raise

    @staticmethod
    def generate_qr_code_image(data: str, size: int = 300) -> bytes:
        """
        Generate QR Code image

        Args:
            data: Data to encode
            size: Image size in pixels (QR codes are square)

        Returns:
            PNG image bytes
        """
        try:
            qr = qrcode.QRCode(
                version=1,
                error_correction=qrcode.constants.ERROR_CORRECT_L,
                box_size=10,
                border=4,
            )
            qr.add_data(data)
            qr.make(fit=True)

            img = qr.make_image(fill_color="black", back_color="white")

            # Resize to desired size
            img = img.resize((size, size), Image.Resampling.LANCZOS)

            # Convert to bytes
            output = io.BytesIO()
            img.save(output, format='PNG')
            return output.getvalue()

        except Exception as e:
            logger.error(f"Error generating QR code: {e}")
            raise

    @staticmethod
    def generate_barcode_label(
        barcode: str,
        title: str,
        location: Optional[str] = None,
        format: BarcodeFormat = "code128",
        width: int = 400,
        height: int = 200
    ) -> bytes:
        """
        Generate a complete barcode label with title and location

        Args:
            barcode: Barcode data
            title: Item title
            location: Location information
            format: Barcode format
            width: Label width
            height: Label height

        Returns:
            PNG image bytes
        """
        try:
            img = Image.new('RGB', (width, height), color='white')
            draw = ImageDraw.Draw(img)

            # Draw border
            draw.rectangle([2, 2, width-2, height-2], outline='black', width=2)

            y_offset = 10

            # Add title (truncate if too long)
            try:
                font_title = ImageFont.truetype("arial.ttf", 14)
                font_normal = ImageFont.truetype("arial.ttf", 12)
            except:
                font_title = ImageFont.load_default()
                font_normal = ImageFont.load_default()

            title_text = title[:40] + "..." if len(title) > 40 else title
            draw.text((10, y_offset), title_text, fill='black', font=font_title)
            y_offset += 25

            # Generate barcode
            if format == "qr":
                barcode_img_bytes = BarcodeService.generate_qr_code_image(barcode, size=120)
                barcode_img = Image.open(io.BytesIO(barcode_img_bytes))
                img.paste(barcode_img, ((width - 120) // 2, y_offset))
                y_offset += 130
            else:
                barcode_img_bytes = BarcodeService.generate_code128_image(barcode, width=width-20, height=80)
                barcode_img = Image.open(io.BytesIO(barcode_img_bytes))
                img.paste(barcode_img, (10, y_offset))
                y_offset += 90

            # Add location if provided
            if location:
                location_text = f"Location: {location[:35]}"
                draw.text((10, y_offset), location_text, fill='black', font=font_normal)

            # Convert to bytes
            output = io.BytesIO()
            img.save(output, format='PNG')
            return output.getvalue()

        except Exception as e:
            logger.error(f"Error generating barcode label: {e}")
            raise

    @staticmethod
    def generate_bulk_labels(
        items: list,
        format: BarcodeFormat = "code128"
    ) -> bytes:
        """
        Generate multiple barcode labels on a single sheet

        Args:
            items: List of dicts with 'barcode', 'title', 'location'
            format: Barcode format

        Returns:
            PNG image bytes of label sheet
        """
        try:
            # Standard Avery 5160 labels: 3 columns x 10 rows
            label_width = 350
            label_height = 150
            cols = 3
            rows = 10
            margin = 10

            sheet_width = cols * label_width + (cols + 1) * margin
            sheet_height = rows * label_height + (rows + 1) * margin

            sheet = Image.new('RGB', (sheet_width, sheet_height), color='white')

            for idx, item in enumerate(items[:30]):  # Max 30 labels per sheet
                row = idx // cols
                col = idx % cols

                x = margin + col * (label_width + margin)
                y = margin + row * (label_height + margin)

                # Generate individual label
                label_bytes = BarcodeService.generate_barcode_label(
                    barcode=item.get('barcode', ''),
                    title=item.get('title', 'Untitled'),
                    location=item.get('location', ''),
                    format=format,
                    width=label_width,
                    height=label_height
                )

                label_img = Image.open(io.BytesIO(label_bytes))
                sheet.paste(label_img, (x, y))

            # Convert to bytes
            output = io.BytesIO()
            sheet.save(output, format='PNG')
            return output.getvalue()

        except Exception as e:
            logger.error(f"Error generating bulk labels: {e}")
            raise


# Singleton instance
barcode_service = BarcodeService()
