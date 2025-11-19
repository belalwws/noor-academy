'use client';

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, GraduationCap, RefreshCw, Search, Copy, Mail, CheckCircle, UserCheck, Calendar } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { toast } from 'sonner';
import { generalSupervisorApi, type AcademicSupervisorListItem } from '@/lib/api/generalSupervisor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface AcademicSupervisorsTabProps {
  onAfterAction?: () => void;
}

const AcademicSupervisorsTab: React.FC<AcademicSupervisorsTabProps> = () => {
  const [items, setItems] = useState<AcademicSupervisorListItem[]>([]);
  const [query, setQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState<string>('all');
  const [specFilter, setSpecFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'name' | 'department'>('recent');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copyingEmail, setCopyingEmail] = useState<string | null>(null);

  const loadAcademicSupervisors = useCallback(async (showRefreshToast = false) => {
    try {
      if (showRefreshToast) {
        setIsRefreshing(true);
        toast.loading('جاري تحديث قائمة المشرفين الأكاديميين...', { id: 'refresh-supervisors' });
      } else {
        setIsLoading(true);
      }

      const data = await generalSupervisorApi.getAcademicSupervisors();
      const supervisors = Array.isArray(data) ? data : [];
      setItems(supervisors);

      if (showRefreshToast) {
        toast.success(`تم تحديث القائمة (${supervisors.length})`, { id: 'refresh-supervisors' });
      }
    } catch {
      setItems([]);
      toast.error('فشل في تحميل المشرفين الأكاديميين');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadAcademicSupervisors();
  }, [loadAcademicSupervisors]);

  const handleCopyEmail = useCallback(async (email: string, supervisorName: string) => {
    setCopyingEmail(email);
    try {
      await navigator.clipboard.writeText(email);
      toast.success('تم نسخ البريد الإلكتروني', { description: `${supervisorName}: ${email}` });
    } catch {
      toast.error('فشل في نسخ البريد الإلكتروني');
    } finally {
      setCopyingEmail(null);
    }
  }, []);

  const departments = useMemo(() => {
    const set = new Set<string>();
    items.forEach((i) => i.department && set.add(i.department));
    return Array.from(set);
  }, [items]);

  const specializations = useMemo(() => {
    const set = new Set<string>();
    items.forEach((i) => i.specialization && set.add(i.specialization));
    return Array.from(set);
  }, [items]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = items.filter((s) => {
      const matchesQuery =
        !q ||
        s.user_name?.toLowerCase().includes(q) ||
        s.user_email?.toLowerCase().includes(q) ||
        s.specialization?.toLowerCase().includes(q) ||
        s.department?.toLowerCase().includes(q);

      const matchesDept = deptFilter === 'all' || s.department === deptFilter;
      const matchesSpec = specFilter === 'all' || s.specialization === specFilter;
      return matchesQuery && matchesDept && matchesSpec;
    });

    if (sortBy === 'name') {
      list = list.slice().sort((a, b) => (a.user_name || '').localeCompare(b.user_name || ''));
    } else if (sortBy === 'department') {
      list = list.slice().sort((a, b) => (a.department || '').localeCompare(b.department || ''));
    } else {
      list = list.slice().sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
    }

    return list;
  }, [items, query, deptFilter, specFilter, sortBy]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex items-center gap-3 text-gray-700">
          <Spinner size="md" />
          <span className="text-sm">جاري تحميل المشرفين الأكاديميين...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
    
      {/* Filters */}
      <Card className="border bg-white">
        <CardContent className="space-y-6 pt-6">

          {/* List */}
          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-600">لا توجد نتائج مطابقة</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filtered.map((sup) => (
                <Card key={sup.id} className="border bg-white hover:shadow-md transition-shadow">
                  <CardContent className="p-6 space-y-5">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-lg font-semibold">
                        {sup.user_name?.charAt(0) ?? 'م'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-gray-900 truncate">{sup.user_name}</h4>
                          <Badge variant="secondary" className="gap-1 text-xs">
                            <CheckCircle className="w-3 h-3 text-emerald-600" />
                            نشط
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 truncate">{sup.user_email}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                      <div className="rounded-md border bg-gray-50 px-3 py-2">
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <GraduationCap className="w-3.5 h-3.5" />
                          القسم الأكاديمي
                        </div>
                        <div className="mt-1 text-sm font-medium text-gray-900">
                          {sup.department || 'غير محدد'}
                        </div>
                      </div>

                      <div className="rounded-md border bg-gray-50 px-3 py-2">
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <Users className="w-3.5 h-3.5" />
                          التخصص
                        </div>
                        <div className="mt-1 text-sm font-medium text-gray-900">
                          {sup.specialization || 'غير محدد'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-600">
                      <div className="inline-flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>انضم في {new Date(sup.created_at).toLocaleDateString('ar-EG')}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                        onClick={() => handleCopyEmail(sup.user_email, sup.user_name)}
                        disabled={copyingEmail === sup.user_email}
                        className="flex-1 gap-2"
                      >
                        {copyingEmail === sup.user_email ? (
                          <Spinner size="sm" tone="contrast" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                        نسخ الإيميل
                      </Button>
                      <a href={`mailto:${sup.user_email}`} className="flex-1">
                        <Button variant="outline" className="w-full gap-2">
                          <Mail className="w-4 h-4" />
                          مراسلة
                        </Button>
                      </a>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AcademicSupervisorsTab;





