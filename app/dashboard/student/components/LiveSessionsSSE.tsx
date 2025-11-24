'use client';

import React from 'react';
import { BookOpen, Clock, Play, UserIcon, Users, Video, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useLiveSessions } from '@/lib/store/hooks/useLiveSessions';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const LiveSessionsSSE: React.FC = () => {
  const router = useRouter();
  const { liveSessions, loading, error, connected, reconnect } = useLiveSessions();

  const handleReconnect = () => {
    toast.info('جاري إعادة الاتصال...');
    reconnect();
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.7 }}
    >
      <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden bg-white dark:bg-slate-800">
        <CardHeader className="bg-gradient-to-br from-blue-500 via-blue-600 to-teal-600 dark:from-blue-700 dark:via-blue-800 dark:to-teal-800 text-white rounded-t-2xl relative overflow-hidden p-5">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-12 translate-x-12"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-teal-300/20 rounded-full blur-2xl translate-y-8 -translate-x-8"></div>
          <CardTitle className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-3">
              <motion.div
                whileHover={{ rotate: 5 }}
                className="p-2.5 bg-white/30 rounded-xl backdrop-blur-sm shadow-lg"
              >
                <Video className="w-5 h-5" />
              </motion.div>
              <div>
                <div className="text-lg font-bold">حصص مباشرة الآن</div>
                <div className="text-xs text-blue-100 dark:text-blue-200 mt-1">
                  {liveSessions.length > 0 ? `${liveSessions.length} جلسة نشطة` : 'لا توجد جلسات'}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Connection Status */}
              <div className="flex items-center gap-1.5 bg-white/20 px-2 py-1 rounded-lg backdrop-blur-sm">
                {connected ? (
                  <Wifi className="w-4 h-4 text-blue-200" />
                ) : (
                  <WifiOff className="w-4 h-4 text-red-300" />
                )}
                <span className="text-xs text-white font-medium">
                  {connected ? 'متصل' : 'غير متصل'}
                </span>
              </div>
              {liveSessions.length > 0 && (
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="flex items-center gap-1.5 bg-red-500/30 px-2 py-1 rounded-lg backdrop-blur-sm"
                >
                  <div className="w-2 h-2 bg-red-300 rounded-full animate-pulse"></div>
                  <span className="text-xs text-white font-medium">مباشر</span>
                </motion.div>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5 bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-slate-800 dark:to-blue-900/10">
        <div className="space-y-3">
          {/* Error Handling */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-red-600 dark:text-red-400 flex-1">{error}</p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleReconnect}
                  className="text-red-600 dark:text-red-400 border-red-300 dark:border-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 shadow-sm"
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  إعادة المحاولة
                </Button>
              </div>
            </motion.div>
          )}

          {loading ? (
            <div className="text-center py-8">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-12 h-12 border-3 border-blue-200 dark:border-blue-700 border-t-blue-600 dark:border-t-blue-400 rounded-full mx-auto mb-4"
              ></motion.div>
              <p className="text-sm text-slate-600 dark:text-slate-400">جاري فحص الجلسات...</p>
            </div>
          ) : liveSessions.length > 0 ? (
            <div className="space-y-3">
              {liveSessions.slice(0, 3).map((s: any, index: number) => (
                <motion.div
                  key={s.session_id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className="bg-gradient-to-br from-white to-blue-50/50 dark:from-slate-700 dark:to-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-700 hover:shadow-lg transition-all duration-300"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-semibold text-slate-800 dark:text-slate-100 text-sm line-clamp-1">{s.title || 'جلسة مباشرة'}</h4>
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 px-2 py-1 rounded-full border border-red-200 dark:border-red-700"
                      >
                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="font-medium">مباشر</span>
                      </motion.div>
                    </div>

                    <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1.5">
                      {s.course_title && (
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                          <span className="line-clamp-1 font-medium">{s.course_title}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <UserIcon className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                        <span className="line-clamp-1 font-medium">{s.teacher}</span>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-slate-200 dark:border-slate-600">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
                          <span className="font-medium">{s.remaining_time}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                          <span className="font-medium">{s.current_participants}/{s.max_participants}</span>
                        </div>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      className="w-full h-9 bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-700 hover:to-blue-700 dark:from-blue-700 dark:to-blue-700 dark:hover:from-blue-800 dark:hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 font-medium"
                      onClick={() => router.push(`/join/${s.session_id}`)}
                      disabled={!s.can_join}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      <span className="text-sm">انضم الآن</span>
                    </Button>
                  </div>
                </motion.div>
              ))}
              {liveSessions.length > 3 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 h-10 font-medium shadow-sm hover:shadow-md transition-all duration-300"
                  onClick={() => router.push('/dashboard/student/sessions')}
                >
                  عرض جميع الجلسات ({liveSessions.length})
                </Button>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
                className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
              >
                <Video className="w-8 h-8 text-slate-400 dark:text-slate-500" />
              </motion.div>
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">لا توجد حصص مباشرة</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">ستظهر الجلسات النشطة هنا</p>
              {!connected && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleReconnect}
                  className="mt-2 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm"
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  محاولة الاتصال
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
    </motion.div>
  );
};

export default LiveSessionsSSE;
