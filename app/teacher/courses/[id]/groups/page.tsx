'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Users, 
  User,
  Settings,
  Trash2,
  Eye,
  UserPlus,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import liveEducationApi from '@/lib/api/live-education';
import type { Batch, PendingStudent, LiveCourse } from '@/lib/types/live-education';
import ProtectedRoute from '@/components/ProtectedRoute';
import CreateBatchModal from '@/components/teacher/CreateBatchModal';
import AddStudentToBatchModal from '@/components/teacher/AddStudentToBatchModal';

export default function CourseGroupsPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;

  // States
  const [course, setCourse] = useState<LiveCourse | null>(null);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [pendingStudents, setPendingStudents] = useState<PendingStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);

  // Fetch data
  useEffect(() => {
    if (courseId) {
      fetchData();
    }
  }, [courseId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch course details
      const courseData = await liveEducationApi.courses.get(courseId);
      setCourse(courseData);

      // Fetch batches
      const batchesData = await liveEducationApi.batches.list({ course: courseId });
      setBatches(batchesData.results);

      // Fetch pending students
      const pendingData = await liveEducationApi.enrollments.getPendingStudents(courseId);
      setPendingStudents(pendingData);

    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('حدث خطأ في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBatch = async (batchId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه المجموعة؟')) return;

    try {
      const response = await liveEducationApi.batches.delete(batchId);
      if (response.ok) {
        toast.success('تم حذف المجموعة بنجاح');
        fetchData();
      }
    } catch (error) {
      toast.error('حدث خطأ في حذف المجموعة');
    }
  };

  const handleAddStudentToBatch = async (batchId: string, studentId: number) => {
    try {
      const response = await liveEducationApi.batchStudents.add({
        batch: batchId,
        student: studentId,
      });

      if (response.ok) {
        toast.success('تم إضافة الطالب للمجموعة بنجاح');
        fetchData();
      }
    } catch (error) {
      toast.error('حدث خطأ في إضافة الطالب');
    }
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['teacher']}>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/30 to-emerald-50/20 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">جاري تحميل المجموعات...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['teacher']}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/30 to-emerald-50/20 pt-20">
        <div className="max-w-7xl mx-auto px-6 py-8">
          
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {course?.title}
                </h1>
                <p className="text-gray-600">إدارة المجموعات والطلاب</p>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => router.push(`/teacher/courses/${courseId}/pending-students`)}
                  variant="outline"
                  className="border-2 border-blue-500 text-blue-600 hover:bg-blue-50 gap-2"
                >
                  <Clock className="w-5 h-5" />
                  الطلاب المنتظرين
                  {pendingStudents.length > 0 && (
                    <Badge className="mr-1 bg-blue-500 text-white">{pendingStudents.length}</Badge>
                  )}
                </Button>
                <Button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white gap-2"
                >
                  <Plus className="w-5 h-5" />
                  إضافة مجموعة جديدة
                </Button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="p-4 bg-white/80 backdrop-blur-sm border-2 border-green-200">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">عدد المجموعات</p>
                    <p className="text-2xl font-bold text-gray-900">{batches.length}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4 bg-white/80 backdrop-blur-sm border-2 border-blue-200">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">إجمالي الطلاب</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {batches.reduce((sum, b) => sum + (b.current_students || 0), 0)}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-4 bg-white/80 backdrop-blur-sm border-2 border-orange-200">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">طلاب منتظرين</p>
                    <p className="text-2xl font-bold text-gray-900">{pendingStudents.length}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4 bg-white/80 backdrop-blur-sm border-2 border-purple-200">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">معدل الإكمال</p>
                    <p className="text-2xl font-bold text-gray-900">85%</p>
                  </div>
                </div>
              </Card>
            </div>
          </motion.div>

          {/* Batches Grid */}
          <div className="space-y-8">
            
            {/* Active Batches */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Users className="w-6 h-6 text-green-600" />
                المجموعات النشطة
              </h2>
              
              {batches.length === 0 ? (
                <Card className="p-12 text-center bg-white/80 backdrop-blur-sm">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    لا توجد مجموعات بعد
                  </h3>
                  <p className="text-gray-600 mb-6">
                    ابدأ بإنشاء مجموعة جديدة لإضافة الطلاب
                  </p>
                  <Button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Plus className="w-4 h-4 ml-2" />
                    إنشاء مجموعة
                  </Button>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {batches.map((batch, index) => (
                    <motion.div
                      key={batch.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="p-6 bg-white/80 backdrop-blur-sm border-2 border-green-200 hover:shadow-xl transition-all duration-300 relative overflow-hidden group">
                        {/* Background Decoration */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400/10 to-transparent rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500" />
                        
                        <div className="relative z-10">
                          {/* Header */}
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3 flex-1">
                              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                batch.batch_type === 'individual' 
                                  ? 'bg-blue-100' 
                                  : 'bg-purple-100'
                              }`}>
                                {batch.batch_type === 'individual' ? (
                                  <User className="w-6 h-6 text-blue-600" />
                                ) : (
                                  <Users className="w-6 h-6 text-purple-600" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="text-lg font-bold text-gray-900 truncate">
                                  {batch.name}
                                </h3>
                                <Badge className={`mt-1 ${
                                  batch.batch_type === 'individual'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-purple-100 text-purple-800'
                                }`}>
                                  {batch.batch_type === 'individual' ? 'فردي' : 'جماعي'}
                                </Badge>
                              </div>
                            </div>
                          </div>

                          {/* Description */}
                          {batch.description && (
                            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                              {batch.description}
                            </p>
                          )}

                          {/* Students Info */}
                          <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-gray-500" />
                              <span className="text-sm text-gray-600">الطلاب</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-bold text-gray-900">
                                {batch.current_students}
                              </span>
                              <span className="text-sm text-gray-500">
                                / {batch.max_students}
                              </span>
                            </div>
                          </div>

                          {/* Status */}
                          {batch.is_full && (
                            <div className="flex items-center gap-2 p-2 bg-red-50 rounded-lg mb-4">
                              <AlertCircle className="w-4 h-4 text-red-600" />
                              <span className="text-sm text-red-600 font-medium">
                                المجموعة ممتلئة
                              </span>
                            </div>
                          )}

                          {/* Actions */}
                          <div className="flex gap-2">
                            <Button
                              onClick={() => router.push(`/teacher/courses/${courseId}/groups/${batch.id}`)}
                              className="flex-1 bg-green-600 hover:bg-green-700 text-white gap-2"
                            >
                              <Eye className="w-4 h-4" />
                              عرض
                            </Button>
                            <Button
                              onClick={() => {
                                setSelectedBatch(batch);
                                setShowAddStudentModal(true);
                              }}
                              variant="outline"
                              className="border-green-600 text-green-600 hover:bg-green-50"
                              disabled={batch.is_full}
                            >
                              <UserPlus className="w-4 h-4" />
                            </Button>
                            <Button
                              onClick={() => handleDeleteBatch(batch.id)}
                              variant="outline"
                              className="border-red-600 text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </section>

            {/* Pending Students */}
            {pendingStudents.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Clock className="w-6 h-6 text-orange-600" />
                  الطلاب المنتظرين ({pendingStudents.length})
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pendingStudents.map((student, index) => (
                    <motion.div
                      key={student.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="p-4 bg-white/80 backdrop-blur-sm border-2 border-orange-200 hover:shadow-lg transition-all">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-orange-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 truncate">
                              {student.student_name}
                            </h4>
                            <p className="text-xs text-gray-500 truncate">
                              {student.student_email}
                            </p>
                          </div>
                        </div>

                        {student.payment_status === 'approved' && (
                          <Badge className="bg-green-100 text-green-800 mb-3">
                            <CheckCircle className="w-3 h-3 ml-1" />
                            تم الدفع
                          </Badge>
                        )}

                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => {
                              // Open modal to select batch
                              setShowAddStudentModal(true);
                            }}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-sm"
                          >
                            <UserPlus className="w-3 h-3 ml-1" />
                            إضافة لمجموعة
                          </Button>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateBatchModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          courseId={courseId}
          onSuccess={fetchData}
        />
      )}

      {showAddStudentModal && selectedBatch && (
        <AddStudentToBatchModal
          isOpen={showAddStudentModal}
          onClose={() => {
            setShowAddStudentModal(false);
            setSelectedBatch(null);
          }}
          batch={selectedBatch}
          pendingStudents={pendingStudents}
          onSuccess={fetchData}
        />
      )}
    </ProtectedRoute>
  );
}

