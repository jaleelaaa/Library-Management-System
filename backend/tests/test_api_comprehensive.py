"""
Comprehensive API Tests for FOLIO LMS
Tests all backend endpoints with synthetic data
"""

import pytest
import asyncio
from httpx import AsyncClient
from typing import Dict, Any, List
import json


# Test configuration
BASE_URL = "http://localhost:8000/api/v1"
TEST_TENANT = "test-library"
TEST_USER = {
    "username": "admin",
    "password": "admin123"
}


class TestResults:
    """Track test results"""
    def __init__(self):
        self.passed = 0
        self.failed = 0
        self.errors = []

    def record_pass(self, test_name: str):
        self.passed += 1
        print(f"✅ PASS: {test_name}")

    def record_fail(self, test_name: str, error: str):
        self.failed += 1
        self.errors.append({"test": test_name, "error": error})
        print(f"❌ FAIL: {test_name} - {error}")

    def summary(self):
        total = self.passed + self.failed
        print(f"\n{'='*60}")
        print(f"TEST SUMMARY:")
        print(f"  Total Tests: {total}")
        print(f"  Passed: {self.passed} ({self.passed/total*100:.1f}%)" if total > 0 else "  Passed: 0")
        print(f"  Failed: {self.failed} ({self.failed/total*100:.1f}%)" if total > 0 else "  Failed: 0")
        print(f"{'='*60}\n")

        if self.errors:
            print("FAILED TESTS:")
            for error in self.errors:
                print(f"  - {error['test']}: {error['error']}")


results = TestResults()


# ============================================================================
# AUTHENTICATION TESTS
# ============================================================================

async def test_auth_login(client: AsyncClient, results: TestResults) -> Dict[str, str]:
    """Test user login and get tokens"""
    try:
        response = await client.post(
            f"{BASE_URL}/auth/login",
            json=TEST_USER,
            headers={"X-Tenant-ID": TEST_TENANT}
        )

        if response.status_code == 200:
            data = response.json()
            if "access_token" in data and "refresh_token" in data:
                results.record_pass("Auth: Login")
                return data
            else:
                results.record_fail("Auth: Login", "Missing tokens in response")
                return {}
        else:
            results.record_fail("Auth: Login", f"Status {response.status_code}")
            return {}
    except Exception as e:
        results.record_fail("Auth: Login", str(e))
        return {}


# ============================================================================
# USERS MODULE TESTS
# ============================================================================

