'use client';

import { useEffect, useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { QuestionCard } from './QuestionCard';
import { toast } from 'sonner';
import { Search, Plus } from 'lucide-react';
import { Question, QuestionType, PaginatedQuestionsResponse } from '@/types/knowledge-lab';

interface QuestionListProps {
  labId: string;
  onAddNew?: () => void;
  onEdit?: (question: Question) => void;
  refreshTrigger?: number;
}

export function QuestionList({
  labId,
  onAddNew,
  onEdit,
  refreshTrigger = 0,
}: QuestionListProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [questionType, setQuestionType] = useState<QuestionType | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchQuestions = async (page = 1) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const API_BASE_URL =
        process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:8000/api';

      const params = new URLSearchParams({
        knowledge_lab: labId,
        page: page.toString(),
      });

      if (questionType !== 'all') {
        params.append('question_type', questionType);
      }

      const response = await fetch(
        `${API_BASE_URL}/knowledge-lab/questions/?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      const data: PaginatedQuestionsResponse = await response.json();

      if (response.ok) {
        setQuestions(data.results);
        setTotalCount(data.count);
        setTotalPages(Math.ceil(data.count / 10)); // API returns 10 items per page
      } else {
        toast.error('فشل في تحميل الأسئلة');
      }
    } catch (error) {
      console.error('❌ Error:', error);
      toast.error('حدث خطأ في الاتصال');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions(1);
    setCurrentPage(1);
  }, [labId, questionType, refreshTrigger]);

  useEffect(() => {
    if (searchTerm === '') {
      fetchQuestions(currentPage);
    }
  }, [currentPage]);

  // Client-side search filtering
  const filteredQuestions = questions.filter(q =>
    (q.question_text || q.text || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header with Add Button */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">الأسئلة</h3>
        <Button
          onClick={onAddNew}
          className="bg-amber-600 hover:bg-amber-700"
          dir="rtl"
        >
          <Plus className="w-4 h-4 mr-2" />
          إضافة سؤال جديد
        </Button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute right-3 top-3 text-gray-400" />
          <Input
            placeholder="ابحث عن السؤال..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pr-9"
          />
        </div>

        {/* Question Type Filter */}
        <Select
          value={questionType}
          onValueChange={(val: any) => {
            setQuestionType(val);
            setCurrentPage(1);
          }}
        >
          <SelectTrigger dir="rtl" className="text-right">
            <SelectValue placeholder="اختر نوع السؤال" />
          </SelectTrigger>
          <SelectContent dir="rtl" className="text-right">
            <SelectItem value="all" className="text-right cursor-pointer">جميع الأنواع</SelectItem>
            <SelectItem value="multiple_choice" className="text-right cursor-pointer">الاختيار من متعدد</SelectItem>
            <SelectItem value="true_false" className="text-right cursor-pointer">صحيح / خطأ</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="text-sm text-gray-600">
        إجمالي الأسئلة: <span className="font-semibold">{totalCount}</span>
      </div>

      {/* Questions List */}
      {loading ? (
        <div className="text-center py-8 text-gray-500">جاري التحميل...</div>
      ) : filteredQuestions.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {searchTerm ? 'لا توجد نتائج للبحث' : 'لا توجد أسئلة حتى الآن'}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredQuestions.map((question) => (
            <QuestionCard
              key={question.id}
              question={question}
              onEdit={onEdit}
              onDelete={() => fetchQuestions(currentPage)}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>

            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const page = i + 1;
              return (
                <PaginationItem key={page}>
                  <PaginationLink
                    onClick={() => setCurrentPage(page)}
                    isActive={currentPage === page}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              );
            })}

            <PaginationItem>
              <PaginationNext
                onClick={() =>
                  setCurrentPage(p => Math.min(p + 1, totalPages))
                }
                className={
                  currentPage === totalPages ? 'pointer-events-none opacity-50' : ''
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
