"""
API Endpoint Validation Script
Compares documented API endpoints with actual FastAPI implementation
"""
import sys
from pathlib import Path
from typing import Dict, List, Set
import json

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.main import app
from fastapi.routing import APIRoute


def get_implemented_routes() -> Dict[str, List[str]]:
    """Extract all routes from FastAPI app"""
    routes = {}

    for route in app.routes:
        if isinstance(route, APIRoute):
            path = route.path
            methods = list(route.methods)

            for method in methods:
                if method not in ["HEAD", "OPTIONS"]:  # Skip HTTP meta methods
                    route_key = f"{method} {path}"
                    routes[route_key] = {
                        "path": path,
                        "method": method,
                        "name": route.name,
                        "tags": list(route.tags) if route.tags else [],
                        "summary": route.summary,
                    }

    return routes


def get_documented_routes() -> Dict[str, str]:
    """
    Documented API routes from ARCHITECTURE.md and API specifications
    This should be updated as you document more endpoints
    """
    documented = {
        # Auth endpoints
        "POST /api/v1/auth/login": "User login with credentials",
        "POST /api/v1/auth/refresh": "Refresh access token",
        "GET /api/v1/auth/me": "Get current user profile",

        # User endpoints
        "GET /api/v1/users": "List all users with pagination",
        "POST /api/v1/users": "Create new user",
        "GET /api/v1/users/{user_id}": "Get user by ID",
        "PATCH /api/v1/users/{user_id}": "Update user",
        "DELETE /api/v1/users/{user_id}": "Delete user",

        # Inventory endpoints
        "GET /api/v1/inventory/instances": "List catalog instances",
        "POST /api/v1/inventory/instances": "Create catalog instance",
        "GET /api/v1/inventory/instances/{instance_id}": "Get instance by ID",
        "PATCH /api/v1/inventory/instances/{instance_id}": "Update instance",
        "DELETE /api/v1/inventory/instances/{instance_id}": "Delete instance",

        # Circulation endpoints
        "GET /api/v1/circulation/loans": "List loans",
        "POST /api/v1/circulation/checkout": "Checkout item",
        "POST /api/v1/circulation/checkin": "Checkin item",
        "POST /api/v1/circulation/renew": "Renew loan",

        # Reports endpoints
        "GET /api/v1/reports/dashboard-stats": "Get dashboard statistics",
        "POST /api/v1/reports/circulation": "Generate circulation report",
        "POST /api/v1/reports/collection": "Generate collection report",

        # Add more as documented...
    }

    return documented


def validate_endpoints():
    """Main validation function"""
    print("=" * 80)
    print("API ENDPOINT VALIDATION REPORT")
    print("=" * 80)
    print()

    implemented = get_implemented_routes()
    documented = get_documented_routes()

    implemented_keys = set(implemented.keys())
    documented_keys = set(documented.keys())

    # Endpoints that exist in both
    matching = implemented_keys & documented_keys

    # Endpoints implemented but not documented
    undocumented = implemented_keys - documented_keys

    # Endpoints documented but not implemented
    missing = documented_keys - implemented_keys

    print(f"📊 SUMMARY")
    print(f"{'─' * 80}")
    print(f"✅ Documented Endpoints:    {len(documented)}")
    print(f"✅ Implemented Endpoints:   {len(implemented)}")
    print(f"✅ Matching:                {len(matching)} ({len(matching)/len(documented)*100:.1f}%)")
    print(f"⚠️  Undocumented:            {len(undocumented)}")
    print(f"❌ Missing Implementation:  {len(missing)}")
    print()

    # Matching endpoints
    if matching:
        print(f"✅ MATCHING ENDPOINTS ({len(matching)})")
        print(f"{'─' * 80}")
        for route in sorted(matching):
            method, path = route.split(" ", 1)
            print(f"  [{method:6}] {path}")
        print()

    # Undocumented endpoints (implemented but not in docs)
    if undocumented:
        print(f"⚠️  UNDOCUMENTED ENDPOINTS ({len(undocumented)})")
        print(f"{'─' * 80}")
        print("These endpoints are implemented but not documented:")
        for route in sorted(undocumented):
            method, path = route.split(" ", 1)
            tags = implemented[route].get('tags', [])
            tags_str = f" [{', '.join(tags)}]" if tags else ""
            print(f"  [{method:6}] {path}{tags_str}")
        print()
        print("⚡ ACTION: Add these to API documentation")
        print()

    # Missing endpoints (documented but not implemented)
    if missing:
        print(f"❌ MISSING IMPLEMENTATIONS ({len(missing)})")
        print(f"{'─' * 80}")
        print("These endpoints are documented but not implemented:")
        for route in sorted(missing):
            method, path = route.split(" ", 1)
            desc = documented[route]
            print(f"  [{method:6}] {path}")
            print(f"           → {desc}")
        print()
        print("⚡ ACTION: Implement these endpoints or remove from docs")
        print()

    # Validation status
    print("=" * 80)
    if not missing and not undocumented:
        print("✅ VALIDATION PASSED: All documented endpoints are implemented!")
        print("✅ All implemented endpoints are documented!")
        return 0
    else:
        print("⚠️  VALIDATION FAILED: Discrepancies found between docs and implementation")
        if missing:
            print(f"   - {len(missing)} documented endpoints not implemented")
        if undocumented:
            print(f"   - {len(undocumented)} implemented endpoints not documented")
        return 1


def export_report(filename: str = "api_validation_report.json"):
    """Export validation report as JSON"""
    implemented = get_implemented_routes()
    documented = get_documented_routes()

    report = {
        "timestamp": str(Path(__file__).stat().st_mtime),
        "summary": {
            "documented": len(documented),
            "implemented": len(implemented),
            "matching": len(set(implemented.keys()) & set(documented.keys())),
            "undocumented": len(set(implemented.keys()) - set(documented.keys())),
            "missing": len(set(documented.keys()) - set(implemented.keys())),
        },
        "details": {
            "matching": list(set(implemented.keys()) & set(documented.keys())),
            "undocumented": list(set(implemented.keys()) - set(documented.keys())),
            "missing": list(set(documented.keys()) - set(implemented.keys())),
        }
    }

    output_path = Path(__file__).parent / filename
    with open(output_path, 'w') as f:
        json.dump(report, f, indent=2)

    print(f"📄 Report exported to: {output_path}")


if __name__ == "__main__":
    exit_code = validate_endpoints()

    # Export JSON report
    export_report()

    sys.exit(exit_code)
