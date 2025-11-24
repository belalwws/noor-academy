"use client";

import React, { useEffect, useState } from "react";
import { academicSupervisorApi, type CourseItem } from "@/lib/api/academicSupervisor";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { LiveCourseApprovalModal } from "@/components/academic-supervisor-profile/LiveCourseApprovalModal";
import {
  RefreshCw,
  BookOpen,
  Users,
  Calendar,
  CheckCircle,
  Eye,
  EyeOff,
  UserX,
  UserCheck,
} from "lucide-react";

const TeacherCoursesTab: React.FC = () => {
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingCourseId, setProcessingCourseId] = useState<string | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<CourseItem | null>(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);

  const loadCourses = async (showRefreshToast = false) => {
    try {
      if (!showRefreshToast) {
        setIsLoading(true);
      }

      console.log('🔍 Loading teacher courses...');
      const coursesData = await academicSupervisorApi.getTeacherCourses();
      
      console.log('✅ Courses loaded:', coursesData);
      console.log('🔍 Courses data type:', typeof coursesData);
      console.log('🔍 Courses is array:', Array.isArray(coursesData));
      console.log('🔍 Courses length:', coursesData?.length);
      console.log('🔍 Courses data structure:', JSON.stringify(coursesData, null, 2));
      
      // Handle different response structures
      let processedCourses: CourseItem[] = [];
      if (Array.isArray(coursesData)) {
        processedCourses = coursesData;
      } else if (coursesData && typeof coursesData === 'object') {
        const data = coursesData as any;
        // Check if data is nested in a property
        if (data.data && Array.isArray(data.data)) {
          processedCourses = data.data;
        } else if (data.results && Array.isArray(data.results)) {
          processedCourses = data.results;
        } else if (data.courses && Array.isArray(data.courses)) {
          processedCourses = data.courses;
        }
      }
      
      console.log('🔍 Processed courses:', processedCourses);
      console.log('🔍 Processed courses length:', processedCourses.length);
      
      setCourses(processedCourses);

      if (showRefreshToast) {
        toast.success('تم تحديث الدورات بنجاح ✨');
      }
    } catch (err) {
      console.error('❌ Error loading courses:', err);
      toast.error('حدث خطأ أثناء تحميل الدورات');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const handleToggleVisibility = async (courseId: string, currentlyHidden: boolean) => {
    try {
      setProcessingCourseId(courseId);
      const response = await academicSupervisorApi.toggleCourseVisibility(courseId);
      
      if (response.success) {
        toast.success(currentlyHidden ? 'تم إظهار الدورة بنجاح ✅' : 'تم إخفاء الدورة بنجاح 🔒');
        await loadCourses(false);
      } else {
        toast.error(response.error || 'حدث خطأ أثناء تغيير حالة الدورة');
      }
    } catch (error) {
      console.error('Error toggling course visibility:', error);
      toast.error('حدث خطأ أثناء تغيير حالة الدورة');
    } finally {
      setProcessingCourseId(null);
    }
  };

  const handleApprove = (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    if (course) {
      setSelectedCourse(course);
      setShowApprovalModal(true);
    }
  };

  const handleReject = (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    if (course) {
      setSelectedCourse(course);
      setShowApprovalModal(true);
    }
  };

  const handleToggleApplications = async (courseId: string, currentlyAccepting: boolean) => {
    try {
      setProcessingCourseId(courseId);
      const response = await academicSupervisorApi.toggleCourseApplications(courseId);
      
      if (response.success) {
        toast.success(currentlyAccepting ? 'تم إيقاف قبول التسجيلات 🔒' : 'تم فتح التسجيلات ✅');
        await loadCourses(false);
      } else {
        toast.error(response.error || 'حدث خطأ أثناء تغيير حالة التسجيلات');
      }
    } catch (error) {
      console.error('Error toggling course applications:', error);
      toast.error('حدث خطأ أثناء تغيير حالة التسجيلات');
    } finally {
      setProcessingCourseId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <div className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold border border-blue-200">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            معتمد
          </div>
        );
      case 'pending':
        return (
          <div className="flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold border border-yellow-200">
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
            معلق
          </div>
        );
      case 'rejected':
        return (
          <div className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold border border-red-200">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            مرفوض
          </div>
        );
      case 'under_review':
        return (
          <div className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold border border-blue-200">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            قيد المراجعة
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-semibold border border-gray-200">
            <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
            {status}
          </div>
        );
    }
  };

  const getCourseTypeIcon = (courseType: string) => {
    switch (courseType) {
      case 'individual':
        return <Users className="w-4 h-4 text-blue-600" />;
      case 'family':
        return <Users className="w-4 h-4 text-blue-600" />;
      case 'group_private':
        return <Users className="w-4 h-4 text-purple-600" />;
      case 'group_public':
        return <Users className="w-4 h-4 text-orange-600" />;
      default:
        return <BookOpen className="w-4 h-4 text-gray-600" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-blue-700 font-medium">جارٍ تحميل الدورات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">دورات المعلمين</h3>
          <p className="text-gray-600">إدارة ومتابعة الدورات المنشأة من قبل المعلمين المخصصين لك</p>
        </div>
        <Button
          variant="outline"
          onClick={() => loadCourses(true)}
          className="border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 shadow-sm"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          تحديث البيانات
        </Button>
      </div>

      {/* Courses Grid */}
      {!Array.isArray(courses) || courses.length === 0 ? (
        <Card className="border border-gray-200 bg-gradient-to-br from-gray-50 to-white">
          <CardContent className="p-16 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-700 mb-3">لا توجد دورات</h3>
            <p className="text-gray-500 text-lg max-w-md mx-auto leading-relaxed">
              لم يتم إنشاء أي دورات بعد من قبل المعلمين المخصصين لك. سيتم عرض الدورات هنا بمجرد إنشائها من قبل المعلمين.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.isArray(courses) && courses.map((course, index) => (
            <Card 
              key={course.id} 
              className="group border border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br from-white to-blue-50/30"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-6">
                {/* Header with Icon and Status */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                        {getCourseTypeIcon(course.course_type)}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full border-2 border-white flex items-center justify-center">
                        <BookOpen className="w-3 h-3 text-blue-600" />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-gray-800 mb-1 line-clamp-2">{course.title}</h4>
                      <p className="text-sm text-gray-500">{course.teacher_name}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {getStatusBadge(course.approval_status)}
                    {course.is_published && (
                      <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold border border-blue-200">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        منشور
                      </div>
                    )}
                    {(course as any).is_hidden && (
                      <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-semibold border border-gray-200">
                        <EyeOff className="w-3 h-3" />
                        مخفي
                      </div>
                    )}
                    {!(course as any).accepting_applications && (
                      <div className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold border border-red-200">
                        <UserX className="w-3 h-3" />
                        التسجيل مغلق
                      </div>
                    )}
                  </div>
                  </div>

                {/* Course Description */}
                <div className="mb-4">
                  <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">{course.description}</p>
                    </div>

                {/* Course Details */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <BookOpen className="w-4 h-4 text-blue-500" />
                    <span className="font-medium">النوع:</span>
                    <span className="text-gray-800">{course.course_type_display}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="w-4 h-4 text-blue-500" />
                    <span className="font-medium">المسجلين:</span>
                    <span className="text-gray-800">{course.enrolled_count} / {course.max_students}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4 text-purple-500" />
                    <span className="font-medium">تاريخ الإنشاء:</span>
                    <span className="text-gray-800">{new Date(course.created_at).toLocaleDateString('ar-SA')}</span>
                  </div>
                  
                  {course.approved_at && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-blue-500" />
                      <span className="font-medium">تم الاعتماد:</span>
                      <span className="text-gray-800">{new Date(course.approved_at).toLocaleDateString('ar-SA')}</span>
                    </div>
                  )}
                    </div>

                {/* Learning Outcomes */}
                {course.learning_outcomes && (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl space-y-2 text-sm border border-blue-200/50 mb-4">
                    <span className="font-semibold text-gray-800 block">أهداف التعلم:</span>
                    <span className="text-gray-600 leading-relaxed">{course.learning_outcomes}</span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {/* Approval Buttons - Only show if pending */}
                  {course.approval_status === 'pending' && (
                    <>
                      <Button
                        onClick={() => handleApprove(course.id)}
                        size="sm"
                        className="flex-1 min-w-[120px] bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200"
                      >
                        <CheckCircle className="w-4 h-4 ml-2" />
                        قبول الدورة
                      </Button>
                      
                      <Button
                        onClick={() => handleReject(course.id)}
                        size="sm"
                        className="flex-1 min-w-[120px] bg-red-600 hover:bg-red-700 text-white transition-all duration-200"
                      >
                        <UserX className="w-4 h-4 ml-2" />
                        رفض الدورة
                      </Button>
                    </>
                  )}

                  <Button
                    onClick={() => handleToggleVisibility(course.id, (course as any).is_hidden)}
                    disabled={processingCourseId === course.id}
                    variant="outline"
                    size="sm"
                    className="flex-1 min-w-[120px] border-purple-200 text-purple-700 hover:bg-purple-50 hover:border-purple-300 transition-all duration-200"
                  >
                    {processingCourseId === course.id ? (
                      <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin ml-2" />
                    ) : (course as any).is_hidden ? (
                      <Eye className="w-4 h-4 ml-2" />
                    ) : (
                      <EyeOff className="w-4 h-4 ml-2" />
                    )}
                    {(course as any).is_hidden ? 'إظهار الدورة' : 'إخفاء الدورة'}
                  </Button>
                  
                  <Button
                    onClick={() => handleToggleApplications(course.id, (course as any).accepting_applications)}
                    disabled={processingCourseId === course.id}
                    variant="outline"
                    size="sm"
                    className="flex-1 min-w-[120px] border-orange-200 text-orange-700 hover:bg-orange-50 hover:border-orange-300 transition-all duration-200"
                  >
                    {processingCourseId === course.id ? (
                      <div className="w-4 h-4 border-2 border-orange-600 border-t-transparent rounded-full animate-spin ml-2" />
                    ) : (course as any).accepting_applications ? (
                      <UserX className="w-4 h-4 ml-2" />
                    ) : (
                      <UserCheck className="w-4 h-4 ml-2" />
                    )}
                    {(course as any).accepting_applications ? 'إيقاف التسجيل' : 'فتح التسجيل'}
                  </Button>
                </div>

                {/* Footer */}
                <div className="pt-4 border-t border-gray-200/50">
                  <div className="flex items-center justify-end text-xs text-gray-500">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        <span>نشط</span>
                      </div>
                      {course.available_spots > 0 && (
                        <span className="text-blue-600 font-medium">
                          {course.available_spots} مقاعد متاحة
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Live Course Approval Modal */}
      {selectedCourse && showApprovalModal && (
        <LiveCourseApprovalModal
          course={selectedCourse}
          isOpen={true}
          onClose={() => {
            setShowApprovalModal(false);
            setSelectedCourse(null);
          }}
          onApprove={() => {
            setShowApprovalModal(false);
            setSelectedCourse(null);
            loadCourses(false);
          }}
          onReject={() => {
            setShowApprovalModal(false);
            setSelectedCourse(null);
            loadCourses(false);
          }}
        />
      )}
    </div>
  );
};

export default TeacherCoursesTab;
