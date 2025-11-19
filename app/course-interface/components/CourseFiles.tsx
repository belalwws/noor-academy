'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Upload, File, Image, Video } from 'lucide-react';

interface FileItem {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadedBy: string;
  uploadDate: string;
}

interface CourseFilesProps {
  userRole?: 'teacher' | 'student';
  onUpload?: (files: FileList) => void;
}

const getFileIcon = (type: string) => {
  if (type.includes('pdf')) return <FileText className="w-5 h-5 text-red-400" />;
  if (type.includes('image')) return <Image className="w-5 h-5 text-blue-400" />;
  if (type.includes('video')) return <Video className="w-5 h-5 text-purple-400" />;
  return <File className="w-5 h-5 text-gray-400" />;
};

export default function CourseFiles({ userRole = 'student', onUpload }: CourseFilesProps) {
  const [files] = useState<FileItem[]>([
    {
      id: '1',
      name: 'أحكام التجويد - الدرس الأول.pdf',
      type: 'application/pdf',
      size: '2.5 MB',
      uploadedBy: 'د. أحمد محمد',
      uploadDate: 'منذ يومين'
    },
    {
      id: '2',
      name: 'تمارين عملية.pdf',
      type: 'application/pdf',
      size: '1.2 MB',
      uploadedBy: 'د. أحمد محمد',
      uploadDate: 'منذ 3 أيام'
    }
  ]);

  return (
    <div className="space-y-4">
      {/* Upload Area (for teachers) */}
      {userRole === 'teacher' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-50 dark:bg-slate-800 border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer"
          onClick={() => document.getElementById('file-upload')?.click()}
        >
          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-700 dark:text-slate-300 mb-1">اسحب الملفات هنا أو انقر للرفع</p>
          <p className="text-xs text-gray-500 dark:text-slate-400">PDF, DOC, PPT, Images, Videos</p>
          <input
            id="file-upload"
            type="file"
            multiple
            className="hidden"
            onChange={(e) => e.target.files && onUpload?.(e.target.files)}
          />
        </motion.div>
      )}

      {/* Files List */}
      <div className="space-y-2">
        {files.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">لا توجد ملفات بعد</p>
          </div>
        ) : (
          files.map((file, index) => (
            <motion.div
              key={file.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center gap-3 p-4 rounded-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors group"
            >
              <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-slate-700 flex items-center justify-center">
                {getFileIcon(file.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 dark:text-slate-50 text-sm truncate">{file.name}</p>
                <p className="text-xs text-gray-600 dark:text-slate-400">
                  {file.size} • {file.uploadedBy} • {file.uploadDate}
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Download className="w-4 h-4 text-primary" />
              </motion.button>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
