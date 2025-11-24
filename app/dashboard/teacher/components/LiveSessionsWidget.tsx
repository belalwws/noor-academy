'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import { 
  Video, 
  Play, 
  Clock, 
  Users, 
  BookOpen,
  Zap,
  ArrowRight,
  Sparkles,
  Timer
} from 'lucide-react';
import { useLiveSessions } from '@/lib/store/hooks/useLiveSessions';

interface LiveSession {
  id: string;
  session_id: string;
  title: string;
  course_title?: string;
  course_id?: string;
  started_at: string;
  duration_minutes: number;
  remaining_time: string;
  current_participants: number;
  max_participants: number;
  can_join: boolean;
  teacher: string;
}

interface LiveSessionsResponse {
  live_sessions: LiveSession[];
  total_count: number;
  timestamp: number;
}

export default function LiveSessionsWidget() {
  const { liveSessions, loading, error, connected, reconnect } = useLiveSessions();




  const formatTimeAgo = (startedAt: string) => {
    const now = new Date();
    const started = new Date(startedAt);
    const diffMinutes = Math.floor((now.getTime() - started.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return 'بدأت الآن';
    if (diffMinutes < 60) return `بدأت منذ ${diffMinutes} دقيقة`;
    const hours = Math.floor(diffMinutes / 60);
    return `بدأت منذ ${hours} ساعة`;
  };

  if (loading) {
    return (
      <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-lg">
            <div className="w-8 h-8 bg-blue-500 rounded-xl flex items-center justify-center">
              <Video className="w-4 h-4 text-white" />
            </div>
            الجلسات المباشرة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
            <span className="mr-3 text-gray-600">جاري التحميل...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-rose-50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-lg text-red-700">
            <div className="w-8 h-8 bg-red-500 rounded-xl flex items-center justify-center">
              <Video className="w-4 h-4 text-white" />
            </div>
            خطأ في الجلسات المباشرة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600 text-sm mb-4">{error}</p>
          <Button 
            onClick={reconnect} 
            size="sm" 
            variant="outline"
            className="border-red-200 text-red-600 hover:bg-red-50"
          >
            إعادة المحاولة
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (liveSessions.length === 0) {
    return (
      <Card className="border-0 shadow-lg bg-gradient-to-br from-gray-50 to-slate-50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-lg">
            <div className="w-8 h-8 bg-gray-400 rounded-xl flex items-center justify-center">
              <Video className="w-4 h-4 text-white" />
            </div>
            الجلسات المباشرة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Video className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="font-semibold text-gray-700 mb-2">لا توجد جلسات مباشرة</h3>
            <p className="text-gray-500 text-sm">لم يتم العثور على جلسات نشطة حالياً</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 via-teal-50 to-cyan-50 overflow-hidden">
      <CardHeader className="pb-4 bg-gradient-to-r from-blue-500 to-teal-600 text-white">
        <CardTitle className="flex items-center gap-3 text-lg">
          <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
            <Video className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span>الجلسات المباشرة</span>
              <Badge className="bg-white/20 text-white border-white/30 animate-pulse">
                <div className="w-2 h-2 bg-white rounded-full mr-1"></div>
                مباشر
              </Badge>
            </div>
            <p className="text-blue-100 text-sm mt-1">
              {liveSessions.length} جلسة نشطة
            </p>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="space-y-0">
          {liveSessions.map((session, index) => (
            <div 
              key={session.id} 
              className={`p-6 border-b border-blue-100 last:border-b-0 hover:bg-white/50 transition-all duration-200 ${
                index === 0 ? 'bg-white/30' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <BookOpen className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-gray-800 truncate text-base">
                        {session.title}
                      </h4>
                      {session.course_title && (
                        <p className="text-sm text-blue-700 font-medium">
                          {session.course_title}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <span>{formatTimeAgo(session.started_at)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="w-4 h-4 text-blue-600" />
                      <span>{session.current_participants} مشارك</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Timer className="w-4 h-4 text-amber-600" />
                      <span>{session.remaining_time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Zap className="w-4 h-4 text-purple-600" />
                      <span>{session.duration_minutes} دقيقة</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2">
                  {session.can_join ? (
                    <Link href={`/join/${session.session_id}`}>
                      <Button 
                        size="sm" 
                        className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                      >
                        <Play className="w-4 h-4 ml-2" />
                        انضم للجلسة
                        <ArrowRight className="w-4 h-4 mr-2" />
                      </Button>
                    </Link>
                  ) : (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      disabled
                      className="border-gray-300 text-gray-500"
                    >
                      غير متاح
                    </Button>
                  )}
                  
                  <Badge 
                    variant="outline" 
                    className="text-xs bg-blue-50 text-blue-700 border-blue-200 justify-center"
                  >
                    <Sparkles className="w-3 h-3 ml-1" />
                    نشط
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Footer */}
        <div className="p-4 bg-gradient-to-r from-blue-100 to-teal-100 border-t border-blue-200">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-blue-700">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span>يتم التحديث كل 15 ثانية</span>
            </div>
            <Button 
              onClick={fetchLiveSessions} 
              size="sm" 
              variant="ghost"
              className="text-blue-700 hover:bg-blue-200"
            >
              <Sparkles className="w-4 h-4 ml-1" />
              تحديث
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