async def test_users_module(client: AsyncClient, headers: Dict[str, str], results: TestResults):
    """Test all users endpoints"""

    # Test 1: Create Patron Group
    try:
        response = await client.post(
            f"{BASE_URL}/users/patron-groups/",
            json={"group": "Test Students", "desc": "Test patron group"},
            headers=headers
        )
        if response.status_code == 201:
            patron_group_id = response.json()["id"]
            results.record_pass("Users: Create Patron Group")
        else:
            results.record_fail("Users: Create Patron Group", f"Status {response.status_code}")
            patron_group_id = None
    except Exception as e:
        results.record_fail("Users: Create Patron Group", str(e))
        patron_group_id = None

    # Test 2: List Patron Groups
    try:
        response = await client.get(f"{BASE_URL}/users/patron-groups/", headers=headers)
        if response.status_code == 200:
            results.record_pass("Users: List Patron Groups")
        else:
            results.record_fail("Users: List Patron Groups", f"Status {response.status_code}")
    except Exception as e:
        results.record_fail("Users: List Patron Groups", str(e))

    # Test 3: Create User
    try:
        user_data = {
            "username": "test.user1",
            "email": "test.user1@example.com",
            "barcode": "TEST00001",
            "password": "Test123!@#",
            "active": True,
            "user_type": "patron",
            "patron_group_id": patron_group_id,
            "personal_info": {
                "first_name": "Test",
                "last_name": "User",
                "email": "test.user1@example.com"
            }
        }
        response = await client.post(f"{BASE_URL}/users/", json=user_data, headers=headers)
        if response.status_code == 201:
            user_id = response.json()["id"]
            results.record_pass("Users: Create User")
        else:
            results.record_fail("Users: Create User", f"Status {response.status_code}: {response.text}")
            user_id = None
    except Exception as e:
        results.record_fail("Users: Create User", str(e))
        user_id = None

    # Test 4: List Users
    try:
        response = await client.get(f"{BASE_URL}/users/", headers=headers)
        if response.status_code == 200:
            data = response.json()
            if "data" in data and "meta" in data:
                results.record_pass("Users: List Users with Pagination")
            else:
                results.record_fail("Users: List Users", "Missing pagination data")
        else:
            results.record_fail("Users: List Users", f"Status {response.status_code}")
    except Exception as e:
        results.record_fail("Users: List Users", str(e))

    # Test 5: Get User by ID
    if user_id:
        try:
            response = await client.get(f"{BASE_URL}/users/{user_id}", headers=headers)
            if response.status_code == 200:
                results.record_pass("Users: Get User by ID")
            else:
                results.record_fail("Users: Get User by ID", f"Status {response.status_code}")
        except Exception as e:
            results.record_fail("Users: Get User by ID", str(e))

    # Test 6: Update User
    if user_id:
        try:
            update_data = {"active": False}
            response = await client.put(f"{BASE_URL}/users/{user_id}", json=update_data, headers=headers)
            if response.status_code == 200:
                results.record_pass("Users: Update User")
            else:
                results.record_fail("Users: Update User", f"Status {response.status_code}")
        except Exception as e:
            results.record_fail("Users: Update User", str(e))

    # Test 7: Search Users
    try:
        response = await client.get(f"{BASE_URL}/users/?q=test", headers=headers)
        if response.status_code == 200:
            results.record_pass("Users: Search Users")
        else:
            results.record_fail("Users: Search Users", f"Status {response.status_code}")
    except Exception as e:
        results.record_fail("Users: Search Users", str(e))

    return user_id


# ============================================================================
# INVENTORY MODULE TESTS
# ============================================================================

async def test_inventory_module(client: AsyncClient, headers: Dict[str, str], results: TestResults):
    """Test all inventory endpoints"""

    # Test 1: Create Instance
    try:
        instance_data = {
            "title": "Test Book Title",
            "instance_type_id": "text",
            "contributors": [{"name": "Test Author", "contributor_type_id": "author", "primary": True}]
        }
        response = await client.post(f"{BASE_URL}/inventory/instances", json=instance_data, headers=headers)
        if response.status_code == 201:
            instance_id = response.json()["id"]
            results.record_pass("Inventory: Create Instance")
        else:
            results.record_fail("Inventory: Create Instance", f"Status {response.status_code}: {response.text}")
            instance_id = None
    except Exception as e:
        results.record_fail("Inventory: Create Instance", str(e))
        instance_id = None

    # Test 2: List Instances
    try:
        response = await client.get(f"{BASE_URL}/inventory/instances", headers=headers)
        if response.status_code == 200:
            data = response.json()
            if "data" in data and "meta" in data:
                results.record_pass("Inventory: List Instances with Pagination")
            else:
                results.record_fail("Inventory: List Instances", "Missing pagination data")
        else:
            results.record_fail("Inventory: List Instances", f"Status {response.status_code}")
    except Exception as e:
        results.record_fail("Inventory: List Instances", str(e))

    # Test 3: Get Instance by ID
    if instance_id:
        try:
            response = await client.get(f"{BASE_URL}/inventory/instances/{instance_id}", headers=headers)
            if response.status_code == 200:
                results.record_pass("Inventory: Get Instance by ID")
            else:
                results.record_fail("Inventory: Get Instance by ID", f"Status {response.status_code}")
        except Exception as e:
            results.record_pass("Inventory: Get Instance by ID", str(e))

    # Test 4: Update Instance
    if instance_id:
        try:
            update_data = {"subtitle": "Updated Subtitle"}
            response = await client.put(f"{BASE_URL}/inventory/instances/{instance_id}", json=update_data, headers=headers)
            if response.status_code == 200:
                results.record_pass("Inventory: Update Instance")
            else:
                results.record_fail("Inventory: Update Instance", f"Status {response.status_code}")
        except Exception as e:
            results.record_fail("Inventory: Update Instance", str(e))

    # Test 5: Search Instances
    try:
        response = await client.get(f"{BASE_URL}/inventory/instances?q=Test", headers=headers)
        if response.status_code == 200:
            results.record_pass("Inventory: Search Instances")
        else:
            results.record_fail("Inventory: Search Instances", f"Status {response.status_code}")
    except Exception as e:
        results.record_fail("Inventory: Search Instances", str(e))

    return instance_id


