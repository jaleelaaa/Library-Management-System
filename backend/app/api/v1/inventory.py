"""
Inventory API endpoints.
"""

from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from app.db.session import get_db
from app.core.deps import get_current_user, get_current_tenant, require_permission
from app.models.user import User
from app.models.inventory import Instance, Holding, Item, Location, Library
from app.schemas.inventory import (
    InstanceCreate,
    InstanceUpdate,
    InstanceResponse,
    InstanceList,
    HoldingCreate,
    HoldingUpdate,
    HoldingResponse,
    ItemCreate,
    ItemUpdate,
    ItemResponse,
    LocationCreate,
    LocationUpdate,
    LocationResponse,
    LibraryCreate,
    LibraryUpdate,
    LibraryResponse,
)
from app.schemas.common import PaginatedResponse
from app.utils.pagination import paginate

router = APIRouter()


@router.get("/instances", response_model=PaginatedResponse[InstanceResponse])
async def list_instances(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    q: Optional[str] = Query(None, description="Search query"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("inventory.read")),
):
    """List instances with pagination and search."""
    query = select(Instance)

    # Apply search filter
    if q:
        query = query.where(
            or_(
                Instance.title.ilike(f"%{q}%"),
                Instance.subtitle.ilike(f"%{q}%"),
            )
        )

    # Paginate
    result = await paginate(db, query, page, page_size)
    return result


@router.post("/instances", response_model=InstanceResponse, status_code=status.HTTP_201_CREATED)
async def create_instance(
    instance_in: InstanceCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("inventory.create")),
):
    """Create a new instance."""
    try:
        instance = Instance(
            **instance_in.model_dump(),
            tenant_id=current_user.tenant_id,
            created_by_user_id=current_user.id,
        )
        db.add(instance)
        await db.commit()
        await db.refresh(instance)
        return instance
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Invalid data: {str(e)}",
        )


@router.get("/instances/{instance_id}", response_model=InstanceResponse)
async def get_instance(
    instance_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("inventory.read")),
):
    """Get instance by ID."""
    result = await db.execute(
        select(Instance).where(Instance.id == instance_id)
    )
    instance = result.scalar_one_or_none()

    if not instance:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Instance not found",
        )

    return instance


@router.put("/instances/{instance_id}", response_model=InstanceResponse)
@router.patch("/instances/{instance_id}", response_model=InstanceResponse)
async def update_instance(
    instance_id: UUID,
    instance_in: InstanceUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("inventory.update")),
):
    """Update an instance (supports both PUT and PATCH)."""
    result = await db.execute(
        select(Instance).where(Instance.id == instance_id)
    )
    instance = result.scalar_one_or_none()

    if not instance:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Instance not found",
        )

    try:
        # Update fields
        for field, value in instance_in.model_dump(exclude_unset=True).items():
            setattr(instance, field, value)

        instance.updated_by_user_id = current_user.id
        await db.commit()
        await db.refresh(instance)
        return instance
    except ValueError as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Invalid data: {str(e)}",
        )


@router.delete("/instances/{instance_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_instance(
    instance_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("inventory.delete")),
):
    """Delete an instance."""
    result = await db.execute(
        select(Instance).where(Instance.id == instance_id)
    )
    instance = result.scalar_one_or_none()

    if not instance:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Instance not found",
        )

    await db.delete(instance)
    await db.commit()


# Bulk operations
@router.post("/instances/bulk", response_model=List[InstanceResponse])
async def bulk_create_instances(
    instances_in: List[InstanceCreate],
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("inventory.create")),
):
    """Bulk create instances."""
    instances = [
        Instance(
            **inst.model_dump(),
            tenant_id=current_user.tenant_id,
            created_by_user_id=current_user.id,
        )
        for inst in instances_in
    ]
    db.add_all(instances)
    await db.commit()

    for instance in instances:
        await db.refresh(instance)

    return instances


# ===========================
# Holdings Endpoints
# ===========================

@router.get("/holdings", response_model=PaginatedResponse[HoldingResponse])
async def list_holdings(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    instance_id: Optional[UUID] = Query(None, description="Filter by instance ID"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("inventory.read")),
):
    """List holdings with pagination and filters."""
    query = select(Holding)

    if instance_id:
        query = query.where(Holding.instance_id == instance_id)

    result = await paginate(db, query, page, page_size)
    return result


