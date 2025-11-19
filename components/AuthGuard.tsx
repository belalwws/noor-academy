'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Lock, 
  UserPlus, 
  LogIn, 
  BookOpen, 
  Users, 
  MessageSquare,
  ArrowLeft,
  Star,
  Shield
} from 'lucide-react'
import { useAuth } from '@/lib/hooks/useAuth'

interface AuthGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  requireAuth?: boolean
  showPreview?: boolean
}

const CommunityLoginPrompt = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 p-4 md:p-6" dir="rtl">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-l from-emerald-800 to-green-800 bg-clip-text text-transparent mb-2">
            المجتمع التعليمي
          </h1>
          <p className="text-slate-600 max-w-2xl mx-auto">
            انضم إلى مجتمعنا التعليمي لتبادل المعرفة والاستفادة من خبرات الآخرين
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Login Card */}
          <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-emerald-200">
            <CardHeader className="bg-gradient-to-l from-emerald-50 to-green-50 rounded-t-lg text-center">
              <div className="w-16 h-16 bg-gradient-to-l from-emerald-600 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl bg-gradient-to-l from-emerald-700 to-green-700 bg-clip-text text-transparent">
                تسجيل الدخول مطلوب
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 text-center">
              <p className="text-slate-600 mb-6 leading-relaxed">
                للوصول إلى المجتمع التعليمي والمشاركة في النقاشات، يرجى تسجيل الدخول أو إنشاء حساب جديد
              </p>
              
              <div className="space-y-4">
                <Button 
                  className="w-full bg-gradient-to-l from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 h-12"
                  onClick={() => window.location.href = '/login'}
                >
                  <LogIn className="w-5 h-5 ml-2" />
                  تسجيل الدخول
                </Button>
                
                <Button 
                  variant="outline"
                  className="w-full border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300 h-12"
                  onClick={() => window.location.href = '/register'}
                >
                  <UserPlus className="w-5 h-5 ml-2" />
                  إنشاء حساب جديد
                </Button>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-200">
                <p className="text-sm text-slate-500">
                  هل لديك حساب بالفعل؟ 
                  <button 
                    className="text-emerald-600 hover:text-emerald-700 font-medium mr-1"
                    onClick={() => window.location.href = '/login'}
                  >
                    سجل دخولك هنا
                  </button>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Features Preview */}
          <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-emerald-200">
            <CardHeader className="bg-gradient-to-l from-blue-50 to-indigo-50 rounded-t-lg">
              <CardTitle className="text-xl bg-gradient-to-l from-blue-700 to-indigo-700 bg-clip-text text-transparent flex items-center gap-2">
                <Star className="w-6 h-6 text-yellow-500" />
                ميزات المجتمع التعليمي
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-gradient-to-l from-emerald-100 to-green-100 rounded-lg">
                    <BookOpen className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 mb-1">منتديات تعليمية متخصصة</h3>
                    <p className="text-sm text-slate-600">حفظ القرآن، الدراسات الإسلامية، اللغة العربية، والتجويد</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-gradient-to-l from-blue-100 to-indigo-100 rounded-lg">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 mb-1">مجتمع تفاعلي</h3>
                    <p className="text-sm text-slate-600">تفاعل مع المعلمين والطلاب وتبادل الخبرات والمعرفة</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-gradient-to-l from-purple-100 to-violet-100 rounded-lg">
                    <MessageSquare className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 mb-1">نقاشات هادفة</h3>
                    <p className="text-sm text-slate-600">شارك في النقاشات التعليمية واطرح أسئلتك</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-gradient-to-l from-orange-100 to-red-100 rounded-lg">
                    <Shield className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 mb-1">بيئة آمنة ومراقبة</h3>
                    <p className="text-sm text-slate-600">مجتمع محمي ومراقب لضمان جودة المحتوى</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-200">
                <Badge className="bg-gradient-to-l from-emerald-100 to-green-100 text-emerald-800 border-emerald-200 w-full justify-center py-2">
                  <Star className="w-4 h-4 ml-1" />
                  انضم إلى أكثر من 1000+ طالب ومعلم
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-8">
          <Button 
            variant="ghost"
            className="text-slate-600 hover:text-emerald-600"
            onClick={() => window.location.href = '/'}
          >
            <ArrowLeft className="w-4 h-4 ml-2" />
            العودة إلى الصفحة الرئيسية
          </Button>
        </div>
      </div>
    </div>
  )
}

const AuthGuard: React.FC<AuthGuardProps> = ({ 
  children, 
  fallback, 
  requireAuth = true,
  showPreview = false 
}) => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-slate-600">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  if (requireAuth && !user) {
    return fallback || <CommunityLoginPrompt />
  }

  return <>{children}</>
}

export default AuthGuard
