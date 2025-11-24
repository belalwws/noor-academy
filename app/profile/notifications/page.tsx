"use client";

import React, { useState, useEffect } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { MessageSquare, BookOpen, Calendar, AlertCircle, TrendingUp, Users } from 'lucide-react';
import AuthGuard from '@/components/AuthGuard';

const NotificationPreferencesPage: React.FC = () => {
  const { preferences, fetchPreferences, updatePreferences, isLoading } = useNotifications();
  const [localPreferences, setLocalPreferences] = useState(preferences);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  useEffect(() => {
    if (preferences) {
      setLocalPreferences(preferences);
    }
  }, [preferences]);

  const handleToggle = (field: keyof typeof localPreferences, value: boolean) => {
    if (!localPreferences) return;
    setLocalPreferences({
      ...localPreferences,
      [field]: value
    });
  };

  const handleFrequencyChange = (value: string) => {
    if (!localPreferences) return;
    setLocalPreferences({
      ...localPreferences,
      email_frequency: value
    });
  };

  const handleSave = async () => {
    if (!localPreferences) return;
    
    setIsSaving(true);
    try {
      const success = await updatePreferences(localPreferences);
      if (success) {
        toast({
          title: "تم الحفظ بنجاح",
          description: "تم تحديث تفضيلات الإشعارات الخاصة بك",
        });
      } else {
        toast({
          title: "خطأ في الحفظ",
          description: "حدث خطأ أثناء تحديث التفضيلات",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "خطأ في الحفظ",
        description: "حدث خطأ غير متوقع",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !localPreferences) {
    return (
      <AuthGuard>
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">إعدادات الإشعارات</h1>
          <p className="text-gray-600">تخصيص تفضيلات الإشعارات الخاصة بك</p>
        </div>

        <div className="space-y-6">
          {/* General Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-blue-600" />
                الإعدادات العامة
              </CardTitle>
              <CardDescription>
                تحكم في طرق استقبال الإشعارات
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium">الإشعارات داخل التطبيق</label>
                  <p className="text-sm text-gray-500">استقبال الإشعارات داخل المنصة</p>
                </div>
                <Switch
                  checked={localPreferences.in_app_enabled}
                  onCheckedChange={(checked) => handleToggle('in_app_enabled', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium">إشعارات البريد الإلكتروني</label>
                  <p className="text-sm text-gray-500">استقبال الإشعارات عبر البريد الإلكتروني</p>
                </div>
                <Switch
                  checked={localPreferences.email_enabled}
                  onCheckedChange={(checked) => handleToggle('email_enabled', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium">إشعارات الرسائل النصية</label>
                  <p className="text-sm text-gray-500">استقبال الإشعارات عبر الرسائل النصية</p>
                </div>
                <Switch
                  checked={localPreferences.sms_enabled}
                  onCheckedChange={(checked) => handleToggle('sms_enabled', checked)}
                />
              </div>

              {localPreferences.email_enabled && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">تكرار إرسال البريد الإلكتروني</label>
                  <Select value={localPreferences.email_frequency} onValueChange={handleFrequencyChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">فوري</SelectItem>
                      <SelectItem value="daily">يومي</SelectItem>
                      <SelectItem value="weekly">أسبوعي</SelectItem>
                      <SelectItem value="never">أبداً</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notification Types */}
          <Card>
            <CardHeader>
              <CardTitle>أنواع الإشعارات</CardTitle>
              <CardDescription>
                اختر أنواع الإشعارات التي تريد استقبالها
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  <div>
                    <label className="text-sm font-medium">إشعارات الدورات</label>
                    <p className="text-sm text-gray-500">تحديثات الدورات والمحتوى الجديد</p>
                  </div>
                </div>
                <Switch
                  checked={localPreferences.course_notifications}
                  onCheckedChange={(checked) => handleToggle('course_notifications', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-purple-600" />
                  <div>
                    <label className="text-sm font-medium">إشعارات الواجبات</label>
                    <p className="text-sm text-gray-500">مواعيد التسليم والواجبات الجديدة</p>
                  </div>
                </div>
                <Switch
                  checked={localPreferences.assignment_notifications}
                  onCheckedChange={(checked) => handleToggle('assignment_notifications', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <div>
                    <label className="text-sm font-medium">إشعارات الاجتماعات</label>
                    <p className="text-sm text-gray-500">مواعيد الاجتماعات والجلسات المباشرة</p>
                  </div>
                </div>
                <Switch
                  checked={localPreferences.meeting_notifications}
                  onCheckedChange={(checked) => handleToggle('meeting_notifications', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-blue-600" />
                  <div>
                    <label className="text-sm font-medium">إشعارات المجتمع</label>
                    <p className="text-sm text-gray-500">المواضيع الجديدة والردود في المنتديات</p>
                  </div>
                </div>
                <Switch
                  checked={localPreferences.community_notifications}
                  onCheckedChange={(checked) => handleToggle('community_notifications', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <div>
                    <label className="text-sm font-medium">إشعارات النظام</label>
                    <p className="text-sm text-gray-500">تحديثات النظام والصيانة</p>
                  </div>
                </div>
                <Switch
                  checked={localPreferences.system_notifications}
                  onCheckedChange={(checked) => handleToggle('system_notifications', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-5 w-5 text-orange-600" />
                  <div>
                    <label className="text-sm font-medium">إشعارات الأداء</label>
                    <p className="text-sm text-gray-500">تقارير التقدم والإنجازات</p>
                  </div>
                </div>
                <Switch
                  checked={localPreferences.performance_notifications}
                  onCheckedChange={(checked) => handleToggle('performance_notifications', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button 
              onClick={handleSave} 
              disabled={isSaving}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSaving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
            </Button>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
};

export default NotificationPreferencesPage;
