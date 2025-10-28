"""
Test Data Generator for FOLIO LMS
Generates synthetic data for testing all modules
"""

import uuid
import random
from datetime import datetime, timedelta
from typing import List, Dict, Any


class TestDataGenerator:
    """Generate synthetic test data for all FOLIO modules"""

    def __init__(self, tenant_id: str = "test-tenant"):
        self.tenant_id = tenant_id
        self.user_id = str(uuid.uuid4())

    # ============================================================================
    # USER DATA
    # ============================================================================

    def generate_patron_groups(self, count: int = 5) -> List[Dict[str, Any]]:
        """Generate patron group test data"""
        groups = [
            {"group": "Undergraduate", "desc": "Undergraduate students", "expiration_offset_in_days": 1460},
            {"group": "Graduate", "desc": "Graduate students", "expiration_offset_in_days": 1825},
            {"group": "Faculty", "desc": "Faculty members", "expiration_offset_in_days": None},
            {"group": "Staff", "desc": "Staff members", "expiration_offset_in_days": None},
            {"group": "Community", "desc": "Community members", "expiration_offset_in_days": 365},
        ]
        return groups[:count]

    def generate_departments(self, count: int = 4) -> List[Dict[str, Any]]:
        """Generate department test data"""
        departments = [
            {"name": "Computer Science", "code": "CS"},
            {"name": "Library Services", "code": "LIB"},
            {"name": "History", "code": "HIST"},
            {"name": "Biology", "code": "BIO"},
        ]
        return departments[:count]

    def generate_users(self, count: int = 10, patron_group_ids: List[str] = None) -> List[Dict[str, Any]]:
        """Generate user test data"""
        first_names = ["John", "Jane", "Michael", "Sarah", "David", "Emily", "Robert", "Lisa", "James", "Maria"]
        last_names = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez"]

        users = []
        for i in range(count):
            first_name = random.choice(first_names)
            last_name = random.choice(last_names)
            username = f"{first_name.lower()}.{last_name.lower()}{i}"

            user = {
                "username": username,
                "email": f"{username}@example.com",
                "barcode": f"USER{str(i+1).zfill(8)}",
                "external_system_id": f"EXT-{str(uuid.uuid4())[:8]}",
                "active": random.choice([True, True, True, False]),  # 75% active
                "user_type": random.choice(["patron", "staff"]),
                "password": "Test123!@#",
                "personal_info": {
                    "first_name": first_name,
                    "last_name": last_name,
                    "middle_name": random.choice(["A", "B", "C", None]),
                    "preferred_first_name": first_name,
                    "email": f"{username}@example.com",
                    "phone": f"+1-555-{random.randint(100, 999)}-{random.randint(1000, 9999)}",
                    "mobile_phone": f"+1-555-{random.randint(100, 999)}-{random.randint(1000, 9999)}",
                    "date_of_birth": (datetime.now() - timedelta(days=random.randint(6570, 25550))).isoformat(),
                },
                "patron_group_id": random.choice(patron_group_ids) if patron_group_ids else None,
                "enrollment_date": (datetime.now() - timedelta(days=random.randint(30, 1095))).isoformat(),
                "expiration_date": (datetime.now() + timedelta(days=random.randint(30, 730))).isoformat(),
            }
            users.append(user)

        return users

    # ============================================================================
    # INVENTORY DATA
    # ============================================================================

    def generate_instances(self, count: int = 20) -> List[Dict[str, Any]]:
        """Generate inventory instance test data"""
        titles = [
            "Introduction to Programming",
            "Data Structures and Algorithms",
            "Database Systems",
            "Computer Networks",
            "Artificial Intelligence",
            "Machine Learning Fundamentals",
            "Web Development",
            "Software Engineering",
            "Operating Systems",
            "Computer Architecture",
            "Python for Beginners",
            "JavaScript: The Good Parts",
            "Clean Code",
            "Design Patterns",
            "The Pragmatic Programmer",
            "Code Complete",
            "Introduction to Algorithms",
            "Discrete Mathematics",
            "Linear Algebra",
            "Calculus I",
        ]

        authors = [
            "Robert Martin", "Martin Fowler", "Kent Beck", "Eric Evans",
            "Donald Knuth", "Andrew Tanenbaum", "Brian Kernighan",
            "Dennis Ritchie", "Bjarne Stroustrup", "James Gosling"
        ]

        publishers = [
            "O'Reilly Media", "Addison-Wesley", "Pearson", "McGraw-Hill",
            "Wiley", "Springer", "Cambridge University Press", "MIT Press"
        ]

        instances = []
        for i in range(min(count, len(titles))):
            year = random.randint(2015, 2024)
            edition = f"{random.randint(1, 5)}{'st' if random.randint(1, 5) == 1 else 'nd' if random.randint(1, 5) == 2 else 'rd' if random.randint(1, 5) == 3 else 'th'} ed."

            instance = {
                "title": titles[i],
                "subtitle": random.choice([None, "A Comprehensive Guide", "Principles and Practice", "Theory and Applications"]),
                "edition": edition,
                "publication": [f"{random.choice(publishers)}, {year}"],
                "publication_period": {"start": year, "end": year},
                "contributors": [
                    {
                        "name": random.choice(authors),
                        "contributor_type_id": "author",
                        "primary": True
                    }
                ],
                "instance_type_id": "text",
                "languages": ["eng"],
                "subjects": random.sample(["Computer Science", "Programming", "Software Engineering", "Mathematics"], k=random.randint(1, 3)),
            }
            instances.append(instance)

        return instances

    # ============================================================================
    # COURSE DATA
    # ============================================================================

    def generate_courses(self, count: int = 8) -> List[Dict[str, Any]]:
        """Generate course test data"""
        courses_data = [
            {"name": "Introduction to Computer Science", "code": "CS101", "term": "Fall 2024"},
            {"name": "Data Structures", "code": "CS201", "term": "Fall 2024"},
            {"name": "Algorithms", "code": "CS301", "term": "Spring 2025"},
            {"name": "Database Systems", "code": "CS401", "term": "Spring 2025"},
            {"name": "Web Development", "code": "CS250", "term": "Fall 2024"},
            {"name": "Machine Learning", "code": "CS450", "term": "Spring 2025"},
            {"name": "Software Engineering", "code": "CS350", "term": "Fall 2024"},
            {"name": "Operating Systems", "code": "CS320", "term": "Spring 2025"},
        ]

        courses = []
        for i in range(min(count, len(courses_data))):
            course_data = courses_data[i]
            term = course_data["term"]

            if "Fall" in term:
                start_date = datetime(2024, 9, 1)
                end_date = datetime(2024, 12, 15)
            else:
                start_date = datetime(2025, 1, 15)
                end_date = datetime(2025, 5, 10)

            course = {
                "name": course_data["name"],
                "code": course_data["code"],
                "term": term,
                "start_date": start_date.isoformat(),
                "end_date": end_date.isoformat(),
                "is_active": True,
                "description": f"This course covers fundamental concepts in {course_data['name'].lower()}.",
            }
            courses.append(course)

        return courses

    # ============================================================================
    # ACQUISITIONS DATA
    # ============================================================================

    def generate_vendors(self, count: int = 5) -> List[Dict[str, Any]]:
        """Generate vendor test data"""
        vendor_names = [
            "Academic Book Suppliers Inc.",
            "University Press Direct",
            "Global Library Vendors",
            "Educational Materials Co.",
            "Scholarly Books Ltd.",
        ]

        vendors = []
        for i in range(min(count, len(vendor_names))):
            vendor = {
                "name": vendor_names[i],
                "code": f"VEN{str(i+1).zfill(4)}",
                "vendor_status": random.choice(["active", "active", "active", "inactive"]),
                "description": f"Supplier of academic and educational materials",
                "contact_info": {
                    "email": f"orders@{vendor_names[i].lower().replace(' ', '').replace('.', '')}.com",
                    "phone": f"+1-800-{random.randint(100, 999)}-{random.randint(1000, 9999)}",
                },
                "payment_terms": random.choice(["Net 30", "Net 60", "Net 90", "Due on Receipt"]),
            }
            vendors.append(vendor)

        return vendors

    def generate_funds(self, count: int = 4) -> List[Dict[str, Any]]:
        """Generate fund test data"""
        fund_names = [
            "General Library Fund",
            "Computer Science Materials",
            "Reference Collection",
            "Special Collections",
        ]

        funds = []
        for i in range(min(count, len(fund_names))):
            allocated = random.randint(10000, 100000)
            spent = random.randint(0, int(allocated * 0.7))

            fund = {
                "name": fund_names[i],
                "code": f"FUND{str(i+1).zfill(4)}",
                "fund_status": "active",
                "allocated_amount": float(allocated),
                "available_amount": float(allocated - spent),
                "description": f"Budget allocation for {fund_names[i].lower()}",
            }
            funds.append(fund)

        return funds

    # ============================================================================
    # CIRCULATION DATA
    # ============================================================================

    def generate_loans(self, count: int = 15, user_barcodes: List[str] = None, item_barcodes: List[str] = None) -> List[Dict[str, Any]]:
        """Generate loan test data"""
        if not user_barcodes or not item_barcodes:
            return []

        loans = []
        for i in range(count):
            loan_date = datetime.now() - timedelta(days=random.randint(1, 30))
            due_date = loan_date + timedelta(days=14)
            is_overdue = due_date < datetime.now()

            loan = {
                "user_barcode": random.choice(user_barcodes),
                "item_barcode": random.choice(item_barcodes),
                "loan_date": loan_date.isoformat(),
                "due_date": due_date.isoformat(),
                "status": "overdue" if is_overdue else "open",
                "renewal_count": random.randint(0, 2),
            }
            loans.append(loan)

        return loans


# ============================================================================
# MAIN TEST DATA GENERATION
# ============================================================================

def generate_all_test_data():
    """Generate complete test data set for all modules"""
    generator = TestDataGenerator()

    test_data = {
        "patron_groups": generator.generate_patron_groups(5),
        "departments": generator.generate_departments(4),
        "users": generator.generate_users(10),
        "instances": generator.generate_instances(20),
        "courses": generator.generate_courses(8),
        "vendors": generator.generate_vendors(5),
        "funds": generator.generate_funds(4),
    }

    return test_data


if __name__ == "__main__":
    import json

    test_data = generate_all_test_data()

    print("Generated Test Data Summary:")
    print(f"  Patron Groups: {len(test_data['patron_groups'])}")
    print(f"  Departments: {len(test_data['departments'])}")
    print(f"  Users: {len(test_data['users'])}")
    print(f"  Instances: {len(test_data['instances'])}")
    print(f"  Courses: {len(test_data['courses'])}")
    print(f"  Vendors: {len(test_data['vendors'])}")
    print(f"  Funds: {len(test_data['funds'])}")

    # Save to JSON file
    with open("test_data_synthetic.json", "w") as f:
        json.dump(test_data, f, indent=2)

    print("\nTest data saved to test_data_synthetic.json")
