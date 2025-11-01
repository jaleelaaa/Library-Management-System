import React from 'react'
import { usePermissions } from '../../contexts/PermissionContext'

interface PermissionGateProps {
  /**
   * Single permission required to render children
   */
  permission?: string

  /**
   * Multiple permissions - user must have ANY of these (OR logic)
   */
  anyPermission?: string[]

  /**
   * Multiple permissions - user must have ALL of these (AND logic)
   */
  allPermissions?: string[]

  /**
   * Content to render when user has permission
   */
  children: React.ReactNode

  /**
   * Optional fallback content to render when user lacks permission
   */
  fallback?: React.ReactNode

  /**
   * Show loading state while checking permissions
   */
  showLoading?: boolean
}

/**
 * PermissionGate Component
 *
 * Conditionally renders children based on user permissions.
 *
 * Usage:
 *
 * // Single permission check
 * <PermissionGate permission="users.create">
 *   <button>Create User</button>
 * </PermissionGate>
 *
 * // Any permission check (OR logic)
 * <PermissionGate anyPermission={["circulation.checkout", "circulation.checkin"]}>
 *   <button>Checkout/Checkin</button>
 * </PermissionGate>
 *
 * // All permissions check (AND logic)
 * <PermissionGate allPermissions={["users.read", "users.update"]}>
 *   <button>Edit User</button>
 * </PermissionGate>
 *
 * // With fallback
 * <PermissionGate permission="admin.settings" fallback={<p>Access Denied</p>}>
 *   <SettingsPanel />
 * </PermissionGate>
 */
const PermissionGate: React.FC<PermissionGateProps> = ({
  permission,
  anyPermission,
  allPermissions,
  children,
  fallback = null,
  showLoading = false,
}) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions, isLoading } = usePermissions()

  // Show loading state if enabled
  if (isLoading && showLoading) {
    return <div className="animate-pulse bg-gray-200 h-8 w-24 rounded"></div>
  }

  // Don't render anything while loading if showLoading is false
  if (isLoading) {
    return null
  }

  // Determine if user has required permissions
  let hasRequiredPermission = false

  if (permission) {
    // Single permission check
    hasRequiredPermission = hasPermission(permission)
  } else if (anyPermission && anyPermission.length > 0) {
    // Any permission check (OR logic)
    hasRequiredPermission = hasAnyPermission(anyPermission)
  } else if (allPermissions && allPermissions.length > 0) {
    // All permissions check (AND logic)
    hasRequiredPermission = hasAllPermissions(allPermissions)
  } else {
    // No permission requirements - render children
    hasRequiredPermission = true
  }

  // Render children if user has permission, otherwise render fallback
  return hasRequiredPermission ? <>{children}</> : <>{fallback}</>
}

export default PermissionGate
