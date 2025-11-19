/**
 * Teachers Filters Component
 * Provides filtering and search functionality for teachers list
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Filter,
  X,
  Users,
  UserCheck,
  Clock,
  BookOpen
} from "lucide-react";
import { TeachersListParams } from '../../lib/api/teachers';

interface TeachersFiltersProps {
  filters: TeachersListParams;
  onFiltersChange: (filters: TeachersListParams) => void;
  onSearch: (searchTerm: string) => void;
  onClearFilters: () => void;
  isLoading?: boolean;
  totalCount?: number;
  pendingCount?: number;
  approvedCount?: number;
}

export const TeachersFilters: React.FC<TeachersFiltersProps> = ({
  filters,
  onFiltersChange,
  onSearch,
  onClearFilters,
  isLoading = false,
  totalCount = 0,
  pendingCount = 0,
  approvedCount = 0
}) => {
  const [searchTerm, setSearchTerm] = React.useState(filters.search || '');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  const handleApprovalStatusChange = (value: string) => {
    if (value === 'all') {
      const { approved, ...rest } = filters;
      onFiltersChange(rest);
    } else {
      onFiltersChange({
        ...filters,
        approved: value === 'approved'
      });
    }
  };

  const handleSpecializationChange = (value: string) => {
    if (value === 'all') {
      const { specialization, ...rest } = filters;
      onFiltersChange(rest);
    } else {
      onFiltersChange({
        ...filters,
        specialization: value as any
      });
    }
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.approved !== undefined) count++;
    if (filters.specialization) count++;
    if (filters.search) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2" dir="rtl">
            <Filter className="h-5 w-5 text-blue-600" />
            البحث والتصفية
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {activeFiltersCount} مرشح نشط
              </Badge>
            )}
          </CardTitle>
          {activeFiltersCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClearFilters}
              className="text-red-600 hover:text-red-700"
            >
              <X className="w-4 h-4 ml-2" />
              مسح الكل
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-blue-600 font-medium" dir="rtl">إجمالي المدرسين</p>
                <p className="text-xl font-bold text-blue-800">{totalCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="text-sm text-yellow-600 font-medium" dir="rtl">قيد المراجعة</p>
                <p className="text-xl font-bold text-yellow-800">{pendingCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 p-3 rounded-lg border border-green-200">
            <div className="flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-green-600 font-medium" dir="rtl">معتمد</p>
                <p className="text-xl font-bold text-green-800">{approvedCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="البحث في أسماء المدرسين، المؤهلات، أو السيرة الذاتية..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
              dir="rtl"
            />
          </div>
          <Button type="submit" disabled={isLoading}>
            <Search className="w-4 h-4 ml-2" />
            بحث
          </Button>
        </form>

        {/* Filters Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Approval Status Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium" dir="rtl">حالة الاعتماد</label>
            <Select
              value={
                filters.approved === undefined 
                  ? 'all' 
                  : filters.approved 
                    ? 'approved' 
                    : 'pending'
              }
              onValueChange={handleApprovalStatusChange}
            >
              <SelectTrigger dir="rtl">
                <SelectValue placeholder="اختر حالة الاعتماد" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع المدرسين</SelectItem>
                <SelectItem value="pending">قيد المراجعة</SelectItem>
                <SelectItem value="approved">معتمد</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Specialization Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium" dir="rtl">التخصص</label>
            <Select
              value={filters.specialization || 'all'}
              onValueChange={handleSpecializationChange}
            >
              <SelectTrigger dir="rtl">
                <SelectValue placeholder="اختر التخصص" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع التخصصات</SelectItem>
                <SelectItem value="memorize_quran">تحفيظ القرآن الكريم</SelectItem>
                <SelectItem value="learn_arabic">تعلم اللغة العربية</SelectItem>
                <SelectItem value="islamic_studies">الدراسات الإسلامية</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Active Filters Display */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap gap-2 pt-2 border-t">
            <span className="text-sm font-medium text-gray-600" dir="rtl">المرشحات النشطة:</span>
            
            {filters.search && (
              <Badge variant="outline" className="gap-1">
                البحث: {filters.search}
                <X 
                  className="w-3 h-3 cursor-pointer" 
                  onClick={() => {
                    setSearchTerm('');
                    onSearch('');
                  }}
                />
              </Badge>
            )}
            
            {filters.approved !== undefined && (
              <Badge variant="outline" className="gap-1">
                الحالة: {filters.approved ? 'معتمد' : 'قيد المراجعة'}
                <X 
                  className="w-3 h-3 cursor-pointer" 
                  onClick={() => handleApprovalStatusChange('all')}
                />
              </Badge>
            )}
            
            {filters.specialization && (
              <Badge variant="outline" className="gap-1">
                التخصص: {
                  filters.specialization === 'memorize_quran' ? 'تحفيظ القرآن' :
                  filters.specialization === 'learn_arabic' ? 'اللغة العربية' :
                  'الدراسات الإسلامية'
                }
                <X 
                  className="w-3 h-3 cursor-pointer" 
                  onClick={() => handleSpecializationChange('all')}
                />
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
