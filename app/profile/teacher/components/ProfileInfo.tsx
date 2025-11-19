'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  User,
  Mail,
  Phone,
  Calendar,
  Globe,
  Award,
  BookOpen,
  GraduationCap,
  UserCheck,
  Clock,
  MapPin,
  Heart,
  Users,
  Star,
  TrendingUp,
  FileText,
  Download,
  Linkedin,
  Building2,
  ScrollText
} from 'lucide-react'

interface TeacherProfile {
  id: number
  user: any
  specialization?: string
  specialization_other?: string
  academic_degree?: string
  has_ijazah?: boolean
  ijazah_source?: string
  islamic_specialization?: string
  university_name?: string
  graduation_year?: number
  graduation_certificate_url?: string
  cv_file_url?: string
  graduation_certificate_download_url?: string
  cv_file_download_url?: string
  linkedin_url?: string
  biography?: string
  years_of_experience?: number
  primary_teaching_language?: string
  approval_status: string
  approved: boolean
  can_access_platform?: boolean
  created_at: string
  updated_at: string
  // Legacy fields
  first_name?: string
  last_name?: string
  email?: string
  experience_years?: number
  courses_count?: number
  students_count?: number
}

interface User {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  full_name?: string
  is_active: boolean
  is_staff?: boolean
  is_superuser?: boolean
  date_joined: string
  last_login?: string | null
  profile_image_url?: string
  profile_image_thumbnail_url?: string
  role?: string
  is_verified?: boolean
  is_profile_complete?: boolean
  is_profile_public?: boolean
  gender?: string
  age?: number
  bio?: string
  country_code?: string
  phone_number?: string
  preferred_language?: string
  learning_goal?: string
}

interface ProfileInfoProps {
  profile: TeacherProfile | null
  user: User | null
}

// Helper function to translate specialization
const getSpecializationLabel = (specialization: string) => {
  const specializations: { [key: string]: string } = {
    'memorize_quran': 'حفظ القرآن الكريم',
    'arabic_language': 'اللغة العربية',
    'islamic_studies': 'الدراسات الإسلامية',
    'quran_recitation': 'تلاوة القرآن',
    'hadith_studies': 'دراسات الحديث',
    'fiqh': 'الفقه الإسلامي',
    'tafsir': 'تفسير القرآن',
    'aqeedah': 'العقيدة الإسلامية'
  }
  return specializations[specialization] || specialization
}


