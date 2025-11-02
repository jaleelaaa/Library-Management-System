"""
Command-line interface for FOLIO LMS management tasks.
"""

import asyncio
import typer
from rich.console import Console
from rich.table import Table
from sqlalchemy import select

app = typer.Typer(help="FOLIO LMS Management CLI")
console = Console()


@app.command()
def seed_roles():
    """
    Seed roles and permissions into the database.

    This command creates default roles (Administrator, Librarian, Circulation Staff,
    Cataloger, Patron) with their appropriate permissions.

    This is idempotent - can be run multiple times safely.
    """
    from app.db.session import AsyncSessionLocal
    from app.db.seed_roles import seed_roles_and_permissions

    async def run_seed():
        async with AsyncSessionLocal() as db:
            await seed_roles_and_permissions(db)

    console.print("\n[bold cyan]FOLIO LMS - Seed Roles and Permissions[/bold cyan]")
    console.print("=" * 70)

    try:
        asyncio.run(run_seed())
        console.print("\n[bold green]✅ Success![/bold green]")
    except Exception as e:
        console.print(f"\n[bold red]❌ Error: {e}[/bold red]")
        raise typer.Exit(code=1)


@app.command()
def list_roles():
    """
    List all roles and their permission counts.
    """
    from app.db.session import AsyncSessionLocal
    from app.models.permission import Role

    async def run_list():
        async with AsyncSessionLocal() as db:
            result = await db.execute(select(Role))
            roles = result.scalars().all()

            if not roles:
                console.print("[yellow]No roles found in database.[/yellow]")
                return

            table = Table(title="Roles in Database", show_header=True, header_style="bold cyan")
            table.add_column("Name", style="green")
            table.add_column("Display Name", style="white")
            table.add_column("Permissions", style="yellow")
            table.add_column("System Role", style="magenta")
            table.add_column("Description", style="dim")

            for role in roles:
                table.add_row(
                    role.name,
                    role.display_name,
                    str(len(role.permissions)),
                    "✓" if role.is_system else "",
                    role.description or ""
                )

            console.print()
            console.print(table)
            console.print()

    console.print("\n[bold cyan]FOLIO LMS - List Roles[/bold cyan]")
    console.print("=" * 70)

    try:
        asyncio.run(run_list())
    except Exception as e:
        console.print(f"\n[bold red]❌ Error: {e}[/bold red]")
        raise typer.Exit(code=1)


@app.command()
def list_permissions():
    """
    List all permissions in the system.
    """
    from app.db.session import AsyncSessionLocal
    from app.models.permission import Permission

    async def run_list():
        async with AsyncSessionLocal() as db:
            result = await db.execute(select(Permission).order_by(Permission.resource, Permission.action))
            permissions = result.scalars().all()

            if not permissions:
                console.print("[yellow]No permissions found in database.[/yellow]")
                return

            table = Table(title="Permissions in Database", show_header=True, header_style="bold cyan")
            table.add_column("Name", style="green")
            table.add_column("Resource", style="cyan")
            table.add_column("Action", style="yellow")
            table.add_column("Display Name", style="white")

            for perm in permissions:
                table.add_row(
                    perm.name,
                    perm.resource,
                    perm.action,
                    perm.display_name
                )

            console.print()
            console.print(table)
            console.print(f"\n[bold]Total:[/bold] {len(permissions)} permissions")
            console.print()

    console.print("\n[bold cyan]FOLIO LMS - List Permissions[/bold cyan]")
    console.print("=" * 70)

    try:
        asyncio.run(run_list())
    except Exception as e:
        console.print(f"\n[bold red]❌ Error: {e}[/bold red]")
        raise typer.Exit(code=1)


