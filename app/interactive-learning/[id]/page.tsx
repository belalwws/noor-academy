'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Play, Trophy, Users, Repeat, Star, Gamepad2, Loader2, User } from 'lucide-react';
import { toast } from 'sonner';
import { interactiveGamesApi, type InteractiveGame } from '@/lib/api/interactive-games';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function GameDetailsPage() {
  return <GameDetailsContent />;
}

function GameDetailsContent() {
  const params = useParams();
  const router = useRouter();
  const [game, setGame] = useState<InteractiveGame | null>(null);
  const [teacherGames, setTeacherGames] = useState<InteractiveGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingTeacherGames, setLoadingTeacherGames] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.id) {
      loadGame();
    }
  }, [params.id]);

  const loadGame = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🎮 Loading game details with ID:', params.id);

      // Use public access (no authentication required)
      const gameData = await interactiveGamesApi.get(params.id as string, false);
      console.log('✅ Game loaded:', gameData);
      
      if (!gameData) {
        throw new Error('لم يتم العثور على اللعبة');
      }
      
      setGame(gameData);
      
      // Load teacher's other games (non-blocking - don't wait for it)
      console.log('👨‍🏫 Game teacher ID:', gameData.teacher, 'Type:', typeof gameData.teacher);
      if (gameData.teacher) {
        // Load asynchronously without blocking the main UI
        loadTeacherGames(gameData.teacher).catch(err => {
          console.warn('⚠️ Failed to load teacher games (non-critical):', err);
        });
      } else {
        console.warn('⚠️ No teacher ID found in game data');
      }
    } catch (err: any) {
      console.error('❌ Error loading game:', err);
      setError(err.message || 'حدث خطأ في تحميل اللعبة');
      toast.error(err.message || 'حدث خطأ في تحميل اللعبة');
    } finally {
      setLoading(false);
    }
  };

  const loadTeacherGames = async (teacherId: number, retryCount = 0) => {
    const maxRetries = 2;
    
    try {
      setLoadingTeacherGames(true);
      console.log(`🔍 Loading teacher games for teacher ID: ${teacherId} (attempt ${retryCount + 1})`);
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout loading teacher games')), 8000)
      );
      
      // Use public access (no authentication required)
      const responsePromise = interactiveGamesApi.list({ status: 'approved' }, false);
      const response = await Promise.race([responsePromise, timeoutPromise]) as any;
      
      console.log('📦 All approved games:', response.results?.length);
      console.log('📦 All games:', response.results);
      
      // Filter games by teacher and exclude current game
      const filtered = (response.results || []).filter((g: InteractiveGame) => {
        // Convert both to numbers for comparison
        const gameTeacherId = typeof g.teacher === 'string' ? parseInt(g.teacher) : g.teacher;
        const targetTeacherId = typeof teacherId === 'string' ? parseInt(teacherId) : teacherId;
        const isSameTeacher = gameTeacherId === targetTeacherId;
        const isNotCurrentGame = String(g.id) !== String(params.id);
        console.log(`🔍 Game ${g.id}: teacher=${g.teacher} (${typeof g.teacher}), target=${teacherId} (${typeof teacherId}), isSameTeacher=${isSameTeacher}, isNotCurrentGame=${isNotCurrentGame}`);
        return isSameTeacher && isNotCurrentGame;
      });
      
      console.log('✅ Filtered teacher games:', filtered.length, filtered);
      setTeacherGames(filtered.slice(0, 6)); // Show max 6 games
    } catch (err: any) {
      console.error(`❌ Error loading teacher games (attempt ${retryCount + 1}):`, err);
      
      // Retry if we haven't exceeded max retries and it's a connection error
      if (retryCount < maxRetries && (
        err.message?.includes('500') || 
        err.message?.includes('connection') || 
        err.message?.includes('timeout') ||
        err.message?.includes('Timeout')
      )) {
        console.log(`🔄 Retrying in 1 second... (${retryCount + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return loadTeacherGames(teacherId, retryCount + 1);
      }
      
      // Don't show error toast - just silently fail and show empty state
      setTeacherGames([]); // Set empty array so empty state shows
    } finally {
      setLoadingTeacherGames(false);
    }
  };

  const getDifficultyBadgeVariant = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'default';
      case 'intermediate':
        return 'secondary';
      case 'advanced':
        return 'destructive';
      default:
        return 'default';
    }
  };

  const getDifficultyLabel = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'مبتدئ';
      case 'intermediate':
        return 'متوسط';
      case 'advanced':
        return 'متقدم';
      default:
        return level;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 pt-20" dir="rtl">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin mx-auto text-orange-600 mb-4" />
          <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">جاري تحميل تفاصيل اللعبة...</p>
        </div>
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 pt-20" dir="rtl">
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 pt-20" dir="rtl">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.push('/interactive-learning')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 ml-2" />
          العودة للألعاب
        </Button>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Game Header Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="shadow-lg border-2 border-orange-200 dark:border-orange-800">
                <div className="relative h-48 bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500 overflow-hidden">
                  {/* Decorative Pattern */}
                  <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-yellow-300 rounded-full blur-2xl" />
                  </div>
                  
                  {/* Difficulty Badge */}
                  <div className="absolute top-4 left-4 z-10">
                    <Badge 
                      variant={getDifficultyBadgeVariant(game.difficulty_level)}
                      className="shadow-lg backdrop-blur-sm text-lg px-4 py-2"
                    >
                      {getDifficultyLabel(game.difficulty_level)}
                    </Badge>
                  </div>
                  
                  {/* Game Icon */}
                  <div className="absolute bottom-4 right-4">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                      <Gamepad2 className="w-8 h-8 text-white" />
                    </div>
                  </div>
                </div>

                <CardHeader>
                  <CardTitle className="text-3xl font-bold mb-4 text-gray-800 dark:text-slate-100">
                    {game.title}
                  </CardTitle>
                  <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                    {game.description}
                  </p>
                </CardHeader>

                <CardContent>
                  {/* Stats */}
                  <div className="flex items-center gap-6 mb-6 pb-6 border-b border-gray-200 dark:border-slate-700">
                    <div className="flex items-center gap-2">
                      <Repeat className="w-5 h-5 text-orange-600" />
                      <span className="text-gray-600 dark:text-gray-400">
                        <span className="font-semibold text-lg">{game.play_count}</span>
                        <span className="mr-1"> مرة لعب</span>
                      </span>
                    </div>
                    {game.average_score !== null && (
                      <div className="flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-yellow-500" />
                        <span className="text-gray-600 dark:text-gray-400">
                          <span className="font-semibold text-lg">{game.average_score.toFixed(1)}</span>
                          <span className="mr-1"> متوسط</span>
                        </span>
                      </div>
                    )}
                    {game.average_score !== null && game.average_score >= 4 && (
                      <div className="flex items-center gap-2">
                        <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                        <span className="text-gray-600 dark:text-gray-400 font-semibold">مميز</span>
                      </div>
                    )}
                  </div>

                  {/* Play Button */}
                  <Link href={`/interactive-learning/play/${game.id}`} className="block">
                    <Button className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl h-14 text-xl font-semibold">
                      <Play className="w-6 h-6 ml-2" />
                      ابدأ اللعب الآن
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Teacher Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5 text-orange-600" />
                    معلومات المدرس
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">اسم المدرس</p>
                      <p className="text-lg font-semibold text-gray-800 dark:text-slate-100">
                        {game.teacher_name || 'غير متوفر'}
                      </p>
                    </div>
                    {game.teacher_email && (
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">البريد الإلكتروني</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {game.teacher_email}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Teacher's Other Games */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gamepad2 className="w-5 h-5 text-orange-600" />
                    ألعاب أخرى من {game.teacher_name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingTeacherGames ? (
                    <div className="text-center py-8">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto text-orange-600 mb-2" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">جاري التحميل...</p>
                    </div>
                  ) : teacherGames.length > 0 ? (
                    <div className="space-y-3">
                      {teacherGames.map((teacherGame) => (
                        <Link
                          key={teacherGame.id}
                          href={`/interactive-learning/${teacherGame.id}`}
                          className="block"
                        >
                          <div className="p-3 rounded-lg border border-gray-200 dark:border-slate-700 hover:border-orange-400 dark:hover:border-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all cursor-pointer">
                            <h4 className="font-semibold text-gray-800 dark:text-slate-100 mb-1 line-clamp-2">
                              {teacherGame.title}
                            </h4>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant={getDifficultyBadgeVariant(teacherGame.difficulty_level)} className="text-xs">
                                {getDifficultyLabel(teacherGame.difficulty_level)}
                              </Badge>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {teacherGame.play_count} مرة
                              </span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Gamepad2 className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        لا توجد ألعاب أخرى من هذا المدرس
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

