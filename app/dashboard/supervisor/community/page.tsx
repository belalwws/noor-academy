'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useToast } from '@/components/ui/use-toast'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  Users, 
  MessageSquare, 
  Flag, 
  TrendingUp,
  Eye,
  Pin,
  Lock,
  Unlock,
  PinOff,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  BarChart3,
  Activity
} from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'
import { communityApi, type CommunityStats, type Report, type Topic, type Forum } from '@/lib/api/community'
import { useAuth } from '@/lib/hooks/useAuth'

const CommunitySupervisorPage = () => {
  const [stats, setStats] = useState<CommunityStats | null>(null)
  const [reports, setReports] = useState<Report[]>([])
  const [topics, setTopics] = useState<Topic[]>([])
  const [forums, setForums] = useState<Forum[]>([])
  const [loading, setLoading] = useState(true)
  const [reportsLoading, setReportsLoading] = useState(false)
  const [topicsLoading, setTopicsLoading] = useState(false)
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [showReportDialog, setShowReportDialog] = useState(false)
  const [resolutionNotes, setResolutionNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [statsData, reportsData, topicsData, forumsData] = await Promise.all([
        communityApi.getCommunityStats(),
        communityApi.getReports({ status: 'pending' }),
        communityApi.getTopics({ page_size: 20 }),
        communityApi.getForums()
      ])
      
      setStats(statsData)
      setReports(reportsData.results)
      setTopics(topicsData.results)
      setForums(forumsData)
    } catch (error) {
      console.error('Error loading data:', error)
      toast({
        title: "خطأ",
        description: "حدث خطأ في تحميل البيانات",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const loadReports = async () => {
    setReportsLoading(true)
    try {
      const reportsData = await communityApi.getReports()
      setReports(reportsData.results)
    } catch (error) {
      console.error('Error loading reports:', error)
      toast({
        title: "خطأ",
        description: "حدث خطأ في تحميل البلاغات",
        variant: "destructive"
      })
    } finally {
      setReportsLoading(false)
    }
  }

  const loadTopics = async () => {
    setTopicsLoading(true)
    try {
      const topicsData = await communityApi.getTopics({ page_size: 50 })
      setTopics(topicsData.results)
    } catch (error) {
      console.error('Error loading topics:', error)
      toast({
        title: "خطأ",
        description: "حدث خطأ في تحميل المواضيع",
        variant: "destructive"
      })
    } finally {
      setTopicsLoading(false)
    }
  }

  const handlePinTopic = async (topicId: string) => {
    try {
      await communityApi.pinTopic(topicId)
      toast({
        title: "تم بنجاح",
        description: "تم تثبيت/إلغاء تثبيت الموضوع"
      })
      loadTopics()
    } catch (error) {
      console.error('Error pinning topic:', error)
      toast({
        title: "خطأ",
        description: "حدث خطأ في تثبيت الموضوع",
        variant: "destructive"
      })
    }
  }

  const handleLockTopic = async (topicId: string) => {
    try {
      await communityApi.lockTopic(topicId)
      toast({
        title: "تم بنجاح",
        description: "تم إغلاق/فتح الموضوع"
      })
      loadTopics()
    } catch (error) {
      console.error('Error locking topic:', error)
      toast({
        title: "خطأ",
        description: "حدث خطأ في إغلاق الموضوع",
        variant: "destructive"
      })
    }
  }

  const handleResolveReport = async () => {
    if (!selectedReport || !resolutionNotes.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى إضافة ملاحظات الحل",
        variant: "destructive"
      })
      return
    }

    setSubmitting(true)
    try {
      await communityApi.resolveReport(selectedReport.id, resolutionNotes)
      toast({
        title: "تم بنجاح",
        description: "تم حل البلاغ بنجاح"
      })
      setShowReportDialog(false)
      setSelectedReport(null)
      setResolutionNotes('')
      loadReports()
    } catch (error) {
      console.error('Error resolving report:', error)
      toast({
        title: "خطأ",
        description: "حدث خطأ في حل البلاغ",
        variant: "destructive"
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDismissReport = async () => {
    if (!selectedReport || !resolutionNotes.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى إضافة ملاحظات الرفض",
        variant: "destructive"
      })
      return
    }

    setSubmitting(true)
    try {
      await communityApi.dismissReport(selectedReport.id, resolutionNotes)
      toast({
        title: "تم بنجاح",
        description: "تم رفض البلاغ"
      })
      setShowReportDialog(false)
      setSelectedReport(null)
      setResolutionNotes('')
      loadReports()
    } catch (error) {
      console.error('Error dismissing report:', error)
      toast({
        title: "خطأ",
        description: "حدث خطأ في رفض البلاغ",
        variant: "destructive"
      })
    } finally {
      setSubmitting(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getReasonLabel = (reason: string) => {
    const reasons: Record<string, string> = {
      'inappropriate': 'محتوى غير مناسب',
      'spam': 'رسائل مزعجة',
      'harassment': 'تحرش أو إساءة',
      'false_info': 'معلومات خاطئة',
      'other': 'أخرى'
    }
    return reasons[reason] || reason
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'reviewed': return 'bg-blue-100 text-blue-800'
      case 'resolved': return 'bg-blue-100 text-blue-800'
      case 'dismissed': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    const statuses: Record<string, string> = {
      'pending': 'قيد المراجعة',
      'reviewed': 'تمت المراجعة',
      'resolved': 'تم الحل',
      'dismissed': 'تم الرفض'
    }
    return statuses[status] || status
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-24 bg-slate-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-slate-800">إدارة المجتمع التفاعلي</h1>
          <p className="text-lg text-slate-600">
            لوحة تحكم المشرفين لإدارة المنتديات والمواضيع والبلاغات
          </p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">إجمالي المنتديات</p>
                    <p className="text-3xl font-bold text-slate-900">{stats.total_forums}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">إجمالي المواضيع</p>
                    <p className="text-3xl font-bold text-slate-900">{stats.total_topics}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <MessageSquare className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">إجمالي المشاركات</p>
                    <p className="text-3xl font-bold text-slate-900">{stats.total_posts}</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-full">
                    <BarChart3 className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">البلاغات المعلقة</p>
                    <p className="text-3xl font-bold text-red-600">{stats.pending_reports}</p>
                  </div>
                  <div className="p-3 bg-red-100 rounded-full">
                    <Flag className="w-6 h-6 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs defaultValue="reports" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto">
            <TabsTrigger value="reports">البلاغات</TabsTrigger>
            <TabsTrigger value="topics">المواضيع</TabsTrigger>
            <TabsTrigger value="forums">المنتديات</TabsTrigger>
          </TabsList>

          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Flag className="w-5 h-5" />
                  إدارة البلاغات
                </CardTitle>
                <CardDescription>
                  مراجعة وحل البلاغات المرسلة من المستخدمين
                </CardDescription>
              </CardHeader>
              <CardContent>
                {reportsLoading ? (
                  <div className="flex justify-center py-8">
                    <Spinner size="lg" />
                  </div>
                ) : reports.length === 0 ? (
                  <div className="text-center py-8">
                    <Flag className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-600">لا توجد بلاغات</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>المبلغ</TableHead>
                        <TableHead>السبب</TableHead>
                        <TableHead>الحالة</TableHead>
                        <TableHead>التاريخ</TableHead>
                        <TableHead>الإجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reports.map((report) => (
                        <TableRow key={report.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="w-8 h-8">
                                <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">
                                  {report.reporter.full_name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium">{report.reporter.full_name}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {getReasonLabel(report.reason)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(report.status)}>
                              {getStatusLabel(report.status)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-slate-500">
                            {formatDate(report.created_at)}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedReport(report)
                                setShowReportDialog(true)
                              }}
                            >
                              مراجعة
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="topics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  إدارة المواضيع
                </CardTitle>
                <CardDescription>
                  تثبيت وإغلاق وحذف المواضيع
                </CardDescription>
              </CardHeader>
              <CardContent>
                {topicsLoading ? (
                  <div className="flex justify-center py-8">
                    <Spinner size="lg" />
                  </div>
                ) : topics.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-600">لا توجد مواضيع</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>العنوان</TableHead>
                        <TableHead>الكاتب</TableHead>
                        <TableHead>المنتدى</TableHead>
                        <TableHead>الحالة</TableHead>
                        <TableHead>المشاهدات</TableHead>
                        <TableHead>الإجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {topics.map((topic) => (
                        <TableRow key={topic.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {topic.is_pinned && <Pin className="w-4 h-4 text-amber-500" />}
                              {topic.is_locked && <Lock className="w-4 h-4 text-slate-500" />}
                              <span className="font-medium">{topic.title}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="w-8 h-8">
                                <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">
                                  {topic.author.full_name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <span>{topic.author.full_name}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {topic.forum.icon} {topic.forum.name}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              {topic.is_pinned && (
                                <Badge className="bg-amber-100 text-amber-800">مثبت</Badge>
                              )}
                              {topic.is_locked && (
                                <Badge className="bg-red-100 text-red-800">مغلق</Badge>
                              )}
                              {!topic.is_pinned && !topic.is_locked && (
                                <Badge className="bg-blue-100 text-blue-800">نشط</Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Eye className="w-4 h-4 text-slate-400" />
                              <span>{topic.views_count}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePinTopic(topic.id)}
                              >
                                {topic.is_pinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleLockTopic(topic.id)}
                              >
                                {topic.is_locked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="forums" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  إدارة المنتديات
                </CardTitle>
                <CardDescription>
                  عرض وإدارة المنتديات المتاحة
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {forums.map((forum) => (
                    <Card key={forum.id} className="border-2">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="text-2xl">{forum.icon}</div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-slate-800">{forum.name}</h3>
                            <p className="text-sm text-slate-600">{forum.description}</p>
                          </div>
                        </div>
                        <div className="flex justify-between items-center text-sm text-slate-500">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                              <MessageSquare className="w-4 h-4" />
                              <span>{forum.topics_count} موضوع</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              <span>{forum.posts_count} مشاركة</span>
                            </div>
                          </div>
                          <Badge className={forum.is_active ? "bg-blue-100 text-blue-800" : "bg-red-100 text-red-800"}>
                            {forum.is_active ? "نشط" : "غير نشط"}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Report Review Dialog */}
        <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
          <DialogContent className="max-w-2xl bg-white dark:bg-slate-900" dir="rtl">
            <DialogHeader>
              <DialogTitle>مراجعة البلاغ</DialogTitle>
              <DialogDescription>
                مراجعة تفاصيل البلاغ واتخاذ الإجراء المناسب
              </DialogDescription>
            </DialogHeader>
            {selectedReport && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-600">المبلغ</label>
                    <p className="font-medium">{selectedReport.reporter.full_name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">السبب</label>
                    <p className="font-medium">{getReasonLabel(selectedReport.reason)}</p>
                  </div>
                </div>
                
                {selectedReport.description && (
                  <div>
                    <label className="text-sm font-medium text-slate-600">الوصف</label>
                    <p className="text-slate-700 bg-slate-50 p-3 rounded">{selectedReport.description}</p>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-slate-600">تاريخ البلاغ</label>
                  <p className="text-slate-700">{formatDate(selectedReport.created_at)}</p>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">ملاحظات الحل</label>
                  <Textarea
                    placeholder="اكتب ملاحظات حول قرارك..."
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    rows={4}
                  />
                </div>

                <div className="flex gap-3 justify-end">
                  <Button variant="outline" onClick={() => setShowReportDialog(false)}>
                    إلغاء
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={handleDismissReport}
                    disabled={submitting}
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    {submitting && <Spinner size="sm" tone="contrast" className="ml-2" />}
                    رفض البلاغ
                  </Button>
                  <Button 
                    onClick={handleResolveReport}
                    disabled={submitting}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {submitting && <Spinner size="sm" tone="contrast" className="ml-2" />}
                    حل البلاغ
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

export default CommunitySupervisorPage


