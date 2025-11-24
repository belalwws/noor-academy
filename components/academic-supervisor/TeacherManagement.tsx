'use client';

import React, { useState } from 'react';
import { 
  Search, Filter, MoreVertical, Eye, Edit, 
  Star, Users, BookOpen, Calendar, CheckCircle,
  AlertTriangle, Clock, Award
} from 'lucide-react';

interface Teacher {
  id: string;
  name: string;
  email: string;
  specialization: string;
  coursesCount: number;
  studentsCount: number;
  rating: number;
  status: 'active' | 'inactive' | 'pending';
  lastActivity: string;
  joinDate: string;
  performance: number;
}

interface TeacherManagementProps {
  teachers: Teacher[];
  onViewTeacher: (teacherId: string) => void;
  onEditTeacher: (teacherId: string) => void;
}

const TeacherManagement: React.FC<TeacherManagementProps> = ({
  teachers,
  onViewTeacher,
  onEditTeacher
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'pending'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'rating' | 'performance' | 'joinDate'>('name');

  const filteredTeachers = teachers.filter(teacher => {
    const matchesSearch = teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         teacher.specialization.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || teacher.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const sortedTeachers = [...filteredTeachers].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'rating':
        return b.rating - a.rating;
      case 'performance':
        return b.performance - a.performance;
      case 'joinDate':
        return new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime();
      default:
        return 0;
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
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
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-900">إدارة المعلمين</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">
            إجمالي المعلمين: {teachers.length}
          </span>
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
                placeholder="البحث عن معلم..."
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
              <option value="name">الاسم</option>
              <option value="rating">التقييم</option>
              <option value="performance">الأداء</option>
              <option value="joinDate">تاريخ الانضمام</option>
            </select>
          </div>
        </div>
      </div>

      {/* Teachers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedTeachers.map((teacher) => (
          <div key={teacher.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                  {teacher.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{teacher.name}</h3>
                  <p className="text-sm text-gray-600">{teacher.specialization}</p>
                </div>
              </div>
              
              <div className="relative">
                <button className="p-1 hover:bg-gray-100 rounded-full">
                  <MoreVertical className="h-5 w-5 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Status */}
            <div className="mb-4">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(teacher.status)}`}>
                {getStatusText(teacher.status)}
              </span>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <BookOpen className="h-4 w-4 text-blue-600 ml-1" />
                  <span className="text-sm text-gray-600">الدورات</span>
                </div>
                <p className="font-bold text-blue-600">{teacher.coursesCount}</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <Users className="h-4 w-4 text-blue-600 ml-1" />
                  <span className="text-sm text-gray-600">الطلاب</span>
                </div>
                <p className="font-bold text-blue-600">{teacher.studentsCount}</p>
              </div>
            </div>

            {/* Rating */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Star className="h-4 w-4 text-yellow-500 ml-1" />
                <span className="text-sm text-gray-600">التقييم</span>
              </div>
              <span className="font-bold text-yellow-600">{teacher.rating}/5</span>
            </div>

            {/* Performance Bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-600">الأداء</span>
                <span className="text-sm font-medium text-gray-900">{teacher.performance}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-blue-500 h-2 rounded-full" 
                  style={{ width: `${teacher.performance}%` }}
                ></div>
              </div>
            </div>

            {/* Last Activity */}
            <div className="flex items-center mb-4">
              <Clock className="h-4 w-4 text-gray-400 ml-1" />
              <span className="text-xs text-gray-500">آخر نشاط: {teacher.lastActivity}</span>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => onViewTeacher(teacher.id)}
                className="flex-1 bg-blue-50 text-blue-600 py-2 px-3 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center text-sm"
              >
                <Eye className="h-4 w-4 ml-1" />
                عرض
              </button>
              <button
                onClick={() => onEditTeacher(teacher.id)}
                className="flex-1 bg-blue-50 text-blue-600 py-2 px-3 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center text-sm"
              >
                <Edit className="h-4 w-4 ml-1" />
                تحرير
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {sortedTeachers.length === 0 && (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد معلمين</h3>
          <p className="text-gray-600">
            {searchTerm || filterStatus !== 'all' 
              ? 'لم يتم العثور على معلمين يطابقون معايير البحث'
              : 'لم يتم تعيين أي معلمين بعد'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default TeacherManagement;
