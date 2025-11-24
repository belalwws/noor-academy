'use client';

import React, { useState, useEffect } from 'react';
import { useAppSelector } from '../../../lib/hooks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Progress } from '../../../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { 
  BookOpen, 
  Users, 
  Clock, 
  GraduationCap,
  CheckCircle,
  PlayCircle,
  Calendar,
  User,
  Award,
  TrendingUp,
  Eye,
  Star
} from 'lucide-react';
import { toast } from '../../../components/ui/use-toast';
import ProtectedRoute from '../../../components/ProtectedRoute';
import enrollmentService, { type StudentEnrollment } from '../../../lib/api/enrollment';

export default function MyCoursesPage() {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const [enrollments, setEnrollments] = useState<StudentEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchMyEnrollments();
    }
  }, [isAuthenticated, user]);

  const fetchMyEnrollments = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching student enrollments...');
      
      const response = await enrollmentService.getStudentEnrollments();
      const enrollmentsData = response.results || [];
      
      console.log('📚 Found enrollments:', enrollmentsData.length);
      console.log('📊 Enrollments data:', enrollmentsData);
      
      setEnrollments(enrollmentsData);
      
    } catch (error) {
      console.error('❌ Error fetching enrollments:', error);
      toast({
        title: "خطأ في التحميل",
        description: "حدث خطأ في تحميل دوراتك",
        variant: "destructive",
      });
      setEnrollments([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'نشطة';
      case 'completed': return 'مكتملة';
      case 'paused': return 'متوقفة';
      case 'cancelled': return 'ملغية';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case 'paid': return 'مدفوع';
      case 'pending': return 'في الانتظار';
      case 'failed': return 'فشل';
      default: return status;
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredEnrollments = enrollments.filter(enrollment => {
    switch (activeTab) {
      case 'active':
        return enrollment.enrollment_status === 'active';
      case 'completed':
        return enrollment.enrollment_status === 'completed';
      case 'pending':
        return enrollment.payment_status === 'pending';
      default:
        return true;
    }
  });

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['student']}>
        <div className="min-h-screen bg-gray-50 p-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">جاري تحميل دوراتك...</p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['student']}>
      <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-blue-600 rounded-full">
                <GraduationCap className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">دوراتي</h1>
                <p className="text-lg text-gray-600">تتبع تقدمك في جميع الدورات المسجل فيها</p>
              </div>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="bg-white/80 backdrop-blur-sm border-blue-200">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-100 rounded-full">
                      <BookOpen className="h-8 w-8 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-blue-600">{enrollments.length}</p>
                      <p className="text-sm text-gray-600">إجمالي الدورات</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white/80 backdrop-blur-sm border-blue-200">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-100 rounded-full">
                      <PlayCircle className="h-8 w-8 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-blue-600">
                        {enrollments.filter(e => e.enrollment_status === 'active').length}
                      </p>
                      <p className="text-sm text-gray-600">دورات نشطة</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white/80 backdrop-blur-sm border-purple-200">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-100 rounded-full">
                      <Award className="h-8 w-8 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-purple-600">
                        {enrollments.filter(e => e.enrollment_status === 'completed').length}
                      </p>
                      <p className="text-sm text-gray-600">دورات مكتملة</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white/80 backdrop-blur-sm border-yellow-200">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-yellow-100 rounded-full">
                      <TrendingUp className="h-8 w-8 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-yellow-600">
                        {Math.round(enrollments.reduce((acc, e) => acc + (e.progress_percentage || 0), 0) / Math.max(enrollments.length, 1))}%
                      </p>
                      <p className="text-sm text-gray-600">متوسط التقدم</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">جميع الدورات</TabsTrigger>
              <TabsTrigger value="active">النشطة</TabsTrigger>
              <TabsTrigger value="completed">المكتملة</TabsTrigger>
              <TabsTrigger value="pending">في الانتظار</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEnrollments.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <div className="p-4 bg-gray-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                      <BookOpen className="h-10 w-10 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">لا توجد دورات</h3>
                    <p className="text-gray-500">لم تسجل في أي دورات بعد</p>
                  </div>
                ) : (
                  filteredEnrollments.map((enrollment) => (
                    <Card key={enrollment.id} className="bg-white hover:shadow-lg transition-all duration-300">
                      <CardHeader className="pb-4">
                        <div className="flex justify-between items-start mb-3">
                          <Badge variant="secondary" className={getStatusColor(enrollment.enrollment_status)}>
                            {getStatusText(enrollment.enrollment_status)}
                          </Badge>
                          <Badge variant="outline" className={getPaymentStatusColor(enrollment.payment_status)}>
                            {getPaymentStatusText(enrollment.payment_status)}
                          </Badge>
                        </div>
                        <CardTitle className="text-xl text-gray-900 leading-tight">
                          {enrollment.course_title || `دورة رقم ${enrollment.course}`}
                        </CardTitle>
                        <CardDescription className="text-gray-600 text-sm">
                          {enrollment.notes || 'لا يوجد وصف متاح'}
                        </CardDescription>
                      </CardHeader>
                      
                      <CardContent className="pt-0">
                        <div className="space-y-4">
                          <div className="flex items-center gap-3 text-sm text-gray-600">
                            <User className="h-4 w-4" />
                            <span>المعلم: {enrollment.instructor_name || 'غير محدد'}</span>
                          </div>
                          
                          <div className="flex items-center gap-3 text-sm text-gray-600">
                            <Calendar className="h-4 w-4" />
                            <span>تاريخ التسجيل: {new Date(enrollment.enrollment_date).toLocaleDateString('ar-SA')}</span>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>التقدم</span>
                              <span>{enrollment.progress_percentage || 0}%</span>
                            </div>
                            <Progress value={enrollment.progress_percentage || 0} className="h-2" />
                          </div>
                          
                          <div className="pt-4 border-t border-gray-100">
                            <div className="flex gap-2">
                              <Button 
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                                size="sm"
                              >
                                <Eye className="w-4 h-4 ml-2" />
                                عرض الدورة
                              </Button>
                              {enrollment.enrollment_status === 'active' && (
                                <Button 
                                  variant="outline"
                                  size="sm"
                                  className="border-blue-200 text-blue-600 hover:bg-blue-50"
                                >
                                  <PlayCircle className="w-4 h-4 ml-2" />
                                  متابعة
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ProtectedRoute>
  );
}
