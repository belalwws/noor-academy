/**
 * Teacher Card Component
 * Displays individual teacher information in a card format
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  User,
  Mail,
  Phone,
  Calendar,
  BookOpen,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  UserCheck
} from "lucide-react";
import { TeacherProfile, getSpecializationLabel, getApprovalStatusLabel, getApprovalStatusColor } from '../../lib/api/teachers';

interface TeacherCardProps {
  teacher: TeacherProfile;
  onApprove?: (teacherId: number) => void;
  onReject?: (teacherId: number) => void;
  onView?: (teacherId: number) => void;
  showActions?: boolean;
  isLoading?: boolean;
  isApproving?: boolean;
  isRejecting?: boolean;
}

export const TeacherCard: React.FC<TeacherCardProps> = ({
  teacher,
  onApprove,
  onReject,
  onView,
  showActions = true,
  isLoading = false,
  isApproving = false,
  isRejecting = false
}) => {
  const statusColor = getApprovalStatusColor(teacher.approval_status);
  const statusLabel = getApprovalStatusLabel(teacher.approval_status);
  const specializationLabel = getSpecializationLabel(teacher.specialization);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200 border-r-4 border-r-blue-500">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage 
                src={teacher.profile_image_url || teacher.user.profile_image_url} 
                alt={teacher.user.full_name}
              />
              <AvatarFallback className="bg-blue-100 text-blue-600">
                {getInitials(teacher.user.full_name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg font-bold" dir="rtl">
                {teacher.user.full_name}
              </CardTitle>
              <p className="text-sm text-gray-600" dir="rtl">
                {specializationLabel}
              </p>
            </div>
          </div>
          <Badge 
            variant={statusColor === 'green' ? 'default' : statusColor === 'yellow' ? 'secondary' : 'destructive'}
            className={`
              ${statusColor === 'green' ? 'bg-green-100 text-green-800 hover:bg-green-200' : ''}
              ${statusColor === 'yellow' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' : ''}
              ${statusColor === 'red' ? 'bg-red-100 text-red-800 hover:bg-red-200' : ''}
            `}
          >
            {statusColor === 'green' && <CheckCircle className="w-3 h-3 ml-1" />}
            {statusColor === 'yellow' && <Clock className="w-3 h-3 ml-1" />}
            {statusColor === 'red' && <XCircle className="w-3 h-3 ml-1" />}
            {statusLabel}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Contact Information */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Mail className="w-4 h-4" />
            <span dir="ltr">{teacher.user.email}</span>
          </div>
          {teacher.user.phone_number && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="w-4 h-4" />
              <span dir="ltr">{teacher.user.phone_number}</span>
            </div>
          )}
        </div>

        {/* Experience and Qualifications */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <BookOpen className="w-4 h-4 text-blue-600" />
            <span className="font-medium" dir="rtl">سنوات الخبرة:</span>
            <span>{teacher.years_of_experience} سنة</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <User className="w-4 h-4 text-green-600" />
            <span className="font-medium" dir="rtl">لغة التدريس:</span>
            <span>{teacher.primary_teaching_language === 'ar' ? 'العربية' : 'الإنجليزية'}</span>
          </div>
        </div>

        {/* Biography Preview */}
        {teacher.biography && (
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-700 line-clamp-3" dir="rtl">
              {teacher.biography}
            </p>
          </div>
        )}

        {/* Supervisor Information */}
        {teacher.general_supervisor_name && (
          <div className="text-sm text-gray-600" dir="rtl">
            <span className="font-medium">المشرف العام: </span>
            {teacher.general_supervisor_name}
          </div>
        )}

        {/* Registration Date */}
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Calendar className="w-4 h-4" />
          <span dir="rtl">تاريخ التسجيل: {formatDate(teacher.created_at)}</span>
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex gap-2 pt-2 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onView?.(teacher.id)}
              className="flex-1"
            >
              <Eye className="w-4 h-4 ml-2" />
              عرض التفاصيل
            </Button>
            
            {teacher.approval_status === 'pending' && (
              <>
                {onApprove && (
                  <Button
                    size="sm"
                    onClick={() => onApprove(teacher.id)}
                    disabled={isApproving || isRejecting}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <UserCheck className="w-4 h-4 ml-2" />
                    {isApproving ? 'جاري الاعتماد...' : 'اعتماد'}
                  </Button>
                )}

                {onReject && (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => onReject(teacher.id)}
                    disabled={isApproving || isRejecting}
                    className="flex-1"
                    title="وظيفة الرفض متاحة فقط للمشرف العام"
                  >
                    <XCircle className="w-4 h-4 ml-2" />
                    {isRejecting ? 'جاري الرفض...' : 'رفض'}
                  </Button>
                )}
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
