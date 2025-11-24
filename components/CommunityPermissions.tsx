'use client'

import React from 'react'
import { useAuth } from '@/lib/hooks/useAuth'

export interface CommunityPermissions {
  canCreateTopic: boolean
  canCreatePost: boolean
  canEditOwnContent: boolean
  canDeleteOwnContent: boolean
  canReportContent: boolean
  canModerateContent: boolean
  canManageForums: boolean
  canViewReports: boolean
  canBanUsers: boolean
  canPinTopics: boolean
  canLockTopics: boolean
  canFeatureContent: boolean
  canViewAnalytics: boolean
}

export const useCommunityPermissions = (): CommunityPermissions => {
  const { user } = useAuth()

  if (!user) {
    return {
      canCreateTopic: false,
      canCreatePost: false,
      canEditOwnContent: false,
      canDeleteOwnContent: false,
      canReportContent: false,
      canModerateContent: false,
      canManageForums: false,
      canViewReports: false,
      canBanUsers: false,
      canPinTopics: false,
      canLockTopics: false,
      canFeatureContent: false,
      canViewAnalytics: false,
    }
  }

  const isStudent = user.role === 'student'
  const isTeacher = user.role === 'teacher'
  const isSupervisor = user.role === 'supervisor'
  const isAdmin = user.role === 'admin'

  return {
    // Basic content creation - all authenticated users
    canCreateTopic: true,
    canCreatePost: true,
    canEditOwnContent: true,
    canDeleteOwnContent: true,
    canReportContent: true,

    // Moderation features - supervisors and admins only
    canModerateContent: isSupervisor || isAdmin,
    canViewReports: isSupervisor || isAdmin,
    canBanUsers: isSupervisor || isAdmin,
    canPinTopics: isSupervisor || isAdmin,
    canLockTopics: isSupervisor || isAdmin,
    canFeatureContent: isSupervisor || isAdmin,

    // Advanced management - admins only
    canManageForums: isAdmin,
    canViewAnalytics: isAdmin,
  }
}

interface PermissionGateProps {
  permission: keyof CommunityPermissions
  children: React.ReactNode
  fallback?: React.ReactNode
}

export const PermissionGate: React.FC<PermissionGateProps> = ({
  permission,
  children,
  fallback = null
}) => {
  const permissions = useCommunityPermissions()
  
  if (!permissions[permission]) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

interface RoleBasedUIProps {
  allowedRoles: string[]
  children: React.ReactNode
  fallback?: React.ReactNode
}

export const RoleBasedUI: React.FC<RoleBasedUIProps> = ({
  allowedRoles,
  children,
  fallback = null
}) => {
  const { user } = useAuth()
  
  if (!user || !allowedRoles.includes(user.role)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

// Helper function to get role display information
export const getRoleInfo = (role: string) => {
  switch (role) {
    case 'admin':
      return {
        name: 'مدير',
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: '👑'
      }
    case 'supervisor':
      return {
        name: 'مشرف',
        color: 'bg-purple-100 text-purple-800 border-purple-200',
        icon: '🛡️'
      }
    case 'teacher':
      return {
        name: 'معلم',
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: '📚'
      }
    case 'student':
      return {
        name: 'طالب',
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: '🎓'
      }
    default:
      return {
        name: 'مستخدم',
        color: 'bg-gray-100 text-gray-800 border-gray-200',
        icon: '👤'
      }
  }
}

// Helper function to check if user can perform action on content
export const canPerformAction = (
  user: any,
  action: 'edit' | 'delete' | 'moderate',
  contentAuthorId: string
): boolean => {
  if (!user) return false

  const permissions = useCommunityPermissions()
  
  switch (action) {
    case 'edit':
      return user.id === contentAuthorId && permissions.canEditOwnContent
    case 'delete':
      return (user.id === contentAuthorId && permissions.canDeleteOwnContent) || 
             permissions.canModerateContent
    case 'moderate':
      return permissions.canModerateContent
    default:
      return false
  }
}
