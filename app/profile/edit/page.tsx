// client/app/profile/edit/page.tsx

import React from 'react';
import Link from 'next/link';
import AuthGuard from '@/components/AuthGuard';

export default function EditProfilePage() {
  return (
    <AuthGuard>
      <div className="container py-4">
        <h1>تعديل الملف الشخصي</h1>
        
        {/* Add a link to the NotificationPreferencesPage */}
        <Link href="/profile/notifications" className="btn btn-outline-light btn-sm me-2">
          <i className="fas fa-bell me-1"></i>
          إعدادات الإشعارات
        </Link>
        
        {/* Profile edit form content will go here */}
      </div>
    </AuthGuard>
  );
}
