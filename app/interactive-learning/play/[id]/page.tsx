'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Trophy, Loader2, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import ProtectedRoute from '@/components/ProtectedRoute';
import dynamic from 'next/dynamic';
import { toast } from 'sonner';
import { interactiveGamesApi } from '@/lib/api/interactive-games';
import type { InteractiveGame } from '@/lib/api/interactive-games';
import { CountdownTimer } from '@/components/games/CountdownTimer';

// Dynamic import for H5P Player
const H5PPlayer = dynamic(() => import('@/components/H5PPlayer'), { 
  ssr: false,
  loading: () => (
    <div className="p-8 text-center">
      <Loader2 className="w-8 h-8 animate-spin mx-auto text-green-600" />
      <p className="mt-4 text-gray-600">جاري تحميل المحتوى...</p>
    </div>
  )
});

export default function PlayGamePage() {
  return (
    <ProtectedRoute allowedRoles={['student']}>
      <PlayGameContent />
    </ProtectedRoute>
  );
}

function PlayGameContent() {
  const params = useParams();
  const router = useRouter();
  const [game, setGame] = useState<InteractiveGame | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [timeUp, setTimeUp] = useState(false);
  const [showTimer, setShowTimer] = useState(false);

  useEffect(() => {
    if (params.id) {
      loadGame();
    }
  }, [params.id]);

  const loadGame = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🎮 Loading game with ID:', params.id);

      // Start play session
      const playResponse = await interactiveGamesApi.play(params.id as string);
      console.log('✅ Play response:', playResponse);
      console.log('🎯 Game data:', playResponse.game);
      console.log('📝 Session ID:', playResponse.session_id);
      console.log('📦 H5P Content:', playResponse.game?.h5p_content);
      
      if (!playResponse.game) {
        throw new Error('لم يتم العثور على بيانات اللعبة');
      }
      
      if (!playResponse.game.h5p_content) {
        console.warn('⚠️ Game has no H5P content');
        setError('اللعبة لا تحتوي على محتوى تفاعلي');
        return;
      }
      
      setGame(playResponse.game);
      setSessionId(playResponse.session_id);
    } catch (err: any) {
      console.error('❌ Error loading game:', err);
      console.error('Error details:', {
        message: err.message,
        status: err.status,
        stack: err.stack
      });
      setError(err.message || 'حدث خطأ في تحميل اللعبة');
      toast.error(err.message || 'حدث خطأ في تحميل اللعبة');
    } finally {
      setLoading(false);
    }
  };

  const handleGameComplete = async (score: number, maxScore: number, completion: number) => {
    if (!sessionId || !params.id) return;

    try {
      await interactiveGamesApi.completeSession(params.id as string, {
        session_id: sessionId,
        score,
        max_score: maxScore,
        completion_percentage: completion,
      });

      toast.success('تم إكمال اللعبة بنجاح!');
      
      // Optionally redirect after a delay
      setTimeout(() => {
        router.push('/interactive-learning');
      }, 2000);
    } catch (error: any) {
      console.error('Error saving session:', error);
      toast.error('حدث خطأ في حفظ النتيجة');
    }
  };

  const handleTimerComplete = () => {
    setTimeUp(true);
    toast.error('انتهى الوقت المخصص للعبة!');
    // Auto-complete the game when time is up
    handleGameComplete(0, 100, 0);
  };

  const handleTimerWarning = () => {
    // Show timer when 30 seconds remain
    setShowTimer(true);
    toast.warning('تنبيه: يتبقى 30 ثانية فقط!');
  };


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-green-600 mb-4" />
          <p className="text-gray-600">جاري تحميل اللعبة...</p>
        </div>
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50" dir="rtl">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-red-600 mb-4">{error || 'اللعبة غير موجودة'}</p>
              <Button onClick={() => router.push('/interactive-learning')}>
                <ArrowLeft className="w-4 h-4 ml-2" />
                العودة للألعاب
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 py-6 px-4" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Button
            variant="ghost"
            onClick={() => router.push('/interactive-learning')}
            className="mb-6 hover:bg-white/50 dark:hover:bg-slate-800/50"
          >
            <ArrowLeft className="w-5 h-5 ml-2" />
            <span className="text-lg">العودة</span>
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card className="shadow-2xl border-0 overflow-hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-primary via-primary-light to-accent p-8 pb-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <CardTitle className="text-4xl md:text-5xl font-black mb-3 text-white drop-shadow-lg">
                    {game.title}
                  </CardTitle>
                  <p className="text-lg text-white/90 mb-4 leading-relaxed">
                    {game.description}
                  </p>
                  {game.difficulty_level_display && (
                    <div className="mt-4">
                      <span className="inline-flex items-center px-4 py-2 rounded-full text-base font-semibold bg-white/20 backdrop-blur-sm text-white border-2 border-white/30">
                        <Trophy className="w-5 h-5 ml-2" />
                        {game.difficulty_level_display}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              {/* Timer - Only show when 30 seconds remain or less */}
              {game.has_timer && game.time_limit && game.time_limit > 0 && (
                <>
                  {/* Visible timer - shown when 30 seconds or less remain */}
                  {showTimer && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8, y: -20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.8, y: -20 }}
                      transition={{ duration: 0.3, type: 'spring' }}
                      className="mb-6 flex justify-center fixed top-20 left-1/2 transform -translate-x-1/2 z-50"
                    >
                      <Card className="border-4 border-red-500 dark:border-red-600 shadow-2xl bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/50 dark:to-orange-950/50 animate-pulse">
                        <CardContent className="p-6">
                          <div className="flex flex-col items-center gap-3">
                            <div className="flex items-center gap-2 text-red-700 dark:text-red-300 font-bold">
                              <Clock className="w-6 h-6 animate-spin" />
                              <span className="text-lg">الوقت المتبقي</span>
                            </div>
                            <CountdownTimer
                              key={`timer-${gameStarted}`}
                              duration={game.time_limit}
                              isPlaying={!timeUp && gameStarted}
                              onComplete={handleTimerComplete}
                              onTimeWarning={handleTimerWarning}
                              size={120}
                              showWarningColors={true}
                              playWarningSounds={true}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}

                  {/* Hidden timer that runs in background to trigger warning at 30 seconds */}
                  {gameStarted && (
                    <div className="hidden">
                      <CountdownTimer
                        key={`hidden-timer-${gameStarted}`}
                        duration={game.time_limit}
                        isPlaying={!timeUp && gameStarted && !showTimer}
                        onComplete={handleTimerComplete}
                        onTimeWarning={handleTimerWarning}
                        size={0}
                        showWarningColors={false}
                        playWarningSounds={true}
                        showTime={false}
                      />
                    </div>
                  )}
                </>
              )}

              {game.h5p_content ? (
                <div 
                  onMouseEnter={() => {
                    if (!gameStarted) {
                      setGameStarted(true);
                    }
                  }}
                  onClick={() => {
                    if (!gameStarted) {
                      setGameStarted(true);
                    }
                  }}
                >
                  <H5PPlayer
                    h5pContent={{
                      ...game.h5p_content,
                      question_time_limit: game.question_time_limit
                    }}
                    onComplete={handleGameComplete}
                  />
                </div>
              ) : (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-300 dark:border-yellow-700 rounded-2xl p-12 text-center min-h-[400px] flex items-center justify-center">
                  <div>
                    <p className="text-yellow-800 dark:text-yellow-200 font-bold text-xl mb-2">⚠️ لا يوجد محتوى تفاعلي</p>
                    <p className="text-yellow-700 dark:text-yellow-300 text-lg">هذه اللعبة لا تحتوي على محتوى H5P</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

