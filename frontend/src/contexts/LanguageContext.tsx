import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export type Language = 'en' | 'ar'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string, params?: Record<string, any>) => string
  isRTL: boolean
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

// Translation keys
type TranslationKey = string

interface Translations {
  [key: string]: string
}

// English translations
const enTranslations: Translations = {
  // Dashboard
  'dashboard.title': 'Dashboard',
  'dashboard.subtitle': 'Library management system overview',
  'dashboard.refresh': 'Refresh',
  'dashboard.error': 'Error loading dashboard data',

  // Statistics
  'stats.totalItems': 'Total Items',
  'stats.totalItems.desc': 'In catalog',
  'stats.activeLoans': 'Active Loans',
  'stats.activeLoans.desc': 'Currently checked out',
  'stats.totalUsers': 'Total Users',
  'stats.totalUsers.desc': 'Registered users',
  'stats.overdueItems': 'Overdue Items',
  'stats.overdueItems.desc': 'Require attention',

  // Quick Actions
  'quickActions.checkout': 'Quick Check-Out',
  'quickActions.checkout.desc': 'Process a new loan transaction',
  'quickActions.addItem': 'Add New Item',
  'quickActions.addItem.desc': 'Create a new catalog record',
  'quickActions.manageUsers': 'Manage Users',
  'quickActions.manageUsers.desc': 'Add or update patron accounts',
  'quickActions.goTo': 'Go to',

  // Recent Activity
  'activity.recentLoans': 'Recent Loans',
  'activity.noLoans': 'No recent loans',
  'activity.noLoans.desc': 'Loans will appear here in real-time',
  'activity.user': 'User',
  'activity.due': 'Due',
  'activity.active': 'Active',
  'activity.lastUpdated': 'Last 30 seconds',

  // System Status
  'system.status': 'System Status',
  'system.operational': 'All Systems Operational',
  'system.apiStatus': 'API Status',
  'system.apiStatus.desc': 'All systems operational',
  'system.database': 'Database',
  'system.database.desc': 'Connected',
  'system.cache': 'Cache Service',
  'system.cache.desc': 'Redis active',
  'system.overdue': 'Overdue Notices',
  'system.overdue.desc': 'items need attention',
  'system.uptime': 'Uptime',
  'system.performance': 'Performance',
  'system.response': 'Response',

  // Login
  'login.title': 'FOLIO LMS',
  'login.subtitle': 'Sign in to manage your library',
  'login.username': 'Username',
  'login.password': 'Password',
  'login.rememberMe': 'Remember me',
  'login.forgotPassword': 'Forgot password?',
  'login.signIn': 'Sign in',
  'login.signingIn': 'Signing in...',
  'login.defaultCreds': 'Default credentials',
  'login.admin': 'Admin',
  'login.patron': 'Patron',
  'login.security': 'Protected by industry-standard security',
  'login.welcome': 'Welcome back',
  'login.error.username': 'Username is required',
  'login.error.password': 'Password is required',
  'login.error.passwordLength': 'Password must be at least 6 characters',
  'login.error.invalid': 'Invalid credentials. Please try again.',

  // Common
  'common.loading': 'Loading...',
  'common.error': 'Error',
  'common.success': 'Success',
  'common.cancel': 'Cancel',
  'common.save': 'Save',
  'common.delete': 'Delete',
  'common.edit': 'Edit',
  'common.view': 'View',
  'common.search': 'Search',
  'common.filter': 'Filter',
  'common.export': 'Export',
  'common.import': 'Import',
  'common.close': 'Close',
  'common.back': 'Back',
  'common.refresh': 'Refresh',
  'common.previous': 'Previous',
  'common.next': 'Next',
  'common.showing': 'Showing',
  'common.of': 'of',
  'common.page': 'page',
  'common.total': 'total',
  'common.all': 'All',
  'common.active': 'Active',
  'common.inactive': 'Inactive',
  'common.yes': 'Yes',
  'common.no': 'No',
  'common.required': 'Required',

  // Users Module
  'users.title': 'Users',
  'users.subtitle': 'Manage patron accounts and library users',
  'users.newUser': 'New User',
  'users.createUser': 'Create New User',
  'users.editUser': 'Edit User',
  'users.viewUser': 'User Details',
  'users.deleteUser': 'Delete User',
  'users.deleteConfirm': 'Are you sure you want to delete this user?',
  'users.noUsers': 'No users found',
  'users.noUsers.desc': 'Try adjusting your search or filters',
  'users.loading': 'Loading users...',
  'users.searchPlaceholder': 'Search by username, email, name, or barcode...',
  'users.filters': 'Filters',
  'users.showFilters': 'Show Filters',
  'users.hideFilters': 'Hide Filters',

  // User Fields
  'users.username': 'Username',
  'users.email': 'Email',
  'users.password': 'Password',
  'users.barcode': 'Barcode',
  'users.status': 'Status',
  'users.userType': 'User Type',
  'users.patronGroup': 'Patron Group',
  'users.actions': 'Actions',
  'users.name': 'Name',
  'users.phone': 'Phone',
  'users.mobilePhone': 'Mobile Phone',

  // User Types
  'users.type.patron': 'Patron',
  'users.type.staff': 'Staff',
  'users.type.shadow': 'Shadow',
  'users.type.all': 'All Types',

  // User Status
  'users.status.active': 'Active',
  'users.status.inactive': 'Inactive',
  'users.status.activeOnly': 'Active Only',
  'users.status.inactiveOnly': 'Inactive Only',
  'users.status.all': 'All Users',

  // User Form Sections
  'users.form.accountInfo': 'Account Information',
  'users.form.personalInfo': 'Personal Information',
  'users.form.firstName': 'First Name',
  'users.form.lastName': 'Last Name',
  'users.form.middleName': 'Middle Name',
  'users.form.preferredFirstName': 'Preferred First Name',
  'users.form.selectGroup': '-- Select Group --',
  'users.form.passwordHint': 'Min 8 chars, uppercase, lowercase, digit',

  // User Actions
  'users.button.create': 'Create User',
  'users.button.update': 'Update User',
  'users.button.save': 'Saving...',
  'users.button.editUser': 'Edit User',

  // Pagination
  'users.pagination.showing': 'Showing page',
  'users.pagination.totalUsers': 'total users',

  // User Roles
  'users.roles': 'Roles',
  'users.roles.select': 'Select Roles',
  'users.roles.multiSelectHint': 'Hold Ctrl/Cmd to select multiple roles',
  'users.roles.none': 'No roles assigned',

  // Roles & Permissions Module
  'roles.title': 'Roles & Permissions',
  'roles.subtitle': 'Manage user roles and their permissions',
  'roles.addNew': 'Add New Role',
  'roles.createRole': 'Create Role',
  'roles.editRole': 'Edit Role',
  'roles.viewRole': 'View Role',
  'roles.deleteRole': 'Delete Role',
  'roles.deleteConfirm': 'Are you sure you want to delete this role?',
  'roles.noRoles': 'No roles found',
  'roles.noRoles.desc': 'Create your first role to get started',
  'roles.loading': 'Loading roles...',

  // Role Fields
  'roles.roleName': 'Role Name',
  'roles.roleNameInternal': 'Role Name (Internal)',
  'roles.roleNameInternalPlaceholder': 'e.g., librarian',
  'roles.displayName': 'Display Name',
  'roles.displayNamePlaceholder': 'e.g., Librarian',
  'roles.description': 'Description',
  'roles.descriptionPlaceholder': 'Brief description of this role',
  'roles.permissions': 'Permissions',
  'roles.permissionCount': '{count} permissions',
  'roles.systemRole': 'System Role',
  'roles.customRole': 'Custom',
  'roles.system': 'System',
  'roles.actions': 'Actions',

  // Permission Management
  'roles.selectAll': 'Select All',
  'roles.deselectAll': 'Deselect All',
  'roles.permissionCategories': 'Permission Categories',
  'roles.assignPermissions': 'Assign Permissions',
  'roles.updateRole': 'Update Role',

  // Role Form
  'roles.form.basicInfo': 'Role Information',
  'roles.form.permissionSelection': 'Permission Selection',
  'roles.form.roleNameInternal': 'Role Name (Internal)',
  'roles.form.roleNamePlaceholder': 'e.g., librarian',
  'roles.form.displayName': 'Display Name',
  'roles.form.displayNamePlaceholder': 'e.g., Librarian',

  // Role Actions
  'roles.button.create': 'Create Role',
  'roles.button.update': 'Update Role',
  'roles.button.cancel': 'Cancel',
  'roles.button.close': 'Close',

  // Role Messages
  'roles.success.created': 'Role created successfully',
  'roles.success.updated': 'Role updated successfully',
  'roles.success.deleted': 'Role deleted successfully',
  'roles.error.create': 'Failed to create role',
  'roles.error.update': 'Failed to update role',
  'roles.error.delete': 'Failed to delete role',
  'roles.error.systemRole': 'System roles cannot be modified',
  'roles.error.systemRoleDelete': 'System roles cannot be deleted',

  // Patron Groups
  'patronGroups.title': 'Patron Groups',
  'patronGroups.subtitle': 'Manage user categories and loan policies',
  'patronGroups.newGroup': 'New Patron Group',
  'patronGroups.createGroup': 'Create New Patron Group',
  'patronGroups.editGroup': 'Edit Patron Group',
  'patronGroups.deleteGroup': 'Delete Patron Group',
  'patronGroups.deleteConfirm': 'Are you sure you want to delete the patron group',
  'patronGroups.cannotDelete': 'Cannot delete',
  'patronGroups.hasUsers': 'because it has',
  'patronGroups.activeUsers': 'active users',
  'patronGroups.noGroups': 'No patron groups found',
  'patronGroups.noGroups.desc': 'Create a patron group to get started',
  'patronGroups.loading': 'Loading patron groups...',

  // Patron Group Fields
  'patronGroups.groupName': 'Group Name',
  'patronGroups.description': 'Description',
  'patronGroups.loanPeriod': 'Loan Period (Days)',
  'patronGroups.renewalsAllowed': 'Renewals Allowed',
  'patronGroups.userCount': 'User Count',
  'patronGroups.allowRenewals': 'Allow renewals for this group',

  // Patron Group Form
  'patronGroups.form.groupNamePlaceholder': 'e.g., Undergraduate, Graduate, Faculty',
  'patronGroups.form.descriptionPlaceholder': 'Brief description of this patron group',
  'patronGroups.form.loanPeriodPlaceholder': 'e.g., 14, 21, 30',
  'patronGroups.form.loanPeriodHint': 'Default loan period for items borrowed by this group',
  'patronGroups.button.create': 'Create Group',
  'patronGroups.button.update': 'Update Group',

  // Patron Group Messages
  'patronGroups.success.created': 'Patron group created successfully',
  'patronGroups.success.updated': 'Patron group updated successfully',
  'patronGroups.success.deleted': 'Patron group deleted successfully',
  'patronGroups.error.create': 'Failed to create patron group',
  'patronGroups.error.update': 'Failed to update patron group',
  'patronGroups.error.delete': 'Failed to delete patron group',

  // Inventory Module
  'inventory.title': 'Inventory',
  'inventory.subtitle': 'Manage bibliographic instances and catalog records',
  'inventory.hub.title': 'Inventory Management',
  'inventory.hub.subtitle': "Manage your library's catalog, holdings, and items",
  'inventory.newInstance': 'New Instance',
  'inventory.createInstance': 'Create New Instance',
  'inventory.editInstance': 'Edit Instance',
  'inventory.viewInstance': 'Instance Details',
  'inventory.deleteInstance': 'Delete Instance',
  'inventory.deleteConfirm': 'Are you sure you want to delete this instance? This action cannot be undone.',
  'inventory.noInstances': 'No instances found',
  'inventory.noInstances.desc': 'Try adjusting your search or create a new instance',
  'inventory.loading': 'Loading instances...',
  'inventory.searchPlaceholder': 'Search by title, subtitle, author...',
  'inventory.filtersComingSoon': 'Additional filters coming soon...',

  // Inventory Tabs
  'inventory.tabs.instances': 'Instances',
  'inventory.tabs.holdings': 'Holdings',
  'inventory.tabs.items': 'Items',

  // Instance Fields
  'inventory.title.field': 'Title',
  'inventory.subtitle.field': 'Subtitle',
  'inventory.edition': 'Edition',
  'inventory.type': 'Type',
  'inventory.contributors': 'Contributors',
  'inventory.publication': 'Publication',
  'inventory.languages': 'Languages',
  'inventory.subjects': 'Subjects',
  'inventory.identifiers': 'Identifiers',

  // Instance Types
  'inventory.type.text': 'Text',
  'inventory.type.audio': 'Audio',
  'inventory.type.video': 'Video',
  'inventory.type.software': 'Software',
  'inventory.type.map': 'Map',
  'inventory.type.mixed': 'Mixed Materials',

  // Instance Form
  'inventory.form.basicInfo': 'Basic Information',
  'inventory.form.publicationInfo': 'Publication Information',
  'inventory.form.titlePlaceholder': 'Enter the main title',
  'inventory.form.subtitlePlaceholder': 'Enter subtitle if applicable',
  'inventory.form.editionPlaceholder': 'e.g., 1st ed., 2nd rev. ed.',
  'inventory.form.publicationPlaceholder': 'e.g., New York : Publisher, 2023',
  'inventory.form.addPublication': 'Add Publication',
  'inventory.form.primary': 'Primary',

  // Instance Actions
  'inventory.button.create': 'Create Instance',
  'inventory.button.update': 'Update Instance',
  'inventory.button.editInstance': 'Edit Instance',

  // Items Module
  'items.title': 'Items Management',
  'items.subtitle': 'Manage physical item copies with barcodes',
  'items.newItem': 'New Item',
  'items.createItem': 'Create Item',
  'items.editItem': 'Edit Item',
  'items.viewItem': 'View Item',
  'items.deleteItem': 'Delete Item',
  'items.deleteConfirm': 'Are you sure you want to delete this item?',
  'items.noItems': 'No items found',
  'items.noItems.desc': 'Create your first item to get started',
  'items.loading': 'Loading items...',

  // Item Fields
  'items.barcode': 'Barcode',
  'items.barcode.placeholder': 'Scan or enter barcode',
  'items.barcode.search': 'Search by Barcode',
  'items.accessionNumber': 'Accession Number',
  'items.itemIdentifier': 'Item Identifier',
  'items.status': 'Status',
  'items.holding': 'Holding',
  'items.location': 'Location',
  'items.permanentLocation': 'Permanent Location',
  'items.temporaryLocation': 'Temporary Location',
  'items.copyNumber': 'Copy Number',
  'items.volume': 'Volume',
  'items.enumeration': 'Enumeration',
  'items.chronology': 'Chronology',
  'items.numberOfPieces': 'Number of Pieces',
  'items.descriptionOfPieces': 'Description of Pieces',
  'items.discoverySuppress': 'Suppress from discovery',
  'items.copyVolume': 'Copy/Volume',

  // Item Status
  'items.status.available': 'Available',
  'items.status.checked_out': 'Checked Out',
  'items.status.in_transit': 'In Transit',
  'items.status.awaiting_pickup': 'Awaiting Pickup',
  'items.status.on_order': 'On Order',
  'items.status.in_process': 'In Process',
  'items.status.missing': 'Missing',
  'items.status.withdrawn': 'Withdrawn',
  'items.status.lost': 'Lost',
  'items.status.damaged': 'Damaged',
  'items.status.all': 'All Statuses',

  // Item Filters
  'items.filter.status': 'Filter by Status',
  'items.filter.holding': 'Filter by Holding',
  'items.filter.allHoldings': 'All Holdings',

  // Item Form
  'items.form.selectHolding': 'Select Holding',
  'items.form.selectLocation': 'Select Location',
  'items.form.copyPlaceholder': 'c.1',
  'items.form.volumePlaceholder': 'v.1',

  // Item Actions
  'items.button.refresh': 'Refresh',

  // Pagination
  'inventory.pagination.page': 'Page',
  'inventory.pagination.of': 'of',
  'inventory.pagination.totalInstances': 'total instances',
  'inventory.pagination.totalItems': 'total items',

  // Circulation Module
  'circulation.title': 'Circulation',
  'circulation.subtitle': 'Manage check-outs, check-ins, loans, and requests',

  // Circulation Tabs
  'circulation.tabs.checkout': 'Check Out / Check In',
  'circulation.tabs.loans': 'Loans',
  'circulation.tabs.requests': 'Requests (Holds)',

  // Operations
  'circulation.operation.checkout': 'Check Out',
  'circulation.operation.checkin': 'Check In',
  'circulation.operation.renew': 'Renew',

  // Check Out
  'circulation.checkout.title': 'Check Out Item',
  'circulation.checkout.userBarcode': 'User Barcode',
  'circulation.checkout.itemBarcode': 'Item Barcode',
  'circulation.checkout.userPlaceholder': 'Scan or enter user barcode',
  'circulation.checkout.itemPlaceholder': 'Scan or enter item barcode',
  'circulation.checkout.button': 'Check Out Item',
  'circulation.checkout.processing': 'Processing...',
  'circulation.checkout.success': 'Item checked out successfully',

  // Check In
  'circulation.checkin.title': 'Check In Item',
  'circulation.checkin.itemBarcode': 'Item Barcode',
  'circulation.checkin.itemPlaceholder': 'Scan or enter item barcode',
  'circulation.checkin.button': 'Check In Item',
  'circulation.checkin.processing': 'Processing...',
  'circulation.checkin.success': 'Item checked in successfully',

  // Renew
  'circulation.renew.title': 'Renew Loan',
  'circulation.renew.itemBarcode': 'Item Barcode',
  'circulation.renew.itemPlaceholder': 'Scan or enter item barcode',
  'circulation.renew.button': 'Renew Loan',
  'circulation.renew.processing': 'Processing...',
  'circulation.renew.success': 'Loan renewed successfully',

  // Recent Transactions
  'circulation.recent.title': 'Recent Transactions',
  'circulation.recent.clear': 'Clear',
  'circulation.recent.empty': 'No recent transactions',
  'circulation.recent.checkedOut': 'Checked Out',
  'circulation.recent.checkedIn': 'Checked In',
  'circulation.recent.renewed': 'Renewed',
  'circulation.recent.item': 'Item',
  'circulation.recent.user': 'User',
  'circulation.recent.due': 'Due',
  'circulation.recent.overdueFine': 'Overdue fine',
  'circulation.recent.unknownItem': 'Unknown Item',

  // Instructions
  'circulation.instructions.title': 'Instructions',
  'circulation.instructions.scanner': 'Use a barcode scanner or type barcodes manually',
  'circulation.instructions.checkout': 'Check out: Scan user barcode first, then item barcode',
  'circulation.instructions.checkin': 'Check in: Scan item barcode only',
  'circulation.instructions.renew': 'Renew: Scan item barcode to extend due date',
  'circulation.instructions.recent': 'Recent transactions appear in the panel on the right',

  // Loans
  'loans.title': 'All Loans',
  'loans.statusOpen': 'Open',
  'loans.statusClosed': 'Closed',
  'loans.statusOverdue': 'Overdue',
  'loans.overdueOnly': 'Overdue Only',
  'loans.allLoans': 'All Loans',
  'loans.clearFilters': 'Clear Filters',
  'loans.loading': 'Loading loans...',
  'loans.noLoans': 'No loans found',
  'loans.tryAdjusting': 'Try adjusting your filters',
  'loans.renew': 'Renew',
  'loans.filters': 'Filters',
  'loans.status': 'Status',
  'loans.item': 'Item',
  'loans.user': 'User',
  'loans.loanDate': 'Loan Date',
  'loans.dueDate': 'Due Date',
  'loans.renewals': 'Renewals',
  'loans.actions': 'Actions',
  'loans.barcode': 'Barcode',
  'loans.unknownItem': 'Unknown Item',
  'loans.unknownUser': 'Unknown User',
  'loans.daysOverdue': '{days} days overdue',
  'loans.dueToday': 'Due today',
  'loans.dueTomorrow': 'Due tomorrow',
  'loans.dueInDays': 'Due in {days} days',
  'loans.showingPage': 'Showing page {page} of {total_pages} ({total_items} total loans)',

  // Reports Module
  'reports.title': 'Reports',
  'reports.subtitle': 'Generate and export library reports and analytics',
  'reports.generate': 'Generate Report',
  'reports.generating': 'Generating...',
  'reports.export': 'Export',
  'reports.reportType': 'Report Type',
  'reports.dateRange': 'Date Range',
  'reports.startDate': 'Start Date',
  'reports.endDate': 'End Date',
  'reports.exportFormat': 'Export Format',
  'reports.totalReports': 'Total Reports',
  'reports.generatedToday': 'Generated Today',
  'reports.scheduled': 'Scheduled',
  'reports.recentReports': 'Recent Reports',

  // Report Types
  'reports.type.circulation': 'Circulation Report',
  'reports.type.collection': 'Collection Report',
  'reports.type.financial': 'Financial Report',
  'reports.type.overdue': 'Overdue Report',

  // Export Formats
  'reports.format.csv': 'CSV',
  'reports.format.excel': 'Excel',
  'reports.format.pdf': 'PDF',
  'reports.format.json': 'JSON',

  // Report Options
  'reports.options.includeCharts': 'Include Charts',
  'reports.options.includeStatistics': 'Include Statistics',
  'reports.options.includeFines': 'Include Fines',
  'reports.options.summaryOnly': 'Summary Only',
  'reports.options.minDaysOverdue': 'Minimum Days Overdue',

  // Dashboard Stats
  'reports.stats.totalCirculation': 'Total Circulation',
  'reports.stats.activeLoans': 'Active Loans',
  'reports.stats.overdueItems': 'Overdue Items',
  'reports.stats.totalRevenue': 'Total Revenue',

  // Messages
  'reports.success.generated': 'Report generated successfully',
  'reports.error.generate': 'Failed to generate report',
  'reports.error.noData': 'No data available for the selected criteria',
  'reports.noReports': 'No reports generated yet',
  'reports.noReports.desc': 'Generate your first report to get started',

  // Audit Logs Module
  'auditLogs.title': 'Audit Logs',
  'auditLogs.subtitle': 'View and monitor system activity and user actions',
  'auditLogs.timestamp': 'Timestamp',
  'auditLogs.user': 'User',
  'auditLogs.action': 'Action',
  'auditLogs.resourceType': 'Resource Type',
  'auditLogs.resourceId': 'Resource ID',
  'auditLogs.details': 'Details',
  'auditLogs.status': 'Status',
  'auditLogs.ipAddress': 'IP Address',
  'auditLogs.userAgent': 'User Agent',
  'auditLogs.filters': 'Filters',
  'auditLogs.dateRange': 'Date Range',
  'auditLogs.fromDate': 'From Date',
  'auditLogs.toDate': 'To Date',
  'auditLogs.actionType': 'Action Type',
  'auditLogs.userFilter': 'User',
  'auditLogs.resourceTypeFilter': 'Resource Type',
  'auditLogs.searchById': 'Search by ID',
  'auditLogs.searchPlaceholder': 'Search by resource ID or path...',
  'auditLogs.export': 'Export',
  'auditLogs.exportCSV': 'Export CSV',
  'auditLogs.exportExcel': 'Export Excel',
  'auditLogs.applyFilters': 'Apply Filters',
  'auditLogs.clearFilters': 'Clear Filters',
  'auditLogs.noLogs': 'No audit logs found',
  'auditLogs.noLogsDesc': 'Try adjusting your filters or date range',
  'auditLogs.loading': 'Loading audit logs...',
  'auditLogs.showing': 'Showing page',
  'auditLogs.totalLogs': 'total logs',
  'auditLogs.actions': 'Actions',
  'auditLogs.viewDetails': 'View Details',
  'auditLogs.success.exported': 'Audit logs exported successfully',
  'auditLogs.error.fetch': 'Failed to fetch audit logs',
  'auditLogs.error.export': 'Failed to export audit logs',
  'auditLogs.error.noPermission': 'Access Denied',
  'auditLogs.error.noPermissionDesc': 'You do not have permission to view audit logs. Contact your administrator.',

  // Acquisitions Module
  'acquisitions.title': 'Acquisitions',
  'acquisitions.subtitle': 'Manage vendors, funds, purchase orders, and invoices',
  'acquisitions.loading': 'Loading...',
  'acquisitions.totalSpent': 'Total Spent',
  'acquisitions.activeOrders': 'Active Orders',
  'acquisitions.pendingInvoices': 'Pending Invoices',
  'acquisitions.activeVendors': 'Active Vendors',

  // Acquisitions Tabs
  'acquisitions.tabs.vendors': 'Vendors',
  'acquisitions.tabs.funds': 'Funds',
  'acquisitions.tabs.purchaseOrders': 'Purchase Orders',
  'acquisitions.tabs.invoices': 'Invoices',

  // Vendors
  'acquisitions.vendors.title': 'Vendors',
  'acquisitions.vendors.newVendor': 'Create Vendor',
  'acquisitions.vendors.createVendor': 'Create Vendor',
  'acquisitions.vendors.editVendor': 'Edit Vendor',
  'acquisitions.vendors.deleteVendor': 'Delete Vendor',
  'acquisitions.vendors.deleteConfirm': 'Are you sure you want to delete this vendor?',
  'acquisitions.vendors.noVendors': 'No vendors found',
  'acquisitions.vendors.noVendors.desc': 'Create your first vendor to get started',
  'acquisitions.vendors.searchPlaceholder': 'Search by name, code, or description...',

  // Vendor Fields
  'acquisitions.vendors.code': 'Code',
  'acquisitions.vendors.name': 'Name',
  'acquisitions.vendors.description': 'Description',
  'acquisitions.vendors.status': 'Status',
  'acquisitions.vendors.paymentMethod': 'Payment Method',
  'acquisitions.vendors.type': 'Type',
  'acquisitions.vendors.actions': 'Actions',
  'acquisitions.vendors.currency': 'Currency',
  'acquisitions.vendors.language': 'Language',

  // Vendor Status
  'acquisitions.vendors.status.active': 'Active',
  'acquisitions.vendors.status.inactive': 'Inactive',
  'acquisitions.vendors.status.pending': 'Pending',

  // Vendor Type
  'acquisitions.vendors.type.vendor': 'Vendor',
  'acquisitions.vendors.type.customer': 'Customer',
  'acquisitions.vendors.type.both': 'Both',

  // Funds
  'acquisitions.funds.title': 'Funds',
  'acquisitions.funds.newFund': 'Create Fund',
  'acquisitions.funds.createFund': 'Create Fund',
  'acquisitions.funds.editFund': 'Edit Fund',
  'acquisitions.funds.deleteFund': 'Delete Fund',
  'acquisitions.funds.deleteConfirm': 'Are you sure you want to delete this fund?',
  'acquisitions.funds.noFunds': 'No funds found',
  'acquisitions.funds.noFunds.desc': 'Create your first fund to get started',
  'acquisitions.funds.searchPlaceholder': 'Search funds...',

  // Fund Fields
  'acquisitions.funds.code': 'Fund Code',
  'acquisitions.funds.name': 'Fund Name',
  'acquisitions.funds.description': 'Description',
  'acquisitions.funds.status': 'Status',
  'acquisitions.funds.allocated': 'Allocated',
  'acquisitions.funds.available': 'Available',
  'acquisitions.funds.expended': 'Expended',
  'acquisitions.funds.encumbered': 'Encumbered',
  'acquisitions.funds.actions': 'Actions',

  // Fund Status
  'acquisitions.funds.status.active': 'Active',
  'acquisitions.funds.status.inactive': 'Inactive',
  'acquisitions.funds.status.frozen': 'Frozen',

  // Purchase Orders
  'acquisitions.po.title': 'Purchase Orders',
  'acquisitions.po.newOrder': 'Create Order',
  'acquisitions.po.createOrder': 'Create Purchase Order',
  'acquisitions.po.editOrder': 'Edit Purchase Order',
  'acquisitions.po.deleteOrder': 'Delete Purchase Order',
  'acquisitions.po.deleteConfirm': 'Are you sure you want to delete this purchase order?',
  'acquisitions.po.noOrders': 'No purchase orders found',
  'acquisitions.po.noOrders.desc': 'Create your first purchase order',
  'acquisitions.po.searchPlaceholder': 'Search purchase orders...',

  // PO Fields
  'acquisitions.po.number': 'PO Number',
  'acquisitions.po.vendor': 'Vendor',
  'acquisitions.po.status': 'Status',
  'acquisitions.po.orderDate': 'Order Date',
  'acquisitions.po.totalAmount': 'Total Amount',
  'acquisitions.po.description': 'Description',
  'acquisitions.po.fund': 'Fund',
  'acquisitions.po.actions': 'Actions',

  // PO Status
  'acquisitions.po.status.pending': 'Pending',
  'acquisitions.po.status.open': 'Open',
  'acquisitions.po.status.closed': 'Closed',
  'acquisitions.po.status.cancelled': 'Cancelled',

  // Invoices
  'acquisitions.invoices.title': 'Invoices',
  'acquisitions.invoices.newInvoice': 'Create Invoice',
  'acquisitions.invoices.createInvoice': 'Create Invoice',
  'acquisitions.invoices.editInvoice': 'Edit Invoice',
  'acquisitions.invoices.deleteInvoice': 'Delete Invoice',
  'acquisitions.invoices.deleteConfirm': 'Are you sure you want to delete this invoice?',
  'acquisitions.invoices.noInvoices': 'No invoices found',
  'acquisitions.invoices.noInvoices.desc': 'Create your first invoice',
  'acquisitions.invoices.searchPlaceholder': 'Search invoices...',

  // Invoice Fields
  'acquisitions.invoices.number': 'Invoice Number',
  'acquisitions.invoices.vendor': 'Vendor',
  'acquisitions.invoices.status': 'Status',
  'acquisitions.invoices.invoiceDate': 'Invoice Date',
  'acquisitions.invoices.dueDate': 'Due Date',
  'acquisitions.invoices.amount': 'Amount',
  'acquisitions.invoices.paid': 'Paid',
  'acquisitions.invoices.balance': 'Balance',
  'acquisitions.invoices.actions': 'Actions',

  // Invoice Status
  'acquisitions.invoices.status.open': 'Open',
  'acquisitions.invoices.status.paid': 'Paid',
  'acquisitions.invoices.status.cancelled': 'Cancelled',
  'acquisitions.invoices.status.pending': 'Pending',

  // Common Acquisitions
  'acquisitions.button.create': 'Create',
  'acquisitions.button.update': 'Update',
  'acquisitions.button.creating': 'Creating...',
  'acquisitions.button.updating': 'Updating...',
  'acquisitions.button.search': 'Search',
  'acquisitions.form.codePlaceholder': 'Enter code',
  'acquisitions.form.namePlaceholder': 'Enter name',
  'acquisitions.form.descriptionPlaceholder': 'Enter description',
  'acquisitions.pagination.showing': 'Showing page',
  'acquisitions.pagination.of': 'of',
  'acquisitions.pagination.total': 'total',

  // Holds/Requests Module
  'holds.title': 'Holds & Requests',
  'holds.subtitle': 'Manage patron hold requests and item recalls',
  'holds.newRequest': 'New Request',
  'holds.createRequest': 'Create Hold Request',
  'holds.cancelRequest': 'Cancel Request',
  'holds.viewRequest': 'Request Details',
  'holds.cancelConfirm': 'Are you sure you want to cancel this request?',
  'holds.noRequests': 'No requests found',
  'holds.noRequests.desc': 'Try adjusting your filters or create a new request',
  'holds.loading': 'Loading requests...',
  'holds.refresh': 'Refresh',
  'holds.totalRequests': 'Total Requests',
  'holds.openRequests': 'Open Requests',
  'holds.requestsToday': 'Requests Today',
  'holds.avgQueuePosition': 'Avg Queue Position',

  // Request Fields
  'holds.position': 'Position',
  'holds.item': 'Item',
  'holds.itemBarcode': 'Item Barcode',
  'holds.user': 'User',
  'holds.userBarcode': 'User Barcode',
  'holds.requestType': 'Request Type',
  'holds.requestDate': 'Request Date',
  'holds.expirationDate': 'Expiration Date',
  'holds.status': 'Status',
  'holds.actions': 'Actions',
  'holds.pickupLocation': 'Pickup Service Point',
  'holds.queuePosition': 'Queue Position',
  'holds.noExpiration': 'No expiration',

  // Request Types
  'holds.type.hold': 'Hold',
  'holds.type.recall': 'Recall',
  'holds.type.page': 'Page',
  'holds.type.all': 'All Types',

  // Request Status
  'holds.status.open': 'Open',
  'holds.status.closed': 'Closed',
  'holds.status.cancelled': 'Cancelled',
  'holds.status.awaiting_pickup': 'Awaiting Pickup',
  'holds.status.in_transit': 'In Transit',
  'holds.status.openOnly': 'Open Only',
  'holds.status.all': 'All Requests',

  // Request Actions
  'holds.action.cancel': 'Cancel',
  'holds.action.view': 'View Details',
  'holds.action.refresh': 'Refresh',
  'holds.action.createNew': 'Create New Request',

  // Create Request Modal
  'holds.create.title': 'Create New Hold Request',
  'holds.create.userBarcode': 'User Barcode',
  'holds.create.userBarcodePlaceholder': 'Scan or enter user barcode',
  'holds.create.itemBarcode': 'Item Barcode',
  'holds.create.itemBarcodePlaceholder': 'Scan or enter item barcode',
  'holds.create.requestType': 'Request Type',
  'holds.create.expirationDate': 'Expiration Date (Optional)',
  'holds.create.pickupLocation': 'Pickup Service Point',
  'holds.create.selectPickup': 'Select pickup location',
  'holds.create.button': 'Create Request',
  'holds.create.processing': 'Creating...',
  'holds.create.cancel': 'Cancel',

  // Request Info
  'holds.info.requestedBy': 'Requested By',
  'holds.info.itemTitle': 'Item Title',
  'holds.info.requestedOn': 'Requested On',
  'holds.info.expiresOn': 'Expires On',
  'holds.info.currentPosition': 'Current Position in Queue',
  'holds.info.estimatedAvailability': 'Estimated Availability',

  // Filters
  'holds.filter.status': 'Filter by Status',
  'holds.filter.type': 'Filter by Type',
  'holds.filter.clear': 'Clear Filters',
  'holds.filter.showFilters': 'Show Filters',
  'holds.filter.hideFilters': 'Hide Filters',

  // Messages
  'holds.success.created': 'Request created successfully',
  'holds.success.cancelled': 'Request cancelled successfully',
  'holds.error.create': 'Failed to create request',
  'holds.error.cancel': 'Failed to cancel request',
  'holds.error.fetch': 'Failed to load requests',
  'holds.error.userNotFound': 'User not found with that barcode',
  'holds.error.itemNotFound': 'Item not found with that barcode',
  'holds.error.itemNotAvailable': 'Item is not available for hold',

  // Pagination
  'holds.pagination.showing': 'Showing page',
  'holds.pagination.of': 'of',
  'holds.pagination.totalRequests': 'total requests',

  // Queue
  'holds.queue.position': 'Position in Queue',
  'holds.queue.first': '1st in queue',
  'holds.queue.second': '2nd in queue',
  'holds.queue.third': '3rd in queue',
  'holds.queue.nth': 'in queue',

  // Fees/Fines Module
  'fees.title': 'Fees/Fines',
  'fees.subtitle': 'Manage patron fees, fines, and payments',
  'fees.newFee': 'New Fee',
  'fees.createFee': 'Create Manual Fee',
  'fees.editFee': 'Edit Fee',
  'fees.viewFee': 'Fee Details',
  'fees.deleteFee': 'Delete Fee',
  'fees.deleteConfirm': 'Are you sure you want to delete this fee?',
  'fees.noFees': 'No fees found',
  'fees.noFees.desc': 'All fees will appear here',
  'fees.loading': 'Loading fees...',
  'fees.searchPlaceholder': 'Search by user name, barcode, or fee type...',
  'fees.totalOwed': 'Total Owed',
  'fees.allFees': 'All Fees',
  'fees.openFees': 'Open Fees',

  // Fee Fields
  'fees.user': 'User',
  'fees.userId': 'User ID',
  'fees.feeType': 'Fee Type',
  'fees.status': 'Status',
  'fees.amount': 'Amount',
  'fees.remaining': 'Remaining',
  'fees.dateCreated': 'Date Created',
  'fees.dateDue': 'Date Due',
  'fees.actions': 'Actions',
  'fees.reason': 'Reason',
  'fees.description': 'Description',
  'fees.item': 'Item',

  // Fee Types
  'fees.type.overdue': 'Overdue Fine',
  'fees.type.lost_item': 'Lost Item',
  'fees.type.damaged_item': 'Damaged Item',
  'fees.type.processing': 'Processing Fee',
  'fees.type.replacement': 'Replacement Fee',
  'fees.type.manual': 'Manual Fee',
  'fees.type.all': 'All Types',

  // Fee Status
  'fees.status.open': 'Open',
  'fees.status.closed': 'Closed',
  'fees.status.suspended': 'Suspended',
  'fees.status.openOnly': 'Open Only',
  'fees.status.closedOnly': 'Closed Only',
  'fees.status.all': 'All Statuses',

  // Fee Actions
  'fees.action.pay': 'Record Payment',
  'fees.action.waive': 'Waive Fee',
  'fees.action.forgive': 'Forgive Fee',
  'fees.action.viewDetails': 'View Details',
  'fees.action.cancel': 'Cancel Fee',

  // Payment Modal
  'fees.payment.title': 'Record Payment',
  'fees.payment.amount': 'Payment Amount',
  'fees.payment.method': 'Payment Method',
  'fees.payment.note': 'Payment Note',
  'fees.payment.button': 'Process Payment',
  'fees.payment.processing': 'Processing...',
  'fees.payment.success': 'Payment recorded successfully',
  'fees.payment.partial': 'Partial Payment',
  'fees.payment.full': 'Full Payment',
  'fees.payment.amountPlaceholder': 'Enter payment amount',
  'fees.payment.notePlaceholder': 'Optional note about this payment',

  // Payment Methods
  'fees.method.cash': 'Cash',
  'fees.method.check': 'Check',
  'fees.method.credit_card': 'Credit Card',
  'fees.method.transfer': 'Bank Transfer',
  'fees.method.waive': 'Waive',
  'fees.method.forgive': 'Forgive',
  'fees.method.selectMethod': 'Select Payment Method',

  // Waive Modal
  'fees.waive.title': 'Waive Fee',
  'fees.waive.reason': 'Waive Reason',
  'fees.waive.reasonPlaceholder': 'Explain why this fee is being waived',
  'fees.waive.button': 'Waive Fee',
  'fees.waive.processing': 'Processing...',
  'fees.waive.success': 'Fee waived successfully',

  // Fee Form
  'fees.form.userBarcode': 'User Barcode',
  'fees.form.userBarcodePlaceholder': 'Scan or enter user barcode',
  'fees.form.feeTypeLabel': 'Fee Type',
  'fees.form.amountLabel': 'Amount',
  'fees.form.amountPlaceholder': 'Enter fee amount',
  'fees.form.reasonLabel': 'Reason/Description',
  'fees.form.reasonPlaceholder': 'Explain the reason for this fee',
  'fees.form.descriptionPlaceholder': 'Additional details about this fee',
  'fees.button.create': 'Create Fee',
  'fees.button.update': 'Update Fee',

  // Payment History
  'fees.history.title': 'Payment History',
  'fees.history.noPayments': 'No payments recorded',
  'fees.history.date': 'Date',
  'fees.history.method': 'Method',
  'fees.history.amount': 'Amount',
  'fees.history.note': 'Note',
  'fees.history.by': 'By',

  // Fee Details
  'fees.details.feeInfo': 'Fee Information',
  'fees.details.createdBy': 'Created By',
  'fees.details.lastUpdated': 'Last Updated',
  'fees.details.paidAmount': 'Paid Amount',
  'fees.details.waivedAmount': 'Waived Amount',

  // Fee Filters
  'fees.filter.status': 'Filter by Status',
  'fees.filter.type': 'Filter by Type',
  'fees.filter.user': 'Filter by User',

  // Fee Messages
  'fees.success.created': 'Fee created successfully',
  'fees.success.updated': 'Fee updated successfully',
  'fees.success.deleted': 'Fee deleted successfully',
  'fees.error.create': 'Failed to create fee',
  'fees.error.update': 'Failed to update fee',
  'fees.error.delete': 'Failed to delete fee',
  'fees.error.insufficientAmount': 'Payment amount exceeds remaining balance',
  'fees.error.invalidAmount': 'Please enter a valid amount',

  // Fees - Tabs
  'fees.tabs.fees': 'Fees',

  // Fees - Filters
  'fees.filters.allStatuses': 'All Statuses',
  'fees.filters.allTypes': 'All Types',

  // Fees - Table Headers
  'fees.table.type': 'Type',
  'fees.table.status': 'Status',
  'fees.table.amount': 'Amount',
  'fees.table.remaining': 'Remaining',
  'fees.table.description': 'Description',
  'fees.table.date': 'Date',

  // Fees - Additional Status
  'fees.autoGenerated': 'Auto-generated',
  'fees.paid': 'Paid',
  'fees.pay': 'Pay',
  'fees.waive': 'Waive',

  // Fees - Modal Titles
  'fees.modal.createFee': 'Create Fee',
  'fees.modal.recordPayment': 'Record Payment',
  'fees.modal.waiveFee': 'Waive Fee',
  'fees.modal.feeDetails': 'Fee Details',

  // Fees - Modal Fields
  'fees.modal.type': 'Type',
  'fees.modal.status': 'Status',
  'fees.modal.originalAmount': 'Original Amount',
  'fees.modal.remaining': 'Remaining',
  'fees.modal.paid': 'Paid',
  'fees.modal.feeDate': 'Fee Date',
  'fees.modal.description': 'Description',
  'fees.modal.reason': 'Reason',
  'fees.modal.paymentHistory': 'Payment History',
  'fees.modal.noPayments': 'No payments recorded',
  'fees.modal.ref': 'Ref',
  'fees.modal.balance': 'Balance',

  // Fees - Form Fields
  'fees.form.userId': 'User ID',
  'fees.form.userIdPlaceholder': 'Enter user ID',
  'fees.form.userIdHint': 'Enter the ID of the user to charge this fee to',
  'fees.form.feeType': 'Fee Type',
  'fees.form.amount': 'Amount',
  'fees.form.description': 'Description',
  'fees.form.descriptionPlaceholder': 'Enter description',
  'fees.form.reason': 'Reason',
  'fees.form.reasonPlaceholder': 'Enter reason for this fee',
  'fees.form.fee': 'Fee',
  'fees.form.remainingBalance': 'Remaining Balance',
  'fees.form.paymentMethod': 'Payment Method',
  'fees.form.maximum': 'Maximum',
  'fees.form.transactionInfo': 'Transaction Info',
  'fees.form.transactionInfoPlaceholder': 'Enter transaction reference',
  'fees.form.comments': 'Comments',
  'fees.form.commentsPlaceholder': 'Enter any comments',
  'fees.form.action': 'Action',
  'fees.form.amountOptional': 'Amount (Optional)',
  'fees.form.fullAmount': 'Full amount',
  'fees.form.waiveReasonPlaceholder': 'Enter reason for waiving this fee',

  // Fees - Payment Methods
  'fees.paymentMethods.cash': 'Cash',
  'fees.paymentMethods.check': 'Check',
  'fees.paymentMethods.creditCard': 'Credit Card',
  'fees.paymentMethods.transfer': 'Bank Transfer',

  // Fees - Actions
  'fees.actions.waive': 'Waive',
  'fees.actions.forgive': 'Forgive',

  // Fees - Buttons
  'fees.button.createFee': 'Create Fee',
  'fees.button.recordPayment': 'Record Payment',
  'fees.button.waiveForgive': 'Waive/Forgive',

  // Search Module
  'search.title': 'Advanced Search',
  'search.subtitle': 'Search across the entire catalog with advanced filters',
  'search.placeholder': 'Search by title, author, subject...',

  // Search - Buttons
  'search.button.search': 'Search',
  'search.button.showFilters': 'Show Filters',
  'search.button.hideFilters': 'Hide Filters',

  // Search - Filters
  'search.filters.title': 'Filters',
  'search.filters.clearAll': 'Clear All',
  'search.filters.publicationYear': 'Publication Year',
  'search.filters.from': 'From',
  'search.filters.to': 'To',
  'search.filters.instanceType': 'Instance Type',
  'search.filters.language': 'Language',
  'search.filters.subject': 'Subject',
  'search.filters.applyFilters': 'Apply Filters',

  // Search - Results
  'search.results.showing': 'Showing',
  'search.results.to': 'to',
  'search.results.of': 'of',
  'search.results.results': 'results',
  'search.results.for': 'for',
  'search.results.authors': 'Author(s)',
  'search.results.edition': 'Edition',
  'search.results.year': 'Year',
  'search.results.publisher': 'Publisher',
  'search.results.languages': 'Languages',

  // Search - No Results
  'search.noResults.title': 'No results found',
  'search.noResults.withQuery': 'No items match your search for',
  'search.noResults.enterQuery': 'Enter a search query to find items in the catalog',

  // Search - Pagination
  'search.pagination.previous': 'Previous',
  'search.pagination.next': 'Next',

  // Search - Errors
  'search.error.serviceUnavailable': 'Search Service Unavailable',
  'search.error.serviceMessage': 'The Elasticsearch search service is currently unavailable. Please ensure Elasticsearch is running.',
  'search.error.retryConnection': 'Retry Connection',

  // Courses Module
  'courses.title': 'Course Reserves',
  'courses.subtitle': 'Manage courses and reserve materials',
  'courses.newCourse': 'New Course',
  'courses.searchPlaceholder': 'Search by course name, code, or description...',

  // Courses - Filters
  'courses.status': 'Status',
  'courses.allCourses': 'All Courses',
  'courses.activeOnly': 'Active Only',
  'courses.inactiveOnly': 'Inactive Only',
  'courses.term': 'Term',
  'courses.termPlaceholder': 'e.g., Fall 2024, Spring 2025',

  // Courses - Table
  'courses.table.code': 'Code',
  'courses.table.name': 'Name',
  'courses.table.instructor': 'Instructor',
  'courses.table.term': 'Term',
  'courses.table.dates': 'Dates',
  'courses.table.reserves': 'Reserves',
  'courses.table.status': 'Status',
  'courses.table.actions': 'Actions',

  // Courses - Status
  'courses.active': 'Active',
  'courses.inactive': 'Inactive',

  // Courses - Actions
  'courses.view': 'View',
  'courses.edit': 'Edit',
  'courses.delete': 'Delete',

  // Courses - Modal
  'courses.modal.create': 'Create New Course',
  'courses.modal.edit': 'Edit Course',
  'courses.modal.view': 'Course Details',

  // Courses - Form
  'courses.form.code': 'Course Code',
  'courses.form.name': 'Course Name',
  'courses.form.description': 'Description',
  'courses.form.instructor': 'Instructor',
  'courses.form.term': 'Term',
  'courses.form.startDate': 'Start Date',
  'courses.form.endDate': 'End Date',
  'courses.form.status': 'Status',
  'courses.form.notes': 'Notes',

  // Courses - Messages
  'courses.noCourses': 'No courses found',
  'courses.loading': 'Loading courses...',
  'courses.deleteConfirm': 'Are you sure you want to delete this course?',

  // Books Module
  'books.catalog_title': 'Discover Your Next Great Read',
  'books.catalog_subtitle': 'Browse through thousands of books in our digital library',
  'books.search_placeholder': 'Search by title, author, or ISBN...',
  'books.books_found': 'books found',
  'books.category': 'Category',
  'books.all_categories': 'All Categories',
  'books.technology': 'Technology',
  'books.science': 'Science',
  'books.history': 'History',
  'books.literature': 'Literature',
  'books.language': 'Language',
  'books.all_languages': 'All Languages',
  'books.availability': 'Availability',
  'books.all_books': 'All Books',
  'books.available_only': 'Available Only',
  'books.borrowed_only': 'Borrowed Only',
  'books.available': 'Available',
  'books.borrowed': 'Borrowed',
  'books.view_details': 'View Details',
  'books.no_books_found': 'No Books Found',
  'books.try_different_search': 'Try adjusting your search or filters',

  // Book Details Page
  'books.not_found': 'Book Not Found',
  'books.back_to_catalog': 'Back to Catalog',
  'books.borrow_now': 'Borrow Now',
  'books.not_available': 'Not Available',
  'books.favorite': 'Favorite',
  'books.favorited': 'Favorited',
  'books.share': 'Share',
  'books.copies_available': 'Copies Available',
  'books.currently_available': 'Currently Available',
  'books.copies_ready_to_borrow': 'copies ready to borrow',
  'books.loan_details': 'Loan Details',
  'books.loan_period': 'Loan Period',
  'books.days': 'days',
  'books.renewals': 'Renewals',
  'books.times': 'times',
  'books.year': 'Year',
  'books.location': 'Location',
  'books.tab_overview': 'Overview',
  'books.tab_details': 'Details',
  'books.tab_availability': 'Availability',
  'books.description': 'Description',
  'books.sample_description': 'This comprehensive book covers fundamental concepts and advanced techniques in computer science. Perfect for students and professionals alike, it provides in-depth explanations and practical examples.',
  'books.subjects': 'Subjects',
  'books.isbn': 'ISBN',
  'books.pages': 'Pages',
  'books.pages_unit': 'pages',
  'books.publisher': 'Publisher',
  'books.edition': 'Edition',
  'books.similar_books': 'Similar Books',
  'books.similar_books_coming_soon': 'Similar book recommendations coming soon',

  // Language
  'language.english': 'English',
  'language.arabic': 'العربية',
  'language.switch': 'Switch Language',
}

