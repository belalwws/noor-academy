"use client";

import React, { useEffect, useState } from "react";
import { academicSupervisorApi, type StudentEnrollment } from "@/lib/api/academicSupervisor";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  RefreshCw,
  Users,
  BookOpen,
  Calendar,
  GraduationCap,
} from "lucide-react";

const TeacherStudentsTab: React.FC = () => {
  const [students, setStudents] = useState<StudentEnrollment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadStudents = async (showRefreshToast = false) => {
    try {
      if (!showRefreshToast) {
        setIsLoading(true);
      }

      console.log('🔍 Loading teacher students...');
      const studentsData = await academicSupervisorApi.getTeacherStudents();
      
      console.log('✅ Students loaded:', studentsData);
      console.log('🔍 Students data type:', typeof studentsData);
      console.log('🔍 Students is array:', Array.isArray(studentsData));
      console.log('🔍 Students length:', studentsData?.length);
      console.log('🔍 Students data structure:', JSON.stringify(studentsData, null, 2));
      
      // Handle different response structures
      let processedStudents: StudentEnrollment[] = [];
      if (Array.isArray(studentsData)) {
        processedStudents = studentsData;
      } else if (studentsData && typeof studentsData === 'object') {
        const data = studentsData as any;
        // Check if data is nested in a property
        if (data.data && Array.isArray(data.data)) {
          processedStudents = data.data;
        } else if (data.results && Array.isArray(data.results)) {
          processedStudents = data.results;
        } else if (data.students && Array.isArray(data.students)) {
          processedStudents = data.students;
        }
      }
      
      console.log('🔍 Processed students:', processedStudents);
      console.log('🔍 Processed students length:', processedStudents.length);
      
      
      setStudents(processedStudents);

      if (showRefreshToast) {
        toast.success('تم تحديث بيانات الطلاب بنجاح ✨');
      }
    } catch (err) {
      console.error('❌ Error loading students:', err);
      toast.error('حدث خطأ أثناء تحميل بيانات الطلاب');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <div className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold border border-blue-200">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            مقبول
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
      case 'completed':
        return (
          <div className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold border border-blue-200">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            مكتمل
          </div>
        );
      case 'cancelled':
        return (
          <div className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-semibold border border-gray-200">
            <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
            ملغي
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-blue-700 font-medium">جارٍ تحميل بيانات الطلاب...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">طلاب المعلمين</h3>
          <p className="text-gray-600">إدارة ومتابعة الطلاب المسجلين في دورات المعلمين المخصصين لك</p>
        </div>
        <Button
          variant="outline"
          onClick={() => loadStudents(true)}
          className="border-purple-200 text-purple-700 hover:bg-purple-50 hover:border-purple-300 transition-all duration-200 shadow-sm"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          تحديث البيانات
        </Button>
      </div>

      {/* Students Grid */}
      {!Array.isArray(students) || students.length === 0 ? (
        <Card className="border border-gray-200 bg-gradient-to-br from-gray-50 to-white">
          <CardContent className="p-16 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-700 mb-3">لا يوجد طلاب</h3>
            <p className="text-gray-500 text-lg max-w-md mx-auto leading-relaxed">
              لم يتم تسجيل أي طلاب بعد في دورات المعلمين المخصصين لك. سيتم عرض الطلاب هنا بمجرد تسجيلهم في الدورات.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.isArray(students) && students.map((student, index) => (
            <Card 
              key={student.id} 
              className="group border border-gray-200 hover:border-purple-300 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br from-white to-purple-50/30"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-6">
                {/* Header with Avatar and Status */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <GraduationCap className="w-7 h-7 text-white" />
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full border-2 border-white flex items-center justify-center">
                        <Users className="w-3 h-3 text-purple-600" />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-gray-800 mb-1">{student.student_name}</h4>
                      <p className="text-sm text-gray-500">{student.student_email}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {getStatusBadge(student.status)}
                    {student.is_family_enrollment && (
                      <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold border border-blue-200">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        تسجيل عائلي
                      </div>
                    )}
                  </div>
                </div>

                {/* Student Details */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <BookOpen className="w-4 h-4 text-purple-500" />
                    <span className="font-medium">الدورة:</span>
                    <span className="text-gray-800">{student.course_title}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="w-4 h-4 text-blue-500" />
                    <span className="font-medium">المعلم:</span>
                    <span className="text-gray-800">{student.teacher_name}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4 text-blue-500" />
                    <span className="font-medium">تاريخ التسجيل:</span>
                    <span className="text-gray-800">{new Date(student.enrolled_at).toLocaleDateString('ar-SA')}</span>
                  </div>
                  
                  {student.approved_at && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="w-4 h-4 text-blue-500" />
                      <span className="font-medium">تم القبول:</span>
                      <span className="text-gray-800">{new Date(student.approved_at).toLocaleDateString('ar-SA')}</span>
                    </div>
                  )}
                </div>

                {/* Student Additional Info */}
                {(student.student_age || student.student_education_level || student.student_learning_goals) && (
                  <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-xl space-y-2 text-sm border border-purple-200/50 mb-4">
                    {student.student_age && (
                      <div>
                        <span className="font-semibold text-gray-800">العمر: </span>
                        <span className="text-gray-600">{student.student_age} سنة</span>
                      </div>
                    )}
                    {student.student_education_level && (
                      <div>
                        <span className="font-semibold text-gray-800">المستوى التعليمي: </span>
                        <span className="text-gray-600">{student.student_education_level}</span>
                      </div>
                    )}
                    {student.student_learning_goals && (
                      <div>
                        <span className="font-semibold text-gray-800">أهداف التعلم: </span>
                        <span className="text-gray-600">{student.student_learning_goals}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Family Enrollment Info */}
                {student.is_family_enrollment && student.family_representative && (
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-xl border border-blue-200/50 mb-4">
                    <div className="flex items-center gap-2 text-blue-800 text-sm">
                      <Users className="w-4 h-4" />
                      <span className="font-semibold">تسجيل عائلي - ممثل العائلة: {student.family_representative.name}</span>
                    </div>
                  </div>
                )}

                {/* Footer */}
                <div className="pt-4 border-t border-gray-200/50">
                  <div className="flex items-center justify-end text-xs text-gray-500">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        <span>نشط</span>
                      </div>
                      <span className="text-purple-600 font-medium">
                        {student.course_type_display}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeacherStudentsTab;
