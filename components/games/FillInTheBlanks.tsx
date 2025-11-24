'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface FillInTheBlanksProps {
  text: string;
  onComplete?: (score: number, maxScore: number, completion: number) => void;
  playSound: (type: 'correct' | 'wrong' | 'complete') => void;
}

export default function FillInTheBlanks({ 
  text, 
  onComplete, 
  playSound 
}: FillInTheBlanksProps) {
  // Split text into multiple questions (separated by \n\n)
  const questions = text.split(/\n\n+/).filter(q => q.trim().length > 0);

  // Parse text to extract blanks (marked with *)
  const parseBlanks = (text: string) => {
    const parts: Array<{ type: 'text' | 'blank', content: string, blankIndex?: number }> = [];
    const regex = /\*([^*]+)\*/g;
    let lastIndex = 0;
    let match;
    let blankIndex = 0;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push({ type: 'text', content: text.substring(lastIndex, match.index) });
      }
      const answer = match[1];
      parts.push({ type: 'blank', content: answer, blankIndex: blankIndex++ });
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push({ type: 'text', content: text.substring(lastIndex) });
    }

    return parts;
  };

  // Parse all questions
  const allQuestionsData = questions.map((q, qIdx) => {
    const parts = parseBlanks(q);
    const blanks = parts.filter(p => p.type === 'blank');
    return { questionText: q, parts, blanks, questionIndex: qIdx };
  });

  // Calculate total blanks across all questions
  const totalBlanks = allQuestionsData.reduce((sum, q) => sum + q.blanks.length, 0);
  
  // Get current question index (if multiple questions, show one at a time)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const currentQuestion = allQuestionsData[currentQuestionIndex];
  const allParts = currentQuestion?.parts || [];
  const blanks = currentQuestion?.blanks || [];

  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [results, setResults] = useState<{ [key: string]: boolean | null }>({});
  const [submitted, setSubmitted] = useState(false);
  const [completed, setCompleted] = useState(false);
  const inputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  // Get unique key for blank (questionIndex + blankIndex)
  const getBlankKey = (questionIndex: number, blankIndex: number) => {
    return `${questionIndex}-${blankIndex}`;
  };

  // Calculate input width based on correct answer length
  const getInputWidth = (blankIndex: number) => {
    const correctAnswer = blanks[blankIndex]?.content || '';
    // Minimum width based on character count, with some padding
    const charCount = correctAnswer.length;
    // Each Arabic character is approximately 1.2em, plus padding
    return Math.max(charCount * 1.5 + 2, 8) + 'ch';
  };

  // Generate placeholder with dashes matching word length (with spaces)
  const getPlaceholder = (blankIndex: number) => {
    const correctAnswer = blanks[blankIndex]?.content || '';
    const charCount = Math.max(correctAnswer.length, 3);
    // Return "- - -" pattern based on character count
    return Array(charCount).fill('-').join(' ');
  };

  // Handle input change
  const handleInputChange = (questionIndex: number, blankIndex: number, value: string) => {
    const key = getBlankKey(questionIndex, blankIndex);
    setAnswers({ ...answers, [key]: value });
    // Clear result when user starts typing again
    if (results[key] !== null) {
      setResults({ ...results, [key]: null });
    }
  };

  // Handle check answers for current question
  const handleCheckAnswers = () => {
    const newResults: { [key: string]: boolean } = { ...results };
    let questionCorrect = true;

    blanks.forEach((blank, idx) => {
      const key = getBlankKey(currentQuestionIndex, idx);
      const userAnswer = (answers[key] || '').trim().toLowerCase();
      const correctAnswer = blank.content.trim().toLowerCase();
      const isCorrect = userAnswer === correctAnswer;
      newResults[key] = isCorrect;
      if (!isCorrect) questionCorrect = false;
    });

    setResults(newResults);
    setSubmitted(true);

    // Play sound based on result
    const correctCount = blanks.filter((_, idx) => {
      const key = getBlankKey(currentQuestionIndex, idx);
      return newResults[key] === true;
    }).length;
    const percentage = (correctCount / blanks.length) * 100;
    
    if (questionCorrect) {
      playSound('correct');
    } else {
      playSound('wrong');
    }
  };

  // Handle next question
  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSubmitted(false);
      // Clear answers for next question (optional - keep them for reference)
    } else {
      // All questions completed
      const totalCorrect = Object.values(results).filter(r => r === true).length;
      const totalPercentage = (totalCorrect / totalBlanks) * 100;
      playSound('complete');
      setCompleted(true);
      if (onComplete) {
        onComplete(totalCorrect, totalBlanks, totalPercentage);
      }
    }
  };

  // Show final results
  if (completed) {
    const correctCount = Object.values(results).filter(r => r === true).length;
    const percentage = (correctCount / totalBlanks) * 100;

    return (
      <div className="bg-gradient-to-br from-blue-50 to-blue-50 dark:from-blue-900/30 dark:to-blue-900/30 rounded-xl shadow-xl">
        <div className="p-8 pb-6 bg-gradient-to-r from-blue-500 to-blue-500 rounded-t-xl">
          <h2 className="text-center text-4xl md:text-5xl font-black text-white drop-shadow-lg">
            النتيجة النهائية: {correctCount} / {totalBlanks}
          </h2>
          <p className="text-center text-2xl md:text-3xl font-bold text-white/90 mt-2">
            ({percentage.toFixed(0)}%)
          </p>
        </div>
        <div className="p-8 md:p-12">
          <div className="space-y-6 md:space-y-8 mb-6">
            {allQuestionsData.map((questionData, qIdx) => (
              <div key={qIdx} className="space-y-4">
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  السؤال {qIdx + 1}:
                </h3>
                {questionData.blanks.map((blank, idx) => {
                  const key = getBlankKey(qIdx, idx);
                  const isCorrect = results[key];
                  return (
                    <motion.div
                      key={key}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: (qIdx * 10 + idx) * 0.1 }}
                      className={`p-6 md:p-8 rounded-xl shadow-md ${
                        isCorrect 
                          ? 'bg-blue-100 dark:bg-blue-900/30' 
                          : 'bg-red-100 dark:bg-red-900/30'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        {isCorrect ? (
                          <CheckCircle className="w-8 h-8 md:w-10 md:h-10 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
                        ) : (
                          <XCircle className="w-8 h-8 md:w-10 md:h-10 text-red-600 dark:text-red-400 flex-shrink-0 mt-1" />
                        )}
                        <div className="flex-1">
                          <p className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-2">
                            {isCorrect ? '✓' : '✗'} إجابتك: <strong className="text-xl md:text-2xl">{answers[key] || '(فارغ)'}</strong>
                          </p>
                          {!isCorrect && (
                            <p className="text-base md:text-lg text-gray-700 dark:text-gray-300">
                              الإجابة الصحيحة: <strong className="text-blue-700 dark:text-blue-400 text-lg md:text-xl">{blank.content}</strong>
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Render text with inline inputs
  if (!currentQuestion) {
    return null;
  }

  // Check if all blanks in current question are answered
  const currentQuestionBlanksAnswered = blanks.every((_, idx) => {
    const key = getBlankKey(currentQuestionIndex, idx);
    return answers[key] && answers[key].trim().length > 0;
  });

  // Check if current question is correct
  const currentQuestionCorrect = submitted && blanks.every((_, idx) => {
    const key = getBlankKey(currentQuestionIndex, idx);
    return results[key] === true;
  });

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl">
      {/* Question header */}
      {questions.length > 1 && (
        <div className="p-4 pb-2 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-end">
            <Badge variant="secondary" className="text-lg px-4 py-2">
              السؤال {currentQuestionIndex + 1} / {questions.length}
            </Badge>
          </div>
        </div>
      )}
      <div className="p-6 md:p-8">
        {/* Display question text with inline inputs - centered */}
        <div className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-white leading-relaxed p-6 md:p-10 bg-gray-50 dark:bg-gray-900 rounded-xl min-h-[250px] md:min-h-[350px] flex items-center justify-center">
          <div className="w-full max-w-4xl mx-auto text-center" dir="rtl">
            {allParts.map((part, idx) => {
              if (part.type === 'text') {
                return <span key={idx} className="inline">{part.content}</span>;
              } else {
                const blankIdx = part.blankIndex!;
                const key = getBlankKey(currentQuestionIndex, blankIdx);
                const correctAnswer = part.content;
                const userAnswer = answers[key] || '';
                const isCorrect = results[key];
                const showResult = submitted && results[key] !== null;

                return (
                  <span key={idx} className="inline-flex items-center gap-1 mx-1 align-middle">
                    <Input
                      ref={(el) => {
                        inputRefs.current[key] = el;
                      }}
                      value={userAnswer}
                      onChange={(e) => handleInputChange(currentQuestionIndex, blankIdx, e.target.value)}
                      onKeyDown={(e) => {
                        // Navigate to next input on Enter or Tab
                        if (e.key === 'Enter' || e.key === 'Tab') {
                          e.preventDefault();
                          const nextBlankIdx = blankIdx + 1;
                          if (nextBlankIdx < blanks.length) {
                            const nextKey = getBlankKey(currentQuestionIndex, nextBlankIdx);
                            inputRefs.current[nextKey]?.focus();
                          }
                        }
                      }}
                      placeholder={getPlaceholder(blankIdx)}
                      dir="rtl"
                      disabled={submitted}
                      className={`
                        inline-block text-center font-semibold text-lg md:text-xl
                        px-3 py-2
                        bg-white dark:bg-slate-700
                        text-gray-900 dark:text-white
                        placeholder:text-gray-400 dark:placeholder:text-gray-500
                        transition-all duration-200
                        shadow-sm
                        ${showResult 
                          ? isCorrect 
                            ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' 
                            : 'ring-2 ring-red-500 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                          : submitted 
                            ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed'
                            : 'focus:ring-2 focus:ring-purple-500/50'
                        }
                        rounded-md
                      `}
                      style={{
                        width: getInputWidth(blankIdx),
                      }}
                    />
                    {showResult && !isCorrect && (
                      <span className="text-red-600 dark:text-red-400 text-base md:text-lg font-bold inline-block" title={`الصحيح: ${correctAnswer}`}>
                        ✗
                      </span>
                    )}
                    {showResult && isCorrect && (
                      <span className="text-blue-600 dark:text-blue-400 text-base md:text-lg font-bold inline-block">
                        ✓
                      </span>
                    )}
                  </span>
                );
              }
            })}
          </div>
        </div>

        {/* Submit button */}
        <div className="mt-6 flex justify-center gap-4">
          {!submitted && (
            <Button 
              onClick={handleCheckAnswers}
              disabled={!currentQuestionBlanksAnswered}
              size="lg"
              className="px-8 py-4 text-lg md:text-xl font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              التحقق من الإجابات
            </Button>
          )}
        </div>

        {/* Show results after submission */}
        {submitted && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`mt-6 p-6 rounded-xl shadow-lg ${
              currentQuestionCorrect 
                ? 'bg-blue-50 dark:bg-blue-900/30 ring-2 ring-blue-500' 
                : 'bg-red-50 dark:bg-red-900/30 ring-2 ring-red-500'
            }`}
          >
            <div className="flex items-center gap-3 mb-4">
              {currentQuestionCorrect ? (
                <>
                  <CheckCircle className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  <h3 className="text-2xl md:text-3xl font-bold text-blue-700 dark:text-blue-300">
                    إجابة صحيحة! 🎉
                  </h3>
                </>
              ) : (
                <>
                  <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                  <h3 className="text-2xl md:text-3xl font-bold text-red-700 dark:text-red-300">
                    إجابة خاطئة
                  </h3>
                </>
              )}
            </div>
            <p className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white mb-4">
              الإجابات الصحيحة: {blanks.filter((_, idx) => {
                const key = getBlankKey(currentQuestionIndex, idx);
                return results[key] === true;
              }).length} / {blanks.length}
            </p>
            {!currentQuestionCorrect && (
              <div className="mt-4 space-y-2">
                <p className="text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  الإجابات الخاطئة:
                </p>
                {blanks.map((blank, idx) => {
                  const key = getBlankKey(currentQuestionIndex, idx);
                  const isCorrect = results[key];
                  if (!isCorrect) {
                    return (
                      <div key={key} className="p-3 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                        <p className="text-sm md:text-base text-gray-700 dark:text-gray-300">
                          إجابتك: <span className="font-bold text-red-600 dark:text-red-400">{answers[key] || '(فارغ)'}</span>
                        </p>
                        <p className="text-sm md:text-base text-gray-700 dark:text-gray-300">
                          الإجابة الصحيحة: <span className="font-bold text-blue-600 dark:text-blue-400">{blank.content}</span>
                        </p>
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            )}
            
            {/* Action buttons after showing results */}
            <div className="mt-6 flex justify-center gap-4">
              {currentQuestionIndex < questions.length - 1 ? (
                <Button 
                  onClick={handleNextQuestion}
                  size="lg"
                  className="px-8 py-4 text-lg md:text-xl font-bold rounded-xl shadow-lg hover:shadow-xl transition-all bg-blue-600 hover:bg-blue-700"
                >
                  السؤال التالي →
                </Button>
              ) : (
                <Button 
                  onClick={handleNextQuestion}
                  size="lg"
                  className="px-8 py-4 text-lg md:text-xl font-bold rounded-xl shadow-lg hover:shadow-xl transition-all bg-blue-600 hover:bg-blue-700"
                >
                  عرض النتيجة النهائية
                </Button>
              )}
              {!currentQuestionCorrect && (
                <Button 
                  onClick={() => setSubmitted(false)}
                  size="lg"
                  variant="outline"
                  className="px-8 py-4 text-lg md:text-xl font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                  إعادة المحاولة
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