// Arabic translations
const arTranslations: Translations = {
  // Dashboard
  'dashboard.title': 'لوحة التحكم',
  'dashboard.subtitle': 'نظرة عامة على نظام إدارة المكتبة',
  'dashboard.refresh': 'تحديث',
  'dashboard.error': 'خطأ في تحميل بيانات لوحة التحكم',

  // Statistics
  'stats.totalItems': 'إجمالي العناصر',
  'stats.totalItems.desc': 'في الكتالوج',
  'stats.activeLoans': 'القروض النشطة',
  'stats.activeLoans.desc': 'المستعارة حالياً',
  'stats.totalUsers': 'إجمالي المستخدمين',
  'stats.totalUsers.desc': 'المستخدمون المسجلون',
  'stats.overdueItems': 'العناصر المتأخرة',
  'stats.overdueItems.desc': 'تحتاج إلى اهتمام',

  // Quick Actions
  'quickActions.checkout': 'إعارة سريعة',
  'quickActions.checkout.desc': 'معالجة معاملة إعارة جديدة',
  'quickActions.addItem': 'إضافة عنصر جديد',
  'quickActions.addItem.desc': 'إنشاء سجل كتالوج جديد',
  'quickActions.manageUsers': 'إدارة المستخدمين',
  'quickActions.manageUsers.desc': 'إضافة أو تحديث حسابات المستفيدين',
  'quickActions.goTo': 'انتقل إلى',

  // Recent Activity
  'activity.recentLoans': 'القروض الأخيرة',
  'activity.noLoans': 'لا توجد قروض حديثة',
  'activity.noLoans.desc': 'ستظهر القروض هنا في الوقت الفعلي',
  'activity.user': 'المستخدم',
  'activity.due': 'الاستحقاق',
  'activity.active': 'نشط',
  'activity.lastUpdated': 'آخر 30 ثانية',

  // System Status
  'system.status': 'حالة النظام',
  'system.operational': 'جميع الأنظمة تعمل',
  'system.apiStatus': 'حالة API',
  'system.apiStatus.desc': 'جميع الأنظمة تعمل',
  'system.database': 'قاعدة البيانات',
  'system.database.desc': 'متصل',
  'system.cache': 'خدمة التخزين المؤقت',
  'system.cache.desc': 'Redis نشط',
  'system.overdue': 'إشعارات التأخير',
  'system.overdue.desc': 'عنصر يحتاج إلى اهتمام',
  'system.uptime': 'وقت التشغيل',
  'system.performance': 'الأداء',
  'system.response': 'الاستجابة',

  // Login
  'login.title': 'نظام إدارة المكتبة فوليو',
  'login.subtitle': 'تسجيل الدخول لإدارة مكتبتك',
  'login.username': 'اسم المستخدم',
  'login.password': 'كلمة المرور',
  'login.rememberMe': 'تذكرني',
  'login.forgotPassword': 'نسيت كلمة المرور؟',
  'login.signIn': 'تسجيل الدخول',
  'login.signingIn': 'جاري تسجيل الدخول...',
  'login.defaultCreds': 'بيانات الاعتماد الافتراضية',
  'login.admin': 'مسؤول',
  'login.patron': 'مستعير',
  'login.security': 'محمي بمعايير أمان صناعية',
  'login.welcome': 'مرحباً بعودتك',
  'login.error.username': 'اسم المستخدم مطلوب',
  'login.error.password': 'كلمة المرور مطلوبة',
  'login.error.passwordLength': 'يجب أن تكون كلمة المرور 6 أحرف على الأقل',
  'login.error.invalid': 'بيانات اعتماد غير صالحة. يرجى المحاولة مرة أخرى.',

  // Common
  'common.loading': 'جاري التحميل...',
  'common.error': 'خطأ',
  'common.success': 'نجح',
  'common.cancel': 'إلغاء',
  'common.save': 'حفظ',
  'common.delete': 'حذف',
  'common.edit': 'تعديل',
  'common.view': 'عرض',
  'common.search': 'بحث',
  'common.filter': 'تصفية',
  'common.export': 'تصدير',
  'common.import': 'استيراد',
  'common.close': 'إغلاق',
  'common.back': 'رجوع',
  'common.refresh': 'تحديث',
  'common.previous': 'السابق',
  'common.next': 'التالي',
  'common.showing': 'عرض',
  'common.of': 'من',
  'common.page': 'صفحة',
  'common.total': 'إجمالي',
  'common.all': 'الكل',
  'common.active': 'نشط',
  'common.inactive': 'غير نشط',
  'common.yes': 'نعم',
  'common.no': 'لا',
  'common.required': 'مطلوب',

  // Users Module
  'users.title': 'المستخدمون',
  'users.subtitle': 'إدارة حسابات المستفيدين ومستخدمي المكتبة',
  'users.newUser': 'مستخدم جديد',
  'users.createUser': 'إنشاء مستخدم جديد',
  'users.editUser': 'تعديل المستخدم',
  'users.viewUser': 'تفاصيل المستخدم',
  'users.deleteUser': 'حذف المستخدم',
  'users.deleteConfirm': 'هل أنت متأكد من حذف هذا المستخدم؟',
  'users.noUsers': 'لم يتم العثور على مستخدمين',
  'users.noUsers.desc': 'حاول تعديل البحث أو الفلاتر',
  'users.loading': 'جاري تحميل المستخدمين...',
  'users.searchPlaceholder': 'البحث باسم المستخدم أو البريد الإلكتروني أو الاسم أو الباركود...',
  'users.filters': 'الفلاتر',
  'users.showFilters': 'إظهار الفلاتر',
  'users.hideFilters': 'إخفاء الفلاتر',

  // User Fields
  'users.username': 'اسم المستخدم',
  'users.email': 'البريد الإلكتروني',
  'users.password': 'كلمة المرور',
  'users.barcode': 'الباركود',
  'users.status': 'الحالة',
  'users.userType': 'نوع المستخدم',
  'users.patronGroup': 'مجموعة المستفيدين',
  'users.actions': 'الإجراءات',
  'users.name': 'الاسم',
  'users.phone': 'الهاتف',
  'users.mobilePhone': 'الهاتف المحمول',

  // User Types
  'users.type.patron': 'مستفيد',
  'users.type.staff': 'موظف',
  'users.type.shadow': 'ظل',
  'users.type.all': 'جميع الأنواع',

  // User Status
  'users.status.active': 'نشط',
  'users.status.inactive': 'غير نشط',
  'users.status.activeOnly': 'النشطون فقط',
  'users.status.inactiveOnly': 'غير النشطين فقط',
  'users.status.all': 'جميع المستخدمين',

  // User Form Sections
  'users.form.accountInfo': 'معلومات الحساب',
  'users.form.personalInfo': 'المعلومات الشخصية',
  'users.form.firstName': 'الاسم الأول',
  'users.form.lastName': 'اسم العائلة',
  'users.form.middleName': 'الاسم الأوسط',
  'users.form.preferredFirstName': 'الاسم الأول المفضل',
  'users.form.selectGroup': '-- اختر مجموعة --',
  'users.form.passwordHint': 'الحد الأدنى 8 أحرف، أحرف كبيرة وصغيرة، رقم',

  // User Actions
  'users.button.create': 'إنشاء مستخدم',
  'users.button.update': 'تحديث المستخدم',
  'users.button.save': 'جاري الحفظ...',
  'users.button.editUser': 'تعديل المستخدم',

  // Pagination
  'users.pagination.showing': 'عرض صفحة',
  'users.pagination.totalUsers': 'إجمالي المستخدمين',

  // User Roles
  'users.roles': 'الأدوار',
  'users.roles.select': 'اختر الأدوار',
  'users.roles.multiSelectHint': 'اضغط Ctrl/Cmd لاختيار عدة أدوار',
  'users.roles.none': 'لا توجد أدوار مخصصة',

  // Roles & Permissions Module
  'roles.title': 'الأدوار والصلاحيات',
  'roles.subtitle': 'إدارة أدوار المستخدمين وصلاحياتهم',
  'roles.addNew': 'إضافة دور جديد',
  'roles.createRole': 'إنشاء دور',
  'roles.editRole': 'تعديل الدور',
  'roles.viewRole': 'عرض الدور',
  'roles.deleteRole': 'حذف الدور',
  'roles.deleteConfirm': 'هل أنت متأكد من حذف هذا الدور؟',
  'roles.noRoles': 'لا توجد أدوار',
  'roles.noRoles.desc': 'قم بإنشاء دور جديد للبدء',
  'roles.loading': 'جاري تحميل الأدوار...',

  // Role Fields
  'roles.roleName': 'اسم الدور',
  'roles.roleNameInternal': 'اسم الدور (داخلي)',
  'roles.roleNameInternalPlaceholder': 'مثال: librarian',
  'roles.displayName': 'الاسم المعروض',
  'roles.displayNamePlaceholder': 'مثال: أمين مكتبة',
  'roles.description': 'الوصف',
  'roles.descriptionPlaceholder': 'وصف مختصر لهذا الدور',
  'roles.permissions': 'الصلاحيات',
  'roles.permissionCount': '{count} صلاحية',
  'roles.systemRole': 'دور النظام',
  'roles.customRole': 'مخصص',
  'roles.system': 'نظام',
  'roles.actions': 'الإجراءات',

  // Permission Management
  'roles.selectAll': 'اختيار الكل',
  'roles.deselectAll': 'إلغاء اختيار الكل',
  'roles.permissionCategories': 'فئات الصلاحيات',
  'roles.assignPermissions': 'تعيين الصلاحيات',
  'roles.updateRole': 'تحديث الدور',

  // Role Form
  'roles.form.basicInfo': 'معلومات الدور',
  'roles.form.permissionSelection': 'اختيار الصلاحيات',
  'roles.form.roleNameInternal': 'اسم الدور (داخلي)',
  'roles.form.roleNamePlaceholder': 'مثال: librarian',
  'roles.form.displayName': 'الاسم المعروض',
  'roles.form.displayNamePlaceholder': 'مثال: أمين مكتبة',

  // Role Actions
  'roles.button.create': 'إنشاء دور',
  'roles.button.update': 'تحديث الدور',
  'roles.button.cancel': 'إلغاء',
  'roles.button.close': 'إغلاق',

  // Role Messages
  'roles.success.created': 'تم إنشاء الدور بنجاح',
  'roles.success.updated': 'تم تحديث الدور بنجاح',
  'roles.success.deleted': 'تم حذف الدور بنجاح',
  'roles.error.create': 'فشل إنشاء الدور',
  'roles.error.update': 'فشل تحديث الدور',
  'roles.error.delete': 'فشل حذف الدور',
  'roles.error.systemRole': 'لا يمكن تعديل أدوار النظام',
  'roles.error.systemRoleDelete': 'لا يمكن حذف أدوار النظام',

  // Patron Groups
  'patronGroups.title': 'مجموعات المستفيدين',
  'patronGroups.subtitle': 'إدارة فئات المستخدمين وسياسات الإعارة',
  'patronGroups.newGroup': 'مجموعة جديدة',
  'patronGroups.createGroup': 'إنشاء مجموعة جديدة',
  'patronGroups.editGroup': 'تعديل المجموعة',
  'patronGroups.deleteGroup': 'حذف المجموعة',
  'patronGroups.deleteConfirm': 'هل أنت متأكد من حذف مجموعة المستفيدين',
  'patronGroups.cannotDelete': 'لا يمكن الحذف',
  'patronGroups.hasUsers': 'لأنها تحتوي على',
  'patronGroups.activeUsers': 'مستخدمون نشطون',
  'patronGroups.noGroups': 'لم يتم العثور على مجموعات مستفيدين',
  'patronGroups.noGroups.desc': 'أنشئ مجموعة مستفيدين للبدء',
  'patronGroups.loading': 'جاري تحميل مجموعات المستفيدين...',

  // Patron Group Fields
  'patronGroups.groupName': 'اسم المجموعة',
  'patronGroups.description': 'الوصف',
  'patronGroups.loanPeriod': 'فترة الإعارة (أيام)',
  'patronGroups.renewalsAllowed': 'التجديد مسموح',
  'patronGroups.userCount': 'عدد المستخدمين',
  'patronGroups.allowRenewals': 'السماح بالتجديد لهذه المجموعة',

  // Patron Group Form
  'patronGroups.form.groupNamePlaceholder': 'مثال: طلاب جامعيون، طلاب دراسات عليا، أعضاء هيئة تدريس',
  'patronGroups.form.descriptionPlaceholder': 'وصف موجز لهذه المجموعة',
  'patronGroups.form.loanPeriodPlaceholder': 'مثال: 14، 21، 30',
  'patronGroups.form.loanPeriodHint': 'فترة الإعارة الافتراضية للعناصر المستعارة من هذه المجموعة',
  'patronGroups.button.create': 'إنشاء مجموعة',
  'patronGroups.button.update': 'تحديث المجموعة',

  // Patron Group Messages
  'patronGroups.success.created': 'تم إنشاء مجموعة المستفيدين بنجاح',
  'patronGroups.success.updated': 'تم تحديث مجموعة المستفيدين بنجاح',
  'patronGroups.success.deleted': 'تم حذف مجموعة المستفيدين بنجاح',
  'patronGroups.error.create': 'فشل إنشاء مجموعة المستفيدين',
  'patronGroups.error.update': 'فشل تحديث مجموعة المستفيدين',
  'patronGroups.error.delete': 'فشل حذف مجموعة المستفيدين',

  // Inventory Module
  'inventory.title': 'المخزون',
  'inventory.subtitle': 'إدارة سجلات المخزون والفهرس الببليوغرافي',
  'inventory.hub.title': 'إدارة المخزون',
  'inventory.hub.subtitle': 'إدارة فهرس المكتبة والمقتنيات والعناصر',
  'inventory.newInstance': 'سجل جديد',
  'inventory.createInstance': 'إنشاء سجل جديد',
  'inventory.editInstance': 'تعديل السجل',
  'inventory.viewInstance': 'تفاصيل السجل',
  'inventory.deleteInstance': 'حذف السجل',
  'inventory.deleteConfirm': 'هل أنت متأكد من حذف هذا السجل؟ لا يمكن التراجع عن هذا الإجراء.',
  'inventory.noInstances': 'لم يتم العثور على سجلات',
  'inventory.noInstances.desc': 'حاول تعديل البحث أو إنشاء سجل جديد',
  'inventory.loading': 'جاري تحميل السجلات...',
  'inventory.searchPlaceholder': 'البحث بالعنوان أو العنوان الفرعي أو المؤلف...',
  'inventory.filtersComingSoon': 'فلاتر إضافية قريباً...',

  // Inventory Tabs
  'inventory.tabs.instances': 'السجلات',
  'inventory.tabs.holdings': 'المقتنيات',
  'inventory.tabs.items': 'العناصر',

  // Instance Fields
  'inventory.title.field': 'العنوان',
  'inventory.subtitle.field': 'العنوان الفرعي',
  'inventory.edition': 'الطبعة',
  'inventory.type': 'النوع',
  'inventory.contributors': 'المساهمون',
  'inventory.publication': 'النشر',
  'inventory.languages': 'اللغات',
  'inventory.subjects': 'الموضوعات',
  'inventory.identifiers': 'المعرّفات',

  // Instance Types
  'inventory.type.text': 'نص',
  'inventory.type.audio': 'صوتي',
  'inventory.type.video': 'فيديو',
  'inventory.type.software': 'برمجيات',
  'inventory.type.map': 'خريطة',
  'inventory.type.mixed': 'مواد مختلطة',

  // Instance Form
  'inventory.form.basicInfo': 'المعلومات الأساسية',
  'inventory.form.publicationInfo': 'معلومات النشر',
  'inventory.form.titlePlaceholder': 'أدخل العنوان الرئيسي',
  'inventory.form.subtitlePlaceholder': 'أدخل العنوان الفرعي إن وجد',
  'inventory.form.editionPlaceholder': 'مثال: الطبعة الأولى، الطبعة الثانية المنقحة',
  'inventory.form.publicationPlaceholder': 'مثال: نيويورك : الناشر، 2023',
  'inventory.form.addPublication': 'إضافة نشر',
  'inventory.form.primary': 'أساسي',

  // Instance Actions
  'inventory.button.create': 'إنشاء سجل',
  'inventory.button.update': 'تحديث السجل',
  'inventory.button.editInstance': 'تعديل السجل',

  // Items Module
  'items.title': 'إدارة العناصر',
  'items.subtitle': 'إدارة نسخ العناصر المادية بالباركود',
  'items.newItem': 'عنصر جديد',
  'items.createItem': 'إنشاء عنصر',
  'items.editItem': 'تعديل عنصر',
  'items.viewItem': 'عرض عنصر',
  'items.deleteItem': 'حذف عنصر',
  'items.deleteConfirm': 'هل أنت متأكد من حذف هذا العنصر؟',
  'items.noItems': 'لم يتم العثور على عناصر',
  'items.noItems.desc': 'أنشئ عنصرك الأول للبدء',
  'items.loading': 'جاري تحميل العناصر...',

  // Item Fields
  'items.barcode': 'الباركود',
  'items.barcode.placeholder': 'امسح أو أدخل الباركود',
  'items.barcode.search': 'البحث بالباركود',
  'items.accessionNumber': 'رقم الإضافة',
  'items.itemIdentifier': 'معرّف العنصر',
  'items.status': 'الحالة',
  'items.holding': 'المقتنى',
  'items.location': 'الموقع',
  'items.permanentLocation': 'الموقع الدائم',
  'items.temporaryLocation': 'الموقع المؤقت',
  'items.copyNumber': 'رقم النسخة',
  'items.volume': 'المجلد',
  'items.enumeration': 'الترقيم',
  'items.chronology': 'التسلسل الزمني',
  'items.numberOfPieces': 'عدد القطع',
  'items.descriptionOfPieces': 'وصف القطع',
  'items.discoverySuppress': 'إخفاء من الاكتشاف',
  'items.copyVolume': 'النسخة/المجلد',

  // Item Status
  'items.status.available': 'متاح',
  'items.status.checked_out': 'مُعار',
  'items.status.in_transit': 'في النقل',
  'items.status.awaiting_pickup': 'في انتظار الاستلام',
  'items.status.on_order': 'مطلوب',
  'items.status.in_process': 'قيد المعالجة',
  'items.status.missing': 'مفقود',
  'items.status.withdrawn': 'منسحب',
  'items.status.lost': 'ضائع',
  'items.status.damaged': 'تالف',
  'items.status.all': 'جميع الحالات',

  // Item Filters
  'items.filter.status': 'تصفية حسب الحالة',
  'items.filter.holding': 'تصفية حسب المقتنى',
  'items.filter.allHoldings': 'جميع المقتنيات',

  // Item Form
  'items.form.selectHolding': 'اختر مقتنى',
  'items.form.selectLocation': 'اختر موقع',
  'items.form.copyPlaceholder': 'ن.1',
  'items.form.volumePlaceholder': 'م.1',

  // Item Actions
  'items.button.refresh': 'تحديث',

  // Pagination
  'inventory.pagination.page': 'صفحة',
  'inventory.pagination.of': 'من',
  'inventory.pagination.totalInstances': 'إجمالي السجلات',
  'inventory.pagination.totalItems': 'إجمالي العناصر',

  // Circulation Module
  'circulation.title': 'الإعارة',
  'circulation.subtitle': 'إدارة الإعارات والإرجاعات والقروض والطلبات',

  // Circulation Tabs
  'circulation.tabs.checkout': 'الإعارة / الإرجاع',
  'circulation.tabs.loans': 'القروض',
  'circulation.tabs.requests': 'الطلبات (الحجوزات)',

  // Operations
  'circulation.operation.checkout': 'إعارة',
  'circulation.operation.checkin': 'إرجاع',
  'circulation.operation.renew': 'تجديد',

  // Check Out
  'circulation.checkout.title': 'إعارة عنصر',
  'circulation.checkout.userBarcode': 'باركود المستخدم',
  'circulation.checkout.itemBarcode': 'باركود العنصر',
  'circulation.checkout.userPlaceholder': 'امسح أو أدخل باركود المستخدم',
  'circulation.checkout.itemPlaceholder': 'امسح أو أدخل باركود العنصر',
  'circulation.checkout.button': 'إعارة العنصر',
  'circulation.checkout.processing': 'جاري المعالجة...',
  'circulation.checkout.success': 'تمت الإعارة بنجاح',

  // Check In
  'circulation.checkin.title': 'إرجاع عنصر',
  'circulation.checkin.itemBarcode': 'باركود العنصر',
  'circulation.checkin.itemPlaceholder': 'امسح أو أدخل باركود العنصر',
  'circulation.checkin.button': 'إرجاع العنصر',
  'circulation.checkin.processing': 'جاري المعالجة...',
  'circulation.checkin.success': 'تم الإرجاع بنجاح',

  // Renew
  'circulation.renew.title': 'تجديد قرض',
  'circulation.renew.itemBarcode': 'باركود العنصر',
  'circulation.renew.itemPlaceholder': 'امسح أو أدخل باركود العنصر',
  'circulation.renew.button': 'تجديد القرض',
  'circulation.renew.processing': 'جاري المعالجة...',
  'circulation.renew.success': 'تم تجديد القرض بنجاح',

  // Recent Transactions
  'circulation.recent.title': 'العمليات الأخيرة',
  'circulation.recent.clear': 'مسح',
  'circulation.recent.empty': 'لا توجد عمليات حديثة',
  'circulation.recent.checkedOut': 'تمت الإعارة',
  'circulation.recent.checkedIn': 'تم الإرجاع',
  'circulation.recent.renewed': 'تم التجديد',
  'circulation.recent.item': 'العنصر',
  'circulation.recent.user': 'المستخدم',
  'circulation.recent.due': 'الاستحقاق',
  'circulation.recent.overdueFine': 'غرامة التأخير',
  'circulation.recent.unknownItem': 'عنصر غير معروف',

  // Instructions
  'circulation.instructions.title': 'التعليمات',
  'circulation.instructions.scanner': 'استخدم ماسح الباركود أو اكتب الباركود يدوياً',
  'circulation.instructions.checkout': 'الإعارة: امسح باركود المستخدم أولاً، ثم باركود العنصر',
  'circulation.instructions.checkin': 'الإرجاع: امسح باركود العنصر فقط',
  'circulation.instructions.renew': 'التجديد: امسح باركود العنصر لتمديد تاريخ الاستحقاق',
  'circulation.instructions.recent': 'تظهر العمليات الأخيرة في اللوحة على اليمين',

  // Loans
  'loans.title': 'جميع الإعارات',
  'loans.statusOpen': 'مفتوح',
  'loans.statusClosed': 'مغلق',
  'loans.statusOverdue': 'متأخر',
  'loans.overdueOnly': 'المتأخرة فقط',
  'loans.allLoans': 'جميع الإعارات',
  'loans.clearFilters': 'مسح التصفية',
  'loans.loading': 'جاري تحميل الإعارات...',
  'loans.noLoans': 'لا توجد إعارات',
  'loans.tryAdjusting': 'حاول تعديل التصفية',
  'loans.renew': 'تجديد',
  'loans.filters': 'تصفية',
  'loans.status': 'الحالة',
  'loans.item': 'العنصر',
  'loans.user': 'المستخدم',
  'loans.loanDate': 'تاريخ الإعارة',
  'loans.dueDate': 'تاريخ الاستحقاق',
  'loans.renewals': 'التجديدات',
  'loans.actions': 'الإجراءات',
  'loans.barcode': 'الباركود',
  'loans.unknownItem': 'عنصر غير معروف',
  'loans.unknownUser': 'مستخدم غير معروف',
  'loans.daysOverdue': '{days} أيام متأخرة',
  'loans.dueToday': 'مستحق اليوم',
  'loans.dueTomorrow': 'مستحق غداً',
  'loans.dueInDays': 'مستحق خلال {days} أيام',
  'loans.showingPage': 'عرض صفحة {page} من {total_pages} ({total_items} إعارة إجمالاً)',

  // Reports Module
  'reports.title': 'التقارير',
  'reports.subtitle': 'إنشاء وتصدير تقارير المكتبة والتحليلات',
  'reports.generate': 'إنشاء تقرير',
  'reports.generating': 'جاري الإنشاء...',
  'reports.export': 'تصدير',
  'reports.reportType': 'نوع التقرير',
  'reports.dateRange': 'نطاق التاريخ',
  'reports.startDate': 'تاريخ البدء',
  'reports.endDate': 'تاريخ الانتهاء',
  'reports.exportFormat': 'صيغة التصدير',
  'reports.totalReports': 'إجمالي التقارير',
  'reports.generatedToday': 'المنشأة اليوم',
  'reports.scheduled': 'المجدولة',
  'reports.recentReports': 'التقارير الأخيرة',

  // Report Types
  'reports.type.circulation': 'تقرير الإعارة',
  'reports.type.collection': 'تقرير المجموعة',
  'reports.type.financial': 'التقرير المالي',
  'reports.type.overdue': 'تقرير المتأخرات',

  // Export Formats
  'reports.format.csv': 'CSV',
  'reports.format.excel': 'Excel',
  'reports.format.pdf': 'PDF',
  'reports.format.json': 'JSON',

  // Report Options
  'reports.options.includeCharts': 'تضمين الرسوم البيانية',
  'reports.options.includeStatistics': 'تضمين الإحصائيات',
  'reports.options.includeFines': 'تضمين الغرامات',
  'reports.options.summaryOnly': 'الملخص فقط',
  'reports.options.minDaysOverdue': 'الحد الأدنى من أيام التأخير',

  // Dashboard Stats
  'reports.stats.totalCirculation': 'إجمالي الإعارات',
  'reports.stats.activeLoans': 'القروض النشطة',
  'reports.stats.overdueItems': 'العناصر المتأخرة',
  'reports.stats.totalRevenue': 'إجمالي الإيرادات',

  // Messages
  'reports.success.generated': 'تم إنشاء التقرير بنجاح',
  'reports.error.generate': 'فشل إنشاء التقرير',
  'reports.error.noData': 'لا توجد بيانات متاحة للمعايير المحددة',
  'reports.noReports': 'لم يتم إنشاء تقارير بعد',
  'reports.noReports.desc': 'أنشئ أول تقرير للبدء',

  // Audit Logs Module
  'auditLogs.title': 'سجلات التدقيق',
  'auditLogs.subtitle': 'عرض ومراقبة نشاط النظام وإجراءات المستخدمين',
  'auditLogs.timestamp': 'الوقت والتاريخ',
  'auditLogs.user': 'المستخدم',
  'auditLogs.action': 'الإجراء',
  'auditLogs.resourceType': 'نوع المورد',
  'auditLogs.resourceId': 'معرف المورد',
  'auditLogs.details': 'التفاصيل',
  'auditLogs.status': 'الحالة',
  'auditLogs.ipAddress': 'عنوان IP',
  'auditLogs.userAgent': 'وكيل المستخدم',
  'auditLogs.filters': 'الفلاتر',
  'auditLogs.dateRange': 'نطاق التاريخ',
  'auditLogs.fromDate': 'من تاريخ',
  'auditLogs.toDate': 'إلى تاريخ',
  'auditLogs.actionType': 'نوع الإجراء',
  'auditLogs.userFilter': 'المستخدم',
  'auditLogs.resourceTypeFilter': 'نوع المورد',
  'auditLogs.searchById': 'البحث بالمعرف',
  'auditLogs.searchPlaceholder': 'البحث بمعرف المورد أو المسار...',
  'auditLogs.export': 'تصدير',
  'auditLogs.exportCSV': 'تصدير CSV',
  'auditLogs.exportExcel': 'تصدير Excel',
  'auditLogs.applyFilters': 'تطبيق الفلاتر',
  'auditLogs.clearFilters': 'مسح الفلاتر',
  'auditLogs.noLogs': 'لم يتم العثور على سجلات تدقيق',
  'auditLogs.noLogsDesc': 'حاول تعديل الفلاتر أو نطاق التاريخ',
  'auditLogs.loading': 'جاري تحميل سجلات التدقيق...',
  'auditLogs.showing': 'عرض صفحة',
  'auditLogs.totalLogs': 'إجمالي السجلات',
  'auditLogs.actions': 'الإجراءات',
  'auditLogs.viewDetails': 'عرض التفاصيل',
  'auditLogs.success.exported': 'تم تصدير سجلات التدقيق بنجاح',
  'auditLogs.error.fetch': 'فشل في جلب سجلات التدقيق',
  'auditLogs.error.export': 'فشل في تصدير سجلات التدقيق',
  'auditLogs.error.noPermission': 'تم رفض الوصول',
  'auditLogs.error.noPermissionDesc': 'ليس لديك إذن لعرض سجلات التدقيق. اتصل بالمسؤول.',

  // Acquisitions Module
  'acquisitions.title': 'المشتريات',
  'acquisitions.subtitle': 'إدارة الموردين والصناديق وأوامر الشراء والفواتير',
  'acquisitions.loading': 'جاري التحميل...',
  'acquisitions.totalSpent': 'إجمالي المصروفات',
  'acquisitions.activeOrders': 'الطلبات النشطة',
  'acquisitions.pendingInvoices': 'الفواتير المعلقة',
  'acquisitions.activeVendors': 'الموردون النشطون',

  // Acquisitions Tabs
  'acquisitions.tabs.vendors': 'الموردون',
  'acquisitions.tabs.funds': 'الصناديق',
  'acquisitions.tabs.purchaseOrders': 'أوامر الشراء',
  'acquisitions.tabs.invoices': 'الفواتير',

  // Vendors
  'acquisitions.vendors.title': 'الموردون',
  'acquisitions.vendors.newVendor': 'إنشاء مورد',
  'acquisitions.vendors.createVendor': 'إنشاء مورد',
  'acquisitions.vendors.editVendor': 'تعديل المورد',
  'acquisitions.vendors.deleteVendor': 'حذف المورد',
  'acquisitions.vendors.deleteConfirm': 'هل أنت متأكد من حذف هذا المورد؟',
  'acquisitions.vendors.noVendors': 'لم يتم العثور على موردين',
  'acquisitions.vendors.noVendors.desc': 'أنشئ أول مورد للبدء',
  'acquisitions.vendors.searchPlaceholder': 'البحث بالاسم أو الرمز أو الوصف...',

  // Vendor Fields
  'acquisitions.vendors.code': 'الرمز',
  'acquisitions.vendors.name': 'الاسم',
  'acquisitions.vendors.description': 'الوصف',
  'acquisitions.vendors.status': 'الحالة',
  'acquisitions.vendors.paymentMethod': 'طريقة الدفع',
  'acquisitions.vendors.type': 'النوع',
  'acquisitions.vendors.actions': 'الإجراءات',
  'acquisitions.vendors.currency': 'العملة',
  'acquisitions.vendors.language': 'اللغة',

  // Vendor Status
  'acquisitions.vendors.status.active': 'نشط',
  'acquisitions.vendors.status.inactive': 'غير نشط',
  'acquisitions.vendors.status.pending': 'قيد الانتظار',

  // Vendor Type
  'acquisitions.vendors.type.vendor': 'مورد',
  'acquisitions.vendors.type.customer': 'عميل',
  'acquisitions.vendors.type.both': 'كلاهما',

  // Funds
  'acquisitions.funds.title': 'الصناديق',
  'acquisitions.funds.newFund': 'إنشاء صندوق',
  'acquisitions.funds.createFund': 'إنشاء صندوق',
  'acquisitions.funds.editFund': 'تعديل الصندوق',
  'acquisitions.funds.deleteFund': 'حذف الصندوق',
  'acquisitions.funds.deleteConfirm': 'هل أنت متأكد من حذف هذا الصندوق؟',
  'acquisitions.funds.noFunds': 'لم يتم العثور على صناديق',
  'acquisitions.funds.noFunds.desc': 'أنشئ أول صندوق للبدء',
  'acquisitions.funds.searchPlaceholder': 'البحث عن الصناديق...',

  // Fund Fields
  'acquisitions.funds.code': 'رمز الصندوق',
  'acquisitions.funds.name': 'اسم الصندوق',
  'acquisitions.funds.description': 'الوصف',
  'acquisitions.funds.status': 'الحالة',
  'acquisitions.funds.allocated': 'المخصص',
  'acquisitions.funds.available': 'المتاح',
  'acquisitions.funds.expended': 'المصروف',
  'acquisitions.funds.encumbered': 'المحجوز',
  'acquisitions.funds.actions': 'الإجراءات',

  // Fund Status
  'acquisitions.funds.status.active': 'نشط',
  'acquisitions.funds.status.inactive': 'غير نشط',
  'acquisitions.funds.status.frozen': 'مجمد',

  // Purchase Orders
  'acquisitions.po.title': 'أوامر الشراء',
  'acquisitions.po.newOrder': 'إنشاء طلب',
  'acquisitions.po.createOrder': 'إنشاء أمر شراء',
  'acquisitions.po.editOrder': 'تعديل أمر الشراء',
  'acquisitions.po.deleteOrder': 'حذف أمر الشراء',
  'acquisitions.po.deleteConfirm': 'هل أنت متأكد من حذف أمر الشراء هذا؟',
  'acquisitions.po.noOrders': 'لم يتم العثور على أوامر شراء',
  'acquisitions.po.noOrders.desc': 'أنشئ أول أمر شراء',
  'acquisitions.po.searchPlaceholder': 'البحث عن أوامر الشراء...',

  // PO Fields
  'acquisitions.po.number': 'رقم الأمر',
  'acquisitions.po.vendor': 'المورد',
  'acquisitions.po.status': 'الحالة',
  'acquisitions.po.orderDate': 'تاريخ الطلب',
  'acquisitions.po.totalAmount': 'المبلغ الإجمالي',
  'acquisitions.po.description': 'الوصف',
  'acquisitions.po.fund': 'الصندوق',
  'acquisitions.po.actions': 'الإجراءات',

  // PO Status
  'acquisitions.po.status.pending': 'قيد الانتظار',
  'acquisitions.po.status.open': 'مفتوح',
  'acquisitions.po.status.closed': 'مغلق',
  'acquisitions.po.status.cancelled': 'ملغى',

  // Invoices
  'acquisitions.invoices.title': 'الفواتير',
  'acquisitions.invoices.newInvoice': 'إنشاء فاتورة',
  'acquisitions.invoices.createInvoice': 'إنشاء فاتورة',
  'acquisitions.invoices.editInvoice': 'تعديل الفاتورة',
  'acquisitions.invoices.deleteInvoice': 'حذف الفاتورة',
  'acquisitions.invoices.deleteConfirm': 'هل أنت متأكد من حذف هذه الفاتورة؟',
  'acquisitions.invoices.noInvoices': 'لم يتم العثور على فواتير',
  'acquisitions.invoices.noInvoices.desc': 'أنشئ أول فاتورة',
  'acquisitions.invoices.searchPlaceholder': 'البحث عن الفواتير...',

  // Invoice Fields
  'acquisitions.invoices.number': 'رقم الفاتورة',
  'acquisitions.invoices.vendor': 'المورد',
  'acquisitions.invoices.status': 'الحالة',
  'acquisitions.invoices.invoiceDate': 'تاريخ الفاتورة',
  'acquisitions.invoices.dueDate': 'تاريخ الاستحقاق',
  'acquisitions.invoices.amount': 'المبلغ',
  'acquisitions.invoices.paid': 'المدفوع',
  'acquisitions.invoices.balance': 'الرصيد',
  'acquisitions.invoices.actions': 'الإجراءات',

  // Invoice Status
  'acquisitions.invoices.status.open': 'مفتوحة',
  'acquisitions.invoices.status.paid': 'مدفوعة',
  'acquisitions.invoices.status.cancelled': 'ملغاة',
  'acquisitions.invoices.status.pending': 'قيد الانتظار',

  // Common Acquisitions
  'acquisitions.button.create': 'إنشاء',
  'acquisitions.button.update': 'تحديث',
  'acquisitions.button.creating': 'جاري الإنشاء...',
  'acquisitions.button.updating': 'جاري التحديث...',
  'acquisitions.button.search': 'بحث',
  'acquisitions.form.codePlaceholder': 'أدخل الرمز',
  'acquisitions.form.namePlaceholder': 'أدخل الاسم',
  'acquisitions.form.descriptionPlaceholder': 'أدخل الوصف',
  'acquisitions.pagination.showing': 'عرض صفحة',
  'acquisitions.pagination.of': 'من',
  'acquisitions.pagination.total': 'إجمالي',

  // Holds/Requests Module
  'holds.title': 'الحجوزات والطلبات',
  'holds.subtitle': 'إدارة طلبات حجز المستفيدين واسترجاع العناصر',
  'holds.newRequest': 'طلب جديد',
  'holds.createRequest': 'إنشاء طلب حجز',
  'holds.cancelRequest': 'إلغاء الطلب',
  'holds.viewRequest': 'تفاصيل الطلب',
  'holds.cancelConfirm': 'هل أنت متأكد من إلغاء هذا الطلب؟',
  'holds.noRequests': 'لم يتم العثور على طلبات',
  'holds.noRequests.desc': 'حاول تعديل الفلاتر أو إنشاء طلب جديد',
  'holds.loading': 'جاري تحميل الطلبات...',
  'holds.refresh': 'تحديث',
  'holds.totalRequests': 'إجمالي الطلبات',
  'holds.openRequests': 'الطلبات المفتوحة',
  'holds.requestsToday': 'طلبات اليوم',
  'holds.avgQueuePosition': 'متوسط موضع الطابور',

  // Request Fields
  'holds.position': 'الموضع',
  'holds.item': 'العنصر',
  'holds.itemBarcode': 'باركود العنصر',
  'holds.user': 'المستخدم',
  'holds.userBarcode': 'باركود المستخدم',
  'holds.requestType': 'نوع الطلب',
  'holds.requestDate': 'تاريخ الطلب',
  'holds.expirationDate': 'تاريخ الانتهاء',
  'holds.status': 'الحالة',
  'holds.actions': 'الإجراءات',
  'holds.pickupLocation': 'نقطة الاستلام',
  'holds.queuePosition': 'موضع الطابور',
  'holds.noExpiration': 'بدون انتهاء',

  // Request Types
  'holds.type.hold': 'حجز',
  'holds.type.recall': 'استرجاع',
  'holds.type.page': 'استدعاء',
  'holds.type.all': 'جميع الأنواع',

  // Request Status
  'holds.status.open': 'مفتوح',
  'holds.status.closed': 'مغلق',
  'holds.status.cancelled': 'ملغى',
  'holds.status.awaiting_pickup': 'في انتظار الاستلام',
  'holds.status.in_transit': 'في النقل',
  'holds.status.openOnly': 'المفتوحة فقط',
  'holds.status.all': 'جميع الطلبات',

  // Request Actions
  'holds.action.cancel': 'إلغاء',
  'holds.action.view': 'عرض التفاصيل',
  'holds.action.refresh': 'تحديث',
  'holds.action.createNew': 'إنشاء طلب جديد',

  // Create Request Modal
  'holds.create.title': 'إنشاء طلب حجز جديد',
  'holds.create.userBarcode': 'باركود المستخدم',
  'holds.create.userBarcodePlaceholder': 'امسح أو أدخل باركود المستخدم',
  'holds.create.itemBarcode': 'باركود العنصر',
  'holds.create.itemBarcodePlaceholder': 'امسح أو أدخل باركود العنصر',
  'holds.create.requestType': 'نوع الطلب',
  'holds.create.expirationDate': 'تاريخ الانتهاء (اختياري)',
  'holds.create.pickupLocation': 'نقطة خدمة الاستلام',
  'holds.create.selectPickup': 'اختر موقع الاستلام',
  'holds.create.button': 'إنشاء طلب',
  'holds.create.processing': 'جاري الإنشاء...',
  'holds.create.cancel': 'إلغاء',

  // Request Info
  'holds.info.requestedBy': 'طلب بواسطة',
  'holds.info.itemTitle': 'عنوان العنصر',
  'holds.info.requestedOn': 'تاريخ الطلب',
  'holds.info.expiresOn': 'ينتهي في',
  'holds.info.currentPosition': 'الموضع الحالي في الطابور',
  'holds.info.estimatedAvailability': 'التوفر المتوقع',

  // Filters
  'holds.filter.status': 'تصفية حسب الحالة',
  'holds.filter.type': 'تصفية حسب النوع',
  'holds.filter.clear': 'مسح الفلاتر',
  'holds.filter.showFilters': 'إظهار الفلاتر',
  'holds.filter.hideFilters': 'إخفاء الفلاتر',

  // Messages
  'holds.success.created': 'تم إنشاء الطلب بنجاح',
  'holds.success.cancelled': 'تم إلغاء الطلب بنجاح',
  'holds.error.create': 'فشل إنشاء الطلب',
  'holds.error.cancel': 'فشل إلغاء الطلب',
  'holds.error.fetch': 'فشل تحميل الطلبات',
  'holds.error.userNotFound': 'لم يتم العثور على المستخدم بهذا الباركود',
  'holds.error.itemNotFound': 'لم يتم العثور على العنصر بهذا الباركود',
  'holds.error.itemNotAvailable': 'العنصر غير متاح للحجز',

  // Pagination
  'holds.pagination.showing': 'عرض صفحة',
  'holds.pagination.of': 'من',
  'holds.pagination.totalRequests': 'إجمالي الطلبات',

  // Queue
  'holds.queue.position': 'الموضع في الطابور',
  'holds.queue.first': 'الأول في الطابور',
  'holds.queue.second': 'الثاني في الطابور',
  'holds.queue.third': 'الثالث في الطابور',
  'holds.queue.nth': 'في الطابور',

  // Fees/Fines Module
  'fees.title': 'الرسوم / الغرامات',
  'fees.subtitle': 'إدارة رسوم المستفيدين والغرامات والمدفوعات',
  'fees.newFee': 'رسم جديد',
  'fees.createFee': 'إنشاء رسم يدوي',
  'fees.editFee': 'تعديل الرسم',
  'fees.viewFee': 'تفاصيل الرسم',
  'fees.deleteFee': 'حذف الرسم',
  'fees.deleteConfirm': 'هل أنت متأكد من حذف هذا الرسم؟',
  'fees.noFees': 'لم يتم العثور على رسوم',
  'fees.noFees.desc': 'ستظهر جميع الرسوم هنا',
  'fees.loading': 'جاري تحميل الرسوم...',
  'fees.searchPlaceholder': 'البحث باسم المستخدم أو الباركود أو نوع الرسم...',
  'fees.totalOwed': 'إجمالي المستحق',
  'fees.allFees': 'جميع الرسوم',
  'fees.openFees': 'الرسوم المفتوحة',

  // Fee Fields
  'fees.user': 'المستخدم',
  'fees.userId': 'معرّف المستخدم',
  'fees.feeType': 'نوع الرسم',
  'fees.status': 'الحالة',
  'fees.amount': 'المبلغ',
  'fees.remaining': 'المتبقي',
  'fees.dateCreated': 'تاريخ الإنشاء',
  'fees.dateDue': 'تاريخ الاستحقاق',
  'fees.actions': 'الإجراءات',
  'fees.reason': 'السبب',
  'fees.description': 'الوصف',
  'fees.item': 'العنصر',

  // Fee Types
  'fees.type.overdue': 'غرامة التأخير',
  'fees.type.lost_item': 'عنصر مفقود',
  'fees.type.damaged_item': 'عنصر تالف',
  'fees.type.processing': 'رسوم معالجة',
  'fees.type.replacement': 'رسوم استبدال',
  'fees.type.manual': 'رسم يدوي',
  'fees.type.all': 'جميع الأنواع',

  // Fee Status
  'fees.status.open': 'مفتوح',
  'fees.status.closed': 'مغلق',
  'fees.status.suspended': 'معلق',
  'fees.status.openOnly': 'المفتوحة فقط',
  'fees.status.closedOnly': 'المغلقة فقط',
  'fees.status.all': 'جميع الحالات',

  // Fee Actions
  'fees.action.pay': 'تسجيل دفعة',
  'fees.action.waive': 'إعفاء من الرسم',
  'fees.action.forgive': 'إسقاط الرسم',
  'fees.action.viewDetails': 'عرض التفاصيل',
  'fees.action.cancel': 'إلغاء الرسم',

  // Payment Modal
  'fees.payment.title': 'تسجيل دفعة',
  'fees.payment.amount': 'مبلغ الدفع',
  'fees.payment.method': 'طريقة الدفع',
  'fees.payment.note': 'ملاحظة الدفع',
  'fees.payment.button': 'معالجة الدفع',
  'fees.payment.processing': 'جاري المعالجة...',
  'fees.payment.success': 'تم تسجيل الدفع بنجاح',
  'fees.payment.partial': 'دفعة جزئية',
  'fees.payment.full': 'دفعة كاملة',
  'fees.payment.amountPlaceholder': 'أدخل مبلغ الدفع',
  'fees.payment.notePlaceholder': 'ملاحظة اختيارية عن هذا الدفع',

  // Payment Methods
  'fees.method.cash': 'نقداً',
  'fees.method.check': 'شيك',
  'fees.method.credit_card': 'بطاقة ائتمان',
  'fees.method.transfer': 'تحويل بنكي',
  'fees.method.waive': 'إعفاء',
  'fees.method.forgive': 'إسقاط',
  'fees.method.selectMethod': 'اختر طريقة الدفع',

  // Waive Modal
  'fees.waive.title': 'إعفاء من الرسم',
  'fees.waive.reason': 'سبب الإعفاء',
  'fees.waive.reasonPlaceholder': 'اشرح سبب الإعفاء من هذا الرسم',
  'fees.waive.button': 'إعفاء من الرسم',
  'fees.waive.processing': 'جاري المعالجة...',
  'fees.waive.success': 'تم الإعفاء من الرسم بنجاح',

  // Fee Form
  'fees.form.userBarcode': 'باركود المستخدم',
  'fees.form.userBarcodePlaceholder': 'امسح أو أدخل باركود المستخدم',
  'fees.form.feeTypeLabel': 'نوع الرسم',
  'fees.form.amountLabel': 'المبلغ',
  'fees.form.amountPlaceholder': 'أدخل مبلغ الرسم',
  'fees.form.reasonLabel': 'السبب / الوصف',
  'fees.form.reasonPlaceholder': 'اشرح سبب هذا الرسم',
  'fees.form.descriptionPlaceholder': 'تفاصيل إضافية عن هذا الرسم',
  'fees.button.create': 'إنشاء رسم',
  'fees.button.update': 'تحديث الرسم',

  // Payment History
  'fees.history.title': 'تاريخ المدفوعات',
  'fees.history.noPayments': 'لم يتم تسجيل مدفوعات',
  'fees.history.date': 'التاريخ',
  'fees.history.method': 'الطريقة',
  'fees.history.amount': 'المبلغ',
  'fees.history.note': 'ملاحظة',
  'fees.history.by': 'بواسطة',

  // Fee Details
  'fees.details.feeInfo': 'معلومات الرسم',
  'fees.details.createdBy': 'أُنشئ بواسطة',
  'fees.details.lastUpdated': 'آخر تحديث',
  'fees.details.paidAmount': 'المبلغ المدفوع',
  'fees.details.waivedAmount': 'المبلغ المعفى',

  // Fee Filters
  'fees.filter.status': 'تصفية حسب الحالة',
  'fees.filter.type': 'تصفية حسب النوع',
  'fees.filter.user': 'تصفية حسب المستخدم',

  // Fee Messages
  'fees.success.created': 'تم إنشاء الرسم بنجاح',
  'fees.success.updated': 'تم تحديث الرسم بنجاح',
  'fees.success.deleted': 'تم حذف الرسم بنجاح',
  'fees.error.create': 'فشل إنشاء الرسم',
  'fees.error.update': 'فشل تحديث الرسم',
  'fees.error.delete': 'فشل حذف الرسم',
  'fees.error.insufficientAmount': 'مبلغ الدفع يتجاوز الرصيد المتبقي',
  'fees.error.invalidAmount': 'الرجاء إدخال مبلغ صحيح',

  // Fees - Tabs (Arabic)
  'fees.tabs.fees': 'الرسوم',

  // Fees - Filters (Arabic)
  'fees.filters.allStatuses': 'جميع الحالات',
  'fees.filters.allTypes': 'جميع الأنواع',

  // Fees - Table Headers (Arabic)
  'fees.table.type': 'النوع',
  'fees.table.status': 'الحالة',
  'fees.table.amount': 'المبلغ',
  'fees.table.remaining': 'المتبقي',
  'fees.table.description': 'الوصف',
  'fees.table.date': 'التاريخ',

  // Fees - Additional Status (Arabic)
  'fees.autoGenerated': 'تم إنشاؤه تلقائياً',
  'fees.paid': 'مدفوع',
  'fees.pay': 'دفع',
  'fees.waive': 'إعفاء',

  // Fees - Modal Titles (Arabic)
  'fees.modal.createFee': 'إنشاء رسم',
  'fees.modal.recordPayment': 'تسجيل دفعة',
  'fees.modal.waiveFee': 'إعفاء من الرسم',
  'fees.modal.feeDetails': 'تفاصيل الرسم',

  // Fees - Modal Fields (Arabic)
  'fees.modal.type': 'النوع',
  'fees.modal.status': 'الحالة',
  'fees.modal.originalAmount': 'المبلغ الأصلي',
  'fees.modal.remaining': 'المتبقي',
  'fees.modal.paid': 'المدفوع',
  'fees.modal.feeDate': 'تاريخ الرسم',
  'fees.modal.description': 'الوصف',
  'fees.modal.reason': 'السبب',
  'fees.modal.paymentHistory': 'تاريخ المدفوعات',
  'fees.modal.noPayments': 'لم يتم تسجيل أي مدفوعات',
  'fees.modal.ref': 'مرجع',
  'fees.modal.balance': 'الرصيد',

  // Fees - Form Fields (Arabic)
  'fees.form.userId': 'معرّف المستخدم',
  'fees.form.userIdPlaceholder': 'أدخل معرّف المستخدم',
  'fees.form.userIdHint': 'أدخل معرّف المستخدم الذي سيتم فرض الرسم عليه',
  'fees.form.feeType': 'نوع الرسم',
  'fees.form.amount': 'المبلغ',
  'fees.form.description': 'الوصف',
  'fees.form.descriptionPlaceholder': 'أدخل الوصف',
  'fees.form.reason': 'السبب',
  'fees.form.reasonPlaceholder': 'أدخل سبب هذا الرسم',
  'fees.form.fee': 'الرسم',
  'fees.form.remainingBalance': 'الرصيد المتبقي',
  'fees.form.paymentMethod': 'طريقة الدفع',
  'fees.form.maximum': 'الحد الأقصى',
  'fees.form.transactionInfo': 'معلومات المعاملة',
  'fees.form.transactionInfoPlaceholder': 'أدخل مرجع المعاملة',
  'fees.form.comments': 'تعليقات',
  'fees.form.commentsPlaceholder': 'أدخل أي تعليقات',
  'fees.form.action': 'الإجراء',
  'fees.form.amountOptional': 'المبلغ (اختياري)',
  'fees.form.fullAmount': 'المبلغ الكامل',
  'fees.form.waiveReasonPlaceholder': 'أدخل سبب الإعفاء من هذا الرسم',

  // Fees - Payment Methods (Arabic)
  'fees.paymentMethods.cash': 'نقداً',
  'fees.paymentMethods.check': 'شيك',
  'fees.paymentMethods.creditCard': 'بطاقة ائتمان',
  'fees.paymentMethods.transfer': 'تحويل بنكي',

  // Fees - Actions (Arabic)
  'fees.actions.waive': 'إعفاء',
  'fees.actions.forgive': 'إسقاط',

  // Fees - Buttons (Arabic)
  'fees.button.createFee': 'إنشاء رسم',
  'fees.button.recordPayment': 'تسجيل دفعة',
  'fees.button.waiveForgive': 'إعفاء/إسقاط',

  // Search Module (Arabic)
  'search.title': 'بحث متقدم',
  'search.subtitle': 'ابحث في الكتالوج بالكامل باستخدام الفلاتر المتقدمة',
  'search.placeholder': 'ابحث بالعنوان أو المؤلف أو الموضوع...',

  // Search - Buttons (Arabic)
  'search.button.search': 'بحث',
  'search.button.showFilters': 'إظهار الفلاتر',
  'search.button.hideFilters': 'إخفاء الفلاتر',

  // Search - Filters (Arabic)
  'search.filters.title': 'الفلاتر',
  'search.filters.clearAll': 'مسح الكل',
  'search.filters.publicationYear': 'سنة النشر',
  'search.filters.from': 'من',
  'search.filters.to': 'إلى',
  'search.filters.instanceType': 'نوع المصدر',
  'search.filters.language': 'اللغة',
  'search.filters.subject': 'الموضوع',
  'search.filters.applyFilters': 'تطبيق الفلاتر',

  // Search - Results (Arabic)
  'search.results.showing': 'عرض',
  'search.results.to': 'إلى',
  'search.results.of': 'من',
  'search.results.results': 'نتيجة',
  'search.results.for': 'لـ',
  'search.results.authors': 'المؤلف(ون)',
  'search.results.edition': 'الطبعة',
  'search.results.year': 'السنة',
  'search.results.publisher': 'الناشر',
  'search.results.languages': 'اللغات',

  // Search - No Results (Arabic)
  'search.noResults.title': 'لم يتم العثور على نتائج',
  'search.noResults.withQuery': 'لا توجد عناصر تطابق بحثك عن',
  'search.noResults.enterQuery': 'أدخل استعلام بحث للعثور على عناصر في الكتالوج',

  // Search - Pagination (Arabic)
  'search.pagination.previous': 'السابق',
  'search.pagination.next': 'التالي',

  // Search - Errors (Arabic)
  'search.error.serviceUnavailable': 'خدمة البحث غير متوفرة',
  'search.error.serviceMessage': 'خدمة Elasticsearch للبحث غير متوفرة حالياً. يرجى التأكد من تشغيل Elasticsearch.',
  'search.error.retryConnection': 'إعادة المحاولة',

  // Courses Module (Arabic)
  'courses.title': 'الدورات الاحتياطية',
  'courses.subtitle': 'إدارة الدورات والمواد الاحتياطية',
  'courses.newCourse': 'دورة جديدة',
  'courses.searchPlaceholder': 'ابحث بالاسم أو الرمز أو الوصف...',

  // Courses - Filters (Arabic)
  'courses.status': 'الحالة',
  'courses.allCourses': 'جميع الدورات',
  'courses.activeOnly': 'النشطة فقط',
  'courses.inactiveOnly': 'غير النشطة فقط',
  'courses.term': 'الفصل',
  'courses.termPlaceholder': 'مثلاً: خريف 2024، ربيع 2025',

  // Courses - Table (Arabic)
  'courses.table.code': 'الرمز',
  'courses.table.name': 'الاسم',
  'courses.table.instructor': 'المدرس',
  'courses.table.term': 'الفصل',
  'courses.table.dates': 'التواريخ',
  'courses.table.reserves': 'الاحتياطيات',
  'courses.table.status': 'الحالة',
  'courses.table.actions': 'الإجراءات',

  // Courses - Status (Arabic)
  'courses.active': 'نشط',
  'courses.inactive': 'غير نشط',

  // Courses - Actions (Arabic)
  'courses.view': 'عرض',
  'courses.edit': 'تعديل',
  'courses.delete': 'حذف',

  // Courses - Modal (Arabic)
  'courses.modal.create': 'إنشاء دورة جديدة',
  'courses.modal.edit': 'تعديل الدورة',
  'courses.modal.view': 'تفاصيل الدورة',

  // Courses - Form (Arabic)
  'courses.form.code': 'رمز الدورة',
  'courses.form.name': 'اسم الدورة',
  'courses.form.description': 'الوصف',
  'courses.form.instructor': 'المدرس',
  'courses.form.term': 'الفصل',
  'courses.form.startDate': 'تاريخ البدء',
  'courses.form.endDate': 'تاريخ الانتهاء',
  'courses.form.status': 'الحالة',
  'courses.form.notes': 'ملاحظات',

  // Courses - Messages (Arabic)
  'courses.noCourses': 'لم يتم العثور على دورات',
  'courses.loading': 'جاري تحميل الدورات...',
  'courses.deleteConfirm': 'هل أنت متأكد من حذف هذه الدورة؟',

  // Books Module
  'books.catalog_title': 'اكتشف قراءتك القادمة الرائعة',
  'books.catalog_subtitle': 'تصفح آلاف الكتب في مكتبتنا الرقمية',
  'books.search_placeholder': 'ابحث بالعنوان أو المؤلف أو رقم ISBN...',
  'books.books_found': 'كتاباً',
  'books.category': 'التصنيف',
  'books.all_categories': 'جميع التصنيفات',
  'books.technology': 'تكنولوجيا',
  'books.science': 'علوم',
  'books.history': 'تاريخ',
  'books.literature': 'أدب',
  'books.language': 'اللغة',
  'books.all_languages': 'جميع اللغات',
  'books.availability': 'التوفر',
  'books.all_books': 'جميع الكتب',
  'books.available_only': 'المتاحة فقط',
  'books.borrowed_only': 'المستعارة فقط',
  'books.available': 'متاح',
  'books.borrowed': 'مستعار',
  'books.view_details': 'عرض التفاصيل',
  'books.no_books_found': 'لم يتم العثور على كتب',
  'books.try_different_search': 'حاول تعديل البحث أو التصفية',

  // Book Details Page
  'books.not_found': 'الكتاب غير موجود',
  'books.back_to_catalog': 'العودة إلى الكتالوج',
  'books.borrow_now': 'استعارة الآن',
  'books.not_available': 'غير متاح',
  'books.favorite': 'مفضلة',
  'books.favorited': 'مفضل',
  'books.share': 'مشاركة',
  'books.copies_available': 'النسخ المتاحة',
  'books.currently_available': 'متاح حالياً',
  'books.copies_ready_to_borrow': 'نسخة جاهزة للاستعارة',
  'books.loan_details': 'تفاصيل الإعارة',
  'books.loan_period': 'مدة الإعارة',
  'books.days': 'أيام',
  'books.renewals': 'التجديد',
  'books.times': 'مرات',
  'books.year': 'السنة',
  'books.location': 'الموقع',
  'books.tab_overview': 'نظرة عامة',
  'books.tab_details': 'التفاصيل',
  'books.tab_availability': 'التوفر',
  'books.description': 'الوصف',
  'books.sample_description': 'يغطي هذا الكتاب الشامل المفاهيم الأساسية والتقنيات المتقدمة في علوم الحاسوب. مثالي للطلاب والمحترفين على حد سواء، حيث يوفر شروحات متعمقة وأمثلة عملية.',
  'books.subjects': 'المواضيع',
  'books.isbn': 'الرقم الدولي',
  'books.pages': 'الصفحات',
  'books.pages_unit': 'صفحة',
  'books.publisher': 'الناشر',
  'books.edition': 'الطبعة',
  'books.similar_books': 'كتب مشابهة',
  'books.similar_books_coming_soon': 'توصيات الكتب المشابهة قريباً',

  // Language
  'language.english': 'English',
  'language.arabic': 'العربية',
  'language.switch': 'تبديل اللغة',
}

const translations = {
  en: enTranslations,
  ar: arTranslations,
}

interface LanguageProviderProps {
  children: ReactNode
}

export const LanguageProvider = ({ children }: LanguageProviderProps) => {
  const [language, setLanguageState] = useState<Language>('en')

  // Load language from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'ar')) {
      setLanguageState(savedLanguage)
      updateDocumentDirection(savedLanguage)
    }
  }, [])

  const updateDocumentDirection = (lang: Language) => {
    const htmlElement = document.documentElement
    if (lang === 'ar') {
      htmlElement.setAttribute('dir', 'rtl')
      htmlElement.setAttribute('lang', 'ar')
    } else {
      htmlElement.setAttribute('dir', 'ltr')
      htmlElement.setAttribute('lang', 'en')
    }
  }

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem('language', lang)
    updateDocumentDirection(lang)
  }

  const t = (key: TranslationKey): string => {
    return translations[language][key] || key
  }

  const isRTL = language === 'ar'

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
