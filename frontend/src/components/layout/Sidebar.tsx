import { NavLink } from 'react-router-dom'
import { useAppSelector } from '../../store/hooks'
import { usePermissions } from '../../contexts/PermissionContext'
import { useLanguage } from '../../contexts/LanguageContext'
import {
  FiHome,
  FiBook,
  FiUsers,
  FiShield,
  FiRefreshCw,
  FiShoppingCart,
  FiBookOpen,
  FiDollarSign,
  FiSearch,
  FiBarChart2,
  FiSettings,
  FiClock,
  FiFileText,
} from 'react-icons/fi'
import { useMemo } from 'react'

// Define menu item type with optional permission requirements
interface MenuItem {
  path: string
  labelKey: string
  icon: any
  requiredPermission?: string
  anyPermission?: string[]
}

// Staff menu items with permission requirements
const staffMenuItems: MenuItem[] = [
  {
    path: '/dashboard',
    labelKey: 'nav.dashboard',
    icon: FiHome
    // No permission needed - all users can access dashboard
  },
  {
    path: '/search',
    labelKey: 'nav.search',
    icon: FiSearch
    // No permission needed - all users can search
  },
  {
    path: '/books',
    labelKey: 'nav.books',
    icon: FiBookOpen
    // No permission needed - catalog viewing
  },
  {
    path: '/inventory',
    labelKey: 'nav.inventory',
    icon: FiBook,
    requiredPermission: 'inventory.read'
  },
  {
    path: '/users',
    labelKey: 'nav.users',
    icon: FiUsers,
    requiredPermission: 'users.read'
  },
  {
    path: '/roles',
    labelKey: 'nav.roles',
    icon: FiShield,
    requiredPermission: 'roles.read'
  },
  {
    path: '/patron-groups',
    labelKey: 'nav.patronGroups',
    icon: FiUsers,
    requiredPermission: 'patron_groups.read'
  },
  {
    path: '/circulation',
    labelKey: 'nav.circulation',
    icon: FiRefreshCw,
    anyPermission: ['circulation.checkout', 'circulation.checkin', 'circulation.view_all', 'circulation.view_own']
  },
  {
    path: '/acquisitions',
    labelKey: 'nav.acquisitions',
    icon: FiShoppingCart,
    requiredPermission: 'acquisitions.read'
  },
  {
    path: '/courses',
    labelKey: 'nav.courses',
    icon: FiBookOpen,
    anyPermission: ['courses.read', 'courses.manage']
  },
  {
    path: '/fees',
    labelKey: 'nav.fees',
    icon: FiDollarSign,
    anyPermission: ['fees.read', 'fees.manage', 'fees.waive']
  },
  {
    path: '/reports',
    labelKey: 'nav.reports',
    icon: FiBarChart2,
    requiredPermission: 'reports.view'
  },
  {
    path: '/audit-logs',
    labelKey: 'nav.auditLogs',
    icon: FiFileText,
    requiredPermission: 'audit.read'
  },
  {
    path: '/settings',
    labelKey: 'nav.settings',
    icon: FiSettings,
    requiredPermission: 'settings.manage'
  },
]

// Patron menu items with permission requirements
const patronMenuItems: MenuItem[] = [
  {
    path: '/dashboard',
    labelKey: 'nav.dashboard',
    icon: FiHome
  },
  {
    path: '/search',
    labelKey: 'nav.search',
    icon: FiSearch
  },
  {
    path: '/books',
    labelKey: 'nav.books',
    icon: FiBookOpen
  },
  {
    path: '/my-loans',
    labelKey: 'nav.myLoans',
    icon: FiClock,
    requiredPermission: 'circulation.view_own'
  },
  {
    path: '/settings',
    labelKey: 'nav.settings',
    icon: FiSettings
    // No permission needed for personal settings
  },
]

const Sidebar = () => {
  const { user } = useAppSelector((state) => state.auth)
  const { hasPermission, hasAnyPermission } = usePermissions()
  const { t } = useLanguage()

  // Determine base menu items based on user type
  const baseMenuItems = user?.user_type === 'patron' ? patronMenuItems : staffMenuItems

  // Filter menu items based on user permissions
  const filteredMenuItems = useMemo(() => {
    return baseMenuItems.filter((item) => {
      // If no permission required, show the item
      if (!item.requiredPermission && !item.anyPermission) {
        return true
      }

      // Check single required permission
      if (item.requiredPermission) {
        return hasPermission(item.requiredPermission)
      }

      // Check any permission (OR logic)
      if (item.anyPermission && item.anyPermission.length > 0) {
        return hasAnyPermission(item.anyPermission)
      }

      return false
    })
  }, [baseMenuItems, hasPermission, hasAnyPermission])

  return (
    <aside className="folio-sidebar w-64">
      <nav className="p-4 space-y-2">
        {filteredMenuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-folio-primary text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            <item.icon size={20} />
            <span>{t(item.labelKey)}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}

export default Sidebar