# ============================================================================
# COURSES MODULE TESTS
# ============================================================================

async def test_courses_module(client: AsyncClient, headers: Dict[str, str], results: TestResults):
    """Test all courses endpoints"""

    # Test 1: Create Course
    try:
        course_data = {
            "name": "Test Course 101",
            "code": "TEST101",
            "term": "Fall 2024",
            "is_active": True,
            "description": "Test course description"
        }
        response = await client.post(f"{BASE_URL}/courses/", json=course_data, headers=headers)
        if response.status_code == 201:
            course_id = response.json()["id"]
            results.record_pass("Courses: Create Course")
        else:
            results.record_fail("Courses: Create Course", f"Status {response.status_code}: {response.text}")
            course_id = None
    except Exception as e:
        results.record_fail("Courses: Create Course", str(e))
        course_id = None

    # Test 2: List Courses
    try:
        response = await client.get(f"{BASE_URL}/courses/", headers=headers)
        if response.status_code == 200:
            data = response.json()
            if "data" in data and "meta" in data:
                results.record_pass("Courses: List Courses with Pagination")
            else:
                results.record_fail("Courses: List Courses", "Missing pagination data")
        else:
            results.record_fail("Courses: List Courses", f"Status {response.status_code}")
    except Exception as e:
        results.record_fail("Courses: List Courses", str(e))

    # Test 3: Get Course by ID
    if course_id:
        try:
            response = await client.get(f"{BASE_URL}/courses/{course_id}", headers=headers)
            if response.status_code == 200:
                results.record_pass("Courses: Get Course by ID")
            else:
                results.record_fail("Courses: Get Course by ID", f"Status {response.status_code}")
        except Exception as e:
            results.record_fail("Courses: Get Course by ID", str(e))

    # Test 4: Update Course
    if course_id:
        try:
            update_data = {"description": "Updated course description"}
            response = await client.put(f"{BASE_URL}/courses/{course_id}", json=update_data, headers=headers)
            if response.status_code == 200:
                results.record_pass("Courses: Update Course")
            else:
                results.record_fail("Courses: Update Course", f"Status {response.status_code}")
        except Exception as e:
            results.record_fail("Courses: Update Course", str(e))

    # Test 5: Search Courses
    try:
        response = await client.get(f"{BASE_URL}/courses/?search=Test", headers=headers)
        if response.status_code == 200:
            results.record_pass("Courses: Search Courses")
        else:
            results.record_fail("Courses: Search Courses", f"Status {response.status_code}")
    except Exception as e:
        results.record_fail("Courses: Search Courses", str(e))

    return course_id


# ============================================================================
# CIRCULATION MODULE TESTS
# ============================================================================

