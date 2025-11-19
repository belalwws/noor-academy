'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  UserPlus,
  Loader2,
  AlertCircle,
  BookOpen,
  Calendar,
  Mail,
  Phone
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import liveEducationApi from '@/lib/api/live-education';
import type { LiveCourse, CourseApplication, Batch } from '@/lib/types/live-education';

interface StudentApplication extends CourseApplication {
  student_name?: string;
  student_email?: string;
  student_phone?: string;
}

export default function PendingStudentsPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;

  const [course, setCourse] = useState<LiveCourse | null>(null);
  const [applications, setApplications] = useState<StudentApplication[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddToBatchModal, setShowAddToBatchModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<StudentApplication | null>(null);
  const [selectedBatchId, setSelectedBatchId] = useState<string>('');
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (courseId) {
      fetchData();
    }
  }, [courseId]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch course
      const courseData = await liveEducationApi.courses.get(courseId);
      setCourse(courseData);

      // Fetch pending applications (accepted by teacher but not yet added to batch)
      const applicationsData = await liveEducationApi.applications.list({
        course: courseId,
        status: 'accepted' // Only accepted applications (students with paid status)
      });
      setApplications(applicationsData.results || []);

      // Fetch batches for this course
      const batchesData = await liveEducationApi.batches.list({
        course: courseId
      });
      setBatches(batchesData.results || []);

      console.log('📊 Data loaded:', {
        applications: applicationsData.results?.length,
        batches: batchesData.results?.length
      });
    } catch (error) {
      console.error('❌ Error fetching data:', error);
      toast.error('حدث خطأ في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToBatch = async () => {
    if (!selectedApplication || !selectedBatchId) {
      toast.error('يرجى اختيار المجموعة');
      return;
    }

    try {
      setIsAdding(true);

      console.log('👥 Adding student to batch:', {
        application: selectedApplication.id,
        batch: selectedBatchId,
        student: selectedApplication.student
      });

      // Add student to batch
      const response = await liveEducationApi.batchStudents.add({
        batch: selectedBatchId,
        student: selectedApplication.student,
        status: 'active'
      });

      if (response.ok) {
        toast.success('✅ تم إضافة الطالب للمجموعة بنجاح!');
        setShowAddToBatchModal(false);
        setSelectedApplication(null);
        setSelectedBatchId('');
        fetchData(); // Refresh data
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData.detail || errorData.error || 'حدث خطأ في إضافة الطالب');
      }
    } catch (error) {
      console.error('❌ Error adding student to batch:', error);
      toast.error('حدث خطأ في إضافة الطالب للمجموعة');
    } finally {
      setIsAdding(false);
    }
  };

  const openAddToBatchModal = (application: StudentApplication) => {
    setSelectedApplication(application);
    setShowAddToBatchModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-indigo-50/30 to-purple-50/20 flex items-center justify-center pt-20">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-lg font-medium">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-indigo-50/30 to-purple-50/20 flex items-center justify-center pt-20">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">الدورة غير موجودة</h2>
          <p className="text-gray-600 mb-6">لم نتمكن من العثور على هذه الدورة</p>
          <Button onClick={() => router.back()} className="bg-gradient-to-r from-blue-500 to-indigo-600">
            العودة
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-indigo-50/30 to-purple-50/20 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button
            onClick={() => router.back()}
            variant="ghost"
            className="mb-4 gap-2 hover:bg-blue-50"
          >
            <ArrowLeft className="w-4 h-4" />
            العودة
          </Button>

          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
              <Users className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                الطلاب المنتظرين
              </h1>
              <p className="text-lg text-gray-600">{course.title}</p>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="p-6 bg-gradient-to-br from-white to-blue-50/50 border-2 border-blue-200">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">الطلاب المنتظرين</p>
                  <p className="text-2xl font-bold text-gray-900">{applications.length}</p>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="p-6 bg-gradient-to-br from-white to-green-50/50 border-2 border-green-200">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">عدد المجموعات</p>
                  <p className="text-2xl font-bold text-gray-900">{batches.length}</p>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="p-6 bg-gradient-to-br from-white to-purple-50/50 border-2 border-purple-200">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">حالة الدورة</p>
                  <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                    {course.status === 'published' ? 'منشورة' : 'غير منشورة'}
                  </Badge>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Students List */}
        {applications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-12 text-center bg-gradient-to-br from-white to-gray-50/50 border-2 border-gray-200">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">لا يوجد طلاب منتظرين</h3>
              <p className="text-gray-600">
                عندما يقوم الطلاب بالتسجيل ودفع الرسوم، سيظهرون هنا
              </p>
            </Card>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {applications.map((application, index) => (
              <motion.div
                key={application.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <Card className="p-6 bg-gradient-to-br from-white to-blue-50/30 border-2 border-blue-200 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold text-gray-900">
                            {application.student_name || `طالب #${application.student}`}
                          </h3>
                          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                            {application.preferred_type === 'individual' ? 'فردي 👤' : 'جماعي 👥'}
                          </Badge>
                          <Badge className="bg-green-100 text-green-800 border-green-200">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            تم الدفع
                          </Badge>
                        </div>

                        <div className="space-y-1 text-sm text-gray-600">
                          {application.student_email && (
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4" />
                              <span>{application.student_email}</span>
                            </div>
                          )}
                          {application.student_phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4" />
                              <span>{application.student_phone}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>تاريخ التقديم: {new Date(application.created_at).toLocaleDateString('ar-EG')}</span>
                          </div>
                        </div>

                        {application.notes && (
                          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-sm text-blue-900">
                              <strong>ملاحظات الطالب:</strong> {application.notes}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <Button
                      onClick={() => openAddToBatchModal(application)}
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
                    >
                      <UserPlus className="w-4 h-4 ml-2" />
                      إضافة للمجموعة
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Add to Batch Modal */}
        <Dialog open={showAddToBatchModal} onOpenChange={setShowAddToBatchModal}>
          <DialogContent className="max-w-md bg-white dark:bg-slate-900">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">إضافة طالب إلى مجموعة</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {selectedApplication && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="font-semibold text-gray-900 mb-1">
                    {selectedApplication.student_name || `طالب #${selectedApplication.student}`}
                  </p>
                  <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                    {selectedApplication.preferred_type === 'individual' ? 'فردي 👤' : 'جماعي 👥'}
                  </Badge>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="batch">اختر المجموعة</Label>
                <Select value={selectedBatchId} onValueChange={setSelectedBatchId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="اختر المجموعة..." />
                  </SelectTrigger>
                  <SelectContent>
                    {batches.length === 0 ? (
                      <div className="p-4 text-center text-sm text-gray-500">
                        لا توجد مجموعات. يرجى إنشاء مجموعة أولاً
                      </div>
                    ) : (
                      batches.map((batch) => (
                        <SelectItem key={batch.id} value={batch.id}>
                          {batch.name} ({batch.current_students || 0}/{batch.max_students || 0} طالب)
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {batches.length === 0 && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-yellow-800">
                    يجب عليك إنشاء مجموعة أولاً قبل إضافة الطلاب
                  </p>
                </div>
              )}
            </div>

            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddToBatchModal(false);
                  setSelectedApplication(null);
                  setSelectedBatchId('');
                }}
                disabled={isAdding}
              >
                إلغاء
              </Button>
              <Button
                onClick={handleAddToBatch}
                disabled={!selectedBatchId || isAdding || batches.length === 0}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
              >
                {isAdding ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin ml-2" />
                    جاري الإضافة...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 ml-2" />
                    إضافة
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

