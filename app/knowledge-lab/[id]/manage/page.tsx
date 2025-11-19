'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { 
  FlaskConical, Plus, ArrowLeft, Settings, BarChart3,
  Users, BookOpen, FileQuestion, TrendingUp
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProtectedRoute from '@/components/ProtectedRoute';
import { QuestionsTab } from '../../components/QuestionsTab';
import { ExercisesTab } from '../../components/ExercisesTab';
import { StudentsTab } from '../../components/StudentsTab';
import { AnalyticsTab } from '../../components/AnalyticsTab';

const API_BASE_URL = process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:8000/api';

interface KnowledgeLab {
  id: string;
  title: string;
  description: string;
  thumbnail: string | null;
  cover_image: string | null;
  objective: string;
  topics: string;
  is_standalone: boolean;
  content_type: number | null;
  object_id: string | null; // This is the course ID
  course_title: string | null;
  country: string | null;
  subject: string | null;
  academic_year: string | null;
  price: string | null;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

const KnowledgeLabManagePage = () => {
  const params = useParams();
  const router = useRouter();
  const labId = params['id'] as string;

  const [loading, setLoading] = useState(true);
  const [lab, setLab] = useState<KnowledgeLab | null>(null);
  const [stats, setStats] = useState({
    questionsCount: 0,
    exercisesCount: 0,
    studentsCount: 0,
    attemptsCount: 0,
  });

  useEffect(() => {
    fetchLabDetails();
    fetchStats();
  }, [labId]);

  const fetchLabDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        toast.error('يرجى تسجيل الدخول');
        router.push('/login');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/knowledge-lab/labs/${labId}/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('📦 Lab data:', data);
        console.log('📚 Object ID (Course ID):', data.object_id);
        console.log('📚 Content Type:', data.content_type);
        console.log('📚 Course Title:', data.course_title);
        setLab(data);
      } else {
        toast.error('فشل في تحميل بيانات المختبر');
        router.push('/dashboard/teacher');
      }
    } catch (error) {
      console.error('Error fetching lab:', error);
      toast.error('حدث خطأ أثناء تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        return;
      }

      // Fetch questions count
      const questionsResponse = await fetch(
        `${API_BASE_URL}/knowledge-lab/questions/?knowledge_lab=${labId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      let questionsCount = 0;
      if (questionsResponse.ok) {
        const questionsData = await questionsResponse.json();
        questionsCount = questionsData.count || questionsData.results?.length || 0;
      }

      // Fetch exercises count
      const exercisesResponse = await fetch(
        `${API_BASE_URL}/knowledge-lab/lesson-exercises/?knowledge_lab=${labId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      let exercisesCount = 0;
      if (exercisesResponse.ok) {
        const exercisesData = await exercisesResponse.json();
        exercisesCount = exercisesData.count || exercisesData.results?.length || 0;
      }

      // Fetch attempts count
      const attemptsResponse = await fetch(
        `${API_BASE_URL}/knowledge-lab/attempts/?knowledge_lab=${labId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      let attemptsCount = 0;
      let studentsCount = 0;
      if (attemptsResponse.ok) {
        const attemptsData = await attemptsResponse.json();
        attemptsCount = attemptsData.count || attemptsData.results?.length || 0;
        
        // Get unique students from attempts
        if (attemptsData.results && Array.isArray(attemptsData.results)) {
          const uniqueStudents = new Set(
            attemptsData.results.map((attempt: any) => attempt.student || attempt.student_id)
          );
          studentsCount = uniqueStudents.size;
        }
      }

      setStats({
        questionsCount,
        exercisesCount,
        studentsCount,
        attemptsCount,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500">مُعتمد</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500">قيد المراجعة</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500">مرفوض</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-amber-50">
        <div className="text-center">
          <div className="animate-spin w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600">جاري تحميل المختبر...</p>
        </div>
      </div>
    );
  }

  if (!lab) {
    return null;
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 py-8 px-4 pt-24" dir="rtl">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-4 mb-4">
              <Button
                variant="outline"
                onClick={() => router.push('/dashboard/teacher')}
                className="border-orange-200 hover:bg-orange-50"
              >
                <ArrowLeft className="w-4 h-4 ml-2" />
                العودة
              </Button>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <FlaskConical className="w-8 h-8 text-orange-600" />
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 bg-clip-text text-transparent">
                    {lab.title}
                  </h1>
                  {getStatusBadge(lab.status)}
                </div>
                <p className="text-gray-600">{lab.description}</p>
              </div>
              <Button className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white">
                <Settings className="w-4 h-4 ml-2" />
                إعدادات المختبر
              </Button>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8" dir="rtl">
            <Card className="border-orange-100" dir="rtl">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">إجمالي الأسئلة</p>
                    <p className="text-2xl font-bold text-orange-600">{stats.questionsCount}</p>
                  </div>
                  <FileQuestion className="w-8 h-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-orange-100" dir="rtl">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">التمارين</p>
                    <p className="text-2xl font-bold text-amber-600">{stats.exercisesCount}</p>
                  </div>
                  <BookOpen className="w-8 h-8 text-amber-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-orange-100" dir="rtl">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">الطلاب</p>
                    <p className="text-2xl font-bold text-yellow-600">{stats.studentsCount}</p>
                  </div>
                  <Users className="w-8 h-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-orange-100" dir="rtl">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">المحاولات</p>
                    <p className="text-2xl font-bold text-orange-600">{stats.attemptsCount}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Tabs defaultValue="questions" className="w-full" dir="rtl">
            <div className="mb-6">
              <TabsList className="inline-flex h-12 items-center justify-center rounded-xl bg-orange-50 p-1.5 text-orange-900 shadow-lg border border-orange-200" dir="rtl">
                <TabsTrigger 
                  value="questions" 
                  dir="rtl"
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-lg px-6 py-2.5 text-sm font-semibold ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-500 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=inactive]:text-orange-700 data-[state=inactive]:hover:bg-orange-100 data-[state=inactive]:hover:text-orange-900"
                >
                  <FileQuestion className="w-4 h-4 ml-2" />
                  بنك الأسئلة
                </TabsTrigger>
                <TabsTrigger 
                  value="exercises" 
                  dir="rtl"
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-lg px-6 py-2.5 text-sm font-semibold ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-500 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=inactive]:text-orange-700 data-[state=inactive]:hover:bg-orange-100 data-[state=inactive]:hover:text-orange-900"
                >
                  <BookOpen className="w-4 h-4 ml-2" />
                  التمارين
                </TabsTrigger>
                <TabsTrigger 
                  value="students" 
                  dir="rtl"
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-lg px-6 py-2.5 text-sm font-semibold ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-500 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=inactive]:text-orange-700 data-[state=inactive]:hover:bg-orange-100 data-[state=inactive]:hover:text-orange-900"
                >
                  <Users className="w-4 h-4 ml-2" />
                  الطلاب
                </TabsTrigger>
                <TabsTrigger 
                  value="analytics" 
                  dir="rtl"
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-lg px-6 py-2.5 text-sm font-semibold ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-500 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=inactive]:text-orange-700 data-[state=inactive]:hover:bg-orange-100 data-[state=inactive]:hover:text-orange-900"
                >
                  <BarChart3 className="w-4 h-4 ml-2" />
                  التحليلات
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="questions" className="mt-6" dir="rtl">
              <QuestionsTab labId={labId} />
            </TabsContent>

            <TabsContent value="exercises" className="mt-6" dir="rtl">
              <ExercisesTab 
                labId={labId} 
                courseId={lab?.object_id || undefined} 
              />
            </TabsContent>

            <TabsContent value="students" className="mt-6" dir="rtl">
              <StudentsTab labId={labId} />
            </TabsContent>

            <TabsContent value="analytics" className="mt-6" dir="rtl">
              <AnalyticsTab labId={labId} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default KnowledgeLabManagePage;
