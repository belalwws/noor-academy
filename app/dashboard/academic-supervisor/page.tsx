"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import ProtectedRoute from "@/components/ProtectedRoute";
import { academicSupervisorApi, type AcademicSupervisorStatistics, type TeacherProfile, type CourseItem } from "@/lib/api/academicSupervisor";
import { logger } from '@/lib/utils/logger';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";

// import LiveSessionsTab from './components/LiveSessionsTab';
import LiveSessionsSSE from './components/LiveSessionsSSE';
import dynamic from 'next/dynamic';
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Lazy load tab components for better performance
const TeacherCoursesTab = dynamic(() => import('./components/TeacherCoursesTab'), {
  loading: () => <Skeleton className="h-96 w-full" />,
  ssr: false,
});

const TeachersManagementTab = dynamic(() => import('./components/TeachersManagementTab'), {
  loading: () => <Skeleton className="h-96 w-full" />,
  ssr: false,
});

const CourseApplicationsTab = dynamic(() => import('./components/CourseApplicationsTab'), {
  loading: () => <Skeleton className="h-96 w-full" />,
  ssr: false,
});

const RecordedCoursesTab = dynamic(() => import('./components/RecordedCoursesTab'), {
  loading: () => <Skeleton className="h-96 w-full" />,
  ssr: false,
});
import { toast } from "sonner";
import {
  RefreshCw,
  GraduationCap,
  Users,
  BookOpen,
  Clock,
  Video,
  Users2,
  BarChart3,
  FileText,
  PlayCircle,
} from "lucide-react";



