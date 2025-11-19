'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'

import { 
  BookOpen, 
  Award, 
  Clock, 
  Star, 
  TrendingUp,
  Calendar,
  Target,
  BarChart3,
  CheckCircle,
  PlayCircle
} from 'lucide-react'

interface StudentStatsProps {
  profile: any
  courses: any[]
}

export default function StudentStats({ profile, courses }: StudentStatsProps) {
  // Calculate statistics
  const totalCourses = courses.length
  const completedCourses = courses.filter(c => c.status === 'completed').length
  const inProgressCourses = courses.filter(c => c.status === 'active').length
  const pausedCourses = courses.filter(c => c.status === 'paused').length
  
  const completionRate = totalCourses > 0 ? (completedCourses / totalCourses) * 100 : 0
  const averageProgress = courses.length > 0 
    ? courses.reduce((sum, course) => sum + (course.completion_percentage || 0), 0) / courses.length 
    : 0

  const totalStudyHours = profile?.total_study_hours || 0
  const averageGrade = profile?.average_grade || 0
  const certificatesEarned = profile?.certificates_earned || 0

  // Course type distribution
  const courseTypes = courses.reduce((acc, course) => {
    const type = course.course_type || 'other'
    acc[type] = (acc[type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const courseTypeLabels: Record<string, string> = {
    individual: 'فردي',
    family: 'عائلي',
    group_private: 'مجموعة خاصة',
    group_public: 'مجموعة عامة',
    other: 'أخرى'
  }

  return (
    <div className="space-y-8">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-500 p-3 rounded-xl">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-blue-700 mb-1">{totalCourses}</div>
            <div className="text-sm text-blue-600">إجمالي الدورات</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-500 p-3 rounded-xl">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div className="text-xs text-green-600 font-medium">
                {completionRate.toFixed(0)}%
              </div>
            </div>
            <div className="text-3xl font-bold text-green-700 mb-1">{completedCourses}</div>
            <div className="text-sm text-green-600">دورات مكتملة</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-500 p-3 rounded-xl">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <Star className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-3xl font-bold text-purple-700 mb-1">{totalStudyHours}</div>
            <div className="text-sm text-purple-600">ساعة دراسة</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-yellow-500 p-3 rounded-xl">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div className="text-xs text-yellow-600 font-medium">
                {averageGrade > 85 ? 'ممتاز' : averageGrade > 70 ? 'جيد' : 'مقبول'}
              </div>
            </div>
            <div className="text-3xl font-bold text-yellow-700 mb-1">{certificatesEarned}</div>
            <div className="text-sm text-yellow-600">شهادة مكتسبة</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Progress Overview */}
        <Card className="shadow-lg border-0">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <BarChart3 className="w-5 h-5 text-blue-600" />
              </div>
              <CardTitle>نظرة عامة على التقدم</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">معدل الإكمال العام</span>
                  <span className="text-sm text-gray-500">{completionRate.toFixed(1)}%</span>
                </div>
                <Progress value={completionRate} className="h-3" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">متوسط التقدم</span>
                  <span className="text-sm text-gray-500">{averageProgress.toFixed(1)}%</span>
                </div>
                <Progress value={averageProgress} className="h-3" />
              </div>

              {averageGrade > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">المعدل العام</span>
                    <span className="text-sm text-gray-500">{averageGrade.toFixed(1)}%</span>
                  </div>
                  <Progress value={averageGrade} className="h-3" />
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4 border-t">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{inProgressCourses}</div>
                <div className="text-xs text-gray-500">قيد التقدم</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{completedCourses}</div>
                <div className="text-xs text-gray-500">مكتملة</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{pausedCourses}</div>
                <div className="text-xs text-gray-500">متوقفة</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Course Types Distribution */}
        <Card className="shadow-lg border-0">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="bg-indigo-100 p-2 rounded-lg">
                <Target className="w-5 h-5 text-indigo-600" />
              </div>
              <CardTitle>توزيع أنواع الدورات</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(courseTypes).map(([type, count]) => {
              const percentage = totalCourses > 0 ? (count / totalCourses) * 100 : 0
              return (
                <div key={type} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {courseTypeLabels[type] || type}
                      </Badge>
                      <span className="text-sm text-gray-600">{count} دورة</span>
                    </div>
                    <span className="text-sm text-gray-500">{percentage.toFixed(0)}%</span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              )
            })}

            {totalCourses === 0 && (
              <div className="text-center py-8 text-gray-500">
                <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>لا توجد دورات للعرض</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      {courses.length > 0 && (
        <Card className="shadow-lg border-0">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <Calendar className="w-5 h-5 text-green-600" />
              </div>
              <CardTitle>النشاط الأخير</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {courses
                .filter(course => course.status === 'active')
                .slice(0, 5)
                .map((course, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <PlayCircle className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-800">{course.title}</div>
                      <div className="text-sm text-gray-500">
                        التقدم: {course.completion_percentage}% • المعلم: {course.teacher_name}
                      </div>
                    </div>
                    <Badge 
                      variant="secondary" 
                      className={
                        course.status === 'active' ? 'bg-green-100 text-green-800' :
                        course.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }
                    >
                      {course.status === 'active' ? 'نشط' : 
                       course.status === 'completed' ? 'مكتمل' : 'متوقف'}
                    </Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