@router.post("/holdings", response_model=HoldingResponse, status_code=status.HTTP_201_CREATED)
async def create_holding(
    holding_in: HoldingCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("inventory.create")),
):
    """Create a new holding."""
    # Verify instance exists
    result = await db.execute(
        select(Instance).where(Instance.id == holding_in.instance_id)
    )
    if not result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Instance not found",
        )

    holding = Holding(
        **holding_in.model_dump(),
        tenant_id=current_user.tenant_id,
        created_by_user_id=current_user.id,
    )
    db.add(holding)
    await db.commit()
    await db.refresh(holding)
    return holding


@router.get("/holdings/{holding_id}", response_model=HoldingResponse)
async def get_holding(
    holding_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("inventory.read")),
):
    """Get holding by ID."""
    result = await db.execute(
        select(Holding).where(Holding.id == holding_id)
    )
    holding = result.scalar_one_or_none()

    if not holding:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Holding not found",
        )

    return holding


@router.put("/holdings/{holding_id}", response_model=HoldingResponse)
async def update_holding(
    holding_id: UUID,
    holding_in: HoldingUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("inventory.update")),
):
    """Update a holding."""
    result = await db.execute(
        select(Holding).where(Holding.id == holding_id)
    )
    holding = result.scalar_one_or_none()

    if not holding:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Holding not found",
        )

    for field, value in holding_in.model_dump(exclude_unset=True).items():
        setattr(holding, field, value)

    holding.updated_by_user_id = current_user.id
    await db.commit()
    await db.refresh(holding)
    return holding


@router.delete("/holdings/{holding_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_holding(
    holding_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("inventory.delete")),
):
    """Delete a holding."""
    result = await db.execute(
        select(Holding).where(Holding.id == holding_id)
    )
    holding = result.scalar_one_or_none()

    if not holding:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Holding not found",
        )

    await db.delete(holding)
    await db.commit()


# ===========================
# Items Endpoints
# ===========================

@router.get("/items", response_model=PaginatedResponse[ItemResponse])
async def list_items(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    holding_id: Optional[UUID] = Query(None, description="Filter by holding ID"),
    barcode: Optional[str] = Query(None, description="Filter by barcode"),
    status: Optional[str] = Query(None, description="Filter by status"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("inventory.read")),
):
    """List items with pagination and filters."""
    query = select(Item)

    if holding_id:
        query = query.where(Item.holding_id == holding_id)
    if barcode:
        query = query.where(Item.barcode.ilike(f"%{barcode}%"))
    if status:
        query = query.where(Item.status == status)

    result = await paginate(db, query, page, page_size)
    return result


@router.post("/items", response_model=ItemResponse, status_code=status.HTTP_201_CREATED)
async def create_item(
    item_in: ItemCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("inventory.create")),
):
    """Create a new item."""
    # Verify holding exists
    result = await db.execute(
        select(Holding).where(Holding.id == item_in.holding_id)
    )
    if not result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Holding not found",
        )

    # Check barcode uniqueness if provided
    if item_in.barcode:
        result = await db.execute(
            select(Item).where(Item.barcode == item_in.barcode)
        )
        if result.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Barcode already exists",
            )

    item = Item(
        **item_in.model_dump(),
        tenant_id=current_user.tenant_id,
        created_by_user_id=current_user.id,
    )
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return item


@router.get("/items/{item_id}", response_model=ItemResponse)
async def get_item(
    item_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("inventory.read")),
):
    """Get item by ID."""
    result = await db.execute(
        select(Item).where(Item.id == item_id)
    )
    item = result.scalar_one_or_none()

    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found",
        )

    return item


@router.get("/items/barcode/{barcode}", response_model=ItemResponse)
async def get_item_by_barcode(
    barcode: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("inventory.read")),
):
    """Get item by barcode."""
    result = await db.execute(
        select(Item).where(Item.barcode == barcode)
    )
    item = result.scalar_one_or_none()

    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found",
        )

    return item


@router.put("/items/{item_id}", response_model=ItemResponse)
async def update_item(
    item_id: UUID,
    item_in: ItemUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("inventory.update")),
):
    """Update an item."""
    result = await db.execute(
        select(Item).where(Item.id == item_id)
    )
    item = result.scalar_one_or_none()

    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found",
        )

    # Check barcode uniqueness if being updated
    if item_in.barcode and item_in.barcode != item.barcode:
        result = await db.execute(
            select(Item).where(Item.barcode == item_in.barcode)
        )
        if result.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Barcode already exists",
            )

    for field, value in item_in.model_dump(exclude_unset=True).items():
        setattr(item, field, value)

    item.updated_by_user_id = current_user.id
    await db.commit()
    await db.refresh(item)
    return item