async def test_circulation_module(client: AsyncClient, headers: Dict[str, str], user_barcode: str, item_barcode: str, results: TestResults):
    """Test circulation endpoints"""

    # Note: These tests require actual user and item barcodes from database
    # Skipping for now if we don't have valid data

    # Test 1: List Loans
    try:
        response = await client.get(f"{BASE_URL}/circulation/loans", headers=headers)
        if response.status_code == 200:
            results.record_pass("Circulation: List Loans")
        else:
            results.record_fail("Circulation: List Loans", f"Status {response.status_code}")
    except Exception as e:
        results.record_fail("Circulation: List Loans", str(e))

    # Test 2: List Requests
    try:
        response = await client.get(f"{BASE_URL}/circulation/requests", headers=headers)
        if response.status_code == 200:
            results.record_pass("Circulation: List Requests")
        else:
            results.record_fail("Circulation: List Requests", f"Status {response.status_code}")
    except Exception as e:
        results.record_fail("Circulation: List Requests", str(e))


# ============================================================================
# ACQUISITIONS MODULE TESTS
# ============================================================================

async def test_acquisitions_module(client: AsyncClient, headers: Dict[str, str], results: TestResults):
    """Test acquisitions endpoints"""

    # Test 1: Create Vendor
    try:
        vendor_data = {
            "name": "Test Vendor Inc.",
            "code": "TESTVEN001",
            "vendor_status": "active"
        }
        response = await client.post(f"{BASE_URL}/acquisitions/vendors/", json=vendor_data, headers=headers)
        if response.status_code == 201:
            vendor_id = response.json()["id"]
            results.record_pass("Acquisitions: Create Vendor")
        else:
            results.record_fail("Acquisitions: Create Vendor", f"Status {response.status_code}: {response.text}")
            vendor_id = None
    except Exception as e:
        results.record_fail("Acquisitions: Create Vendor", str(e))
        vendor_id = None

    # Test 2: List Vendors
    try:
        response = await client.get(f"{BASE_URL}/acquisitions/vendors/", headers=headers)
        if response.status_code == 200:
            results.record_pass("Acquisitions: List Vendors")
        else:
            results.record_fail("Acquisitions: List Vendors", f"Status {response.status_code}")
    except Exception as e:
        results.record_fail("Acquisitions: List Vendors", str(e))

    # Test 3: List Funds
    try:
        response = await client.get(f"{BASE_URL}/acquisitions/funds/", headers=headers)
        if response.status_code == 200:
            results.record_pass("Acquisitions: List Funds")
        else:
            results.record_fail("Acquisitions: List Funds", f"Status {response.status_code}")
    except Exception as e:
        results.record_fail("Acquisitions: List Funds", str(e))


# ============================================================================
# MAIN TEST RUNNER
# ============================================================================

async def run_all_tests():
    """Run all API tests"""
    print("=" * 60)
    print("FOLIO LMS - COMPREHENSIVE API TESTING")
    print("=" * 60)
    print()

    async with AsyncClient(base_url=BASE_URL, timeout=30.0) as client:
        # Step 1: Authentication
        print("Testing Authentication...")
        auth_data = await test_auth_login(client, results)

        if not auth_data:
            print("\n⚠️  Authentication failed. Cannot proceed with other tests.")
            results.summary()
            return

        # Create headers with token
        headers = {
            "Authorization": f"Bearer {auth_data['access_token']}",
            "X-Tenant-ID": TEST_TENANT
        }

        # Step 2: Users Module
        print("\nTesting Users Module...")
        user_id = await test_users_module(client, headers, results)

        # Step 3: Inventory Module
        print("\nTesting Inventory Module...")
        instance_id = await test_inventory_module(client, headers, results)

        # Step 4: Courses Module
        print("\nTesting Courses Module...")
        course_id = await test_courses_module(client, headers, results)

        # Step 5: Circulation Module
        print("\nTesting Circulation Module...")
        await test_circulation_module(client, headers, "TEST00001", "ITEM00001", results)

        # Step 6: Acquisitions Module
        print("\nTesting Acquisitions Module...")
        await test_acquisitions_module(client, headers, results)

    # Show results
    results.summary()


if __name__ == "__main__":
    asyncio.run(run_all_tests())
