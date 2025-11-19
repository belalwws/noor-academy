'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  Edit3,
  BarChart3, 
  BookOpen, 
  Users, 
  Clock, 
  Star, 
  TrendingUp,
  Award,
  Target,
  Calendar,
  Activity
} from 'lucide-react'

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

interface ProfileStatsProps {
  profile: TeacherProfile | null
}

export default function ProfileStats({ profile }: ProfileStatsProps) {
  if (!profile) {
    return (
      <Card className="border-2 border-gray-200">
        <CardContent className="p-8">
          <div className="text-center text-gray-500">
            لا توجد إحصائيات للعرض
          </div>
        </CardContent>
      </Card>
    )
  }

  // Calculate some derived stats
  const avgStudentsPerCourse = profile.courses_count > 0 
    ? Math.round(profile.students_count / profile.courses_count) 
    : 0
  
  const avgHoursPerCourse = profile.courses_count > 0 && profile.total_hours 
    ? Math.round(profile.total_hours / profile.courses_count) 
    : 0

  const experienceLevel = profile.experience_years 
    ? profile.experience_years >= 10 ? 'خبير' 
      : profile.experience_years >= 5 ? 'متقدم'
      : profile.experience_years >= 2 ? 'متوسط' 
      : 'مبتدئ'
    : 'غير محدد'

  const stats = [
    {
      title: 'إجمالي الدورات',
      value: profile.courses_count || 0,
      icon: BookOpen,
      color: 'blue',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      textColor: 'text-blue-800'
    },
    {
      title: 'إجمالي الطلاب',
      value: profile.students_count || 0,
      icon: Users,
      color: 'green',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      textColor: 'text-green-800'
    },
    {
      title: 'ساعات التدريس',
      value: profile.total_hours || 0,
      icon: Clock,
      color: 'purple',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      textColor: 'text-purple-800'
    },
    {
      title: 'سنوات الخبرة',
      value: profile.experience_years || 0,
      icon: Award,
      color: 'orange',
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600',
      textColor: 'text-orange-800'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl">
        <Card className="border-green-300/40 shadow-lg bg-white/60 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                <Edit3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-green-800">البيانات المهنية للمعلم</h2>
                <p className="text-green-600 text-sm">ملفك المهني والتعليمي</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Teacher Profile Data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Professional Info */}
        <Card className="border-2 border-blue-100 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardTitle className="text-blue-800 flex items-center gap-2">
              <Award className="w-5 h-5" />
              المعلومات الأساسية
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">حالة الحساب</span>
                <Badge className={profile.is_approved ? 'bg-green-500' : 'bg-yellow-500'}>
                  {profile.is_approved ? 'معتمد' : 'قيد المراجعة'}
                </Badge>
              </div>
              
              {profile.specialization && (
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">التخصص</span>
                  <span className="font-semibold text-sm">
                    {profile.specialization}
                  </span>
                </div>
              )}
              
              {profile.experience_years && (
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">سنوات الخبرة</span>
                  <span className="font-semibold text-sm">
                    {profile.experience_years} سنة
                  </span>
                </div>
              )}

              {profile.date_joined && (
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">تاريخ الانضمام</span>
                  <span className="font-semibold text-sm">
                    {new Date(profile.date_joined).getFullYear()}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Educational Background */}
        <Card className="border-2 border-purple-100 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
            <CardTitle className="text-purple-800 flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              الخلفية التعليمية
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="space-y-3">
              {profile.education && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600 block mb-2">التعليم والشهادات</span>
                  <span className="font-semibold text-sm">
                    {profile.education}
                  </span>
                </div>
              )}

              {profile.certifications && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600 block mb-2">الشهادات المهنية</span>
                  <span className="font-semibold text-sm">
                    {profile.certifications}
                  </span>
                </div>
              )}

              {profile.bio && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600 block mb-2">نبذة شخصية</span>
                  <span className="font-semibold text-sm">
                    {profile.bio}
                  </span>
                </div>
              )}

              {!profile.education && !profile.certifications && !profile.bio && (
                <div className="p-4 bg-gray-50 rounded-lg text-center text-gray-500">
                  لم يتم إضافة معلومات تعليمية أو مهنية بعد
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
