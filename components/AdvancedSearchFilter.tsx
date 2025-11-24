'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Calendar } from '@/components/ui/calendar'
import { 
  Search, 
  Filter, 
  X, 
  Calendar as CalendarIcon,
  Users,
  MessageSquare,
  Heart,
  Eye,
  Clock,
  Tag,
  User,
  SlidersHorizontal,
  RefreshCw,
  BookOpen,
  Star,
  TrendingUp,
  ArrowUpDown
} from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'

interface SearchFilters {
  query: string
  forums: string[]
  authors: string[]
  dateRange: {
    from?: Date
    to?: Date
  }
  sortBy: 'relevance' | 'date' | 'popularity' | 'replies' | 'views'
  sortOrder: 'asc' | 'desc'
  postType: 'all' | 'topics' | 'replies'
  minReplies: number
  minViews: number
  minLikes: number
  tags: string[]
  hasAttachments: boolean
  isPinned?: boolean
  isLocked?: boolean
  authorRole: 'all' | 'student' | 'teacher' | 'supervisor' | 'admin'
}

interface AdvancedSearchFilterProps {
  onFiltersChange: (filters: SearchFilters) => void
  initialFilters?: Partial<SearchFilters>
  className?: string
}

const AdvancedSearchFilter = ({ onFiltersChange, initialFilters, className }: AdvancedSearchFilterProps) => {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    forums: [],
    authors: [],
    dateRange: {},
    sortBy: 'relevance',
    sortOrder: 'desc',
    postType: 'all',
    minReplies: 0,
    minViews: 0,
    minLikes: 0,
    tags: [],
    hasAttachments: false,
    authorRole: 'all',
    ...initialFilters
  })

  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false)
  const [savedSearches, setSavedSearches] = useState<Array<{id: string, name: string, filters: SearchFilters}>>([])

  // Mock data - في التطبيق الحقيقي سيتم جلبها من API
  const availableForums = [
    { id: 'quran', name: 'حفظ القرآن الكريم', count: 245 },
    { id: 'islamic', name: 'الدراسات الإسلامية', count: 189 },
    { id: 'arabic', name: 'اللغة العربية', count: 156 },
    { id: 'tajweed', name: 'علم التجويد', count: 98 }
  ]

  const availableTags = [
    'تفسير', 'حديث', 'فقه', 'سيرة', 'أخلاق', 'عقيدة', 'تجويد', 'قراءات', 'نحو', 'صرف'
  ]

  const popularAuthors = [
    { id: '1', name: 'أحمد محمد', role: 'teacher', posts: 156 },
    { id: '2', name: 'فاطمة علي', role: 'supervisor', posts: 89 },
    { id: '3', name: 'محمد أحمد', role: 'teacher', posts: 67 }
  ]

  const updateFilters = useCallback((newFilters: Partial<SearchFilters>) => {
    const updatedFilters = { ...filters, ...newFilters }
    setFilters(updatedFilters)
    onFiltersChange(updatedFilters)
  }, [filters, onFiltersChange])

  const clearFilters = () => {
    const defaultFilters: SearchFilters = {
      query: '',
      forums: [],
      authors: [],
      dateRange: {},
      sortBy: 'relevance',
      sortOrder: 'desc',
      postType: 'all',
      minReplies: 0,
      minViews: 0,
      minLikes: 0,
      tags: [],
      hasAttachments: false,
      authorRole: 'all'
    }
    setFilters(defaultFilters)
    onFiltersChange(defaultFilters)
  }

  const saveCurrentSearch = () => {
    const name = prompt('اسم البحث المحفوظ:')
    if (name) {
      const newSearch = {
        id: Date.now().toString(),
        name,
        filters: { ...filters }
      }
      setSavedSearches(prev => [...prev, newSearch])
    }
  }

  const loadSavedSearch = (savedFilters: SearchFilters) => {
    setFilters(savedFilters)
    onFiltersChange(savedFilters)
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (filters.query) count++
    if (filters.forums.length > 0) count++
    if (filters.authors.length > 0) count++
    if (filters.dateRange.from || filters.dateRange.to) count++
    if (filters.tags.length > 0) count++
    if (filters.minReplies > 0) count++
    if (filters.minViews > 0) count++
    if (filters.minLikes > 0) count++
    if (filters.hasAttachments) count++
    if (filters.isPinned !== undefined) count++
    if (filters.isLocked !== undefined) count++
    if (filters.authorRole !== 'all') count++
    return count
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main Search Bar */}
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-blue-100">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                placeholder="ابحث في المواضيع والمشاركات..."
                value={filters.query}
                onChange={(e) => updateFilters({ query: e.target.value })}
                className="pr-10 border-blue-200 focus:border-blue-400 focus:ring-blue-200"
              />
            </div>
            
            <Button
              variant="outline"
              onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
              className={`border-blue-200 hover:bg-blue-50 ${
                getActiveFiltersCount() > 0 ? 'bg-blue-50 border-blue-300' : ''
              }`}
            >
              <SlidersHorizontal className="h-4 w-4 ml-2" />
              فلترة متقدمة
              {getActiveFiltersCount() > 0 && (
                <Badge className="mr-2 bg-blue-500 text-white">
                  {getActiveFiltersCount()}
                </Badge>
              )}
            </Button>

            {getActiveFiltersCount() > 0 && (
              <Button
                variant="ghost"
                onClick={clearFilters}
                className="text-slate-500 hover:text-slate-700"
              >
                <X className="h-4 w-4 ml-2" />
                مسح
              </Button>
            )}
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap gap-2 mt-3">
            <Button
              variant={filters.sortBy === 'date' ? 'default' : 'outline'}
              size="sm"
              onClick={() => updateFilters({ sortBy: 'date', sortOrder: 'desc' })}
              className="text-xs"
            >
              <Clock className="h-3 w-3 ml-1" />
              الأحدث
            </Button>
            <Button
              variant={filters.sortBy === 'popularity' ? 'default' : 'outline'}
              size="sm"
              onClick={() => updateFilters({ sortBy: 'popularity', sortOrder: 'desc' })}
              className="text-xs"
            >
              <TrendingUp className="h-3 w-3 ml-1" />
              الأكثر شعبية
            </Button>
            <Button
              variant={filters.sortBy === 'replies' ? 'default' : 'outline'}
              size="sm"
              onClick={() => updateFilters({ sortBy: 'replies', sortOrder: 'desc' })}
              className="text-xs"
            >
              <MessageSquare className="h-3 w-3 ml-1" />
              الأكثر ردود
            </Button>
            <Button
              variant={filters.isPinned === true ? 'default' : 'outline'}
              size="sm"
              onClick={() => updateFilters({ isPinned: filters.isPinned === true ? undefined : true })}
              className="text-xs"
            >
              <Star className="h-3 w-3 ml-1" />
              مثبت
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Filters */}
      <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
        <CollapsibleContent>
          <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-blue-100">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg text-blue-800 flex items-center gap-2">
                <Filter className="h-5 w-5" />
                الفلترة المتقدمة
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Forums Filter */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-slate-700">المنتديات</Label>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {availableForums.map((forum) => (
                      <div key={forum.id} className="flex items-center space-x-2 space-x-reverse">
                        <Checkbox
                          id={`forum-${forum.id}`}
                          checked={filters.forums.includes(forum.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              updateFilters({ forums: [...filters.forums, forum.id] })
                            } else {
                              updateFilters({ forums: filters.forums.filter(f => f !== forum.id) })
                            }
                          }}
                        />
                        <label htmlFor={`forum-${forum.id}`} className="text-sm flex-1 cursor-pointer">
                          {forum.name}
                          <span className="text-slate-500 mr-1">({forum.count})</span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Author Role Filter */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-slate-700">دور المؤلف</Label>
                  <RadioGroup
                    value={filters.authorRole}
                    onValueChange={(value) => updateFilters({ authorRole: value as any })}
                  >
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <RadioGroupItem value="all" id="role-all" />
                      <Label htmlFor="role-all" className="text-sm cursor-pointer">الكل</Label>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <RadioGroupItem value="teacher" id="role-teacher" />
                      <Label htmlFor="role-teacher" className="text-sm cursor-pointer">معلم</Label>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <RadioGroupItem value="supervisor" id="role-supervisor" />
                      <Label htmlFor="role-supervisor" className="text-sm cursor-pointer">مشرف</Label>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <RadioGroupItem value="student" id="role-student" />
                      <Label htmlFor="role-student" className="text-sm cursor-pointer">طالب</Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Post Type Filter */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-slate-700">نوع المشاركة</Label>
                  <Select value={filters.postType} onValueChange={(value) => updateFilters({ postType: value as any })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع المشاركات</SelectItem>
                      <SelectItem value="topics">المواضيع فقط</SelectItem>
                      <SelectItem value="replies">الردود فقط</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Date Range Filter */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-slate-700">النطاق الزمني</Label>
                  <div className="flex gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="sm" className="flex-1">
                          <CalendarIcon className="h-4 w-4 ml-2" />
                          {filters.dateRange.from ? filters.dateRange.from.toLocaleDateString('ar-SA') : 'من'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={filters.dateRange.from}
                          onSelect={(date) => updateFilters({ 
                            dateRange: { ...filters.dateRange, from: date } 
                          })}
                        />
                      </PopoverContent>
                    </Popover>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="sm" className="flex-1">
                          <CalendarIcon className="h-4 w-4 ml-2" />
                          {filters.dateRange.to ? filters.dateRange.to.toLocaleDateString('ar-SA') : 'إلى'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={filters.dateRange.to}
                          onSelect={(date) => updateFilters({ 
                            dateRange: { ...filters.dateRange, to: date } 
                          })}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/* Tags Filter */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-slate-700">العلامات</Label>
                  <div className="flex flex-wrap gap-2">
                    {availableTags.map((tag) => (
                      <Badge
                        key={tag}
                        variant={filters.tags.includes(tag) ? 'default' : 'outline'}
                        className="cursor-pointer hover:bg-blue-100"
                        onClick={() => {
                          if (filters.tags.includes(tag)) {
                            updateFilters({ tags: filters.tags.filter(t => t !== tag) })
                          } else {
                            updateFilters({ tags: [...filters.tags, tag] })
                          }
                        }}
                      >
                        <Tag className="h-3 w-3 ml-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Sort Options */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-slate-700">ترتيب النتائج</Label>
                  <div className="flex gap-2">
                    <Select value={filters.sortBy} onValueChange={(value) => updateFilters({ sortBy: value as any })}>
                      <SelectTrigger className="flex-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="relevance">الصلة</SelectItem>
                        <SelectItem value="date">التاريخ</SelectItem>
                        <SelectItem value="popularity">الشعبية</SelectItem>
                        <SelectItem value="replies">عدد الردود</SelectItem>
                        <SelectItem value="views">عدد المشاهدات</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateFilters({ 
                        sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc' 
                      })}
                    >
                      <ArrowUpDown className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Numeric Filters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t">
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-slate-700">
                    الحد الأدنى للردود: {filters.minReplies}
                  </Label>
                  <Slider
                    value={[filters.minReplies]}
                    onValueChange={(value) => updateFilters({ minReplies: value[0] })}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-slate-700">
                    الحد الأدنى للمشاهدات: {filters.minViews}
                  </Label>
                  <Slider
                    value={[filters.minViews]}
                    onValueChange={(value) => updateFilters({ minViews: value[0] })}
                    max={1000}
                    step={10}
                    className="w-full"
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-slate-700">
                    الحد الأدنى للإعجابات: {filters.minLikes}
                  </Label>
                  <Slider
                    value={[filters.minLikes]}
                    onValueChange={(value) => updateFilters({ minLikes: value[0] })}
                    max={50}
                    step={1}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Additional Options */}
              <div className="flex flex-wrap gap-4 pt-4 border-t">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox
                    id="has-attachments"
                    checked={filters.hasAttachments}
                    onCheckedChange={(checked) => updateFilters({ hasAttachments: !!checked })}
                  />
                  <Label htmlFor="has-attachments" className="text-sm cursor-pointer">
                    يحتوي على مرفقات
                  </Label>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox
                    id="is-pinned"
                    checked={filters.isPinned === true}
                    onCheckedChange={(checked) => updateFilters({ 
                      isPinned: checked ? true : undefined 
                    })}
                  />
                  <Label htmlFor="is-pinned" className="text-sm cursor-pointer">
                    مثبت فقط
                  </Label>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox
                    id="is-locked"
                    checked={filters.isLocked === true}
                    onCheckedChange={(checked) => updateFilters({ 
                      isLocked: checked ? true : undefined 
                    })}
                  />
                  <Label htmlFor="is-locked" className="text-sm cursor-pointer">
                    مقفل فقط
                  </Label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between pt-4 border-t">
                <div className="flex gap-2">
                  <Button onClick={saveCurrentSearch} variant="outline" size="sm">
                    حفظ البحث
                  </Button>
                  {savedSearches.length > 0 && (
                    <Select onValueChange={(value) => {
                      const saved = savedSearches.find(s => s.id === value)
                      if (saved) loadSavedSearch(saved.filters)
                    }}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="بحث محفوظ" />
                      </SelectTrigger>
                      <SelectContent>
                        {savedSearches.map((saved) => (
                          <SelectItem key={saved.id} value={saved.id}>
                            {saved.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
                <Button onClick={clearFilters} variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 ml-2" />
                  إعادة تعيين
                </Button>
              </div>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>

      {/* Active Filters Display */}
      {getActiveFiltersCount() > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-blue-800">الفلاتر النشطة:</span>
              {filters.forums.length > 0 && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  المنتديات: {filters.forums.length}
                </Badge>
              )}
              {filters.tags.length > 0 && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  العلامات: {filters.tags.length}
                </Badge>
              )}
              {filters.authorRole !== 'all' && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  الدور: {filters.authorRole}
                </Badge>
              )}
              {(filters.dateRange.from || filters.dateRange.to) && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  التاريخ
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default AdvancedSearchFilter
