'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Gamepad2, Save, ArrowLeft, Loader2, FileCode, Sparkles, Copy, Check, MousePointerClick, ListChecks, Move, Type, CheckSquare, Clock } from 'lucide-react';
import Link from 'next/link';
import { interactiveGamesApi, CreateInteractiveGameInput } from '@/lib/api/interactive-games';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { motion } from 'framer-motion';
import FillInTheBlanksEditor from '@/components/games/FillInTheBlanksEditor';
import DragQuestionEditor from '@/components/games/DragQuestionEditor';

export default function CreateInteractiveGamePage() {
  return (
    <ProtectedRoute allowedRoles={['teacher']}>
      <CreateInteractiveGameContent />
    </ProtectedRoute>
  );
}

// Game type definitions with icons and descriptions
const gameTypes = [
  {
    id: 'H5P.MultiChoice',
    name: 'اختيار من متعدد',
    description: 'سؤال مع عدة خيارات، اختر الإجابة الصحيحة',
    icon: MousePointerClick,
    color: 'bg-blue-500 hover:bg-blue-600',
    iconColor: 'text-blue-500'
  },
  {
    id: 'H5P.QuestionSet',
    name: 'مجموعة أسئلة',
    description: 'عدة أسئلة متتالية في اختبار واحد',
    icon: ListChecks,
    color: 'bg-blue-500 hover:bg-blue-600',
    iconColor: 'text-blue-500'
  },
  {
    id: 'H5P.DragQuestion',
    name: 'سحب وإفلات',
    description: 'اسحب العناصر إلى المكان الصحيح',
    icon: Move,
    color: 'bg-purple-500 hover:bg-purple-600',
    iconColor: 'text-purple-500'
  },
  {
    id: 'H5P.TrueFalse',
    name: 'صواب/خطأ',
    description: 'سؤال بسيط: صواب أم خطأ؟',
    icon: CheckSquare,
    color: 'bg-orange-500 hover:bg-orange-600',
    iconColor: 'text-orange-500'
  },
  {
    id: 'H5P.FillInTheBlanks',
    name: 'ملء الفراغات',
    description: 'املأ الفراغات في النص',
    icon: Type,
    color: 'bg-pink-500 hover:bg-pink-600',
    iconColor: 'text-pink-500'
  },
];

