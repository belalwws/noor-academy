'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RefreshCw } from 'lucide-react';

interface SupervisorHeaderProps {
  success?: string;
  error?: string;
  onRefresh: () => void;
}

const SupervisorHeader: React.FC<SupervisorHeaderProps> = ({
  success,
  error,
  onRefresh
}) => {
  return (
    <div className="relative bg-gradient-to-br from-blue-600 via-blue-600 to-teal-700 text-white overflow-hidden min-h-[400px] flex items-center">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
      </div>
      
      {/* Floating Elements */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute bottom-10 right-10 w-32 h-32 bg-blue-300/20 rounded-full blur-2xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-teal-300/15 rounded-full blur-lg animate-bounce"></div>
      
      <div className="relative container mx-auto px-6 py-16">
        {/* Success/Error Messages */}
        {success && (
          <Alert className="mb-6 bg-blue-50/90 border-blue-200 backdrop-blur-sm">
            <AlertDescription className="text-blue-800 text-center">
              ✅ {success}
            </AlertDescription>
          </Alert>
        )}

        {error && !error.includes('متاحة للمشرفين العامين فقط') && (
          <Alert variant="destructive" className="mb-6 bg-red-50/90 border-red-200 backdrop-blur-sm">
            <AlertDescription className="text-red-800 text-center">
              ❌ {error}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div className="text-center lg:text-right">
            <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-6 py-2 mb-6">
              <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">نظام إدارة متقدم</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                لوحة التحكم
              </span>
              <br />
              <span className="text-blue-200 text-3xl md:text-4xl">
                العامة للمشرف
              </span>
            </h1>
            
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              إدارة شاملة ومتطورة للمنصة التعليمية - تحكم كامل في المشرفين الأكاديميين، المدرسين، الدورات، وطلبات العائلات
            </p>
            
            <div className="flex flex-wrap gap-4 justify-center lg:justify-start mb-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                <span className="text-2xl font-bold">6</span>
                <p className="text-sm text-blue-200">أقسام رئيسية</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                <span className="text-2xl font-bold">∞</span>
                <p className="text-sm text-blue-200">إمكانيات لا محدودة</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                <span className="text-2xl font-bold">24/7</span>
                <p className="text-sm text-blue-200">مراقبة مستمرة</p>
              </div>
            </div>

            {/* Refresh Button */}
            <Button
              onClick={onRefresh}
              className="bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm transition-all duration-300 hover:scale-105 shadow-lg"
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              تحديث البيانات
            </Button>
          </div>
          
          {/* Visual Elements */}
          <div className="hidden lg:block">
            <div className="relative">
              {/* Main Circle */}
              <div className="w-80 h-80 bg-gradient-to-br from-white/20 to-blue-300/30 rounded-full mx-auto backdrop-blur-sm border border-white/20 flex items-center justify-center">
                <div className="w-60 h-60 bg-gradient-to-br from-blue-400/40 to-teal-500/40 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <div className="text-center">
                    <div className="text-6xl mb-4">🎓</div>
                    <h3 className="text-xl font-bold text-white mb-2">إدارة متقدمة</h3>
                    <p className="text-sm text-blue-100">نظام شامل</p>
                  </div>
                </div>
              </div>
              
              {/* Floating Icons */}
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center animate-bounce delay-300">
                <span className="text-2xl">📊</span>
              </div>
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full flex items-center justify-center animate-bounce delay-700">
                <span className="text-2xl">👥</span>
              </div>
              <div className="absolute top-1/2 -left-8 w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-pulse">
                <span className="text-lg">📚</span>
              </div>
              <div className="absolute top-1/2 -right-8 w-12 h-12 bg-gradient-to-br from-purple-400 to-violet-500 rounded-full flex items-center justify-center animate-pulse delay-500">
                <span className="text-lg">📧</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupervisorHeader;
