'use client';

import React, { useState } from 'react';
import { 
  Search, Filter, BookOpen, Users, Calendar, 
  Clock, Star, TrendingUp, AlertCircle, CheckCircle,
  Play, Pause, Eye, Edit, BarChart3
} from 'lucide-react';

interface Course {
  id: string;
  title: string;
  description: string;
  teacher: string;
  teacherId: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  status: 'active' | 'inactive' | 'pending' | 'completed';
  studentsCount: number;
  lessonsCount: number;
  duration: string;
  rating: number;
  progress: number;
  startDate: string;
  endDate: string;
  lastUpdated: string;
}

interface CourseManagementProps {
  courses: Course[];
  onViewCourse: (courseId: string) => void;
  onEditCourse: (courseId: string) => void;
  onToggleCourseStatus: (courseId: string) => void;
}

const CourseManagement: React.FC<CourseManagementProps> = ({
  courses,
  onViewCourse,
  onEditCourse,
  onToggleCourseStatus
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'pending' | 'completed'>('all');
  const [filterLevel, setFilterLevel] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');
  const [sortBy, setSortBy] = useState<'title' | 'rating' | 'students' | 'progress' | 'startDate'>('title');

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.teacher.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || course.status === filterStatus;
    const matchesLevel = filterLevel === 'all' || course.level === filterLevel;
    
    return matchesSearch && matchesStatus && matchesLevel;
  });

  const sortedCourses = [...filteredCourses].sort((a, b) => {
    switch (sortBy) {
      case 'title':
        return a.title.localeCompare(b.title);
      case 'rating':
        return b.rating - a.rating;
      case 'students':
        return b.studentsCount - a.studentsCount;
      case 'progress':
        return b.progress - a.progress;
      case 'startDate':
        return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
      default:
        return 0;
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'نشط';
      case 'inactive':
        return 'غير نشط';
      case 'pending':
        return 'في الانتظار';
      case 'completed':
        return 'مكتمل';
      default:
        return status;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getLevelText = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'مبتدئ';
      case 'intermediate':
        return 'متوسط';
      case 'advanced':
        return 'متقدم';
      default:
        return level;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-900">إدارة الدورات</h2>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600">
            إجمالي الدورات: {courses.length}
          </div>
          <div className="text-sm text-gray-600">
            النشطة: {courses.filter(c => c.status === 'active').length}
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="البحث عن دورة..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">جميع الحالات</option>
              <option value="active">نشط</option>
              <option value="inactive">غير نشط</option>
              <option value="pending">في الانتظار</option>
              <option value="completed">مكتمل</option>
            </select>
          </div>

          {/* Level Filter */}
          <div className="flex items-center gap-2">
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">جميع المستويات</option>
              <option value="beginner">مبتدئ</option>
              <option value="intermediate">متوسط</option>
              <option value="advanced">متقدم</option>
            </select>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">ترتيب حسب:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="title">العنوان</option>
              <option value="rating">التقييم</option>
              <option value="students">عدد الطلاب</option>
              <option value="progress">التقدم</option>
              <option value="startDate">تاريخ البداية</option>
            </select>
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {sortedCourses.map((course) => (
          <div key={course.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
            {/* Header */}
            <div className="p-6 pb-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 mb-1 line-clamp-2">{course.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">المعلم: {course.teacher}</p>
                  <p className="text-xs text-gray-500 line-clamp-2">{course.description}</p>
                </div>
              </div>

              {/* Status and Level */}
              <div className="flex items-center gap-2 mb-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(course.status)}`}>
                  {getStatusText(course.status)}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(course.level)}`}>
                  {getLevelText(course.level)}
                </span>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center p-2 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-center mb-1">
                    <Users className="h-4 w-4 text-blue-600 ml-1" />
                    <span className="text-xs text-gray-600">الطلاب</span>
                  </div>
                  <p className="font-bold text-blue-600">{course.studentsCount}</p>
                </div>
                
                <div className="text-center p-2 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-center mb-1">
                    <BookOpen className="h-4 w-4 text-green-600 ml-1" />
                    <span className="text-xs text-gray-600">الدروس</span>
                  </div>
                  <p className="font-bold text-green-600">{course.lessonsCount}</p>
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-500 ml-1" />
                  <span className="text-sm text-gray-600">التقييم</span>
                </div>
                <span className="font-bold text-yellow-600">{course.rating}/5</span>
              </div>

              {/* Progress */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600">التقدم</span>
                  <span className="text-sm font-medium text-gray-900">{course.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full" 
                    style={{ width: `${course.progress}%` }}
                  ></div>
                </div>
              </div>

              {/* Duration and Dates */}
              <div className="text-xs text-gray-500 mb-4 space-y-1">
                <div className="flex items-center">
                  <Clock className="h-3 w-3 ml-1" />
                  <span>المدة: {course.duration}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-3 w-3 ml-1" />
                  <span>البداية: {new Date(course.startDate).toLocaleDateString('ar-EG')}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="px-6 pb-6">
              <div className="flex gap-2">
                <button
                  onClick={() => onViewCourse(course.id)}
                  className="flex-1 bg-blue-50 text-blue-600 py-2 px-3 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center text-sm"
                >
                  <Eye className="h-4 w-4 ml-1" />
                  عرض
                </button>
                <button
                  onClick={() => onEditCourse(course.id)}
                  className="flex-1 bg-green-50 text-green-600 py-2 px-3 rounded-lg hover:bg-green-100 transition-colors flex items-center justify-center text-sm"
                >
                  <Edit className="h-4 w-4 ml-1" />
                  تحرير
                </button>
                <button
                  onClick={() => onToggleCourseStatus(course.id)}
                  className={`flex-1 py-2 px-3 rounded-lg transition-colors flex items-center justify-center text-sm ${
                    course.status === 'active' 
                      ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                      : 'bg-green-50 text-green-600 hover:bg-green-100'
                  }`}
                >
                  {course.status === 'active' ? (
                    <>
                      <Pause className="h-4 w-4 ml-1" />
                      إيقاف
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 ml-1" />
                      تفعيل
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {sortedCourses.length === 0 && (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد دورات</h3>
          <p className="text-gray-600">
            {searchTerm || filterStatus !== 'all' || filterLevel !== 'all'
              ? 'لم يتم العثور على دورات تطابق معايير البحث'
              : 'لم يتم إنشاء أي دورات بعد'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default CourseManagement;
