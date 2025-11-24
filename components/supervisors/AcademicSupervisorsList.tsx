/**
 * Academic Supervisors List Component
 * Displays list of academic supervisors with management options
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Users,
  GraduationCap,
  Mail,
  Calendar,
  BookOpen,
  FileText,
  AlertCircle,
  CheckCircle,
  UserPlus,
  RefreshCw
} from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { 
  generalSupervisorApi, 
  AcademicSupervisor, 
  PendingInvitation,
  getSpecializationLabel,
  getStatusLabel,
  getStatusColor
} from '../../lib/api/generalSupervisor';
import { InviteAcademicSupervisorDialog } from './InviteAcademicSupervisorDialog';

export const AcademicSupervisorsList: React.FC = () => {
  const [academicSupervisors, setAcademicSupervisors] = useState<AcademicSupervisor[]>([]);
  const [pendingInvitations, setPendingInvitations] = useState<PendingInvitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      try {
        const [supervisorsData, invitationsData] = await Promise.all([
          generalSupervisorApi.getAcademicSupervisors(),
          generalSupervisorApi.getPendingInvitations()
        ]);

        setAcademicSupervisors(supervisorsData);
        setPendingInvitations(invitationsData);
      } catch (apiError: any) {
        if (apiError.message?.includes('403') || apiError.message?.includes('Forbidden')) {
          setError('هذه الميزة متاحة فقط للمشرف العام. يرجى التواصل مع المشرف العام لإدارة المشرفين الأكاديميين.');
        } else {
          setError('حدث خطأ في تحميل بيانات المشرفين الأكاديميين');
        }
      }

    } catch (err: any) {
      console.error('Error loading academic supervisors:', err);
      setError('حدث خطأ في تحميل بيانات المشرفين الأكاديميين');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleInviteSent = () => {
    setSuccess('تم إرسال الدعوة بنجاح!');
    loadData(); // Reload data
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleRevokeInvitation = async (invitationId: string) => {
    try {
      await generalSupervisorApi.revokeInvitation(parseInt(invitationId));
      setSuccess('تم إلغاء الدعوة بنجاح');
      loadData();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('حدث خطأ في إلغاء الدعوة');
      setTimeout(() => setError(null), 3000);
    }
  };

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Spinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-600" dir="rtl">جاري تحميل بيانات المشرفين الأكاديميين...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GraduationCap className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold" dir="rtl">المشرفون الأكاديميون</h2>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            disabled={isLoading}
          >
            <RefreshCw className="w-4 h-4 ml-2" />
            تحديث
          </Button>
          <InviteAcademicSupervisorDialog onInviteSent={handleInviteSent} />
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <Alert className="border-blue-200 bg-blue-50">
          <CheckCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800" dir="rtl">
            {success}
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant={error.includes('المشرف العام') ? 'default' : 'destructive'} className={error.includes('المشرف العام') ? 'border-blue-200 bg-blue-50' : ''}>
          <AlertCircle className={`h-4 w-4 ${error.includes('المشرف العام') ? 'text-blue-600' : ''}`} />
          <AlertDescription dir="rtl" className={error.includes('المشرف العام') ? 'text-blue-800' : ''}>
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-r-4 border-r-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600" dir="rtl">المشرفون النشطون</p>
                <p className="text-2xl font-bold">{academicSupervisors.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-r-4 border-r-yellow-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Mail className="w-8 h-8 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600" dir="rtl">الدعوات المعلقة</p>
                <p className="text-2xl font-bold">{pendingInvitations.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-r-4 border-r-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600" dir="rtl">الملفات المكتملة</p>
                <p className="text-2xl font-bold">
                  {academicSupervisors.filter(s => s.completion_percentage === 100).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Academic Supervisors List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2" dir="rtl">
            <Users className="h-5 w-5 text-blue-600" />
            المشرفون الأكاديميون النشطون ({academicSupervisors.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {academicSupervisors.length === 0 ? (
            <div className="text-center py-8">
              <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2" dir="rtl">
                لا يوجد مشرفون أكاديميون
              </h3>
              <p className="text-gray-600 mb-4" dir="rtl">
                ابدأ بدعوة مشرف أكاديمي جديد للانضمام للفريق
              </p>
              <InviteAcademicSupervisorDialog 
                onInviteSent={handleInviteSent}
                trigger={
                  <Button>
                    <UserPlus className="w-4 h-4 ml-2" />
                    دعوة مشرف أكاديمي
                  </Button>
                }
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {academicSupervisors.map((supervisor) => (
                <Card key={supervisor.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-blue-100 text-blue-600">
                          {getInitials(supervisor.user_name)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg" dir="rtl">
                          {supervisor.user_name}
                        </h3>
                        
                        <div className="space-y-2 mt-2">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail className="w-4 h-4" />
                            <span dir="ltr">{supervisor.user_email}</span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-sm">
                            <BookOpen className="w-4 h-4 text-blue-600" />
                            <span dir="rtl">{getSpecializationLabel(supervisor.specialization)}</span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4" />
                            <span dir="rtl">انضم في {formatDate(supervisor.created_at)}</span>
                          </div>
                        </div>

                        {/* Profile Completion */}
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span dir="rtl">اكتمال الملف الشخصي</span>
                            <span>{supervisor.completion_percentage}%</span>
                          </div>
                          <Progress value={supervisor.completion_percentage} className="h-2" />
                        </div>

                        {/* Areas of Responsibility */}
                        {supervisor.areas_of_responsibility && (
                          <div className="mt-3">
                            <div className="flex items-center gap-1 text-sm font-medium mb-1">
                              <FileText className="w-4 h-4 text-gray-600" />
                              <span dir="rtl">مجالات المسؤولية:</span>
                            </div>
                            <p className="text-sm text-gray-600 line-clamp-2" dir="rtl">
                              {supervisor.areas_of_responsibility}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending Invitations */}
      {pendingInvitations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2" dir="rtl">
              <Mail className="h-5 w-5 text-yellow-600" />
              الدعوات المعلقة ({pendingInvitations.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingInvitations.map((invitation) => (
                <div key={invitation.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-yellow-600" />
                      <span className="font-medium" dir="ltr">{invitation.email}</span>
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                        {getStatusLabel(invitation.status)}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1" dir="rtl">
                      تم الإرسال في {formatDate(invitation.invited_at)}
                    </p>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRevokeInvitation(invitation.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    إلغاء الدعوة
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};


