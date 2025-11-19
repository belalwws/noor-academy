"use client";

import React, { useEffect, useState } from "react";
import { academicSupervisorApi, type TeacherProfile } from "@/lib/api/academicSupervisor";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  RefreshCw,
  Users,
  BookOpen,
  Calendar,
  GraduationCap,
  Award,
  Clock,
} from "lucide-react";

const TeachersManagementTab: React.FC = () => {
  const [teachers, setTeachers] = useState<TeacherProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadTeachers = async (showRefreshToast = false) => {
    try {
      if (!showRefreshToast) {
        setIsLoading(true);
      }

      console.log('🔍 Loading assigned teachers...');
      const teachersData = await academicSupervisorApi.getAssignedTeachers();
      
      console.log('✅ Teachers loaded:', teachersData);
      console.log('🔍 Teachers data type:', typeof teachersData);
      console.log('🔍 Teachers is array:', Array.isArray(teachersData));
      console.log('🔍 Teachers length:', teachersData?.length);
      console.log('🔍 Teachers data structure:', JSON.stringify(teachersData, null, 2));
      
      // Handle different response structures
      let processedTeachers: TeacherProfile[] = [];
      if (Array.isArray(teachersData)) {
        processedTeachers = teachersData;
      } else if (teachersData && typeof teachersData === 'object') {
        const data = teachersData as any;
        // Check if data is nested in a property
        if (data.data && Array.isArray(data.data)) {
          processedTeachers = data.data;
        } else if (data.results && Array.isArray(data.results)) {
          processedTeachers = data.results;
        } else if (data.teachers && Array.isArray(data.teachers)) {
          processedTeachers = data.teachers;
        }
      }
      
      console.log('🔍 Processed teachers:', processedTeachers);
      console.log('🔍 Processed teachers length:', processedTeachers.length);
      
      setTeachers(processedTeachers);

      if (showRefreshToast) {
        toast.success('تم تحديث بيانات المعلمين بنجاح ✨');
      }
    } catch (err) {
      console.error('❌ Error loading teachers:', err);
      toast.error('حدث خطأ أثناء تحميل بيانات المعلمين');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTeachers();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <div className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold border border-green-200">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
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
      default:
        return (
          <div className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-semibold border border-gray-200">
            <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
            {status}
          </div>
        );
    }
  };

  const getSpecializationIcon = (specialization: string) => {
    switch (specialization) {
      case 'memorize_quran':
        return <BookOpen className="w-3 h-3 text-green-600" />;
      case 'arabic_language':
        return <GraduationCap className="w-3 h-3 text-blue-600" />;
      case 'islamic_studies':
        return <Award className="w-3 h-3 text-purple-600" />;
      default:
        return <BookOpen className="w-3 h-3 text-gray-600" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-emerald-700 font-medium">جارٍ تحميل بيانات المعلمين...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">إدارة المعلمين</h3>
          <p className="text-gray-600">إدارة ومتابعة حالة المعلمين المخصصين لك</p>
        </div>
        <Button
          variant="outline"
          onClick={() => loadTeachers(true)}
          className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300 transition-all duration-200 shadow-sm"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          تحديث البيانات
        </Button>
      </div>

      {/* Filters */}

      {/* Teachers Grid */}
      {!Array.isArray(teachers) || teachers.length === 0 ? (
        <Card className="border border-gray-200 bg-gradient-to-br from-gray-50 to-white">
          <CardContent className="p-16 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-700 mb-3">لا يوجد معلمين</h3>
            <p className="text-gray-500 text-lg max-w-md mx-auto leading-relaxed">
              لم يتم تخصيص أي معلمين لك بعد. سيتم عرض المعلمين هنا بمجرد تخصيصهم من قبل المشرف العام.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.isArray(teachers) && teachers.map((teacher, index) => (
            <Card 
              key={teacher.id} 
              className="group border border-gray-200 hover:border-emerald-300 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br from-white to-gray-50/30"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-6">
                {/* Header with Avatar and Status */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <Users className="w-7 h-7 text-white" />
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full border-2 border-white flex items-center justify-center">
                        {getSpecializationIcon(teacher.specialization)}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 mb-1">{teacher.user_name}</h3>
                      <p className="text-sm text-gray-500">{teacher.user_email}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {getStatusBadge(teacher.approval_status)}
                  </div>
                </div>

                {/* Teacher Details */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    {getSpecializationIcon(teacher.specialization)}
                    <span className="font-medium">التخصص:</span>
                    <span className="text-gray-800">{teacher.specialization_display}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Award className="w-4 h-4 text-amber-500" />
                    <span className="font-medium">الخبرة:</span>
                    <span className="text-gray-800">{teacher.years_of_experience} سنة</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4 text-blue-500" />
                    <span className="font-medium">انضم:</span>
                    <span className="text-gray-800">{new Date(teacher.created_at).toLocaleDateString('ar-SA')}</span>
                  </div>
                  
                  {teacher.approved_at && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4 text-green-500" />
                      <span className="font-medium">اعتمد:</span>
                      <span className="text-gray-800">{new Date(teacher.approved_at).toLocaleDateString('ar-SA')}</span>
                    </div>
                  )}
                </div>

                {/* Qualifications and Biography */}
                {(teacher.qualifications || teacher.biography) && (
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100/50 p-4 rounded-xl space-y-3 text-sm border border-gray-200/50">
                    {teacher.qualifications && (
                      <div>
                        <span className="font-semibold text-gray-800 block mb-1">المؤهلات:</span>
                        <span className="text-gray-600 leading-relaxed">{teacher.qualifications}</span>
                      </div>
                    )}
                    {teacher.biography && (
                      <div>
                        <span className="font-semibold text-gray-800 block mb-1">السيرة الذاتية:</span>
                        <span className="text-gray-600 leading-relaxed">{teacher.biography}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Footer with subtle gradient */}
                <div className="mt-4 pt-4 border-t border-gray-200/50">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>معلم #{teacher.id}</span>
                    <span className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                      نشط
                    </span>
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

export default TeachersManagementTab;
