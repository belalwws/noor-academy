/**
 * Create Meeting Dialog Component
 * Modal for creating meetings with academic supervisors
 */

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calendar, Clock, Users, CheckCircle, AlertCircle, Video } from "lucide-react";

interface CreateMeetingDialogProps {
  onMeetingCreated?: () => void;
  trigger?: React.ReactNode;
}

export const CreateMeetingDialog: React.FC<CreateMeetingDialogProps> = ({
  onMeetingCreated,
  trigger
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    duration: '60',
    meetingType: 'online'
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear errors when user starts typing
    if (error) setError(null);
    if (success) setSuccess(null);
  };

  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      setError('عنوان الاجتماع مطلوب');
      return false;
    }
    
    if (!formData.date) {
      setError('تاريخ الاجتماع مطلوب');
      return false;
    }
    
    if (!formData.time) {
      setError('وقت الاجتماع مطلوب');
      return false;
    }
    
    // Check if date is not in the past
    const selectedDate = new Date(`${formData.date}T${formData.time}`);
    const now = new Date();
    
    if (selectedDate <= now) {
      setError('يجب أن يكون تاريخ ووقت الاجتماع في المستقبل');
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
      
      // Simulate API call - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // For now, just show success message
      // In real implementation, you would call an API to create the meeting
      setSuccess(`تم إنشاء الاجتماع بنجاح! سيتم إرسال دعوات للمشرفين الأكاديميين.`);
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        date: '',
        time: '',
        duration: '60',
        meetingType: 'online'
      });
      
      // Call callback
      onMeetingCreated?.();
      
      // Close dialog after 3 seconds
      setTimeout(() => {
        setIsOpen(false);
        setSuccess(null);
      }, 3000);
      
    } catch (err: any) {
      console.error('Error creating meeting:', err);
      setError('حدث خطأ في إنشاء الاجتماع. يرجى المحاولة مرة أخرى.');
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
        title: '',
        description: '',
        date: '',
        time: '',
        duration: '60',
        meetingType: 'online'
      });
    }
  };

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-purple-600 hover:bg-purple-700">
            <Video className="w-4 h-4 ml-2" />
            إنشاء اجتماع مع المشرفين الأكاديميين
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-lg bg-white dark:bg-slate-900" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Video className="w-5 h-5 text-purple-600" />
            إنشاء اجتماع جديد
          </DialogTitle>
          <DialogDescription>
            أنشئ اجتماعاً مع المشرفين الأكاديميين لمناقشة الأمور المهمة
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Meeting Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-600" />
              عنوان الاجتماع *
            </Label>
            <Input
              id="title"
              placeholder="مثال: اجتماع المشرفين الأكاديميين الشهري"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* Meeting Description */}
          <div className="space-y-2">
            <Label htmlFor="description">وصف الاجتماع</Label>
            <Textarea
              id="description"
              placeholder="اكتب وصفاً مختصراً عن موضوع الاجتماع..."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              disabled={isLoading}
              rows={3}
            />
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date" className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-600" />
                التاريخ *
              </Label>
              <Input
                id="date"
                type="date"
                min={today}
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="time" className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-600" />
                الوقت *
              </Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => handleInputChange('time', e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <Label htmlFor="duration">مدة الاجتماع (بالدقائق)</Label>
            <Input
              id="duration"
              type="number"
              min="15"
              max="240"
              step="15"
              value={formData.duration}
              onChange={(e) => handleInputChange('duration', e.target.value)}
              disabled={isLoading}
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
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                {success}
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-purple-600 hover:bg-purple-700"
            >
              {isLoading ? (
                <>
                  <Clock className="w-4 h-4 ml-2 animate-spin" />
                  جاري الإنشاء...
                </>
              ) : (
                <>
                  <Video className="w-4 h-4 ml-2" />
                  إنشاء الاجتماع
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
