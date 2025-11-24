'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, Clock, TrendingUp, Award, CheckCircle2, XCircle } from 'lucide-react';
import { getProxiedImageUrl } from '@/lib/imageUtils';

const API_BASE_URL = process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:8000/api';

interface StudentAttempt {
  id: string;
  student: string;
  student_name: string;
  knowledge_lab: string;
  knowledge_lab_title: string;
  attempt_type: string;
  attempt_type_display: string;
  score: string;
  points_earned: number;
  total_points: number;
  started_at: string;
  completed_at: string | null;
  time_taken: number;
}

interface StudentData {
  student_id: string;
  student_name: string;
  profile_image_url?: string;
  total_attempts: number;
  completed_attempts: number;
  total_points: number;
  average_score: number;
  last_activity: string | null;
}

interface StudentsTabProps {
  labId: string;
}

export function StudentsTab({ labId }: StudentsTabProps) {
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<StudentData[]>([]);

  useEffect(() => {
    fetchStudents();
  }, [labId]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        toast.error('يرجى تسجيل الدخول');
        setLoading(false);
        return;
      }

      // First, get lab details to check if it's linked to a course
      const labResponse = await fetch(
        `${API_BASE_URL}/knowledge-lab/labs/${labId}/`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      let courseId: string | null = null;
      if (labResponse.ok) {
        const labData = await labResponse.json();
        courseId = labData.object_id || null;
        console.log('📚 Lab data:', labData);
        console.log('📚 Course ID:', courseId);
      }

      // Get students from course enrollments if lab is linked to a course
      const studentsMap = new Map<string, StudentData>();
      
      if (courseId) {
        try {
          const enrollmentsResponse = await fetch(
            `${API_BASE_URL}/live-education/enrollments/?course=${courseId}&status=enrolled`,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            }
          );

          if (enrollmentsResponse.ok) {
            const enrollmentsData = await enrollmentsResponse.json();
            const enrollments = enrollmentsData.results || enrollmentsData;
            console.log('👥 Enrollments:', enrollments);

            enrollments.forEach((enrollment: any) => {
              const student = enrollment.student || enrollment.student_profile;
              if (student) {
                const studentId = student.id || student;
                const studentName = student.get_full_name || student.user?.get_full_name || student.first_name + ' ' + student.last_name || 'طالب';
                const profileImage = student.profile_image_url || student.user?.profile_image_url;
                
                if (!studentsMap.has(studentId)) {
                  studentsMap.set(studentId, {
                    student_id: studentId,
                    student_name: studentName,
                    profile_image_url: profileImage,
                    total_attempts: 0,
                    completed_attempts: 0,
                    total_points: 0,
                    average_score: 0,
                    last_activity: enrollment.enrolled_at || null,
                  });
                }
              }
            });
          }
        } catch (error) {
          console.error('Error fetching enrollments:', error);
        }
      }

      // Get attempts to enrich student data
      const attemptsResponse = await fetch(
        `${API_BASE_URL}/knowledge-lab/attempts/?knowledge_lab=${labId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (attemptsResponse.ok) {
        const attemptsData = await attemptsResponse.json();
        const attempts: StudentAttempt[] = attemptsData.results || [];
        console.log('📊 Attempts:', attempts);
        
        attempts.forEach((attempt) => {
          const studentId = attempt.student;
          
          if (!studentsMap.has(studentId)) {
            studentsMap.set(studentId, {
              student_id: studentId,
              student_name: attempt.student_name,
              total_attempts: 0,
              completed_attempts: 0,
              total_points: 0,
              average_score: 0,
              last_activity: null,
            });
          }
          
          const student = studentsMap.get(studentId)!;
          student.total_attempts += 1;
          
          if (attempt.completed_at) {
            student.completed_attempts += 1;
            student.total_points += attempt.points_earned || 0;
          }
          
          // Update last activity
          const attemptDate = new Date(attempt.started_at);
          if (!student.last_activity || attemptDate > new Date(student.last_activity)) {
            student.last_activity = attempt.started_at;
          }
        });
      }
      
      // Calculate average scores
      studentsMap.forEach((student) => {
        if (student.completed_attempts > 0) {
          student.average_score = student.total_points / student.completed_attempts;
        }
      });
      
      // Convert map to array and sort by last activity
      const studentsArray = Array.from(studentsMap.values()).sort((a, b) => {
        if (!a.last_activity) return 1;
        if (!b.last_activity) return -1;
        return new Date(b.last_activity).getTime() - new Date(a.last_activity).getTime();
      });
      
      console.log('✅ Final students array:', studentsArray);
      setStudents(studentsArray);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('حدث خطأ أثناء تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'لا يوجد نشاط';
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Card className="border-orange-100" dir="rtl">
        <CardHeader dir="rtl">
          <CardTitle>الطلاب المسجلين</CardTitle>
          <CardDescription>عرض وإدارة الطلاب المسجلين في المختبر</CardDescription>
        </CardHeader>
        <CardContent dir="rtl">
          <div className="flex flex-col items-center justify-center py-12">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mb-4"></div>
            </div>
            <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">جاري تحميل بيانات الطلاب...</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">يرجى الانتظار</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (students.length === 0) {
    return (
      <Card className="border-orange-100" dir="rtl">
        <CardHeader dir="rtl">
          <CardTitle>الطلاب المسجلين</CardTitle>
          <CardDescription>عرض وإدارة الطلاب المسجلين في المختبر</CardDescription>
        </CardHeader>
        <CardContent dir="rtl">
          <div className="text-center py-12 text-gray-500">
            <Users className="w-16 h-16 mx-auto mb-4 text-yellow-300" />
            <p className="text-lg font-semibold mb-2">لا يوجد طلاب مسجلين</p>
            <p className="text-sm">سيظهر الطلاب هنا بعد التسجيل في المختبر</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-orange-100" dir="rtl">
      <CardHeader dir="rtl">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>الطلاب المسجلين</CardTitle>
            <CardDescription>عرض وإدارة الطلاب المسجلين في المختبر</CardDescription>
          </div>
          <Badge className="bg-orange-500 text-white">
            {students.length} طالب
          </Badge>
        </div>
      </CardHeader>
      <CardContent dir="rtl">
        <div className="space-y-4">
          {students.map((student, index) => (
            <motion.div
              key={student.student_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-slate-800 border border-orange-200 dark:border-orange-800 rounded-xl p-6 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <Avatar className="w-14 h-14 ring-2 ring-orange-200 dark:ring-orange-800 shadow-md">
                    <AvatarImage 
                      src={student.profile_image_url ? getProxiedImageUrl(student.profile_image_url, false) : undefined}
                      alt={student.student_name}
                    />
                    <AvatarFallback className="bg-gradient-to-br from-orange-500 to-amber-500 text-white text-lg font-semibold">
                      {student.student_name?.charAt(0) || 'ط'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                      {student.student_name}
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-orange-500" />
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">المحاولات</p>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {student.total_attempts}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-blue-500" />
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">مكتملة</p>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {student.completed_attempts}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-amber-500" />
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">النقاط</p>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {student.total_points}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-blue-500" />
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">آخر نشاط</p>
                          <p className="text-xs font-semibold text-gray-900 dark:text-white">
                            {formatDate(student.last_activity)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {student.average_score > 0 && (
                    <Badge 
                      className={`${
                        student.average_score >= 80 
                          ? 'bg-blue-500' 
                          : student.average_score >= 60 
                          ? 'bg-yellow-500' 
                          : 'bg-red-500'
                      } text-white`}
                    >
                      {student.average_score.toFixed(1)}%
                    </Badge>
                  )}
                  <Badge variant="outline" className="border-orange-300 text-orange-700">
                    {student.completed_attempts}/{student.total_attempts} مكتملة
                  </Badge>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

