'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FlaskConical, 
  User, 
  Calendar, 
  DollarSign, 
  CheckCircle, 
  XCircle, 
  Clock,
  BookOpen,
  Target,
  Tag,
  MapPin,
  GraduationCap,
  FileText
} from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { knowledgeLabApi, type KnowledgeLab } from '@/lib/api/knowledge-lab';
import { motion } from 'framer-motion';

interface KnowledgeLabDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lab: KnowledgeLab | null;
  onApprove?: (lab: KnowledgeLab, notes?: string, commission?: string) => void;
  onReject?: (lab: KnowledgeLab, reason?: string) => void;
}

const KnowledgeLabDetailsModal: React.FC<KnowledgeLabDetailsModalProps> = ({
  isOpen,
  onClose,
  lab,
  onApprove,
  onReject
}) => {
  const [labDetails, setLabDetails] = useState<KnowledgeLab | null>(lab);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && lab) {
      loadLabDetails();
    } else {
      setLabDetails(lab);
    }
  }, [isOpen, lab]);

  const loadLabDetails = async () => {
    if (!lab) return;

    try {
      setLoading(true);
      const response = await knowledgeLabApi.getLab(lab.id);
      
      if (response.success && response.data) {
        setLabDetails(response.data);
      } else {
        console.error('Error loading lab details:', response.error);
        setLabDetails(lab); // Fallback to provided lab data
      }
    } catch (error) {
      console.error('Error fetching lab details:', error);
      setLabDetails(lab); // Fallback to provided lab data
    } finally {
      setLoading(false);
    }
  };

  if (!labDetails) return null;

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
          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700">
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] bg-white/98 dark:bg-slate-900/98 backdrop-blur-xl border-2 border-purple-200/60 dark:border-purple-700/40 shadow-2xl rounded-3xl overflow-hidden p-0">
        {/* Header */}
        <DialogHeader className="relative bg-gradient-to-r from-purple-500 via-indigo-600 to-purple-500 dark:from-purple-600 dark:via-indigo-700 dark:to-purple-600 p-8 rounded-t-3xl z-10">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/30 via-indigo-600/30 to-purple-600/30 dark:from-purple-700/15 dark:via-indigo-700/15 dark:to-purple-700/15" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent_70%)]" />
          
          <div className="relative flex items-start gap-6">
            <motion.div
              whileHover={{ rotate: 10 }}
              className="relative flex-shrink-0"
            >
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0.8, 0.5]
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 bg-white/40 rounded-full blur-xl"
              />
              <div className="relative w-20 h-20 bg-white/25 backdrop-blur-md rounded-2xl flex items-center justify-center border-2 border-white/40 shadow-xl">
                <FlaskConical className="w-10 h-10 text-white" />
              </div>
            </motion.div>
            
            <div className="flex-1">
              <DialogTitle className="text-3xl font-extrabold text-white mb-3 flex items-center gap-3">
                <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/30">
                  {labDetails.title}
                </span>
                <div className="ml-auto">
                  {getStatusBadge(labDetails.status)}
                </div>
              </DialogTitle>
              <DialogDescription className="text-purple-100 text-lg font-semibold">
                تفاصيل مختبر المعرفة
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="relative p-8 space-y-6 overflow-y-auto max-h-[calc(90vh-280px)] z-10">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Spinner size="lg" />
            </div>
          ) : (
            <>
              {/* Lab Info Card */}
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="bg-gradient-to-br from-purple-50 via-indigo-50/80 to-purple-50 dark:from-purple-900/25 dark:via-indigo-900/15 dark:to-purple-900/25 p-6 rounded-3xl border-2 border-purple-200/60 dark:border-purple-700/40 shadow-xl"
              >
                <div className="flex items-start gap-6">
                  <motion.div
                    whileHover={{ rotate: 5 }}
                    className="relative flex-shrink-0"
                  >
                    <div className="relative w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-600 dark:from-purple-600 dark:to-indigo-700 rounded-2xl flex items-center justify-center shadow-2xl">
                      <FlaskConical className="w-10 h-10 text-white" />
                    </div>
                  </motion.div>
                  
                  <div className="flex-1 min-w-0 space-y-3">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-3 leading-tight">
                        {labDetails.title}
                      </h3>
                      {labDetails.description && (
                        <p className="text-gray-600 dark:text-slate-400 text-sm leading-relaxed">
                          {labDetails.description}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-3 text-sm">
                      <div className="flex items-center gap-2 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-purple-200/40 dark:border-purple-700/30">
                        <User className="w-4 h-4 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                        <span className="font-semibold text-gray-700 dark:text-slate-300">المعلم:</span>
                        <span className="text-gray-900 dark:text-slate-100 font-medium truncate">{labDetails.teacher_name || 'غير معروف'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Statistics Grid */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.4 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-4"
              >
                <motion.div
                  whileHover={{ y: -4 }}
                  className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-4 rounded-2xl border-2 border-purple-200/40 dark:border-purple-700/30 shadow-md hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    <span className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase">الأسئلة</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900 dark:text-slate-100">{labDetails.questions_count || '0'}</p>
                </motion.div>
                
                <motion.div
                  whileHover={{ y: -4 }}
                  className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-4 rounded-2xl border-2 border-blue-200/40 dark:border-blue-700/30 shadow-md hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <span className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase">السعر</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900 dark:text-slate-100">
                    {labDetails.price ? `${labDetails.price} ر.س` : 'مجاني'}
                  </p>
                </motion.div>
                
                <motion.div
                  whileHover={{ y: -4 }}
                  className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-4 rounded-2xl border-2 border-amber-200/40 dark:border-amber-700/30 shadow-md hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    <span className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase">تاريخ الإنشاء</span>
                  </div>
                  <p className="text-sm font-bold text-gray-900 dark:text-slate-100 leading-tight">
                    {new Date(labDetails.created_at).toLocaleDateString('ar-SA', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </motion.div>

                <motion.div
                  whileHover={{ y: -4 }}
                  className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-4 rounded-2xl border-2 border-emerald-200/40 dark:border-emerald-700/30 shadow-md hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase">النوع</span>
                  </div>
                  <p className="text-sm font-bold text-gray-900 dark:text-slate-100">
                    {labDetails.is_standalone ? 'مستقل' : 'مرتبط بدورة'}
                  </p>
                </motion.div>
              </motion.div>

              {/* Additional Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {labDetails.objective && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                    className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-5 rounded-2xl border-2 border-purple-200/40 dark:border-purple-700/30 shadow-md"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Target className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      <h4 className="font-bold text-gray-900 dark:text-slate-100">الهدف</h4>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-slate-300 leading-relaxed">
                      {labDetails.objective}
                    </p>
                  </motion.div>
                )}

                {labDetails.topics && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                    className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-5 rounded-2xl border-2 border-indigo-200/40 dark:border-indigo-700/30 shadow-md"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Tag className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      <h4 className="font-bold text-gray-900 dark:text-slate-100">المواضيع</h4>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-slate-300 leading-relaxed">
                      {labDetails.topics}
                    </p>
                  </motion.div>
                )}

                {labDetails.course_title && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.4 }}
                    className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-5 rounded-2xl border-2 border-emerald-200/40 dark:border-emerald-700/30 shadow-md"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <BookOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      <h4 className="font-bold text-gray-900 dark:text-slate-100">الدورة المرتبطة</h4>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-slate-300 leading-relaxed">
                      {labDetails.course_title}
                    </p>
                  </motion.div>
                )}

                {labDetails.country && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.4 }}
                    className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-5 rounded-2xl border-2 border-blue-200/40 dark:border-blue-700/30 shadow-md"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <h4 className="font-bold text-gray-900 dark:text-slate-100">البلد</h4>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-slate-300 leading-relaxed">
                      {labDetails.country}
                    </p>
                  </motion.div>
                )}
              </div>

              {/* Rejection Reason (if rejected) */}
              {labDetails.status === 'rejected' && labDetails.rejection_reason && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.4 }}
                  className="bg-red-50/80 dark:bg-red-900/20 border-2 border-red-200/50 dark:border-red-700/30 rounded-2xl p-5 shadow-md"
                >
                  <div className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-bold text-red-800 dark:text-red-300 mb-2">سبب الرفض</h4>
                      <p className="text-sm text-red-700 dark:text-red-400 leading-relaxed">
                        {labDetails.rejection_reason}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Approval Info (if approved) */}
              {labDetails.status === 'approved' && labDetails.approved_at && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.4 }}
                  className="bg-emerald-50/80 dark:bg-emerald-900/20 border-2 border-emerald-200/50 dark:border-emerald-700/30 rounded-2xl p-5 shadow-md"
                >
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-bold text-emerald-800 dark:text-emerald-300 mb-2">معلومات الموافقة</h4>
                      <p className="text-sm text-emerald-700 dark:text-emerald-400 leading-relaxed">
                        تم الاعتماد في: {new Date(labDetails.approved_at).toLocaleDateString('ar-SA', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      {labDetails.platform_commission_percentage && (
                        <p className="text-sm text-emerald-700 dark:text-emerald-400 mt-1">
                          نسبة عمولة المنصة: {labDetails.platform_commission_percentage}%
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="relative bg-gradient-to-r from-white/95 via-gray-50/95 to-white/95 dark:from-slate-900/95 dark:via-slate-800/95 dark:to-slate-900/95 backdrop-blur-sm border-t-2 border-gray-200/60 dark:border-slate-700/40 p-6 rounded-b-3xl z-10">
          <div className="flex gap-4 w-full justify-between">
            <Button
              variant="outline"
              onClick={onClose}
              className="border-2 border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 font-semibold px-8 py-3 text-base"
            >
              إغلاق
            </Button>

            {labDetails.status === 'pending' && (
              <div className="flex gap-3">
                {onReject && (
                  <Button
                    onClick={() => {
                      onReject(labDetails);
                      onClose();
                    }}
                    variant="destructive"
                    className="bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white border-0 shadow-xl hover:shadow-2xl font-bold px-8 py-3 text-base"
                  >
                    <XCircle className="w-5 h-5 ml-2" />
                    رفض
                  </Button>
                )}
                {onApprove && (
                  <Button
                    onClick={() => {
                      onApprove(labDetails);
                      onClose();
                    }}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-0 shadow-xl hover:shadow-2xl font-bold px-8 py-3 text-base"
                  >
                    <CheckCircle className="w-5 h-5 ml-2" />
                    اعتماد
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default KnowledgeLabDetailsModal;



















