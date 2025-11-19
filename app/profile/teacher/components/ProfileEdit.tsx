'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Award,
  GraduationCap,
  FileText,
  Save,
  X,
  Clock
} from 'lucide-react'

interface TeacherProfile {
  id: number
  user: number
  first_name: string
  last_name: string
  email: string
  phone?: string
  address?: string
  bio?: string
  specialization?: string
  experience_years?: number
  education?: string
  certifications?: string
  profile_image?: string
  date_joined: string
  is_approved: boolean
  approval_status: string
  courses_count: number
  students_count: number
  rating?: number
  total_hours?: number
}

interface ProfileEditProps {
  profile: TeacherProfile | null
  onSave: (data: Partial<TeacherProfile>) => void
  onCancel: () => void
}

export default function ProfileEdit({ profile, onSave, onCancel }: ProfileEditProps) {
  const [formData, setFormData] = useState({
    first_name: profile?.first_name || '',
    last_name: profile?.last_name || '',
    phone: profile?.phone || '',
    address: profile?.address || '',
    bio: profile?.bio || '',
    specialization: profile?.specialization || '',
    experience_years: profile?.experience_years || 0,
    education: profile?.education || '',
    certifications: profile?.certifications || ''
  })

  const [saving, setSaving] = useState(false)

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    
    try {
      await onSave(formData)
    } finally {
      setSaving(false)
    }
  }

  if (!profile) {
    return (
      <Card className="border-2 border-gray-200">
        <CardContent className="p-8">
          <div className="text-center text-gray-500">
            لا توجد بيانات للتعديل
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Personal Information */}
      <Card className="border-2 border-blue-100 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardTitle className="text-blue-800 flex items-center gap-2">
            <User className="w-5 h-5" />
            تعديل المعلومات الشخصية
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
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
                className="text-right"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="last_name" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                اسم العائلة
              </Label>
              <Input
                id="last_name"
                value={formData.last_name}
                onChange={(e) => handleInputChange('last_name', e.target.value)}
                placeholder="أدخل اسم العائلة"
                className="text-right"
              />
            </div>
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
              className="text-right"
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
              className="text-right"
            />
          </div>
        </CardContent>
      </Card>

      {/* Professional Information */}
      <Card className="border-2 border-green-100 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
          <CardTitle className="text-green-800 flex items-center gap-2">
            <Award className="w-5 h-5" />
            المعلومات المهنية
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="space-y-2">
            <Label htmlFor="specialization" className="flex items-center gap-2">
              <Award className="w-4 h-4" />
              التخصص
            </Label>
            <Input
              id="specialization"
              value={formData.specialization}
              onChange={(e) => handleInputChange('specialization', e.target.value)}
              placeholder="أدخل تخصصك"
              className="text-right"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="experience_years" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              سنوات الخبرة
            </Label>
            <Input
              id="experience_years"
              type="number"
              min="0"
              max="50"
              value={formData.experience_years}
              onChange={(e) => handleInputChange('experience_years', parseInt(e.target.value) || 0)}
              placeholder="أدخل عدد سنوات الخبرة"
              className="text-right"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="education" className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4" />
              المؤهل التعليمي
            </Label>
            <Input
              id="education"
              value={formData.education}
              onChange={(e) => handleInputChange('education', e.target.value)}
              placeholder="أدخل مؤهلك التعليمي"
              className="text-right"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="certifications" className="flex items-center gap-2">
              <Award className="w-4 h-4" />
              الشهادات (مفصولة بفاصلة)
            </Label>
            <Input
              id="certifications"
              value={formData.certifications}
              onChange={(e) => handleInputChange('certifications', e.target.value)}
              placeholder="شهادة 1, شهادة 2, شهادة 3"
              className="text-right"
            />
          </div>
        </CardContent>
      </Card>

      {/* Bio Section */}
      <Card className="border-2 border-purple-100 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50">
          <CardTitle className="text-purple-800 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            النبذة الشخصية
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <Label htmlFor="bio" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              اكتب نبذة عن نفسك
            </Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              placeholder="اكتب نبذة شخصية تعرف بك وبخبراتك..."
              className="min-h-[120px] text-right"
              maxLength={500}
            />
            <div className="text-sm text-gray-500 text-left">
              {formData.bio.length}/500 حرف
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex items-center gap-4 justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={saving}
          className="px-6"
        >
          <X className="w-4 h-4 ml-2" />
          إلغاء
        </Button>
        
        <Button
          type="submit"
          disabled={saving}
          className="bg-[#2d7d32] hover:bg-[#1b5e20] px-6"
        >
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin ml-2"></div>
              جاري الحفظ...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 ml-2" />
              حفظ التغييرات
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
