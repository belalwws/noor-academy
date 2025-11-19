'use client';

import React from 'react';
import { 
  Users, BookOpen, TrendingUp, Calendar, Clock, 
  CheckCircle, AlertCircle, Star, Award, FileText 
} from 'lucide-react';

interface DashboardStats {
  totalTeachers: number;
  activeCourses: number;
  completedEvaluations: number;
  pendingReviews: number;
  averageRating: number;
  monthlyProgress: number;
}

interface SupervisorDashboardProps {
  stats: DashboardStats;
}

const SupervisorDashboard: React.FC<SupervisorDashboardProps> = ({ stats }) => {
  return (
    <div className="space-y-6">
      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">المعلمين المشرف عليهم</p>
              <p className="text-3xl font-bold text-blue-600">{stats.totalTeachers}</p>
              <p className="text-xs text-green-600 mt-1">+2 هذا الشهر</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">الدورات النشطة</p>
              <p className="text-3xl font-bold text-green-600">{stats.activeCourses}</p>
              <p className="text-xs text-green-600 mt-1">+5 هذا الأسبوع</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <BookOpen className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">التقييمات المكتملة</p>
              <p className="text-3xl font-bold text-purple-600">{stats.completedEvaluations}</p>
              <p className="text-xs text-green-600 mt-1">+12 هذا الأسبوع</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <CheckCircle className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="ml-2" size={20} />
            مؤشرات الأداء
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">متوسط تقييم المعلمين</span>
              <div className="flex items-center">
                <Star className="h-4 w-4 text-yellow-500 ml-1" />
                <span className="font-bold text-yellow-600">{stats.averageRating}/5</span>
              </div>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-yellow-500 h-2 rounded-full" 
                style={{ width: `${(stats.averageRating / 5) * 100}%` }}
              ></div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">التقدم الشهري</span>
              <span className="font-bold text-green-600">{stats.monthlyProgress}%</span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full" 
                style={{ width: `${stats.monthlyProgress}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <Calendar className="ml-2" size={20} />
            المهام المعلقة
          </h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-yellow-600 ml-2" />
                <span className="text-sm text-gray-700">مراجعات معلقة</span>
              </div>
              <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                {stats.pendingReviews}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center">
                <FileText className="h-5 w-5 text-blue-600 ml-2" />
                <span className="text-sm text-gray-700">تقارير شهرية</span>
              </div>
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                3
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <Award className="h-5 w-5 text-green-600 ml-2" />
                <span className="text-sm text-gray-700">تقييمات دورية</span>
              </div>
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                7
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
          <Clock className="ml-2" size={20} />
          النشاطات الأخيرة
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-start space-x-3 space-x-reverse">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-900">تم إكمال تقييم المعلم أحمد محمد</p>
              <p className="text-xs text-gray-500">منذ ساعتين</p>
            </div>
          </div>

          <div className="flex items-start space-x-3 space-x-reverse">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <FileText className="h-4 w-4 text-blue-600" />
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-900">تم رفع التقرير الشهري لقسم اللغة العربية</p>
              <p className="text-xs text-gray-500">منذ 4 ساعات</p>
            </div>
          </div>

          <div className="flex items-start space-x-3 space-x-reverse">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-900">مراجعة مطلوبة لدورة أساسيات النحو</p>
              <p className="text-xs text-gray-500">منذ يوم واحد</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupervisorDashboard;
