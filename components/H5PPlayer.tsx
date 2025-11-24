'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Radio, Clock, GripVertical, X } from 'lucide-react';
import { ConfettiEffect } from '@/components/games/ConfettiEffect';
import { useGameSounds } from '@/hooks/useGameSounds';
import { motion } from 'framer-motion';
import FillInTheBlanks from '@/components/games/FillInTheBlanks';
import { CountdownTimer } from '@/components/games/CountdownTimer';
import { toast } from 'sonner';
import { DndContext, DragOverlay, useDraggable, useDroppable, closestCenter, useSensors, useSensor, PointerSensor, TouchSensor } from '@dnd-kit/core';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';

interface H5PPlayerProps {
  h5pContent: any;
  onComplete?: (score: number, maxScore: number, completion: number) => void;
  className?: string;
}

export default function H5PPlayer({ h5pContent, onComplete, className = '' }: H5PPlayerProps) {
  const sounds = useGameSounds({ enabled: true });
  const [showConfetti, setShowConfetti] = useState(false);

  // Helper function to play sounds
  const playSound = (type: 'correct' | 'wrong' | 'complete') => {
    if (type === 'correct') {
      sounds.playCorrect();
    } else if (type === 'wrong') {
      sounds.playIncorrect();
    } else if (type === 'complete') {
      sounds.playWin();
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  };

  // Show Custom UI directly - no H5P library dependency
  if (!h5pContent) {
    return (
      <div className={`p-6 ${className}`} dir="rtl">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">⚠️ لا يوجد محتوى لعرضه</p>
        </div>
      </div>
    );
  }

  const library = h5pContent.library || h5pContent.h5p_library || 'H5P.QuestionSet';
  const params = h5pContent.params || h5pContent;

  // Check if MultiChoice has multiple questions (should be QuestionSet)
  // This handles cases where games were created with multiple questions but stored as MultiChoice
  let actualLibrary = library;
  let actualParams = params;
  
  console.log('🔍 H5P Content Analysis:', {
    library,
    h5p_library: h5pContent.h5p_library,
    hasParams: !!params,
    paramsKeys: params ? Object.keys(params) : [],
    hasQuestions: !!(params?.questions),
    questionsLength: params?.questions?.length,
    hasQuestion: !!(params?.question),
    hasAnswers: !!(params?.answers),
    fullContent: h5pContent
  });
  
  if (library === 'H5P.MultiChoice' || h5pContent.h5p_library === 'H5P.MultiChoice') {
    // Check if there are multiple questions in the structure
    // Some games might have questions array even if library is MultiChoice
    if (params?.questions && Array.isArray(params.questions) && params.questions.length > 1) {
      console.log('🔄 Converting MultiChoice with multiple questions to QuestionSet');
      actualLibrary = 'H5P.QuestionSet';
      actualParams = {
        intro: params.intro || 'مرحباً بك في الاختبار',
        outro: params.outro || 'شكراً لك على إكمال الاختبار',
        questions: params.questions
      };
    } else if (params?.question && typeof params.question === 'string' && params.answers && Array.isArray(params.answers)) {
      // Single MultiChoice question - keep as is
      actualLibrary = 'H5P.MultiChoice';
      actualParams = params;
    } else {
      // Check if params itself is an array (unlikely but possible)
      if (Array.isArray(params) && params.length > 1) {
        console.log('🔄 Converting array of questions to QuestionSet');
        actualLibrary = 'H5P.QuestionSet';
        actualParams = {
          intro: 'مرحباً بك في الاختبار',
          outro: 'شكراً لك على إكمال الاختبار',
          questions: params
        };
      }
    }
  }

  console.log('📦 Final H5P Content:', { library, actualLibrary, params, actualParams });

  return (
    <div className={className || ''} dir="rtl">
      {/* Confetti Effect */}
      <ConfettiEffect
        trigger={showConfetti}
        duration={3000}
        particleCount={150}
        spread={70}
        colors={['#E9A821', '#FFB347', '#FFD700', '#10B981', '#34D399']}
      />

      {/* Render Custom UI based on library type */}
      {actualLibrary === 'H5P.QuestionSet' && actualParams?.questions && (
        <QuestionSetFallback 
          questions={actualParams.questions}
          onComplete={onComplete}
          playSound={playSound}
          questionTimeLimit={h5pContent.question_time_limit}
        />
      )}
      
      {actualLibrary === 'H5P.MultiChoice' && actualParams?.answers && (
        <MultiChoiceFallback 
          question={actualParams.question}
          answers={actualParams.answers}
          onComplete={onComplete}
          playSound={playSound}
        />
      )}

      {library === 'H5P.DragText' && (() => {
        const text = (params?.text || params?.taskDescription || '').trim();
        if (text && text.length > 0) {
          return (
            <DragTextFallback 
              text={text}
              onComplete={onComplete}
              playSound={playSound}
            />
          );
        }
        return null;
      })()}

      {(library === 'H5P.FillInTheBlanks' || library === 'H5P.Blanks') && (params?.text || params?.taskDescription) && (
        <FillInTheBlanks 
          text={params.text || params.taskDescription || ''}
          onComplete={onComplete}
          playSound={playSound}
        />
      )}

      {library === 'H5P.TrueFalse' && params?.question && (
        <TrueFalseFallback 
          question={params.question}
          correct={params.correct}
          onComplete={onComplete}
          playSound={playSound}
        />
      )}

      {(library === 'H5P.DragQuestion' || actualLibrary === 'H5P.DragQuestion') && actualParams?.question && actualParams?.dropZones && (actualParams?.draggables || actualParams?.items) && (
        <DragQuestionFallback 
          question={actualParams.question}
          dropZones={actualParams.dropZones}
          draggables={actualParams.draggables || actualParams.items}
          onComplete={onComplete}
          playSound={playSound}
        />
      )}

      {/* Show message if no supported type matched */}
      {!(
        (library === 'H5P.QuestionSet' && params?.questions) ||
        (library === 'H5P.MultiChoice' && params?.answers) ||
        (library === 'H5P.DragText' && (params?.text || params?.taskDescription)) ||
        ((library === 'H5P.FillInTheBlanks' || library === 'H5P.Blanks') && (params?.text || params?.taskDescription)) ||
        (library === 'H5P.TrueFalse' && params?.question) ||
        ((library === 'H5P.DragQuestion' || actualLibrary === 'H5P.DragQuestion') && actualParams?.question && actualParams?.dropZones && (actualParams?.draggables || actualParams?.items))
      ) && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <p className="text-yellow-800 dark:text-yellow-200">
            ⚠️ نوع المحتوى "{library}" غير مدعوم حالياً. الأنواع المدعومة: QuestionSet, MultiChoice, TrueFalse, DragText, FillInTheBlanks, DragQuestion
          </p>
          <details className="mt-2">
            <summary className="cursor-pointer text-sm text-yellow-700 dark:text-yellow-300">
              عرض بيانات JSON (للتشخيص)
            </summary>
            <pre className="mt-2 text-xs overflow-auto max-h-96 whitespace-pre-wrap break-words bg-white dark:bg-gray-800 p-2 rounded">
              {JSON.stringify(h5pContent, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}

// Fallback components for interactive content
function QuestionSetFallback({ 
  questions, 
  onComplete, 
  playSound,
  questionTimeLimit
}: { 
  questions: any[];
  onComplete?: (score: number, maxScore: number, completion: number) => void;
  playSound: (type: 'correct' | 'wrong' | 'complete') => void;
  questionTimeLimit?: number | null;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [questionTimerKey, setQuestionTimerKey] = useState(0);

  // Reset timer when question changes
  useEffect(() => {
    if (questionTimeLimit && questionTimeLimit > 0) {
      setQuestionTimerKey(prev => prev + 1);
    }
  }, [currentIndex, questionTimeLimit]);

  const handleQuestionTimeUp = () => {
    // Time is up for current question - mark as wrong and move to next
    const currentAnswer = answers[currentIndex];
    const currentQ = questions[currentIndex];
    const questionType = currentQ.library || 'H5P.MultiChoice';
    
    // Play sound when time is up (only once)
    playSound('wrong');
    
    if (currentAnswer === undefined) {
      // No answer selected - mark as wrong
      toast.error('انتهى الوقت! لم يتم اختيار إجابة');
    }
    
    // Move to next question
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Last question - finish the game
      let correct = 0;
      questions.forEach((q, idx) => {
        const answer = answers[idx];
        if (answer !== undefined) {
          const qType = q.library || 'H5P.MultiChoice';
          if (qType === 'H5P.TrueFalse') {
            const correctAnswer = q.params?.correct === true ? 0 : 1;
            if (answer === correctAnswer) correct++;
          } else {
            if (q.params?.answers?.[answer]?.correct) {
              correct++;
            }
          }
        }
      });
      setScore(correct);
      setShowResults(true);
      
      playSound('complete');
      
      if (onComplete) {
        onComplete(correct, questions.length, (correct / questions.length) * 100);
      }
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      const currentAnswer = answers[currentIndex];
      const currentQ = questions[currentIndex];
      const questionType = currentQ.library || 'H5P.MultiChoice';
      
      // Play sound when moving to next question (not when selecting answer)
      if (currentAnswer !== undefined) {
        let isCorrect = false;
        if (questionType === 'H5P.TrueFalse') {
          // For TrueFalse: 0 = true, 1 = false
          const correctAnswer = currentQ.params?.correct === true ? 0 : 1;
          isCorrect = currentAnswer === correctAnswer;
          console.log('🔍 TrueFalse Check:', { 
            selected: currentAnswer, 
            correctAnswer, 
            isCorrect,
            questionCorrect: currentQ.params?.correct 
          });
        } else {
          // For MultiChoice
          isCorrect = currentQ.params?.answers?.[currentAnswer]?.correct || false;
          console.log('🔍 MultiChoice Check:', { 
            selected: currentAnswer, 
            isCorrect,
            answer: currentQ.params?.answers?.[currentAnswer],
            allAnswers: currentQ.params?.answers
          });
        }
        // Play sound when clicking "Next" button, not when selecting answer
        playSound(isCorrect ? 'correct' : 'wrong');
      }
      setCurrentIndex(currentIndex + 1);
    } else {
      let correct = 0;
      questions.forEach((q, idx) => {
        const answer = answers[idx];
        if (answer !== undefined) {
          const questionType = q.library || 'H5P.MultiChoice';
          if (questionType === 'H5P.TrueFalse') {
            const correctAnswer = q.params?.correct === true ? 0 : 1;
            if (answer === correctAnswer) correct++;
            console.log('✅ TrueFalse Result:', { idx, answer, correctAnswer, isCorrect: answer === correctAnswer });
          } else {
            const answerCorrect = q.params?.answers?.[answer]?.correct;
            if (answerCorrect) correct++;
            console.log('✅ MultiChoice Result:', { idx, answer, isCorrect: answerCorrect, answerData: q.params?.answers?.[answer] });
          }
        } else {
          console.log('❌ No answer for question:', idx);
        }
      });
      console.log('📊 Final Score:', { correct, total: questions.length, percentage: (correct / questions.length) * 100 });
      setScore(correct);
      setShowResults(true);
      
      playSound('complete');
      
      if (onComplete) {
        onComplete(correct, questions.length, (correct / questions.length) * 100);
      }
    }
  };

  if (showResults) {
    const percentage = (score / questions.length) * 100;
    return (
      <Card className="bg-gradient-to-br from-blue-50 to-blue-50 dark:from-blue-900/30 dark:to-blue-900/30 border-0 shadow-2xl">
        <CardHeader className="p-8 pb-6 bg-gradient-to-r from-blue-500 to-blue-500">
          <CardTitle className="text-center text-4xl md:text-5xl font-black text-white drop-shadow-lg">
            النتيجة: {score} / {questions.length}
          </CardTitle>
          <p className="text-center text-2xl md:text-3xl font-bold text-white/90 mt-2">
            ({percentage.toFixed(0)}%)
          </p>
        </CardHeader>
        <CardContent className="p-8 md:p-12">
          <div className="space-y-4 md:space-y-6">
            {questions.map((q, idx) => {
              const selected = answers[idx];
              const questionType = q.library || 'H5P.MultiChoice';
              let isCorrect = false;
              
              if (selected !== undefined) {
                if (questionType === 'H5P.TrueFalse') {
                  const correctAnswer = q.params?.correct === true ? 0 : 1;
                  isCorrect = selected === correctAnswer;
                } else {
                  isCorrect = q.params?.answers?.[selected]?.correct || false;
                }
              }
              
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`p-6 md:p-8 rounded-2xl border-4 shadow-lg ${
                    isCorrect 
                      ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-500' 
                      : 'bg-red-100 dark:bg-red-900/30 border-red-500'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {isCorrect ? (
                      <CheckCircle className="w-8 h-8 md:w-10 md:h-10 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
                    ) : (
                      <XCircle className="w-8 h-8 md:w-10 md:h-10 text-red-600 dark:text-red-400 flex-shrink-0 mt-1" />
                    )}
                    <div className="flex-1">
                      <p className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-2">{q.params?.question}</p>
                      <p className={`text-base md:text-lg font-semibold ${isCorrect ? 'text-blue-700 dark:text-blue-300' : 'text-red-700 dark:text-red-300'}`}>
                        {isCorrect ? '✓ إجابة صحيحة' : '✗ إجابة خاطئة'}
                      </p>
                      {questionType === 'H5P.TrueFalse' && selected !== undefined && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          إجابتك: {selected === 0 ? 'صحيح' : 'خطأ'} | الإجابة الصحيحة: {q.params?.correct === true ? 'صحيح' : 'خطأ'}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentQ = questions[currentIndex];
  const questionType = currentQ.library || 'H5P.MultiChoice';
  const isTrueFalse = questionType === 'H5P.TrueFalse';
  
  return (
    <Card className="border-0 shadow-2xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm">
      <CardHeader className="p-8 pb-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700 border-b-2 border-gray-200 dark:border-slate-600">
        <CardTitle className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white">
          السؤال {currentIndex + 1} من {questions.length}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-8 md:p-12">
        {/* Question Timer - Moved to top of content for better visibility */}
        {questionTimeLimit && questionTimeLimit > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 flex justify-center"
          >
            <div className="flex items-center gap-3 px-6 py-3 bg-amber-50 dark:bg-amber-900/30 rounded-xl border-2 border-amber-300 dark:border-amber-700 shadow-lg">
              <Clock className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              <CountdownTimer
                key={`question-timer-${questionTimerKey}`}
                duration={questionTimeLimit}
                isPlaying={!showResults}
                onComplete={handleQuestionTimeUp}
                onTimeWarning={() => {
                  // Warning sound is handled by CountdownTimer internally
                }}
                size={80}
                showWarningColors={true}
                playWarningSounds={true}
                showTime={true}
              />
            </div>
          </motion.div>
        )}
        
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-2xl md:text-3xl font-bold text-gray-900 dark:text-white leading-relaxed"
        >
          {currentQ.params?.question}
        </motion.p>
        
        {/* MultiChoice Answers */}
        {!isTrueFalse && currentQ.params?.answers && (
        <div className="space-y-4 md:space-y-6">
          {currentQ.params.answers.map((ans: any, idx: number) => (
            <motion.button
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setAnswers({ ...answers, [currentIndex]: idx })}
              className={`w-full text-right p-6 md:p-8 rounded-2xl border-4 transition-all shadow-lg hover:shadow-xl ${
                answers[currentIndex] === idx 
                  ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-blue-50 dark:from-blue-900/30 dark:to-blue-900/30 shadow-blue-200 dark:shadow-blue-900/50' 
                  : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 hover:border-primary hover:shadow-primary/20'
              }`}
            >
              <div className="flex items-center gap-4">
                <Radio className={`w-6 h-6 ml-4 flex-shrink-0 ${answers[currentIndex] === idx ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`} />
                <span className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-white">{ans.text}</span>
              </div>
            </motion.button>
          ))}
        </div>
        )}
        
        {/* TrueFalse Options */}
        {isTrueFalse && (
        <div className="space-y-4 md:space-y-6">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setAnswers({ ...answers, [currentIndex]: 0 })}
            className={`w-full text-right p-6 md:p-8 rounded-2xl border-4 transition-all shadow-lg hover:shadow-xl ${
              answers[currentIndex] === 0 
                ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-blue-50 dark:from-blue-900/30 dark:to-blue-900/30 shadow-blue-200 dark:shadow-blue-900/50' 
                : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 hover:border-primary hover:shadow-primary/20'
            }`}
          >
            <div className="flex items-center gap-4">
              <Radio className={`w-6 h-6 ml-4 flex-shrink-0 ${answers[currentIndex] === 0 ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`} />
              <span className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-white">✓ صحيح</span>
            </div>
          </motion.button>
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setAnswers({ ...answers, [currentIndex]: 1 })}
            className={`w-full text-right p-6 md:p-8 rounded-2xl border-4 transition-all shadow-lg hover:shadow-xl ${
              answers[currentIndex] === 1 
                ? 'border-red-500 bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/30 dark:to-rose-900/30 shadow-red-200 dark:shadow-red-900/50' 
                : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 hover:border-primary hover:shadow-primary/20'
            }`}
          >
            <div className="flex items-center gap-4">
              <Radio className={`w-6 h-6 ml-4 flex-shrink-0 ${answers[currentIndex] === 1 ? 'text-red-600 dark:text-red-400' : 'text-gray-400'}`} />
              <span className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-white">✗ خطأ</span>
            </div>
          </motion.button>
        </div>
        )}
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 md:mt-12"
        >
          <Button 
            onClick={handleNext} 
            disabled={answers[currentIndex] === undefined} 
            size="lg"
            className="w-full py-6 md:py-8 text-xl md:text-2xl font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all"
          >
            {currentIndex === questions.length - 1 ? 'إنهاء الاختبار' : 'السؤال التالي →'}
          </Button>
        </motion.div>
      </CardContent>
    </Card>
  );
}

function MultiChoiceFallback({ 
  question, 
  answers, 
  onComplete, 
  playSound 
}: { 
  question: string;
  answers: any[];
  onComplete?: (score: number, maxScore: number, completion: number) => void;
  playSound: (type: 'correct' | 'wrong' | 'complete') => void;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (selected === null) return;
    setSubmitted(true);
    const isCorrect = answers[selected]?.correct || false;
    
    playSound(isCorrect ? 'correct' : 'wrong');
    
    if (onComplete) {
      onComplete(isCorrect ? 1 : 0, 1, isCorrect ? 100 : 0);
    }
  };

  if (submitted) {
    const isCorrect = selected !== null && answers[selected]?.correct;
    return (
      <Card className={`border-0 shadow-2xl ${isCorrect ? 'bg-gradient-to-br from-blue-50 to-blue-50 dark:from-blue-900/30 dark:to-blue-900/30' : 'bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/30 dark:to-rose-900/30'}`}>
        <CardContent className="text-center pt-12 pb-12 px-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            {isCorrect ? (
              <CheckCircle className="w-24 h-24 md:w-32 md:h-32 text-blue-600 dark:text-blue-400 mx-auto mb-6" />
            ) : (
              <XCircle className="w-24 h-24 md:w-32 md:h-32 text-red-600 dark:text-red-400 mx-auto mb-6" />
            )}
          </motion.div>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white"
          >
            {isCorrect ? 'إجابة صحيحة! 🎉' : 'إجابة خاطئة'}
          </motion.p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-2xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm">
      <CardHeader className="p-8 pb-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700 border-b-2 border-gray-200 dark:border-slate-600">
        <CardTitle className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white">
          {question}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-8 md:p-12">
        <div className="space-y-4 md:space-y-6">
          {answers.map((ans, idx) => (
            <motion.button
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelected(idx)}
              className={`w-full text-right p-6 md:p-8 rounded-2xl border-4 transition-all shadow-lg hover:shadow-xl ${
                selected === idx 
                  ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-blue-50 dark:from-blue-900/30 dark:to-blue-900/30 shadow-blue-200 dark:shadow-blue-900/50' 
                  : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 hover:border-primary hover:shadow-primary/20'
              }`}
            >
              <div className="flex items-center gap-4">
                <Radio className={`w-6 h-6 ml-4 flex-shrink-0 ${selected === idx ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`} />
                <span className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-white">{ans.text}</span>
              </div>
            </motion.button>
          ))}
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 md:mt-12"
        >
          <Button 
            onClick={handleSubmit} 
            disabled={selected === null} 
            size="lg"
            className="w-full py-6 md:py-8 text-xl md:text-2xl font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all"
          >
            إرسال الإجابة
          </Button>
        </motion.div>
      </CardContent>
    </Card>
  );
}

function TrueFalseFallback({ 
  question, 
  correct, 
  onComplete, 
  playSound 
}: { 
  question: string;
  correct: boolean;
  onComplete?: (score: number, maxScore: number, completion: number) => void;
  playSound: (type: 'correct' | 'wrong' | 'complete') => void;
}) {
  const [selected, setSelected] = useState<boolean | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (selected === null) return;
    setSubmitted(true);
    const isCorrect = selected === correct;
    
    playSound(isCorrect ? 'correct' : 'wrong');
    
    if (onComplete) {
      onComplete(isCorrect ? 1 : 0, 1, isCorrect ? 100 : 0);
    }
  };

  if (submitted) {
    const isCorrect = selected === correct;
    return (
      <Card className={`border-0 shadow-2xl ${isCorrect ? 'bg-gradient-to-br from-blue-50 to-blue-50 dark:from-blue-900/30 dark:to-blue-900/30' : 'bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/30 dark:to-rose-900/30'}`}>
        <CardContent className="text-center pt-12 pb-12 px-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            {isCorrect ? (
              <CheckCircle className="w-24 h-24 md:w-32 md:h-32 text-blue-600 dark:text-blue-400 mx-auto mb-6" />
            ) : (
              <XCircle className="w-24 h-24 md:w-32 md:h-32 text-red-600 dark:text-red-400 mx-auto mb-6" />
            )}
          </motion.div>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white"
          >
            {isCorrect ? 'إجابة صحيحة! 🎉' : 'إجابة خاطئة'}
          </motion.p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-2xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm">
      <CardHeader className="p-8 pb-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700 border-b-2 border-gray-200 dark:border-slate-600">
        <CardTitle className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white">
          {question}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-8 md:p-12">
        <div className="flex flex-col sm:flex-row gap-4 md:gap-6 mb-8 md:mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex-1"
          >
            <Button
              type="button"
              variant={selected === true ? "primary" : "outline"}
              onClick={() => setSelected(true)}
              size="lg"
              className={`w-full py-8 md:py-12 text-2xl md:text-3xl font-black rounded-2xl shadow-xl hover:shadow-2xl transition-all border-4 ${
                selected === true 
                  ? "bg-blue-600 hover:bg-blue-700 border-blue-700 text-white" 
                  : "border-gray-300 dark:border-gray-600"
              }`}
            >
              ✓ صواب
            </Button>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex-1"
          >
            <Button
              type="button"
              variant={selected === false ? "primary" : "outline"}
              onClick={() => setSelected(false)}
              size="lg"
              className={`w-full py-8 md:py-12 text-2xl md:text-3xl font-black rounded-2xl shadow-xl hover:shadow-2xl transition-all border-4 ${
                selected === false 
                  ? "bg-red-600 hover:bg-red-700 border-red-700 text-white" 
                  : "border-gray-300 dark:border-gray-600"
              }`}
            >
              ✗ خطأ
            </Button>
          </motion.div>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Button 
            onClick={handleSubmit} 
            disabled={selected === null} 
            size="lg"
            className="w-full py-6 md:py-8 text-xl md:text-2xl font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all"
          >
            إرسال الإجابة
          </Button>
        </motion.div>
      </CardContent>
    </Card>
  );
}

function DragTextFallback({ 
  text, 
  onComplete, 
  playSound 
}: { 
  text: string;
  onComplete?: (score: number, maxScore: number, completion: number) => void;
  playSound: (type: 'correct' | 'wrong' | 'complete') => void;
}) {
  const [draggedWords, setDraggedWords] = useState<{ [key: number]: string }>({});
  const [submitted, setSubmitted] = useState(false);

  // Parse text to extract draggable words (marked with *)
  const parseDragText = (text: string) => {
    const parts: Array<{ type: 'text' | 'blank', content: string }> = [];
    const regex = /\*([^*]+)\*/g;
    let lastIndex = 0;
    let match;
    const blanks: string[] = [];

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push({ type: 'text', content: text.substring(lastIndex, match.index) });
      }
      const word = match[1];
      blanks.push(word);
      parts.push({ type: 'blank', content: word });
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push({ type: 'text', content: text.substring(lastIndex) });
    }

    return { parts, blanks: [...new Set(blanks)] };
  };

  const { parts, blanks } = parseDragText(text);
  const blankCount = parts.filter(p => p.type === 'blank').length;

  const handleDragStart = (e: React.DragEvent, word: string) => {
    e.dataTransfer.setData('text/plain', word);
  };

  const handleDrop = (e: React.DragEvent, blankIndex: number) => {
    e.preventDefault();
    const word = e.dataTransfer.getData('text/plain');
    setDraggedWords({ ...draggedWords, [blankIndex]: word });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleSubmit = () => {
    let correct = 0;
    let blankIdx = 0;
    parts.forEach((part) => {
      if (part.type === 'blank') {
        if (draggedWords[blankIdx] === part.content) {
          correct++;
        }
        blankIdx++;
      }
    });

    const score = correct;
    const maxScore = blankCount;
    const percentage = (score / maxScore) * 100;

    playSound(percentage === 100 ? 'complete' : percentage >= 50 ? 'correct' : 'wrong');
    
    if (onComplete) {
      onComplete(score, maxScore, percentage);
    }
    setSubmitted(true);
  };

  if (submitted) {
    let correct = 0;
    let blankIdx = 0;
    parts.forEach((part) => {
      if (part.type === 'blank') {
        if (draggedWords[blankIdx] === part.content) {
          correct++;
        }
        blankIdx++;
      }
    });

    const percentage = (correct / blankCount) * 100;
    return (
      <Card className="bg-gradient-to-br from-blue-50 to-blue-50 dark:from-blue-900/30 dark:to-blue-900/30 border-0 shadow-2xl">
        <CardHeader className="p-8 pb-6 bg-gradient-to-r from-blue-500 to-blue-500">
          <CardTitle className="text-center text-4xl md:text-5xl font-black text-white drop-shadow-lg">
            النتيجة: {correct} / {blankCount}
          </CardTitle>
          <p className="text-center text-2xl md:text-3xl font-bold text-white/90 mt-2">
            ({percentage.toFixed(0)}%)
          </p>
        </CardHeader>
        <CardContent className="p-8 md:p-12">
          <div className="text-center mb-6">
            <motion.p 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white"
            >
              {correct === blankCount ? 'ممتاز! 🎉' : correct >= blankCount / 2 ? 'جيد جداً! 💪' : 'حاول مرة أخرى 📚'}
            </motion.p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-2xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm">
      <CardHeader className="p-8 pb-6 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-slate-800 dark:to-slate-700 border-b-2 border-gray-200 dark:border-slate-600">
        <CardTitle className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white">
          سحب النص
        </CardTitle>
      </CardHeader>
      <CardContent className="p-8 md:p-12 space-y-6 md:space-y-8">
        <div className="bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-800 dark:to-slate-900 p-6 md:p-8 rounded-2xl min-h-[300px] md:min-h-[400px] border-4 border-gray-200 dark:border-gray-700 shadow-lg">
          <div className="text-xl md:text-2xl leading-relaxed space-y-3">
            {parts.map((part, idx) => {
              if (part.type === 'text') {
                return <span key={idx} className="text-gray-900 dark:text-white font-medium">{part.content}</span>;
              } else {
                const blankIdx = parts.slice(0, idx).filter(p => p.type === 'blank').length;
                return (
                  <motion.span
                    key={idx}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    onDrop={(e) => handleDrop(e, blankIdx)}
                    onDragOver={handleDragOver}
                    className={`inline-block min-w-[150px] md:min-w-[200px] h-12 md:h-16 border-4 border-dashed rounded-xl px-4 md:px-6 mx-2 align-middle transition-all text-lg md:text-xl font-bold ${
                      draggedWords[blankIdx] 
                        ? 'bg-gradient-to-r from-blue-100 to-blue-100 dark:from-blue-900/40 dark:to-blue-900/40 border-blue-500 text-blue-700 dark:text-blue-300 shadow-lg' 
                        : 'bg-white dark:bg-slate-700 border-gray-400 text-gray-500 dark:text-gray-400 hover:border-primary'
                    }`}
                  >
                    {draggedWords[blankIdx] || '___'}
                  </motion.span>
                );
              }
            })}
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 md:p-8 rounded-2xl border-4 border-blue-200 dark:border-blue-800 shadow-lg">
          <p className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-gray-900 dark:text-white">الكلمات المتاحة:</p>
          <div className="flex flex-wrap gap-3 md:gap-4">
            {blanks.map((word, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ scale: 1.1, rotate: 2 }}
                whileTap={{ scale: 0.95 }}
                className="inline-block"
              >
                <button
                  draggable
                  onDragStart={(e: React.DragEvent) => handleDragStart(e, word)}
                  className="px-6 md:px-8 py-4 md:py-5 bg-white dark:bg-slate-800 border-4 border-blue-400 dark:border-blue-600 rounded-2xl hover:bg-blue-100 dark:hover:bg-blue-900/30 cursor-move transition-all shadow-lg hover:shadow-xl text-lg md:text-xl font-bold text-gray-900 dark:text-white"
                >
                  {word}
                </button>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Button 
            onClick={handleSubmit} 
            disabled={Object.keys(draggedWords).length !== blankCount}
            size="lg"
            className="w-full py-6 md:py-8 text-xl md:text-2xl font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all"
          >
            إرسال الإجابة
          </Button>
        </motion.div>
      </CardContent>
    </Card>
  );
}

// FillInTheBlanksFallback moved to separate component: @/components/games/FillInTheBlanks.tsx

function DragQuestionFallback({
  question,
  dropZones,
  draggables,
  onComplete,
  playSound
}: {
  question: string;
  dropZones: Array<{ id?: string; label: string; x: number; y: number; width: number; height: number }>;
  draggables: Array<{ id?: string; label?: string; text?: string; dropZone?: string | number | null; dropZoneId?: string | null }>;
  onComplete?: (score: number, maxScore: number, completion: number) => void;
  playSound: (type: 'correct' | 'wrong' | 'complete') => void;
}) {
  // Normalize draggables format - support both old (label, dropZone) and new (text, dropZoneId) formats
  const normalizedDraggables = draggables.map((item, idx) => ({
    id: item.id || `item-${idx}`,
    label: item.label || item.text || `عنصر ${idx + 1}`,
    dropZone: item.dropZone !== undefined ? item.dropZone : (item.dropZoneId || null)
  }));
  const [placedItems, setPlacedItems] = useState<{ [itemIndex: number]: number }>({});
  const [submitted, setSubmitted] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const dragOffsetRef = useRef<{ x: number; y: number } | null>(null);
  const elementRefs = useRef<{ [key: number]: HTMLElement | null }>({});
  const [cursorPosition, setCursorPosition] = useState<{ x: number; y: number } | null>(null);

  // Configure sensors for better drag experience
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px of movement before drag starts
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200, // 200ms delay for touch
        tolerance: 5,
      },
    })
  );

  // Get the active draggable element dimensions for offset calculation
  const activeDraggable = activeId 
    ? normalizedDraggables[parseInt(activeId.replace('draggable-', ''))]
    : null;

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
    
    // Get cursor position from event
    if (event.activatorEvent) {
      setCursorPosition({
        x: event.activatorEvent.clientX,
        y: event.activatorEvent.clientY,
      });
    }
    
    // Calculate offset from element center to cursor position
    const itemIndex = parseInt(event.active.id.replace('draggable-', ''));
    const element = elementRefs.current[itemIndex] || document.querySelector(`[data-draggable-id="draggable-${itemIndex}"]`) as HTMLElement;
    
    if (element) {
      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      // Get cursor position from event
      let cursorX = centerX;
      let cursorY = centerY;
      
      // Try different ways to get cursor position
      if (event.activatorEvent) {
        cursorX = event.activatorEvent.clientX;
        cursorY = event.activatorEvent.clientY;
      } else if ((event as any).active?.data?.current?.pointerPosition) {
        const pos = (event as any).active.data.current.pointerPosition;
        cursorX = pos.x;
        cursorY = pos.y;
      }
      
      // Calculate offset to center element on cursor
      // This offset represents where the cursor was relative to element center when drag started
      dragOffsetRef.current = {
        x: cursorX - centerX,
        y: cursorY - centerY,
      };
      
    } else {
      // Default: center the element
      dragOffsetRef.current = { x: 0, y: 0 };
    }
  };
  
  // Track mouse movement during drag
  useEffect(() => {
    if (!activeId) {
      setCursorPosition(null);
      return;
    }
    
    const handleMouseMove = (e: MouseEvent) => {
      setCursorPosition({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [activeId]);

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    setActiveId(null);
    dragOffsetRef.current = null;
    setCursorPosition(null);

    if (over && over.id.startsWith('drop-zone-')) {
      const itemIndex = parseInt(active.id.replace('draggable-', ''));
      const zoneIndex = parseInt(over.id.replace('drop-zone-', ''));
      setPlacedItems({ ...placedItems, [itemIndex]: zoneIndex });
    } else {
      // Remove item from zone if dropped outside
      const itemIndex = parseInt(active.id.replace('draggable-', ''));
      const newPlacedItems = { ...placedItems };
      delete newPlacedItems[itemIndex];
      setPlacedItems(newPlacedItems);
    }
  };

  const handleRemoveItem = (itemIndex: number) => {
    const newPlacedItems = { ...placedItems };
    delete newPlacedItems[itemIndex];
    setPlacedItems(newPlacedItems);
  };

  const handleSubmit = () => {
    if (submitted) return;
    
    setSubmitted(true);
    let correct = 0;
    let total = 0;

    normalizedDraggables.forEach((draggable, idx) => {
      if (draggable.dropZone !== null && draggable.dropZone !== undefined) {
        total++;
        // Match dropZone by id, index, or label
        const correctZoneIndex = dropZones.findIndex((zone, i) => {
          const zoneId = zone.id || `zone-${i}`;
          const zoneLabel = zone.label || '';
          const dropZoneValue = draggable.dropZone;
          
          // Try matching by id first (most common case)
          if (dropZoneValue === zoneId || dropZoneValue === `zone-${i}`) {
            return true;
          }
          // Try matching by index
          if (dropZoneValue === i.toString() || dropZoneValue === i) {
            return true;
          }
          // Try matching by label
          if (dropZoneValue === zoneLabel) {
            return true;
          }
          return false;
        });
        
        if (placedItems[idx] === correctZoneIndex && correctZoneIndex !== -1) {
          correct++;
        }
      }
    });

    const score = total > 0 ? correct : 0;
    const maxScore = total > 0 ? total : normalizedDraggables.length;
    const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;

    playSound(percentage === 100 ? 'complete' : percentage >= 50 ? 'correct' : 'wrong');
    
    if (onComplete) {
      onComplete(score, maxScore, percentage);
    }
  };

  if (submitted) {
    let correct = 0;
    let total = 0;
    const feedback: { [key: number]: boolean } = {};

    normalizedDraggables.forEach((draggable, idx) => {
      if (draggable.dropZone !== null && draggable.dropZone !== undefined) {
        total++;
        // Match dropZone by id, index, or label
        const correctZoneIndex = dropZones.findIndex((zone, i) => {
          const zoneId = zone.id || `zone-${i}`;
          const zoneLabel = zone.label || '';
          const dropZoneValue = draggable.dropZone;
          
          // Try matching by id first (most common case)
          if (dropZoneValue === zoneId || dropZoneValue === `zone-${i}`) {
            return true;
          }
          // Try matching by index
          if (dropZoneValue === i.toString() || dropZoneValue === i) {
            return true;
          }
          // Try matching by label
          if (dropZoneValue === zoneLabel) {
            return true;
          }
          return false;
        });
        
        const isCorrect = placedItems[idx] === correctZoneIndex && correctZoneIndex !== -1;
        feedback[idx] = isCorrect;
        if (isCorrect) correct++;
      }
    });

    const percentage = total > 0 ? (correct / total) * 100 : 0;

    return (
      <Card className="bg-gradient-to-br from-blue-50 to-blue-50 dark:from-blue-900/30 dark:to-blue-900/30 border-0 shadow-2xl">
        <CardHeader className="p-8 pb-6 bg-gradient-to-r from-blue-500 to-blue-500">
          <CardTitle className="text-center text-4xl md:text-5xl font-black text-white drop-shadow-lg">
            النتيجة: {correct} / {total || normalizedDraggables.length}
          </CardTitle>
          <p className="text-center text-2xl md:text-3xl font-bold text-white/90 mt-2">
            ({percentage.toFixed(0)}%)
          </p>
        </CardHeader>
        <CardContent className="p-8 md:p-12">
          <div className="space-y-4">
            {normalizedDraggables.map((draggable, idx) => {
              const isCorrect = feedback[idx] === true;
              const isIncorrect = feedback[idx] === false;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`p-4 rounded-xl border-2 ${
                    isCorrect
                      ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-500'
                      : isIncorrect
                      ? 'bg-red-100 dark:bg-red-900/30 border-red-500'
                      : 'bg-gray-100 dark:bg-gray-800 border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {isCorrect ? (
                      <CheckCircle className="w-6 h-6 text-blue-600" />
                    ) : isIncorrect ? (
                      <XCircle className="w-6 h-6 text-red-600" />
                    ) : null}
                    <span className="font-semibold">{draggable.label}</span>
                    {placedItems[idx] !== undefined && (
                      <span className="text-sm text-gray-600">
                        → {dropZones[placedItems[idx]]?.label || 'منطقة غير معروفة'}
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-2xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm">
      <CardHeader className="p-8 pb-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700 border-b-2 border-gray-200 dark:border-slate-600">
        <CardTitle className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white">
          {question}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-8 md:p-12">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          modifiers={[restrictToWindowEdges]}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          {/* Drop Zones Container - Using Grid for better layout */}
          <div className="mb-8">
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">مناطق الإفلات:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dropZones.map((zone, zoneIdx) => {
                const DroppableZone = () => {
                  const { setNodeRef, isOver } = useDroppable({
                    id: `drop-zone-${zoneIdx}`,
                  });

                  const itemsInZone = normalizedDraggables
                    .map((draggable, itemIdx) => ({ draggable, itemIdx }))
                    .filter(({ itemIdx }) => placedItems[itemIdx] === zoneIdx);

                  return (
                    <div
                      ref={setNodeRef}
                      className={`relative border-4 rounded-2xl p-6 transition-all min-h-[180px] ${
                        isOver
                          ? 'border-blue-500 bg-blue-100 dark:bg-blue-900/30 scale-105 shadow-2xl ring-4 ring-blue-300 dark:ring-blue-700'
                          : 'border-purple-300 dark:border-purple-600 bg-purple-50 dark:bg-purple-900/20 hover:border-purple-400 dark:hover:border-purple-500'
                      }`}
                    >
                      <div className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center text-sm font-bold">
                          {zoneIdx + 1}
                        </div>
                        {zone.label}
                      </div>
                      <div className="min-h-[100px] flex flex-wrap gap-2 items-start">
                        {itemsInZone.length > 0 ? (
                          itemsInZone.map(({ draggable, itemIdx }) => (
                            <motion.div
                              key={itemIdx}
                              initial={{ scale: 0, rotate: -180 }}
                              animate={{ scale: 1, rotate: 0 }}
                              className="px-4 py-3 bg-blue-500 dark:bg-blue-600 text-white rounded-xl text-base font-semibold shadow-lg flex items-center gap-2 group relative"
                            >
                              <span>{draggable.label}</span>
                              <button
                                onClick={() => handleRemoveItem(itemIdx)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 hover:bg-blue-600 dark:hover:bg-blue-700 rounded-full p-1"
                                title="إزالة العنصر"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </motion.div>
                          ))
                        ) : (
                          <div className="w-full text-center text-gray-400 dark:text-gray-500 text-sm py-8">
                            {isOver ? (
                              <motion.div
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ repeat: Infinity, duration: 1 }}
                                className="text-blue-600 dark:text-blue-400 font-bold"
                              >
                                ⬇️ أسقط العنصر هنا
                              </motion.div>
                            ) : (
                              '⬆️ اسحب عنصراً هنا'
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                };
                return <DroppableZone key={zoneIdx} />;
              })}
            </div>
          </div>

          {/* Draggable Items */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 p-6 rounded-2xl border-4 border-amber-200 dark:border-amber-800">
            <p className="text-xl font-bold mb-6 text-gray-900 dark:text-white">العناصر القابلة للسحب:</p>
            <div className="flex flex-wrap gap-4">
              {normalizedDraggables.map((draggable, itemIdx) => {
                const DraggableItem = () => {
                  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
                    id: `draggable-${itemIdx}`,
                  });

                  const isPlaced = placedItems[itemIdx] !== undefined;

                  return (
                    <motion.button
                      ref={(node) => {
                        setNodeRef(node);
                        elementRefs.current[itemIdx] = node;
                      }}
                      data-draggable-id={`draggable-${itemIdx}`}
                      {...listeners}
                      {...attributes}
                      disabled={isPlaced}
                      className={`px-6 py-4 rounded-xl border-4 font-bold text-lg transition-all shadow-lg ${
                        isPlaced
                          ? 'bg-gray-300 dark:bg-gray-700 border-gray-400 text-gray-500 cursor-not-allowed opacity-50'
                          : isDragging
                          ? 'opacity-0 pointer-events-none' // Hide original element when dragging
                          : 'bg-white dark:bg-slate-800 border-amber-400 dark:border-amber-600 text-gray-900 dark:text-white hover:bg-amber-100 dark:hover:bg-amber-900/30 hover:border-amber-500 dark:hover:border-amber-500 cursor-grab active:cursor-grabbing hover:shadow-xl'
                      }`}
                      whileHover={!isPlaced && !isDragging ? { scale: 1.08, y: -2 } : {}}
                      whileTap={!isPlaced ? { scale: 0.95 } : {}}
                    >
                      <div className="flex items-center gap-3">
                        <GripVertical className={`w-6 h-6 ${isDragging ? 'text-white' : 'text-amber-600 dark:text-amber-400'}`} />
                        <span className="text-lg">{draggable.label}</span>
                      </div>
                    </motion.button>
                  );
                };
                return <DraggableItem key={itemIdx} />;
              })}
            </div>
            {normalizedDraggables.filter((_, idx) => placedItems[idx] === undefined).length > 0 && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-4 text-center">
                💡 اسحب العناصر إلى المناطق المناسبة أعلاه
              </p>
            )}
          </div>

          <DragOverlay
            style={{ cursor: 'grabbing', pointerEvents: 'none' }}
            dropAnimation={null}
            modifiers={[
              ({ transform }) => {
                // Adjust offset - element is top-right of cursor
                // Move element down significantly and left significantly
                return {
                  ...transform,
                  x: transform.x - 150,  // Move left significantly
                  y: transform.y + 50,   // Move down significantly
                };
              },
            ]}
          >
            {activeId ? (
              <div 
                className="px-8 py-6 rounded-2xl border-4 border-blue-500 bg-blue-500 text-white shadow-2xl cursor-grabbing"
                style={{ 
                  transform: 'rotate(-2deg)',
                  pointerEvents: 'none'
                }}
              >
                <div className="flex items-center gap-3">
                  <GripVertical className="w-6 h-6" />
                  <span className="font-bold text-xl">
                    {normalizedDraggables[parseInt(activeId.replace('draggable-', ''))]?.label}
                  </span>
                </div>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8"
        >
          <Button
            onClick={handleSubmit}
            disabled={Object.keys(placedItems).length !== normalizedDraggables.length}
            size="lg"
            className="w-full py-6 md:py-8 text-xl md:text-2xl font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all"
          >
            إرسال الإجابة
          </Button>
        </motion.div>
      </CardContent>
    </Card>
  );
}
