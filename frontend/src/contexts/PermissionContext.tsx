import React, { createContext, useContext, useMemo, useCallback, useEffect, useState } from 'react'
import { useAppSelector } from '../store/hooks'
import type { Permission } from '../types/role'

interface PermissionContextValue {
  permissions: string[]
  isLoading: boolean
  hasPermission: (permission: string) => boolean
  hasAnyPermission: (permissions: string[]) => boolean
  hasAllPermissions: (permissions: string[]) => boolean
}

const PermissionContext = createContext<PermissionContextValue | undefined>(undefined)

export const PermissionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAppSelector((state) => state.auth)
  const [isLoading, setIsLoading] = useState(true)

  // Extract all unique permission names from user's roles
  const permissions = useMemo(() => {
    if (!user || !user.roles || !Array.isArray(user.roles)) {
      return []
    }

    const permissionSet = new Set<string>()

    user.roles.forEach((role) => {
      if (role.permissions && Array.isArray(role.permissions)) {
        role.permissions.forEach((permission: Permission) => {
          if (permission && permission.name) {
            permissionSet.add(permission.name)
          }
        })
      }
    })

    return Array.from(permissionSet)
  }, [user])

  // Set loading to false once we have user data (or confirmed no user)
  useEffect(() => {
    setIsLoading(false)
  }, [user])

  // Check if user has a specific permission
  const hasPermission = useCallback(
    (permission: string): boolean => {
      if (!permission) return false
      return permissions.includes(permission)
    },
    [permissions]
  )

  // Check if user has any of the provided permissions (OR logic)
  const hasAnyPermission = useCallback(
    (requiredPermissions: string[]): boolean => {
      if (!requiredPermissions || requiredPermissions.length === 0) return true
      return requiredPermissions.some((permission) => permissions.includes(permission))
    },
    [permissions]
  )

  // Check if user has all of the provided permissions (AND logic)
  const hasAllPermissions = useCallback(
    (requiredPermissions: string[]): boolean => {
      if (!requiredPermissions || requiredPermissions.length === 0) return true
      return requiredPermissions.every((permission) => permissions.includes(permission))
    },
    [permissions]
  )

  const value = useMemo(
    () => ({
      permissions,
      isLoading,
      hasPermission,
      hasAnyPermission,
      hasAllPermissions,
    }),
    [permissions, isLoading, hasPermission, hasAnyPermission, hasAllPermissions]
  )

  return <PermissionContext.Provider value={value}>{children}</PermissionContext.Provider>
}

// Custom hook to use the permission context
export const usePermissions = (): PermissionContextValue => {
  const context = useContext(PermissionContext)
  if (context === undefined) {
    throw new Error('usePermissions must be used within a PermissionProvider')
  }
  return context
}

// Convenience hook for checking a single permission
export const useHasPermission = (permission: string): boolean => {
  const { hasPermission } = usePermissions()
  return hasPermission(permission)
}

// Convenience hook for checking any of multiple permissions
export const useHasAnyPermission = (permissions: string[]): boolean => {
  const { hasAnyPermission } = usePermissions()
  return hasAnyPermission(permissions)
}

// Convenience hook for checking all of multiple permissions
export const useHasAllPermissions = (permissions: string[]): boolean => {
  const { hasAllPermissions } = usePermissions()
  return hasAllPermissions(permissions)
}
