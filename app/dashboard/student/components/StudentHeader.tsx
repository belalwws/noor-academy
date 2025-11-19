'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'

import { 
  User, 
  BookOpen, 
  Calendar, 
  Award, 
  RefreshCw,
  GraduationCap,
  Star,
  TrendingUp,
  Clock
} from 'lucide-react'

interface StudentHeaderProps {
  profile: any
  user: any
  courses: any[]
  profileImage: string
  lastUpdated: string
  refreshing: boolean
  onRefresh: () => void
}

export default function StudentHeader({ 
  profile, 
  user, 
  courses, 
  profileImage, 
  lastUpdated, 
  refreshing, 
  onRefresh 
}: StudentHeaderProps) {
  const completedCourses = courses.filter(c => c.status === 'completed').length
  const inProgressCourses = courses.filter(c => c.status === 'active').length
  const totalStudyHours = profile?.total_study_hours || 0
  const averageGrade = profile?.average_grade || 0

  return (
    <Card className="mb-8 overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50 border-0 shadow-xl">
      <CardContent className="p-8">
        <div className="flex flex-col lg:flex-row items-start gap-8">
          {/* Profile Image and Basic Info */}
          <div className="flex flex-col items-center text-center lg:text-right">
            <div className="relative mb-4">
              <Avatar className="w-32 h-32 border-4 border-white shadow-xl">
                <AvatarImage 
                  src={profileImage || '/default-student-avatar.png'} 
                  alt="صورة الطالب" 
                />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-2xl font-bold">
                  {user?.first_name?.[0] || 'ط'}
                </AvatarFallback>
              </Avatar>
              {profile?.is_verified && (
                <div className="absolute -bottom-2 -right-2 bg-blue-500 text-white p-2 rounded-full shadow-lg">
                  <Award className="w-4 h-4" />
                </div>
              )}
            </div>
            
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {user?.first_name} {user?.last_name}
            </h1>
            
            <div className="flex flex-wrap gap-2 justify-center mb-4">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                <GraduationCap className="w-4 h-4 ml-1" />
                طالب
              </Badge>
              {profile?.is_verified && (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <Award className="w-4 h-4 ml-1" />
                  موثق
                </Badge>
              )}
              <Badge variant="outline" className="text-gray-600">
                <Calendar className="w-4 h-4 ml-1" />
                منذ {new Date(profile?.enrollment_date || '').getFullYear()}
              </Badge>
            </div>

            {profile?.bio && (
              <p className="text-gray-600 max-w-md text-sm leading-relaxed">
                {profile.bio}
              </p>
            )}
          </div>

          {/* Statistics Cards */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Courses */}
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="bg-blue-100 p-3 rounded-xl">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <div className="text-2xl font-bold text-gray-800 mb-1">
                {courses.length}
              </div>
              <div className="text-sm text-gray-600">إجمالي الدورات</div>
            </div>

            {/* Completed Courses */}
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="bg-green-100 p-3 rounded-xl">
                  <Award className="w-6 h-6 text-green-600" />
                </div>
                <div className="text-xs text-green-600 font-medium">
                  {courses.length > 0 ? Math.round((completedCourses / courses.length) * 100) : 0}%
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-800 mb-1">
                {completedCourses}
              </div>
              <div className="text-sm text-gray-600">دورات مكتملة</div>
            </div>

            {/* Study Hours */}
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="bg-purple-100 p-3 rounded-xl">
                  <Clock className="w-6 h-6 text-purple-600" />
                </div>
                <Star className="w-5 h-5 text-yellow-500" />
              </div>
              <div className="text-2xl font-bold text-gray-800 mb-1">
                {totalStudyHours}
              </div>
              <div className="text-sm text-gray-600">ساعة دراسة</div>
            </div>

            {/* Average Grade */}
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="bg-yellow-100 p-3 rounded-xl">
                  <Star className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="text-xs text-yellow-600 font-medium">
                  {averageGrade > 85 ? 'ممتاز' : averageGrade > 70 ? 'جيد' : 'مقبول'}
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-800 mb-1">
                {averageGrade.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">المعدل العام</div>
            </div>
          </div>
        </div>

        {/* Progress Section */}
        {inProgressCourses > 0 && (
          <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">التقدم الحالي</h3>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {inProgressCourses} دورة نشطة
              </Badge>
            </div>
            <div className="space-y-3">
              {courses.filter(c => c.status === 'active').slice(0, 3).map((course, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{course.title}</span>
                      <span className="text-xs text-gray-500">{course.completion_percentage}%</span>
                    </div>
                    <Progress value={course.completion_percentage} className="h-2" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
          <div className="text-sm text-gray-500">
            آخر تحديث: {lastUpdated}
          </div>
          <Button 
            onClick={onRefresh}
            disabled={refreshing}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            تحديث البيانات
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
