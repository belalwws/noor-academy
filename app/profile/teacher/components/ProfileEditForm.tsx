'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { teachersAPI } from '@/lib/api/teachers'
import ProfileEdit from './ProfileEdit'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle } from 'lucide-react'

interface TeacherProfile {
  id: number
  user: number
  first_name: string
  last_name: string
  email: string
  phone?: string
  address?: string
  bio?: string
  specialization?: string
  experience_years?: number
  education?: string
  certifications?: string
  profile_image?: string
  date_joined: string
  is_approved: boolean
  approval_status: string
  courses_count: number
  students_count: number
  rating?: number
  total_hours?: number
}

interface User {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
}

interface ProfileEditFormProps {
  profile: TeacherProfile | null
  user: User | null
  onProfileUpdate: (updatedProfile: TeacherProfile) => void
}

/**
 * Wrapper around the lightweight ProfileEdit component that handles
 * talking to the teacher profile API and updates parent state.
 */
export default function ProfileEditForm({ profile, user, onProfileUpdate }: ProfileEditFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!profile) {
    return (
      <Card className="border-2 border-dashed border-amber-300 bg-amber-50/50 text-amber-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            لا توجد بيانات مكتملة للملف الشخصي
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            لم نتمكن من تحميل بيانات المعلم الحالية. يرجى إعادة المحاولة من زر التحديث في أعلى الصفحة أو التواصل
            مع فريق الدعم.
          </p>
        </CardContent>
      </Card>
    )
  }

  const handleSave = async (data: Partial<TeacherProfile>) => {
    setIsSubmitting(true)

    try {
      // تحضير الحمولة مع إبقاء المعرفات على حالها
      const payload = {
        first_name: data.first_name ?? profile.first_name,
        last_name: data.last_name ?? profile.last_name,
        phone: data.phone ?? profile.phone,
        address: data.address ?? profile.address,
        bio: data.bio ?? profile.bio,
        specialization: data.specialization ?? profile.specialization,
        experience_years: data.experience_years ?? profile.experience_years,
        education: data.education ?? profile.education,
        certifications: data.certifications ?? profile.certifications,
      }

      const response = await teachersAPI.updateProfile(payload)
      const updatedProfile = Array.isArray(response?.results) ? response.results[0] : response?.data || response

      if (updatedProfile) {
        const mergedProfile = { ...profile, ...payload, ...updatedProfile }
        onProfileUpdate(mergedProfile as TeacherProfile)
        toast.success('تم تحديث الملف الشخصي بنجاح')
      } else {
        toast.warning('تم حفظ التعديلات لكن لم نستلم نسخة محدثة من الخادم')
      }
    } catch (error: unknown) {
      console.error('Failed to update teacher profile:', error)
      const message =
        error instanceof Error
          ? error.message
          : 'حدث خطأ غير متوقع أثناء حفظ التعديلات. يرجى المحاولة مرة أخرى.'
      toast.error(message)
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <ProfileEdit
        profile={profile}
        onSave={handleSave}
        onCancel={() => {
          toast.info('لم يتم حفظ أي تعديلات')
        }}
      />

      <Card className="border border-gray-200 shadow-sm">
        <CardContent className="text-sm text-gray-600 space-y-2 leading-relaxed">
          <p>
            يتم حفظ التعديلات مباشرة في الملف الشخصي المرتبط بالحساب:{' '}
            <span className="font-semibold text-gray-900">{user?.email ?? profile.email}</span>
          </p>
          {isSubmitting && <p className="text-primary font-medium">جاري حفظ التعديلات...</p>}
          <p className="text-xs text-gray-500">
            في حال لم تظهر التحديثات فورًا، استخدم زر التحديث أعلى الصفحة لإعادة تحميل البيانات من الخادم.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
