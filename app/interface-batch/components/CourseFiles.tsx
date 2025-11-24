'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  FileText, 
  Download, 
  Eye, 
  Upload,
  Search,
  Filter,
  Calendar,
  User,
  File,
  Image,
  Video,
  Music,
  Archive
} from 'lucide-react'

interface CourseFile {
  id: string
  name: string
  type: 'pdf' | 'doc' | 'image' | 'video' | 'audio' | 'archive' | 'other'
  size: string
  uploadDate: string
  uploadedBy: string
  downloadCount: number
  category: 'lecture' | 'assignment' | 'resource' | 'reference'
  url: string
}

interface CourseFilesProps {
  userRole?: 'teacher' | 'student'
  onUpload?: (files: FileList) => void
}

export default function CourseFiles({ 
  userRole = 'student',
  onUpload 
}: CourseFilesProps) {
  const [files, setFiles] = useState<CourseFile[]>([
    {
      id: '1',
      name: 'أحكام التجويد - الدرس الأول.pdf',
      type: 'pdf',
      size: '2.5 MB',
      uploadDate: '2024-01-15',
      uploadedBy: 'د. أحمد محمد',
      downloadCount: 45,
      category: 'lecture',
      url: '#'
    },
    {
      id: '2',
      name: 'تمارين التجويد العملية.docx',
      type: 'doc',
      size: '1.2 MB',
      uploadDate: '2024-01-14',
      uploadedBy: 'د. أحمد محمد',
      downloadCount: 32,
      category: 'assignment',
      url: '#'
    },
    {
      id: '3',
      name: 'تسجيل صوتي - سورة الفاتحة.mp3',
      type: 'audio',
      size: '5.8 MB',
      uploadDate: '2024-01-13',
      uploadedBy: 'د. أحمد محمد',
      downloadCount: 67,
      category: 'resource',
      url: '#'
    }
  ])
  
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('all')

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
      case 'doc':
        return <FileText className="w-5 h-5 text-red-600" />
      case 'image':
        return <Image className="w-5 h-5 text-blue-600" />
      case 'video':
        return <Video className="w-5 h-5 text-blue-600" />
      case 'audio':
        return <Music className="w-5 h-5 text-purple-600" />
      case 'archive':
        return <Archive className="w-5 h-5 text-orange-600" />
      default:
        return <File className="w-5 h-5 text-gray-600" />
    }
  }

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'lecture':
        return 'محاضرة'
      case 'assignment':
        return 'واجب'
      case 'resource':
        return 'مورد'
      case 'reference':
        return 'مرجع'
      default:
        return 'أخرى'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'lecture':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'assignment':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'resource':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'reference':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         file.uploadedBy.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === 'all' || file.category === filterCategory
    return matchesSearch && matchesCategory
  })

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files
    if (fileList && onUpload) {
      onUpload(fileList)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with Upload */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        
        {userRole === 'teacher' && (
          <div>
            <input
              type="file"
              id="file-upload"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />

          </div>
        )}
      </div>

      {/* Files Grid */}
      <div className="grid grid-cols-1 gap-4">
        {filteredFiles.length > 0 ? (
          filteredFiles.map((file) => (
            <Card key={file.id} className="border-0 shadow-sm hover:shadow-md transition-all">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center">
                      {getFileIcon(file.type)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-gray-900">{file.name}</h4>
                        <Badge className={`text-xs border ${getCategoryColor(file.category)}`}>
                          {getCategoryLabel(file.category)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          <span>{file.uploadedBy}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{file.uploadDate}</span>
                        </div>
                        <span>{file.size}</span>
                        <span>{file.downloadCount} تحميل</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="p-2 hover:bg-gray-100 rounded-lg">
                      <Eye className="w-4 h-4 text-gray-600" />
                    </Button>
                    <Button variant="ghost" size="sm" className="p-2 hover:bg-gray-100 rounded-lg">
                      <Download className="w-4 h-4 text-gray-600" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="border-0 shadow-sm">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد ملفات</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || filterCategory !== 'all' 
                  ? 'لم يتم العثور على ملفات تطابق معايير البحث' 
                  : 'لم يتم رفع أي ملفات في هذه الدورة بعد'}
              </p>
              {userRole === 'teacher' && !searchTerm && filterCategory === 'all' && (
                <Button 
                  onClick={() => document.getElementById('file-upload')?.click()}
                  className="bg-gradient-to-r from-[#2d7d32] to-[#1b5e20] hover:from-[#1b5e20] hover:to-[#0d4f12] text-white"
                >
                  <Upload className="w-4 h-4 ml-2" />
                  رفع أول ملف
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
