'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart3, TrendingUp, Users, Award, Clock, Target, CheckCircle2, XCircle } from 'lucide-react';

const API_BASE_URL = process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:8000/api';

interface StudentAttempt {
  id: string;
  student: string;
  student_name: string;
  attempt_type: string;
  attempt_type_display: string;
  score: string;
  points_earned: number;
  total_points: number;
  started_at: string;
  completed_at: string | null;
  time_taken: number;
}

interface AnalyticsData {
  totalStudents: number;
  totalAttempts: number;
  completedAttempts: number;
  averageScore: number;
  totalPoints: number;
  averageTime: number;
  completionRate: number;
  attemptsByType: Record<string, number>;
  topStudents: Array<{
    student_id: string;
    student_name: string;
    total_points: number;
    average_score: number;
    completed_attempts: number;
  }>;
}

interface AnalyticsTabProps {
  labId: string;
}

export function AnalyticsTab({ labId }: AnalyticsTabProps) {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, [labId]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        toast.error('يرجى تسجيل الدخول');
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/knowledge-lab/attempts/?knowledge_lab=${labId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        const attempts: StudentAttempt[] = data.results || [];
        
        // Calculate analytics
        const uniqueStudents = new Set(attempts.map(a => a.student));
        const completedAttempts = attempts.filter(a => a.completed_at !== null);
        
        const totalPoints = completedAttempts.reduce((sum, a) => sum + (a.points_earned || 0), 0);
        const totalTime = completedAttempts.reduce((sum, a) => sum + (a.time_taken || 0), 0);
        
        const scores = completedAttempts
          .map(a => parseFloat(a.score || '0'))
          .filter(s => s > 0);
        const averageScore = scores.length > 0 
          ? scores.reduce((sum, s) => sum + s, 0) / scores.length 
          : 0;
        
        // Group attempts by type
        const attemptsByType: Record<string, number> = {};
        attempts.forEach(attempt => {
          const type = attempt.attempt_type_display || attempt.attempt_type;
          attemptsByType[type] = (attemptsByType[type] || 0) + 1;
        });
        
        // Calculate top students
        const studentStats = new Map<string, {
          student_id: string;
          student_name: string;
          total_points: number;
          scores: number[];
          completed_attempts: number;
        }>();
        
        completedAttempts.forEach(attempt => {
          if (!studentStats.has(attempt.student)) {
            studentStats.set(attempt.student, {
              student_id: attempt.student,
              student_name: attempt.student_name,
              total_points: 0,
              scores: [],
              completed_attempts: 0,
            });
          }
          
          const stats = studentStats.get(attempt.student)!;
          stats.total_points += attempt.points_earned || 0;
          stats.completed_attempts += 1;
          const score = parseFloat(attempt.score || '0');
          if (score > 0) {
            stats.scores.push(score);
          }
        });
        
        const topStudents = Array.from(studentStats.values())
          .map(stats => ({
            student_id: stats.student_id,
            student_name: stats.student_name,
            total_points: stats.total_points,
            average_score: stats.scores.length > 0
              ? stats.scores.reduce((sum, s) => sum + s, 0) / stats.scores.length
              : 0,
            completed_attempts: stats.completed_attempts,
          }))
          .sort((a, b) => b.total_points - a.total_points)
          .slice(0, 5);
        
        setAnalytics({
          totalStudents: uniqueStudents.size,
          totalAttempts: attempts.length,
          completedAttempts: completedAttempts.length,
          averageScore,
          totalPoints,
          averageTime: completedAttempts.length > 0 ? totalTime / completedAttempts.length : 0,
          completionRate: attempts.length > 0 
            ? (completedAttempts.length / attempts.length) * 100 
            : 0,
          attemptsByType,
          topStudents,
        });
      } else {
        toast.error('فشل في تحميل بيانات التحليلات');
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('حدث خطأ أثناء تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${Math.round(seconds)} ثانية`;
    const minutes = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return `${minutes} دقيقة ${secs} ثانية`;
  };

  if (loading) {
    return (
      <Card className="border-orange-100" dir="rtl">
        <CardHeader dir="rtl">
          <CardTitle>التحليلات والإحصائيات</CardTitle>
          <CardDescription>تتبع أداء الطلاب والتمارين</CardDescription>
        </CardHeader>
        <CardContent dir="rtl">
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analytics || analytics.totalAttempts === 0) {
    return (
      <Card className="border-orange-100" dir="rtl">
        <CardHeader dir="rtl">
          <CardTitle>التحليلات والإحصائيات</CardTitle>
          <CardDescription>تتبع أداء الطلاب والتمارين</CardDescription>
        </CardHeader>
        <CardContent dir="rtl">
          <div className="text-center py-12 text-gray-500">
            <BarChart3 className="w-16 h-16 mx-auto mb-4 text-orange-300" />
            <p className="text-lg font-semibold mb-2">لا توجد بيانات تحليلية</p>
            <p className="text-sm">ستظهر الإحصائيات بعد بدء الطلاب بحل التمارين</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-orange-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">إجمالي الطلاب</p>
                <p className="text-2xl font-bold text-orange-600">{analytics.totalStudents}</p>
              </div>
              <Users className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">إجمالي المحاولات</p>
                <p className="text-2xl font-bold text-amber-600">{analytics.totalAttempts}</p>
              </div>
              <Target className="w-8 h-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">متوسط الدرجة</p>
                <p className="text-2xl font-bold text-green-600">
                  {analytics.averageScore.toFixed(1)}%
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">معدل الإتمام</p>
                <p className="text-2xl font-bold text-blue-600">
                  {analytics.completionRate.toFixed(1)}%
                </p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-orange-100">
          <CardHeader dir="rtl">
            <CardTitle>إحصائيات عامة</CardTitle>
          </CardHeader>
          <CardContent dir="rtl" className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
              <div className="flex items-center gap-3">
                <Award className="w-5 h-5 text-amber-500" />
                <span className="text-gray-700 dark:text-gray-300">إجمالي النقاط</span>
              </div>
              <span className="text-lg font-bold text-amber-600">{analytics.totalPoints}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span className="text-gray-700 dark:text-gray-300">المحاولات المكتملة</span>
              </div>
              <span className="text-lg font-bold text-green-600">{analytics.completedAttempts}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-blue-500" />
                <span className="text-gray-700 dark:text-gray-300">متوسط الوقت</span>
              </div>
              <span className="text-lg font-bold text-blue-600">
                {formatTime(analytics.averageTime)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-100">
          <CardHeader dir="rtl">
            <CardTitle>المحاولات حسب النوع</CardTitle>
          </CardHeader>
          <CardContent dir="rtl" className="space-y-3">
            {Object.entries(analytics.attemptsByType).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="text-gray-700 dark:text-gray-300">{type}</span>
                <Badge className="bg-orange-500 text-white">{count}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Top Students */}
      {analytics.topStudents.length > 0 && (
        <Card className="border-orange-100">
          <CardHeader dir="rtl">
            <CardTitle>أفضل الطلاب</CardTitle>
            <CardDescription>الطلاب الأكثر تفوقاً في المختبر</CardDescription>
          </CardHeader>
          <CardContent dir="rtl">
            <div className="space-y-3">
              {analytics.topStudents.map((student, index) => (
                <motion.div
                  key={student.student_id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 rounded-lg border border-orange-200 dark:border-orange-800"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                      index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-amber-600' : 'bg-orange-500'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {student.student_name}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {student.completed_attempts} محاولة مكتملة
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-gray-600 dark:text-gray-400">النقاط</p>
                      <p className="text-lg font-bold text-orange-600">{student.total_points}</p>
                    </div>
                    <Badge className={`${
                      student.average_score >= 80 
                        ? 'bg-green-500' 
                        : student.average_score >= 60 
                        ? 'bg-yellow-500' 
                        : 'bg-red-500'
                    } text-white`}>
                      {student.average_score.toFixed(1)}%
                    </Badge>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

