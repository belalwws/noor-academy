'use client';

import React from 'react';
import { BookOpen, Clock, Play, UserIcon, Users, Video, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useLiveSessions } from '@/lib/store/hooks/useLiveSessions';
import { toast } from 'sonner';

const LiveSessionsSSE: React.FC = () => {
  const router = useRouter();
  const { liveSessions, loading, error, connected, reconnect } = useLiveSessions();

  const handleReconnect = () => {
    toast.info('جاري إعادة الاتصال...');
    reconnect();
  };

  return (
    <div className="space-y-6">
      {/* Live Sessions with SSE */}
      <Card className="bg-white/80 backdrop-blur-sm">
        <CardContent className="py-16 text-center">
          {/* Live Sessions Now */}
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-[#2d7d32] to-[#4caf50] text-white rounded-t-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full blur-2xl -translate-y-8 translate-x-8"></div>
              <CardTitle className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    <Video className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-base font-semibold">حصص مباشرة الآن</div>
                    <div className="text-xs text-blue-100 mt-0.5">
                      {liveSessions.length > 0 ? `${liveSessions.length} جلسة نشطة` : 'لا توجد جلسات'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {/* Connection Status */}
                  <div className="flex items-center gap-1">
                    {connected ? (
                      <Wifi className="w-4 h-4 text-blue-200" />
                    ) : (
                      <WifiOff className="w-4 h-4 text-red-300" />
                    )}
                    <span className="text-xs text-blue-100">
                      {connected ? 'متصل' : 'غير متصل'}
                    </span>
                  </div>
                  {liveSessions.length > 0 && (
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                      <span className="text-xs text-blue-100">مباشر</span>
                    </div>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {/* Error Handling */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-red-600">{error}</p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleReconnect}
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <RefreshCw className="w-3 h-3 mr-1" />
                      إعادة المحاولة
                    </Button>
                  </div>
                </div>
              )}
              
              {loading ? (
                <div className="text-center py-6">
                  <div className="w-10 h-10 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3"></div>
                  <p className="text-xs text-gray-500">جاري الاتصال بالخادم...</p>
                </div>
              ) : liveSessions.length > 0 ? (
                <div className="space-y-3">
                  {liveSessions.slice(0, 3).map((s: any) => (
                    <div key={s.session_id} className="bg-gradient-to-br from-blue-50 to-blue-50 rounded-lg p-3 border border-blue-200 hover:shadow-md transition-all duration-300">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <h4 className="font-medium text-gray-800 text-sm line-clamp-1">{s.title || 'جلسة مباشرة'}</h4>
                          <div className="flex items-center gap-1 text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                            <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                            <span>مباشر</span>
                          </div>
                        </div>

                        <div className="text-xs text-gray-600 space-y-1">
                          {s.course_title && (
                            <div className="flex items-center gap-2">
                              <BookOpen className="w-3 h-3 text-blue-600 flex-shrink-0" />
                              <span className="line-clamp-1">{s.course_title}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <UserIcon className="w-3 h-3 text-blue-600 flex-shrink-0" />
                            <span className="line-clamp-1">{s.teacher}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Clock className="w-3 h-3 text-orange-600" />
                              <span>{s.remaining_time}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="w-3 h-3 text-purple-600" />
                              <span>{s.current_participants}/{s.max_participants}</span>
                            </div>
                          </div>
                        </div>

                        <Button
                          size="sm"
                          className="w-full h-8 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md hover:shadow-lg transition-all duration-300"
                          onClick={() => router.push(`/join/${s.session_id}`)}
                          disabled={!s.can_join}
                        >
                          <Play className="w-3 h-3 mr-2" />
                          <span className="text-xs font-medium">انضم الآن</span>
                        </Button>
                      </div>
                    </div>
                  ))}
                  {liveSessions.length > 3 && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-blue-600 border-blue-200 hover:bg-blue-50 h-8"
                    >
                      عرض جميع الجلسات ({liveSessions.length})
                    </Button>
                  )}
                </div>
              ) : (
                <div className="text-center py-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Video className="w-6 h-6 text-gray-400" />
                  </div>
                  <h3 className="text-sm font-medium text-gray-700 mb-1">لا توجد حصص مباشرة</h3>
                  <p className="text-xs text-gray-500">ستظهر الجلسات النشطة هنا تلقائياً</p>
                  {!connected && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleReconnect}
                      className="mt-2 text-gray-600 border-gray-200 hover:bg-gray-50"
                    >
                      <RefreshCw className="w-3 h-3 mr-1" />
                      محاولة الاتصال
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};

export default LiveSessionsSSE;