function CreateInteractiveGameContent() {
  const router = useRouter();
  const [selectedGameType, setSelectedGameType] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateInteractiveGameInput>({
    title: '',
    description: '',
    h5p_library: 'H5P.QuestionSet',
    difficulty_level: 'beginner',
    topic: null,
    has_timer: false,
    time_limit: null,
    question_time_limit: null, // Time limit per question in seconds
    h5p_content: {
      library: 'H5P.QuestionSet',
      params: {
        questions: []
      }
    }
  });

  // Simple form data for each game type
  const [simpleFormData, setSimpleFormData] = useState<any>({
    // For MultiChoice
    questions: [{
      question: '',
      answers: [{ text: '', correct: false }]
    }],
    // For QuestionSet
    intro: '',
    outro: '',
    questionSetQuestions: [{
      questionType: 'H5P.MultiChoice', // Default to MultiChoice
      question: '',
      answers: [{ text: '', correct: false }],
      correct: true // For TrueFalse
    }],
    // For TrueFalse - Array of questions
    trueFalseQuestions: [{
      question: '',
      correct: true
    }],
    // For FillInTheBlanks - Array of texts
    fillBlanksItems: [{ text: '' }],
    // For DragQuestion - Simple format
    dragQuestionData: null
  });

  // أمثلة JSON جاهزة لكل نوع
  const h5pExamples: Record<string, any> = {
    'H5P.QuestionSet': {
      library: 'H5P.QuestionSet',
      params: {
        intro: 'مرحباً بك في الاختبار',
        outro: 'شكراً لك على إكمال الاختبار',
        questions: [
          {
            library: 'H5P.MultiChoice',
            params: {
              question: 'ما هي عاصمة المملكة العربية السعودية؟',
              answers: [
                { text: 'الرياض', correct: true },
                { text: 'جدة', correct: false },
                { text: 'الدمام', correct: false }
              ]
            }
          }
        ]
      }
    },
    'H5P.MultiChoice': {
      library: 'H5P.MultiChoice',
      params: {
        question: 'السؤال هنا',
        answers: [
          { text: 'الإجابة الأولى', correct: true },
          { text: 'الإجابة الثانية', correct: false },
          { text: 'الإجابة الثالثة', correct: false }
        ]
      }
    },
    'H5P.TrueFalse': {
      library: 'H5P.TrueFalse',
      params: {
        question: 'السؤال هنا',
        correct: true
      }
    },
    'H5P.FillInTheBlanks': {
      library: 'H5P.FillInTheBlanks',
      params: {
        text: 'النص مع *فراغ* هنا',
        overallFeedback: []
      }
    },
    'H5P.DragQuestion': {
      library: 'H5P.DragQuestion',
      params: {
        question: 'السؤال هنا',
        dropZones: [],
        overallFeedback: []
      }
    }
  };

  const generateDefaultContent = () => {
    const example = h5pExamples[formData.h5p_library] || {
      library: formData.h5p_library,
      params: {}
    };
    setH5pContentJson(JSON.stringify(example, null, 2));
    setJsonError(null);
  };

  const formatJSON = () => {
    if (!h5pContentJson.trim()) {
      toast.error('لا يوجد محتوى لتنسيقه');
      return;
    }
    try {
      const parsed = JSON.parse(h5pContentJson);
      setH5pContentJson(JSON.stringify(parsed, null, 2));
      setJsonError(null);
      toast.success('تم تنسيق JSON بنجاح');
    } catch (error) {
      setJsonError('خطأ في صيغة JSON');
      toast.error('خطأ في صيغة JSON');
    }
  };

  const validateJSON = (jsonString: string): boolean => {
    if (!jsonString.trim()) return true; // Empty is valid (will use default)
    try {
      JSON.parse(jsonString);
      setJsonError(null);
      return true;
    } catch (error) {
      setJsonError('صيغة JSON غير صحيحة');
      return false;
    }
  };

  const copyExample = (exampleKey: string) => {
    const example = h5pExamples[exampleKey];
    if (example) {
      const jsonString = JSON.stringify(example, null, 2);
      navigator.clipboard.writeText(jsonString);
      setCopied(true);
      toast.success('تم نسخ المثال');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.topic) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    // Build H5P content from simple form based on game type
    let h5pContent: any;
    
    if (selectedGameType === 'H5P.MultiChoice') {
      const validQuestions = simpleFormData.questions?.filter((q: any) => 
        q.question && q.question.trim() !== '' && q.answers && q.answers.length > 0
      ) || [];
      
      if (validQuestions.length === 0) {
        toast.error('يرجى إدخال سؤال واحد على الأقل مع إجابات');
        return;
      }

      // If multiple questions, create a QuestionSet with MultiChoice questions
      if (validQuestions.length > 1) {
        const h5pQuestions = validQuestions.map((q: any) => {
          const validAnswers = q.answers.filter((a: any) => a.text.trim() !== '');
          return {
            library: 'H5P.MultiChoice',
            params: {
              question: q.question,
              answers: validAnswers
            }
          };
        });
        
        h5pContent = {
          library: 'H5P.QuestionSet',
          params: {
            intro: 'مرحباً بك في الاختبار',
            outro: 'شكراً لك على إكمال الاختبار',
            questions: h5pQuestions
          }
        };
      } else {
        // Single question - use MultiChoice directly
        const firstQuestion = validQuestions[0];
        const validAnswers = firstQuestion.answers.filter((a: any) => a.text.trim() !== '');
        if (validAnswers.length === 0) {
          toast.error('يرجى إدخال إجابة واحدة على الأقل');
          return;
        }
        h5pContent = {
          library: 'H5P.MultiChoice',
          params: {
            question: firstQuestion.question,
            answers: validAnswers
          }
        };
      }
    } else if (selectedGameType === 'H5P.TrueFalse') {
      const validQuestions = simpleFormData.trueFalseQuestions?.filter((q: any) => q.question && q.question.trim() !== '') || [];
      if (validQuestions.length === 0) {
        toast.error('يرجى إدخال سؤال واحد على الأقل');
        return;
      }
      // If multiple questions, create a QuestionSet with TrueFalse questions
      if (validQuestions.length > 1) {
        h5pContent = {
          library: 'H5P.QuestionSet',
          params: {
            intro: 'مرحباً بك في الاختبار',
            outro: 'شكراً لك على إكمال الاختبار',
            questions: validQuestions.map((q: any) => ({
              library: 'H5P.TrueFalse',
              params: {
                question: q.question,
                correct: q.correct
              }
            }))
          }
        };
      } else {
        // Single question
        h5pContent = {
          library: 'H5P.TrueFalse',
          params: {
            question: validQuestions[0].question,
            correct: validQuestions[0].correct
          }
        };
      }
    } else if (selectedGameType === 'H5P.QuestionSet') {
      if (!simpleFormData.questionSetQuestions || simpleFormData.questionSetQuestions.length === 0) {
        toast.error('يرجى إضافة سؤال واحد على الأقل');
        return;
      }
      
      // Convert questions to H5P format based on question type
      const h5pQuestions = simpleFormData.questionSetQuestions
        .filter((q: any) => {
          if (q.questionType === 'H5P.TrueFalse') {
            return q.question && q.question.trim() !== '';
          } else {
            return q.question && q.answers && q.answers.length > 0;
          }
        })
        .map((q: any) => {
          if (q.questionType === 'H5P.TrueFalse') {
            return {
              library: 'H5P.TrueFalse',
              params: {
                question: q.question,
                correct: q.correct !== undefined ? q.correct : true
              }
            };
          } else {
            // Default to MultiChoice
            return {
              library: 'H5P.MultiChoice',
              params: {
                question: q.question,
                answers: q.answers.filter((a: any) => a.text.trim() !== '')
              }
            };
          }
        });
      
      if (h5pQuestions.length === 0) {
        toast.error('يرجى إدخال سؤال واحد صحيح على الأقل');
        return;
      }
      
      h5pContent = {
        library: 'H5P.QuestionSet',
        params: {
          intro: simpleFormData.intro || 'مرحباً بك في الاختبار',
          outro: simpleFormData.outro || 'شكراً لك على إكمال الاختبار',
          questions: h5pQuestions
        }
      };
    } else if (selectedGameType === 'H5P.FillInTheBlanks') {
      const validItems = simpleFormData.fillBlanksItems?.filter((item: any) => item.text && item.text.trim() !== '') || [];
      if (validItems.length === 0) {
        toast.error('يرجى إدخال نص واحد على الأقل');
        return;
      }
      // For now, we'll use the first item or combine them
      // In a real scenario, you might want to create multiple H5P.FillInTheBlanks instances
      const combinedText = validItems.map((item: any) => item.text).join('\n\n');
      h5pContent = {
        library: 'H5P.FillInTheBlanks',
        params: {
          text: combinedText,
          overallFeedback: []
        }
      };
    } else if (selectedGameType === 'H5P.DragQuestion') {
      // Get data from DragQuestionEditor
      if (!simpleFormData.dragQuestionData) {
        toast.error('يرجى إدخال بيانات اللعبة');
        return;
      }
      
      const data = simpleFormData.dragQuestionData;
      
      if (!data.question || data.question.trim() === '') {
        toast.error('يرجى إدخال السؤال');
        return;
      }
      
      const validItems = (data.items || []).filter((item: any) => item.text && item.text.trim() !== '');
      if (validItems.length === 0) {
        toast.error('يرجى إدخال عنصر واحد قابل للسحب على الأقل');
        return;
      }
      
      const validZones = (data.dropZones || []).filter((zone: any) => zone.label && zone.label.trim() !== '');
      if (validZones.length === 0) {
        toast.error('يرجى إدخال منطقة إفلات واحدة على الأقل');
        return;
      }
      
      // Convert to H5P.DragQuestion format
      h5pContent = {
        library: 'H5P.DragQuestion',
        params: {
          question: data.question,
          dropZones: validZones.map((zone: any) => ({
            id: zone.id,
            label: zone.label,
            x: zone.x,
            y: zone.y,
            width: zone.width,
            height: zone.height
          })),
          items: validItems.map((item: any) => ({
            id: item.id,
            text: item.text,
            dropZone: item.dropZoneId || null
          })),
          overallFeedback: []
        }
      };
    } else {
      // Use default structure for other types
      h5pContent = h5pExamples[formData.h5p_library] || {
        library: formData.h5p_library,
        params: {}
      };
    }

    setLoading(true);
    try {
      await interactiveGamesApi.create({
        ...formData,
        h5p_content: h5pContent
      });

      toast.success('تم إنشاء اللعبة التفاعلية بنجاح! في انتظار موافقة المشرف');
      router.push('/dashboard/teacher');
    } catch (error: any) {
      console.error('Error creating game:', error);
      toast.error(error.message || 'حدث خطأ في إنشاء اللعبة');
    } finally {
      setLoading(false);
    }
  };

  // If no game type selected, show game type selection
  if (!selectedGameType) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 pt-24 pb-8 px-4" dir="rtl">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Link href="/dashboard/teacher">
              <Button variant="ghost" className="mb-6 hover:bg-white/50 dark:hover:bg-slate-800/50">
                <ArrowLeft className="w-5 h-5 ml-2" />
                <span className="text-lg">العودة للوحة التحكم</span>
              </Button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Card className="shadow-2xl border-0 overflow-hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-primary via-primary-light to-accent p-8 pb-6">
                <CardTitle className="flex items-center gap-3 text-4xl md:text-5xl font-black text-white drop-shadow-lg">
                  <Gamepad2 className="w-8 h-8 md:w-10 md:h-10" />
                  اختر نوع اللعبة التفاعلية
                </CardTitle>
                <CardDescription className="text-lg text-white/90 mt-3">
                  اختر نوع اللعبة التي تريد إنشاءها، ثم ابدأ في تصميمها
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8 md:p-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {gameTypes.map((gameType, idx) => {
                    const Icon = gameType.icon;
                    return (
                      <motion.button
                        key={gameType.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.1 }}
                        whileHover={{ scale: 1.05, y: -5 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setSelectedGameType(gameType.id);
                          setFormData({
                            ...formData,
                            h5p_library: gameType.id as any
                          });
                          // Reset form when changing game type
                          setSimpleFormData({
                            questions: [{
                              question: '',
                              answers: [{ text: '', correct: false }]
                            }],
                            intro: '',
                            outro: '',
                            questionSetQuestions: [{
                              question: '',
                              answers: [{ text: '', correct: false }]
                            }],
                          trueFalseQuestions: [{
                            question: '',
                            correct: true
                          }],
                          fillBlanksItems: [{ text: '' }]
                        });
                        }}
                        className="group relative p-6 md:p-8 bg-white dark:bg-slate-800 rounded-2xl hover:shadow-2xl transition-all duration-300 text-right shadow-lg"
                      >
                        <div className="flex flex-col items-center gap-4">
                          <div className={`p-4 md:p-5 rounded-2xl ${gameType.color} shadow-lg group-hover:scale-110 transition-transform`}>
                            <Icon className="w-8 h-8 md:w-10 md:h-10 text-white fill-white stroke-white dark:text-white dark:fill-white dark:stroke-white" strokeWidth={2.5} />
                          </div>
                          <div className="text-center">
                            <h3 className="font-bold text-lg md:text-xl text-gray-900 dark:text-white mb-2">
                              {gameType.name}
                            </h3>
                            <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                              {gameType.description}
                            </p>
                          </div>
                          <motion.div
                            initial={{ opacity: 0 }}
                            whileHover={{ opacity: 1 }}
                            className="absolute top-3 left-3"
                          >
                            <div className="gradient-primary text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
                              اضغط للبدء
                            </div>
                          </motion.div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 pt-24 pb-8 px-4" dir="rtl">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center justify-between mb-6"
        >
          <Link href="/dashboard/teacher">
            <Button variant="ghost" className="hover:bg-white/50 dark:hover:bg-slate-800/50">
              <ArrowLeft className="w-5 h-5 ml-2" />
              <span className="text-lg">العودة للوحة التحكم</span>
            </Button>
          </Link>
          <Button
            variant="outline"
            onClick={() => setSelectedGameType(null)}
            className="border-2 hover:border-primary hover:bg-primary/10"
          >
            تغيير نوع اللعبة
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card className="shadow-2xl border-0 overflow-hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-primary via-primary-light to-accent p-8 pb-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-3 text-3xl md:text-4xl font-black text-white drop-shadow-lg">
                    {(() => {
                      const selectedType = gameTypes.find(gt => gt.id === selectedGameType);
                      const Icon = selectedType?.icon || Gamepad2;
                      return (
                        <>
                          <Icon className="w-8 h-8 md:w-10 md:h-10" />
                          إنشاء {selectedType?.name || 'لعبة تفاعلية'}
                        </>
                      );
                    })()}
                  </CardTitle>
                  <CardDescription className="mt-3 text-lg text-white/90">
                    أنشئ لعبة تفاعلية باستخدام H5P. بعد الإنشاء، سيتم مراجعة اللعبة من قبل المشرف قبل الموافقة عليها.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8 md:p-12">
              <form onSubmit={handleSubmit} className="space-y-8">
                <div>
                  <Label htmlFor="title" className="text-lg font-bold text-gray-900 dark:text-white mb-2 block">
                    عنوان اللعبة *
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="مثال: اختبار في قواعد اللغة العربية"
                    required
                    className="h-12 text-lg border-2 border-gray-300 dark:border-slate-600 focus:border-primary rounded-xl"
                  />
                </div>

                <div>
                  <Label htmlFor="description" className="text-lg font-bold text-gray-900 dark:text-white mb-2 block">
                    الوصف *
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="وصف تفصيلي للعبة..."
                    rows={4}
                    required
                    className="text-lg border-2 border-gray-300 dark:border-slate-600 focus:border-primary rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="topic" className="text-lg font-bold text-gray-900 dark:text-white mb-2 block">
                      الموضوع <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.topic || ''}
                      onValueChange={(value: string) => 
                        setFormData({ ...formData, topic: value || null })
                      }
                      required
                    >
                      <SelectTrigger className="h-12 text-lg border-2 border-gray-300 dark:border-slate-600 focus:border-primary rounded-xl bg-white dark:bg-slate-900">
                        <SelectValue placeholder="اختر الموضوع" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[180px] z-50">
                        <SelectItem value="science" className="text-sm py-1.5">العلوم</SelectItem>
                        <SelectItem value="mathematics" className="text-sm py-1.5">الرياضيات</SelectItem>
                        <SelectItem value="languages" className="text-sm py-1.5">اللغات</SelectItem>
                        <SelectItem value="social_studies" className="text-sm py-1.5">الدراسات الاجتماعية</SelectItem>
                        <SelectItem value="religious_studies" className="text-sm py-1.5">الدراسات الدينية</SelectItem>
                        <SelectItem value="computer_programming" className="text-sm py-1.5">الحاسب والبرمجة</SelectItem>
                        <SelectItem value="skills" className="text-sm py-1.5">المهارات</SelectItem>
                        <SelectItem value="art_design" className="text-sm py-1.5">الفن والتصميم</SelectItem>
                        <SelectItem value="personal_development" className="text-sm py-1.5">تطوير الذات</SelectItem>
                        <SelectItem value="academic_level" className="text-sm py-1.5">المرحلة الدراسية</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="difficulty_level" className="text-lg font-bold text-gray-900 dark:text-white mb-2 block">
                      مستوى الصعوبة
                    </Label>
                    <Select
                      value={formData.difficulty_level}
                      onValueChange={(value: 'beginner' | 'intermediate' | 'advanced') => 
                        setFormData({ ...formData, difficulty_level: value })
                      }
                    >
                      <SelectTrigger className="h-12 text-lg border-2 border-gray-300 dark:border-slate-600 focus:border-primary rounded-xl bg-white dark:bg-slate-900">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="max-h-[120px] z-50">
                        <SelectItem value="beginner" className="text-sm py-1.5">مبتدئ</SelectItem>
                        <SelectItem value="intermediate" className="text-sm py-1.5">متوسط</SelectItem>
                        <SelectItem value="advanced" className="text-sm py-1.5">متقدم</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Timer Settings */}
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-4 border-amber-200 dark:border-amber-800 rounded-2xl p-6 md:p-8 space-y-4 shadow-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <Clock className="w-6 h-6 text-amber-600" />
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">إعدادات المؤقت</h3>
                  </div>
                  
                  <div className="flex items-center gap-3 p-4 bg-white dark:bg-slate-800 rounded-xl border-2 border-amber-200 dark:border-amber-700">
                    <input
                      type="checkbox"
                      id="has_timer"
                      checked={formData.has_timer || false}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          has_timer: e.target.checked,
                          time_limit: e.target.checked ? (formData.time_limit || 300) : null
                        });
                      }}
                      className="w-5 h-5 text-amber-600 border-2 border-gray-300 rounded focus:ring-2 focus:ring-amber-500"
                    />
                    <Label htmlFor="has_timer" className="text-base font-semibold text-gray-900 dark:text-white cursor-pointer flex-1">
                      تفعيل المؤقت للعبة
                    </Label>
                  </div>

                  {formData.has_timer && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4"
                    >
                      <div>
                        <Label htmlFor="time_limit" className="text-base font-semibold text-gray-900 dark:text-white mb-2 block">
                          المدة الزمنية (بالثواني) *
                        </Label>
                        <Input
                          id="time_limit"
                          type="number"
                          min="10"
                          step="10"
                          value={formData.time_limit || ''}
                          onChange={(e) => {
                            const value = parseInt(e.target.value) || null;
                            setFormData({
                              ...formData,
                              time_limit: value && value >= 10 ? value : null
                            });
                          }}
                          placeholder="مثال: 300 (5 دقائق)"
                          className="h-12 text-lg border-2 border-amber-300 dark:border-amber-700 focus:border-amber-500 rounded-xl"
                        />
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                          {formData.time_limit ? (
                            <span className="font-semibold text-amber-600">
                              {Math.floor(formData.time_limit / 60)} دقيقة و {formData.time_limit % 60} ثانية
                            </span>
                          ) : (
                            'سيظهر المؤقت عندما يتبقى 30 ثانية'
                          )}
                        </p>
                      </div>
                    </motion.div>
                  )}
                  
                  {/* Question Time Limit */}
                  <div className="mt-4">
                    <Label htmlFor="question_time_limit" className="text-base font-semibold text-gray-900 dark:text-white mb-2 block">
                      وقت كل سؤال (بالثواني) - اختياري
                    </Label>
                    <Input
                      id="question_time_limit"
                      type="number"
                      min="3"
                      step="1"
                      value={formData.question_time_limit || ''}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || null;
                        setFormData({
                          ...formData,
                          question_time_limit: value && value >= 3 ? value : null
                        });
                      }}
                      placeholder="مثال: 5 (5 ثواني لكل سؤال)"
                      className="h-12 text-lg border-2 border-amber-300 dark:border-amber-700 focus:border-amber-500 rounded-xl"
                    />
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      {formData.question_time_limit ? (
                        <span className="font-semibold text-amber-600">
                          كل سؤال لديه {formData.question_time_limit} ثانية للإجابة
                        </span>
                      ) : (
                        'إذا لم يتم تحديد وقت، لن يكون هناك حد زمني لكل سؤال'
                      )}
                    </p>
                  </div>
                </div>

              {/* Simple Form Based on Game Type */}
              {selectedGameType === 'H5P.MultiChoice' && (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-4 border-blue-200 dark:border-blue-800 rounded-2xl p-6 md:p-8 space-y-6 shadow-lg">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-lg">📝 تصميم السؤال</h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSimpleFormData({
                          ...simpleFormData,
                          questions: [...simpleFormData.questions, {
                            question: '',
                            answers: [{ text: '', correct: false }]
                          }]
                        });
                      }}
                    >
                      + إضافة سؤال آخر
                    </Button>
                  </div>
                  
                  {simpleFormData.questions.map((q: any, qIdx: number) => (
                    <div key={qIdx} className="bg-white rounded-lg p-4 border border-blue-200 space-y-4">
                      {simpleFormData.questions.length > 1 && (
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-blue-600">السؤال {qIdx + 1}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const newQuestions = simpleFormData.questions.filter((_: any, i: number) => i !== qIdx);
                              setSimpleFormData({ ...simpleFormData, questions: newQuestions });
                            }}
                            className="text-red-600 hover:text-red-700"
                          >
                            حذف السؤال
                          </Button>
                        </div>
                      )}
                      
                      <div>
                        <Label>السؤال *</Label>
                        <Textarea
                          value={q.question}
                          onChange={(e) => {
                            const newQuestions = [...simpleFormData.questions];
                            newQuestions[qIdx].question = e.target.value;
                            setSimpleFormData({ ...simpleFormData, questions: newQuestions });
                          }}
                          placeholder="اكتب السؤال هنا..."
                          rows={3}
                          className="mt-2"
                        />
                      </div>
                      
                      <div>
                        <Label>الإجابات *</Label>
                        <div className="space-y-2 mt-2">
                          {q.answers.map((answer: any, aIdx: number) => (
                            <div key={aIdx} className="flex gap-2 items-center">
                              <Input
                                value={answer.text}
                                onChange={(e) => {
                                  const newQuestions = [...simpleFormData.questions];
                                  newQuestions[qIdx].answers[aIdx].text = e.target.value;
                                  setSimpleFormData({ ...simpleFormData, questions: newQuestions });
                                }}
                                placeholder={`الإجابة ${aIdx + 1}`}
                                className="flex-1"
                              />
                              <Button
                                type="button"
                                variant={answer.correct ? "default" : "outline"}
                                onClick={() => {
                                  const newQuestions = [...simpleFormData.questions];
                                  newQuestions[qIdx].answers[aIdx].correct = !newQuestions[qIdx].answers[aIdx].correct;
                                  setSimpleFormData({ ...simpleFormData, questions: newQuestions });
                                }}
                                className={answer.correct ? "bg-blue-600 hover:bg-blue-700" : ""}
                              >
                                {answer.correct ? '✓ صحيح' : 'خاطئ'}
                              </Button>
                              {q.answers.length > 1 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    const newQuestions = [...simpleFormData.questions];
                                    newQuestions[qIdx].answers = newQuestions[qIdx].answers.filter((_: any, i: number) => i !== aIdx);
                                    setSimpleFormData({ ...simpleFormData, questions: newQuestions });
                                  }}
                                >
                                  ✕
                                </Button>
                              )}
                            </div>
                          ))}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newQuestions = [...simpleFormData.questions];
                              newQuestions[qIdx].answers.push({ text: '', correct: false });
                              setSimpleFormData({ ...simpleFormData, questions: newQuestions });
                            }}
                          >
                            + إضافة إجابة
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {selectedGameType === 'H5P.QuestionSet' && (
                <div className="bg-gradient-to-br from-blue-50 to-blue-50 dark:from-blue-950/30 dark:to-blue-950/30 border-4 border-blue-200 dark:border-blue-800 rounded-2xl p-6 md:p-8 space-y-6 shadow-lg">
                  <h3 className="font-bold text-lg">📝 تصميم مجموعة الأسئلة</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="intro">مقدمة الاختبار (اختياري)</Label>
                      <Input
                        id="intro"
                        value={simpleFormData.intro}
                        onChange={(e) => setSimpleFormData({ ...simpleFormData, intro: e.target.value })}
                        placeholder="مرحباً بك في الاختبار..."
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="outro">خاتمة الاختبار (اختياري)</Label>
                      <Input
                        id="outro"
                        value={simpleFormData.outro}
                        onChange={(e) => setSimpleFormData({ ...simpleFormData, outro: e.target.value })}
                        placeholder="شكراً لك على إكمال الاختبار"
                        className="mt-2"
                      />
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold">الأسئلة</h4>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSimpleFormData({
                            ...simpleFormData,
                            questionSetQuestions: [...simpleFormData.questionSetQuestions, {
                              questionType: 'H5P.MultiChoice',
                              question: '',
                              answers: [{ text: '', correct: false }],
                              correct: true
                            }]
                          });
                        }}
                      >
                        + إضافة سؤال
                      </Button>
                    </div>

                    <div className="space-y-4">
                      {simpleFormData.questionSetQuestions.map((q: any, qIdx: number) => (
                        <div key={qIdx} className="bg-white rounded-lg p-4 border border-blue-200 space-y-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold text-blue-600">السؤال {qIdx + 1}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const newQuestions = simpleFormData.questionSetQuestions.filter((_: any, i: number) => i !== qIdx);
                                setSimpleFormData({ ...simpleFormData, questionSetQuestions: newQuestions });
                              }}
                              className="text-red-600 hover:text-red-700"
                            >
                              حذف السؤال
                            </Button>
                          </div>
                          
                          {/* Question Type Selector */}
                          <div>
                            <Label>نوع السؤال *</Label>
                            <Select
                              value={q.questionType || 'H5P.MultiChoice'}
                              onValueChange={(value) => {
                                const newQuestions = [...simpleFormData.questionSetQuestions];
                                newQuestions[qIdx].questionType = value;
                                // Reset answers when changing type
                                if (value === 'H5P.TrueFalse') {
                                  newQuestions[qIdx].answers = [];
                                  newQuestions[qIdx].correct = true;
                                } else {
                                  newQuestions[qIdx].answers = [{ text: '', correct: false }];
                                }
                                setSimpleFormData({ ...simpleFormData, questionSetQuestions: newQuestions });
                              }}
                            >
                              <SelectTrigger className="mt-2">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="H5P.MultiChoice">اختيار من متعدد</SelectItem>
                                <SelectItem value="H5P.TrueFalse">صحيح/خطأ</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div>
                            <Label>السؤال *</Label>
                            <Textarea
                              value={q.question}
                              onChange={(e) => {
                                const newQuestions = [...simpleFormData.questionSetQuestions];
                                newQuestions[qIdx].question = e.target.value;
                                setSimpleFormData({ ...simpleFormData, questionSetQuestions: newQuestions });
                              }}
                              placeholder="اكتب السؤال هنا..."
                              rows={2}
                              className="mt-2"
                            />
                          </div>
                          
                          {/* Show answers only for MultiChoice */}
                          {q.questionType === 'H5P.MultiChoice' && (
                          <div>
                            <Label>الإجابات *</Label>
                            <div className="space-y-2 mt-2">
                              {q.answers.map((answer: any, aIdx: number) => (
                                <div key={aIdx} className="flex gap-2 items-center">
                                  <Input
                                    value={answer.text}
                                    onChange={(e) => {
                                      const newQuestions = [...simpleFormData.questionSetQuestions];
                                      newQuestions[qIdx].answers[aIdx].text = e.target.value;
                                      setSimpleFormData({ ...simpleFormData, questionSetQuestions: newQuestions });
                                    }}
                                    placeholder={`الإجابة ${aIdx + 1}`}
                                    className="flex-1"
                                  />
                                  <Button
                                    type="button"
                                    variant={answer.correct ? "default" : "outline"}
                                    onClick={() => {
                                      const newQuestions = [...simpleFormData.questionSetQuestions];
                                      newQuestions[qIdx].answers[aIdx].correct = !newQuestions[qIdx].answers[aIdx].correct;
                                      setSimpleFormData({ ...simpleFormData, questionSetQuestions: newQuestions });
                                    }}
                                    className={answer.correct ? "bg-blue-600 hover:bg-blue-700" : ""}
                                  >
                                    {answer.correct ? '✓ صحيح' : 'خاطئ'}
                                  </Button>
                                  {q.answers.length > 1 && (
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        const newQuestions = [...simpleFormData.questionSetQuestions];
                                        newQuestions[qIdx].answers = newQuestions[qIdx].answers.filter((_: any, i: number) => i !== aIdx);
                                        setSimpleFormData({ ...simpleFormData, questionSetQuestions: newQuestions });
                                      }}
                                    >
                                      ✕
                                    </Button>
                                  )}
                                </div>
                              ))}
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const newQuestions = [...simpleFormData.questionSetQuestions];
                                  newQuestions[qIdx].answers.push({ text: '', correct: false });
                                  setSimpleFormData({ ...simpleFormData, questionSetQuestions: newQuestions });
                                }}
                              >
                                + إضافة إجابة
                              </Button>
                            </div>
                          </div>
                          )}
                          
                          {/* Show TrueFalse options */}
                          {q.questionType === 'H5P.TrueFalse' && (
                          <div>
                            <Label>الإجابة الصحيحة *</Label>
                            <div className="flex gap-4 mt-2">
                              <Button
                                type="button"
                                variant={q.correct === true ? "default" : "outline"}
                                onClick={() => {
                                  const newQuestions = [...simpleFormData.questionSetQuestions];
                                  newQuestions[qIdx].correct = true;
                                  setSimpleFormData({ ...simpleFormData, questionSetQuestions: newQuestions });
                                }}
                                className={q.correct === true ? "bg-blue-600 hover:bg-blue-700" : ""}
                              >
                                ✓ صحيح
                              </Button>
                              <Button
                                type="button"
                                variant={q.correct === false ? "default" : "outline"}
                                onClick={() => {
                                  const newQuestions = [...simpleFormData.questionSetQuestions];
                                  newQuestions[qIdx].correct = false;
                                  setSimpleFormData({ ...simpleFormData, questionSetQuestions: newQuestions });
                                }}
                                className={q.correct === false ? "bg-red-600 hover:bg-red-700" : ""}
                              >
                                ✗ خطأ
                              </Button>
                            </div>
                          </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {selectedGameType === 'H5P.TrueFalse' && (
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 border-4 border-orange-200 dark:border-orange-800 rounded-2xl p-6 md:p-8 space-y-6 shadow-lg">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-xl text-gray-900 dark:text-white">📝 إنشاء أسئلة صواب/خطأ</h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSimpleFormData({
                          ...simpleFormData,
                          trueFalseQuestions: [...(simpleFormData.trueFalseQuestions || [{ question: '', correct: true }]), { question: '', correct: true }]
                        });
                      }}
                      className="border-2 border-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900/30"
                    >
                      + إضافة سؤال جديد
                    </Button>
                  </div>

                  <div className="bg-white/60 dark:bg-slate-800/60 p-5 rounded-xl border-2 border-orange-300 dark:border-orange-700">
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">💡</div>
                      <div className="flex-1">
                        <p className="text-base font-bold text-orange-900 dark:text-orange-300 mb-2">كيف تستخدم:</p>
                        <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 dark:text-gray-300">
                          <li>اكتب السؤال</li>
                          <li>اختر الإجابة الصحيحة (صواب أو خطأ)</li>
                          <li>يمكنك إضافة عدة أسئلة بالنقر على "إضافة سؤال جديد"</li>
                        </ol>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {(simpleFormData.trueFalseQuestions || [{ question: '', correct: true }]).map((q: any, idx: number) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-white dark:bg-slate-800 rounded-xl p-6 border-2 border-orange-200 dark:border-orange-700 shadow-md hover:shadow-lg transition-shadow"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-sm">
                              {idx + 1}
                            </div>
                            <Label className="text-lg font-bold text-gray-900 dark:text-white">
                              السؤال {idx + 1} *
                            </Label>
                          </div>
                          {(simpleFormData.trueFalseQuestions || []).length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const newQuestions = (simpleFormData.trueFalseQuestions || []).filter((_: any, i: number) => i !== idx);
                                setSimpleFormData({ ...simpleFormData, trueFalseQuestions: newQuestions.length > 0 ? newQuestions : [{ question: '', correct: true }] });
                              }}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 px-3"
                            >
                              ✕ حذف
                            </Button>
                          )}
                        </div>
                        
                        <div className="mb-4">
                          <Textarea
                            value={q.question}
                            onChange={(e) => {
                              const newQuestions = [...(simpleFormData.trueFalseQuestions || [])];
                              newQuestions[idx].question = e.target.value;
                              setSimpleFormData({ ...simpleFormData, trueFalseQuestions: newQuestions });
                            }}
                            placeholder={`اكتب السؤال هنا...`}
                            rows={3}
                            className="text-lg border-2 border-gray-300 dark:border-slate-600 focus:border-orange-500 rounded-xl resize-none"
                          />
                        </div>
                        
                        <div>
                          <Label className="text-base font-bold text-gray-900 dark:text-white mb-2 block">الإجابة الصحيحة *</Label>
                          <div className="flex gap-3">
                            <Button
                              type="button"
                              variant={q.correct === true ? "primary" : "outline"}
                              onClick={() => {
                                const newQuestions = [...(simpleFormData.trueFalseQuestions || [])];
                                newQuestions[idx].correct = true;
                                setSimpleFormData({ ...simpleFormData, trueFalseQuestions: newQuestions });
                              }}
                              className={`flex-1 py-3 text-lg font-bold rounded-xl transition-all ${
                                q.correct === true 
                                  ? "bg-blue-600 hover:bg-blue-700 text-white border-2 border-blue-700 shadow-lg" 
                                  : "border-2 border-gray-300 dark:border-slate-600"
                              }`}
                            >
                              ✓ صواب
                            </Button>
                            <Button
                              type="button"
                              variant={q.correct === false ? "primary" : "outline"}
                              onClick={() => {
                                const newQuestions = [...(simpleFormData.trueFalseQuestions || [])];
                                newQuestions[idx].correct = false;
                                setSimpleFormData({ ...simpleFormData, trueFalseQuestions: newQuestions });
                              }}
                              className={`flex-1 py-3 text-lg font-bold rounded-xl transition-all ${
                                q.correct === false 
                                  ? "bg-red-600 hover:bg-red-700 text-white border-2 border-red-700 shadow-lg" 
                                  : "border-2 border-gray-300 dark:border-slate-600"
                              }`}
                            >
                              ✗ خطأ
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {selectedGameType === 'H5P.FillInTheBlanks' && (
                <div className="bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-950/30 dark:to-rose-950/30 rounded-2xl p-6 md:p-8 space-y-6 shadow-lg">
                  <h3 className="font-bold text-xl text-gray-900 dark:text-white">📝 إنشاء ملء الفراغات</h3>
                  
                  <div className="space-y-4">
                    {(simpleFormData.fillBlanksItems || [{ text: '' }]).map((item: any, idx: number) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-md"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-pink-500 text-white flex items-center justify-center font-bold text-sm">
                              {idx + 1}
                            </div>
                            <Label className="text-lg font-bold text-gray-900 dark:text-white">
                              النص {idx + 1} *
                            </Label>
                          </div>
                          {(simpleFormData.fillBlanksItems || []).length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const newItems = (simpleFormData.fillBlanksItems || []).filter((_: any, i: number) => i !== idx);
                                setSimpleFormData({ ...simpleFormData, fillBlanksItems: newItems.length > 0 ? newItems : [{ text: '' }] });
                              }}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 px-3"
                            >
                              ✕ حذف
                            </Button>
                          )}
                        </div>
                        <FillInTheBlanksEditor
                          value={item.text}
                          onChange={(value) => {
                            const newItems = [...(simpleFormData.fillBlanksItems || [])];
                            newItems[idx].text = value;
                            setSimpleFormData({ ...simpleFormData, fillBlanksItems: newItems });
                          }}
                        />
                      </motion.div>
                    ))}
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSimpleFormData({
                        ...simpleFormData,
                        fillBlanksItems: [...(simpleFormData.fillBlanksItems || [{ text: '' }]), { text: '' }]
                      });
                    }}
                    className="w-full shadow-sm hover:shadow-md hover:bg-pink-100 dark:hover:bg-pink-900/30"
                  >
                    + إضافة نص جديد
                  </Button>
                </div>
              )}

              {selectedGameType === 'H5P.DragQuestion' && (
                <div className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/30 dark:to-violet-950/30 rounded-2xl p-6 md:p-8 space-y-6 shadow-lg">
                  <div className="space-y-4">
                    <h3 className="font-bold text-xl text-gray-900 dark:text-white">📝 إنشاء سحب وإفلات</h3>
                    <Alert className="bg-purple-100 dark:bg-purple-900/50 border-purple-300 dark:border-purple-700">
                      <AlertDescription className="text-sm text-purple-900 dark:text-purple-200">
                        💡 <strong>كيفية الاستخدام:</strong> اكتب السؤال، أضف العناصر القابلة للسحب، ثم أضف مناطق الإفلات واسحب العناصر إليها.
                      </AlertDescription>
                    </Alert>
                    
                    <DragQuestionEditor
                      value={simpleFormData.dragQuestionData ? JSON.stringify(simpleFormData.dragQuestionData) : ''}
                      onChange={(value) => {
                        try {
                          if (value && value.trim()) {
                            const parsed = JSON.parse(value);
                            setSimpleFormData({ ...simpleFormData, dragQuestionData: parsed });
                          } else {
                            setSimpleFormData({ ...simpleFormData, dragQuestionData: null });
                          }
                        } catch (e) {
                          console.error('Error parsing drag question data:', e);
                        }
                      }}
                    />
                  </div>
                </div>
              )}

                <div className="flex gap-4 pt-6">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1 gradient-primary text-white py-6 text-xl font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                        جاري الحفظ...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5 ml-2" />
                        إنشاء اللعبة
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={loading}
                    className="px-6 py-6 text-lg font-bold rounded-2xl border-2 hover:border-primary hover:bg-primary/10"
                  >
                    إلغاء
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

