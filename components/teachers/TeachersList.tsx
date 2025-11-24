/**
 * Teachers List Component
 * Main component for displaying and managing teachers
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle, Users, ChevronLeft, ChevronRight } from "lucide-react";
import { TeacherCard } from './TeacherCard';
import { TeachersFilters } from './TeachersFilters';
import { Spinner } from "@/components/ui/spinner";
import {
  teachersApi,
  TeacherProfile,
  TeachersListParams,
  TeachersListResponse
} from '../../lib/api/teachers';
import { generalSupervisorApi } from '../../lib/api/generalSupervisor';

interface TeachersListProps {
  initialFilters?: TeachersListParams;
  showFilters?: boolean;
  pageSize?: number;
}

export const TeachersList: React.FC<TeachersListProps> = ({
  initialFilters = {},
  showFilters = true,
  pageSize = 12
}) => {
  const [teachers, setTeachers] = useState<TeacherProfile[]>([]);
  const [filters, setFilters] = useState<TeachersListParams>(initialFilters);
  const [isLoading, setIsLoading] = useState(true);
  const [isApproving, setIsApproving] = useState<number | null>(null);
  const [isRejecting, setIsRejecting] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);

  // Statistics
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0
  });

  // Load teachers data
  const loadTeachers = async (newFilters: TeachersListParams = filters, page: number = 1) => {
    try {
      setIsLoading(true);
      setError(null);

      const response: TeachersListResponse = await teachersApi.getTeachers({
        ...newFilters,
        page
      });

      setTeachers(response.results);
      setTotalCount(response.count);
      setHasNext(!!response.next);
      setHasPrevious(!!response.previous);
      setCurrentPage(page);

    } catch (err: any) {
      console.error('Error loading teachers:', err);
      setError('حدث خطأ في تحميل بيانات المدرسين. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  };

  // Load statistics
  const loadStats = async () => {
    try {
      const [totalResponse, pendingResponse, approvedResponse] = await Promise.all([
        teachersApi.getTeachers({ page: 1 }),
        teachersApi.getPendingTeachers({ page: 1 }),
        teachersApi.getApprovedTeachers({ page: 1 })
      ]);

      setStats({
        total: totalResponse.count,
        pending: pendingResponse.count,
        approved: approvedResponse.count
      });
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  // Initial load
  useEffect(() => {
    loadTeachers();
    loadStats();
  }, []);

  // Handle filters change
  const handleFiltersChange = (newFilters: TeachersListParams) => {
    setFilters(newFilters);
    setCurrentPage(1);
    loadTeachers(newFilters, 1);
  };

  // Handle search
  const handleSearch = (searchTerm: string) => {
    const newFilters = { ...filters, search: searchTerm || undefined };
    handleFiltersChange(newFilters);
  };

  // Clear all filters
  const handleClearFilters = () => {
    const clearedFilters = {};
    setFilters(clearedFilters);
    setCurrentPage(1);
    loadTeachers(clearedFilters, 1);
  };

  // Handle teacher approval
  const handleApproveTeacher = async (teacherId: number) => {
    try {
      setIsApproving(teacherId);
      setError(null);
      setSuccess(null);

      try {
        // Try General Supervisor API first
        await generalSupervisorApi.approveTeacher(teacherId, {
          approval_notes: 'تم الاعتماد من قبل المشرف العام'
        });
      } catch (generalError: any) {
        console.log('General Supervisor API failed, trying legacy API...');

        // Fallback to legacy teachers API
        await teachersApi.approveTeacher(teacherId, {});
      }

      setSuccess('تم اعتماد المدرس بنجاح!');

      // Reload current page and stats
      await Promise.all([
        loadTeachers(filters, currentPage),
        loadStats()
      ]);

    } catch (err: any) {
      console.error('Error approving teacher:', err);
      setError('حدث خطأ في اعتماد المدرس. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsApproving(null);
    }
  };

  // Handle teacher rejection
  const handleRejectTeacher = async (teacherId: number) => {
    const rejectionReason = prompt('يرجى إدخال سبب الرفض:');
    if (!rejectionReason) return;

    try {
      setIsRejecting(teacherId);
      setError(null);
      setSuccess(null);

      try {
        // Try General Supervisor API first
        await generalSupervisorApi.rejectTeacher(teacherId, {
          rejection_reason: rejectionReason
        });
      } catch (generalError: any) {
        console.log('General Supervisor reject API failed, using alternative approach...');

        // For now, just show a message since there's no legacy reject API
        // In a real scenario, you might want to implement a different approach
        throw new Error('وظيفة الرفض متاحة فقط للمشرف العام');
      }

      setSuccess('تم رفض المدرس بنجاح!');

      // Reload current page and stats
      await Promise.all([
        loadTeachers(filters, currentPage),
        loadStats()
      ]);

    } catch (err: any) {
      console.error('Error rejecting teacher:', err);
      setError(err.message || 'حدث خطأ في رفض المدرس. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsRejecting(null);
    }
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    loadTeachers(filters, page);
  };

  // Calculate pagination info
  const totalPages = Math.ceil(totalCount / pageSize);
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalCount);

  return (
    <div className="space-y-6">
      {/* Filters */}
      {showFilters && (
        <TeachersFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onSearch={handleSearch}
          onClearFilters={handleClearFilters}
          isLoading={isLoading}
          totalCount={stats.total}
          pendingCount={stats.pending}
          approvedCount={stats.approved}
        />
      )}

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
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription dir="rtl">{error}</AlertDescription>
        </Alert>
      )}

      {/* Teachers Grid */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2" dir="rtl">
              <Users className="h-5 w-5 text-blue-600" />
              قائمة المدرسين
              {totalCount > 0 && (
                <span className="text-sm font-normal text-gray-600">
                  ({totalCount} مدرس)
                </span>
              )}
            </CardTitle>
            
            {!isLoading && totalCount > 0 && (
              <div className="text-sm text-gray-600" dir="rtl">
                عرض {startItem}-{endItem} من {totalCount}
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Spinner size="lg" className="mx-auto mb-4" />
                <p className="text-gray-600" dir="rtl">جاري تحميل بيانات المدرسين...</p>
              </div>
            </div>
          ) : teachers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2" dir="rtl">
                لا توجد نتائج
              </h3>
              <p className="text-gray-600" dir="rtl">
                لم يتم العثور على مدرسين يطابقون معايير البحث المحددة.
              </p>
              {Object.keys(filters).length > 0 && (
                <Button
                  variant="outline"
                  onClick={handleClearFilters}
                  className="mt-4"
                >
                  مسح جميع المرشحات
                </Button>
              )}
            </div>
          ) : (
            <>
              {/* Teachers Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                {teachers.map((teacher) => (
                  <TeacherCard
                    key={teacher.id}
                    teacher={teacher}
                    onApprove={handleApproveTeacher}
                    onReject={handleRejectTeacher}
                    onView={(id) => console.log('View teacher:', id)}
                    isApproving={isApproving === teacher.id}
                    isRejecting={isRejecting === teacher.id}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t pt-4">
                  <div className="text-sm text-gray-600" dir="rtl">
                    صفحة {currentPage} من {totalPages}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={!hasPrevious || isLoading}
                    >
                      <ChevronRight className="w-4 h-4" />
                      السابق
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={!hasNext || isLoading}
                    >
                      التالي
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};


