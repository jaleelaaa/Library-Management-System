"""
Permission definitions for RBAC system.

All permissions follow the pattern: "{resource}.{action}"
This module serves as the single source of truth for all permissions in the system.
"""

# ============================================================================
# USER MANAGEMENT PERMISSIONS
# ============================================================================

USERS_CREATE = "users.create"
USERS_READ = "users.read"
USERS_UPDATE = "users.update"
USERS_DELETE = "users.delete"

# ============================================================================
# INVENTORY MANAGEMENT PERMISSIONS
# ============================================================================

INVENTORY_CREATE = "inventory.create"
INVENTORY_READ = "inventory.read"
INVENTORY_UPDATE = "inventory.update"
INVENTORY_DELETE = "inventory.delete"

# ============================================================================
# CIRCULATION PERMISSIONS
# ============================================================================

CIRCULATION_CHECKOUT = "circulation.checkout"
CIRCULATION_CHECKIN = "circulation.checkin"
CIRCULATION_RENEW = "circulation.renew"
CIRCULATION_RENEW_OWN = "circulation.renew_own"  # Renew own checked-out items (patron self-service)
CIRCULATION_VIEW_ALL = "circulation.view_all"  # View all loans
CIRCULATION_VIEW_OWN = "circulation.view_own"  # View own loans only

# Requests/Holds
REQUESTS_CREATE = "requests.create"
REQUESTS_READ = "requests.read"
REQUESTS_UPDATE = "requests.update"
REQUESTS_DELETE = "requests.delete"
REQUESTS_VIEW_OWN = "requests.view_own"  # View own requests only

# ============================================================================
# ACQUISITIONS PERMISSIONS
# ============================================================================

ACQUISITIONS_CREATE = "acquisitions.create"
ACQUISITIONS_READ = "acquisitions.read"
ACQUISITIONS_UPDATE = "acquisitions.update"
ACQUISITIONS_DELETE = "acquisitions.delete"

# Vendors
VENDORS_CREATE = "vendors.create"
VENDORS_READ = "vendors.read"
VENDORS_UPDATE = "vendors.update"
VENDORS_DELETE = "vendors.delete"

# ============================================================================
# COURSE MANAGEMENT PERMISSIONS
# ============================================================================

COURSES_CREATE = "courses.create"
COURSES_READ = "courses.read"
COURSES_UPDATE = "courses.update"
COURSES_DELETE = "courses.delete"

# Course Reserves
RESERVES_CREATE = "reserves.create"
RESERVES_READ = "reserves.read"
RESERVES_UPDATE = "reserves.update"
RESERVES_DELETE = "reserves.delete"

# ============================================================================
# FEES & FINES PERMISSIONS
# ============================================================================

FEES_CREATE = "fees.create"
FEES_READ = "fees.read"
FEES_UPDATE = "fees.update"
FEES_DELETE = "fees.delete"
FEES_WAIVE = "fees.waive"
FEES_PAY = "fees.pay"
FEES_VIEW_OWN = "fees.view_own"  # View own fees only

# ============================================================================
# REPORTS PERMISSIONS
# ============================================================================

REPORTS_GENERATE = "reports.generate"
REPORTS_READ = "reports.read"
REPORTS_EXPORT = "reports.export"
REPORTS_SCHEDULE = "reports.schedule"

# ============================================================================
# SETTINGS PERMISSIONS
# ============================================================================

SETTINGS_READ = "settings.read"
SETTINGS_UPDATE = "settings.update"

# ============================================================================
# PATRON GROUPS PERMISSIONS
# ============================================================================

PATRON_GROUPS_CREATE = "patron_groups.create"
PATRON_GROUPS_READ = "patron_groups.read"
PATRON_GROUPS_UPDATE = "patron_groups.update"
PATRON_GROUPS_DELETE = "patron_groups.delete"

# ============================================================================
# LOCATIONS & LIBRARIES PERMISSIONS
# ============================================================================

LOCATIONS_CREATE = "locations.create"
LOCATIONS_READ = "locations.read"
LOCATIONS_UPDATE = "locations.update"
LOCATIONS_DELETE = "locations.delete"

LIBRARIES_CREATE = "libraries.create"
LIBRARIES_READ = "libraries.read"
LIBRARIES_UPDATE = "libraries.update"
LIBRARIES_DELETE = "libraries.delete"

# ============================================================================
# NOTIFICATIONS PERMISSIONS
# ============================================================================

NOTIFICATIONS_CREATE = "notifications.create"
NOTIFICATIONS_READ = "notifications.read"
NOTIFICATIONS_UPDATE = "notifications.update"
NOTIFICATIONS_DELETE = "notifications.delete"

# ============================================================================
# ROLES & PERMISSIONS MANAGEMENT
# ============================================================================

