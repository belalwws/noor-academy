'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, BookOpen, User } from 'lucide-react';

interface CourseCardProps {
  course: {
    id: string;
    title: string;
    description: string;
    teacher_name: string;
    price: number;
    duration: string;
    max_students: number;
    enrolled_count: number;
    rating: number;
    level: string;
    language: string;
    image?: string;
    is_live?: boolean;
    start_date?: string;
    end_date?: string;
    schedule?: string;
    lessons_count?: number; // عدد الدروس
    subjects?: string; // المواد
  };
  courseType: 'individual' | 'family' | 'private-group' | 'public-group';
  isEnrolled?: boolean;
}

const CourseCard: React.FC<CourseCardProps> = ({ 
  course, 
  courseType, 
  isEnrolled = false 
}) => {

  // Check if course is full
  const isFull = course.enrolled_count >= course.max_students;

  // Helper function to format description
  const formatDescription = (description: string) => {
    // Handle different types of empty values
    if (!description || 
        description === null || 
        description === undefined || 
        description === '' ||
        description === 'null' ||
        description === 'undefined') {
      return 'لا يوجد وصف متاح لهذه الدورة';
    }
    
    const cleanDescription = description.toString().trim();
    
    if (!cleanDescription || cleanDescription === 'null' || cleanDescription === 'undefined') {
      return 'لا يوجد وصف متاح لهذه الدورة';
    }
    
    // If description is too long, truncate it
    if (cleanDescription.length > 120) {
      return `${cleanDescription.substring(0, 120)}...`;
    }
    
    return cleanDescription;
  };
  
  const getCourseTypeInfo = (type: string) => {
    switch (type) {
      case 'individual':
        return {
          title: 'مباشر فردي',
          subtitle: 'Individual Single Student',
          icon: '👤',
          color: 'from-blue-500 to-cyan-600',
          bgColor: 'from-blue-50 to-cyan-100',
          borderColor: 'border-blue-200',
          textColor: 'text-blue-700'
        };
      case 'family':
        return {
          title: 'مباشر عائلي',
          subtitle: 'Family or Friends (2-5 people)',
          icon: '👨‍👩‍👧‍👦',
          color: 'from-green-500 to-emerald-600',
          bgColor: 'from-green-50 to-emerald-100',
          borderColor: 'border-green-200',
          textColor: 'text-green-700'
        };
      case 'private-group':
        return {
          title: 'مجموعة خاصة',
          subtitle: 'Private Group (10-15 people)',
          icon: '👥',
          color: 'from-purple-500 to-violet-600',
          bgColor: 'from-purple-50 to-violet-100',
          borderColor: 'border-purple-200',
          textColor: 'text-purple-700'
        };
      case 'public-group':
        return {
          title: 'مجموعة عامة',
          subtitle: 'Public Group (up to 50+ people)',
          icon: '🌍',
          color: 'from-orange-500 to-red-600',
          bgColor: 'from-orange-50 to-red-100',
          borderColor: 'border-orange-200',
          textColor: 'text-orange-700'
        };
      default:
        return {
          title: 'دورة مباشرة',
          subtitle: 'Live Course',
          icon: '📚',
          color: 'from-gray-500 to-gray-600',
          bgColor: 'from-gray-50 to-gray-100',
          borderColor: 'border-gray-200',
          textColor: 'text-gray-700'
        };
    }
  };

  const typeInfo = getCourseTypeInfo(courseType);

  const handleCardClick = () => {
    if (!isFull && !isEnrolled) {
      window.location.href = `/course/${course.id}`;
    }
  };

  return (
    <Card 
      className={`group relative bg-white rounded-lg shadow-sm border border-gray-200 transition-all duration-300 ease-out overflow-hidden h-full flex flex-col ${
        isFull 
          ? 'opacity-60 cursor-not-allowed' 
          : 'hover:shadow-xl hover:-translate-y-2 cursor-pointer'
      }`}
      onClick={handleCardClick}
    >
      {/* Course Image Section */}
      <div className="relative h-36 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-br ${typeInfo.color} opacity-10`}></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`w-16 h-16 bg-gradient-to-br ${typeInfo.color} rounded-lg flex items-center justify-center shadow-md`}>
            <Users className="w-8 h-8 text-white" />
          </div>
        </div>
        
        {/* Course Type Badge */}
        <div className="absolute top-2 right-2">
          <Badge className={`bg-white/95 backdrop-blur-sm ${typeInfo.textColor} px-2 py-1 text-xs font-medium rounded-md shadow-sm`}>
            {typeInfo.icon} {typeInfo.title}
          </Badge>
        </div>
        
        {/* Full Course Badge */}
        {isFull && (
          <div className="absolute top-2 left-2">
            <Badge className="bg-red-500 text-white px-2 py-1 text-xs font-medium rounded-md shadow-sm">
              مكتمل
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="relative p-4 flex flex-col h-full">
        {/* Course Title - في الوسط */}
        <div className="text-center mb-3">
          <h3 className="text-lg font-semibold text-gray-900 leading-tight line-clamp-2 group-hover:text-green-600 transition-colors duration-200">
            {course.title}
          </h3>
        </div>

        {/* Description */}
        <div className="mb-3">
          <p 
            className="text-gray-600 text-sm leading-relaxed line-clamp-2 min-h-[2.5rem]"
            title={course.description && course.description.length > 120 ? course.description : undefined}
          >
            {formatDescription(course.description)}
          </p>
        </div>

        {/* Teacher Name */}
        <div className="mb-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <User className="w-4 h-4 text-gray-500" />
            <span className="font-medium">المعلم: {course.teacher_name}</span>
          </div>
        </div>

        {/* Course Details - عدد الدروس وعدد الطلاب */}
        <div className="mb-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Users className="w-4 h-4 text-gray-500" />
            <span className="font-medium">{course.enrolled_count}/{course.max_students} طالب</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <BookOpen className="w-4 h-4 text-gray-500" />
            <span className="font-medium">{course.lessons_count || 8} درس</span>
          </div>
        </div>

        {/* Status Indicator */}
        <div className="mt-auto">
          {isEnrolled ? (
            <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
              <div className="w-2 h-2 bg-green-600 rounded-full"></div>
              مسجل بالفعل
            </div>
          ) : isFull ? (
            <div className="flex items-center gap-2 text-sm text-red-500 font-medium">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              الدورة مكتملة
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              متاح للتسجيل
            </div>
          )}
        </div>

        {/* Live Badge */}
        {course.is_live && (
          <div className="absolute top-2 left-2">
            <Badge className="bg-red-500 text-white px-2 py-1 rounded-md text-xs font-medium shadow-sm">
              <div className="w-2 h-2 bg-white rounded-full animate-ping ml-1"></div>
              مباشر
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CourseCard;
