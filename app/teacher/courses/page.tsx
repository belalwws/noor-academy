"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAppSelector } from '../../../lib/hooks'
import { apiClient } from '../../../lib/api'
import ProtectedRoute from '../../../components/ProtectedRoute'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card'
import { Button } from '../../../components/ui/button'
import { Badge } from '../../../components/ui/badge'
import { Input } from '../../../components/ui/input'
import { Textarea } from '../../../components/ui/textarea'
import { Label } from '../../../components/ui/label'
import { Progress } from '../../../components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../../components/ui/dialog'
import { 
  BookOpen, 
  Users, 
  Clock, 
  Plus,
  Edit,
  Eye,
  Trash2,
  Calendar,
  Video,
  FileText,
  Settings,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Upload,
  Download
} from 'lucide-react'

interface Course {
  id: number
  title: string
  description: string
  content: string
  level: string
  category: string
  duration: number
  max_students: number
  enrolled_students: number
  price: number
  status: 'draft' | 'pending_review' | 'published' | 'archived'
  created_at: string
  updated_at: string
  start_date?: string
  end_date?: string
  thumbnail?: string
  lessons_count: number
  assignments_count: number
  completion_rate: number
}

interface CourseFormData {
  title: string
  description: string
  content: string
  level: string
  category: string
  duration: number
  max_students: number
  price: number
  start_date: string
  end_date: string
  target_audience: string
  requirements: string
  learning_outcomes: string
}

