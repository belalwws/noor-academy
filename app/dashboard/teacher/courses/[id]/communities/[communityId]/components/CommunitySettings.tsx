'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { courseCommunitiesApi, type Community, type UpdateCommunityData } from '@/lib/api/course-communities'
import { toast } from 'sonner'
import { Loader2, Save, Settings } from 'lucide-react'

interface CommunitySettingsProps {
  community: Community
  onUpdate: () => void
}

export default function CommunitySettings({ community, onUpdate }: CommunitySettingsProps) {
  const [formData, setFormData] = useState<UpdateCommunityData>({
    name: community.name,
    description: community.description,
    rules: typeof community.rules === 'string' ? community.rules : Array.isArray(community.rules) ? community.rules.join('\n') : '',
    status: community.status,
    cover_image: community.cover_image
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (community) {
      setFormData({
        name: community.name,
        description: community.description,
        rules: typeof community.rules === 'string' ? community.rules : Array.isArray(community.rules) ? community.rules.join('\n') : '',
        status: community.status,
        cover_image: community.cover_image
      })
    }
  }, [community])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.description) {
      toast.error('يرجى ملء جميع الحقول المطلوبة')
      return
    }

    try {
      setSaving(true)
      // Convert rules string to array if needed
      const updateData: UpdateCommunityData = {
        ...formData,
        rules: formData.rules ? (typeof formData.rules === 'string' ? formData.rules.split('\n').filter(r => r.trim()) : formData.rules) : undefined
      }
      await courseCommunitiesApi.patch(community.id, updateData)
      toast.success('تم تحديث المجتمع بنجاح')
      onUpdate()
    } catch (error: any) {
      console.error('Error updating community:', error)
      toast.error(error?.data?.detail || error?.message || 'فشل تحديث المجتمع')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card className="shadow-lg border-2">
      <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-b border-amber-200 dark:border-amber-800">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-lg">
            <Settings className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <CardTitle className="text-xl">إعدادات المجتمع</CardTitle>
            <CardDescription>
              قم بتحديث معلومات المجتمع وإعداداته
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">اسم المجتمع *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="اسم المجتمع"
              required
              className="text-base"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">الوصف *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="وصف المجتمع"
              rows={4}
              required
              className="text-base"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="rules">قواعد المجتمع</Label>
            <Textarea
              id="rules"
              value={formData.rules}
              onChange={(e) => setFormData({ ...formData, rules: e.target.value })}
              placeholder="قواعد المجتمع (كل قاعدة في سطر جديد)"
              rows={6}
              className="text-base"
            />
            <p className="text-xs text-gray-500">
              كل قاعدة في سطر جديد
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">حالة المجتمع</Label>
            <Select
              value={formData.status}
              onValueChange={(value: 'active' | 'archived') => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger className="text-base">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">نشط</SelectItem>
                <SelectItem value="archived">مؤرشف</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cover_image">رابط صورة الغلاف</Label>
            <Input
              id="cover_image"
              value={formData.cover_image || ''}
              onChange={(e) => setFormData({ ...formData, cover_image: e.target.value })}
              placeholder="https://example.com/cover.jpg"
              type="url"
              className="text-base"
            />
          </div>

          {formData.cover_image && (
            <div className="space-y-2">
              <Label>معاينة صورة الغلاف</Label>
              <div className="rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700">
                <img
                  src={formData.cover_image}
                  alt="Cover preview"
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none'
                  }}
                />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="submit"
              disabled={saving || !formData.name || !formData.description}
              className="bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 hover:from-amber-600 hover:via-amber-700 hover:to-orange-700 text-white shadow-lg"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  حفظ التغييرات
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

