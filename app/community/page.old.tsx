'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { EnhancedPagination } from '@/components/ui/pagination'
import {
  MessageSquare,
  Users,
  Plus,
  Search,
  Globe,
  RefreshCw,
  AlertCircle,
  X,
  BarChart3,
  Sparkles
} from 'lucide-react';
import { Spinner } from '@/components/ui/spinner'
import { communityApi } from '@/lib/api/community'
import {
  useCommunityPermissions,
  PermissionGate
} from '@/components/CommunityPermissions'
import CommunityTopicCard from '@/components/CommunityTopicCard'
import CommunityForumCard from '@/components/CommunityForumCard'
import CommunitySkeletonLoader from '@/components/CommunitySkeletonLoader'
import CommunityError from '@/components/CommunityError'
import { useCommunityData } from '@/hooks/useCommunityData'
import { useRouter } from 'next/navigation'
import AuthGuard from '@/components/AuthGuard'

// Error boundary component
const ErrorBoundary = ({ children, fallback }: { children: React.ReactNode, fallback: React.ReactNode }) => {
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    const handleError = () => setHasError(true)
    window.addEventListener('error', handleError)
    return () => window.removeEventListener('error', handleError)
  }, [])

  if (hasError) {
    return fallback
  }

  return children
}

const ErrorFallback = () => (
  <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
    <Card className="max-w-md w-full bg-white/80 backdrop-blur-sm shadow-lg border-red-200">
      <CardContent className="py-8 text-center">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-red-800 mb-2">حدث خطأ غير متوقع</h2>
        <p className="text-red-600 mb-6">نعتذر عن المشكلة، يرجى المحاولة لاحقاً</p>
        <Button 
          onClick={() => window.location.reload()} 
          className="bg-red-600 hover:bg-red-700 text-white"
        >
          <RefreshCw className="w-4 h-4 ml-2" />
          إعادة تحميل الصفحة
        </Button>
      </CardContent>
    </Card>
  </div>
)

