'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { 
  FileQuestion, CheckCircle, XCircle, 
  ArrowRight, ArrowLeft, RotateCcw, Lightbulb, Play
} from 'lucide-react';
import { Question } from '@/types/knowledge-lab';

interface QuestionsPracticeTabProps {
  labId: string;
}

export function QuestionsPracticeTab({ labId }: QuestionsPracticeTabProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [practiceMode, setPracticeMode] = useState(false);
  const [revealedAnswers, setRevealedAnswers] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchQuestions();
  }, [labId]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      const API_BASE_URL = process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:8000/api';
      const apiUrl = `${API_BASE_URL}/knowledge-lab/questions/?knowledge_lab=${labId}&practice=true`;
      
      console.log('📚 Fetching questions from:', apiUrl);

      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📚 Response status:', response.status);
      console.log('📚 Response ok:', response.ok);

      if (response.ok) {
        const data = await response.json();
        const questionsList = data.results || data || [];
        console.log('📚 Questions loaded for practice:', questionsList.length);
        console.log('📚 Full API Response:', data);
        console.log('📚 First question full:', questionsList[0]);
        console.log('📚 First question correct_answer:', questionsList[0]?.correct_answer);
        console.log('📚 First question correct_answer type:', typeof questionsList[0]?.correct_answer);
        console.log('📚 First question keys:', questionsList[0] ? Object.keys(questionsList[0]) : 'No question');
        
        // Verify correct_answer is present
        if (questionsList.length > 0 && !questionsList[0]?.correct_answer) {
          console.warn('⚠️ WARNING: correct_answer is missing from API response!');
          console.warn('⚠️ Check if practice=true parameter is being sent correctly');
          console.warn('⚠️ API URL:', apiUrl);
        }
        
        setQuestions(questionsList);
        
        // Load saved answers from localStorage
        const savedAnswers = localStorage.getItem(`practice_answers_${labId}`);
        if (savedAnswers) {
          try {
            setAnswers(JSON.parse(savedAnswers));
          } catch (e) {
            // Ignore parse errors
          }
        }
      } else {
        toast.error('فشل في تحميل الأسئلة');
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
      toast.error('حدث خطأ في الاتصال');
    } finally {
      setLoading(false);
    }
  };

  const startPractice = () => {
    setPracticeMode(true);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setShowResults(false);
    setScore(0);
    setRevealedAnswers({});
    localStorage.removeItem(`practice_answers_${labId}`);
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    const newAnswers = { ...answers, [questionId]: answer };
    setAnswers(newAnswers);
    // Save to localStorage
    localStorage.setItem(`practice_answers_${labId}`, JSON.stringify(newAnswers));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      checkAnswers();
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const checkAnswers = () => {
    let correctCount = 0;
    let totalPoints = 0;
    let earnedPoints = 0;

    questions.forEach((question) => {
      totalPoints += question.points || 1;
      const userAnswer = answers[question.id];
      
      if (userAnswer) {
        let correctAnswer: string | string[] = question.correct_answer || '';
        
        // Parse correct answer
        if (typeof correctAnswer === 'string') {
          try {
            const parsed = JSON.parse(correctAnswer);
            if (Array.isArray(parsed)) {
              correctAnswer = parsed[0] || '';
            }
          } catch {
            // Keep as string
          }
        } else if (Array.isArray(correctAnswer)) {
          correctAnswer = correctAnswer[0] || '';
        }

        if (String(userAnswer) === String(correctAnswer)) {
          correctCount++;
          earnedPoints += question.points || 1;
        }
      }
    });

    setScore(earnedPoints);
    setShowResults(true);
    toast.success(`تم الإجابة على ${correctCount} من ${questions.length} سؤال بشكل صحيح!`);
  };

  const resetPractice = () => {
    setAnswers({});
    setCurrentQuestionIndex(0);
    setShowResults(false);
    setScore(0);
    setRevealedAnswers({});
    localStorage.removeItem(`practice_answers_${labId}`);
  };

  const revealAnswer = (questionId: string) => {
    setRevealedAnswers(prev => ({ ...prev, [questionId]: true }));
  };

  const getCurrentQuestion = () => {
    return questions[currentQuestionIndex];
  };

  const parseOptions = (question: Question) => {
    let options: any[] = [];
    
    if (question.options) {
      try {
        const parsed = typeof question.options === 'string' 
          ? JSON.parse(question.options) 
          : question.options;
        if (Array.isArray(parsed)) {
          options = parsed.map((opt: any) => {
            if (typeof opt === 'object') {
              return {
                id: opt.id || '',
                text: opt.text || '',
                label: opt.label || opt.id || ''
              };
            }
            return { id: String(opt), text: String(opt), label: String(opt) };
          });
        }
      } catch (e) {
        // Fallback
      }
    }

    // For true/false questions
    if (question.question_type === 'true_false' && options.length === 0) {
      options = [
        { id: 'true', text: 'صح', label: 'أ' },
        { id: 'false', text: 'خطأ', label: 'ب' }
      ];
    }

    return options;
  };

  const getCorrectAnswer = (question: Question): string => {
    console.log('🔍 getCorrectAnswer - Question ID:', question.id);
    console.log('🔍 getCorrectAnswer - correct_answer raw:', question.correct_answer);
    console.log('🔍 getCorrectAnswer - correct_answer type:', typeof question.correct_answer);
    
    let correctAnswer: string | string[] = question.correct_answer || '';
    
    if (!correctAnswer) {
      console.log('❌ No correct_answer found');
      return '';
    }
    
    if (typeof correctAnswer === 'string') {
      try {
        const parsed = JSON.parse(correctAnswer);
        if (Array.isArray(parsed)) {
          const result = parsed[0] || '';
          console.log('✅ Parsed array result:', result);
          return result;
        }
        console.log('✅ Parsed non-array result:', parsed);
        return String(parsed);
      } catch {
        // Keep as string
        console.log('✅ String result:', correctAnswer);
        return correctAnswer;
      }
    } else if (Array.isArray(correctAnswer)) {
      const result = correctAnswer[0] || '';
      console.log('✅ Array result:', result);
      return result;
    }
    
    const result = String(correctAnswer);
    console.log('✅ Final result:', result);
    return result;
  };

  const isAnswerCorrect = (question: Question, answer: string): boolean => {
    const correctAnswer = getCorrectAnswer(question);
    return String(answer) === String(correctAnswer);
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-gray-600">جاري تحميل الأسئلة...</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <Card className="border-orange-100" dir="rtl">
        <CardContent className="p-12 text-center">
          <FileQuestion className="w-16 h-16 mx-auto mb-4 text-orange-300" />
          <p className="text-lg font-semibold text-gray-800 mb-2">لا توجد أسئلة متاحة</p>
          <p className="text-sm text-gray-600">سيتم إضافة الأسئلة قريباً</p>
        </CardContent>
      </Card>
    );
  }

  if (!practiceMode) {
    return (
      <Card className="border-2 border-orange-200" dir="rtl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-orange-600 flex items-center gap-2">
            <FileQuestion className="w-6 h-6" />
            بنك الأسئلة - وضع التدريب
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
            <p className="text-sm text-orange-800 dark:text-orange-200">
              <Lightbulb className="w-4 h-4 inline ml-1" />
              في وضع التدريب، يمكنك حل الأسئلة مباشرة من بنك الأسئلة بدون الحاجة لتمرين. 
              يمكنك الإجابة على الأسئلة والتحقق من الإجابات الصحيحة.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-orange-100">
              <CardContent className="p-4 text-center">
                <FileQuestion className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-orange-600">{questions.length}</p>
                <p className="text-sm text-gray-600">إجمالي الأسئلة</p>
              </CardContent>
            </Card>

            <Card className="border-amber-100">
              <CardContent className="p-4 text-center">
                <CheckCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-amber-600">
                  {Object.keys(answers).length}
                </p>
                <p className="text-sm text-gray-600">أسئلة تم الإجابة عليها</p>
              </CardContent>
            </Card>

            <Card className="border-yellow-100">
              <CardContent className="p-4 text-center">
                <RotateCcw className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                <p className="text-sm font-semibold text-yellow-600">وضع التدريب</p>
                <p className="text-xs text-gray-600">لا يوجد حد زمني</p>
              </CardContent>
            </Card>
          </div>

          <Button
            onClick={startPractice}
            className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-lg py-6"
            size="lg"
          >
            <Play className="w-5 h-5 ml-2" />
            بدء التدريب
          </Button>
        </CardContent>
      </Card>
    );
  }

  const currentQuestion = getCurrentQuestion();
  const options = parseOptions(currentQuestion);
  const userAnswer = answers[currentQuestion.id];
  const correctAnswer = getCorrectAnswer(currentQuestion);
  const answeredCount = Object.keys(answers).length;
  const isAnswerRevealed = revealedAnswers[currentQuestion.id] || false;
  const hasAnswered = !!userAnswer;

  return (
    <div className="space-y-6" dir="rtl">
      {/* Progress Bar */}
      <Card className="border-orange-100">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-700">
              السؤال {currentQuestionIndex + 1} من {questions.length}
            </span>
            <span className="text-sm text-gray-600">
              تم الإجابة على {answeredCount} سؤال
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-orange-500 to-amber-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Question Card */}
      <Card className="border-2 border-orange-200">
        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            <Badge className="bg-orange-100 text-orange-800">
              {currentQuestion.question_type_display || currentQuestion.question_type}
            </Badge>
            <Badge className="bg-amber-100 text-amber-800">
              {currentQuestion.points || 1} نقطة
            </Badge>
          </div>
          <CardTitle className="text-xl font-bold text-gray-800">
            {currentQuestion.text || currentQuestion.question_text}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup
            value={userAnswer || ''}
            onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
          >
            <div className="space-y-3">
              {options.map((option, idx) => {
                const optionId = option.id || String(idx);
                const optionText = option.text || option.label || String(option);
                const isSelected = userAnswer === optionId;
                const isCorrect = optionId === correctAnswer;
                const showResult = (showResults && isSelected) || (isAnswerRevealed && isSelected);
                const isCorrectOption = isAnswerRevealed && isCorrect;

                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      showResult
                        ? isCorrect
                          ? 'bg-blue-50 border-blue-500'
                          : 'bg-red-50 border-red-500'
                        : isCorrectOption
                        ? 'bg-blue-50 border-blue-400'
                        : isSelected
                        ? 'bg-orange-50 border-orange-500'
                        : 'bg-white border-gray-200 hover:border-orange-300'
                    }`}
                  >
                    <Label
                      htmlFor={`option-${idx}`}
                      className="flex items-center gap-3 cursor-pointer"
                    >
                      <RadioGroupItem value={optionId} id={`option-${idx}`} />
                      <div className="flex-1">
                        <span className="font-semibold text-gray-700">
                          {option.label && option.label !== option.id ? `${option.label}. ` : ''}
                          {optionText}
                        </span>
                        {showResult && (
                          <div className="mt-2 flex items-center gap-2">
                            {isCorrect ? (
                              <>
                                <CheckCircle className="w-4 h-4 text-blue-600" />
                                <span className="text-sm text-blue-700 font-medium">إجابة صحيحة ✓</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="w-4 h-4 text-red-600" />
                                <span className="text-sm text-red-700 font-medium">إجابة خاطئة ✗</span>
                              </>
                            )}
                          </div>
                        )}
                        {isCorrectOption && !isSelected && (
                          <div className="mt-2 flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-blue-600" />
                            <span className="text-sm text-blue-700 font-medium">الإجابة الصحيحة</span>
                          </div>
                        )}
                      </div>
                    </Label>
                  </div>
                );
              })}
            </div>
          </RadioGroup>

          {/* Show Answer Button */}
          {hasAnswered && !isAnswerRevealed && (
            <div className="mt-4">
              <Button
                onClick={() => revealAnswer(currentQuestion.id)}
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
                variant="default"
              >
                <Lightbulb className="w-4 h-4 ml-2" />
                عرض الإجابة
              </Button>
            </div>
          )}

          {/* Answer Reveal Section */}
          {(isAnswerRevealed || showResults) && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>الإجابة الصحيحة:</strong> {
                  options.find(opt => (opt.id || '') === correctAnswer)?.text || 
                  options.find(opt => String(opt.id) === String(correctAnswer))?.label ||
                  correctAnswer
                }
              </p>
              {currentQuestion.explanation && (
                <p className="text-sm text-blue-700 mt-2">
                  <strong>الشرح:</strong> {currentQuestion.explanation}
                </p>
              )}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between gap-4 pt-4 border-t">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className="border-orange-200 hover:bg-orange-50"
            >
              <ArrowRight className="w-4 h-4 ml-2" />
              السابق
            </Button>

            <div className="flex gap-2">
              {currentQuestionIndex === questions.length - 1 ? (
                <Button
                  onClick={checkAnswers}
                  disabled={showResults}
                  className="bg-gradient-to-r from-blue-500 to-blue-500 hover:from-blue-600 hover:to-blue-600 text-white"
                >
                  <CheckCircle className="w-4 h-4 ml-2" />
                  التحقق من الإجابات
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white"
                >
                  التالي
                  <ArrowLeft className="w-4 h-4 mr-2" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Card */}
      {showResults && (
        <Card className="border-2 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-blue-700 flex items-center gap-2">
              <CheckCircle className="w-6 h-6" />
              نتائج التدريب
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-white rounded-lg">
                <p className="text-3xl font-bold text-blue-600">{score}</p>
                <p className="text-sm text-gray-600">النقاط المكتسبة</p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg">
                <p className="text-3xl font-bold text-orange-600">
                  {questions.reduce((sum, q) => sum + (q.points || 1), 0)}
                </p>
                <p className="text-sm text-gray-600">إجمالي النقاط</p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg">
                <p className="text-3xl font-bold text-amber-600">
                  {Math.round((score / questions.reduce((sum, q) => sum + (q.points || 1), 0)) * 100)}%
                </p>
                <p className="text-sm text-gray-600">النسبة المئوية</p>
              </div>
            </div>

            <Button
              onClick={resetPractice}
              className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white"
            >
              <RotateCcw className="w-4 h-4 ml-2" />
              إعادة التدريب
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

