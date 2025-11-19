'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Edit,
  GraduationCap,
  Target,
  BookOpen
} from 'lucide-react'

interface StudentInfoProps {
  profile: any
  onEdit: () => void
}

export default function StudentInfo({ profile, onEdit }: StudentInfoProps) {
  if (!profile) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-gray-500">لا توجد معلومات شخصية متاحة</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Personal Information */}
      <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-blue-50">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <CardTitle className="text-xl">المعلومات الأساسية</CardTitle>
            </div>
            <Button 
              onClick={onEdit}
              variant="outline" 
              size="sm"
              className="gap-2 hover:bg-blue-50"
            >
              <Edit className="w-4 h-4" />
              تعديل
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
              <User className="w-5 h-5 text-gray-400" />
              <div>
                <div className="text-sm text-gray-500">الاسم الكامل</div>
                <div className="font-medium">
                  {profile.user?.first_name} {profile.user?.last_name}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
              <Mail className="w-5 h-5 text-gray-400" />
              <div>
                <div className="text-sm text-gray-500">البريد الإلكتروني</div>
                <div className="font-medium">{profile.user?.email}</div>
              </div>
            </div>

            {profile.phone && (
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                <Phone className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500">رقم الهاتف</div>
                  <div className="font-medium">{profile.phone}</div>
                </div>
              </div>
            )}

            {profile.date_of_birth && (
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500">تاريخ الميلاد</div>
                  <div className="font-medium">
                    {new Date(profile.date_of_birth).toLocaleDateString('ar-SA')}
                  </div>
                </div>
              </div>
            )}

            {profile.address && (
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                <MapPin className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500">العنوان</div>
                  <div className="font-medium">{profile.address}</div>
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 border-t">
            <div className="flex items-center gap-3 mb-3">
              <GraduationCap className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-gray-700">معلومات التسجيل</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-sm text-gray-500">تاريخ التسجيل</div>
                <div className="font-medium text-blue-700">
                  {new Date(profile.enrollment_date).toLocaleDateString('ar-SA')}
                </div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-sm text-gray-500">الحالة</div>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {profile.user?.is_active ? 'نشط' : 'غير نشط'}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Academic Information */}
      <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-indigo-50">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-100 p-2 rounded-lg">
              <BookOpen className="w-5 h-5 text-indigo-600" />
            </div>
            <CardTitle className="text-xl">المعلومات الأكاديمية</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {profile.preferred_subjects && (
            <div className="p-4 bg-white rounded-lg border">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                <span className="font-medium text-gray-700">المواد المفضلة</span>
              </div>
              <p className="text-gray-600 leading-relaxed">{profile.preferred_subjects}</p>
            </div>
          )}

          {profile.learning_goals && (
            <div className="p-4 bg-white rounded-lg border">
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-4 h-4 text-indigo-600" />
                <span className="font-medium text-gray-700">الأهداف التعليمية</span>
              </div>
              <p className="text-gray-600 leading-relaxed">{profile.learning_goals}</p>
            </div>
          )}

          {profile.bio && (
            <div className="p-4 bg-white rounded-lg border">
              <div className="flex items-center gap-2 mb-3">
                <User className="w-4 h-4 text-indigo-600" />
                <span className="font-medium text-gray-700">نبذة شخصية</span>
              </div>
              <p className="text-gray-600 leading-relaxed">{profile.bio}</p>
            </div>
          )}

          {/* Academic Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
              <div className="text-2xl font-bold text-blue-700 mb-1">
                {profile.total_courses || 0}
              </div>
              <div className="text-sm text-blue-600">إجمالي الدورات</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
              <div className="text-2xl font-bold text-green-700 mb-1">
                {profile.certificates_earned || 0}
              </div>
              <div className="text-sm text-green-600">الشهادات المكتسبة</div>
            </div>
          </div>

          {profile.last_activity && (
            <div className="pt-4 border-t text-center">
              <div className="text-sm text-gray-500">آخر نشاط</div>
              <div className="font-medium text-gray-700">
                {new Date(profile.last_activity).toLocaleString('ar-SA')}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
