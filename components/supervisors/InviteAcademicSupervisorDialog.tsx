/**
 * Invite Academic Supervisor Dialog Component
 * Modal for inviting new academic supervisors
 */

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { UserPlus, CheckCircle, AlertCircle, Mail, BookOpen, FileText } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { generalSupervisorApi, InviteAcademicSupervisorData } from '../../lib/api/generalSupervisor';

interface InviteAcademicSupervisorDialogProps {
  onInviteSent?: () => void;
  trigger?: React.ReactNode;
}

export const InviteAcademicSupervisorDialog: React.FC<InviteAcademicSupervisorDialogProps> = ({
  onInviteSent,
  trigger
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<InviteAcademicSupervisorData>({
    email: '',
    specialization: '',
    areas_of_responsibility: ''
  });

  const handleInputChange = (field: keyof InviteAcademicSupervisorData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear errors when user starts typing
    if (error) setError(null);
    if (success) setSuccess(null);
  };

  const validateForm = (): boolean => {
    if (!formData.email.trim()) {
      setError('البريد الإلكتروني مطلوب');
      return false;
    }
    
    if (!formData.email.includes('@')) {
      setError('يرجى إدخال بريد إلكتروني صحيح');
      return false;
    }
    
    if (!formData.specialization) {
      setError('التخصص مطلوب');
      return false;
    }
    
    if (!formData.areas_of_responsibility.trim()) {
      setError('مجالات المسؤولية مطلوبة');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);
      
      await generalSupervisorApi.inviteAcademicSupervisor(formData);
      
      setSuccess('تم إرسال الدعوة بنجاح! سيتم إشعار المشرف الأكاديمي عبر البريد الإلكتروني.');
      
      // Reset form
      setFormData({
        email: '',
        specialization: '',
        areas_of_responsibility: ''
      });
      
      // Call callback
      onInviteSent?.();
      
      // Close dialog after 2 seconds
      setTimeout(() => {
        setIsOpen(false);
        setSuccess(null);
      }, 2000);
      
    } catch (err: any) {
      console.error('Error inviting academic supervisor:', err);
      // Use the error message from the API if available
      setError(err.message || 'حدث خطأ في إرسال الدعوة. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setIsOpen(false);
      setError(null);
      setSuccess(null);
      setFormData({
        email: '',
        specialization: '',
        areas_of_responsibility: ''
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-blue-600 hover:bg-blue-700">
            <UserPlus className="w-4 h-4 ml-2" />
            دعوة مشرف أكاديمي
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-blue-600" />
            دعوة مشرف أكاديمي جديد
          </DialogTitle>
          <DialogDescription>
            أدخل بيانات المشرف الأكاديمي الجديد لإرسال دعوة انضمام
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-gray-600" />
              البريد الإلكتروني *
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="supervisor@example.com"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              disabled={isLoading}
              dir="ltr"
              className="text-left"
            />
          </div>

          {/* Specialization Field */}
          <div className="space-y-2">
            <Label htmlFor="specialization" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-gray-600" />
              التخصص *
            </Label>
            <Select
              value={formData.specialization}
              onValueChange={(value) => handleInputChange('specialization', value)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="اختر التخصص" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="memorize_quran">تحفيظ القرآن الكريم</SelectItem>
                <SelectItem value="learn_arabic">تعلم اللغة العربية</SelectItem>
                <SelectItem value="islamic_studies">الدراسات الإسلامية</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Areas of Responsibility Field */}
          <div className="space-y-2">
            <Label htmlFor="areas_of_responsibility" className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-gray-600" />
              مجالات المسؤولية *
            </Label>
            <Textarea
              id="areas_of_responsibility"
              placeholder="اكتب مجالات المسؤولية والمهام المطلوبة من المشرف الأكاديمي..."
              value={formData.areas_of_responsibility}
              onChange={(e) => handleInputChange('areas_of_responsibility', e.target.value)}
              disabled={isLoading}
              rows={3}
            />
          </div>

          {/* Error/Success Messages */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-blue-200 bg-blue-50">
              <CheckCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                {success}
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                <>
                  <Spinner size="sm" tone="contrast" className="ml-2" />
                  جاري الإرسال...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 ml-2" />
                  إرسال الدعوة
                </>
              )}
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1"
            >
              إلغاء
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};


