'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  BookOpen,
  GraduationCap,
  UserCheck,
  TrendingUp,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  Sparkles,
  BarChart3,
  PieChart,
  Settings,
  Shield
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { adminService } from '@/lib/services/adminService';

interface SystemStats {
  total_users: number;
  active_users: number;
  users_by_role: Array<{ role: string; count: number }>;
  recent_activity: {
    new_users_24h: number;
    new_enrollments_24h: number;
  };
  system_health: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSystemStats();
  }, []);

  const fetchSystemStats = async () => {
    try {
      setLoading(true);
      const response = await adminService.getSystemOverview();

      if (response.success && response.data) {
        setStats(response.data);
      } else {
        setError(response.error || 'فشل في تحميل الإحصائيات');
      }
    } catch (err) {
      console.error('Error fetching admin stats:', err);
      setError('حدث خطأ أثناء تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const getRoleLabel = (role: string): string => {
    const roleLabels: { [key: string]: string } = {
      student: 'طلاب',
      teacher: 'معلمين',
      general_supervisor: 'مشرفين عامين',
      academic_supervisor: 'مشرفين أكاديميين',
      admin: 'مديرين'
    };
    return roleLabels[role] || role;
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'student':
        return <GraduationCap className="w-5 h-5" />;
      case 'teacher':
        return <BookOpen className="w-5 h-5" />;
      case 'general_supervisor':
      case 'academic_supervisor':
        return <UserCheck className="w-5 h-5" />;
      case 'admin':
        return <Shield className="w-5 h-5" />;
      default:
        return <Users className="w-5 h-5" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">جاري تحميل لوحة التحكم...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 pt-20 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">
              حدث خطأ
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">{error}</p>
            <Button onClick={fetchSystemStats}>
              إعادة المحاولة
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 pt-20">
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-br from-amber-200/20 to-orange-200/20 dark:from-amber-900/10 dark:to-orange-900/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-br from-purple-200/20 to-pink-200/20 dark:from-purple-900/10 dark:to-pink-900/10 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 dark:from-amber-600 dark:via-orange-700 dark:to-amber-800 rounded-3xl p-8 text-white shadow-2xl shadow-orange-500/20 dark:shadow-orange-900/40 relative overflow-hidden mb-8"
        >
          {/* Animated Sparkles */}
          <motion.div
            animate={{ rotate: [0, 360], scale: [1, 1.2, 1] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="absolute top-8 left-8"
          >
            <Sparkles className="w-6 h-6 text-amber-200 dark:text-amber-300" />
          </motion.div>
          <motion.div
            animate={{ rotate: [360, 0], scale: [1, 1.25, 1] }}
            transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}
            className="absolute bottom-8 right-8"
          >
            <Sparkles className="w-8 h-8 text-orange-200 dark:text-orange-300" />
          </motion.div>

          <div className="relative z-10">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="flex items-center gap-3 mb-4"
            >
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">لوحة تحكم المدير</h1>
                <p className="text-amber-100 dark:text-amber-200">نظام إدارة أكاديمية رُشد</p>
              </div>
            </motion.div>

            {/* System Health Badge */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex items-center gap-2"
            >
              <Badge className="bg-white/20 backdrop-blur-sm text-white border-0">
                <Activity className="w-3 h-3 mr-1" />
                حالة النظام: {stats?.system_health === 'healthy' ? 'ممتاز' : 'يحتاج مراجعة'}
              </Badge>
              <Badge className="bg-white/20 backdrop-blur-sm text-white border-0">
                <Clock className="w-3 h-3 mr-1" />
                آخر تحديث: الآن
              </Badge>
            </motion.div>
          </div>
        </motion.div>

        {/* Main Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Users */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 hover:shadow-2xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">إجمالي المستخدمين</p>
                  <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">
                    {stats?.total_users?.toLocaleString('ar-EG') || 0}
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                    +{stats?.recent_activity?.new_users_24h || 0} خلال 24 ساعة
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Active Users */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-0 shadow-xl bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 hover:shadow-2xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Activity className="w-6 h-6 text-white" />
                  </div>
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">المستخدمون النشطون</p>
                  <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">
                    {stats?.active_users?.toLocaleString('ar-EG') || 0}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                    {stats?.total_users ? Math.round((stats.active_users / stats.total_users) * 100) : 0}% من الإجمالي
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* New Enrollments */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 hover:shadow-2xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-purple-500" />
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">التسجيلات الجديدة</p>
                  <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">
                    {stats?.recent_activity?.new_enrollments_24h?.toLocaleString('ar-EG') || 0}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                    خلال 24 ساعة الأخيرة
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* System Health */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="border-0 shadow-xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 hover:shadow-2xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Settings className="w-6 h-6 text-white" />
                  </div>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">حالة النظام</p>
                  <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">
                    {stats?.system_health === 'healthy' ? '100%' : '85%'}
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                    جميع الأنظمة تعمل بكفاءة
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Users by Role */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-8"
        >
          <Card className="border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-slate-100">
                <PieChart className="w-5 h-5 text-amber-500" />
                توزيع المستخدمين حسب الدور
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {stats?.users_by_role?.map((roleData, index) => (
                  <motion.div
                    key={roleData.role}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                  >
                    <Card className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 border-0">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center text-white">
                            {getRoleIcon(roleData.role)}
                          </div>
                          <div className="text-right flex-1">
                            <p className="text-xs text-slate-600 dark:text-slate-400">
                              {getRoleLabel(roleData.role)}
                            </p>
                            <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                              {roleData.count?.toLocaleString('ar-EG') || 0}
                            </p>
                          </div>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-amber-500 to-orange-600 h-2 rounded-full transition-all duration-500"
                            style={{
                              width: `${stats?.total_users ? (roleData.count / stats.total_users) * 100 : 0}%`
                            }}
                          ></div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-slate-100">
                <BarChart3 className="w-5 h-5 text-amber-500" />
                إجراءات سريعة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
                  onClick={() => window.location.href = '/admin'}
                >
                  <Users className="w-4 h-4 mr-2" />
                  إدارة المستخدمين
                </Button>
                <Button
                  className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white"
                  onClick={() => window.location.href = '/admin'}
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  إدارة الدورات
                </Button>
                <Button
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white"
                  onClick={() => window.location.href = '/admin'}
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  التقارير والإحصائيات
                </Button>
                <Button
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white"
                  onClick={() => window.location.href = '/admin'}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  إعدادات النظام
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Info Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8"
        >
          <Card className="border-0 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-5 h-5 text-white" />
                </div>
                <div className="text-right flex-1">
                  <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-2">
                    للوصول إلى لوحة الإدارة الكاملة
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                    للوصول إلى جميع أدوات الإدارة المتقدمة، يمكنك استخدام لوحة تحكم Django Admin الكاملة.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => window.open(`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}/admin/`, '_blank')}
                  >
                    فتح لوحة Django Admin
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
