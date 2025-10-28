import { NavLink } from 'react-router-dom'
import {
  FiHome,
  FiBook,
  FiUsers,
  FiRefreshCw,
  FiShoppingCart,
  FiBookOpen,
  FiDollarSign,
  FiSearch,
  FiBarChart2,
  FiSettings,
} from 'react-icons/fi'

const menuItems = [
  { path: '/dashboard', label: 'Dashboard', icon: FiHome },
  { path: '/search', label: 'Search', icon: FiSearch },
  { path: '/books', label: 'Books', icon: FiBookOpen },
  { path: '/inventory', label: 'Inventory', icon: FiBook },
  { path: '/users', label: 'Users', icon: FiUsers },
  { path: '/patron-groups', label: 'Patron Groups', icon: FiUsers },
  { path: '/circulation', label: 'Circulation', icon: FiRefreshCw },
  { path: '/acquisitions', label: 'Acquisitions', icon: FiShoppingCart },
  { path: '/courses', label: 'Courses', icon: FiBookOpen },
  { path: '/fees', label: 'Fees & Fines', icon: FiDollarSign },
  { path: '/reports', label: 'Reports', icon: FiBarChart2 },
  { path: '/settings', label: 'Settings', icon: FiSettings },
]

const Sidebar = () => {
  return (
    <aside className="folio-sidebar w-64">
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => (
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
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}

export default Sidebar
