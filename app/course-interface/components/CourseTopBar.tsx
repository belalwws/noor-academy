'use client';

import React from 'react';

interface CourseTopBarProps {
  courseName: string;
  userName?: string;
  userRole?: string;
}

export default function CourseTopBar({ courseName, userName, userRole }: CourseTopBarProps) {
  return (
    <div className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{courseName}</h1>
          {userName && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {userRole === 'teacher' ? 'معلم' : 'طالب'}: {userName}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
