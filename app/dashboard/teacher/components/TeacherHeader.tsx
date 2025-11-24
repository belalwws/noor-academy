'use client'

import { Badge } from '@/components/ui/badge'
import { 
  BookOpen, 
  Users, 
  CheckCircle, 
  Clock,
  TrendingUp,
  Copy
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface TeacherProfile {
  full_name: string
  specialization?: string
  years_of_experience?: number
  bio?: string
  profile_image_url?: string | null
  average_rating?: number
  total_students?: number
  total_lessons?: number
  response_rate?: number
}

interface Course {
  id: string
  title: string
  description: string
  learning_outcomes?: string
  course_type: "individual" | "family" | "group_private" | "group_public"
  course_type_display: string
  subjects?: string
  trial_session_url?: string
  max_students: string
  teacher: number
  teacher_name: string
  teacher_email: string
  approval_status: "pending" | "approved" | "rejected" | "under_review"
  approval_status_display: string
  approved_by?: number
  approved_by_name?: string
  approved_at?: string
  rejection_reason?: string
  is_published: boolean
  lessons: any[]
  enrolled_count: string
  available_spots: string
  created_at: string
  updated_at: string
  
  // Legacy fields for backward compatibility
  instructor?: number
  instructor_name?: string
  level?: "beginner" | "intermediate" | "advanced"
  learning_path?: "individual" | "group_continuous" | "training" | "live_education"
  duration_weeks?: number
  start_date?: string
  session_duration?: number
  enrollment_count?: number | string
  lessons_count?: number
  next_session?: string
  status?: "draft" | "published" | "archived" | "pending_review"
  is_approved?: boolean
}

interface TeacherHeaderProps {
  profile: TeacherProfile | null
  courses: Course[]
  loading: boolean
  userEmail?: string
}

export default function TeacherHeader({ profile, courses, loading, userEmail }: TeacherHeaderProps) {
  // Handle copy email - نسخ من الـ dropdown menu الموجود
  const handleCopyEmail = async () => {
    try {
      // Get user email from auth profile API (نفس الطريقة المستخدمة في dashboard المشرف)
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('يرجى تسجيل الدخول أولاً');
        return;
      }

      const API_URL = process.env['NEXT_PUBLIC_API_URL'] || 'https://lisan-alhekma.onrender.com/api';
      const response = await fetch(`${API_URL}/auth/profile/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (response.ok) {
        const userData = await response.json();
        const userEmailFromAPI = userData.email || userEmail || 'teacher@example.com';
        await navigator.clipboard.writeText(userEmailFromAPI);
        toast.success('تم نسخ الإيميل بنجاح! ✨', {
          description: userEmailFromAPI,
          duration: 3000,
        });
      } else {
        // Fallback to userEmail prop or localStorage
        const fallbackEmail = userEmail || localStorage.getItem('userEmail') || 'teacher@example.com';
        await navigator.clipboard.writeText(fallbackEmail);
        toast.success('تم نسخ الإيميل بنجاح! ✨', {
          description: fallbackEmail,
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('Error copying email:', error);
      toast.error('فشل في نسخ الإيميل');
    }
  };
  if (loading) {
    return (
      <div className="bg-gradient-to-br from-[#2d7d32] via-[#4caf50] to-[#1b5e20] rounded-3xl p-8 text-white shadow-2xl border border-blue-200 animate-pulse">
        <div className="flex items-center gap-6 mb-8">
          <div className="w-24 h-24 bg-white/20 rounded-full"></div>
          <div className="flex-1">
            <div className="h-8 bg-white/20 rounded mb-2"></div>
            <div className="h-4 bg-white/20 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-[#2d7d32] via-[#4caf50] to-[#1b5e20] rounded-3xl p-8 text-white shadow-2xl border border-blue-200 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-br from-blue-300/20 to-transparent rounded-full blur-2xl"></div>
      
      <div className="relative z-10">
        {/* Profile Section */}
        <div className="flex items-center gap-6 mb-8">
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-br from-white/30 to-white/10 rounded-full flex items-center justify-center backdrop-blur-sm border-2 border-white/20">
              {profile?.profile_image_url ? (
                <img 
                  src={profile.profile_image_url} 
                  alt={profile.full_name}
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <Users className="w-12 h-12 text-white" />
              )}
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center border-2 border-white">
              <span className="text-xs font-bold text-white">✨</span>
            </div>
          </div>
          
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">
              مرحباً، {profile?.full_name || 'المعلم'}! 👋
            </h1>
            <p className="text-blue-100 text-lg mb-3">
              الإدارة الشاملة لدوراتك وطلابك
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              {profile?.specialization && (
                <Badge className="bg-white/20 text-white border-white/30 px-3 py-1">
                  {profile.specialization}
                </Badge>
              )}
              {userEmail && (
                <Button
                  onClick={handleCopyEmail}
                  variant="outline"
                  size="sm"
                  className="bg-white/20 border-white/30 text-white hover:bg-white/30 backdrop-blur-sm transition-all duration-300 hover:scale-105"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  نسخ الإيميل
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Total Courses */}
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium mb-1">إجمالي الدورات</p>
                <p className="text-2xl font-bold text-white">{courses.length}</p>
                <p className="text-xs text-blue-200 mt-1">دورة نشطة</p>
              </div>
              <div className="bg-white/30 p-3 rounded-full">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>

          {/* Approved Courses */}
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium mb-1">مفعلة</p>
                <p className="text-2xl font-bold text-white">
                  {courses.filter(c => (c.is_approved === true) || (c.approval_status === 'approved')).length}
                </p>
                <p className="text-xs text-blue-200 mt-1">دورة معتمدة</p>
              </div>
              <div className="bg-white/30 p-3 rounded-full">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>

          {/* Total Students */}
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium mb-1">إجمالي الطلاب</p>
                <p className="text-2xl font-bold text-white">
                  {courses.reduce((total, course) => {
                    const enrolled = Number(course.enrollment_count || course.enrolled_count || 0)
                    return total + enrolled
                  }, 0)}
                </p>
                <p className="text-xs text-blue-200 mt-1">طالب مسجل</p>
              </div>
              <div className="bg-white/30 p-3 rounded-full">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>

          {/* Pending Courses */}
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium mb-1">قيد المراجعة</p>
                <p className="text-2xl font-bold text-white">
                  {courses.filter(c => c.approval_status === 'pending' || c.approval_status === 'under_review').length}
                </p>
                <p className="text-xs text-blue-200 mt-1">دورات تحتاج موافقة</p>
              </div>
              <div className="bg-white/30 p-3 rounded-full">
                <Clock className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
