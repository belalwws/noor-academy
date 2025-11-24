'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Gamepad2, Play, Search, Trophy, Users, Loader2, Star, Sparkles, Filter, X, Repeat, BookOpen, User } from 'lucide-react';
import Link from 'next/link';
import { interactiveGamesApi, type InteractiveGame } from '@/lib/api/interactive-games';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function InteractiveLearningPage() {
  return <InteractiveLearningContent />;
}

function InteractiveLearningContent() {
  const [games, setGames] = useState<InteractiveGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [topicFilter, setTopicFilter] = useState<string>('all');

  // Topics mapping
  const topics = [
    { value: 'all', label: 'الكل' },
    { value: 'science', label: 'العلوم' },
    { value: 'mathematics', label: 'الرياضيات' },
    { value: 'languages', label: 'اللغات' },
    { value: 'social_studies', label: 'الدراسات الاجتماعية' },
    { value: 'religious_studies', label: 'الدراسات الدينية' },
    { value: 'computer_programming', label: 'الحاسب والبرمجة' },
    { value: 'skills', label: 'المهارات' },
    { value: 'art_design', label: 'الفن والتصميم' },
    { value: 'personal_development', label: 'تطوير الذات' },
    { value: 'academic_level', label: 'المرحلة الدراسية' },
  ];

  // Game types mapping
  const gameTypes = [
    { id: 'H5P.QuestionSet', name: 'مجموعة أسئلة' },
    { id: 'H5P.MultiChoice', name: 'اختيار من متعدد' },
    { id: 'H5P.TrueFalse', name: 'صحيح/خطأ' },
    { id: 'H5P.DragQuestion', name: 'سحب وإفلات' },
    { id: 'H5P.DragText', name: 'سحب وإفلات' },
    { id: 'H5P.FillInTheBlanks', name: 'ملء الفراغات' },
    { id: 'H5P.Blanks', name: 'ملء الفراغات' },
  ];

  useEffect(() => {
    loadGames();
  }, []);

  const loadGames = async () => {
    try {
      setLoading(true);
      console.log('🎮 Loading approved games (public access)...');
      // Use public access (no authentication required)
      const response = await interactiveGamesApi.list({ status: 'approved' }, false);
      console.log('✅ Games loaded:', response);
      console.log('📊 Games count:', response.count);
      console.log('📋 Games results:', response.results);
      setGames(response.results || []);
      
      if (!response.results || response.results.length === 0) {
        console.warn('⚠️ No approved games found');
        toast.info('لا توجد ألعاب معتمدة حالياً');
      }
    } catch (error: any) {
      console.error('❌ Error loading games:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.status,
        stack: error.stack
      });
      const errorMessage = error.message || 'حدث خطأ في تحميل الألعاب';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const filteredGames = games.filter(game => {
    const matchesSearch = 
      game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDifficulty = 
      difficultyFilter === 'all' || game.difficulty_level === difficultyFilter;
    
    const matchesTopic = 
      topicFilter === 'all' || game.topic === topicFilter;
    
    return matchesSearch && matchesDifficulty && matchesTopic;
  });

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

  const getGameTypeLabel = (library: string) => {
    const gameType = gameTypes.find(gt => gt.id === library);
    return gameType?.name || library;
  };

  const getTopicLabel = (topic: string | null | undefined) => {
    if (!topic) return null;
    const topicObj = topics.find(t => t.value === topic);
    return topicObj?.label || topic;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 pt-20" dir="rtl">
      {/* Header */}
      <div className="relative bg-gradient-to-r from-[#0A5734] via-[#4A8F5C] to-[#0A5734] text-white py-16 overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#C5A15A]/30 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#4A8F5C]/30 rounded-full blur-3xl" />
        </div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-center gap-4 mb-6"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <Gamepad2 className="w-20 h-20 text-[#C5A15A] drop-shadow-lg" />
            </motion.div>
            <div>
              <h1 className="text-5xl md:text-6xl font-bold mb-2 drop-shadow-lg">
                التعليم التفاعلي
              </h1>
              <p className="text-xl md:text-2xl text-white/90 font-medium">
                Interactive Learning
              </p>
            </div>
          </motion.div>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl max-w-3xl mx-auto leading-relaxed text-white/80"
          >
            استمتع بتجربة تعليمية تفاعلية من خلال الألعاب والتمارين المصممة خصيصاً لك
          </motion.p>
          
          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex items-center justify-center gap-8 mt-8"
          >
            <div className="flex items-center gap-2">
              <Gamepad2 className="w-5 h-5 text-[#C5A15A]" />
              <span className="text-lg font-semibold">{games.length} لعبة</span>
            </div>
            <div className="flex items-center gap-2">
              <Repeat className="w-5 h-5 text-[#C5A15A]" />
              <span className="text-lg font-semibold">
                {games.reduce((sum, g) => sum + g.play_count, 0)} مرة لعب
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        {/* Search and Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 space-y-6"
        >
          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5 z-10" />
            <Input
              placeholder="ابحث عن لعبة تفاعلية..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-12 h-12 text-lg bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 focus:border-[#0A5734] dark:focus:border-[#4A8F5C] rounded-xl shadow-md"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
          
          {/* Filter Buttons */}
          <div className="space-y-4">
            {/* Difficulty Filter */}
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Filter className="w-4 h-4" />
                <span className="text-sm font-medium">مستوى الصعوبة:</span>
              </div>
              <Button
                variant={difficultyFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDifficultyFilter('all')}
                className={`rounded-full transition-all ${
                  difficultyFilter === 'all'
                    ? 'bg-[#0A5734] hover:bg-[#073D24] text-white shadow-md'
                    : 'bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700'
                }`}
              >
                الكل
              </Button>
              <Button
                variant={difficultyFilter === 'beginner' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDifficultyFilter('beginner')}
                className={`rounded-full transition-all ${
                  difficultyFilter === 'beginner'
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md'
                    : 'bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700'
                }`}
              >
                مبتدئ
              </Button>
              <Button
                variant={difficultyFilter === 'intermediate' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDifficultyFilter('intermediate')}
                className={`rounded-full transition-all ${
                  difficultyFilter === 'intermediate'
                    ? 'bg-[#C5A15A] hover:bg-[#B8914A] text-white shadow-md'
                    : 'bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700'
                }`}
              >
                متوسط
              </Button>
              <Button
                variant={difficultyFilter === 'advanced' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDifficultyFilter('advanced')}
                className={`rounded-full transition-all ${
                  difficultyFilter === 'advanced'
                    ? 'bg-red-600 hover:bg-red-700 text-white shadow-md'
                    : 'bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700'
                }`}
              >
                متقدم
              </Button>
            </div>

            {/* Topic Filter */}
            <div className="flex items-center justify-center gap-3">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <BookOpen className="w-4 h-4" />
                <span className="text-sm font-medium">الموضوع:</span>
              </div>
              <Select value={topicFilter} onValueChange={setTopicFilter}>
                <SelectTrigger className="w-64 h-10 bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 focus:border-[#0A5734] dark:focus:border-[#4A8F5C] rounded-xl shadow-md">
                  <SelectValue placeholder="اختر الموضوع" />
                </SelectTrigger>
                <SelectContent className="z-50 [&>div[data-radix-select-viewport]]:max-h-[300px]">
                  {topics.map((topic) => (
                    <SelectItem 
                      key={topic.value} 
                      value={topic.value}
                      className="text-sm py-2 cursor-pointer hover:bg-[#0A5734]/5 dark:hover:bg-slate-700"
                    >
                      {topic.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Results Count */}
          {filteredGames.length > 0 && (
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                تم العثور على <span className="font-semibold text-[#0A5734] dark:text-[#4A8F5C]">{filteredGames.length}</span> لعبة
              </p>
            </div>
          )}
        </motion.div>

        {/* Games Grid */}
        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <Loader2 className="w-16 h-16 animate-spin mx-auto text-[#0A5734] dark:text-[#4A8F5C] mb-4" />
            <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">جاري التحميل...</p>
          </motion.div>
        ) : filteredGames.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gray-100 dark:bg-slate-800 mb-6">
              <Gamepad2 className="w-12 h-12 text-gray-400" />
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-xl font-medium mb-2">
              {searchQuery || difficultyFilter !== 'all' || topicFilter !== 'all'
                ? 'لا توجد ألعاب تطابق البحث' 
                : 'لا توجد ألعاب متاحة حالياً'}
            </p>
            {(searchQuery || difficultyFilter !== 'all' || topicFilter !== 'all') && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('');
                  setDifficultyFilter('all');
                  setTopicFilter('all');
                }}
                className="mt-4"
              >
                <X className="w-4 h-4 ml-2" />
                إعادة تعيين الفلاتر
              </Button>
            )}
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGames.map((game, index) => (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
              >
                <Card className="group h-full flex flex-col overflow-hidden border-2 border-gray-200 dark:border-slate-700 hover:border-[#0A5734] dark:hover:border-[#4A8F5C] shadow-lg hover:shadow-2xl transition-all duration-300 bg-white dark:bg-slate-800 rounded-2xl">
                  {/* Card Header with Gradient */}
                  <div className="relative h-32 bg-gradient-to-br from-[#0A5734] via-[#4A8F5C] to-[#0A5734] overflow-hidden">
                    {/* Decorative Pattern */}
                    <div className="absolute inset-0 opacity-20">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full blur-3xl" />
                      <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#C5A15A]/30 rounded-full blur-2xl" />
                    </div>
                    
                    {/* Difficulty Badge */}
                    <div className="absolute top-3 left-3 z-10">
                      <Badge 
                        variant={getDifficultyBadgeVariant(game.difficulty_level)}
                        className="shadow-lg backdrop-blur-sm"
                      >
                        {getDifficultyLabel(game.difficulty_level)}
                      </Badge>
                    </div>
                    
                    {/* Game Icon */}
                    <div className="absolute bottom-3 right-3">
                      <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                        <Gamepad2 className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </div>

                  <CardHeader className="pb-3">
                    <CardTitle className="text-xl font-bold line-clamp-2 text-gray-800 dark:text-slate-100 group-hover:text-[#0A5734] dark:group-hover:text-[#4A8F5C] transition-colors mb-3">
                      {game.title}
                    </CardTitle>
                    
                    {/* Teacher, Type, and Topic Info */}
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      {game.teacher_name && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800">
                          <User className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                          <span className="text-blue-700 dark:text-blue-300 font-medium">{game.teacher_name}</span>
                        </div>
                      )}
                      {game.h5p_library && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-purple-50 dark:bg-purple-900/30 rounded-lg border border-purple-200 dark:border-purple-800">
                          <Gamepad2 className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                          <span className="text-purple-700 dark:text-purple-300 font-medium">{getGameTypeLabel(game.h5p_library)}</span>
                        </div>
                      )}
                      {game.topic && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800">
                          <BookOpen className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                          <span className="text-blue-700 dark:text-blue-300 font-medium">{getTopicLabel(game.topic) || game.topic_display}</span>
                        </div>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="flex-1 flex flex-col">
                    <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3 min-h-[60px] flex-grow">
                      {game.description}
                    </p>
                    
                    {/* Stats */}
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4 pb-4 border-b border-gray-200 dark:border-slate-700">
                      <div className="flex items-center gap-1.5">
                        <Repeat className="w-4 h-4" />
                        <span className="font-medium">{game.play_count}</span>
                        <span>مرة لعب</span>
                      </div>
                      {game.average_score !== null && (
                        <div className="flex items-center gap-1.5">
                          <Trophy className="w-4 h-4 text-[#C5A15A]" />
                          <span className="font-medium">{game.average_score.toFixed(1)}</span>
                          <span>متوسط</span>
                        </div>
                      )}
                      {game.average_score !== null && game.average_score >= 4 && (
                        <div className="flex items-center gap-1 text-[#C5A15A]">
                          <Star className="w-4 h-4 fill-[#C5A15A]" />
                          <span className="font-medium">مميز</span>
                        </div>
                      )}
                    </div>

                    {/* Play Button */}
                    <Link href={`/interactive-learning/${game.id}`} className="mt-auto">
                      <Button className="w-full bg-gradient-to-r from-[#0A5734] to-[#4A8F5C] hover:from-[#073D24] hover:to-[#3A7148] text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl h-12 text-lg font-semibold group/btn">
                        <Play className="w-5 h-5 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                        ابدأ اللعب
                        <Sparkles className="w-4 h-4 mr-2 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
