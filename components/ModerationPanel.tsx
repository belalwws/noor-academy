'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Shield, 
  Flag, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye,
  MessageSquare,
  User,
  AlertTriangle,
  Ban,
  Unlock,
  Lock,
  Trash2,
  Archive,
  Search,
  Filter,
  MoreHorizontal,
  TrendingUp,
  Users,
  FileText,
  Calendar
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

interface Report {
  id: string
  type: 'topic' | 'post' | 'user'
  reportedContent: {
    id: string
    title?: string
    content: string
    author: {
      id: string
      name: string
      avatar?: string
    }
  }
  reporter: {
    id: string
    name: string
    avatar?: string
  }
  reason: string
  description?: string
  status: 'pending' | 'approved' | 'rejected' | 'resolved'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  createdAt: string
  resolvedAt?: string
  resolvedBy?: {
    id: string
    name: string
  }
  moderatorNotes?: string
}

interface ModerationStats {
  totalReports: number
  pendingReports: number
  resolvedToday: number
  activeUsers: number
  bannedUsers: number
  deletedContent: number
}

interface ModerationPanelProps {
  currentUserId: string
  userRole: 'admin' | 'supervisor' | 'moderator'
  className?: string
}

const ModerationPanel = ({ currentUserId, userRole, className }: ModerationPanelProps) => {
  const [reports, setReports] = useState<Report[]>([])
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterPriority, setFilterPriority] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [stats, setStats] = useState<ModerationStats>({
    totalReports: 0,
    pendingReports: 0,
    resolvedToday: 0,
    activeUsers: 0,
    bannedUsers: 0,
    deletedContent: 0
  })
  const { toast } = useToast()

  // Mock data
  const mockReports: Report[] = [
    {
      id: '1',
      type: 'topic',
      reportedContent: {
        id: 'topic-1',
        title: 'موضوع مثير للجدل',
        content: 'محتوى الموضوع المبلغ عنه...',
        author: {
          id: 'user-1',
          name: 'محمد أحمد',
          avatar: '/placeholder-user.png'
        }
      },
      reporter: {
        id: 'user-2',
        name: 'فاطمة علي',
        avatar: '/placeholder-user.png'
      },
      reason: 'inappropriate',
      description: 'المحتوى غير مناسب للمنتدى',
      status: 'pending',
      priority: 'high',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '2',
      type: 'post',
      reportedContent: {
        id: 'post-1',
        content: 'رد مسيء أو غير مناسب...',
        author: {
          id: 'user-3',
          name: 'أحمد محمود',
          avatar: '/placeholder-user.png'
        }
      },
      reporter: {
        id: 'user-4',
        name: 'سارة أحمد',
        avatar: '/placeholder-user.png'
      },
      reason: 'harassment',
      description: 'تحرش أو إساءة في الرد',
      status: 'pending',
      priority: 'urgent',
      createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString()
    }
  ]

  const mockStats: ModerationStats = {
    totalReports: 45,
    pendingReports: 8,
    resolvedToday: 12,
    activeUsers: 234,
    bannedUsers: 3,
    deletedContent: 7
  }

  useEffect(() => {
    setReports(mockReports)
    setStats(mockStats)
  }, [])

  const getPriorityColor = (priority: Report['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusColor = (status: Report['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      case 'resolved':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'منذ دقائق'
    if (diffInHours < 24) return `منذ ${diffInHours} ساعة`
    return date.toLocaleDateString('ar-SA')
  }

  const handleReportAction = async (reportId: string, action: 'approve' | 'reject' | 'resolve', notes?: string) => {
    try {
      setReports(prev =>
        prev.map(report =>
          report.id === reportId
            ? {
                ...report,
                status: action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'resolved',
                resolvedAt: new Date().toISOString(),
                resolvedBy: { id: currentUserId, name: 'المشرف الحالي' },
                moderatorNotes: notes
              }
            : report
        )
      )

      toast({
        title: "تم بنجاح",
        description: `تم ${action === 'approve' ? 'الموافقة على' : action === 'reject' ? 'رفض' : 'حل'} البلاغ`
      })
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل في معالجة البلاغ",
        variant: "destructive"
      })
    }
  }

  const filteredReports = reports.filter(report => {
    const matchesStatus = filterStatus === 'all' || report.status === filterStatus
    const matchesPriority = filterPriority === 'all' || report.priority === filterPriority
    const matchesSearch = searchQuery === '' || 
      report.reportedContent.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.reporter.name.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesStatus && matchesPriority && matchesSearch
  })

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-4 text-center">
            <FileText className="h-8 w-8 mx-auto mb-2 text-blue-600" />
            <div className="text-2xl font-bold text-blue-800">{stats.totalReports}</div>
            <div className="text-xs text-blue-600">إجمالي البلاغات</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
          <CardContent className="p-4 text-center">
            <Clock className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
            <div className="text-2xl font-bold text-yellow-800">{stats.pendingReports}</div>
            <div className="text-xs text-yellow-600">في الانتظار</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <div className="text-2xl font-bold text-green-800">{stats.resolvedToday}</div>
            <div className="text-xs text-green-600">تم حلها اليوم</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
          <CardContent className="p-4 text-center">
            <Users className="h-8 w-8 mx-auto mb-2 text-purple-600" />
            <div className="text-2xl font-bold text-purple-800">{stats.activeUsers}</div>
            <div className="text-xs text-purple-600">مستخدمين نشطين</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-red-50 to-pink-50 border-red-200">
          <CardContent className="p-4 text-center">
            <Ban className="h-8 w-8 mx-auto mb-2 text-red-600" />
            <div className="text-2xl font-bold text-red-800">{stats.bannedUsers}</div>
            <div className="text-xs text-red-600">محظورين</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200">
          <CardContent className="p-4 text-center">
            <Trash2 className="h-8 w-8 mx-auto mb-2 text-gray-600" />
            <div className="text-2xl font-bold text-gray-800">{stats.deletedContent}</div>
            <div className="text-xs text-gray-600">محتوى محذوف</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Panel */}
      <Card className="bg-white shadow-lg">
        <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-50 border-b">
          <CardTitle className="flex items-center gap-2 text-emerald-800">
            <Shield className="h-6 w-6" />
            لوحة الإشراف والمراجعة
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-6">
          <Tabs defaultValue="reports" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="reports">البلاغات</TabsTrigger>
              <TabsTrigger value="users">المستخدمين</TabsTrigger>
              <TabsTrigger value="content">المحتوى</TabsTrigger>
              <TabsTrigger value="analytics">التحليلات</TabsTrigger>
            </TabsList>

            <TabsContent value="reports" className="space-y-4">
              {/* Filters */}
              <div className="flex flex-wrap gap-4 items-center justify-between">
                <div className="flex gap-3">
                  <div className="relative">
                    <Search className="absolute right-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="بحث في البلاغات..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pr-10 w-64"
                    />
                  </div>
                  
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="الحالة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع الحالات</SelectItem>
                      <SelectItem value="pending">في الانتظار</SelectItem>
                      <SelectItem value="approved">موافق عليها</SelectItem>
                      <SelectItem value="rejected">مرفوضة</SelectItem>
                      <SelectItem value="resolved">محلولة</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={filterPriority} onValueChange={setFilterPriority}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="الأولوية" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع الأولويات</SelectItem>
                      <SelectItem value="urgent">عاجل</SelectItem>
                      <SelectItem value="high">عالية</SelectItem>
                      <SelectItem value="medium">متوسطة</SelectItem>
                      <SelectItem value="low">منخفضة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Reports List */}
              <div className="space-y-3">
                {filteredReports.map((report) => (
                  <Card key={report.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center gap-3">
                            <Badge className={getPriorityColor(report.priority)}>
                              {report.priority === 'urgent' && '🚨'} {report.priority}
                            </Badge>
                            <Badge className={getStatusColor(report.status)}>
                              {report.status}
                            </Badge>
                            <Badge variant="outline">
                              {report.type === 'topic' ? 'موضوع' : report.type === 'post' ? 'مشاركة' : 'مستخدم'}
                            </Badge>
                            <span className="text-sm text-slate-500">
                              {formatTime(report.createdAt)}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-medium text-slate-800 mb-1">المحتوى المبلغ عنه:</h4>
                              {report.reportedContent.title && (
                                <p className="text-sm font-medium text-slate-700 mb-1">
                                  {report.reportedContent.title}
                                </p>
                              )}
                              <p className="text-sm text-slate-600 line-clamp-2">
                                {report.reportedContent.content}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                <Avatar className="w-6 h-6">
                                  <AvatarImage src={report.reportedContent.author.avatar} />
                                  <AvatarFallback className="text-xs">
                                    {report.reportedContent.author.name.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-sm text-slate-600">
                                  {report.reportedContent.author.name}
                                </span>
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="font-medium text-slate-800 mb-1">سبب البلاغ:</h4>
                              <p className="text-sm text-slate-600 mb-2">{report.reason}</p>
                              {report.description && (
                                <p className="text-sm text-slate-500 italic">
                                  "{report.description}"
                                </p>
                              )}
                              <div className="flex items-center gap-2 mt-2">
                                <Avatar className="w-6 h-6">
                                  <AvatarImage src={report.reporter.avatar} />
                                  <AvatarFallback className="text-xs">
                                    {report.reporter.name.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-sm text-slate-600">
                                  بلاغ من: {report.reporter.name}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 mr-4">
                          {report.status === 'pending' && (
                            <>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                                    <CheckCircle className="h-4 w-4 ml-2" />
                                    موافقة
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>الموافقة على البلاغ</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <Textarea
                                      placeholder="ملاحظات المشرف (اختيارية)..."
                                      className="min-h-[100px]"
                                    />
                                    <div className="flex justify-end gap-2">
                                      <Button
                                        onClick={() => handleReportAction(report.id, 'approve')}
                                        className="bg-green-600 hover:bg-green-700"
                                      >
                                        تأكيد الموافقة
                                      </Button>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                              
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleReportAction(report.id, 'reject')}
                                className="border-red-200 text-red-600 hover:bg-red-50"
                              >
                                <XCircle className="h-4 w-4 ml-2" />
                                رفض
                              </Button>
                            </>
                          )}
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="h-4 w-4 ml-2" />
                                عرض التفاصيل
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <MessageSquare className="h-4 w-4 ml-2" />
                                التواصل مع المبلغ
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="h-4 w-4 ml-2" />
                                حذف البلاغ
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="users">
              <div className="text-center py-12 text-slate-500">
                <Users className="h-12 w-12 mx-auto mb-4" />
                <p>إدارة المستخدمين قيد التطوير</p>
              </div>
            </TabsContent>

            <TabsContent value="content">
              <div className="text-center py-12 text-slate-500">
                <FileText className="h-12 w-12 mx-auto mb-4" />
                <p>إدارة المحتوى قيد التطوير</p>
              </div>
            </TabsContent>

            <TabsContent value="analytics">
              <div className="text-center py-12 text-slate-500">
                <TrendingUp className="h-12 w-12 mx-auto mb-4" />
                <p>التحليلات والإحصائيات قيد التطوير</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

export default ModerationPanel
