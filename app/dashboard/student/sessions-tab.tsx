'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, PlayCircle, AlertCircle, Users, Timer } from 'lucide-react';
import { sessionsAPI, joinSession } from '@/lib/api/sessions';
import type { SessionData } from '@/lib/api/sessions';
import { toast } from 'sonner';
import { Spinner } from '@/components/ui/spinner';

export function SessionsTab() {
  const router = useRouter();
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const sessionsData = await sessionsAPI.getSessions();
      setSessions(sessionsData);
      
    } catch (error: any) {
      console.error('Error loading sessions:', error);
      setError(error.message || 'فشل في تحميل الجلسات');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinSession = async (sessionId: string) => {
    try {
      const joinData = await joinSession(sessionId);
      router.push(`/meet/rooms/${joinData.room_name}`);
      toast.success('تم الانضمام للجلسة بنجاح');
    } catch (error: any) {
      console.error('Failed to join session:', error);
      toast.error(error.message || 'فشل في الانضمام للجلسة');
    }
  };

  const getStatusBadge = (session: SessionData) => {
    if (session.is_expired) {
      return <Badge variant="secondary">انتهت الجلسة</Badge>;
    }
    if (session.is_active) {
      return <Badge variant="default">نشطة الآن</Badge>;
    }
    return <Badge variant="outline">قريباً</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center gap-2">
          <Spinner size="md" />
          <span>جاري تحميل الجلسات...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-2" />
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={loadSessions} variant="outline" size="sm">
            إعادة المحاولة
          </Button>
        </div>
      </div>
    );
  }

  if (!sessions || sessions.length === 0) {
    return (
      <div className="text-center p-8">
        <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد جلسات متاحة</h3>
        <p className="text-gray-500">لم يتم جدولة أي جلسات حتى الآن</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">الجلسات المتاحة</h3>
        <Button onClick={loadSessions} variant="outline" size="sm">
          تحديث
        </Button>
      </div>

      <div className="space-y-4">
        {sessions.map((session) => (
          <Card key={session.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-medium">{session.title}</h4>
                    {getStatusBadge(session)}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{session.participant_count} مشارك</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{session.duration_minutes} دقيقة</span>
                    </div>
                    {!session.is_expired && (
                      <div className="flex items-center gap-1">
                        <Timer className="w-4 h-4" />
                        <span>{session.remaining_time}</span>
                      </div>
                    )}
                  </div>
                  
                  {session.course_title && (
                    <p className="text-sm text-gray-600 mt-1">
                      كورس: {session.course_title}
                    </p>
                  )}
                </div>

                <div>
                  {session.is_expired ? (
                    <Button disabled variant="outline" size="sm">
                      انتهت الجلسة
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => handleJoinSession(session.id)} 
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <PlayCircle className="w-4 h-4 ml-1" />
                      انضم
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}


