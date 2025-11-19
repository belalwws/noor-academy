'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  Calendar,
  BookOpen,
  Eye,
  DollarSign,
  Search,
  ToggleLeft,
  ToggleRight,
  EyeOff,
  Eye as EyeIcon,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import { recordedCoursesApi, type RecordedCourse } from '@/lib/api/recorded-courses';

interface RecordedCoursesTabProps {
  onShowCourseDetails: (course: RecordedCourse) => void;
  onShowApproval: (course: RecordedCourse) => void;
  onShowRejection: (course: RecordedCourse) => void;
  onShowDelete: (course: RecordedCourse) => void;
}

const RecordedCoursesTab: React.FC<RecordedCoursesTabProps> = ({ 
  onShowCourseDetails, 
  onShowApproval, 
  onShowRejection,
  onShowDelete 
}) => {
  const [pendingCourses, setPendingCourses] = useState<RecordedCourse[]>([]);
  const [approvedCourses, setApprovedCourses] = useState<RecordedCourse[]>([]);
  const [rejectedCourses, setRejectedCourses] = useState<RecordedCourse[]>([]);
  
  const [pendingLoading, setPendingLoading] = useState(false);
  const [approvedLoading, setApprovedLoading] = useState(false);
  const [rejectedLoading, setRejectedLoading] = useState(false);
  
  const [toggleLoadingCourseId, setToggleLoadingCourseId] = useState<string | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [activeStatusTab, setActiveStatusTab] = useState<'pending' | 'approved' | 'rejected'>('pending');

  // Fetch courses by status
  const fetchCourses = async (
    status: 'pending' | 'approved' | 'rejected',
    setLoading: (loading: boolean) => void,
    setCourses: (courses: RecordedCourse[]) => void
  ) => {
    try {
      setLoading(true);
      const response = await recordedCoursesApi.list({
        status,
        search: searchTerm || undefined,
        ordering: '-created_at',
      });
      setCourses(response.results || []);
    } catch (error) {
      console.error(`Error fetching ${status} recorded courses:`, error);
      toast.error(`فشل في تحميل الدورات المسجلة ${status === 'pending' ? 'المعلقة' : status === 'approved' ? 'المعتمدة' : 'المرفوضة'}`);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses('pending', setPendingLoading, setPendingCourses);
    fetchCourses('approved', setApprovedLoading, setApprovedCourses);
    fetchCourses('rejected', setRejectedLoading, setRejectedCourses);
  }, [searchTerm]);

  const handleToggleApplications = async (course: RecordedCourse) => {
    try {
      setToggleLoadingCourseId(course.id);
      const newApplicationState = !course.accepting_applications;
      console.log(`🔄 Toggling applications for course ${course.id}`);
      console.log(`   Current accepting_applications: ${course.accepting_applications}`);
      console.log(`   Sending to API accepting_applications: ${newApplicationState}`);
      
      const response = await recordedCoursesApi.toggleApplications(course.id, {
        accepting_applications: newApplicationState,
      });
      
      console.log('✅ Toggle response received:', response);
      console.log('✅ Response accepting_applications:', response.accepting_applications);
      
      toast.success(`تم ${newApplicationState ? 'تفعيل' : 'تعطيل'} قبول الطلبات`);
      
      // IMPORTANT: Use the desired state, not the response
      setApprovedCourses(prevCourses =>
        prevCourses.map(c => {
          if (c.id === course.id) {
            console.log(`✅ Updating course ${c.id} accepting_applications from ${c.accepting_applications} to ${newApplicationState}`);
            return { ...c, accepting_applications: newApplicationState };
          }
          return c;
        })
      );
      
      // Refresh in the background to ensure sync
      setTimeout(() => {
        console.log('🔄 Background refresh for approved courses...');
        fetchCourses('approved', setApprovedLoading, setApprovedCourses);
      }, 500);
    } catch (error) {
      console.error('❌ Error toggling applications:', error);
      toast.error('فشل في تغيير حالة قبول الطلبات');
    } finally {
      setToggleLoadingCourseId(null);
    }
  };

  const handleToggleVisibility = async (course: RecordedCourse) => {
    try {
      setToggleLoadingCourseId(course.id);
      const newVisibilityState = !course.is_hidden;
      console.log(`🔄 Toggling visibility for course ${course.id}`);
      console.log(`   Current is_hidden: ${course.is_hidden}`);
      console.log(`   Sending to API is_hidden: ${newVisibilityState}`);
      
      const response = await recordedCoursesApi.toggleVisibility(course.id, {
        is_hidden: newVisibilityState,
      });
      
      console.log('✅ Toggle response received:', response);
      console.log('✅ Response is_hidden value:', response.is_hidden);
      
      toast.success(`تم ${newVisibilityState ? 'إخفاء' : 'إظهار'} الدورة بنجاح`);
      
      // IMPORTANT: Use ONLY the desired state, NOT the backend response
      // The backend might return old/incorrect data, so trust the optimistic update
      setApprovedCourses(prevCourses =>
        prevCourses.map(c => {
          if (c.id === course.id) {
            console.log(`✅ Updating course ${c.id} is_hidden from ${c.is_hidden} to ${newVisibilityState}`);
            return { ...c, is_hidden: newVisibilityState };
          }
          return c;
        })
      );
    } catch (error) {
      console.error('❌ Error toggling visibility:', error);
      toast.error('فشل في تغيير حالة إظهار الدورة');
    } finally {
      setToggleLoadingCourseId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge className="bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700">
            <Clock className="w-3 h-3 mr-1" />
            قيد المراجعة
          </Badge>
        );
      case 'approved':
        return (
          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700">
            <CheckCircle className="w-3 h-3 mr-1" />
            معتمدة
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-700">
            <XCircle className="w-3 h-3 mr-1" />
            مرفوضة
          </Badge>
        );
      default:
        return null;
    }
  };

  const renderCourseCard = (course: RecordedCourse) => (
    <motion.div
      key={course.id}
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -30, scale: 0.9 }}
      transition={{ type: 'spring', damping: 18, stiffness: 280 }}
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
      className="h-full"
    >
      {/* Card Container */}
      <div className="h-full rounded-2xl overflow-hidden bg-white dark:bg-slate-800 shadow-md hover:shadow-xl transition-all duration-300 border border-slate-200/50 dark:border-slate-700/50 flex flex-col">
        
        {/* Image/Thumbnail Section - Udemy Style */}
        <div className="relative w-full h-40 bg-gradient-to-br from-amber-400 via-orange-400 to-amber-500 dark:from-amber-600 dark:via-orange-600 dark:to-amber-700 overflow-hidden group">
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

          {/* Title Overlay */}
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="text-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, type: 'spring' }}
              >
                <BookOpen className="w-12 h-12 text-white/90 mx-auto mb-2" />
              </motion.div>
            </div>
          </div>

          {/* Status Badge - Overlay */}
          <div className="absolute top-3 right-3 z-10">
            <motion.div
            >
              {getStatusBadge(course.status)}
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
        <div className="flex-1 p-5 flex flex-col">
          {/* Title & Description */}
          <div className="mb-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 line-clamp-2 leading-tight mb-2 group-hover:text-amber-600 transition-colors">
              {course.title}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
              {course.teacher_name}
            </p>
          </div>

          {/* Description */}
          <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-3 leading-relaxed">
            {course.description}
          </p>

          {/* Metadata Row - Coursera Style */}
          <div className="flex items-center justify-between gap-2 py-3 border-t border-slate-100 dark:border-slate-700 mb-3">
            {/* Price */}
            <div className="flex items-center gap-1">
              {course.price ? (
                <motion.div 
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30"
                >
                  <DollarSign className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                  <span className="text-xs font-bold text-amber-900 dark:text-amber-300">{course.price} ر.س</span>
                </motion.div>
              ) : (
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 px-2.5 py-1">مجاني</span>
              )}
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
              onClick={() => onShowCourseDetails(course)}
              className="w-full py-2.5 px-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-lg font-semibold text-sm transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              <Eye className="w-4 h-4" />
              عرض التفاصيل
            </motion.button>

            {/* Status-specific actions */}
            {course.status === 'pending' && (
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onShowApproval(course)}
                  className="flex-1 py-2 px-2 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 rounded-lg font-semibold text-xs transition-all border border-emerald-200/50 dark:border-emerald-700/50 flex items-center justify-center gap-1.5"
                >
                  <CheckCircle className="w-4 h-4" />
                  اعتماد
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onShowRejection(course)}
                  className="flex-1 py-2 px-2 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-700 dark:text-red-400 rounded-lg font-semibold text-xs transition-all border border-red-200/50 dark:border-red-700/50 flex items-center justify-center gap-1.5"
                >
                  <XCircle className="w-4 h-4" />
                  رفض
                </motion.button>
              </div>
            )}

            {course.status === 'approved' && (
              <div className="flex gap-2 flex-wrap">
                <motion.button
                  onClick={() => handleToggleApplications(course)}
                  disabled={toggleLoadingCourseId === course.id}
                  className={`flex-1 min-w-24 py-1.5 px-2 rounded-lg text-xs font-medium transition-all border flex items-center justify-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed ${
                    course.accepting_applications
                      ? 'bg-blue-100 hover:bg-blue-200 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 dark:text-blue-400 dark:border-blue-700'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-400 dark:border-slate-600'
                  }`}
                >
                  {toggleLoadingCourseId === course.id ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </motion.div>
                      جاري...
                    </>
                  ) : course.accepting_applications ? (
                    <>
                      <ToggleRight className="w-3.5 h-3.5" />
                      طلبات مفعل
                    </>
                  ) : (
                    <>
                      <ToggleLeft className="w-3.5 h-3.5" />
                      طلبات معطل
                    </>
                  )}
                </motion.button>

                <motion.button
                  onClick={() => handleToggleVisibility(course)}
                  disabled={toggleLoadingCourseId === course.id}
                  className={`flex-1 min-w-24 py-1.5 px-2 rounded-lg text-xs font-medium transition-all border flex items-center justify-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed ${
                    !course.is_hidden
                      ? 'bg-purple-100 hover:bg-purple-200 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:hover:bg-purple-900/40 dark:text-purple-400 dark:border-purple-700'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-400 dark:border-slate-600'
                  }`}
                >
                  {toggleLoadingCourseId === course.id ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </motion.div>
                      جاري...
                    </>
                  ) : !course.is_hidden ? (
                    <>
                      <EyeIcon className="w-3.5 h-3.5" />
                      مرئية
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-3.5 h-3.5" />
                      مخفية
                    </>
                  )}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onShowDelete(course)}
                  className="flex-1 min-w-20 py-1.5 px-2 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-700 dark:text-red-400 rounded-lg font-semibold text-xs transition-all border border-red-200/50 dark:border-red-700/50 flex items-center justify-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  حذف
                </motion.button>
              </div>
            )}

            {course.status === 'rejected' && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onShowDelete(course)}
                className="w-full py-2 px-3 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-700 dark:text-red-400 rounded-lg font-semibold text-xs transition-all border border-red-200/50 dark:border-red-700/50 flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                حذف
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderCoursesList = (courses: RecordedCourse[], loading: boolean, emptyMessage: string) => {
    if (loading) {
      return (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-16 gap-4"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          >
            <RefreshCw className="w-8 h-8 text-amber-600 dark:text-amber-400" />
          </motion.div>
          <span className="text-slate-600 dark:text-slate-400 text-sm font-medium">جاري التحميل...</span>
        </motion.div>
      );
    }

    if (courses.length === 0) {
      return (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-16 px-6"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 15 }}
            className="mb-4"
          >
            <BookOpen className="w-16 h-16 mx-auto text-amber-200 dark:text-amber-900/50 mb-4" />
          </motion.div>
          <p className="text-slate-600 dark:text-slate-400 font-medium">{emptyMessage}</p>
          <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">جرب البحث أو تحديث الصفحة</p>
        </motion.div>
      );
    }

    return (
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
    );
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Search Bar */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex items-center gap-3"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-500 w-5 h-5" />
          <Input
            placeholder="بحث في الدورات المسجلة..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border-amber-200/50 dark:border-amber-900/30 focus:border-amber-500 dark:focus:border-amber-600 transition-colors"
          />
        </div>
        <motion.div
        >
          <Button
            variant="primary"
            onClick={() => {
              fetchCourses('pending', setPendingLoading, setPendingCourses);
              fetchCourses('approved', setApprovedLoading, setApprovedCourses);
              fetchCourses('rejected', setRejectedLoading, setRejectedCourses);
            }}
            className="text-xs flex items-center gap-1"
          >
            <RefreshCw className="w-4 h-4" />
            تحديث
          </Button>
        </motion.div>
      </motion.div>

      {/* Status Tabs */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Tabs value={activeStatusTab} onValueChange={(v) => setActiveStatusTab(v as any)}>
          <TabsList className="grid w-full grid-cols-3 bg-gradient-to-r from-amber-50/50 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/20 border border-amber-200/30 dark:border-amber-800/30 p-1.5 rounded-lg">
            <TabsTrigger 
              value="pending"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-400 data-[state=active]:to-orange-500 data-[state=active]:text-white transition-all flex items-center gap-1.5"
            >
              <Clock className="w-4 h-4" />
              <span className="hidden sm:inline">قيد المراجعة</span>
              <span className="sm:hidden">معلقة</span> ({pendingCourses.length})
            </TabsTrigger>
            <TabsTrigger 
              value="approved"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-400 data-[state=active]:to-teal-500 data-[state=active]:text-white transition-all flex items-center gap-1.5"
            >
              <CheckCircle className="w-4 h-4" />
              <span className="hidden sm:inline">معتمدة</span>
              <span className="sm:hidden">مقبول</span> ({approvedCourses.length})
            </TabsTrigger>
            <TabsTrigger 
              value="rejected"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-400 data-[state=active]:to-red-500 data-[state=active]:text-white transition-all flex items-center gap-1.5"
            >
              <XCircle className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">مرفوضة</span>
              <span className="sm:hidden">مرفوض</span> ({rejectedCourses.length})
            </TabsTrigger>
          </TabsList>

          <motion.div
            key={activeStatusTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            <TabsContent value="pending" className="mt-6">
              {renderCoursesList(
                pendingCourses,
                pendingLoading,
                'لا توجد دورات مسجلة معلقة حالياً'
              )}
            </TabsContent>

            <TabsContent value="approved" className="mt-6">
              {renderCoursesList(
                approvedCourses,
                approvedLoading,
                'لا توجد دورات مسجلة معتمدة حالياً'
              )}
            </TabsContent>

            <TabsContent value="rejected" className="mt-6">
              {renderCoursesList(
                rejectedCourses,
                rejectedLoading,
                'لا توجد دورات مسجلة مرفوضة حالياً'
              )}
            </TabsContent>
          </motion.div>
        </Tabs>
      </motion.div>
    </div>
  );
};

export default RecordedCoursesTab;

