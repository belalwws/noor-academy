'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight,
  Users,
  User,
  Video,
  Play,
  Plus,
  Settings,
  MessageSquare,
  FileText,
  Calendar,
  Clock,
  Link as LinkIcon,
  BarChart,
  UserMinus,
  X,
  Edit,
  Save
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import liveEducationApi from '@/lib/api/live-education';
import type { Batch, BatchStudent, LiveCourse, LiveSession } from '@/lib/types/live-education';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function BatchDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const batchId = params.batchId as string;

  // States
  const [batch, setBatch] = useState<Batch | null>(null);
  const [course, setCourse] = useState<LiveCourse | null>(null);
  const [students, setStudents] = useState<BatchStudent[]>([]);
  const [currentSession, setCurrentSession] = useState<LiveSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [announcement, setAnnouncement] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  useEffect(() => {
    if (courseId && batchId) {
      fetchData();
    }
  }, [courseId, batchId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch course, batch, and students
      const [courseData, batchData, studentsData] = await Promise.all([
        liveEducationApi.courses.get(courseId),
        liveEducationApi.batches.get(batchId),
        liveEducationApi.batchStudents.list({ batch: batchId })
      ]);

      setCourse(courseData);
      setBatch(batchData);
      setStudents(studentsData.results);

    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('حدث خطأ في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const handleStartSession = () => {
    toast.success('جاري تشغيل الجلسة المباشرة...');
    // TODO: Implement live session logic
  };

  const handleRemoveStudent = async (studentId: string) => {
    if (!confirm('هل أنت متأكد من إزالة هذا الطالب؟')) return;

    try {
      const response = await liveEducationApi.batchStudents.remove(studentId);
      if (response.ok) {
        toast.success('تم إزالة الطالب بنجاح');
        fetchData();
      }
    } catch (error) {
      toast.error('حدث خطأ في إزالة الطالب');
    }
  };

  const handlePostAnnouncement = () => {
    if (!announcement.trim()) return;

    setIsPosting(true);
    setTimeout(() => {
      toast.success('تم نشر الإعلان بنجاح');
      setAnnouncement('');
      setIsPosting(false);
    }, 1000);
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['teacher']}>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-blue-50/20 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">جاري تحميل المجموعة...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['teacher']}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-blue-50/20 pt-20">
        
        {/* Header */}
        <div className="bg-white border-b sticky top-16 z-40">
          <div className="max-w-full mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  onClick={() => router.back()}
                  variant="ghost"
                  className="gap-2"
                >
                  <ArrowRight className="w-4 h-4" />
                  العودة
                </Button>
                <div className="h-8 w-px bg-gray-300" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{batch?.name}</h1>
                  <p className="text-sm text-gray-600">{course?.title}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge className={`${
                  batch?.batch_type === 'individual' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-purple-100 text-purple-800'
                }`}>
                  {batch?.batch_type === 'individual' ? 'فردي' : 'جماعي'}
                </Badge>
                <div className="text-sm text-gray-600">
                  {students.length} / {batch?.max_students} طالب
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Layout */}
        <div className="flex h-[calc(100vh-180px)]">
          
          {/* Right Sidebar - Course Info & Actions */}
          <motion.div 
            className="w-80 bg-white border-l overflow-y-auto"
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
          >
            <div className="p-6 space-y-6">
              
              {/* Course Info */}
              <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-50 border-2 border-blue-200">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  معلومات الدورة
                </h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-600">عنوان الدورة:</span>
                    <p className="font-medium text-gray-900 mt-1">{course?.title}</p>
                  </div>
                  {course?.description && (
                    <div>
                      <span className="text-gray-600">الوصف:</span>
                      <p className="text-gray-700 mt-1 text-xs leading-relaxed">
                        {course.description.slice(0, 150)}...
                      </p>
                    </div>
                  )}
                </div>
              </Card>

              {/* Live Session Card */}
              <Card className="p-4 bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Video className="w-5 h-5 text-red-600" />
                  الحصة المباشرة
                </h3>
                
                {currentSession ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                      <span className="text-red-600 font-medium">جلسة نشطة الآن</span>
                    </div>
                    <Button className="w-full bg-red-600 hover:bg-red-700 text-white">
                      <Play className="w-4 h-4 ml-2" />
                      الانضمام للجلسة
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600">لا توجد جلسة نشطة حالياً</p>
                    <Button 
                      onClick={handleStartSession}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Play className="w-4 h-4 ml-2" />
                      ابدأ حصة جديدة
                    </Button>
                  </div>
                )}

                {/* Meeting Link */}
                {batch?.meeting_link && (
                  <div className="mt-3 p-2 bg-white rounded-lg">
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <LinkIcon className="w-3 h-3" />
                      <span className="truncate">{batch.meeting_link}</span>
                    </div>
                  </div>
                )}
              </Card>

              {/* Schedule */}
              {batch?.schedule && (
                <Card className="p-4">
                  <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-purple-600" />
                    الجدول الزمني
                  </h3>
                  <p className="text-sm text-gray-700">{batch.schedule}</p>
                </Card>
              )}

              {/* Quick Actions */}
              <div className="space-y-2">
                <h3 className="font-bold text-gray-900 mb-3">إجراءات سريعة</h3>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Plus className="w-4 h-4" />
                  إضافة طالب جديد
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <FileText className="w-4 h-4" />
                  إنشاء اختبار
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <BarChart className="w-4 h-4" />
                  إحصائيات المجموعة
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Settings className="w-4 h-4" />
                  إعدادات المجموعة
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Center - Main Content Area */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-4xl mx-auto p-6 space-y-6">
              
              {/* Post Announcement */}
              <Card className="p-6 bg-white">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                  نشر إعلان للطلاب
                </h3>
                <Textarea
                  value={announcement}
                  onChange={(e) => setAnnouncement(e.target.value)}
                  placeholder="اكتب إعلاناً أو رسالة للطلاب..."
                  rows={4}
                  className="mb-3 resize-none border-2 border-gray-200 focus:border-blue-500 rounded-xl"
                />
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setAnnouncement('')}
                    disabled={!announcement.trim()}
                  >
                    مسح
                  </Button>
                  <Button
                    onClick={handlePostAnnouncement}
                    disabled={!announcement.trim() || isPosting}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isPosting ? 'جاري النشر...' : 'نشر الإعلان'}
                  </Button>
                </div>
              </Card>

              {/* Recent Announcements */}
              <Card className="p-6">
                <h3 className="font-bold text-gray-900 mb-4">الإعلانات السابقة</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-gray-900">المعلم</span>
                          <span className="text-xs text-gray-500">منذ ساعتين</span>
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          السلام عليكم، تذكير بموعد الاختبار القادم يوم الأحد الساعة 5 مساءً. يرجى المراجعة الجيدة.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="text-center py-4">
                    <Button variant="ghost" className="text-blue-600">
                      عرض المزيد
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Upcoming Sessions */}
              <Card className="p-6">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  الجلسات القادمة
                </h3>
                <div className="text-center py-8 text-gray-500">
                  لا توجد جلسات مجدولة
                </div>
              </Card>
            </div>
          </div>

          {/* Left Sidebar - Students List */}
          <AnimatePresence>
            {sidebarOpen && (
              <motion.div
                initial={{ x: -300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -300, opacity: 0 }}
                className="w-80 bg-white border-r overflow-y-auto relative"
              >
                <div className="sticky top-0 bg-white z-10 p-4 border-b">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                      <Users className="w-5 h-5 text-blue-600" />
                      الطلاب ({students.length})
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSidebarOpen(false)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-sm">
                    <Plus className="w-4 h-4 ml-2" />
                    إضافة طالب
                  </Button>
                </div>

                <div className="p-4 space-y-3">
                  {students.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <User className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p className="text-sm">لا يوجد طلاب في المجموعة</p>
                    </div>
                  ) : (
                    students.map((student) => (
                      <Card 
                        key={student.id}
                        className="p-3 hover:shadow-md transition-shadow group"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-bold text-sm">
                              {student.student_name.charAt(0)}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 text-sm truncate">
                              {student.student_name}
                            </h4>
                            <p className="text-xs text-gray-500 truncate">
                              {student.student_email}
                            </p>
                            <Badge className={`mt-1 text-xs ${
                              student.status === 'active' ? 'bg-blue-100 text-blue-800' :
                              student.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              student.status === 'suspended' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {student.status === 'active' ? 'نشط' :
                               student.status === 'pending' ? 'منتظر' :
                               student.status === 'suspended' ? 'موقوف' :
                               student.status}
                            </Badge>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveStudent(student.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <UserMinus className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Toggle Sidebar Button */}
          {!sidebarOpen && (
            <Button
              onClick={() => setSidebarOpen(true)}
              className="fixed left-4 bottom-4 rounded-full w-12 h-12 bg-blue-600 hover:bg-blue-700 shadow-lg z-50"
            >
              <Users className="w-5 h-5" />
            </Button>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}

