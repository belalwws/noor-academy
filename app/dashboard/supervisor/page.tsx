"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAppSelector } from '../../../lib/hooks'

export default function SupervisorDashboard() {
  const router = useRouter()
  const { user } = useAppSelector(state => state.auth)

  useEffect(() => {
    console.log('🔍 Supervisor Dashboard - User role:', user?.role);
    console.log('🔍 Supervisor Dashboard - Full user:', user);
    
    // Redirect based on user role
    if (user?.role === 'general_supervisor') {
      console.log('➡️ Redirecting to general supervisor dashboard');
      router.replace('/dashboard/supervisor/general')
    } else if (user?.role === 'academic_supervisor') {
      console.log('➡️ Redirecting to academic supervisor dashboard');
      router.replace('/dashboard/academic-supervisor')
    } else if (user?.role === 'supervisor') {
      // Check if it's academic supervisor based on other criteria
      console.log('➡️ Redirecting supervisor to academic supervisor dashboard');
      router.replace('/dashboard/academic-supervisor')
    } else {
      console.log('➡️ Default redirect to general supervisor dashboard');
      // Default to general supervisor for now
      router.replace('/dashboard/supervisor/general')
    }
  }, [user, router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">جاري التحميل...</p>
      </div>
    </div>
  )
}