@router.delete("/items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_item(
    item_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("inventory.delete")),
):
    """Delete an item."""
    result = await db.execute(
        select(Item).where(Item.id == item_id)
    )
    item = result.scalar_one_or_none()

    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found",
        )

    await db.delete(item)
    await db.commit()


@router.post("/items/bulk-import", response_model=dict, status_code=status.HTTP_201_CREATED)
async def bulk_import_items(
    items_data: List[ItemCreate],
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("inventory.create")),
    tenant_id: str = Depends(get_current_tenant),
):
    """
    Bulk import items (BUG-010 FIX).

    Validates all items before importing to prevent duplicates.
    Returns detailed report of success/failures.
    """
    from app.schemas.common import ErrorResponse

    success_count = 0
    failure_count = 0
    errors = []
    imported_ids = []

    # First pass: Validate all barcodes for duplicates
    barcodes_in_batch = [item.barcode for item in items_data if item.barcode]

    # Check for duplicates within the import batch
    duplicate_barcodes = set([bc for bc in barcodes_in_batch if barcodes_in_batch.count(bc) > 1])
    if duplicate_barcodes:
        return {
            "success_count": 0,
            "failure_count": len(items_data),
            "errors": [{
                "code": "DUPLICATE_IN_BATCH",
                "message": f"Duplicate barcodes found in import file: {', '.join(duplicate_barcodes)}",
                "details": {"barcodes": list(duplicate_barcodes)}
            }],
            "imported_ids": []
        }

    # Check for duplicates against existing database records
    if barcodes_in_batch:
        existing_result = await db.execute(
            select(Item.barcode).where(
                and_(
                    Item.barcode.in_(barcodes_in_batch),
                    Item.tenant_id == UUID(tenant_id)
                )
            )
        )
        existing_barcodes = set([row[0] for row in existing_result])
        if existing_barcodes:
            return {
                "success_count": 0,
                "failure_count": len(items_data),
                "errors": [{
                    "code": "DUPLICATE_IN_DATABASE",
                    "message": f"Barcodes already exist in database: {', '.join(existing_barcodes)}",
                    "details": {"barcodes": list(existing_barcodes)}
                }],
                "imported_ids": []
            }

    # Second pass: Import all items
    for idx, item_data in enumerate(items_data):
        try:
            # Verify holding exists
            holding = await db.get(Holding, item_data.holding_id)
            if not holding:
                errors.append({
                    "code": "INVALID_HOLDING",
                    "message": f"Item at index {idx}: holding_id not found",
                    "details": {"index": idx, "holding_id": str(item_data.holding_id)}
                })
                failure_count += 1
                continue

            # Create item
            item_dict = item_data.model_dump(exclude={'electronic_access', 'notes'})
            item_dict['tenant_id'] = UUID(tenant_id)

            new_item = Item(**item_dict)

            # Add electronic access
            if item_data.electronic_access:
                from app.models.inventory import ElectronicAccess
                for ea_data in item_data.electronic_access:
                    ea = ElectronicAccess(**ea_data.model_dump(), item_id=new_item.id)
                    new_item.electronic_access.append(ea)

            # Add notes
            if item_data.notes:
                from app.models.inventory import ItemNote
                for note_data in item_data.notes:
                    note = ItemNote(**note_data.model_dump(), item_id=new_item.id)
                    new_item.notes.append(note)

            db.add(new_item)
            await db.flush()

            imported_ids.append(str(new_item.id))
            success_count += 1

        except Exception as e:
            errors.append({
                "code": "IMPORT_ERROR",
                "message": f"Item at index {idx}: {str(e)}",
                "details": {"index": idx, "error": str(e)}
            })
            failure_count += 1

    await db.commit()

    # Log audit
    from app.services.audit_service import AuditService
    await AuditService.log_action(
        db=db,
        actor=current_user.id,
        action="BULK_IMPORT",
        target="items",
        resource_type="inventory",
        details={"success_count": success_count, "failure_count": failure_count},
        tenant_id=UUID(tenant_id),
    )

    return {
        "success_count": success_count,
        "failure_count": failure_count,
        "errors": errors,
        "imported_ids": imported_ids,
        "message": f"Bulk import completed: {success_count} succeeded, {failure_count} failed"
    }