export default function ProfileInfo({ profile, user }: ProfileInfoProps) {
  if (!profile || !user) {
    return (
      <Card className="border-2 border-gray-200">
        <CardContent className="p-8">
          <div className="text-center text-gray-500 py-4">
            جاري تحميل البيانات...
          </div>
        </CardContent>
      </Card>
    )
  }

  const fullName = `${profile.first_name} ${profile.last_name}`.trim() || user.username

  return (
    <div className="space-y-4">
      {/* Essential Info Only */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-white via-green-50/30 to-blue-50/20 overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400/10 to-blue-400/10 rounded-full blur-3xl"></div>
        <CardContent className="p-6 relative z-10">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            المعلومات الأساسية
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 min-h-[80px]">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-blue-600 font-medium mb-1">الاسم</p>
                <p className="font-bold text-blue-800 break-words">{user.full_name || fullName}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 min-h-[80px]">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-green-600 font-medium mb-1">البريد الإلكتروني</p>
                <p className="font-bold text-green-800 text-sm break-words overflow-wrap-anywhere" title={user.email}>{user.email}</p>
              </div>
            </div>

            {user.phone_number && (
              <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl border border-purple-100 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 min-h-[80px]">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-violet-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-purple-600 font-medium mb-1">رقم الهاتف</p>
                  <p className="font-bold text-purple-800 break-words">{user.country_code} {user.phone_number}</p>
                </div>
              </div>
            )}

            {profile.specialization && (
              <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-100 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 min-h-[80px]">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-orange-600 font-medium mb-1">التخصص</p>
                  <p className="font-bold text-orange-800 break-words">{getSpecializationLabel(profile.specialization)}</p>
                </div>
              </div>
            )}

            {user.age && (
              <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl border border-red-100 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 min-h-[80px]">
                <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-red-600 font-medium mb-1">العمر</p>
                  <p className="font-bold text-red-800">{user.age} سنة</p>
                </div>
              </div>
            )}

            {(profile.years_of_experience || profile.experience_years) && (
              <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl border border-indigo-100 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 min-h-[80px]">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-indigo-600 font-medium mb-1">سنوات الخبرة</p>
                  <p className="font-bold text-indigo-800">{profile.years_of_experience || profile.experience_years} سنة</p>
                </div>
              </div>
            )}

            {profile.academic_degree && (
              <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl border border-teal-100 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 min-h-[80px]">
                <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Award className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-teal-600 font-medium mb-1">الدرجة العلمية</p>
                  <p className="font-bold text-teal-800 break-words">{profile.academic_degree}</p>
                </div>
              </div>
            )}

            {profile.university_name && (
              <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl border border-rose-100 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 min-h-[80px]">
                <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-rose-600 font-medium mb-1">الجامعة</p>
                  <p className="font-bold text-rose-800 break-words">{profile.university_name}</p>
                </div>
              </div>
            )}

            {profile.graduation_year && (
              <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl border border-amber-100 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 min-h-[80px]">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-amber-600 font-medium mb-1">سنة التخرج</p>
                  <p className="font-bold text-amber-800">{profile.graduation_year}</p>
                </div>
              </div>
            )}
          </div>

          {/* Simple Status */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2 text-sm flex-wrap">
              <span className="text-gray-600">الحالة:</span>
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                👨‍🏫 معلم نشط
              </span>
              {user.gender && (
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                  {user.gender === 'male' ? '♂️ ذكر' : '♀️ أنثى'}
                </span>
              )}
              {user.preferred_language && (
                <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">
                  🌐 {user.preferred_language === 'ar' ? 'العربية' : 'English'}
                </span>
              )}
              {profile.has_ijazah && (
                <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full text-xs">
                  📜 حاصل على إجازة
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Biography Section */}
      {profile.biography && (
        <Card className="border-0 shadow-xl bg-gradient-to-br from-white via-purple-50/30 to-pink-50/20 overflow-hidden">
          <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-3xl"></div>
          <CardContent className="p-6 relative z-10">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <ScrollText className="w-4 h-4 text-white" />
              </div>
              نبذة عني
            </h3>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{profile.biography}</p>
          </CardContent>
        </Card>
      )}

      {/* Documents Section */}
      {(profile.graduation_certificate_download_url || profile.cv_file_download_url || profile.linkedin_url) && (
        <Card className="border-0 shadow-xl bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/20 overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 rounded-full blur-3xl"></div>
          <CardContent className="p-6 relative z-10">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                <FileText className="w-4 h-4 text-white" />
              </div>
              المستندات والروابط
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {profile.graduation_certificate_download_url && (
                <a
                  href={profile.graduation_certificate_download_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 hover:border-green-400 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 group"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-green-800 mb-1">شهادة التخرج</p>
                    <p className="text-xs text-green-600 flex items-center gap-1">
                      <Download className="w-3 h-3" />
                      تحميل المستند
                    </p>
                  </div>
                </a>
              )}

              {profile.cv_file_download_url && (
                <a
                  href={profile.cv_file_download_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 hover:border-blue-400 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 group"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-blue-800 mb-1">السيرة الذاتية</p>
                    <p className="text-xs text-blue-600 flex items-center gap-1">
                      <Download className="w-3 h-3" />
                      تحميل المستند
                    </p>
                  </div>
                </a>
              )}

              {profile.linkedin_url && (
                <a
                  href={profile.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 bg-gradient-to-r from-sky-50 to-blue-50 rounded-xl border border-sky-200 hover:border-sky-400 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 group"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-sky-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <Linkedin className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-sky-800 mb-1">LinkedIn</p>
                    <p className="text-xs text-sky-600 flex items-center gap-1">
                      <Globe className="w-3 h-3" />
                      زيارة الملف الشخصي
                    </p>
                  </div>
                </a>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Islamic Studies Info */}
      {(profile.has_ijazah || profile.islamic_specialization) && (
        <Card className="border-0 shadow-xl bg-gradient-to-br from-white via-emerald-50/30 to-teal-50/20 overflow-hidden">
          <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-emerald-400/10 to-teal-400/10 rounded-full blur-3xl"></div>
          <CardContent className="p-6 relative z-10">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              المعلومات الإسلامية
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profile.has_ijazah && profile.ijazah_source && (
                <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-100">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Award className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-emerald-600 font-medium mb-1">جهة الإجازة</p>
                    <p className="font-bold text-emerald-800 break-words">{profile.ijazah_source}</p>
                  </div>
                </div>
              )}

              {profile.islamic_specialization && (
                <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl border border-teal-100">
                  <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-teal-600 font-medium mb-1">التخصص الإسلامي</p>
                    <p className="font-bold text-teal-800 break-words">{profile.islamic_specialization}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
