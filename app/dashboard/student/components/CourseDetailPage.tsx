'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
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
  CheckCircle
} from 'lucide-react'
import { notesAPI, CourseNote } from '@/lib/api/notes'
import { toast } from 'sonner'

interface CourseDetailPageProps {
  courseId: string
  onBack: () => void
}

interface Meeting {
  id: string
  title: string
  date: string
  duration: number
  status: 'completed' | 'upcoming' | 'live'
  recording_url?: string
}

export default function CourseDetailPage({ courseId, onBack }: CourseDetailPageProps) {
  const [courseNotes, setCourseNotes] = useState<CourseNote[]>([])
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [loading, setLoading] = useState(true)
  const [courseInfo, setCourseInfo] = useState<any>(null)

  useEffect(() => {
    loadCourseData()
  }, [courseId])

  const loadCourseData = async () => {
    try {
      setLoading(true)
      
      // Load course notes
      const notesResponse = await notesAPI.getCourseNotes(courseId)
      if (notesResponse.success) {
        setCourseNotes(notesResponse.data || [])
      }

      // Mock meetings data - replace with actual API call
      setMeetings([
        {
          id: '1',
          title: 'الدرس الأول: مقدمة',
          date: '2024-01-15T10:00:00Z',
          duration: 60,
          status: 'completed',
          recording_url: '#'
        },
        {
          id: '2',
          title: 'الدرس الثاني: التطبيق العملي',
          date: '2024-01-22T10:00:00Z',
          duration: 90,
          status: 'completed'
        },
        {
          id: '3',
          title: 'الدرس الثالث: المراجعة',
          date: '2024-01-29T10:00:00Z',
          duration: 60,
          status: 'upcoming'
        }
      ])

      // Mock course info - replace with actual API call
      setCourseInfo({
        title: 'دورة تعلم القرآن الكريم',
        teacher: 'أ. محمد أحمد',
        description: 'دورة شاملة لتعلم تلاوة القرآن الكريم وأحكام التجويد'
      })

    } catch (error) {
      console.error('Error loading course data:', error)
      toast.error('حدث خطأ في تحميل بيانات الدورة')
    } finally {
      setLoading(false)
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

  const getMeetingStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">مكتمل</Badge>
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-blue-50/20 p-6" dir="rtl">
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-blue-50/20 p-6" dir="rtl">
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
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{courseInfo?.title}</h1>
            <p className="text-gray-600">المعلم: {courseInfo?.teacher}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Course Overview */}
            <Card className="shadow-lg border-0 rounded-2xl">
              <CardHeader className="bg-gradient-to-r from-[#2d7d32] to-[#4caf50] text-white rounded-t-2xl">
                <CardTitle className="flex items-center gap-3">
                  <BookOpen className="w-6 h-6" />
                  نظرة عامة على الدورة
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-gray-700 leading-relaxed">
                  {courseInfo?.description}
                </p>
              </CardContent>
            </Card>

            {/* Previous Meetings */}
            <Card className="shadow-lg border-0 rounded-2xl">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-2xl">
                <CardTitle className="flex items-center gap-3">
                  <Video className="w-6 h-6" />
                  الجلسات السابقة والقادمة
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {meetings.map((meeting) => (
                    <div key={meeting.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                          {meeting.status === 'completed' ? (
                            <CheckCircle className="w-6 h-6 text-white" />
                          ) : (
                            <Play className="w-6 h-6 text-white" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{meeting.title}</h4>
                          <p className="text-sm text-gray-600">{formatDate(meeting.date)}</p>
                          <p className="text-xs text-gray-500">{meeting.duration} دقيقة</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {getMeetingStatusBadge(meeting.status)}
                        {meeting.recording_url && meeting.status === 'completed' && (
                          <Button size="sm" variant="outline">
                            مشاهدة التسجيل
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
            {/* Teacher Notes */}
            <Card className="shadow-lg border-0 rounded-2xl">
              <CardHeader className="bg-gradient-to-r from-[#2d7d32] to-[#4caf50] text-white rounded-t-2xl">
                <CardTitle className="flex items-center gap-3">
                  <MessageSquare className="w-5 h-5" />
                  ملحوظات المعلم
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
      </div>
    </div>
  )
}