ROLES_CREATE = "roles.create"
ROLES_READ = "roles.read"
ROLES_UPDATE = "roles.update"
ROLES_DELETE = "roles.delete"

PERMISSIONS_CREATE = "permissions.create"
PERMISSIONS_READ = "permissions.read"
PERMISSIONS_UPDATE = "permissions.update"
PERMISSIONS_DELETE = "permissions.delete"

# ============================================================================
# AUDIT & LOGGING
# ============================================================================

AUDIT_READ = "audit.read"
AUDIT_EXPORT = "audit.export"

# ============================================================================
# ALL PERMISSIONS DEFINITION
# ============================================================================

ALL_PERMISSIONS = [
    # Users
    {
        "name": USERS_CREATE,
        "display_name": "Create Users",
        "description": "Create new user accounts",
        "resource": "users",
        "action": "create"
    },
    {
        "name": USERS_READ,
        "display_name": "View Users",
        "description": "View user accounts and information",
        "resource": "users",
        "action": "read"
    },
    {
        "name": USERS_UPDATE,
        "display_name": "Update Users",
        "description": "Update user account information",
        "resource": "users",
        "action": "update"
    },
    {
        "name": USERS_DELETE,
        "display_name": "Delete Users",
        "description": "Delete user accounts",
        "resource": "users",
        "action": "delete"
    },

    # Inventory
    {
        "name": INVENTORY_CREATE,
        "display_name": "Create Inventory",
        "description": "Create new inventory items, instances, and holdings",
        "resource": "inventory",
        "action": "create"
    },
    {
        "name": INVENTORY_READ,
        "display_name": "View Inventory",
        "description": "View inventory items, instances, and holdings",
        "resource": "inventory",
        "action": "read"
    },
    {
        "name": INVENTORY_UPDATE,
        "display_name": "Update Inventory",
        "description": "Update inventory items, instances, and holdings",
        "resource": "inventory",
        "action": "update"
    },
    {
        "name": INVENTORY_DELETE,
        "display_name": "Delete Inventory",
        "description": "Delete inventory items, instances, and holdings",
        "resource": "inventory",
        "action": "delete"
    },

    # Circulation
    {
        "name": CIRCULATION_CHECKOUT,
        "display_name": "Check Out Items",
        "description": "Check out items to patrons",
        "resource": "circulation",
        "action": "checkout"
    },
    {
        "name": CIRCULATION_CHECKIN,
        "display_name": "Check In Items",
        "description": "Check in items from patrons",
        "resource": "circulation",
        "action": "checkin"
    },
    {
        "name": CIRCULATION_RENEW,
        "display_name": "Renew Items",
        "description": "Renew checked out items",
        "resource": "circulation",
        "action": "renew"
    },
    {
        "name": CIRCULATION_RENEW_OWN,
        "display_name": "Renew Own Loans",
        "description": "Renew own checked-out items (patron self-service)",
        "resource": "circulation",
        "action": "renew_own"
    },
    {
        "name": CIRCULATION_VIEW_ALL,
        "display_name": "View All Loans",
        "description": "View all patron loans and circulation history",
        "resource": "circulation",
        "action": "view_all"
    },
    {
        "name": CIRCULATION_VIEW_OWN,
        "display_name": "View Own Loans",
        "description": "View own loans only",
        "resource": "circulation",
        "action": "view_own"
    },

    # Requests
    {
        "name": REQUESTS_CREATE,
        "display_name": "Create Requests",
        "description": "Create hold and request records",
        "resource": "requests",
        "action": "create"
    },
    {
        "name": REQUESTS_READ,
        "display_name": "View Requests",
        "description": "View hold and request records",
        "resource": "requests",
        "action": "read"
    },
    {
        "name": REQUESTS_UPDATE,
        "display_name": "Update Requests",
        "description": "Update hold and request records",
        "resource": "requests",
        "action": "update"
    },
    {
        "name": REQUESTS_DELETE,
        "display_name": "Delete Requests",
        "description": "Delete hold and request records",
        "resource": "requests",
        "action": "delete"
    },
    {
        "name": REQUESTS_VIEW_OWN,
        "display_name": "View Own Requests",
        "description": "View own requests only",
        "resource": "requests",
        "action": "view_own"
    },

    # Acquisitions
    {
        "name": ACQUISITIONS_CREATE,
        "display_name": "Create Acquisitions",
        "description": "Create purchase orders and acquisitions",
        "resource": "acquisitions",
        "action": "create"
    },
    {
        "name": ACQUISITIONS_READ,
        "display_name": "View Acquisitions",
        "description": "View purchase orders and acquisitions",
        "resource": "acquisitions",
        "action": "read"
    },
    {
        "name": ACQUISITIONS_UPDATE,
        "display_name": "Update Acquisitions",
        "description": "Update purchase orders and acquisitions",
        "resource": "acquisitions",
        "action": "update"
    },
    {
        "name": ACQUISITIONS_DELETE,
        "display_name": "Delete Acquisitions",
        "description": "Delete purchase orders and acquisitions",
        "resource": "acquisitions",
        "action": "delete"
    },

    # Vendors
    {
        "name": VENDORS_CREATE,
        "display_name": "Create Vendors",
        "description": "Create vendor records",
        "resource": "vendors",
        "action": "create"
    },
    {
        "name": VENDORS_READ,
        "display_name": "View Vendors",
        "description": "View vendor records",
        "resource": "vendors",
        "action": "read"
    },
    {
        "name": VENDORS_UPDATE,
        "display_name": "Update Vendors",
        "description": "Update vendor records",
        "resource": "vendors",
        "action": "update"
    },
    {
        "name": VENDORS_DELETE,
        "display_name": "Delete Vendors",
        "description": "Delete vendor records",
        "resource": "vendors",
        "action": "delete"
    },

    # Courses
    {
        "name": COURSES_CREATE,
        "display_name": "Create Courses",
        "description": "Create course records",
        "resource": "courses",
        "action": "create"
    },
    {
        "name": COURSES_READ,
        "display_name": "View Courses",
        "description": "View course records",
        "resource": "courses",
        "action": "read"
    },
    {
        "name": COURSES_UPDATE,
        "display_name": "Update Courses",
        "description": "Update course records",
        "resource": "courses",
        "action": "update"
    },
    {
        "name": COURSES_DELETE,
        "display_name": "Delete Courses",
        "description": "Delete course records",
        "resource": "courses",
        "action": "delete"
    },

    # Reserves
    {
        "name": RESERVES_CREATE,
        "display_name": "Create Reserves",
        "description": "Create course reserve items",
        "resource": "reserves",
        "action": "create"
    },
    {
        "name": RESERVES_READ,
        "display_name": "View Reserves",
        "description": "View course reserve items",
        "resource": "reserves",
        "action": "read"
    },
    {
        "name": RESERVES_UPDATE,
        "display_name": "Update Reserves",
        "description": "Update course reserve items",
        "resource": "reserves",
        "action": "update"
    },
    {
        "name": RESERVES_DELETE,
        "display_name": "Delete Reserves",
        "description": "Delete course reserve items",
        "resource": "reserves",
        "action": "delete"
    },

    # Fees
    {
        "name": FEES_CREATE,
        "display_name": "Create Fees",
        "description": "Create fee and fine records",
        "resource": "fees",
        "action": "create"
    },
    {
        "name": FEES_READ,
        "display_name": "View Fees",
        "description": "View fee and fine records",
        "resource": "fees",
        "action": "read"
    },
    {
        "name": FEES_UPDATE,
        "display_name": "Update Fees",
        "description": "Update fee and fine records",
        "resource": "fees",
        "action": "update"
    },
    {
        "name": FEES_DELETE,
        "display_name": "Delete Fees",
        "description": "Delete fee and fine records",
        "resource": "fees",
        "action": "delete"
    },
    {
        "name": FEES_WAIVE,
        "display_name": "Waive Fees",
        "description": "Waive patron fees and fines",
        "resource": "fees",
        "action": "waive"
    },
    {
        "name": FEES_PAY,
        "display_name": "Record Fee Payments",
        "description": "Record fee and fine payments",
        "resource": "fees",
        "action": "pay"
    },
    {
        "name": FEES_VIEW_OWN,
        "display_name": "View Own Fees",
        "description": "View own fees only",
        "resource": "fees",
        "action": "view_own"
    },

    # Reports
    {
        "name": REPORTS_GENERATE,
        "display_name": "Generate Reports",
        "description": "Generate system reports",
        "resource": "reports",
        "action": "generate"
    },
    {
        "name": REPORTS_READ,
        "display_name": "View Reports",
        "description": "View generated reports",
        "resource": "reports",
        "action": "read"
    },
    {
        "name": REPORTS_EXPORT,
        "display_name": "Export Reports",
        "description": "Export reports to various formats",
        "resource": "reports",
        "action": "export"
    },
    {
        "name": REPORTS_SCHEDULE,
        "display_name": "Schedule Reports",
        "description": "Schedule automated report generation",
        "resource": "reports",
        "action": "schedule"
    },

    # Settings
    {
        "name": SETTINGS_READ,
        "display_name": "View Settings",
        "description": "View system settings and configurations",
        "resource": "settings",
        "action": "read"
    },
    {
        "name": SETTINGS_UPDATE,
        "display_name": "Update Settings",
        "description": "Update system settings and configurations",
        "resource": "settings",
        "action": "update"
    },

    # Patron Groups
    {
        "name": PATRON_GROUPS_CREATE,
        "display_name": "Create Patron Groups",
        "description": "Create patron group definitions",
        "resource": "patron_groups",
        "action": "create"
    },
    {
        "name": PATRON_GROUPS_READ,
        "display_name": "View Patron Groups",
        "description": "View patron group definitions",
        "resource": "patron_groups",
        "action": "read"
    },
    {
        "name": PATRON_GROUPS_UPDATE,
        "display_name": "Update Patron Groups",
        "description": "Update patron group definitions",
        "resource": "patron_groups",
        "action": "update"
    },
    {
        "name": PATRON_GROUPS_DELETE,
        "display_name": "Delete Patron Groups",
        "description": "Delete patron group definitions",
        "resource": "patron_groups",
        "action": "delete"
    },

    # Locations
    {
        "name": LOCATIONS_CREATE,
        "display_name": "Create Locations",
        "description": "Create library location records",
        "resource": "locations",
        "action": "create"
    },
    {
        "name": LOCATIONS_READ,
        "display_name": "View Locations",
        "description": "View library location records",
        "resource": "locations",
        "action": "read"
    },
    {
        "name": LOCATIONS_UPDATE,
        "display_name": "Update Locations",
        "description": "Update library location records",
        "resource": "locations",
        "action": "update"
    },
    {
        "name": LOCATIONS_DELETE,
        "display_name": "Delete Locations",
        "description": "Delete library location records",
        "resource": "locations",
        "action": "delete"
    },

    # Libraries
    {
        "name": LIBRARIES_CREATE,
        "display_name": "Create Libraries",
        "description": "Create library records",
        "resource": "libraries",
        "action": "create"
    },
    {
        "name": LIBRARIES_READ,
        "display_name": "View Libraries",
        "description": "View library records",
        "resource": "libraries",
        "action": "read"
    },
    {
        "name": LIBRARIES_UPDATE,
        "display_name": "Update Libraries",
        "description": "Update library records",
        "resource": "libraries",
        "action": "update"
    },
    {
        "name": LIBRARIES_DELETE,
        "display_name": "Delete Libraries",
        "description": "Delete library records",
        "resource": "libraries",
        "action": "delete"
    },

    # Notifications
    {
        "name": NOTIFICATIONS_CREATE,
        "display_name": "Create Notifications",
        "description": "Create notification records",
        "resource": "notifications",
        "action": "create"
    },
    {
        "name": NOTIFICATIONS_READ,
        "display_name": "View Notifications",
        "description": "View notification records",
        "resource": "notifications",
        "action": "read"
    },
    {
        "name": NOTIFICATIONS_UPDATE,
        "display_name": "Update Notifications",
        "description": "Update notification records",
        "resource": "notifications",
        "action": "update"
    },
    {
        "name": NOTIFICATIONS_DELETE,
        "display_name": "Delete Notifications",
        "description": "Delete notification records",
        "resource": "notifications",
        "action": "delete"
    },

    # Roles
    {
        "name": ROLES_CREATE,
        "display_name": "Create Roles",
        "description": "Create role definitions",
        "resource": "roles",
        "action": "create"
    },
    {
        "name": ROLES_READ,
        "display_name": "View Roles",
        "description": "View role definitions and assignments",
        "resource": "roles",
        "action": "read"
    },
    {
        "name": ROLES_UPDATE,
        "display_name": "Update Roles",
        "description": "Update role definitions and assignments",
        "resource": "roles",
        "action": "update"
    },
    {
        "name": ROLES_DELETE,
        "display_name": "Delete Roles",
        "description": "Delete role definitions",
        "resource": "roles",
        "action": "delete"
    },

    # Permissions
    {
        "name": PERMISSIONS_CREATE,
        "display_name": "Create Permissions",
        "description": "Create permission definitions",
        "resource": "permissions",
        "action": "create"
    },
    {
        "name": PERMISSIONS_READ,
        "display_name": "View Permissions",
        "description": "View permission definitions",
        "resource": "permissions",
        "action": "read"
    },
    {
        "name": PERMISSIONS_UPDATE,
        "display_name": "Update Permissions",
        "description": "Update permission definitions",
        "resource": "permissions",
        "action": "update"
    },
    {
        "name": PERMISSIONS_DELETE,
        "display_name": "Delete Permissions",
        "description": "Delete permission definitions",
        "resource": "permissions",
        "action": "delete"
    },

    # Audit
    {
        "name": AUDIT_READ,
        "display_name": "View Audit Logs",
        "description": "View system audit logs and history",
        "resource": "audit",
        "action": "read"
    },
    {
        "name": AUDIT_EXPORT,
        "display_name": "Export Audit Logs",
        "description": "Export audit logs for compliance",
        "resource": "audit",
        "action": "export"
    },
]
