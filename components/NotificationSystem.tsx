'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  // Bell, // Temporarily disabled
  BellRing,
  MessageSquare,
  Heart,
  UserPlus,
  Award,
  Flag,
  Pin,
  Lock,
  Eye,
  X,
  Check,
  Settings,
  Filter,
  MoreHorizontal,
  AlertCircle // Replacement for Bell
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

interface Notification {
  id: string
  type: 'reply' | 'like' | 'follow' | 'mention' | 'report' | 'pin' | 'lock' | 'award'
  title: string
  message: string
  user?: {
    id: string
    name: string
    avatar?: string
    role: string
  }
  topic?: {
    id: string
    title: string
  }
  timestamp: string
  read: boolean
  priority: 'low' | 'medium' | 'high'
}

interface NotificationSystemProps {
  className?: string
}

const NotificationSystem = ({ className }: NotificationSystemProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [filter, setFilter] = useState<'all' | 'unread' | 'mentions'>('all')
  const { toast } = useToast()

  // Mock notifications data - في التطبيق الحقيقي سيتم جلبها من API
  const mockNotifications: Notification[] = [
    {
      id: '1',
      type: 'reply',
      title: 'رد جديد على موضوعك',
      message: 'أحمد علي رد على موضوعك "تفسير سورة الفاتحة"',
      user: {
        id: '1',
        name: 'أحمد علي',
        avatar: '/placeholder-user.png',
        role: 'student'
      },
      topic: {
        id: 'topic-1',
        title: 'تفسير سورة الفاتحة'
      },
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      read: false,
      priority: 'high'
    },
    {
      id: '2',
      type: 'like',
      title: 'إعجاب بمشاركتك',
      message: 'فاطمة محمد أعجبت بمشاركتك في "أحكام التجويد"',
      user: {
        id: '2',
        name: 'فاطمة محمد',
        avatar: '/placeholder-user.png',
        role: 'teacher'
      },
      topic: {
        id: 'topic-2',
        title: 'أحكام التجويد'
      },
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      read: false,
      priority: 'medium'
    },
    {
      id: '3',
      type: 'mention',
      title: 'تم ذكرك في موضوع',
      message: 'محمد أحمد ذكرك في موضوع "قواعد اللغة العربية"',
      user: {
        id: '3',
        name: 'محمد أحمد',
        avatar: '/placeholder-user.png',
        role: 'supervisor'
      },
      topic: {
        id: 'topic-3',
        title: 'قواعد اللغة العربية'
      },
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      read: true,
      priority: 'high'
    },
    {
      id: '4',
      type: 'award',
      title: 'حصلت على شارة جديدة!',
      message: 'تهانينا! حصلت على شارة "المساهم النشط"',
      timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      read: false,
      priority: 'medium'
    }
  ]

  useEffect(() => {
    // محاكاة تحميل الإشعارات
    setNotifications(mockNotifications)
    setUnreadCount(mockNotifications.filter(n => !n.read).length)
  }, [])

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'reply':
        return <MessageSquare className="h-4 w-4 text-blue-600" />
      case 'like':
        return <Heart className="h-4 w-4 text-red-600" />
      case 'follow':
        return <UserPlus className="h-4 w-4 text-green-600" />
      case 'mention':
        return <MessageSquare className="h-4 w-4 text-purple-600" />
      case 'award':
        return <Award className="h-4 w-4 text-yellow-600" />
      case 'report':
        return <Flag className="h-4 w-4 text-orange-600" />
      case 'pin':
        return <Pin className="h-4 w-4 text-amber-600" />
      case 'lock':
        return <Lock className="h-4 w-4 text-gray-600" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />
    }
  }

  const getPriorityColor = (priority: Notification['priority']) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500 bg-red-50'
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-50'
      case 'low':
        return 'border-l-gray-500 bg-gray-50'
      default:
        return 'border-l-gray-300'
    }
  }

  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'الآن'
    if (diffInMinutes < 60) return `منذ ${diffInMinutes} دقيقة`
    if (diffInMinutes < 1440) return `منذ ${Math.floor(diffInMinutes / 60)} ساعة`
    return date.toLocaleDateString('ar-SA')
  }

  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      )
    )
    setUnreadCount(prev => Math.max(0, prev - 1))
  }, [])

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    setUnreadCount(0)
    toast({
      title: "تم بنجاح",
      description: "تم تحديد جميع الإشعارات كمقروءة"
    })
  }, [toast])

  const deleteNotification = useCallback((notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId))
    const notification = notifications.find(n => n.id === notificationId)
    if (notification && !notification.read) {
      setUnreadCount(prev => Math.max(0, prev - 1))
    }
  }, [notifications])

  const filteredNotifications = notifications.filter(notification => {
    switch (filter) {
      case 'unread':
        return !notification.read
      case 'mentions':
        return notification.type === 'mention'
      default:
        return true
    }
  })

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className={`relative hover:bg-emerald-50 ${className}`}
        >
          {unreadCount > 0 ? (
            <BellRing className="h-5 w-5 text-emerald-600" />
          ) : (
            <AlertCircle className="h-5 w-5 text-slate-600" />
          )}
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-96 p-0" align="end" dir="rtl">
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-3 bg-gradient-to-r from-emerald-50 to-green-50">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-emerald-800 flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                الإشعارات
                {unreadCount > 0 && (
                  <Badge className="bg-red-500 text-white">
                    {unreadCount}
                  </Badge>
                )}
              </CardTitle>
              
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <Filter className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>تصفية الإشعارات</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setFilter('all')}>
                      <Eye className="h-4 w-4 ml-2" />
                      جميع الإشعارات
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilter('unread')}>
                      <BellRing className="h-4 w-4 ml-2" />
                      غير المقروءة فقط
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilter('mentions')}>
                      <MessageSquare className="h-4 w-4 ml-2" />
                      الإشارات فقط
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                {unreadCount > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={markAllAsRead}
                    className="text-emerald-600 hover:text-emerald-700"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            <ScrollArea className="h-96">
              {filteredNotifications.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                  <p>لا توجد إشعارات</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 border-l-4 hover:bg-slate-50 transition-colors cursor-pointer ${
                        !notification.read ? getPriorityColor(notification.priority) : 'border-l-gray-200'
                      }`}
                      onClick={() => {
                        if (!notification.read) {
                          markAsRead(notification.id)
                        }
                        if (notification.topic) {
                          window.location.href = `/community/${notification.topic.id}`
                        }
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-1">
                            <h4 className={`text-sm font-medium ${
                              !notification.read ? 'text-slate-900' : 'text-slate-600'
                            }`}>
                              {notification.title}
                            </h4>
                            
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <MoreHorizontal className="h-3 w-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {!notification.read && (
                                  <DropdownMenuItem onClick={() => markAsRead(notification.id)}>
                                    <Check className="h-4 w-4 ml-2" />
                                    تحديد كمقروء
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem 
                                  onClick={() => deleteNotification(notification.id)}
                                  className="text-red-600"
                                >
                                  <X className="h-4 w-4 ml-2" />
                                  حذف
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          
                          <p className="text-sm text-slate-600 mb-2">
                            {notification.message}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {notification.user && (
                                <Avatar className="h-6 w-6">
                                  <AvatarImage src={notification.user.avatar} />
                                  <AvatarFallback className="text-xs">
                                    {notification.user.name.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                              )}
                              <span className="text-xs text-slate-500">
                                {formatTimeAgo(notification.timestamp)}
                              </span>
                            </div>
                            
                            {!notification.read && (
                              <div className="h-2 w-2 bg-emerald-500 rounded-full"></div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
            
            <div className="p-3 border-t bg-slate-50">
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
              >
                <Settings className="h-4 w-4 ml-2" />
                إعدادات الإشعارات
              </Button>
            </div>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  )
}

export default NotificationSystem
