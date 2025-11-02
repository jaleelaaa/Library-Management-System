"""
Initialize database with seed data.
"""

import json
import asyncio
from pathlib import Path
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import AsyncSessionLocal
from app.models.tenant import Tenant
from app.models.user import User, PatronGroup
from app.models.inventory import Instance, Holding, Item, Location, Library
from app.models.permission import Role, Permission
from app.core.security import get_password_hash
import uuid


async def load_seed_data():
    """Load seed data from JSON files."""
    async with AsyncSessionLocal() as db:
        # Check if default tenant already exists
        from sqlalchemy import select
        result = await db.execute(select(Tenant).where(Tenant.code == "default"))
        default_tenant = result.scalar_one_or_none()

        if default_tenant is None:
            # Create default tenant
            default_tenant = Tenant(
                id=uuid.uuid4(),
                name="Default Tenant",
                code="default",
                active=True,
            )
            db.add(default_tenant)
            await db.commit()
            print("✅ Default tenant created")
        else:
            print("ℹ️  Default tenant already exists")

        # Import and run comprehensive role seeding
        from app.db.seed_roles import seed_roles_and_permissions
        print("\n" + "=" * 70)
        print("INITIALIZING RBAC SYSTEM")
        print("=" * 70)
        await seed_roles_and_permissions(db, default_tenant.id)

        # Check if patron groups exist
        result = await db.execute(select(PatronGroup).where(PatronGroup.tenant_id == default_tenant.id))
        existing_groups = result.scalars().all()

        if not existing_groups:
            # Create patron groups
            patron_groups = [
                PatronGroup(
                    id=uuid.uuid4(),
                    group_name="Undergraduate",
                    description="Undergraduate students",
                    loan_period_days="14",
                    renewals_allowed=True,
                    tenant_id=default_tenant.id,
                ),
                PatronGroup(
                    id=uuid.uuid4(),
                    group_name="Graduate",
                    description="Graduate students",
                    loan_period_days="28",
                    renewals_allowed=True,
                    tenant_id=default_tenant.id,
                ),
                PatronGroup(
                    id=uuid.uuid4(),
                    group_name="Faculty",
                    description="Faculty members",
                    loan_period_days="90",
                    renewals_allowed=True,
                    tenant_id=default_tenant.id,
                ),
            ]
            db.add_all(patron_groups)
            await db.commit()
            print("✅ Patron groups created")
        else:
            print("ℹ️  Patron groups already exist")

        # Check if admin user exists
        result = await db.execute(select(User).where(User.username == "admin"))
        admin_user = result.scalar_one_or_none()

        if admin_user is None:
            # Create admin user
            admin_user = User(
                id=uuid.uuid4(),
                username="admin",
                email="admin@default.folio",
                hashed_password=get_password_hash("Admin@123"),
                active=True,
                user_type="staff",
                tenant_id=default_tenant.id,
                personal={
                    "firstName": "Admin",
                    "lastName": "User",
                    "email": "admin@default.folio",
                },
            )
            db.add(admin_user)
            await db.commit()
            print("✅ Admin user created")
        else:
            print("ℹ️  Admin user already exists")

        # Create a test patron user
        result = await db.execute(select(User).where(User.username == "patron"))
        patron_user = result.scalar_one_or_none()

        if patron_user is None:
            # Get undergraduate patron group
            result = await db.execute(select(PatronGroup).where(PatronGroup.group_name == "Undergraduate", PatronGroup.tenant_id == default_tenant.id))
            undergrad_group = result.scalar_one_or_none()

            patron_user = User(
                id=uuid.uuid4(),
                username="patron",
                email="patron@default.folio",
                hashed_password=get_password_hash("Patron@123"),
                active=True,
                user_type="patron",
                tenant_id=default_tenant.id,
                patron_group_id=undergrad_group.id if undergrad_group else None,
                personal={
                    "firstName": "Test",
                    "lastName": "Patron",
                    "email": "patron@default.folio",
                },
            )

            db.add(patron_user)
            await db.commit()
            print("✅ Test patron user created")
        else:
            print("ℹ️  Test patron user already exists")

        # Note: Role assignments are handled by seed_roles_and_permissions()

        # Check if library exists
        result = await db.execute(select(Library).where(Library.code == "MAIN"))
        library = result.scalar_one_or_none()

        if library is None:
            # Create library
            library = Library(
                id=uuid.uuid4(),
                name="Main Library",
                code="MAIN",
                tenant_id=default_tenant.id,
            )
            db.add(library)
            await db.commit()
            print("✅ Main library created")
        else:
            print("ℹ️  Main library already exists")

        # Check if location exists
        result = await db.execute(select(Location).where(Location.code == "MAIN-STACKS"))
        location = result.scalar_one_or_none()

        if location is None:
            # Create location
            location = Location(
                id=uuid.uuid4(),
                name="Main Stacks",
                code="MAIN-STACKS",
                library_id=library.id,
                tenant_id=default_tenant.id,
            )
            db.add(location)
            await db.commit()
            print("✅ Main stacks location created")
        else:
            print("ℹ️  Main stacks location already exists")

        # Load instances from seed data
        seed_file = Path(__file__).parent.parent.parent / "seed_data" / "instances.json"
        if seed_file.exists():
            with open(seed_file) as f:
                instances_data = json.load(f)
                instances_to_add = []
                for inst_data in instances_data[:5]:  # Load first 5
                    instance_id = uuid.UUID(inst_data["id"])
                    # Check if instance already exists
                    result = await db.execute(select(Instance).where(Instance.id == instance_id))
                    existing_instance = result.scalar_one_or_none()

                    if existing_instance is None:
                        instance = Instance(
                            id=instance_id,
                            title=inst_data["title"],
                            subtitle=inst_data.get("subtitle"),
                            instance_type=inst_data["instance_type"],
                            identifiers=inst_data.get("identifiers", []),
                            contributors=inst_data.get("contributors", []),
                            publication=inst_data.get("publication", []),
                            subjects=inst_data.get("subjects", []),
                            languages=inst_data.get("languages", []),
                            tenant_id=default_tenant.id,
                        )
                        instances_to_add.append(instance)

                if instances_to_add:
                    db.add_all(instances_to_add)
                    await db.commit()
                    print(f"✅ {len(instances_to_add)} instances loaded from seed data")
                else:
                    print("ℹ️  All instances from seed data already exist")
        else:
            print("ℹ️  No seed data file found")

        print("✅ Seed data loaded successfully!")


if __name__ == "__main__":
    asyncio.run(load_seed_data())
