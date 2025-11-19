'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { 
  ArrowLeft,
  BookOpen, 
  Users, 
  Calendar, 
  Clock,
  MessageSquare,
  Video,
  User,
  Pin,
  AlertCircle,
  FileText,
  Play,
  CheckCircle,
  Plus,
  Edit,
  Settings,
  BarChart3,
  TrendingUp
} from 'lucide-react'
import { notesAPI, CourseNote } from '@/lib/api/notes'
import { toast } from 'sonner'

interface TeacherCourseDetailPageProps {
  course: any
  onBack: () => void
  onAddNote: (course: any) => void
}

interface Student {
  id: string
  name: string
  email: string
  enrollment_date: string
  attendance_rate: number
  last_activity: string
  status: 'active' | 'inactive' | 'completed'
}

interface Session {
  id: string
  title: string
  date: string
  duration: number
  status: 'completed' | 'upcoming' | 'live'
  attendance_count: number
  recording_url?: string
}

export default function TeacherCourseDetailPage({ course, onBack, onAddNote }: TeacherCourseDetailPageProps) {
  const [courseNotes, setCourseNotes] = useState<CourseNote[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [newNote, setNewNote] = useState({ title: '', content: '', type: 'general' })
  const [showAddNote, setShowAddNote] = useState(false)

  useEffect(() => {
    loadCourseData()
  }, [course.id])

  const loadCourseData = async () => {
    try {
      setLoading(true)
      
      // Load course notes
      const notesResponse = await notesAPI.getCourseNotes(course.id)
      if (notesResponse.success) {
        setCourseNotes(notesResponse.data || [])
      }

      // Mock students data - replace with actual API call
      setStudents([
        {
          id: '1',
          name: 'أحمد محمد',
          email: 'ahmed@example.com',
          enrollment_date: '2024-01-15',
          attendance_rate: 85,
          last_activity: '2024-01-20T10:00:00Z',
          status: 'active'
        },
        {
          id: '2',
          name: 'فاطمة علي',
          email: 'fatima@example.com',
          enrollment_date: '2024-01-16',
          attendance_rate: 92,
          last_activity: '2024-01-21T14:30:00Z',
          status: 'active'
        },
        {
          id: '3',
          name: 'محمد حسن',
          email: 'mohammed@example.com',
          enrollment_date: '2024-01-18',
          attendance_rate: 78,
          last_activity: '2024-01-19T09:15:00Z',
          status: 'inactive'
        }
      ])

      // Mock sessions data - replace with actual API call
      setSessions([
        {
          id: '1',
          title: 'الدرس الأول: مقدمة',
          date: '2024-01-15T10:00:00Z',
          duration: 60,
          status: 'completed',
          attendance_count: 3
        },
        {
          id: '2',
          title: 'الدرس الثاني: التطبيق العملي',
          date: '2024-01-22T10:00:00Z',
          duration: 90,
          status: 'completed',
          attendance_count: 2
        },
        {
          id: '3',
          title: 'الدرس الثالث: المراجعة',
          date: '2024-01-29T10:00:00Z',
          duration: 60,
          status: 'upcoming',
          attendance_count: 0
        }
      ])

    } catch (error) {
      console.error('Error loading course data:', error)
      toast.error('حدث خطأ في تحميل بيانات الدورة')
    } finally {
      setLoading(false)
    }
  }

  const handleAddNote = async () => {
    if (!newNote.title.trim() || !newNote.content.trim()) {
      toast.error('يرجى ملء جميع الحقول')
      return
    }

    try {
      const response = await notesAPI.createCourseNote({
        course_id: course.id,
        title: newNote.title,
        content: newNote.content,
        note_type: newNote.type
      })

      if (response.success) {
        toast.success('تم إضافة الملحوظة بنجاح')
        setNewNote({ title: '', content: '', type: 'general' })
        setShowAddNote(false)
        loadCourseData() // Reload notes
      }
    } catch (error) {
      console.error('Error adding note:', error)
      toast.error('حدث خطأ في إضافة الملحوظة')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStudentStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 border-green-200">نشط</Badge>
      case 'inactive':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">غير نشط</Badge>
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">مكتمل</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">غير محدد</Badge>
    }
  }

  const getSessionStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 border-green-200">مكتمل</Badge>
      case 'upcoming':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">قادم</Badge>
      case 'live':
        return <Badge className="bg-red-100 text-red-800 border-red-200">مباشر الآن</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">غير محدد</Badge>
    }
  }

  const getNoteTypeIcon = (noteType: string) => {
    switch (noteType) {
      case 'announcement':
        return <AlertCircle className="w-4 h-4 text-blue-600" />
      case 'reminder':
        return <Clock className="w-4 h-4 text-orange-600" />
      case 'assignment':
        return <FileText className="w-4 h-4 text-purple-600" />
      default:
        return <MessageSquare className="w-4 h-4 text-gray-600" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/30 to-emerald-50/20 p-6" dir="rtl">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/30 to-emerald-50/20 p-6" dir="rtl">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            العودة
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{course.title}</h1>
            <p className="text-gray-600">إدارة الدورة والطلاب</p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => setShowAddNote(true)}
              className="bg-gradient-to-r from-[#2d7d32] to-[#4caf50] hover:from-[#1b5e20] hover:to-[#2d7d32] text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              إضافة ملحوظة
            </Button>
            <Button variant="outline">
              <Settings className="w-4 h-4 mr-2" />
              إعدادات الدورة
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-700">{students.length}</p>
                  <p className="text-sm text-blue-600">طالب مسجل</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-700">
                    {students.filter(s => s.status === 'active').length}
                  </p>
                  <p className="text-sm text-green-600">طالب نشط</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
                  <Video className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-700">{sessions.length}</p>
                  <p className="text-sm text-purple-600">إجمالي الجلسات</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-orange-700">
                    {Math.round(students.reduce((sum, s) => sum + s.attendance_rate, 0) / students.length) || 0}%
                  </p>
                  <p className="text-sm text-orange-600">معدل الحضور</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Students Management */}
            <Card className="shadow-lg border-0 rounded-2xl">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-2xl">
                <CardTitle className="flex items-center gap-3">
                  <Users className="w-6 h-6" />
                  إدارة الطلاب
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {students.map((student) => (
                    <div key={student.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                          <User className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{student.name}</h4>
                          <p className="text-sm text-gray-600">{student.email}</p>
                          <p className="text-xs text-gray-500">
                            انضم في: {new Date(student.enrollment_date).toLocaleDateString('ar-SA')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-center">
                          <p className="text-sm font-medium text-gray-900">{student.attendance_rate}%</p>
                          <p className="text-xs text-gray-500">معدل الحضور</p>
                        </div>
                        {getStudentStatusBadge(student.status)}
                        <Button size="sm" variant="outline">
                          عرض التفاصيل
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Sessions Management */}
            <Card className="shadow-lg border-0 rounded-2xl">
              <CardHeader className="bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-t-2xl">
                <CardTitle className="flex items-center gap-3">
                  <Video className="w-6 h-6" />
                  إدارة الجلسات
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {sessions.map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                          {session.status === 'completed' ? (
                            <CheckCircle className="w-6 h-6 text-white" />
                          ) : (
                            <Play className="w-6 h-6 text-white" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{session.title}</h4>
                          <p className="text-sm text-gray-600">{formatDate(session.date)}</p>
                          <p className="text-xs text-gray-500">
                            المدة: {session.duration} دقيقة | الحضور: {session.attendance_count} طالب
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {getSessionStatusBadge(session.status)}
                        {session.status === 'upcoming' && (
                          <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                            بدء الجلسة
                          </Button>
                        )}
                        {session.recording_url && session.status === 'completed' && (
                          <Button size="sm" variant="outline">
                            عرض التسجيل
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Course Notes */}
            <Card className="shadow-lg border-0 rounded-2xl">
              <CardHeader className="bg-gradient-to-r from-[#2d7d32] to-[#4caf50] text-white rounded-t-2xl">
                <CardTitle className="flex items-center gap-3">
                  <MessageSquare className="w-5 h-5" />
                  ملحوظات الدورة
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {courseNotes.length > 0 ? (
                    courseNotes.map((note) => (
                      <div key={note.id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-start gap-2 mb-2">
                          {note.is_pinned && <Pin className="w-4 h-4 text-[#2d7d32] mt-0.5" />}
                          {getNoteTypeIcon(note.note_type)}
                          <div className="flex-1">
                            <h5 className="font-medium text-sm text-gray-900">{note.title}</h5>
                            <p className="text-xs text-gray-600 mt-1">{note.content}</p>
                            <p className="text-xs text-gray-400 mt-2">
                              {new Date(note.created_at).toLocaleDateString('ar-SA')}
                            </p>
                          </div>
                          <Button size="sm" variant="ghost" className="p-1">
                            <Edit className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>لا توجد ملحوظات حتى الآن</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Add Note Modal */}
        {showAddNote && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4">
              <CardHeader>
                <CardTitle>إضافة ملحوظة جديدة</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">العنوان</label>
                  <Input
                    value={newNote.title}
                    onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                    placeholder="عنوان الملحوظة"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">النوع</label>
                  <select
                    value={newNote.type}
                    onChange={(e) => setNewNote({ ...newNote, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                  >
                    <option value="general">عام</option>
                    <option value="announcement">إعلان</option>
                    <option value="reminder">تذكير</option>
                    <option value="assignment">واجب</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">المحتوى</label>
                  <Textarea
                    value={newNote.content}
                    onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                    placeholder="محتوى الملحوظة"
                    rows={4}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleAddNote} className="flex-1">
                    إضافة
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowAddNote(false)}
                    className="flex-1"
                  >
                    إلغاء
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
