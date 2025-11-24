'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  Calendar,
  BookOpen,
  Eye,
  DollarSign,
  Search,
  FlaskConical,
  User
} from 'lucide-react';
import { toast } from 'sonner';
import { knowledgeLabApi, type KnowledgeLab } from '@/lib/api/knowledge-lab';

interface KnowledgeLabRequestsTabProps {
  onShowLabDetails: (lab: KnowledgeLab) => void;
  onShowApproval: (lab: KnowledgeLab) => void;
  onShowRejection: (lab: KnowledgeLab) => void;
}

const KnowledgeLabRequestsTab: React.FC<KnowledgeLabRequestsTabProps> = ({ 
  onShowLabDetails, 
  onShowApproval, 
  onShowRejection
}) => {
  const [pendingLabs, setPendingLabs] = useState<KnowledgeLab[]>([]);
  const [approvedLabs, setApprovedLabs] = useState<KnowledgeLab[]>([]);
  const [rejectedLabs, setRejectedLabs] = useState<KnowledgeLab[]>([]);
  
  const [pendingLoading, setPendingLoading] = useState(false);
  const [approvedLoading, setApprovedLoading] = useState(false);
  const [rejectedLoading, setRejectedLoading] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [activeStatusTab, setActiveStatusTab] = useState<'pending' | 'approved' | 'rejected'>('pending');

  // Fetch labs by status
  const fetchLabs = async (
    status: 'pending' | 'approved' | 'rejected',
    setLoading: (loading: boolean) => void,
    setLabs: (labs: KnowledgeLab[]) => void
  ) => {
    try {
      setLoading(true);
      const response = await knowledgeLabApi.listLabs({
        status,
        search: searchTerm || undefined,
        ordering: '-created_at',
      });
      
      if (response.success && response.data) {
        setLabs(response.data.results || []);
      } else {
        console.error(`Error fetching ${status} knowledge labs:`, response.error);
        toast.error(`فشل في تحميل مختبرات المعرفة ${status === 'pending' ? 'المعلقة' : status === 'approved' ? 'المعتمدة' : 'المرفوضة'}`);
        setLabs([]);
      }
    } catch (error) {
      console.error(`Error fetching ${status} knowledge labs:`, error);
      toast.error(`فشل في تحميل مختبرات المعرفة ${status === 'pending' ? 'المعلقة' : status === 'approved' ? 'المعتمدة' : 'المرفوضة'}`);
      setLabs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLabs('pending', setPendingLoading, setPendingLabs);
    fetchLabs('approved', setApprovedLoading, setApprovedLabs);
    fetchLabs('rejected', setRejectedLoading, setRejectedLabs);
  }, [searchTerm]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge className="bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700">
            <Clock className="w-3 h-3 mr-1" />
            قيد المراجعة
          </Badge>
        );
      case 'approved':
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700">
            <CheckCircle className="w-3 h-3 mr-1" />
            معتمدة
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-700">
            <XCircle className="w-3 h-3 mr-1" />
            مرفوضة
          </Badge>
        );
      default:
        return null;
    }
  };

  const renderLabCard = (lab: KnowledgeLab) => (
    <motion.div
      key={lab.id}
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -30, scale: 0.9 }}
      transition={{ type: 'spring', damping: 18, stiffness: 280 }}
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
      className="h-full"
    >
      {/* Card Container */}
      <div className="h-full rounded-2xl overflow-hidden bg-white dark:bg-slate-800 shadow-md hover:shadow-xl transition-all duration-300 border border-slate-200/50 dark:border-slate-700/50 flex flex-col">
        
        {/* Image/Thumbnail Section */}
        <div className="relative w-full h-40 bg-gradient-to-br from-purple-400 via-indigo-400 to-purple-500 dark:from-purple-600 dark:via-indigo-600 dark:to-purple-700 overflow-hidden group">
          {/* Decorative Pattern */}
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" viewBox="0 0 400 160">
              <defs>
                <pattern id="dots-purple" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                  <circle cx="20" cy="20" r="2" fill="currentColor" />
                </pattern>
              </defs>
              <rect width="400" height="160" fill="url(#dots-purple)" />
            </svg>
          </div>

          {/* Icon Overlay */}
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="text-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, type: 'spring' }}
              >
                <FlaskConical className="w-12 h-12 text-white/90 mx-auto mb-2" />
              </motion.div>
            </div>
          </div>

          {/* Status Badge - Overlay */}
          <div className="absolute top-3 right-3 z-10">
            <motion.div
            >
              {getStatusBadge(lab.status)}
            </motion.div>
          </div>

          {/* Shine Effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
            animate={{ x: ['100%', '-100%'] }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
          />
        </div>

        {/* Content Section */}
        <div className="flex-1 p-5 flex flex-col">
          {/* Title & Description */}
          <div className="mb-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 line-clamp-2 leading-tight mb-2 group-hover:text-purple-600 transition-colors">
              {lab.title}
            </h3>
            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 mb-2">
              <User className="w-3.5 h-3.5" />
              <span>{lab.teacher_name}</span>
            </div>
            {lab.course_title && (
              <p className="text-xs text-slate-500 dark:text-slate-500 mb-1">
                مرتبط بدورة: {lab.course_title}
              </p>
            )}
          </div>

          {/* Description */}
          <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-3 leading-relaxed">
            {lab.description}
          </p>

          {/* Metadata Row */}
          <div className="flex items-center justify-between gap-2 py-3 border-t border-slate-100 dark:border-slate-700 mb-3">
            {/* Price */}
            <div className="flex items-center gap-1">
              {lab.price ? (
                <motion.div 
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30"
                >
                  <DollarSign className="w-3.5 h-3.5 text-purple-700 dark:text-purple-400" />
                  <span className="text-xs font-bold text-purple-900 dark:text-purple-300">{lab.price} ر.س</span>
                </motion.div>
              ) : (
                <span className="text-xs font-bold text-blue-700 dark:text-blue-400 px-2.5 py-1">مجاني</span>
              )}
            </div>

            {/* Date */}
            <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
              <Calendar className="w-3 h-3" />
              <span>
                {new Date(lab.created_at).toLocaleDateString('ar-SA', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>
          </div>

          {/* Questions Count */}
          {lab.questions_count && (
            <div className="mb-3 text-xs text-slate-600 dark:text-slate-400">
              <span className="font-semibold">عدد الأسئلة:</span> {lab.questions_count}
            </div>
          )}

          {/* Action buttons grid */}
          <div className="mt-auto flex flex-col gap-2 pt-3 border-t border-slate-100 dark:border-slate-700">
            {/* Primary CTA Button */}
            <motion.button
              onClick={() => onShowLabDetails(lab)}
              className="w-full py-2.5 px-3 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white rounded-lg font-semibold text-sm transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              <Eye className="w-4 h-4" />
              عرض التفاصيل
            </motion.button>

            {/* Status-specific actions */}
            {lab.status === 'pending' && (
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onShowApproval(lab)}
                  className="flex-1 py-2 px-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 text-blue-700 dark:text-blue-400 rounded-lg font-semibold text-xs transition-all border border-blue-200/50 dark:border-blue-700/50 flex items-center justify-center gap-1.5"
                >
                  <CheckCircle className="w-4 h-4" />
                  اعتماد
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onShowRejection(lab)}
                  className="flex-1 py-2 px-2 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-700 dark:text-red-400 rounded-lg font-semibold text-xs transition-all border border-red-200/50 dark:border-red-700/50 flex items-center justify-center gap-1.5"
                >
                  <XCircle className="w-4 h-4" />
                  رفض
                </motion.button>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderLabsList = (labs: KnowledgeLab[], loading: boolean, emptyMessage: string) => {
    if (loading) {
      return (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-16 gap-4"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          >
            <RefreshCw className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          </motion.div>
          <span className="text-slate-600 dark:text-slate-400 text-sm font-medium">جاري التحميل...</span>
        </motion.div>
      );
    }

    if (labs.length === 0) {
      return (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-16 px-6"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 15 }}
            className="mb-4"
          >
            <FlaskConical className="w-16 h-16 mx-auto text-purple-200 dark:text-purple-900/50 mb-4" />
          </motion.div>
          <p className="text-slate-600 dark:text-slate-400 font-medium">{emptyMessage}</p>
          <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">جرب البحث أو تحديث الصفحة</p>
        </motion.div>
      );
    }

    return (
      <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" dir="rtl">
        <AnimatePresence>
          {labs.map((lab, index) => (
            <motion.div
              key={lab.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ delay: index * 0.05 }}
            >
              {renderLabCard(lab)}
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Search Bar */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex items-center gap-3"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-500 w-5 h-5" />
          <Input
            placeholder="بحث في مختبرات المعرفة..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border-purple-200/50 dark:border-purple-900/30 focus:border-purple-500 dark:focus:border-purple-600 transition-colors"
          />
        </div>
        <motion.div
        >
          <Button
            variant="primary"
            onClick={() => {
              fetchLabs('pending', setPendingLoading, setPendingLabs);
              fetchLabs('approved', setApprovedLoading, setApprovedLabs);
              fetchLabs('rejected', setRejectedLoading, setRejectedLabs);
            }}
            className="text-xs flex items-center gap-1"
          >
            <RefreshCw className="w-4 h-4" />
            تحديث
          </Button>
        </motion.div>
      </motion.div>

      {/* Status Tabs */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Tabs value={activeStatusTab} onValueChange={(v) => setActiveStatusTab(v as any)}>
          <TabsList className="grid w-full grid-cols-3 bg-gradient-to-r from-purple-50/50 to-indigo-50/50 dark:from-purple-950/20 dark:to-indigo-950/20 border border-purple-200/30 dark:border-purple-800/30 p-1.5 rounded-lg">
            <TabsTrigger 
              value="pending"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-400 data-[state=active]:to-indigo-500 data-[state=active]:text-white transition-all flex items-center gap-1.5"
            >
              <Clock className="w-4 h-4" />
              <span className="hidden sm:inline">قيد المراجعة</span>
              <span className="sm:hidden">معلقة</span> ({pendingLabs.length})
            </TabsTrigger>
            <TabsTrigger 
              value="approved"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-400 data-[state=active]:to-teal-500 data-[state=active]:text-white transition-all flex items-center gap-1.5"
            >
              <CheckCircle className="w-4 h-4" />
              <span className="hidden sm:inline">معتمدة</span>
              <span className="sm:hidden">مقبول</span> ({approvedLabs.length})
            </TabsTrigger>
            <TabsTrigger 
              value="rejected"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-400 data-[state=active]:to-red-500 data-[state=active]:text-white transition-all flex items-center gap-1.5"
            >
              <XCircle className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">مرفوضة</span>
              <span className="sm:hidden">مرفوض</span> ({rejectedLabs.length})
            </TabsTrigger>
          </TabsList>

          <motion.div
            key={activeStatusTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            <TabsContent value="pending" className="mt-6">
              {renderLabsList(
                pendingLabs,
                pendingLoading,
                'لا توجد مختبرات معرفة معلقة حالياً'
              )}
            </TabsContent>

            <TabsContent value="approved" className="mt-6">
              {renderLabsList(
                approvedLabs,
                approvedLoading,
                'لا توجد مختبرات معرفة معتمدة حالياً'
              )}
            </TabsContent>

            <TabsContent value="rejected" className="mt-6">
              {renderLabsList(
                rejectedLabs,
                rejectedLoading,
                'لا توجد مختبرات معرفة مرفوضة حالياً'
              )}
            </TabsContent>
          </motion.div>
        </Tabs>
      </motion.div>
    </div>
  );
};

export default KnowledgeLabRequestsTab;

