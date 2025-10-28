import { Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { RootState } from './store'
import MainLayout from './components/layout/MainLayout'
import ProtectedRoute from './components/auth/ProtectedRoute'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import InventoryHub from './pages/InventoryHub'
import Users from './pages/Users'
import PatronGroups from './pages/PatronGroups'
import Circulation from './pages/Circulation'
import Acquisitions from './pages/Acquisitions'
import Courses from './pages/Courses'
import Fees from './pages/Fees'
import Search from './pages/Search'
import Reports from './pages/Reports'
import Settings from './pages/Settings'
import BookCatalog from './pages/books/BookCatalog'
import BookDetails from './pages/books/BookDetails'

function App() {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth)

  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="search" element={<Search />} />
        <Route path="books" element={<BookCatalog />} />
        <Route path="books/:id" element={<BookDetails />} />
        <Route path="inventory/*" element={<InventoryHub />} />
        <Route path="users/*" element={<Users />} />
        <Route path="patron-groups/*" element={<PatronGroups />} />
        <Route path="circulation/*" element={<Circulation />} />
        <Route path="acquisitions/*" element={<Acquisitions />} />
        <Route path="courses/*" element={<Courses />} />
        <Route path="fees" element={<Fees />} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings/*" element={<Settings />} />
      </Route>

      <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
    </Routes>
  )
}

export default App
