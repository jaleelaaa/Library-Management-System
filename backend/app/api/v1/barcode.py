"""
Barcode API Endpoints
Generate and manage barcodes for items
"""

from fastapi import APIRouter, Depends, HTTPException, Query, Response
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
import io
import logging

from app.db.session import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.inventory import Item, Instance, Holding, Location
from app.services.barcode_service import barcode_service, BarcodeFormat
from pydantic import BaseModel

router = APIRouter()
logger = logging.getLogger(__name__)


class BarcodeGenerateRequest(BaseModel):
    """Request to generate a new barcode"""
    prefix: str = "ITM"


class BarcodeGenerateResponse(BaseModel):
    """Response with generated barcode"""
    barcode: str
    format: str = "code128"


class BarcodeLabelRequest(BaseModel):
    """Request to generate barcode label"""
    barcode: str
    title: str
    location: Optional[str] = None
    format: BarcodeFormat = "code128"
    width: int = 400
    height: int = 200


class BulkLabelRequest(BaseModel):
    """Request to generate bulk labels"""
    item_ids: List[str]
    format: BarcodeFormat = "code128"


@router.post("/generate", response_model=BarcodeGenerateResponse)
async def generate_barcode(
    request: BarcodeGenerateRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Generate a new unique barcode number

    Args:
        request: Generation parameters
        current_user: Current authenticated user

    Returns:
        Generated barcode
    """
    try:
        barcode = barcode_service.generate_barcode_number(prefix=request.prefix)

        return BarcodeGenerateResponse(
            barcode=barcode,
            format="code128"
        )

    except Exception as e:
        logger.error(f"Error generating barcode: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate barcode")


@router.get("/validate/{barcode}")
async def validate_barcode(
    barcode: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Validate if a barcode is properly formatted and unique

    Args:
        barcode: Barcode to validate
        db: Database session
        current_user: Current authenticated user

    Returns:
        Validation result
    """
    try:
        # Check format
        is_valid_format = barcode_service.validate_barcode(barcode)

        if not is_valid_format:
            return {
                "valid": False,
                "unique": False,
                "message": "Invalid barcode format"
            }

        # Check uniqueness in database
        result = await db.execute(
            select(Item).where(Item.barcode == barcode)
        )
        existing_item = result.scalar_one_or_none()

        return {
            "valid": True,
            "unique": existing_item is None,
            "message": "Barcode is valid and unique" if existing_item is None else "Barcode already exists"
        }

    except Exception as e:
        logger.error(f"Error validating barcode: {e}")
        raise HTTPException(status_code=500, detail="Failed to validate barcode")


@router.get("/scan/{barcode}")
async def scan_barcode(
    barcode: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Scan a barcode and retrieve item information
    This endpoint simulates barcode scanner functionality

    Args:
        barcode: Scanned barcode
        db: Database session
        current_user: Current authenticated user

    Returns:
        Complete item information
    """
    try:
        # Find item by barcode
        result = await db.execute(
            select(Item)
            .where(Item.barcode == barcode)
            .where(Item.tenant_id == current_user.tenant_id)
        )
        item = result.scalar_one_or_none()

        if not item:
            raise HTTPException(status_code=404, detail="Item not found with this barcode")

        # Load holding and instance
        holding_result = await db.execute(
            select(Holding).where(Holding.id == item.holding_id)
        )
        holding = holding_result.scalar_one_or_none()

        instance = None
        if holding:
            instance_result = await db.execute(
                select(Instance).where(Instance.id == holding.instance_id)
            )
            instance = instance_result.scalar_one_or_none()

        # Load location
        location = None
        if item.effective_location_id:
            location_result = await db.execute(
                select(Location).where(Location.id == item.effective_location_id)
            )
            location = location_result.scalar_one_or_none()

        return {
            "item": {
                "id": str(item.id),
                "barcode": item.barcode,
                "status": item.status.value,
                "material_type_id": str(item.material_type_id) if item.material_type_id else None,
                "copy_number": item.copy_number,
                "notes": item.notes
            },
            "holding": {
                "id": str(holding.id) if holding else None,
                "call_number": holding.call_number if holding else None,
                "location": location.name if location else None
            } if holding else None,
            "instance": {
                "id": str(instance.id) if instance else None,
                "title": instance.title if instance else None,
                "contributors": instance.contributors if instance else None,
                "publication": instance.publication if instance else None
            } if instance else None
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error scanning barcode: {e}")
        raise HTTPException(status_code=500, detail="Failed to scan barcode")


@router.post("/label")
async def generate_label(
    request: BarcodeLabelRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Generate a printable barcode label

    Args:
        request: Label parameters
        current_user: Current authenticated user

    Returns:
        PNG image of barcode label
    """
    try:
        label_bytes = barcode_service.generate_barcode_label(
            barcode=request.barcode,
            title=request.title,
            location=request.location,
            format=request.format,
            width=request.width,
            height=request.height
        )

        return StreamingResponse(
            io.BytesIO(label_bytes),
            media_type="image/png",
            headers={
                "Content-Disposition": f"attachment; filename=label_{request.barcode}.png"
            }
        )

    except Exception as e:
        logger.error(f"Error generating label: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate label")


@router.post("/labels/bulk")
async def generate_bulk_labels(
    request: BulkLabelRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Generate multiple barcode labels on a single sheet

    Args:
        request: Bulk label parameters
        db: Database session
        current_user: Current authenticated user

    Returns:
        PNG image of label sheet
    """
    try:
        # Fetch items
        items_data = []
        for item_id in request.item_ids:
            result = await db.execute(
                select(Item)
                .where(Item.id == item_id)
                .where(Item.tenant_id == current_user.tenant_id)
            )
            item = result.scalar_one_or_none()

            if item:
                # Get holding and instance for title
                holding_result = await db.execute(
                    select(Holding).where(Holding.id == item.holding_id)
                )
                holding = holding_result.scalar_one_or_none()

                title = "Untitled"
                location_name = None

                if holding:
                    instance_result = await db.execute(
                        select(Instance).where(Instance.id == holding.instance_id)
                    )
                    instance = instance_result.scalar_one_or_none()
                    if instance:
                        title = instance.title

                    # Get location
                    if item.effective_location_id:
                        location_result = await db.execute(
                            select(Location).where(Location.id == item.effective_location_id)
                        )
                        location = location_result.scalar_one_or_none()
                        if location:
                            location_name = location.name

                items_data.append({
                    "barcode": item.barcode,
                    "title": title,
                    "location": location_name
                })

        if not items_data:
            raise HTTPException(status_code=404, detail="No items found")

        # Generate bulk labels
        sheet_bytes = barcode_service.generate_bulk_labels(
            items=items_data,
            format=request.format
        )

        return StreamingResponse(
            io.BytesIO(sheet_bytes),
            media_type="image/png",
            headers={
                "Content-Disposition": "attachment; filename=labels_sheet.png"
            }
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating bulk labels: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate bulk labels")


@router.get("/image/{barcode}")
async def get_barcode_image(
    barcode: str,
    format: BarcodeFormat = Query("code128", description="Barcode format"),
    width: int = Query(300, description="Image width"),
    height: int = Query(100, description="Image height"),
    current_user: User = Depends(get_current_user)
):
    """
    Get barcode as image

    Args:
        barcode: Barcode data
        format: Image format
        width: Image width
        height: Image height
        current_user: Current authenticated user

    Returns:
        PNG image
    """
    try:
        if format == "qr":
            image_bytes = barcode_service.generate_qr_code_image(barcode, size=min(width, height))
        else:
            image_bytes = barcode_service.generate_code128_image(barcode, width, height)

        return StreamingResponse(
            io.BytesIO(image_bytes),
            media_type="image/png"
        )

    except Exception as e:
        logger.error(f"Error generating barcode image: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate barcode image")
