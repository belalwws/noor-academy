'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Users, 
  Clock, 
  BookOpen, 
  Play, 
  AlertCircle, 
  CheckCircle,
  Calendar,
  User,
  Timer,
  Star,
  Sparkles,
  ArrowRight,
  GraduationCap,
  Zap
} from 'lucide-react';
import { sessionsAPI, joinSession } from '@/lib/api/sessions';
import type { LiveSessionInfo, JoinSessionResponse } from '@/lib/api/sessions';

export default function JoinSessionPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;
  
  const [sessionInfo, setSessionInfo] = useState<LiveSessionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [micEnabled, setMicEnabled] = useState(true);

  useEffect(() => {
    loadSessionInfo();
  }, [sessionId]);

  const loadSessionInfo = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const session = await sessionsAPI.getLiveSessionInfo(sessionId);
      setSessionInfo(session);
      
    } catch (error: any) {
      console.error('Error loading session:', error);
      setError(error.message || 'فشل في تحميل معلومات الجلسة المباشرة');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinSession = async () => {
    if (!sessionInfo) return;
    
    setJoining(true);
    try {
      const joinData: JoinSessionResponse = await joinSession(sessionId);
      
      router.push(`/meet/rooms/${joinData.room_name}`);
      
    } catch (error: any) {
      console.error('Error joining session:', error);
      toast.error(error.message || 'فشل في الانضمام للجلسة');
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center" dir="rtl">
        <div className="text-center bg-white/80 backdrop-blur-sm rounded-3xl p-12 shadow-2xl max-w-md">
          <div className="relative mb-8">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-emerald-200 border-t-emerald-600 mx-auto"></div>
            <Sparkles className="w-8 h-8 text-emerald-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">جاري تحميل معلومات الجلسة</h2>
          <p className="text-gray-600">يرجى الانتظار قليلاً...</p>
          <div className="mt-6 flex items-center justify-center gap-2 text-emerald-600">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !sessionInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-rose-50 to-pink-50 flex items-center justify-center p-4" dir="rtl">
        <Card className="w-full max-w-lg border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
          <CardContent className="pt-8 pb-8">
            <div className="text-center">
              <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-12 h-12 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold text-red-600 mb-4">خطأ في تحميل الجلسة</h2>
              <p className="text-gray-600 mb-8 leading-relaxed">{error || 'لم يتم العثور على الجلسة'}</p>
              <div className="flex gap-3 justify-center">
                <Button 
                  onClick={loadSessionInfo} 
                  variant="outline"
                  className="px-6 py-3 rounded-xl border-2 border-red-200 text-red-600 hover:bg-red-50"
                >
                  إعادة المحاولة
                </Button>
                <Button 
                  onClick={() => router.push('/dashboard')}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white"
                >
                  <ArrowRight className="w-4 h-4 ml-2" />
                  العودة للداشبورد
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50" dir="rtl">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white py-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-48 translate-x-48"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-32 -translate-x-32"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Video className="w-10 h-10 text-yellow-300" />
            </div>
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-white to-yellow-100 bg-clip-text text-transparent">
              الانضمام للجلسة المباشرة
            </h1>
            <p className="text-emerald-100 text-lg">تحقق من الإعدادات وانضم للجلسة التعليمية</p>
            <div className="flex items-center justify-center gap-2 mt-4">
              <Sparkles className="w-5 h-5 text-yellow-300" />
              <span className="text-emerald-200">تجربة تعليمية تفاعلية</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Enhanced Session Info */}
              <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 pb-6">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <BookOpen className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-2xl text-emerald-800 mb-2">{sessionInfo.title}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-3 py-1">
                          <GraduationCap className="w-4 h-4 ml-1" />
                          جلسة مباشرة
                        </Badge>
                        {sessionInfo.is_live && (
                          <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1 animate-pulse">
                            <div className="w-2 h-2 bg-white rounded-full ml-1"></div>
                            مباشر الآن
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 text-center">
                      <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-2xl font-bold text-blue-800 mb-1">{sessionInfo.current_participants}</div>
                      <div className="text-sm text-blue-600">مشارك حالياً</div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl p-6 text-center">
                      <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                        <Clock className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-2xl font-bold text-emerald-800 mb-1">{sessionInfo.duration_minutes}</div>
                      <div className="text-sm text-emerald-600">دقيقة</div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 text-center">
                      <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                        <Timer className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-lg font-bold text-amber-800 mb-1">{sessionInfo.remaining_time}</div>
                      <div className="text-sm text-amber-600">متبقي</div>
                    </div>
                  </div>
                </CardContent>
              </Card>


              {/* Enhanced Join Button */}
              <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
                <CardContent className="p-8">
                  {!sessionInfo.is_live ? (
                    <Alert className="border-2 border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
                      <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center">
                        <AlertCircle className="h-4 w-4 text-white" />
                      </div>
                      <AlertDescription className="text-amber-800 font-medium text-base">
                        هذه الجلسة غير نشطة حالياً. يرجى انتظار بدء الجلسة من قبل المعلم.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <div className="text-center">
                      <div className="mb-6">
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">جاهز للانضمام؟</h3>
                        <p className="text-gray-600">انقر على الزر أدناه للانضمام للجلسة المباشرة</p>
                      </div>
                      <Button
                        onClick={handleJoinSession}
                        disabled={joining}
                        className="w-full bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-700 hover:via-teal-700 hover:to-cyan-700 text-white font-bold py-6 px-8 rounded-2xl text-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-xl"
                        size="lg"
                      >
                        {joining ? (
                          <>
                            <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent ml-3"></div>
                            جاري الانضمام...
                          </>
                        ) : (
                          <>
                            <Zap className="w-7 h-7 ml-3" />
                            انضم للجلسة الآن
                            <ArrowRight className="w-6 h-6 mr-3" />
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Enhanced Sidebar */}
            <div className="space-y-8">
              {/* Enhanced Session Status */}
              <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
                <CardHeader className="pb-6">
                  <CardTitle className="text-xl text-gray-800 flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    حالة الجلسة
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 font-medium">الحالة الحالية</span>
                    <Badge 
                      className={`px-4 py-2 text-sm font-medium ${
                        sessionInfo.is_live 
                          ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white animate-pulse' 
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {sessionInfo.is_live ? (
                        <>
                          <div className="w-2 h-2 bg-white rounded-full ml-2"></div>
                          نشطة ومباشرة
                        </>
                      ) : (
                        'غير نشطة'
                      )}
                    </Badge>
                  </div>
                  
                  {sessionInfo.is_live && (
                    <div className="space-y-4">
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4">
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="font-medium text-emerald-800">الوقت المتبقي</span>
                          <span className="font-bold text-emerald-700">{sessionInfo.remaining_time}</span>
                        </div>
                        <Progress value={75} className="h-3 bg-emerald-100" />
                        <div className="text-xs text-emerald-600 mt-2 text-center">
                          استمتع بالجلسة التعليمية
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Enhanced Session Guidelines */}
              <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
                <CardHeader className="pb-6">
                  <CardTitle className="text-xl text-gray-800 flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    إرشادات الجلسة
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    'تأكد من اتصال إنترنت مستقر وسريع',
                    'اختر مكاناً هادئاً ومضاء جيداً',
                    'جهز أدواتك التعليمية مسبقاً',
                    'احترم آداب الجلسة التعليمية',
                    'شارك بفعالية في النقاش',
                    'اطرح أسئلتك في الوقت المناسب'
                  ].map((guideline, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm text-gray-700 font-medium leading-relaxed">{guideline}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Footer */}
      <footer className="bg-gradient-to-r from-gray-800 via-gray-900 to-black text-white py-12 mt-20">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Star className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              لسان الحكمة
            </span>
          </div>
          <p className="text-gray-300 text-lg mb-4">
            منصة تعليمية تفاعلية
          </p>
          <div className="text-sm text-gray-400">
            جميع الحقوق محفوظة - سحابة رؤيا
          </div>
        </div>
      </footer>
    </div>
  );
}