const CommunityPage = () => {
  const router = useRouter()
  const { toast } = useToast()
  const permissions = useCommunityPermissions()
  
  const [selectedForum, setSelectedForum] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('')
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newTopic, setNewTopic] = useState({ title: '', content: '', forum: '' })
  const [submitting, setSubmitting] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [sortBy, setSortBy] = useState('newest')
  const [filterBy, setFilterBy] = useState('all')
  
  const {
    forums,
    topics,
    loading,
    topicsLoading,
    error,
    topicsError,
    loadForums,
    loadTopics,
    currentPage,
    setCurrentPage,
    totalPages,
    pageSize,
    totalTopics,
    forumStats,
    topicsRetryCount
  } = useCommunityData()

  // Enhanced error handling with retry logic
  const handleApiError = useCallback((error: any, operation: string) => {
    console.error(`Error in ${operation}:`, error)
    
    let errorMessage = 'حدث خطأ غير متوقع'
    
    if (error.response?.status === 401) {
      errorMessage = 'يجب تسجيل الدخول أولاً'
    } else if (error.response?.status === 403) {
      errorMessage = 'ليس لديك صلاحية للقيام بهذا الإجراء'
    } else if (error.response?.status === 404) {
      errorMessage = 'لم يتم العثور على المورد المطلوب'
    } else if (error.response?.status >= 500) {
      errorMessage = 'خطأ في الخادم، يرجى المحاولة لاحقاً'
    } else if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error')) {
      errorMessage = 'فشل الاتصال بالخادم، يرجى التحقق من اتصال الإنترنت'
    } else if (error.message) {
      errorMessage = error.message
    }
    
    toast({
      title: 'خطأ',
      description: errorMessage,
      variant: 'destructive',
    })
  }, [toast])

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, 500)
    
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Load data when search or forum changes
  useEffect(() => {
    if (debouncedSearchQuery !== undefined) {
      loadTopics({ 
        forum: selectedForum || undefined,
        search: debouncedSearchQuery,
        page: currentPage,
        page_size: pageSize,
        sort_by: sortBy,
        filter_by: filterBy
      })
    }
  }, [selectedForum, debouncedSearchQuery, currentPage, loadTopics, pageSize, sortBy, filterBy])

  const handleCreateTopic = async () => {
    if (!newTopic.title.trim() || !newTopic.content.trim()) {
      toast({
        title: 'خطأ',
        description: 'يرجى ملء جميع الحقول المطلوبة',
        variant: 'destructive',
      })
      return
    }
    
    if (!selectedForum && !newTopic.forum) {
      toast({
        title: 'خطأ',
        description: 'يرجى اختيار منتدى للموضوع',
        variant: 'destructive',
      })
      return
    }
    
    setSubmitting(true)
    try {
      await communityApi.createTopic({
        title: newTopic.title,
        content: newTopic.content,
        forum: newTopic.forum || selectedForum || ''
      })
      
      toast({
        title: "تم بنجاح",
        description: "تم إنشاء الموضوع بنجاح",
        variant: "default"
      })
      
      setShowCreateDialog(false)
      setNewTopic({ title: '', content: '', forum: '' })
      loadTopics() // Reload topics
    } catch (error) {
      handleApiError(error, 'إنشاء الموضوع')
    } finally {
      setSubmitting(false)
    }
  }

  const handleTopicClick = (topicId: string) => {
    router.push(`/community/${topicId}`)
  }

  const handleCreateTopicInForum = (forumId: string) => {
    setSelectedForum(forumId)
    setShowCreateDialog(true)
  }

  return (
    <AuthGuard requireAuth={true}>
      <ErrorBoundary fallback={<ErrorFallback />}>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-50 to-teal-50 p-4 md:p-6" dir="rtl">
          <div className="max-w-7xl mx-auto">
            {/* Islamic Header */}
            <div className="mb-8 text-center">
              <div className="mb-4 p-4 bg-gradient-to-r from-blue-100 to-blue-100 rounded-lg border border-blue-200">
                <div className="text-2xl font-bold text-blue-800 mb-2" style={{ fontFamily: 'Amiri, serif' }}>
                  ﴿وَقُل رَّبِّ زِدْنِي عِلْمًا﴾
                </div>
                <div className="text-sm text-blue-600">
                  سورة طه - آية 114
                </div>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-800 to-blue-800 bg-clip-text text-transparent mb-2">
                المجتمع التعليمي - لسان الحكمة
              </h1>
              <p className="text-slate-600 max-w-2xl mx-auto">
                انضم إلى النقاشات وشارك في تبادل المعرفة مع زملائك في التعلم
              </p>
              <div className="flex justify-center items-center gap-2 mt-4">
                <div className="h-px bg-gradient-to-r from-transparent via-blue-300 to-transparent flex-1 max-w-32"></div>
                <div className="text-blue-600 text-sm">✦</div>
                <div className="h-px bg-gradient-to-r from-transparent via-blue-300 to-transparent flex-1 max-w-32"></div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Forums Sidebar - Fixed RTL positioning */}
              <div className="lg:col-span-1 order-2 lg:order-1 space-y-4">
                <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-blue-100 sticky top-4">
                  <CardHeader className="bg-gradient-to-l from-blue-50 to-blue-50 rounded-t-lg pb-3 border-b border-blue-100">
                    <CardTitle className="text-lg bg-gradient-to-l from-blue-700 to-blue-700 bg-clip-text text-transparent flex items-center gap-2 justify-start">
                      <div className="p-2 rounded-lg bg-gradient-to-l from-blue-500 to-blue-500 text-white shadow-sm">
                        <Users className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold">منتديات لسان الحكمة</div>
                        <div className="text-xs text-slate-600 font-normal">اختر منتدى للمشاركة</div>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto">
                      {loading ? (
                        <div className="space-y-3">
                          {[1, 2, 3, 4].map(i => (
                            <div key={i} className="animate-pulse h-20 bg-gradient-to-l from-blue-100 to-blue-100 rounded-lg"></div>
                          ))}
                        </div>
                      ) : error ? (
                        <div className="text-center py-8">
                          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
                          <p className="text-red-600 text-sm">فشل في تحميل المنتديات</p>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => loadForums()}
                            className="mt-2 border-red-200 text-red-600 hover:bg-red-50"
                          >
                            <RefreshCw className="w-4 h-4 ml-1" />
                            إعادة المحاولة
                          </Button>
                        </div>
                      ) : (
                        <>
                          {/* All Forums Button */}
                          <div className="mb-4">
                            <Button
                              variant={selectedForum === null ? "default" : "outline"}
                              className={`w-full justify-start text-right h-auto p-4 ${
                                selectedForum === null 
                                  ? 'bg-gradient-to-l from-blue-600 to-blue-600 text-white shadow-md hover:shadow-lg' 
                                  : 'border-blue-200 hover:bg-blue-50 text-blue-700'
                              }`}
                              onClick={() => {
                                setSelectedForum(null)
                                setCurrentPage(1)
                              }}
                            >
                              <div className="flex items-center gap-3 w-full">
                                <div className={`p-2.5 rounded-lg ${
                                  selectedForum === null 
                                    ? 'bg-white/20 text-white' 
                                    : 'bg-gradient-to-l from-blue-500 to-blue-500 text-white'
                                } shadow-sm`}>
                                  <Globe className="w-5 h-5" />
                                </div>
                                <div className="text-right flex-1">
                                  <div className="font-bold text-base">جميع المنتديات</div>
                                  <div className="text-sm opacity-80">عرض كافة المواضيع</div>
                                </div>
                                {selectedForum === null && (
                                  <div className="text-white/80">
                                    <Sparkles className="w-4 h-4" />
                                  </div>
                                )}
                              </div>
                            </Button>
                          </div>
                          
                          {/* Divider */}
                          <div className="flex items-center gap-2 my-4">
                            <div className="h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent flex-1"></div>
                            <div className="text-blue-600 text-xs font-medium px-2">المنتديات المتخصصة</div>
                            <div className="h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent flex-1"></div>
                          </div>
                          
                          {forums.map(forum => (
                            <CommunityForumCard
                              key={forum.id}
                              forum={forum}
                              isSelected={selectedForum === forum.id}
                              onSelect={(forumId) => {
                                setSelectedForum(forumId)
                                setCurrentPage(1)
                              }}
                              onCreateTopic={handleCreateTopicInForum}
                            />
                          ))}
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Stats Card */}
                {selectedForum && forumStats && (
                  <Card className="bg-gradient-to-bl from-blue-50 to-blue-50 border-blue-200 shadow-lg">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <BarChart3 className="w-5 h-5 text-blue-700" />
                        <h3 className="font-semibold text-blue-800">إحصائيات المنتدى</h3>
                      </div>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between items-center p-2 bg-white/60 rounded-lg">
                          <span className="text-blue-700 font-medium">المواضيع:</span>
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                            {forumStats.topics_count}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-white/60 rounded-lg">
                          <span className="text-blue-700 font-medium">المشاركات:</span>
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                            {forumStats.posts_count}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Topics Content - Fixed RTL positioning */}
              <div className="lg:col-span-3 order-1 lg:order-2 space-y-6">
                {/* Enhanced Search and Create */}
                <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-blue-100">
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                      {/* Enhanced Search Bar */}
                      <div className="relative flex-1">
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                          <Search className="h-4 w-4 text-slate-400" />
                          {searchQuery && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 hover:bg-slate-100"
                              onClick={() => setSearchQuery('')}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                        <Input
                          placeholder="ابحث في المواضيع والمشاركات..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pr-16 pl-4 h-12 border-blue-200 focus:border-blue-400 focus:ring-blue-200 text-right bg-white/80 backdrop-blur-sm"
                          dir="rtl"
                        />
                        {searchQuery && (
                          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                            <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-xs">
                              <Sparkles className="w-3 h-3 ml-1" />
                              بحث نشط
                            </Badge>
                          </div>
                        )}
                      </div>
                      
                      {/* Sorting and Filtering Controls */}
                      <div className="flex gap-2">
                        <Select value={sortBy} onValueChange={setSortBy}>
                          <SelectTrigger className="text-right border-blue-200 focus:border-blue-400 w-[120px]">
                            <SelectValue placeholder="ترتيب حسب" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="created_at">الأحدث</SelectItem>
                            <SelectItem value="replies_count">الأكثر ردود</SelectItem>
                            <SelectItem value="views_count">الأكثر مشاهدة</SelectItem>
                            <SelectItem value="likes_count">الأكثر إعجاب</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        <Select value={filterBy} onValueChange={setFilterBy}>
                          <SelectTrigger className="text-right border-blue-200 focus:border-blue-400 w-[120px]">
                            <SelectValue placeholder="التصنيف" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">الكل</SelectItem>
                            <SelectItem value="unanswered">بدون ردود</SelectItem>
                            <SelectItem value="popular">شائع</SelectItem>
                            <SelectItem value="bookmarked">محدد بعلامة</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {/* Create Topic Button - Always Visible */}
                      <PermissionGate permission="canCreateTopics">
                        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                          <DialogTrigger asChild>
                            <Button className="bg-gradient-to-l from-blue-600 to-blue-600 hover:from-blue-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 whitespace-nowrap h-12 px-6">
                              <Plus className="w-5 h-5 ml-2" />
                              موضوع جديد
                            </Button>
                          </DialogTrigger>
                          <DialogContent dir="rtl" className="border-blue-100 max-w-md sm:max-w-lg">
                            <DialogHeader>
                              <DialogTitle className="bg-gradient-to-l from-blue-700 to-blue-700 bg-clip-text text-transparent text-right">
                                إنشاء موضوع جديد
                              </DialogTitle>
                              <DialogDescription className="text-slate-600 text-right">
                                ابدأ نقاشاً جديداً في المنتدى
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              {!selectedForum && (
                                <div>
                                  <label className="text-sm font-medium mb-2 block text-slate-700 text-right">اختر المنتدى</label>
                                  <Select value={newTopic.forum} onValueChange={(value) => setNewTopic({...newTopic, forum: value})}>
                                    <SelectTrigger className="text-right border-blue-200 focus:border-blue-400">
                                      <SelectValue placeholder="اختر منتدى للموضوع" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {forums.map(forum => (
                                        <SelectItem key={forum.id} value={forum.id}>
                                          {forum.name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              )}
                              <div>
                                <label className="text-sm font-medium mb-2 block text-slate-700 text-right">العنوان</label>
                                <Input
                                  placeholder="عنوان الموضوع"
                                  value={newTopic.title}
                                  onChange={(e) => setNewTopic({...newTopic, title: e.target.value})}
                                  className="border-blue-200 focus:border-blue-400 focus:ring-blue-200 text-right"
                                  dir="rtl"
                                />
                              </div>
                              <div>
                                <label className="text-sm font-medium mb-2 block text-slate-700 text-right">المحتوى</label>
                                <Textarea
                                  placeholder="محتوى الموضوع"
                                  value={newTopic.content}
                                  onChange={(e) => setNewTopic({...newTopic, content: e.target.value})}
                                  rows={4}
                                  className="border-blue-200 focus:border-blue-400 focus:ring-blue-200 resize-none text-right"
                                  dir="rtl"
                                />
                              </div>
                              <div className="flex gap-3 justify-end">
                                <Button 
                                  variant="outline" 
                                  onClick={() => setShowCreateDialog(false)}
                                  className="border-blue-200 hover:bg-blue-50 hover:border-blue-300"
                                >
                                  إلغاء
                                </Button>
                                <Button 
                                  onClick={handleCreateTopic}
                                  disabled={!newTopic.title.trim() || !newTopic.content.trim() || submitting}
                                  className="bg-gradient-to-l from-blue-600 to-blue-600 hover:from-blue-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                                >
                                  {submitting && <Spinner size="sm" tone="contrast" className="ml-2" />}
                                  إنشاء
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </PermissionGate>
                    </div>
                  </CardContent>
                </Card>

                {/* Topics List */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                    <h2 className="text-xl font-semibold bg-gradient-to-l from-blue-700 to-blue-700 bg-clip-text text-transparent">
                      {selectedForum ? `المواضيع في ${forums.find(f => f.id === selectedForum)?.name}` : 'جميع المواضيع'}
                    </h2>
                    {totalTopics > 0 && (
                      <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                        {totalTopics} موضوع
                      </Badge>
                    )}
                  </div>

                  {topicsLoading ? (
                    <CommunitySkeletonLoader />
                  ) : topicsError ? (
                    <CommunityError 
                      error={topicsError}
                      onRetry={() => loadTopics({ forum: selectedForum, search: searchQuery, page: currentPage, page_size: pageSize })}
                      retryCount={topicsRetryCount}
                      operation="topics"
                    />
                  ) : topics.length === 0 ? (
                    <Card className="bg-gradient-to-bl from-amber-50 to-orange-50 border-amber-200 shadow-lg">
                      <CardContent className="py-12 text-center">
                        <div className="p-4 bg-gradient-to-bl from-amber-100 to-orange-100 rounded-full w-fit mx-auto mb-4">
                          <MessageSquare className="w-8 h-8 text-amber-600" />
                        </div>
                        <p className="text-amber-800 font-medium text-lg">
                          {searchQuery ? 'لا توجد مواضيع مطابقة للبحث' : 'لا توجد مواضيع في هذا المنتدى'}
                        </p>
                        <p className="text-amber-600 mt-2">
                          كن أول من يبدأ نقاشاً جديداً
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 gap-4">
                        {topics.map(topic => (
                          <CommunityTopicCard
                            key={topic.id}
                            topic={topic}
                            onTopicClick={handleTopicClick}
                            onReloadTopics={() => loadTopics({ forum: selectedForum, search: searchQuery, page: currentPage, page_size: pageSize })}
                          />
                        ))}
                      </div>

                      {/* Pagination */}
                      {totalPages > 1 && (
                        <div className="flex justify-center mt-8">
                          <EnhancedPagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={(page) => {
                              setCurrentPage(page)
                              loadTopics({ forum: selectedForum, search: searchQuery, page, page_size: pageSize })
                            }}
                            totalItems={totalTopics}
                            itemsPerPage={pageSize}
                          />
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </ErrorBoundary>
    </AuthGuard>
  )
}

export default CommunityPage




