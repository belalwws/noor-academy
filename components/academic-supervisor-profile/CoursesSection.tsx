import React, { useState, useEffect } from 'react';
import { BookOpen, Search, Filter, CheckCircle, Clock, X, User, Calendar, Users } from 'lucide-react';
import { AcademicSupervisorProfileAPI, Course } from '@/lib/api/academic-supervisor-profile';
import { toast } from 'sonner';

export const CoursesSection: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const data = await AcademicSupervisorProfileAPI.getTeacherCourses();
      setCourses(data);
    } catch (error) {
      console.error('Failed to load courses:', error);
      toast.error('فشل في تحميل بيانات الدورات');
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.teacher_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.subjects.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || course.approval_status === statusFilter;
    const matchesType = typeFilter === 'all' || course.course_type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-blue-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'rejected':
        return <X className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'individual':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'group':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'family':
        return 'bg-pink-100 text-pink-800 border-pink-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">جاري تحميل بيانات الدورات...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
      <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
        <div className="p-2 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg">
          <BookOpen className="w-5 h-5 text-white" />
        </div>
        الدورات تحت الإشراف ({filteredCourses.length})
      </h3>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="البحث في الدورات..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
          >
            <option value="all">جميع الحالات</option>
            <option value="approved">معتمدة</option>
            <option value="pending">قيد المراجعة</option>
            <option value="rejected">مرفوضة</option>
          </select>
        </div>
        <div className="relative">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="pl-4 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
          >
            <option value="all">جميع الأنواع</option>
            <option value="individual">فردية</option>
            <option value="group">جماعية</option>
            <option value="family">عائلية</option>
          </select>
        </div>
      </div>

      {/* Courses List */}
      {filteredCourses.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg mb-2">لا توجد دورات</p>
          <p className="text-gray-400">لم يتم العثور على دورات مطابقة للبحث</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredCourses.map((course) => (
            <div key={course.id} className="bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-200">
              {/* Course Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">{course.title}</h4>
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(course.approval_status)}`}>
                      {getStatusIcon(course.approval_status)}
                      {course.approval_status_display}
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getTypeColor(course.course_type)}`}>
                      {course.course_type_display}
                    </div>
                  </div>
                </div>
              </div>

              {/* Course Details */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <User className="w-4 h-4" />
                  <span>المعلم: {course.teacher_name}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="w-4 h-4" />
                  <span>المسجلون: {course.enrolled_count} / {course.max_students}</span>
                </div>

                <div>
                  <p className="text-xs text-gray-500 mb-1">المواد</p>
                  <p className="text-sm text-gray-900 line-clamp-2">{course.subjects}</p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 mb-1">الوصف</p>
                  <p className="text-sm text-gray-900 line-clamp-3">{course.description}</p>
                </div>

                {course.approved_at && (
                  <div className="flex items-center gap-1 text-xs text-gray-500 pt-2 border-t border-gray-200">
                    <Calendar className="w-3 h-3" />
                    تم الاعتماد: {new Date(course.approved_at).toLocaleDateString('ar-SA')}
                    {course.approved_by_name && <span> بواسطة {course.approved_by_name}</span>}
                  </div>
                )}

                {course.rejection_reason && (
                  <div className="text-xs text-red-600 pt-2 border-t border-red-200">
                    <p className="font-medium">سبب الرفض:</p>
                    <p>{course.rejection_reason}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Refresh Button */}
      <div className="mt-6 text-center">
        <button
          onClick={loadCourses}
          disabled={loading}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'جاري التحديث...' : 'تحديث البيانات'}
        </button>
      </div>
    </div>
  );
};