@app.command()
def show_role(role_name: str):
    """
    Show detailed information about a specific role including all its permissions.

    Args:
        role_name: Name of the role to display (e.g., 'administrator', 'librarian')
    """
    from app.db.session import AsyncSessionLocal
    from app.models.permission import Role

    async def run_show():
        async with AsyncSessionLocal() as db:
            result = await db.execute(select(Role).where(Role.name == role_name))
            role = result.scalar_one_or_none()

            if not role:
                console.print(f"[bold red]Role '{role_name}' not found.[/bold red]")
                return

            console.print()
            console.print(f"[bold cyan]Role:[/bold cyan] {role.display_name}")
            console.print(f"[bold cyan]Name:[/bold cyan] {role.name}")
            console.print(f"[bold cyan]Description:[/bold cyan] {role.description or 'N/A'}")
            console.print(f"[bold cyan]System Role:[/bold cyan] {'Yes' if role.is_system else 'No'}")
            console.print(f"[bold cyan]Permissions:[/bold cyan] {len(role.permissions)}")
            console.print()

            if role.permissions:
                table = Table(show_header=True, header_style="bold yellow")
                table.add_column("Permission Name", style="green")
                table.add_column("Resource", style="cyan")
                table.add_column("Action", style="yellow")
                table.add_column("Display Name", style="white")

                for perm in sorted(role.permissions, key=lambda p: (p.resource, p.action)):
                    table.add_row(
                        perm.name,
                        perm.resource,
                        perm.action,
                        perm.display_name
                    )

                console.print(table)
                console.print()

    console.print("\n[bold cyan]FOLIO LMS - Role Details[/bold cyan]")
    console.print("=" * 70)

    try:
        asyncio.run(run_show())
    except Exception as e:
        console.print(f"\n[bold red]❌ Error: {e}[/bold red]")
        raise typer.Exit(code=1)


@app.command()
def init_db():
    """
    Initialize database with seed data (tenants, users, roles, permissions, etc.).
    """
    from app.db.init_db import load_seed_data

    console.print("\n[bold cyan]FOLIO LMS - Initialize Database[/bold cyan]")
    console.print("=" * 70)
    console.print()

    try:
        asyncio.run(load_seed_data())
        console.print("\n[bold green]✅ Database initialized successfully![/bold green]")
    except Exception as e:
        console.print(f"\n[bold red]❌ Error: {e}[/bold red]")
        raise typer.Exit(code=1)


@app.command()
def verify_rbac():
    """
    Verify that RBAC system is properly configured.

    Checks:
    - All required roles exist
    - All required permissions exist
    - Roles have appropriate permissions assigned
    """
    from app.db.session import AsyncSessionLocal
    from app.models.permission import Role, Permission
    from app.db.seed_roles import ROLE_PERMISSIONS

    async def run_verify():
        async with AsyncSessionLocal() as db:
            # Check roles
            result = await db.execute(select(Role))
            roles = {r.name: r for r in result.scalars().all()}

            # Check permissions
            result = await db.execute(select(Permission))
            permissions = {p.name: p for p in result.scalars().all()}

            console.print("\n[bold]Verification Results:[/bold]")
            console.print("-" * 70)

            # Verify roles
            required_roles = set(ROLE_PERMISSIONS.keys())
            existing_roles = set(roles.keys())

            if required_roles == existing_roles:
                console.print(f"[green]✓[/green] All {len(required_roles)} required roles exist")
            else:
                missing = required_roles - existing_roles
                if missing:
                    console.print(f"[red]✗[/red] Missing roles: {', '.join(missing)}")
                extra = existing_roles - required_roles
                if extra:
                    console.print(f"[yellow]⚠[/yellow] Extra roles: {', '.join(extra)}")

            # Verify each role has correct permissions
            console.print()
            for role_name, role_config in ROLE_PERMISSIONS.items():
                if role_name not in roles:
                    continue

                role = roles[role_name]
                expected_perms = set(role_config["permissions"])
                actual_perms = {p.name for p in role.permissions}

                if expected_perms == actual_perms:
                    console.print(f"[green]✓[/green] {role.display_name:30} {len(actual_perms):3} permissions")
                else:
                    missing = expected_perms - actual_perms
                    extra = actual_perms - expected_perms

                    console.print(f"[red]✗[/red] {role.display_name:30} has issues:")
                    if missing:
                        console.print(f"    Missing: {', '.join(list(missing)[:5])}")
                    if extra:
                        console.print(f"    Extra: {', '.join(list(extra)[:5])}")

            console.print("-" * 70)
            console.print(f"\n[bold]Summary:[/bold]")
            console.print(f"  Roles: {len(roles)}")
            console.print(f"  Permissions: {len(permissions)}")
            console.print()

    console.print("\n[bold cyan]FOLIO LMS - Verify RBAC Configuration[/bold cyan]")
    console.print("=" * 70)

    try:
        asyncio.run(run_verify())
    except Exception as e:
        console.print(f"\n[bold red]❌ Error: {e}[/bold red]")
        raise typer.Exit(code=1)


if __name__ == "__main__":
    app()
