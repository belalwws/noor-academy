'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Search,
  Filter,
  Grid3X3,
  List,
  BookOpen,
  Users,
  Clock,
  Star,
  TrendingUp,
  Plus,
  BarChart3,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'
import TeamsStyleTeacherCourseCard from './TeamsStyleTeacherCourseCard'
import TeacherCourseDetailPage from './TeacherCourseDetailPage'

interface Course {
  id: string
  title: string
  description?: string
  course_type: string
  course_type_display: string
  enrollment_count?: number | string
  max_students?: number
  status?: string
  is_approved?: boolean
  approval_status?: string
  next_session?: string
  total_sessions?: number
  recent_notes_count?: number
  active_students?: number
}

interface TeamsStyleTeacherCoursesViewProps {
  courses: Course[]
  loading: boolean
  onRefresh: () => void
  onViewDetails: (course: Course) => void
  onAddNote: (course: Course) => void
}

export default function TeamsStyleTeacherCoursesView({
  courses,
  loading,
  onRefresh,
  onViewDetails,
  onAddNote
}: TeamsStyleTeacherCoursesViewProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [filterType, setFilterType] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = filterType === 'all' || course.course_type === filterType
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'approved' && (course.is_approved || course.approval_status === 'approved')) ||
                         (statusFilter === 'pending' && (course.approval_status === 'pending' || course.status === 'pending_review')) ||
                         (statusFilter === 'draft' && course.status === 'draft')
    
    return matchesSearch && matchesType && matchesStatus
  })

  const getQuickStats = () => {
    const totalCourses = courses.length
    const approvedCourses = courses.filter(c => c.is_approved || c.approval_status === 'approved').length
    const pendingCourses = courses.filter(c => c.approval_status === 'pending' || c.status === 'pending_review').length
    const totalStudents = courses.reduce((sum, c) => sum + Number(c.enrollment_count || 0), 0)

    return { totalCourses, approvedCourses, pendingCourses, totalStudents }
  }

  const stats = getQuickStats()

  const handleManageCourse = (courseId: string) => {
    // Navigate to course management page
    window.location.href = `/teacher/courses/${courseId}/manage`
  }

  const handleViewDetails = (course: Course) => {
    setSelectedCourse(course)
  }

  if (selectedCourse) {
    return (
      <TeacherCourseDetailPage
        course={selectedCourse}
        onBack={() => setSelectedCourse(null)}
        onAddNote={onAddNote}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">دوراتي التعليمية</h1>
          <p className="text-gray-600">إدارة ومتابعة جميع الدورات التي تقوم بتدريسها</p>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={onRefresh}
            variant="outline"
            className="border-[#2d7d32] text-[#2d7d32] hover:bg-[#2d7d32] hover:text-white"
          >
            تحديث البيانات
          </Button>
          <Link href="/create-course/form">
            <Button className="bg-gradient-to-r from-[#2d7d32] to-[#4caf50] hover:from-[#1b5e20] hover:to-[#2d7d32] text-white">
              <Plus className="w-4 h-4 mr-2" />
              إنشاء دورة جديدة
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-700">{stats.totalCourses}</p>
                <p className="text-sm text-blue-600">إجمالي الدورات</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-700">{stats.approvedCourses}</p>
                <p className="text-sm text-blue-600">دورات معتمدة</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-500 rounded-xl flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-700">{stats.pendingCourses}</p>
                <p className="text-sm text-yellow-600">قيد المراجعة</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-700">{stats.totalStudents}</p>
                <p className="text-sm text-purple-600">إجمالي الطلاب</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="shadow-sm border-0 rounded-2xl">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="البحث في الدورات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10 rounded-xl border-gray-200"
              />
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-xl bg-white text-sm"
              >
                <option value="all">جميع الأنواع</option>
                <option value="individual">فردي</option>
                <option value="family">عائلي</option>
                <option value="group_private">مجموعة خاصة</option>
                <option value="group_public">مجموعة عامة</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-xl bg-white text-sm"
              >
                <option value="all">جميع الحالات</option>
                <option value="approved">معتمدة</option>
                <option value="pending">قيد المراجعة</option>
                <option value="draft">مسودة</option>
              </select>

              {/* View Mode Toggle */}
              <div className="flex items-center border border-gray-200 rounded-xl p-1">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="h-8 w-8 p-0"
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="h-8 w-8 p-0"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Courses Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-20 bg-gray-200 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredCourses.length > 0 ? (
        <div className={`grid gap-6 ${
          viewMode === 'grid' 
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
            : 'grid-cols-1'
        }`}>
          {filteredCourses.map((course) => (
            <TeamsStyleTeacherCourseCard
              key={course.id}
              course={course}
              onViewDetails={handleViewDetails}
              onManageCourse={handleManageCourse}
              onAddNote={onAddNote}
            />
          ))}
        </div>
      ) : (
        <Card className="shadow-sm border-0 rounded-2xl">
          <CardContent className="p-12 text-center">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد دورات</h3>
            <p className="text-gray-600 mb-6">لم يتم العثور على دورات تطابق معايير البحث</p>
            <div className="flex gap-3 justify-center">
              <Button 
                onClick={() => {
                  setSearchTerm('')
                  setFilterType('all')
                  setStatusFilter('all')
                }}
                variant="outline"
              >
                مسح الفلاتر
              </Button>
              <Link href="/create-course/form">
                <Button className="bg-gradient-to-r from-[#2d7d32] to-[#4caf50] hover:from-[#1b5e20] hover:to-[#2d7d32] text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  إنشاء دورة جديدة
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
