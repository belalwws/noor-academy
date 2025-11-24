'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'

import { 
  BookOpen, 
  Calendar, 
  Clock, 
  User, 
  Award, 
  Play,
  Search,
  Filter,
  ExternalLink,
  Download,
  RefreshCw
} from 'lucide-react'

interface StudentCoursesProps {
  courses: any[]
  onRefresh: () => void
}

export default function StudentCourses({ courses, onRefresh }: StudentCoursesProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [refreshing, setRefreshing] = useState(false)

  // Filter courses based on search and status
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.teacher_name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || course.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleRefresh = async () => {
    setRefreshing(true)
    await onRefresh()
    setRefreshing(false)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-blue-100 text-blue-800">نشط</Badge>
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800">مكتمل</Badge>
      case 'paused':
        return <Badge className="bg-yellow-100 text-yellow-800">متوقف</Badge>
      case 'dropped':
        return <Badge className="bg-red-100 text-red-800">منسحب</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getCourseTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      individual: 'فردي',
      family: 'عائلي',
      group_private: 'مجموعة خاصة',
      group_public: 'مجموعة عامة'
    }
    return labels[type] || type
  }

  return (
    <div className="space-y-6">
      {/* Header with Search and Filters */}
      <Card className="shadow-lg border-0 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <BookOpen className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-xl">دوراتي</CardTitle>
                <CardDescription>إجمالي {courses.length} دورة مسجلة</CardDescription>
              </div>
            </div>
            
            <Button 
              onClick={handleRefresh}
              disabled={refreshing}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              تحديث
            </Button>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="البحث في الدورات أو أسماء المعلمين..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10 bg-white"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">جميع الحالات</option>
              <option value="active">نشط</option>
              <option value="completed">مكتمل</option>
              <option value="paused">متوقف</option>
              <option value="dropped">منسحب</option>
            </select>
          </div>
        </CardHeader>
      </Card>

      {/* Course Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
          <div className="text-2xl font-bold text-blue-700">
            {courses.filter(c => c.status === 'active').length}
          </div>
          <div className="text-sm text-blue-600">دورات نشطة</div>
        </div>
        
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
          <div className="text-2xl font-bold text-blue-700">
            {courses.filter(c => c.status === 'completed').length}
          </div>
          <div className="text-sm text-blue-600">دورات مكتملة</div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
          <div className="text-2xl font-bold text-purple-700">
            {courses.reduce((sum, course) => sum + (course.certificates_earned || 0), 0)}
          </div>
          <div className="text-sm text-purple-600">شهادات مكتسبة</div>
        </div>
        
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-xl border border-yellow-200">
          <div className="text-2xl font-bold text-yellow-700">
            {courses.length > 0 
              ? (courses.reduce((sum, course) => sum + (course.completion_percentage || 0), 0) / courses.length).toFixed(0)
              : 0}%
          </div>
          <div className="text-sm text-yellow-600">متوسط التقدم</div>
        </div>
      </div>

      {/* Courses List */}
      {filteredCourses.length === 0 ? (
        <Card className="shadow-lg border-0">
          <CardContent className="text-center py-12">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              {searchTerm || statusFilter !== 'all' ? 'لا توجد دورات تطابق البحث' : 'لا توجد دورات مسجلة'}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || statusFilter !== 'all' 
                ? 'جرب تغيير معايير البحث أو الفلترة'
                : 'ابدأ رحلتك التعليمية بالتسجيل في دورة جديدة'
              }
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <Link href="/live-teaching">
                <Button className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700">
                  <BookOpen className="w-4 h-4 ml-2" />
                  تصفح الدورات المتاحة
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredCourses.map((course, index) => (
            <Card key={index} className="shadow-lg border-0 hover:shadow-xl transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2 line-clamp-2">{course.title}</CardTitle>
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusBadge(course.status)}
                      <Badge variant="outline" className="text-xs">
                        {getCourseTypeLabel(course.course_type)}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                {course.description && (
                  <CardDescription className="line-clamp-2">
                    {course.description}
                  </CardDescription>
                )}
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">التقدم</span>
                    <span className="font-medium">{course.completion_percentage || 0}%</span>
                  </div>
                  <Progress value={course.completion_percentage || 0} className="h-2" />
                </div>

                {/* Course Info */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <User className="w-4 h-4" />
                    <span>{course.teacher_name}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(course.enrollment_date).toLocaleDateString('ar-SA')}</span>
                  </div>
                  
                  {course.total_sessions && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>{course.attended_sessions || 0}/{course.total_sessions} جلسة</span>
                    </div>
                  )}
                  
                  {course.grade && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Award className="w-4 h-4" />
                      <span>{course.grade}%</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-4 border-t">
                  {course.status === 'active' && (
                    <Button size="sm" className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
                      <Play className="w-4 h-4 ml-2" />
                      متابعة الدراسة
                    </Button>
                  )}
                  
                  {course.status === 'completed' && course.certificate_url && (
                    <Button size="sm" variant="outline" className="flex-1">
                      <Download className="w-4 h-4 ml-2" />
                      تحميل الشهادة
                    </Button>
                  )}
                  
                  <Button size="sm" variant="outline">
                    <ExternalLink className="w-4 h-4 ml-2" />
                    التفاصيل
                  </Button>
                </div>

                {/* Next Session Info */}
                {course.next_session && course.status === 'active' && (
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <div className="text-sm font-medium text-blue-800 mb-1">الجلسة القادمة</div>
                    <div className="text-sm text-blue-600">
                      {new Date(course.next_session).toLocaleString('ar-SA')}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