# ===========================
# Locations Endpoints
# ===========================

@router.get("/locations", response_model=PaginatedResponse[LocationResponse])
async def list_locations(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    library_id: Optional[UUID] = Query(None, description="Filter by library ID"),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("inventory.read")),
):
    """List locations with pagination and filters."""
    query = select(Location)

    if library_id:
        query = query.where(Location.library_id == library_id)
    if is_active is not None:
        query = query.where(Location.is_active == is_active)

    result = await paginate(db, query, page, page_size)
    return result


@router.post("/locations", response_model=LocationResponse, status_code=status.HTTP_201_CREATED)
async def create_location(
    location_in: LocationCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("inventory.create")),
):
    """Create a new location."""
    # Check code uniqueness
    result = await db.execute(
        select(Location).where(Location.code == location_in.code)
    )
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Location code already exists",
        )

    location = Location(
        **location_in.model_dump(),
        tenant_id=current_user.tenant_id,
    )
    db.add(location)
    await db.commit()
    await db.refresh(location)
    return location


@router.get("/locations/{location_id}", response_model=LocationResponse)
async def get_location(
    location_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("inventory.read")),
):
    """Get location by ID."""
    result = await db.execute(
        select(Location).where(Location.id == location_id)
    )
    location = result.scalar_one_or_none()

    if not location:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Location not found",
        )

    return location


@router.put("/locations/{location_id}", response_model=LocationResponse)
async def update_location(
    location_id: UUID,
    location_in: LocationUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("inventory.update")),
):
    """Update a location."""
    result = await db.execute(
        select(Location).where(Location.id == location_id)
    )
    location = result.scalar_one_or_none()

    if not location:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Location not found",
        )

    for field, value in location_in.model_dump(exclude_unset=True).items():
        setattr(location, field, value)

    await db.commit()
    await db.refresh(location)
    return location


@router.delete("/locations/{location_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_location(
    location_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("inventory.delete")),
):
    """Delete a location."""
    result = await db.execute(
        select(Location).where(Location.id == location_id)
    )
    location = result.scalar_one_or_none()

    if not location:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Location not found",
        )

    await db.delete(location)
    await db.commit()


# ===========================
# Libraries Endpoints
# ===========================

@router.get("/libraries", response_model=PaginatedResponse[LibraryResponse])
async def list_libraries(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("inventory.read")),
):
    """List libraries with pagination."""
    query = select(Library)
    result = await paginate(db, query, page, page_size)
    return result


@router.post("/libraries", response_model=LibraryResponse, status_code=status.HTTP_201_CREATED)
async def create_library(
    library_in: LibraryCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("inventory.create")),
):
    """Create a new library."""
    # Check code uniqueness
    result = await db.execute(
        select(Library).where(Library.code == library_in.code)
    )
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Library code already exists",
        )

    library = Library(
        **library_in.model_dump(),
        tenant_id=current_user.tenant_id,
    )
    db.add(library)
    await db.commit()
    await db.refresh(library)
    return library


@router.get("/libraries/{library_id}", response_model=LibraryResponse)
async def get_library(
    library_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("inventory.read")),
):
    """Get library by ID."""
    result = await db.execute(
        select(Library).where(Library.id == library_id)
    )
    library = result.scalar_one_or_none()

    if not library:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Library not found",
        )

    return library


@router.put("/libraries/{library_id}", response_model=LibraryResponse)
async def update_library(
    library_id: UUID,
    library_in: LibraryUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("inventory.update")),
):
    """Update a library."""
    result = await db.execute(
        select(Library).where(Library.id == library_id)
    )
    library = result.scalar_one_or_none()

    if not library:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Library not found",
        )

    for field, value in library_in.model_dump(exclude_unset=True).items():
        setattr(library, field, value)

    await db.commit()
    await db.refresh(library)
    return library


@router.delete("/libraries/{library_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_library(
    library_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("inventory.delete")),
):
    """Delete a library."""
    result = await db.execute(
        select(Library).where(Library.id == library_id)
    )
    library = result.scalar_one_or_none()

    if not library:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Library not found",
        )

    await db.delete(library)
    await db.commit()
