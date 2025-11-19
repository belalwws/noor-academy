'use client'

import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Send, 
  Paperclip, 
  Image, 
  Video, 
  Calendar,
  X,
  FileText
} from 'lucide-react'

interface CreatePostCardProps {
  userAvatar?: string
  userName?: string
  onSubmit?: (content: string, attachments: File[]) => void
  placeholder?: string
  isTeacher?: boolean
}

export default function CreatePostCard({
  userAvatar,
  userName = "المستخدم",
  onSubmit,
  placeholder = "اكتب رسالة جديدة...",
  isTeacher = false
}: CreatePostCardProps) {
  const [content, setContent] = useState('')
  const [attachments, setAttachments] = useState<File[]>([])
  const [isExpanded, setIsExpanded] = useState(false)

  const handleSubmit = () => {
    if (content.trim() || attachments.length > 0) {
      onSubmit?.(content, attachments)
      setContent('')
      setAttachments([])
      setIsExpanded(false)
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setAttachments(prev => [...prev, ...files])
  }

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <Card className="w-full bg-white shadow-sm border-0 rounded-2xl overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Avatar className="w-12 h-12 border-2 border-gray-100">
            <AvatarImage src={userAvatar} />
            <AvatarFallback className="bg-gradient-to-br from-green-500 to-green-600 text-white font-medium">
              {userName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-4">
            {/* Text input */}
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onFocus={() => setIsExpanded(true)}
              placeholder={placeholder}
              className="min-h-[60px] resize-none border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
              rows={isExpanded ? 4 : 2}
            />

            {/* Attachments preview */}
            {attachments.length > 0 && (
              <div className="space-y-2">
                {attachments.map((file, index) => (
                  <div 
                    key={index}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
                  >
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">{file.name}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => removeAttachment(index)}
                      className="p-1 hover:bg-gray-200 rounded-lg"
                    >
                      <X className="w-4 h-4 text-gray-500" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Actions */}
            {isExpanded && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    id="file-upload"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => document.getElementById('file-upload')?.click()}
                    className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
                  >
                    <Paperclip className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
                  >
                    <Image className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
                  >
                    <Video className="w-4 h-4" />
                  </Button>
                  {isTeacher && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
                    >
                      <Calendar className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      setIsExpanded(false)
                      setContent('')
                      setAttachments([])
                    }}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    إلغاء
                  </Button>
                  <Button 
                    onClick={handleSubmit}
                    disabled={!content.trim() && attachments.length === 0}
                    className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4 ml-2" />
                    نشر
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