export default function TeacherCoursesPage() {
  const router = useRouter()
  const { user } = useAppSelector(state => state.auth)
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [formData, setFormData] = useState<CourseFormData>({
    title: '',
    description: '',
    content: '',
    level: 'beginner',
    category: 'quran',
    duration: 0,
    max_students: 30,
    price: 0,
    start_date: '',
    end_date: '',
    target_audience: '',
    requirements: '',
    learning_outcomes: ''
  })
  const [submitting, setSubmitting] = useState(false)

  const categories = [
    { value: 'quran', label: 'القرآن الكريم' },
    { value: 'hadith', label: 'الحديث الشريف' },
    { value: 'fiqh', label: 'الفقه الإسلامي' },
    { value: 'arabic', label: 'اللغة العربية' },
    { value: 'tafsir', label: 'التفسير' },
    { value: 'seerah', label: 'السيرة النبوية' },
    { value: 'aqeedah', label: 'العقيدة' },
    { value: 'akhlaq', label: 'الأخلاق والآداب' }
  ]

  const levels = [
    { value: 'beginner', label: 'مبتدئ' },
    { value: 'intermediate', label: 'متوسط' },
    { value: 'advanced', label: 'متقدم' }
  ]

  const statuses = [
    { value: 'all', label: 'جميع الحالات' },
    { value: 'draft', label: 'مسودة' },
    { value: 'pending_review', label: 'قيد المراجعة' },
    { value: 'published', label: 'منشورة' },
    { value: 'archived', label: 'مؤرشفة' }
  ]

  useEffect(() => {
    loadCourses()
  }, [])

  const loadCourses = async () => {
    try {
      setLoading(true)
      setError('')
      
      const response = await apiClient.getTeacherCourses()
      const coursesData = response.data?.results || response.data || []
      
      setCourses(coursesData)
    } catch (error: any) {
      console.error('Error loading courses:', error)
      setError('حدث خطأ في تحميل الدورات')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setSubmitting(true)
      
      await apiClient.createCourse(formData)
      
      setCreateDialogOpen(false)
      resetForm()
      loadCourses()
    } catch (error: any) {
      console.error('Error creating course:', error)
      setError('حدث خطأ في إنشاء الدورة')
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdateCourse = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedCourse) return
    
    try {
      setSubmitting(true)
      
      await apiClient.updateCourse(selectedCourse.id, formData)
      
      setEditDialogOpen(false)
      setSelectedCourse(null)
      resetForm()
      loadCourses()
    } catch (error: any) {
      console.error('Error updating course:', error)
      setError('حدث خطأ في تحديث الدورة')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteCourse = async (courseId: number) => {
    if (!confirm('هل أنت متأكد من حذف هذه الدورة؟ لا يمكن التراجع عن هذا الإجراء.')) {
      return
    }

    try {
      await apiClient.deleteCourse(courseId)
      loadCourses()
    } catch (error: any) {
      console.error('Error deleting course:', error)
      setError('حدث خطأ في حذف الدورة')
    }
  }

  const handleEditCourse = (course: Course) => {
    setSelectedCourse(course)
    setFormData({
      title: course.title,
      description: course.description,
      content: course.content,
      level: course.level,
      category: course.category,
      duration: course.duration,
      max_students: course.max_students,
      price: course.price,
      start_date: course.start_date || '',
      end_date: course.end_date || '',
      target_audience: '',
      requirements: '',
      learning_outcomes: ''
    })
    setEditDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      content: '',
      level: 'beginner',
      category: 'quran',
      duration: 0,
      max_students: 30,
      price: 0,
      start_date: '',
      end_date: '',
      target_audience: '',
      requirements: '',
      learning_outcomes: ''
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-blue-100 text-blue-800'
      case 'pending_review': return 'bg-yellow-100 text-yellow-800'
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'archived': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'published': return 'منشورة'
      case 'pending_review': return 'قيد المراجعة'
      case 'draft': return 'مسودة'
      case 'archived': return 'مؤرشفة'
      default: return status
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || course.status === statusFilter
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['teacher']}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">جاري تحميل الدورات...</p>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute allowedRoles={['teacher']}>
      <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              إدارة الدورات
            </h1>
            <p className="text-gray-600">
              إنشاء وإدارة دوراتك التعليمية
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
                <p className="text-red-800">{error}</p>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={loadCourses}
                  className="mr-4"
                >
                  إعادة المحاولة
                </Button>
              </div>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">إجمالي الدورات</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{courses.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">الدورات المنشورة</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {courses.filter(c => c.status === 'published').length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">إجمالي الطلاب</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {courses.reduce((acc, course) => acc + course.enrolled_students, 0)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">معدل الإكمال</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.round(courses.reduce((acc, course) => acc + course.completion_rate, 0) / courses.length) || 0}%
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Actions */}
          <div className="mb-6 flex flex-col md:flex-row gap-4 justify-between">
            <div className="flex gap-4">
              <Input
                placeholder="البحث في الدورات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                {statuses.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 ml-2" />
                  إنشاء دورة جديدة
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-white dark:bg-slate-900" dir="rtl">
                <DialogHeader>
                  <DialogTitle>إنشاء دورة جديدة</DialogTitle>
                  <DialogDescription>
                    أدخل تفاصيل الدورة الجديدة. سيتم إرسالها للمراجعة من قبل المشرفين.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateCourse} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title">عنوان الدورة *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="category">الفئة *</Label>
                      <select
                        id="category"
                        value={formData.category}
                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        required
                      >
                        {categories.map(category => (
                          <option key={category.value} value={category.value}>
                            {category.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">وصف الدورة *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      rows={3}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="content">محتوى الدورة المفصل</Label>
                    <Textarea
                      id="content"
                      value={formData.content}
                      onChange={(e) => setFormData({...formData, content: e.target.value})}
                      rows={5}
                      placeholder="اكتب محتوى الدورة المفصل هنا..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="level">المستوى *</Label>
                      <select
                        id="level"
                        value={formData.level}
                        onChange={(e) => setFormData({...formData, level: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        required
                      >
                        {levels.map(level => (
                          <option key={level.value} value={level.value}>
                            {level.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="duration">المدة (ساعات) *</Label>
                      <Input
                        id="duration"
                        type="number"
                        min="1"
                        value={formData.duration}
                        onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value)})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="max_students">الحد الأقصى للطلاب *</Label>
                      <Input
                        id="max_students"
                        type="number"
                        min="1"
                        max="100"
                        value={formData.max_students}
                        onChange={(e) => setFormData({...formData, max_students: parseInt(e.target.value)})}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="price">السعر (ر.س)</Label>
                      <Input
                        id="price"
                        type="number"
                        min="0"
                        value={formData.price}
                        onChange={(e) => setFormData({...formData, price: parseInt(e.target.value)})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="start_date">تاريخ البداية</Label>
                      <Input
                        id="start_date"
                        type="date"
                        value={formData.start_date}
                        onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="end_date">تاريخ النهاية</Label>
                      <Input
                        id="end_date"
                        type="date"
                        value={formData.end_date}
                        onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="target_audience">الجمهور المستهدف</Label>
                    <Textarea
                      id="target_audience"
                      value={formData.target_audience}
                      onChange={(e) => setFormData({...formData, target_audience: e.target.value})}
                      rows={2}
                      placeholder="من هو الجمهور المستهدف لهذه الدورة؟"
                    />
                  </div>

                  <div>
                    <Label htmlFor="requirements">متطلبات الدورة</Label>
                    <Textarea
                      id="requirements"
                      value={formData.requirements}
                      onChange={(e) => setFormData({...formData, requirements: e.target.value})}
                      rows={2}
                      placeholder="ما هي المتطلبات المسبقة لهذه الدورة؟"
                    />
                  </div>

                  <div>
                    <Label htmlFor="learning_outcomes">نواتج التعلم</Label>
                    <Textarea
                      id="learning_outcomes"
                      value={formData.learning_outcomes}
                      onChange={(e) => setFormData({...formData, learning_outcomes: e.target.value})}
                      rows={3}
                      placeholder="ما الذي سيتعلمه الطلاب من هذه الدورة؟"
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                      إلغاء
                    </Button>
                    <Button type="submit" disabled={submitting}>
                      {submitting ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      ) : (
                        'إنشاء الدورة'
                      )}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Courses Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <Card key={course.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg line-clamp-2">{course.title}</CardTitle>
                      <CardDescription className="mt-2 line-clamp-2">
                        {course.description}
                      </CardDescription>
                    </div>
                    <Badge className={getStatusColor(course.status)}>
                      {getStatusLabel(course.status)}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 ml-1" />
                      {course.enrolled_students}/{course.max_students}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 ml-1" />
                      {course.duration} ساعة
                    </div>
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 ml-1" />
                      {course.lessons_count} درس
                    </div>
                    <div className="flex items-center">
                      <BarChart3 className="h-4 w-4 ml-1" />
                      {course.completion_rate}% إكمال
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>نسبة الامتلاء</span>
                      <span>{Math.round((course.enrolled_students / course.max_students) * 100)}%</span>
                    </div>
                    <Progress value={(course.enrolled_students / course.max_students) * 100} className="h-2" />
                  </div>

                  <div className="text-sm text-gray-500">
                    آخر تحديث: {formatDate(course.updated_at)}
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => router.push(`/teacher/courses/${course.id}`)}
                    >
                      <Eye className="w-4 h-4 ml-2" />
                      عرض
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleEditCourse(course)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    {course.status === 'draft' && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleDeleteCourse(course.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredCourses.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                لا توجد دورات
              </h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || statusFilter !== 'all' 
                  ? 'لا توجد دورات تطابق معايير البحث'
                  : 'لم تقم بإنشاء أي دورات بعد'
                }
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <Button onClick={() => setCreateDialogOpen(true)}>
                  <Plus className="w-4 h-4 ml-2" />
                  إنشاء دورة جديدة
                </Button>
              )}
            </div>
          )}

          {/* Edit Dialog */}
          <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-white dark:bg-slate-900" dir="rtl">
              <DialogHeader>
                <DialogTitle>تعديل الدورة</DialogTitle>
                <DialogDescription>
                  تعديل تفاصيل الدورة المحددة
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleUpdateCourse} className="space-y-6">
                {/* Same form fields as create dialog */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit_title">عنوان الدورة *</Label>
                    <Input
                      id="edit_title"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit_category">الفئة *</Label>
                    <select
                      id="edit_category"
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      required
                    >
                      {categories.map(category => (
                        <option key={category.value} value={category.value}>
                          {category.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="edit_description">وصف الدورة *</Label>
                  <Textarea
                    id="edit_description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={3}
                    required
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                    إلغاء
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    ) : (
                      'حفظ التغييرات'
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </ProtectedRoute>
  )
}
