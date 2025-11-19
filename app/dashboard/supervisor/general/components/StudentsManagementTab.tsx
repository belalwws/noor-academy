'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, UserPlus, UsersIcon, UserCheck } from 'lucide-react';
import EnrollmentsTab from './EnrollmentsTab';
import FamilyRequestsTab from './FamilyRequestsTab';

// Import the students management component
import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, UserMinus } from 'lucide-react';
import { toast } from 'sonner';
import { GeneralSupervisorAPI, StudentEnrollment, CourseEnrollment } from '@/lib/api/general-supervisor';
import { simpleAuthService } from '@/lib/auth/simpleAuth';
import ConfirmRemoveStudentModal from '@/components/ConfirmRemoveStudentModal';

const ManageStudentsTab: React.FC = () => {
  const [students, setStudents] = useState<StudentEnrollment[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState<CourseEnrollment | null>(null);
  const [showRemoveStudentModal, setShowRemoveStudentModal] = useState(false);

  const loadStudents = useCallback(async () => {
    setStudentsLoading(true);
    try {
      const response = await GeneralSupervisorAPI.getAllStudents();
      console.log('🔍 Students response:', response);
      
      // Handle different response formats
      let studentsArray = [];
      if (Array.isArray(response)) {
        studentsArray = response;
      } else if (response.results && Array.isArray(response.results)) {
        studentsArray = response.results;
      } else {
        // Try to access data property if it exists
        const responseData = response as any;
        if (responseData.data && responseData.data.results && Array.isArray(responseData.data.results)) {
          // Handle nested data.results format
          studentsArray = responseData.data.results;
        } else if (responseData.data && Array.isArray(responseData.data)) {
          studentsArray = responseData.data;
        }
      }
      
      setStudents(studentsArray);
      console.log('✅ Students loaded:', studentsArray.length);
      console.log('🔍 Students array:', studentsArray);
    } catch (error: any) {
      console.error('❌ Error loading students:', error);
      toast.error('فشل في تحميل قائمة الطلاب');
      setStudents([]);
    } finally {
      setStudentsLoading(false);
    }
  }, []);

  // Load students automatically when component mounts
  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  const confirmRemoveStudent = useCallback(async () => {
    if (!selectedEnrollment) return;
    try {
      await GeneralSupervisorAPI.removeStudentFromCourse(selectedEnrollment.id);
      toast.success('تم إزالة الطالب من الكورس بنجاح');
      await loadStudents();
      setShowRemoveStudentModal(false);
      setSelectedEnrollment(null);
    } catch (error: any) {
      console.error('Error removing student:', error);
      throw error;
    }
  }, [selectedEnrollment, loadStudents]);

  return (
    <div className="space-y-6">
      {/* Header with Refresh Button */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-50/60 via-white/80 to-slate-50/60 rounded-xl" />
        <div className="relative flex items-center justify-between p-6 rounded-xl border border-slate-200/50 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center shadow-md">
              <UserMinus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-800">إدارة الطلاب المسجلين</h3>
              <p className="text-slate-600 text-sm">إدارة جميع الطلاب المسجلين في النظام</p>
            </div>
          </div>
          <Button 
            onClick={loadStudents} 
            variant="outline" 
            className="flex items-center gap-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300 transition-all duration-200" 
            disabled={studentsLoading}
          >
            <RefreshCw className={`w-4 h-4 ${studentsLoading ? 'animate-spin' : ''}`} />
            تحديث
          </Button>
        </div>
      </div>

      {/* Content Area */}
      {studentsLoading ? (
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-slate-50/40 via-white/60 to-slate-50/40 rounded-xl" />
          <div className="relative flex items-center justify-center py-16 rounded-xl border border-slate-200/50 backdrop-blur-sm">
            <div className="text-center">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-green-500/20 rounded-full blur-xl animate-pulse" />
                <div className="relative w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">جاري تحميل الطلاب</h3>
              <p className="text-slate-600">يرجى الانتظار بينما نحضر قائمة الطلاب...</p>
            </div>
          </div>
        </div>
      ) : !students || students.length === 0 ? (
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-slate-50/40 via-white/60 to-slate-50/40 rounded-xl" />
          <div className="relative text-center py-16 rounded-xl border border-slate-200/50 backdrop-blur-sm">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-slate-400/10 to-gray-500/10 rounded-full blur-xl" />
              <div className="relative w-20 h-20 bg-gradient-to-br from-slate-100 to-gray-200 rounded-full flex items-center justify-center mx-auto shadow-lg">
                <UserMinus className="w-10 h-10 text-slate-400" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-3">لا توجد طلاب</h3>
            <p className="text-slate-600 max-w-md mx-auto">لا يوجد طلاب مسجلين في النظام حالياً. سيظهر الطلاب هنا عند تسجيلهم في الدورات.</p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {students?.map((student, index) => (
            <div key={`${student.student_email}-${student.course_title}-${index}`} className="group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-white/80 via-slate-50/40 to-white/80 rounded-xl" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-100/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
              <div className="relative bg-white/90 backdrop-blur-sm border border-slate-200/60 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                      <span className="text-white font-semibold text-lg">
                        {student.student_name?.charAt(0)?.toUpperCase() || 'ط'}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-slate-800 mb-1">
                        {student.student_name}
                      </h4>
                      <p className="text-sm text-slate-600 flex items-center gap-2">
                        <span className="w-2 h-2 bg-slate-400 rounded-full"></span>
                        {student.student_email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`px-3 py-1.5 rounded-full text-xs font-medium shadow-sm ${
                      student.enrollment_status === 'Approved' 
                        ? 'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 border border-emerald-200' :
                      student.enrollment_status === 'Pending Approval' 
                        ? 'bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 border border-amber-200' :
                        'bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border border-red-200'
                    }`}>
                      {student.enrollment_status}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      <span className="text-slate-600 font-medium">الدورة:</span>
                      <span className="text-slate-800">{student.course_title}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                      <span className="text-slate-600 font-medium">المعلم:</span>
                      <span className="text-slate-800">{student.teacher_name}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end pt-4 border-t border-slate-200/60">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 transition-all duration-200 shadow-sm group/btn"
                    onClick={async () => {
                      console.log('🔍 Student data:', student);
                      
                      // Create a mock enrollment object for the modal
                      const mockEnrollment = {
                        id: `mock-${student.student_email}-${Date.now()}`,
                        student_name: student.student_name,
                        student_email: student.student_email,
                        course_title: student.course_title,
                        teacher_name: student.teacher_name,
                        enrollment_status: student.enrollment_status
                      };
                      
                      console.log('🔍 Mock enrollment:', mockEnrollment);
                      
                      // First, try to get all enrollments to find the correct ID
                      try {
                        const token = await simpleAuthService.getValidAccessToken();
                        if (!token) {
                          console.error('❌ No token available');
                          return;
                        }

                        const enrollmentsResponse = await fetch(
                          `${process.env['NEXT_PUBLIC_API_URL']}/live-education/enrollments/`,
                          {
                            headers: {
                              'Authorization': `Bearer ${token}`,
                              'Content-Type': 'application/json',
                            },
                            credentials: 'include',
                          }
                        );

                        if (enrollmentsResponse.ok) {
                          const enrollmentsData = await enrollmentsResponse.json();
                          console.log('📋 All enrollments:', enrollmentsData);
                          
                          // Try to find matching enrollment
                          let matchingEnrollment = null;
                          if (enrollmentsData.results && Array.isArray(enrollmentsData.results)) {
                            matchingEnrollment = enrollmentsData.results.find((enrollment: any) => {
                              const studentNameMatch = enrollment.student_name && 
                                enrollment.student_name.toLowerCase() === student.student_name.toLowerCase();
                              const courseMatch = enrollment.course_title && 
                                enrollment.course_title.toLowerCase() === student.course_title.toLowerCase();
                              
                              console.log(`🔍 Checking enrollment:`, {
                                enrollmentStudentName: enrollment.student_name,
                                targetStudentName: student.student_name,
                                studentNameMatch,
                                enrollmentCourseTitle: enrollment.course_title,
                                targetCourseTitle: student.course_title,
                                courseMatch
                              });
                              
                              return studentNameMatch && courseMatch;
                            });
                          }
                          
                          console.log('🔍 Matching enrollment:', matchingEnrollment);
                          
                          if (matchingEnrollment) {
                            setSelectedEnrollment({
                              id: matchingEnrollment.id,
                              student_name: matchingEnrollment.student_name || student.student_name,
                              student_email: matchingEnrollment.student_email || student.student_email,
                              course_title: matchingEnrollment.course_title || student.course_title,
                              teacher_name: matchingEnrollment.teacher_name || student.teacher_name,
                              enrollment_status: matchingEnrollment.enrollment_status || student.enrollment_status
                            });
                          } else {
                            console.warn('⚠️ لم يتم العثور على تسجيل الطالب في هذا الكورس');
                            // Log all available enrollments for debugging
                            if (enrollmentsData.results) {
                              console.log('📋 Available enrollments:');
                              enrollmentsData.results.forEach((enrollment: any, index: number) => {
                                console.log(`  ${index + 1}. Student: ${enrollment.student_name}, Course: ${enrollment.course_title}`);
                              });
                            }
                            
                            // Use mock enrollment as fallback
                            setSelectedEnrollment(mockEnrollment);
                          }
                        } else {
                          console.error('❌ Failed to fetch enrollments');
                          setSelectedEnrollment(mockEnrollment);
                        }
                      } catch (error) {
                        console.error('❌ Error fetching enrollments:', error);
                        setSelectedEnrollment(mockEnrollment);
                      }
                      
                      setShowRemoveStudentModal(true);
                    }}
                  >
                    <UserMinus className="w-4 h-4 ml-2 group-hover/btn:scale-110 transition-transform duration-200" />
                    إزالة من الدورة
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirm Remove Student Modal */}
      <div className="relative z-50">
        <ConfirmRemoveStudentModal
          isOpen={showRemoveStudentModal}
          onClose={() => {
            setShowRemoveStudentModal(false);
            setSelectedEnrollment(null);
          }}
          onConfirm={confirmRemoveStudent}
          enrollment={selectedEnrollment}
        />
      </div>
    </div>
  );
};

const StudentsManagementTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative bg-gradient-to-br from-amber-50/80 via-orange-50/60 to-amber-50/80 dark:from-amber-900/20 dark:via-orange-900/10 dark:to-amber-900/20 rounded-2xl border border-amber-200/50 dark:border-amber-700/30 shadow-lg p-6 overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-200/30 to-orange-200/20 dark:from-amber-600/20 dark:to-orange-700/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-orange-200/20 to-amber-200/30 dark:from-orange-600/10 dark:to-amber-700/20 rounded-full blur-2xl" />
        
        <Tabs defaultValue="enrollments" className="w-full relative z-10" dir="rtl">
          <TabsList className="inline-flex h-14 w-full flex-col sm:flex-row items-stretch sm:items-center justify-start rounded-2xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl p-2 gap-2 border-2 border-amber-200/50 dark:border-amber-800/40 shadow-lg overflow-hidden">
            <TabsTrigger 
              value="enrollments" 
              className="flex-1 h-full min-h-[44px] data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:via-amber-600 data-[state=active]:to-orange-600 data-[state=active]:text-white data-[state=active]:shadow-sm rounded-lg transition-all duration-300 flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold data-[state=inactive]:text-gray-600 dark:data-[state=inactive]:text-gray-400 data-[state=inactive]:bg-transparent data-[state=inactive]:hover:bg-amber-50/60 dark:data-[state=inactive]:hover:bg-amber-950/30 data-[state=inactive]:hover:text-amber-700 dark:data-[state=inactive]:hover:text-amber-400"
            >
              <UserPlus className="w-4 h-4 shrink-0" />
              <span className="whitespace-nowrap text-xs sm:text-sm">طلبات التسجيل العامة</span>
            </TabsTrigger>
            <TabsTrigger 
              value="family-requests" 
              className="flex-1 h-full min-h-[44px] data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:via-amber-600 data-[state=active]:to-orange-600 data-[state=active]:text-white data-[state=active]:shadow-sm rounded-lg transition-all duration-300 flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold data-[state=inactive]:text-gray-600 dark:data-[state=inactive]:text-gray-400 data-[state=inactive]:bg-transparent data-[state=inactive]:hover:bg-amber-50/60 dark:data-[state=inactive]:hover:bg-amber-950/30 data-[state=inactive]:hover:text-amber-700 dark:data-[state=inactive]:hover:text-amber-400"
            >
              <Users className="w-4 h-4 shrink-0" />
              <span className="whitespace-nowrap text-xs sm:text-sm">طلبات الدورات العائلية</span>
            </TabsTrigger>
            <TabsTrigger 
              value="manage-students" 
              className="flex-1 h-full min-h-[44px] data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:via-amber-600 data-[state=active]:to-orange-600 data-[state=active]:text-white data-[state=active]:shadow-sm rounded-lg transition-all duration-300 flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold data-[state=inactive]:text-gray-600 dark:data-[state=inactive]:text-gray-400 data-[state=inactive]:bg-transparent data-[state=inactive]:hover:bg-amber-50/60 dark:data-[state=inactive]:hover:bg-amber-950/30 data-[state=inactive]:hover:text-amber-700 dark:data-[state=inactive]:hover:text-amber-400"
            >
              <UserCheck className="w-4 h-4 shrink-0" />
              <span className="whitespace-nowrap text-xs sm:text-sm">إدارة الطلاب المسجلين</span>
            </TabsTrigger>
          </TabsList>

        <div className="mt-6">
          <TabsContent value="enrollments" className="mt-0">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-4 p-5 bg-gradient-to-r from-amber-50 to-orange-50/80 dark:from-amber-900/30 dark:to-orange-900/20 border-2 border-amber-200 dark:border-amber-700/50 rounded-2xl shadow-md"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 dark:from-amber-600 dark:to-orange-700 rounded-xl flex items-center justify-center shadow-lg">
                  <UserPlus className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold bg-gradient-to-r from-amber-900 to-orange-700 dark:from-amber-300 dark:to-orange-400 bg-clip-text text-transparent">طلبات التسجيل في الدورات العامة</h3>
              </div>
              <p className="text-amber-800 dark:text-amber-200 text-sm font-medium">طلبات الانضمام لجميع أنواع الدورات ما عدا الدورات العائلية</p>
            </motion.div>
            <EnrollmentsTab />
          </TabsContent>

          <TabsContent value="family-requests" className="mt-0">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-4 p-5 bg-gradient-to-r from-amber-50 to-orange-50/80 dark:from-amber-900/30 dark:to-orange-900/20 border-2 border-amber-200 dark:border-amber-700/50 rounded-2xl shadow-md"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 dark:from-amber-600 dark:to-orange-700 rounded-xl flex items-center justify-center shadow-lg">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold bg-gradient-to-r from-amber-900 to-orange-700 dark:from-amber-300 dark:to-orange-400 bg-clip-text text-transparent">طلبات الدورات العائلية</h3>
              </div>
              <p className="text-amber-800 dark:text-amber-200 text-sm font-medium">طلبات التسجيل الخاصة بالدورات العائلية (للعائلات والأصدقاء 2-5 أشخاص)</p>
            </motion.div>
            <FamilyRequestsTab />
          </TabsContent>

          <TabsContent value="manage-students" className="mt-0">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-4 p-5 bg-gradient-to-r from-amber-50 to-orange-50/80 dark:from-amber-900/30 dark:to-orange-900/20 border-2 border-amber-200 dark:border-amber-700/50 rounded-2xl shadow-md"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 dark:from-amber-600 dark:to-orange-700 rounded-xl flex items-center justify-center shadow-lg">
                  <UserCheck className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold bg-gradient-to-r from-amber-900 to-orange-700 dark:from-amber-300 dark:to-orange-400 bg-clip-text text-transparent">إدارة الطلاب المسجلين</h3>
              </div>
              <p className="text-amber-800 dark:text-amber-200 text-sm font-medium">عرض جميع الطلاب المسجلين في الدورات مع إمكانية إزالتهم من الدورات</p>
            </motion.div>
            <ManageStudentsTab />
          </TabsContent>
        </div>
        
        </Tabs>
      </motion.div>
    </div>
  );
};

export default StudentsManagementTab;