const AcademicSupervisorDashboard: React.FC = () => {
  const [stats, setStats] = useState<AcademicSupervisorStatistics | null>(null);
  const [teachers, setTeachers] = useState<TeacherProfile[]>([]);
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showMeetingModal, setShowMeetingModal] = useState(false);

  const handleMeetingClick = () => {
    setShowMeetingModal(true);
  };

  const loadDashboard = async (showRefreshToast = false) => {
    try {
      if (!showRefreshToast) {
        setIsLoading(true);
      }
      
      logger.log('🔍 Loading Academic Supervisor Dashboard...');
      
      const [statsResponse, teachersResponse, coursesResponse] = await Promise.all([
        academicSupervisorApi.getDashboardStatistics(),
        academicSupervisorApi.getAssignedTeachers(),
        academicSupervisorApi.getTeacherCourses(),
      ]);

      logger.log('✅ Stats loaded:', statsResponse);
      logger.log('✅ Teachers loaded:', teachersResponse);
      logger.log('✅ Courses loaded:', coursesResponse);
      
      // Set stats - the API service already handles the response format
      if (statsResponse && typeof statsResponse === 'object' && statsResponse.teachers) {
        setStats(statsResponse);
        logger.log('✅ Stats set successfully:', statsResponse);
        logger.log('📊 Stats teachers count:', statsResponse.teachers?.total_assigned);
        logger.log('📊 Stats courses count:', statsResponse.courses?.total);
      } else {
        logger.warn('⚠️ Stats response is invalid, setting to null');
        logger.warn('⚠️ Stats response type:', typeof statsResponse);
        logger.warn('⚠️ Stats response has teachers?', statsResponse && statsResponse.teachers);
        setStats(null);
      }

      // Set teachers - the API service already handles the response format
      if (Array.isArray(teachersResponse)) {
        setTeachers(teachersResponse);
        logger.log('✅ Teachers set successfully:', teachersResponse);
        logger.log('👥 Teachers count:', teachersResponse.length);
      } else {
        logger.warn('⚠️ Teachers response is invalid, setting to empty array');
        logger.warn('⚠️ Teachers response type:', typeof teachersResponse);
        logger.warn('⚠️ Teachers response is array?', Array.isArray(teachersResponse));
        logger.warn('⚠️ Teachers response structure:', JSON.stringify(teachersResponse, null, 2));
        
        // Try to extract teachers from different possible structures
        let processedTeachers: TeacherProfile[] = [];
        if (teachersResponse && typeof teachersResponse === 'object') {
          const response = teachersResponse as any;
          if (response.data && Array.isArray(response.data)) {
            processedTeachers = response.data;
          } else if (response.results && Array.isArray(response.results)) {
            processedTeachers = response.results;
          } else if (response.teachers && Array.isArray(response.teachers)) {
            processedTeachers = response.teachers;
          }
        }
        
        logger.log('🔍 Processed teachers from main dashboard:', processedTeachers);
        setTeachers(processedTeachers);
      }
      
      // Set courses - handle different response structures
      if (Array.isArray(coursesResponse)) {
        setCourses(coursesResponse);
        logger.log('✅ Courses set successfully:', coursesResponse);
        logger.log('📚 Courses count:', coursesResponse.length);
      } else {
        logger.warn('⚠️ Courses response is invalid, setting to empty array');
        logger.warn('⚠️ Courses response type:', typeof coursesResponse);
        logger.warn('⚠️ Courses response is array?', Array.isArray(coursesResponse));
        logger.warn('⚠️ Courses response structure:', JSON.stringify(coursesResponse, null, 2));
        
        // Try to extract courses from different possible structures
        let processedCourses: CourseItem[] = [];
        if (coursesResponse && typeof coursesResponse === 'object') {
          const response = coursesResponse as any;
          if (response.data && Array.isArray(response.data)) {
            processedCourses = response.data;
          } else if (response.results && Array.isArray(response.results)) {
            processedCourses = response.results;
          } else if (response.courses && Array.isArray(response.courses)) {
            processedCourses = response.courses;
          }
        }
        
        logger.log('🔍 Processed courses from main dashboard:', processedCourses);
        
        // No mock data - courses will be empty if API returns no data
        
        setCourses(processedCourses);
      }
      
      if (showRefreshToast) {
        toast.success('تم تحديث البيانات بنجاح ✨');
      }
    } catch (err) {
      logger.error('❌ Error loading dashboard:', err);
      toast.error('حدث خطأ أثناء تحميل البيانات');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  // Debug logging
  logger.log('🔍 Current state - isLoading:', isLoading);
  logger.log('🔍 Current state - stats:', stats);
  logger.log('🔍 Current state - teachers:', teachers);
  logger.log('🔍 Current state - teachers length:', teachers.length);

  if (isLoading) {
    return (
      <ProtectedRoute allowedRoles={["academic_supervisor"]}>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-amber-50/30 to-orange-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 pt-20">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-4"
          >
            <div className="relative">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 bg-gradient-to-r from-amber-400/20 to-orange-400/20 dark:from-amber-600/20 dark:to-orange-700/20 rounded-full blur-2xl"
              />
              <div className="relative w-24 h-24 bg-gradient-to-br from-amber-500 to-orange-600 dark:from-amber-600 dark:to-orange-700 rounded-2xl flex items-center justify-center mx-auto shadow-2xl">
                <Spinner size="xl" tone="contrast" />
              </div>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-amber-800 to-orange-700 dark:from-slate-100 dark:via-amber-300 dark:to-orange-400 bg-clip-text text-transparent">
                جاري تحميل لوحة التحكم
              </h2>
              <p className="text-gray-600 dark:text-slate-400 text-sm mt-2">يرجى الانتظار بينما نحضر بياناتك...</p>
            </motion.div>
          </motion.div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={["academic_supervisor"]}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50/30 to-orange-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 relative overflow-hidden pt-20 md:pt-24">
        <div className="fixed inset-0 pointer-events-none z-0">
          <motion.div
            animate={{
              scale: [1, 1.15, 1],
              opacity: [0.15, 0.25, 0.15],
              x: [0, 30, 0],
              y: [0, -20, 0]
            }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-amber-200/20 to-orange-300/20 dark:from-amber-600/10 dark:to-orange-700/10 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.15, 0.25, 0.15],
              x: [0, -25, 0],
              y: [0, 25, 0]
            }}
            transition={{ duration: 14, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-orange-200/15 to-amber-300/15 dark:from-orange-600/8 dark:to-amber-700/8 rounded-full blur-3xl"
          />
        </div>

        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 dark:from-amber-600 dark:via-orange-600 dark:to-amber-700 text-white shadow-2xl border-2 border-amber-400/50 dark:border-amber-700/50">
              <CardContent className="p-6 md:p-8 flex flex-col gap-4">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="space-y-3">
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 }}
                      className="inline-flex items-center gap-2 bg-white/20 dark:bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-semibold border border-white/30"
                    >
                      <GraduationCap className="w-4 h-4" />
                      المشرف الأكاديمي
                    </motion.div>
                    <motion.h1 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-2xl md:text-3xl lg:text-4xl font-bold leading-tight"
                    >
                      مرحباً بك في لوحة التحكّم الأكاديمية
                    </motion.h1>
                    <motion.p 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="text-white/90 text-sm md:text-base max-w-2xl"
                    >
                      إدارة المدرسين المرتبطين بك ومتابعة حالة الدورات والطلاب النشطين داخل المنصة التعليمية
                    </motion.p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 md:gap-3">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        variant="outline"
                        className="border-2 border-white/60 text-white hover:bg-white/20 hover:text-white font-semibold bg-white/10 backdrop-blur-sm"
                        onClick={handleMeetingClick}
                      >
                        <Users2 className="w-4 h-4 mr-2" /> الاجتماع
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        variant="outline"
                        className="border-2 border-white/60 text-white hover:bg-white/20 hover:text-white font-semibold bg-white/10 backdrop-blur-sm"
                        onClick={() => void loadDashboard()}
                      >
                        <RefreshCw className="w-4 h-4 mr-2" /> تحديث
                      </Button>
                    </motion.div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Stats - Only show if data exists */}
          {(() => {
            logger.log('🔍 Rendering stats section - stats exists?', !!stats);
            logger.log('🔍 Stats object:', stats);
            return null;
          })()}
          {stats && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                whileHover={{ scale: 1.02, y: -5 }}
              >
                <Card className="border-2 border-amber-200/50 dark:border-amber-700/30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-sm font-semibold text-gray-600 dark:text-slate-400 mb-1">المعلمين المخصصين</p>
                        <p className="text-3xl font-bold bg-gradient-to-r from-amber-900 to-orange-700 dark:from-amber-300 dark:to-orange-400 bg-clip-text text-transparent">{stats.teachers?.total_assigned || 0}</p>
                        <p className="text-xs text-gray-500 dark:text-slate-500 mt-1">إجمالي المعلمين</p>
                      </div>
                      <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-orange-600 dark:from-amber-500 dark:to-orange-700 rounded-2xl blur-lg opacity-60 group-hover:opacity-80 transition-opacity" />
                        <div className="relative p-3 bg-gradient-to-br from-amber-500 to-orange-600 dark:from-amber-600 dark:to-orange-700 rounded-2xl shadow-lg">
                          <Users className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-600 dark:text-slate-400 pt-3 border-t border-gray-200 dark:border-slate-700">
                      <span>معتمد: {stats.teachers?.approved || 0}</span>
                      <span>معلق: {stats.teachers?.pending || 0}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                whileHover={{ scale: 1.02, y: -5 }}
              >
                <Card className="border-2 border-amber-200/50 dark:border-amber-700/30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-sm font-semibold text-gray-600 dark:text-slate-400 mb-1">طلبات الاعتماد</p>
                        <p className="text-3xl font-bold bg-gradient-to-r from-amber-900 to-orange-700 dark:from-amber-300 dark:to-orange-400 bg-clip-text text-transparent">{stats.teachers?.pending || 0}</p>
                        <p className="text-xs text-gray-500 dark:text-slate-500 mt-1">بانتظار المراجعة</p>
                      </div>
                      <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-orange-600 dark:from-amber-500 dark:to-orange-700 rounded-2xl blur-lg opacity-60 group-hover:opacity-80 transition-opacity" />
                        <div className="relative p-3 bg-gradient-to-br from-amber-500 to-orange-600 dark:from-amber-600 dark:to-orange-700 rounded-2xl shadow-lg">
                          <Clock className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-600 dark:text-slate-400 pt-3 border-t border-gray-200 dark:border-slate-700">
                      <span>مرفوض: {stats.teachers?.rejected || 0}</span>
                      <span>معتمد: {stats.teachers?.approved || 0}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                whileHover={{ scale: 1.02, y: -5 }}
              >
                <Card className="border-2 border-amber-200/50 dark:border-amber-700/30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-sm font-semibold text-gray-600 dark:text-slate-400 mb-1">الدورات</p>
                        <p className="text-3xl font-bold bg-gradient-to-r from-amber-900 to-orange-700 dark:from-amber-300 dark:to-orange-400 bg-clip-text text-transparent">{stats.courses?.total || 0}</p>
                        <p className="text-xs text-gray-500 dark:text-slate-500 mt-1">إجمالي الدورات</p>
                      </div>
                      <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-orange-600 dark:from-amber-500 dark:to-orange-700 rounded-2xl blur-lg opacity-60 group-hover:opacity-80 transition-opacity" />
                        <div className="relative p-3 bg-gradient-to-br from-amber-500 to-orange-600 dark:from-amber-600 dark:to-orange-700 rounded-2xl shadow-lg">
                          <BookOpen className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-600 dark:text-slate-400 pt-3 border-t border-gray-200 dark:border-slate-700">
                      <span>منشور: {stats.courses?.published || 0}</span>
                      <span>معلق: {stats.courses?.pending || 0}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                whileHover={{ scale: 1.02, y: -5 }}
              >
                <Card className="border-2 border-amber-200/50 dark:border-amber-700/30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-sm font-semibold text-gray-600 dark:text-slate-400 mb-1">الطلاب النشطون</p>
                        <p className="text-3xl font-bold bg-gradient-to-r from-amber-900 to-orange-700 dark:from-amber-300 dark:to-orange-400 bg-clip-text text-transparent">{stats.students?.active_enrollments || 0}</p>
                        <p className="text-xs text-gray-500 dark:text-slate-500 mt-1">مسجلين حالياً</p>
                      </div>
                      <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-orange-600 dark:from-amber-500 dark:to-orange-700 rounded-2xl blur-lg opacity-60 group-hover:opacity-80 transition-opacity" />
                        <div className="relative p-3 bg-gradient-to-br from-amber-500 to-orange-600 dark:from-amber-600 dark:to-orange-700 rounded-2xl shadow-lg">
                          <BarChart3 className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-600 dark:text-slate-400 pt-3 border-t border-gray-200 dark:border-slate-700">
                      <span>إجمالي: {stats.students?.total_enrolled || 0}</span>
                      <span>نشط: {stats.students?.active_enrollments || 0}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border-2 border-amber-200/50 dark:border-amber-700/30">
              <div className="relative bg-gradient-to-r from-amber-50/80 via-orange-50/60 to-amber-50/80 dark:from-amber-900/20 dark:via-orange-900/10 dark:to-amber-900/20 p-6 border-b border-amber-200/50 dark:border-amber-700/30 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-200/30 to-orange-200/20 dark:from-amber-600/20 dark:to-orange-700/10 rounded-full blur-3xl" />
                <div className="relative z-10">
                  <h2 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-amber-900 via-orange-700 to-amber-800 dark:from-amber-300 dark:via-orange-400 dark:to-amber-400 bg-clip-text text-transparent mb-2">
                    إدارة المنصة
                  </h2>
                  <p className="text-gray-700 dark:text-slate-300 font-medium">تحكم شامل في جميع جوانب المنصة التعليمية</p>
                </div>
              </div>

              <Tabs defaultValue="live-sessions" className="w-full" dir="rtl">
                <div className="px-6 md:px-8 pt-6 pb-4">
                  <TabsList className="inline-flex h-14 w-full items-center justify-start rounded-2xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl p-2 gap-2 border-2 border-amber-200/50 dark:border-amber-800/40 shadow-lg overflow-hidden">
                    <TabsTrigger 
                      value="live-sessions" 
                      className="flex-1 h-full data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:via-amber-600 data-[state=active]:to-orange-600 data-[state=active]:text-white data-[state=active]:shadow-sm rounded-lg transition-all duration-300 flex items-center justify-center gap-2 text-sm px-4 py-3 font-semibold data-[state=inactive]:text-gray-600 dark:data-[state=inactive]:text-gray-400 data-[state=inactive]:bg-transparent data-[state=inactive]:hover:bg-amber-50/60 dark:data-[state=inactive]:hover:bg-amber-950/30 data-[state=inactive]:hover:text-amber-700 dark:data-[state=inactive]:hover:text-amber-400"
                    >
                      <span className="hidden sm:inline">مباشر</span>
                      <Video className="w-4 h-4 shrink-0" />
                    </TabsTrigger>
                    <TabsTrigger 
                      value="teachers" 
                      className="flex-1 h-full data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:via-amber-600 data-[state=active]:to-orange-600 data-[state=active]:text-white data-[state=active]:shadow-sm rounded-lg transition-all duration-300 flex items-center justify-center gap-2 text-sm px-4 py-3 font-semibold data-[state=inactive]:text-gray-600 dark:data-[state=inactive]:text-gray-400 data-[state=inactive]:bg-transparent data-[state=inactive]:hover:bg-amber-50/60 dark:data-[state=inactive]:hover:bg-amber-950/30 data-[state=inactive]:hover:text-amber-700 dark:data-[state=inactive]:hover:text-amber-400"
                    >
                      <span className="hidden sm:inline">المعلمين ({teachers.length})</span>
                      <Users className="w-4 h-4 shrink-0" />
                    </TabsTrigger>
                    <TabsTrigger 
                      value="courses" 
                      className="flex-1 h-full data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:via-amber-600 data-[state=active]:to-orange-600 data-[state=active]:text-white data-[state=active]:shadow-sm rounded-lg transition-all duration-300 flex items-center justify-center gap-2 text-sm px-4 py-3 font-semibold data-[state=inactive]:text-gray-600 dark:data-[state=inactive]:text-gray-400 data-[state=inactive]:bg-transparent data-[state=inactive]:hover:bg-amber-50/60 dark:data-[state=inactive]:hover:bg-amber-950/30 data-[state=inactive]:hover:text-amber-700 dark:data-[state=inactive]:hover:text-amber-400"
                    >
                      <span className="hidden sm:inline">الدورات ({courses.length})</span>
                      <BookOpen className="w-4 h-4 shrink-0" />
                    </TabsTrigger>
                    <TabsTrigger 
                      value="applications" 
                      className="flex-1 h-full data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:via-amber-600 data-[state=active]:to-orange-600 data-[state=active]:text-white data-[state=active]:shadow-sm rounded-lg transition-all duration-300 flex items-center justify-center gap-2 text-sm px-4 py-3 font-semibold data-[state=inactive]:text-gray-600 dark:data-[state=inactive]:text-gray-400 data-[state=inactive]:bg-transparent data-[state=inactive]:hover:bg-amber-50/60 dark:data-[state=inactive]:hover:bg-amber-950/30 data-[state=inactive]:hover:text-amber-700 dark:data-[state=inactive]:hover:text-amber-400"
                    >
                      <span className="hidden sm:inline">طلبات الدورات المباشرة</span>
                      <FileText className="w-4 h-4 shrink-0" />
                    </TabsTrigger>
                    <TabsTrigger 
                      value="recorded-courses" 
                      className="flex-1 h-full data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:via-purple-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-sm rounded-lg transition-all duration-300 flex items-center justify-center gap-2 text-sm px-4 py-3 font-semibold data-[state=inactive]:text-gray-600 dark:data-[state=inactive]:text-gray-400 data-[state=inactive]:bg-transparent data-[state=inactive]:hover:bg-purple-50/60 dark:data-[state=inactive]:hover:bg-purple-950/30 data-[state=inactive]:hover:text-purple-700 dark:data-[state=inactive]:hover:text-purple-400"
                    >
                      <span className="hidden sm:inline">الدورات المسجلة</span>
                      <PlayCircle className="w-4 h-4 shrink-0" />
                    </TabsTrigger>
                  </TabsList>
                </div>

                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4 }}
                  className="p-6 md:p-8"
                >
                  <TabsContent value="live-sessions" className="mt-0">
                    <LiveSessionsSSE />
                  </TabsContent>

                  <TabsContent value="teachers" className="mt-0">
                    <TeachersManagementTab />
                  </TabsContent>

                  <TabsContent value="courses" className="mt-0">
                    <TeacherCoursesTab />
                  </TabsContent>

                  <TabsContent value="applications" className="mt-0">
                    <CourseApplicationsTab />
                  </TabsContent>

                  <TabsContent value="recorded-courses" className="mt-0">
                    <RecordedCoursesTab />
                  </TabsContent>
                </motion.div>
              </Tabs>
            </Card>
          </motion.div>

        </div>
      </div>

      {/* Meeting Modal */}
      <Dialog open={showMeetingModal} onOpenChange={setShowMeetingModal}>
        <DialogContent className="max-w-2xl bg-white rounded-3xl shadow-2xl border-2 border-blue-200">
          <DialogHeader className="text-center pb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center shadow-lg mx-auto mb-4">
              <Users2 className="w-10 h-10 text-blue-600" />
            </div>
            <DialogTitle className="text-3xl font-bold text-blue-800 mb-2">
              🎯 الاجتماع مع المشرفين
            </DialogTitle>
            <DialogDescription className="text-gray-600 text-lg">
              ميزة الاجتماع مع المشرفين قيد التطوير
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Coming Soon Section */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-6">
              <h3 className="text-2xl font-bold text-blue-800 mb-4 text-center">🚀 قريباً إن شاء الله</h3>
              
              <div className="text-center space-y-4">
                <div className="text-6xl">⏳</div>
                <p className="text-gray-700 text-lg leading-relaxed">
                  نعمل حالياً على تطوير ميزة الاجتماع مع المشرفين لتوفير تجربة أفضل للتواصل والتعاون بين جميع المشرفين الأكاديميين.
                </p>
                
                <div className="bg-white p-4 rounded-xl shadow-md">
                  <h4 className="text-lg font-bold text-blue-800 mb-2">المميزات المتوقعة:</h4>
                  <ul className="text-gray-600 space-y-1 text-right">
                    <li>• جدولة الاجتماعات مع المشرفين الآخرين</li>
                    <li>• مشاركة التقارير والإحصائيات</li>
                    <li>• مناقشة أفضل الممارسات التعليمية</li>
                    <li>• تنسيق العمل بين المشرفين</li>
                  </ul>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex justify-center gap-4">
              <Button
                onClick={() => setShowMeetingModal(false)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold"
              >
                فهمت، شكراً لك
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </ProtectedRoute>
  );
};

export default AcademicSupervisorDashboard;
