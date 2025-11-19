'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { apiClient } from '@/lib/apiClient'

import { 
  Save, 
  X, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  BookOpen,
  Target
} from 'lucide-react'

interface StudentEditProps {
  profile: any
  onSave: (updatedProfile: any) => void
  onCancel: () => void
}

export default function StudentEdit({ profile, onSave, onCancel }: StudentEditProps) {
  const [formData, setFormData] = useState({
    first_name: profile?.user?.first_name || '',
    last_name: profile?.user?.last_name || '',
    email: profile?.user?.email || '',
    phone: profile?.phone || '',
    date_of_birth: profile?.date_of_birth || '',
    address: profile?.address || '',
    bio: profile?.bio || '',
    preferred_subjects: profile?.preferred_subjects || '',
    learning_goals: profile?.learning_goals || ''
  })

  const [saving, setSaving] = useState(false)

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = async () => {
    try {
      setSaving(true)

      // Prepare data for API
      const updateData = {
        user: {
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email
        },
        phone: formData.phone,
        date_of_birth: formData.date_of_birth || null,
        address: formData.address,
        bio: formData.bio,
        preferred_subjects: formData.preferred_subjects,
        learning_goals: formData.learning_goals
      }

      console.log('Updating student profile:', updateData)

      // Update profile via API
      const response = await apiClient.patch(`/students/profiles/${profile.id}/`, updateData)
      
      if (response && response.data) {
        onSave(response.data)
        toast.success('تم تحديث الملف الشخصي بنجاح')
      } else {
        throw new Error('فشل في تحديث الملف الشخصي')
      }

    } catch (error: any) {
      console.error('Error updating profile:', error)
      toast.error('حدث خطأ في تحديث الملف الشخصي')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Personal Information */}
      <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-blue-50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <CardTitle className="text-xl">تعديل المعلومات الأساسية</CardTitle>
          </div>
          <CardDescription>
            قم بتحديث معلوماتك الشخصية والتواصل
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                الاسم الأول
              </Label>
              <Input
                id="first_name"
                value={formData.first_name}
                onChange={(e) => handleInputChange('first_name', e.target.value)}
                placeholder="أدخل الاسم الأول"
                className="bg-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="last_name" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                الاسم الأخير
              </Label>
              <Input
                id="last_name"
                value={formData.last_name}
                onChange={(e) => handleInputChange('last_name', e.target.value)}
                placeholder="أدخل الاسم الأخير"
                className="bg-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              البريد الإلكتروني
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="أدخل البريد الإلكتروني"
              className="bg-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              رقم الهاتف
            </Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="أدخل رقم الهاتف"
              className="bg-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date_of_birth" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              تاريخ الميلاد
            </Label>
            <Input
              id="date_of_birth"
              type="date"
              value={formData.date_of_birth}
              onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
              className="bg-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              العنوان
            </Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="أدخل العنوان"
              className="bg-white"
            />
          </div>
        </CardContent>
      </Card>

      {/* Academic Information */}
      <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-indigo-50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="bg-indigo-100 p-2 rounded-lg">
              <BookOpen className="w-5 h-5 text-indigo-600" />
            </div>
            <CardTitle className="text-xl">تعديل المعلومات الأكاديمية</CardTitle>
          </div>
          <CardDescription>
            حدث معلوماتك التعليمية وأهدافك
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="preferred_subjects" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              المواد المفضلة
            </Label>
            <Textarea
              id="preferred_subjects"
              value={formData.preferred_subjects}
              onChange={(e) => handleInputChange('preferred_subjects', e.target.value)}
              placeholder="اذكر المواد أو المجالات التي تفضل دراستها..."
              className="bg-white min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="learning_goals" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              الأهداف التعليمية
            </Label>
            <Textarea
              id="learning_goals"
              value={formData.learning_goals}
              onChange={(e) => handleInputChange('learning_goals', e.target.value)}
              placeholder="ما هي أهدافك من التعلم؟ ماذا تريد أن تحقق؟"
              className="bg-white min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              نبذة شخصية
            </Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              placeholder="اكتب نبذة مختصرة عن نفسك..."
              className="bg-white min-h-[120px]"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6 border-t">
            <Button 
              onClick={handleSave}
              disabled={saving}
              className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin ml-2" />
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 ml-2" />
                  حفظ التغييرات
                </>
              )}
            </Button>
            
            <Button 
              onClick={onCancel}
              variant="outline"
              disabled={saving}
              className="flex-1"
            >
              <X className="w-4 h-4 ml-2" />
              إلغاء
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
