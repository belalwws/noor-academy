'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface Member {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  isOnline?: boolean;
}

interface CourseMembersProps {
  courseId?: string;
}

export default function CourseMembers({ courseId }: CourseMembersProps) {
  const [members, setMembers] = useState<Member[]>([
    {
      id: '1',
      name: 'د. أحمد محمد',
      email: 'teacher@example.com',
      role: 'teacher',
      isOnline: true
    },
    {
      id: '2',
      name: 'فاطمة علي',
      email: 'student1@example.com',
      role: 'student',
      isOnline: true
    },
    {
      id: '3',
      name: 'محمد حسن',
      email: 'student2@example.com',
      role: 'student',
      isOnline: false
    }
  ]);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
          <Users className="w-4 h-4 text-primary" />
        </div>
        <h3 className="text-sm font-bold text-white">الأعضاء ({members.length})</h3>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          type="text"
          placeholder="بحث عن عضو..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-900 dark:text-slate-50 placeholder:text-gray-400 dark:placeholder:text-slate-500 pr-10 h-9 text-sm"
        />
      </div>

      {/* Members List */}
      <div className="space-y-2">
        {filteredMembers.map((member, index) => (
          <motion.div
            key={member.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-center gap-3 p-3 rounded-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
          >
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-primary font-semibold text-sm">
                  {member.name.charAt(0)}
                </span>
              </div>
              {member.isOnline && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-slate-800"></div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 dark:text-slate-50 text-sm truncate">{member.name}</p>
              <p className="text-xs text-gray-600 dark:text-slate-400 truncate">{member.email}</p>
            </div>
            <span className={`text-xs px-2 py-1 rounded-md ${
              member.role === 'teacher'
                ? 'bg-primary/20 text-primary'
                : 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400'
            }`}>
              {member.role === 'teacher' ? 'معلم' : 'طالب'}
            </span>
          </motion.div>
        ))}
      </div>

      {filteredMembers.length === 0 && (
        <p className="text-center text-gray-500 dark:text-gray-400 text-sm py-8">لا توجد نتائج</p>
      )}
    </div>
  );
}
