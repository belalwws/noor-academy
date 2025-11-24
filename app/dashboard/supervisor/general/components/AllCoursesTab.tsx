'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { BookOpen, CheckCircle, XCircle, Eye, Calendar } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { toast } from 'sonner';
import { generalSupervisorApi } from '@/lib/api/generalSupervisor';
import { notificationService } from '@/lib/notificationService';

interface AllCoursesTabProps {
  // Props for future use
}

const AllCoursesTab: React.FC<AllCoursesTabProps> = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionDialog, setActionDialog] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [action, setAction] = useState<'approve' | 'reject'>('approve');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [viewDialog, setViewDialog] = useState(false);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const data = await generalSupervisorApi.getAllCoursesForSupervisor();
      setCourses(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading courses:', error);
      toast.error('فشل في تحميل الدورات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const handleAction = (course: any, actionType: 'approve' | 'reject') => {
    setSelectedCourse(course);
    setAction(actionType);
    setNotes('');
    setActionDialog(true);
  };

  const handleView = (course: any) => {
    setSelectedCourse(course);
    setViewDialog(true);
  };

  const submitAction = async () => {
    if (!selectedCourse) return;
    
    try {
      setSubmitting(true);
      
      if (action === 'approve') {
        await generalSupervisorApi.approveCourse(selectedCourse.id, notes);
        toast.success('تم اعتماد الدورة بنجاح');
        notificationService.courseEvents.approved(selectedCourse.id.toString(), selectedCourse.title);
      } else {
        await generalSupervisorApi.rejectCourse(selectedCourse.id, notes);
        toast.success('تم رفض الدورة');
        notificationService.courseEvents.rejected(selectedCourse.id.toString(), selectedCourse.title);
      }
      
      setActionDialog(false);
      loadCourses();
    } catch (error) {
      console.error('Error:', error);
      toast.error('حدث خطأ في العملية');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge className="bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700">
            ⏳ قيد المراجعة
          </Badge>
        );
      case 'approved':
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700">
            ✅ معتمدة
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-700">
            ❌ مرفوضة
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            📋 {status}
          </Badge>
        );
    }
  };

  const renderCourseCard = (course: any) => (
    <motion.div
      key={course.id}
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -30, scale: 0.9 }}
      transition={{ type: 'spring', damping: 18, stiffness: 280 }}
      whileHover={{ y: -12, transition: { duration: 0.3 } }}
      className="h-full"
    >
      {/* Card Container */}
      <div className="h-full rounded-xl overflow-hidden bg-white dark:bg-slate-800 shadow-md hover:shadow-2xl transition-all duration-300 border border-slate-200 dark:border-slate-700 flex flex-col group" dir="rtl">
        
        {/* Image/Thumbnail Section - Udemy Style with Blue/Indigo */}
        <div className="relative w-full h-40 bg-gradient-to-br from-blue-400 via-indigo-400 to-blue-500 dark:from-blue-600 dark:via-indigo-600 dark:to-blue-700 overflow-hidden">
          {/* Decorative Pattern */}
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" viewBox="0 0 400 160">
              <defs>
                <pattern id="dots" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                  <circle cx="20" cy="20" r="2" fill="currentColor" />
                </pattern>
              </defs>
              <rect width="400" height="160" fill="url(#dots)" />
            </svg>
          </div>

          {/* Icon Overlay */}
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="text-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, type: 'spring' }}
                whileHover={{ rotate: 12 }}
              >
                <BookOpen className="w-12 h-12 text-white/90 mx-auto" />
              </motion.div>
            </div>
          </div>

          {/* Status Badge - Top Right */}
          <div className="absolute top-3 right-3 z-10">
            <motion.div
            >
              {getStatusBadge(course.approval_status)}
            </motion.div>
          </div>

          {/* Shine Effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
            animate={{ x: ['100%', '-100%'] }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
          />
        </div>

        {/* Content Section */}
        <div className="flex-1 p-5 flex flex-col" dir="rtl">
          {/* Title & Teacher */}
          <div className="mb-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 line-clamp-2 leading-tight mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors">
              {course.title}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              {course.teacher_name || 'غير محدد'}
            </p>
          </div>

          {/* Description */}
          <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-3 leading-relaxed">
            {course.description}
          </p>

          {/* Metadata Row */}
          <div className="flex items-center justify-between gap-2 py-3 border-t border-slate-100 dark:border-slate-700 mb-3">
            {/* Course Type */}
            <div className="text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 px-2.5 py-1 rounded-full">
              دورة مباشرة
            </div>

            {/* Date */}
            <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
              <Calendar className="w-3 h-3" />
              <span>
                {new Date(course.created_at).toLocaleDateString('ar-SA', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>
          </div>

          {/* Action buttons grid */}
          <div className="mt-auto flex flex-col gap-2 pt-3 border-t border-slate-100 dark:border-slate-700">
            {/* Primary CTA Button */}
            <motion.button
              onClick={() => handleView(course)}
              className="w-full py-2.5 px-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-lg font-semibold text-sm transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              <Eye className="w-4 h-4" />
              عرض التفاصيل
            </motion.button>

            {/* Status-specific actions */}
            {course.approval_status === 'pending' && (
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleAction(course, 'approve')}
                  className="flex-1 py-2 px-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 text-blue-700 dark:text-blue-400 rounded-lg font-semibold text-xs transition-all border border-blue-200/50 dark:border-blue-700/50 flex items-center justify-center gap-1.5"
                >
                  <CheckCircle className="w-4 h-4" />
                  اعتماد
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleAction(course, 'reject')}
                  className="flex-1 py-2 px-2 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-700 dark:text-red-400 rounded-lg font-semibold text-xs transition-all border border-red-200/50 dark:border-red-700/50 flex items-center justify-center gap-1.5"
                >
                  <XCircle className="w-4 h-4" />
                  رفض
                </motion.button>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-16 gap-4" dir="rtl"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        >
          <BookOpen className="w-8 h-8 text-blue-600 dark:text-blue-400" />
        </motion.div>
        <span className="text-slate-600 dark:text-slate-400 text-sm font-medium">جاري تحميل الدورات...</span>
      </motion.div>
    );
  }

  if (courses.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-16 px-6" dir="rtl"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 15 }}
          className="mb-4"
        >
          <BookOpen className="w-16 h-16 mx-auto text-blue-200 dark:text-blue-900/50 mb-4" />
        </motion.div>
        <p className="text-slate-600 dark:text-slate-400 font-medium">لا توجد دورات حالياً</p>
        <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">سيتم عرض الدورات هنا عند إنشاء المدرسين لها</p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">جميع الدورات</h2>
        <div className="text-sm text-slate-600 dark:text-slate-400">
          <span className="font-semibold text-blue-600 dark:text-blue-400">{courses.length}</span> دورة
        </div>
      </motion.div>

      {/* Courses Grid */}
      <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" dir="rtl">
        <AnimatePresence>
          {courses.map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ delay: index * 0.05 }}
            >
              {renderCourseCard(course)}
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* View Course Dialog */}
      <Dialog open={viewDialog} onOpenChange={setViewDialog}>
        <DialogContent className="max-w-2xl bg-white dark:bg-slate-900" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {selectedCourse?.title}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {selectedCourse && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">📝 الوصف</h4>
                      <p className="text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/30 p-3 rounded-lg">
                        {selectedCourse.description}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">👨‍🏫 المدرس</h4>
                      <p className="text-slate-600 dark:text-slate-400">{selectedCourse.teacher_name || 'غير محدد'}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">📊 التفاصيل</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-600 dark:text-slate-400">نوع الدورة:</span>
                          <span className="font-medium text-slate-900 dark:text-slate-100">{selectedCourse.course_type_display || selectedCourse.course_type}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600 dark:text-slate-400">تاريخ الإنشاء:</span>
                          <span className="font-medium text-slate-900 dark:text-slate-100">{new Date(selectedCourse.created_at).toLocaleDateString('ar-SA')}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">📋 الحالة</h4>
                      {getStatusBadge(selectedCourse.approval_status)}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Action Dialog */}
      <Dialog open={actionDialog} onOpenChange={setActionDialog}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>
              {action === 'approve' ? 'اعتماد الدورة' : 'رفض الدورة'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                {selectedCourse?.title}
              </p>
            </div>
            <div>
              <Textarea
                placeholder={action === 'approve' ? 'ملاحظات الاعتماد (اختياري)' : 'سبب الرفض *'}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                required={action === 'reject'}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setActionDialog(false)}
                disabled={submitting}
              >
                إلغاء
              </Button>
              <Button
                onClick={submitAction}
                disabled={submitting || (action === 'reject' && !notes.trim())}
                className={action === 'approve' ? 'bg-blue-600 hover:bg-blue-700' : ''}
              >
                {submitting ? (
                  <Spinner size="sm" className="mr-2" />
                ) : null}
                {action === 'approve' ? 'اعتماد' : 'رفض'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AllCoursesTab;
