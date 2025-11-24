'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import { 
  MessageCircle, 
  Send, 
  Search, 
  MoreVertical,
  Phone,
  Video,
  Paperclip,
  Smile,
  X,
  Check,
  CheckCheck,
  Circle,
  Minimize2,
  Maximize2,
  Archive,
  Trash2,
  Flag,
  UserPlus,
  Settings
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
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

interface Message {
  id: string
  senderId: string
  receiverId: string
  content: string
  timestamp: string
  read: boolean
  type: 'text' | 'image' | 'file' | 'audio'
  attachments?: Array<{
    id: string
    name: string
    url: string
    type: string
    size: number
  }>
}

interface Conversation {
  id: string
  participants: Array<{
    id: string
    name: string
    avatar?: string
    role: string
    isOnline: boolean
    lastSeen?: string
  }>
  lastMessage?: Message
  unreadCount: number
  isArchived: boolean
  isPinned: boolean
}

interface PrivateMessagingProps {
  currentUserId: string
  className?: string
}

const PrivateMessaging = ({ currentUserId, className }: PrivateMessagingProps) => {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [isMinimized, setIsMinimized] = useState(false)
  const [isNewChatOpen, setIsNewChatOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  // Mock data - في التطبيق الحقيقي سيتم جلبها من API
  const mockConversations: Conversation[] = [
    {
      id: '1',
      participants: [
        {
          id: '2',
          name: 'أحمد محمد',
          avatar: '/placeholder-user.png',
          role: 'teacher',
          isOnline: true
        }
      ],
      lastMessage: {
        id: '1',
        senderId: '2',
        receiverId: currentUserId,
        content: 'السلام عليكم، كيف حالك؟',
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        read: false,
        type: 'text'
      },
      unreadCount: 2,
      isArchived: false,
      isPinned: true
    },
    {
      id: '2',
      participants: [
        {
          id: '3',
          name: 'فاطمة علي',
          avatar: '/placeholder-user.png',
          role: 'supervisor',
          isOnline: false,
          lastSeen: new Date(Date.now() - 30 * 60 * 1000).toISOString()
        }
      ],
      lastMessage: {
        id: '2',
        senderId: currentUserId,
        receiverId: '3',
        content: 'شكراً لك على المساعدة',
        timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        read: true,
        type: 'text'
      },
      unreadCount: 0,
      isArchived: false,
      isPinned: false
    }
  ]

  const mockMessages: Message[] = [
    {
      id: '1',
      senderId: '2',
      receiverId: currentUserId,
      content: 'السلام عليكم ورحمة الله وبركاته',
      timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      read: true,
      type: 'text'
    },
    {
      id: '2',
      senderId: currentUserId,
      receiverId: '2',
      content: 'وعليكم السلام ورحمة الله وبركاته، أهلاً وسهلاً',
      timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
      read: true,
      type: 'text'
    },
    {
      id: '3',
      senderId: '2',
      receiverId: currentUserId,
      content: 'كيف حالك؟ أرجو أن تكون بخير',
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      read: false,
      type: 'text'
    }
  ]

  useEffect(() => {
    setConversations(mockConversations)
  }, [])

  useEffect(() => {
    if (activeConversation) {
      setMessages(mockMessages)
      scrollToBottom()
    }
  }, [activeConversation])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'الآن'
    if (diffInMinutes < 60) return `منذ ${diffInMinutes} د`
    if (diffInMinutes < 1440) return `منذ ${Math.floor(diffInMinutes / 60)} س`
    return date.toLocaleDateString('ar-SA')
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeConversation) return

    const message: Message = {
      id: Date.now().toString(),
      senderId: currentUserId,
      receiverId: activeConversation.participants[0].id,
      content: newMessage.trim(),
      timestamp: new Date().toISOString(),
      read: false,
      type: 'text'
    }

    setMessages(prev => [...prev, message])
    setNewMessage('')

    // محاكاة إرسال الرسالة للخادم
    try {
      // await messageApi.sendMessage(message)
      toast({
        title: "تم إرسال الرسالة",
        description: "تم إرسال رسالتك بنجاح"
      })
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل في إرسال الرسالة",
        variant: "destructive"
      })
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const markAsRead = (conversationId: string) => {
    setConversations(prev =>
      prev.map(conv =>
        conv.id === conversationId
          ? { ...conv, unreadCount: 0 }
          : conv
      )
    )
  }

  const filteredConversations = conversations.filter(conv =>
    conv.participants.some(p =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  )

  const totalUnreadCount = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0)

  if (isMinimized) {
    return (
      <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
        <Button
          onClick={() => setIsMinimized(false)}
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg relative"
        >
          <MessageCircle className="h-5 w-5" />
          {totalUnreadCount > 0 && (
            <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs">
              {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
            </Badge>
          )}
        </Button>
      </div>
    )
  }

  return (
    <div className={`fixed bottom-4 right-4 w-96 h-[600px] bg-white rounded-lg shadow-2xl border border-slate-200 z-50 ${className}`}>
      <div className="flex h-full">
        {/* Conversations List */}
        <div className={`${activeConversation ? 'w-1/3' : 'w-full'} border-l border-slate-200 flex flex-col`}>
          {/* Header */}
          <div className="p-4 border-b border-slate-200 bg-blue-50">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-blue-800 flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                الرسائل
                {totalUnreadCount > 0 && (
                  <Badge className="bg-red-500 text-white">
                    {totalUnreadCount}
                  </Badge>
                )}
              </h3>
              <div className="flex items-center gap-1">
                <Dialog open={isNewChatOpen} onOpenChange={setIsNewChatOpen}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <UserPlus className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>محادثة جديدة</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Input placeholder="ابحث عن مستخدم..." />
                      {/* قائمة المستخدمين المتاحين */}
                    </div>
                  </DialogContent>
                </Dialog>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMinimized(true)}
                >
                  <Minimize2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="relative">
              <Search className="absolute right-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="بحث في المحادثات..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10 text-sm"
              />
            </div>
          </div>

          {/* Conversations */}
          <ScrollArea className="flex-1">
            <div className="space-y-1 p-2">
              {filteredConversations.map((conversation) => {
                const participant = conversation.participants[0]
                return (
                  <div
                    key={conversation.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      activeConversation?.id === conversation.id
                        ? 'bg-blue-100 border border-blue-200'
                        : 'hover:bg-slate-50'
                    }`}
                    onClick={() => {
                      setActiveConversation(conversation)
                      markAsRead(conversation.id)
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={participant.avatar} />
                          <AvatarFallback>
                            {participant.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                          participant.isOnline ? 'bg-blue-500' : 'bg-slate-400'
                        }`} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium text-sm truncate">
                            {participant.name}
                          </h4>
                          {conversation.lastMessage && (
                            <span className="text-xs text-slate-500">
                              {formatTime(conversation.lastMessage.timestamp)}
                            </span>
                          )}
                        </div>
                        
                        {conversation.lastMessage && (
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-slate-600 truncate">
                              {conversation.lastMessage.senderId === currentUserId && (
                                <span className="ml-1">
                                  {conversation.lastMessage.read ? (
                                    <CheckCheck className="h-3 w-3 inline text-blue-500" />
                                  ) : (
                                    <Check className="h-3 w-3 inline text-slate-400" />
                                  )}
                                </span>
                              )}
                              {conversation.lastMessage.content}
                            </p>
                            {conversation.unreadCount > 0 && (
                              <Badge className="bg-blue-500 text-white text-xs">
                                {conversation.unreadCount}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </ScrollArea>
        </div>

        {/* Chat Area */}
        {activeConversation && (
          <div className="flex-1 flex flex-col">
            {/* Chat Header */}
            <div className="p-4 border-b border-slate-200 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={activeConversation.participants[0].avatar} />
                      <AvatarFallback>
                        {activeConversation.participants[0].name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`absolute -bottom-1 -right-1 w-2 h-2 rounded-full border border-white ${
                      activeConversation.participants[0].isOnline ? 'bg-blue-500' : 'bg-slate-400'
                    }`} />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">
                      {activeConversation.participants[0].name}
                    </h4>
                    <p className="text-xs text-slate-500">
                      {activeConversation.participants[0].isOnline
                        ? 'متصل الآن'
                        : `آخر ظهور ${formatTime(activeConversation.participants[0].lastSeen || '')}`
                      }
                    </p>
                  </div>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Archive className="h-4 w-4 ml-2" />
                      أرشفة المحادثة
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Flag className="h-4 w-4 ml-2" />
                      إبلاغ
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600">
                      <Trash2 className="h-4 w-4 ml-2" />
                      حذف المحادثة
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.senderId === currentUserId ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${
                        message.senderId === currentUserId
                          ? 'bg-blue-500 text-white'
                          : 'bg-slate-100 text-slate-800'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <div className={`flex items-center justify-end gap-1 mt-1 text-xs ${
                        message.senderId === currentUserId ? 'text-blue-100' : 'text-slate-500'
                      }`}>
                        <span>{formatTime(message.timestamp)}</span>
                        {message.senderId === currentUserId && (
                          message.read ? (
                            <CheckCheck className="h-3 w-3" />
                          ) : (
                            <Check className="h-3 w-3" />
                          )
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t border-slate-200">
              <div className="flex items-end gap-2">
                <Button variant="ghost" size="sm">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <div className="flex-1">
                  <Textarea
                    placeholder="اكتب رسالتك..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="resize-none min-h-[40px] max-h-[120px]"
                    rows={1}
                  />
                </div>
                <Button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  size="sm"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default PrivateMessaging
