"use client";

import React, { useEffect, useState } from "react";
import { academicSupervisorApi, type AcademicSupervisorStatistics } from "@/lib/api/academicSupervisor";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  RefreshCw,
  Users,
  BookOpen,
  GraduationCap,
  TrendingUp,
  Activity,
  Star,
  Target,
  BarChart3,
  PieChart,
  Award,
  Calendar,
} from "lucide-react";

const AdvancedStatisticsTab: React.FC = () => {
  const [statistics, setStatistics] = useState<AcademicSupervisorStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadStatistics = async (showRefreshToast = false) => {
    try {
      if (!showRefreshToast) {
        setIsLoading(true);
      }

      console.log('🔍 Loading advanced statistics...');
      const statsData = await academicSupervisorApi.getDashboardStatistics();
      
      console.log('✅ Advanced statistics loaded:', statsData);
      console.log('🔍 Statistics structure check:', {
        hasStats: !!statsData,
        hasData: !!statsData?.data,
        hasTeachers: !!statsData?.data?.teachers,
        hasCourses: !!statsData?.data?.courses,
        hasStudents: !!statsData?.data?.students,
        hasSummary: !!statsData?.data?.summary
      });
      
      // Extract data from the API response structure
      const actualData = statsData?.data || statsData;
      
      // Ensure we have a valid statistics object with all required properties
      const safeStatsData = {
        supervisor_info: actualData?.supervisor_info || { id: 0, type: 'academic_supervisor', user_email: '' },
        teachers: actualData?.teachers || { total_assigned: 0, approved: 0, pending: 0, rejected: 0 },
        courses: actualData?.courses || { total: 0, pending: 0, approved: 0, published: 0 },
        students: actualData?.students || { total_enrolled: 0, active_enrollments: 0 },
        summary: actualData?.summary || { active_sessions: 0, average_rating: 0 }
      };
      
      console.log('🔍 Safe statistics data:', safeStatsData);
      setStatistics(safeStatsData);

      if (showRefreshToast) {
        toast.success('تم تحديث الإحصائيات بنجاح ✨');
      }
    } catch (err) {
      console.error('❌ Error loading statistics:', err);
      toast.error('حدث خطأ أثناء تحميل الإحصائيات');
      
      // Set default statistics to prevent crashes
      setStatistics({
        supervisor_info: { id: 0, type: 'academic_supervisor', user_email: '' },
        teachers: { total_assigned: 0, approved: 0, pending: 0, rejected: 0 },
        courses: { total: 0, pending: 0, approved: 0, published: 0 },
        students: { total_enrolled: 0, active_enrollments: 0 },
        summary: { active_sessions: 0, average_rating: 0 }
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStatistics();
  }, []);

  const getPercentage = (value: number, total: number) => {
    if (!value || !total || total === 0) return 0;
    return Math.round((value / total) * 100);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return "bg-green-500";
    if (percentage >= 60) return "bg-blue-500";
    if (percentage >= 40) return "bg-yellow-500";
    return "bg-red-500";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-indigo-700 font-medium">جارٍ تحميل الإحصائيات المتقدمة...</p>
        </div>
      </div>
    );
  }

  if (!statistics) {
    return (
      <Card className="border border-gray-200 bg-gradient-to-br from-gray-50 to-white">
        <CardContent className="p-16 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <BarChart3 className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-700 mb-3">الإحصائيات غير متاحة</h3>
          <p className="text-gray-500 text-lg max-w-md mx-auto leading-relaxed mb-6">
            لا يمكن تحميل الإحصائيات في الوقت الحالي. يرجى المحاولة مرة أخرى.
          </p>
          <Button
            onClick={() => loadStatistics(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            إعادة المحاولة
          </Button>
        </CardContent>
      </Card>
    );
  }

  const teacherApprovalRate = statistics?.teachers?.approved && statistics?.teachers?.total_assigned ? 
    getPercentage(statistics.teachers.approved, statistics.teachers.total_assigned) : 0;
  const courseApprovalRate = statistics?.courses?.approved && statistics?.courses?.total ? 
    getPercentage(statistics.courses.approved, statistics.courses.total) : 0;
  const studentActiveRate = statistics?.students?.active_enrollments && statistics?.students?.total_enrolled ? 
    getPercentage(statistics.students.active_enrollments, statistics.students.total_enrolled) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">الإحصائيات المتقدمة</h3>
          <p className="text-gray-600">تحليل شامل ومفصل لأداء المنصة التعليمية والمشرف الأكاديمي</p>
        </div>
        <Button
          variant="outline"
          onClick={() => loadStatistics(true)}
          className="border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:border-indigo-300 transition-all duration-200 shadow-sm"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          تحديث الإحصائيات
        </Button>
      </div>

      {/* Supervisor Info Card */}
      <Card className="border border-gradient-to-r from-indigo-100 to-purple-100 bg-gradient-to-br from-indigo-50 to-purple-50">
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Award className="w-8 h-8 text-white" />
            </div>
            <div>
              <h4 className="text-xl font-bold text-gray-800">معلومات المشرف الأكاديمي</h4>
              <p className="text-gray-600">بيانات الملف الشخصي والهوية</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-indigo-200">
              <div className="text-sm text-gray-600 mb-1">معرف المشرف</div>
              <div className="text-lg font-bold text-gray-800">#{statistics?.supervisor_info?.id || 0}</div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-indigo-200">
              <div className="text-sm text-gray-600 mb-1">نوع الحساب</div>
              <div className="text-lg font-bold text-gray-800">{statistics?.supervisor_info?.type || 'غير محدد'}</div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-indigo-200">
              <div className="text-sm text-gray-600 mb-1">البريد الإلكتروني</div>
              <div className="text-lg font-bold text-gray-800 truncate">{statistics?.supervisor_info?.user_email || 'غير محدد'}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Statistics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
        {/* Teachers Statistics */}
        <Card className="border border-emerald-200 hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-emerald-50 to-green-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-800">{statistics?.teachers?.total_assigned || 0}</div>
                <div className="text-sm text-gray-600">إجمالي المعلمين</div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">معتمد</span>
                <span className="font-medium text-green-700">{statistics?.teachers?.approved || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">معلق</span>
                <span className="font-medium text-yellow-700">{statistics?.teachers?.pending || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">مرفوض</span>
                <span className="font-medium text-red-700">{statistics?.teachers?.rejected || 0}</span>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-xs mb-1">
                <span>معدل الاعتماد</span>
                <span>{teacherApprovalRate}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(teacherApprovalRate)}`}
                  style={{ width: `${teacherApprovalRate}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Courses Statistics */}
        <Card className="border border-blue-200 hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-800">{statistics?.courses?.total || 0}</div>
                <div className="text-sm text-gray-600">إجمالي الدورات</div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">معتمد</span>
                <span className="font-medium text-green-700">{statistics?.courses?.approved || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">معلق</span>
                <span className="font-medium text-yellow-700">{statistics?.courses?.pending || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">منشور</span>
                <span className="font-medium text-blue-700">{statistics?.courses?.published || 0}</span>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-xs mb-1">
                <span>معدل الاعتماد</span>
                <span>{courseApprovalRate}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(courseApprovalRate)}`}
                  style={{ width: `${courseApprovalRate}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Students Statistics */}
        <Card className="border border-purple-200 hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-purple-50 to-pink-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-800">{statistics?.students?.total_enrolled || 0}</div>
                <div className="text-sm text-gray-600">إجمالي الطلاب</div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">نشط</span>
                <span className="font-medium text-green-700">{statistics?.students?.active_enrollments || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">غير نشط</span>
                <span className="font-medium text-gray-700">{(statistics?.students?.total_enrolled || 0) - (statistics?.students?.active_enrollments || 0)}</span>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-xs mb-1">
                <span>معدل النشاط</span>
                <span>{studentActiveRate}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(studentActiveRate)}`}
                  style={{ width: `${studentActiveRate}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Summary */}
        <Card className="border border-orange-200 hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-orange-50 to-amber-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-800">{(statistics?.summary?.average_rating || 0).toFixed(1)}</div>
                <div className="text-sm text-gray-600">متوسط التقييم</div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">الجلسات النشطة</span>
                <span className="font-medium text-green-700">{statistics?.summary?.active_sessions || 0}</span>
              </div>
              <div className="flex items-center gap-1 text-sm">
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                <span className="text-gray-600">تقييم ممتاز</span>
                <span className="font-medium text-yellow-700">{(statistics?.summary?.average_rating || 0).toFixed(1)}/5</span>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-xs mb-1">
                <span>مستوى الأداء</span>
                <span>{Math.round(((statistics?.summary?.average_rating || 0) / 5) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="h-2 rounded-full transition-all duration-500 bg-gradient-to-r from-yellow-400 to-orange-500"
                  style={{ width: `${((statistics?.summary?.average_rating || 0) / 5) * 100}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Teachers Analysis */}
        <Card className="border border-gray-200 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-gray-800">تحليل المعلمين</h4>
                <p className="text-sm text-gray-600">توزيع حالات المعلمين</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="relative">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-green-700">معتمد</span>
                  <span className="text-sm text-gray-600">{statistics?.teachers?.approved || 0} معلم</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all duration-700"
                    style={{ width: `${getPercentage(statistics?.teachers?.approved || 0, statistics?.teachers?.total_assigned || 0)}%` }}
                  ></div>
                </div>
              </div>

              <div className="relative">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-yellow-700">معلق</span>
                  <span className="text-sm text-gray-600">{statistics?.teachers?.pending || 0} معلم</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="h-3 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full transition-all duration-700"
                    style={{ width: `${getPercentage(statistics?.teachers?.pending || 0, statistics?.teachers?.total_assigned || 0)}%` }}
                  ></div>
                </div>
              </div>

              <div className="relative">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-red-700">مرفوض</span>
                  <span className="text-sm text-gray-600">{statistics?.teachers?.rejected || 0} معلم</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="h-3 bg-gradient-to-r from-red-400 to-rose-500 rounded-full transition-all duration-700"
                    style={{ width: `${getPercentage(statistics?.teachers?.rejected || 0, statistics?.teachers?.total_assigned || 0)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Courses Analysis */}
        <Card className="border border-gray-200 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-gray-800">تحليل الدورات</h4>
                <p className="text-sm text-gray-600">توزيع حالات الدورات</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="relative">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-green-700">معتمد</span>
                  <span className="text-sm text-gray-600">{statistics?.courses?.approved || 0} دورة</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all duration-700"
                    style={{ width: `${getPercentage(statistics?.courses?.approved || 0, statistics?.courses?.total || 0)}%` }}
                  ></div>
                </div>
              </div>

              <div className="relative">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-yellow-700">معلق</span>
                  <span className="text-sm text-gray-600">{statistics?.courses?.pending || 0} دورة</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="h-3 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full transition-all duration-700"
                    style={{ width: `${getPercentage(statistics?.courses?.pending || 0, statistics?.courses?.total || 0)}%` }}
                  ></div>
                </div>
              </div>

              <div className="relative">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-blue-700">منشور</span>
                  <span className="text-sm text-gray-600">{statistics?.courses?.published || 0} دورة</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="h-3 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full transition-all duration-700"
                    style={{ width: `${getPercentage(statistics?.courses?.published || 0, statistics?.courses?.total || 0)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Insights */}
      <Card className="border border-gray-200 bg-gradient-to-br from-slate-50 to-gray-50">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-gray-800">رؤى الأداء</h4>
              <p className="text-sm text-gray-600">تحليل شامل للأداء العام</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-white rounded-xl border border-gray-200">
              <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Activity className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-gray-800 mb-1">{teacherApprovalRate}%</div>
              <div className="text-sm text-gray-600">معدل اعتماد المعلمين</div>
            </div>
            
            <div className="text-center p-4 bg-white rounded-xl border border-gray-200">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <PieChart className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-gray-800 mb-1">{courseApprovalRate}%</div>
              <div className="text-sm text-gray-600">معدل اعتماد الدورات</div>
            </div>
            
            <div className="text-center p-4 bg-white rounded-xl border border-gray-200">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Star className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-gray-800 mb-1">{studentActiveRate}%</div>
              <div className="text-sm text-gray-600">معدل نشاط الطلاب</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvancedStatisticsTab;
