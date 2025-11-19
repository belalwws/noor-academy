'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import {
  RefreshCw, Users, BookOpen, GraduationCap, Mail, CheckCircle,
  Video, Edit, Sparkles, X, XCircle, AlertTriangle, UserCheck,
  Calendar, Eye, DollarSign, FlaskConical, Gamepad2
  // FileCheck // HIDDEN: Applications tab uses /accept/ endpoint which doesn't exist in backend
} from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { toast } from 'sonner';
import { generalSupervisorApi } from '@/lib/api/generalSupervisor';
import { recordedCoursesApi } from '@/lib/api/recorded-courses';
import { liveEducationApi } from '@/lib/api/live-education';
import { simpleAuthService } from '@/lib/auth/simpleAuth';
import ProtectedRoute from '@/components/ProtectedRoute';
import SupervisorProfileCompletionBanner from '@/components/SupervisorProfileCompletionBanner';
import { logger } from '@/lib/utils/logger';
import dynamic from 'next/dynamic';
import LiveSessionsSSE from './components/LiveSessionsSSE';
import SupervisorCourseEditRequests from '@/components/SupervisorCourseEditRequests';
import CourseDetailsModal from '@/components/academic-supervisor-profile/CourseDetailsModal';
import CourseComparisonModal from '@/components/CourseComparisonModal';
import RecordedCourseActionModals from './components/RecordedCourseActionModals';
import { Skeleton } from '@/components/ui/skeleton';

// Lazy load tab components for better performance - only load when tab is active
const TeachersTab = dynamic(() => import('./components/TeachersTab'), {
  loading: () => <Skeleton className="h-96 w-full" />,
  ssr: false,
});

const SupervisorsManagementTab = dynamic(() => import('./components/SupervisorsManagementTab'), {
  loading: () => <Skeleton className="h-96 w-full" />,
  ssr: false,
});

const StudentsManagementTab = dynamic(() => import('./components/StudentsManagementTab'), {
  loading: () => <Skeleton className="h-96 w-full" />,
  ssr: false,
});

const CoursesTab = dynamic(() => import('./components/CoursesTab'), {
  loading: () => <Skeleton className="h-96 w-full" />,
  ssr: false,
});

const RecordedCoursesTab = dynamic(() => import('./components/RecordedCoursesTab'), {
  loading: () => <Skeleton className="h-96 w-full" />,
  ssr: false,
});

const PaymentsManagementTab = dynamic(() => import('./components/PaymentsManagementTab'), {
  loading: () => <Skeleton className="h-96 w-full" />,
  ssr: false,
});

const KnowledgeLabRequestsTab = dynamic(() => import('./components/KnowledgeLabRequestsTab'), {
  loading: () => <Skeleton className="h-96 w-full" />,
  ssr: false,
});

const InteractiveGamesTab = dynamic(() => import('./components/InteractiveGamesTab'), {
  loading: () => <Skeleton className="h-96 w-full" />,
  ssr: false,
});

import KnowledgeLabActionModals from './components/KnowledgeLabActionModals';
import KnowledgeLabDetailsModal from './components/KnowledgeLabDetailsModal';
import { knowledgeLabApi, type KnowledgeLab } from '@/lib/api/knowledge-lab';
import { interactiveGamesApi, type InteractiveGame } from '@/lib/api/interactive-games';

// Course Actions Types
interface Course {
  id: string;
  title: string;
  teacher_name: string;
  enrollment_count: number;
  approval_status: string;
  created_at: string;
}

// Types
interface Statistics {
  total_academic_supervisors: number;
  active_academic_supervisors: number;
  pending_invitations: number;
  total_teachers: number;
  total_students: number;
  recent_activities: Array<Record<string, string>>;
}

// Cache for API responses to prevent duplicate requests
const apiCache = new Map<string, { data: any; timestamp: number; ttl: number }>();

const GeneralSupervisorDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<number>(0);
  
  const [stats, setStats] = useState<Statistics>({
    total_academic_supervisors: 0,
    active_academic_supervisors: 0,
    pending_invitations: 0,
    total_teachers: 0,
    total_students: 0,
    recent_activities: []
  });

  const [pendingCoursesCount, setPendingCoursesCount] = useState(0);
  const [pendingTeachersCount, setPendingTeachersCount] = useState(0);
  const [pendingInvitationsCount, setPendingInvitationsCount] = useState(0);
  const [familyRequestsCount, setFamilyRequestsCount] = useState(0);
  const [liveSessionsCount, setLiveSessionsCount] = useState(0);
  const [pendingGamesCount, setPendingGamesCount] = useState(0);

  const [userEmail, setUserEmail] = useState<string>('');
  const [showComingSoonModal, setShowComingSoonModal] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('all-courses');
  
  // Course Details Modal state
  const [showCourseDetailsModal, setShowCourseDetailsModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  
  // Course Comparison Modal state
  const [showCourseComparisonModal, setShowCourseComparisonModal] = useState(false);
  const [selectedEditRequest, setSelectedEditRequest] = useState<any>(null);

  // Course action modals (moved from CoursesTab)
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [platformCommission, setPlatformCommission] = useState('');
  const [confirmDeleteText, setConfirmDeleteText] = useState('');
  const [showSecondDeleteConfirm, setShowSecondDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [coursesTabKey, setCoursesTabKey] = useState(0);
  const [recordedCoursesTabKey, setRecordedCoursesTabKey] = useState(0);
  const [knowledgeLabsTabKey, setKnowledgeLabsTabKey] = useState(0);
  const [isRecordedCourse, setIsRecordedCourse] = useState(false);
  
  // Ref to remove/update course from CoursesTab list
  const removeCourseFromListRef = useRef<{
    remove?: (courseId: string) => void;
    updateVisibility?: (courseId: string, isHidden: boolean) => void;
  } | null>(null);
  
  // Knowledge Lab modals state
  const [selectedKnowledgeLab, setSelectedKnowledgeLab] = useState<KnowledgeLab | null>(null);
  const [showKnowledgeLabDetailsModal, setShowKnowledgeLabDetailsModal] = useState(false);
  const [showKnowledgeLabApprovalModal, setShowKnowledgeLabApprovalModal] = useState(false);
  const [showKnowledgeLabRejectionModal, setShowKnowledgeLabRejectionModal] = useState(false);
  const [knowledgeLabApprovalNotes, setKnowledgeLabApprovalNotes] = useState('');
  const [knowledgeLabPlatformCommission, setKnowledgeLabPlatformCommission] = useState('');
  const [knowledgeLabRejectionReason, setKnowledgeLabRejectionReason] = useState('');
  const [isApprovingKnowledgeLab, setIsApprovingKnowledgeLab] = useState(false);


  // Memoized last refresh label
  const lastRefreshLabel = useMemo(() => {
    if (!lastRefresh) return 'لم يتم التحديث بعد';
    const now = Date.now();
    const diff = now - lastRefresh;
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    
    if (minutes > 0) return `منذ ${minutes} دقيقة`;
    return `منذ ${seconds} ثانية`;
  }, [lastRefresh]);

  // Cache helper functions
  const getCachedData = useCallback((key: string) => {
    const cached = apiCache.get(key);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data;
    }
    return null;
  }, []);

  const setCachedData = useCallback((key: string, data: any, ttl: number = 300000) => {
    apiCache.set(key, { data, timestamp: Date.now(), ttl });
  }, []);

  // Course action handlers
  const handleShowApprovalModal = (course: any, isRecorded: boolean = false) => {
    setSelectedCourse(course);
    setIsRecordedCourse(isRecorded);
    setShowApprovalModal(true);
  };

  const handleShowRejectionModal = (course: any, isRecorded: boolean = false) => {
    setSelectedCourse(course);
    setIsRecordedCourse(isRecorded);
    setShowRejectionModal(true);
  };

  const handleShowDeleteModal = (course: any, isRecorded: boolean = false) => {
    setSelectedCourse(course);
    setIsRecordedCourse(isRecorded);
    setShowDeleteModal(true);
  };

  // Knowledge Lab handlers
  const handleShowKnowledgeLabDetails = (lab: KnowledgeLab) => {
    setSelectedKnowledgeLab(lab);
    setShowKnowledgeLabDetailsModal(true);
  };

  const handleShowKnowledgeLabApprovalModal = (lab: KnowledgeLab) => {
    setSelectedKnowledgeLab(lab);
    setShowKnowledgeLabApprovalModal(true);
  };

  const handleShowKnowledgeLabRejectionModal = (lab: KnowledgeLab) => {
    setSelectedKnowledgeLab(lab);
    setShowKnowledgeLabRejectionModal(true);
  };

  const handleCloseKnowledgeLabModals = () => {
    setShowKnowledgeLabDetailsModal(false);
    setShowKnowledgeLabApprovalModal(false);
    setShowKnowledgeLabRejectionModal(false);
    setSelectedKnowledgeLab(null);
    setKnowledgeLabApprovalNotes('');
    setKnowledgeLabPlatformCommission('');
    setKnowledgeLabRejectionReason('');
    setIsApprovingKnowledgeLab(false);
  };

  const handleKnowledgeLabApproval = async () => {
    if (!selectedKnowledgeLab) return;

    setIsApprovingKnowledgeLab(true);
    try {
      const token = await simpleAuthService.getValidAccessToken();
      if (!token) {
        toast.error('خطأ في المصادقة');
        setIsApprovingKnowledgeLab(false);
        return;
      }

      const approvalPayload: any = {};
      
      if (knowledgeLabApprovalNotes && knowledgeLabApprovalNotes.trim()) {
        approvalPayload.notes = knowledgeLabApprovalNotes.trim();
      }
      
      if (knowledgeLabPlatformCommission && knowledgeLabPlatformCommission.trim()) {
        const commissionNum = parseFloat(knowledgeLabPlatformCommission);
        if (!isNaN(commissionNum) && commissionNum >= 0 && commissionNum <= 100) {
          approvalPayload.platform_commission_percentage = commissionNum.toString();
        }
      }

      const response = await knowledgeLabApi.approveLab(selectedKnowledgeLab.id, approvalPayload);

      if (response.success) {
        toast.success('تم قبول مختبر المعرفة بنجاح', {
          description: `تم قبول "${selectedKnowledgeLab.title}" وإتاحته للطلاب`,
          duration: 5000
        });

        setKnowledgeLabApprovalNotes('');
        setKnowledgeLabPlatformCommission('');
        setKnowledgeLabsTabKey(prev => prev + 1);
        handleCloseKnowledgeLabModals();
      } else {
        toast.error(response.error || 'فشل في قبول مختبر المعرفة');
      }
    } catch (error: any) {
      logger.error('❌ Error approving knowledge lab:', error);
      toast.error(error.message || 'حدث خطأ أثناء قبول مختبر المعرفة');
    } finally {
      setIsApprovingKnowledgeLab(false);
    }
  };

  const handleKnowledgeLabRejection = async () => {
    if (!selectedKnowledgeLab) return;

    if (!knowledgeLabRejectionReason.trim()) {
      toast.error('يرجى كتابة سبب الرفض');
      return;
    }

    setIsApprovingKnowledgeLab(true);
    try {
      const token = await simpleAuthService.getValidAccessToken();
      if (!token) {
        toast.error('خطأ في المصادقة');
        setIsApprovingKnowledgeLab(false);
        return;
      }

      const response = await knowledgeLabApi.rejectLab(selectedKnowledgeLab.id, {
        rejection_reason: knowledgeLabRejectionReason.trim(),
      });

      if (response.success) {
        toast.success('تم رفض مختبر المعرفة بنجاح', {
          description: `تم رفض "${selectedKnowledgeLab.title}" وإبلاغ المعلم بذلك`,
          duration: 5000
        });

        setKnowledgeLabRejectionReason('');
        setKnowledgeLabsTabKey(prev => prev + 1);
        handleCloseKnowledgeLabModals();
      } else {
        toast.error(response.error || 'فشل في رفض مختبر المعرفة');
      }
    } catch (error: any) {
      logger.error('❌ Error rejecting knowledge lab:', error);
      toast.error(error.message || 'حدث خطأ أثناء رفض مختبر المعرفة');
    } finally {
      setIsApprovingKnowledgeLab(false);
    }
  };

  const handleCloseModals = () => {
    setShowApprovalModal(false);
    setShowRejectionModal(false);
    setShowDeleteModal(false);
    setSelectedCourse(null);
    setApprovalNotes('');
    setRejectionReason('');
    setPlatformCommission('');
    setConfirmDeleteText('');
    setShowSecondDeleteConfirm(false);
    setIsDeleting(false);
    setIsApproving(false);
    setIsRecordedCourse(false);
  };

  const handleFirstDeleteConfirm = () => {
    // No need for confirmation text for toggle visibility - just proceed
    handleToggleVisibility();
  };

  const handleToggleVisibility = async () => {
    if (!selectedCourse) return;

    setIsDeleting(true);
    try {
      if (isRecordedCourse) {
        // For recorded courses, use toggle visibility
        try {
          const isCurrentlyHidden = selectedCourse.is_hidden || false;
          const newHiddenState = !isCurrentlyHidden;
          await recordedCoursesApi.toggleVisibility(selectedCourse.id, { is_hidden: newHiddenState });
          
          // Note: RecordedCoursesTab doesn't have the same ref system, so we just refresh
          toast.success(isCurrentlyHidden ? 'تم إظهار الدورة بنجاح' : 'تم إخفاء الدورة بنجاح');
          // Refresh the appropriate tab
          setRecordedCoursesTabKey(prev => prev + 1);
        } catch (error: any) {
          logger.error('❌ Error toggling recorded course visibility:', error);
          toast.error(error.message || 'فشل في تغيير حالة الدورة المسجلة');
          setIsDeleting(false);
          return;
        }
      } else {
        // Use toggle visibility for live courses
        try {
          const isCurrentlyHidden = selectedCourse.is_hidden || false;
          const newHiddenState = !isCurrentlyHidden;
          await liveEducationApi.courses.toggleVisibility(selectedCourse.id, newHiddenState);
          
          // Update course visibility in the list immediately
          if (removeCourseFromListRef.current?.updateVisibility) {
            removeCourseFromListRef.current.updateVisibility(selectedCourse.id, newHiddenState);
          }
          
          toast.success(isCurrentlyHidden ? 'تم إظهار الدورة بنجاح' : 'تم إخفاء الدورة بنجاح');
          // Refresh the appropriate tab
          setCoursesTabKey(prev => prev + 1);
        } catch (error: any) {
          logger.error('❌ Error toggling live course visibility:', error);
          const errorMessage = error?.appError?.userMessage || error?.message || 'فشل في تغيير حالة الدورة المباشرة';
          toast.error(errorMessage);
          setIsDeleting(false);
          return;
        }
      }
    } catch (error) {
      logger.error('Error toggling course visibility:', error);
      toast.error('حدث خطأ أثناء تغيير حالة الدورة');
    } finally {
      setIsDeleting(false);
      handleCloseModals();
    }
  };

  const handleCourseApproval = async () => {
    console.log('🔵 handleCourseApproval called', { 
      selectedCourse, 
      isRecordedCourse, 
      approvalNotes,
      showApprovalModal,
      platformCommission
    });
    
    if (!selectedCourse) {
      console.error('❌ No selected course!');
      toast.error('لم يتم تحديد دورة');
      return;
    }

    console.log('✅ Setting isApproving to true...');
    setIsApproving(true);
    console.log('✅ isApproving set to true');
    
    // Check user role before attempting approval
    try {
      console.log('🔍 Checking user permissions...');
      
      // Try multiple ways to get user data
      let user: any = null;
      
      // Method 1: Try getStoredAuthData
      const authData = simpleAuthService.getStoredAuthData();
      if (authData && authData.user) {
        user = authData.user;
        console.log('✅ Got user from getStoredAuthData');
      } else {
        // Method 2: Try getUser
        user = simpleAuthService.getUser();
        if (user) {
          console.log('✅ Got user from getUser');
        } else {
          // Method 3: Try localStorage directly
          const userStr = localStorage.getItem('user');
          if (userStr) {
            try {
              user = JSON.parse(userStr);
              console.log('✅ Got user from localStorage');
            } catch (e) {
              console.error('❌ Error parsing user from localStorage:', e);
            }
          }
        }
      }
      
      if (!user) {
        console.error('❌ No user data found from any method!');
        console.error('🔍 Debug info:', {
          getStoredAuthData: simpleAuthService.getStoredAuthData(),
          getUser: simpleAuthService.getUser(),
          localStorageUser: localStorage.getItem('user')
        });
        toast.error('خطأ في المصادقة. يرجى تسجيل الدخول مرة أخرى.');
        setIsApproving(false);
        return;
      }

      const userRole = user.role;
      const supervisorType = localStorage.getItem('supervisor_type');
      const isGeneralSupervisor = userRole === 'general_supervisor' || 
                                   (userRole === 'supervisor' && (supervisorType === 'general' || !supervisorType));

      console.log('🔍 Permission check:', {
        userRole,
        supervisorType,
        isGeneralSupervisor,
        isAdmin: userRole === 'admin',
        user: user
      });

      if (!isGeneralSupervisor && userRole !== 'admin') {
        console.error('❌ Permission denied!');
        toast.error('ليس لديك صلاحية لاعتماد الدورات. يجب أن تكون مشرفاً عاماً.');
        logger.error('❌ Permission denied. User role:', userRole, 'Supervisor type:', supervisorType, 'Expected: general_supervisor');
        setIsApproving(false);
        handleCloseModals();
        return;
      }
      
      console.log('✅ Permission check passed');
    } catch (error) {
      console.error('❌ Error checking user permissions:', error);
      logger.error('❌ Error checking user permissions:', error);
      toast.error('خطأ في التحقق من الصلاحيات');
      setIsApproving(false);
      return;
    }

    try {
      console.log('🔍 Getting access token...');
      
      // Try multiple ways to get access token
      let token: string | null = null;
      
      // Method 1: Try getValidAccessToken
      try {
        token = await simpleAuthService.getValidAccessToken();
        if (token) {
          console.log('✅ Got token from getValidAccessToken');
        }
      } catch (e) {
        console.warn('⚠️ getValidAccessToken failed:', e);
      }
      
      // Method 2: Try localStorage directly
      if (!token) {
        token = localStorage.getItem('access_token');
        if (token) {
          console.log('✅ Got token from localStorage');
        }
      }
      
      if (!token) {
        console.error('❌ No valid access token from any method!');
        console.error('🔍 Debug info:', {
          localStorageToken: localStorage.getItem('access_token') ? 'exists' : 'missing',
          localStorageRefreshToken: localStorage.getItem('refresh_token') ? 'exists' : 'missing'
        });
        toast.error('خطأ في المصادقة. يرجى تسجيل الدخول مرة أخرى.');
        setIsApproving(false);
        return;
      }

      console.log('✅ Got valid token, proceeding with approval...');

      logger.log('🔍 Approving course:', {
        courseId: selectedCourse.id,
        courseTitle: selectedCourse.title,
        approvalNotes: approvalNotes || "تم قبول الدورة",
        isRecorded: isRecordedCourse
      });

      if (isRecordedCourse) {
        // Use recorded courses API
        try {
          // Build approval payload - only include fields that have values
          const approvalPayload: any = {};
          
          if (approvalNotes && approvalNotes.trim()) {
            approvalPayload.notes = approvalNotes.trim();
          } else {
            // Always include notes, even if empty
            approvalPayload.notes = approvalNotes || '';
          }
          
          // Platform commission is optional
          if (platformCommission && platformCommission.trim()) {
            const commissionNum = parseFloat(platformCommission);
            if (!isNaN(commissionNum) && commissionNum >= 0 && commissionNum <= 100) {
              approvalPayload.platform_commission_percentage = commissionNum.toString();
            }
          }
          
          console.log('📤 Approving recorded course:', {
            courseId: selectedCourse.id,
            payload: approvalPayload
          });
          
          logger.log('📤 Approving recorded course with payload:', approvalPayload);
          
          const result = await recordedCoursesApi.approve(selectedCourse.id, approvalPayload);
          
          console.log('✅ Approval successful:', result);
          
          toast.success('تم قبول الدورة بنجاح', {
            description: `تم قبول "${selectedCourse.title}" وإتاحتها للطلاب`,
            duration: 5000
          });
          
          // Clear approval notes
          setApprovalNotes('');
          setPlatformCommission('');
          
          // Refresh the page data after successful approval
          logger.log('🔄 Refreshing data after course approval...');
          await loadData(true);
          
          // Refresh CoursesTab by updating its key
          setRecordedCoursesTabKey(prev => prev + 1);
          
          // Close modal after successful approval
          setIsApproving(false);
          handleCloseModals();
        } catch (error: any) {
          console.error('❌ Error approving recorded course:', error);
          console.error('❌ Error details:', {
            message: error?.message,
            data: error?.data,
            response: error?.response,
            stack: error?.stack
          });
          
          logger.error('❌ Error approving recorded course:', error);
          logger.error('❌ Error details:', {
            message: error.message,
            data: error.data,
            response: error.response
          });
          
          // Extract error message from different possible formats
          let errorMessage = 'فشل في قبول الدورة المسجلة';
          if (error?.data?.detail) {
            errorMessage = error.data.detail;
          } else if (error?.message) {
            errorMessage = error.message;
          } else if (error?.data?.error) {
            errorMessage = error.data.error;
          } else if (error?.data?.message) {
            errorMessage = error.data.message;
          } else if (typeof error?.data === 'string') {
            errorMessage = error.data;
          }
          
          // Special handling for 403 Forbidden errors
          if (errorMessage.includes('role') && errorMessage.includes("doesn't have permission")) {
            errorMessage = 'ليس لديك صلاحية لاعتماد الدورات. يجب أن تكون مشرفاً عاماً.';
          }
          
          toast.error(errorMessage, {
            duration: 5000
          });
          setIsApproving(false);
        }
        return;
      }

      // Use live courses API
      logger.log('🔄 Attempting to approve live course:', {
        courseId: selectedCourse.id,
        courseTitle: selectedCourse.title,
        notes: approvalNotes,
        endpoint: `/live-courses/courses/${selectedCourse.id}/approve/`
      });
      
      // liveEducationApi.courses.approve returns the data directly, not a Response object
      const responseData = await liveEducationApi.courses.approve(selectedCourse.id, {
        notes: approvalNotes || 'تم قبول الدورة'
      });

      console.log('✅ Approval successful, response data:', responseData);
      
      toast.success('تم قبول الدورة بنجاح', {
        description: `تم قبول "${selectedCourse.title}" وإتاحتها للطلاب`,
        duration: 5000
      });
      
      // Clear approval notes
      setApprovalNotes('');
      
      // Refresh the page data after successful approval
      console.log('🔄 Refreshing data after course approval...');
      await loadData(true);
      
      // Refresh CoursesTab by updating its key
      setCoursesTabKey(prev => prev + 1);
      
      // Close modal after successful approval
      handleCloseModals();
    } catch (error: any) {
      console.error('❌ Error approving course:', error);
      
      // Extract error message
      let errorMessage = 'حدث خطأ أثناء قبول الدورة';
      if (error?.message) {
        errorMessage = error.message;
      } else if (error?.appError?.userMessage) {
        errorMessage = error.appError.userMessage;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      toast.error(errorMessage, {
        duration: 5000
      });
    } finally {
      setIsApproving(false);
    }
  };

  const handleCourseRejection = async () => {
    if (!selectedCourse) return;

    if (!rejectionReason.trim()) {
      toast.error('يرجى كتابة سبب الرفض');
      return;
    }

    setIsApproving(true); // Reuse isApproving state for rejection
    try {
      const token = await simpleAuthService.getValidAccessToken();
      if (!token) {
        toast.error('خطأ في المصادقة');
        setIsApproving(false);
        return;
      }

      console.log('🔍 Rejecting course:', {
        courseId: selectedCourse.id,
        courseTitle: selectedCourse.title,
        rejectionReason: rejectionReason,
        isRecorded: isRecordedCourse
      });

      let response;
      if (isRecordedCourse) {
        // Use recorded courses API
        try {
          await recordedCoursesApi.reject(selectedCourse.id, {
            rejection_reason: rejectionReason.trim(),
          });
          response = { ok: true, status: 200 } as Response;
        } catch (error: any) {
          console.error('❌ Error rejecting recorded course:', error);
          throw error;
        }
      } else {
        // Use live courses API
        response = await fetch(
          `${process.env['NEXT_PUBLIC_API_URL']}/live-courses/courses/${selectedCourse.id}/reject/`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
              rejection_reason: rejectionReason.trim()
            }),
          }
        );
      }

      console.log('📡 Rejection response status:', response.status);

      if (response.ok) {
        const responseData = await response.json().catch(() => ({}));
        console.log('✅ Rejection response:', responseData);
        
        toast.success('تم رفض الدورة بنجاح', {
          description: `تم رفض "${selectedCourse.title}" وإبلاغ المعلم بذلك`,
          duration: 5000
        });
        
        // Refresh the page data after successful rejection
        console.log('🔄 Refreshing data after course rejection...');
        await loadData(true);
        
        // Refresh CoursesTab by updating its key
        if (isRecordedCourse) {
          setRecordedCoursesTabKey(prev => prev + 1);
        } else {
          setCoursesTabKey(prev => prev + 1);
        }
        
        // Close modal after successful rejection
        handleCloseModals();
      } else {
        const errorData = await response.json().catch(() => ({ message: 'خطأ غير معروف' }));
        console.error('❌ Rejection failed:', errorData);
        toast.error(`فشل في رفض الدورة: ${errorData.message || errorData.detail || 'خطأ غير معروف'}`);
      }
    } catch (error) {
      console.error('❌ Error rejecting course:', error);
      toast.error('حدث خطأ أثناء رفض الدورة');
    } finally {
      setIsApproving(false);
    }
  };

  // Load user email once and cache it
  const loadUserEmail = useCallback(async () => {
    if (userEmail) return userEmail; // Already loaded

    const cached = getCachedData('user_email');
    if (cached) {
      setUserEmail(cached);
      return cached;
    }

    try {
      const profileResponse = await fetch(`${process.env['NEXT_PUBLIC_API_URL']}/auth/profile/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        const email = profileData.email || '';
        setUserEmail(email);
        setCachedData('user_email', email, 600000); // Cache for 10 minutes
        return email;
      }
    } catch (error) {
      console.error('Error loading user email:', error);
    }

    return '';
  }, [userEmail, getCachedData, setCachedData]);

  // Optimized load data function with caching and batching
  const loadData = useCallback(async (forceRefresh: boolean = false) => {
    if (refreshing && !forceRefresh) return;
    
    const now = Date.now();
    if (!forceRefresh && now - lastRefresh < 30000) return;

    try {
      setRefreshing(true);
      if (!loading) setLoading(true);

      const promises: Promise<any>[] = [];

      // Statistics
      const statsKey = 'dashboard_stats';
      let statsData = !forceRefresh ? getCachedData(statsKey) : null;
      if (!statsData) {
        promises.push(
          generalSupervisorApi
            .getDashboardStatistics()
            .then((data) => {
              setStats(data);
              setCachedData(statsKey, data);
              return data;
            })
            .catch((err) => {
              console.error('Error loading statistics:', err);
              return null;
            })
        );
      } else {
        setStats(statsData);
      }

      // Pending courses count
      const coursesKey = 'pending_courses';
      let coursesData = !forceRefresh ? getCachedData(coursesKey) : null;
      if (!coursesData) {
        promises.push(
          generalSupervisorApi
            .getPendingCoursesForMe()
            .then((data) => {
              const count = Array.isArray(data) ? data.length : 0;
              setPendingCoursesCount(count);
              setCachedData(coursesKey, count);
              return count;
            })
            .catch((err) => {
              console.error('Error loading courses:', err);
              setPendingCoursesCount(0);
              return 0;
            })
        );
      } else {
        setPendingCoursesCount(coursesData);
      }

      // Pending interactive games count
      const gamesKey = 'pending_games';
      let gamesData = !forceRefresh ? getCachedData(gamesKey) : null;
      if (!gamesData) {
        promises.push(
          interactiveGamesApi
            .list({ status: 'pending' })
            .then((data) => {
              const count = data.results ? data.results.length : 0;
              setPendingGamesCount(count);
              setCachedData(gamesKey, count);
              return count;
            })
            .catch((err) => {
              console.error('Error loading games:', err);
              setPendingGamesCount(0);
              return 0;
            })
        );
      } else {
        setPendingGamesCount(gamesData);
      }

      // Pending teachers count
      const teachersKey = 'pending_teachers';
      let teachersData = !forceRefresh ? getCachedData(teachersKey) : null;
      if (!teachersData) {
        promises.push(
          generalSupervisorApi
            .getPendingTeachers()
            .then((data) => {
              const count = Array.isArray(data) ? data.length : 0;
              setPendingTeachersCount(count);
              setCachedData(teachersKey, count);
              return count;
            })
            .catch((err) => {
              console.error('Error loading teachers:', err);
              setPendingTeachersCount(0);
              return 0;
            })
        );
      } else {
        setPendingTeachersCount(teachersData);
      }

      // Live sessions count
      const liveSessionsKey = 'live_sessions_count';
      let liveSessionsData = !forceRefresh ? getCachedData(liveSessionsKey) : null;
      if (!liveSessionsData) {
      promises.push(
          generalSupervisorApi
            .getLiveSessionsCount()
            .then((count) => {
            setLiveSessionsCount(count);
              setCachedData(liveSessionsKey, count);
            return count;
          })
            .catch((err) => {
            console.error('Error loading live sessions:', err);
            setLiveSessionsCount(0);
            return 0;
          })
      );
    } else {
      setLiveSessionsCount(liveSessionsData);
    }

      // Pending invitations count
      const invitationsKey = 'pending_invitations';
      let invitationsData = !forceRefresh ? getCachedData(invitationsKey) : null;
      if (!invitationsData) {
        promises.push(
          generalSupervisorApi
            .getPendingInvitations()
            .then((data) => {
              const count = Array.isArray(data) ? data.length : 0;
              setPendingInvitationsCount(count);
              setCachedData(invitationsKey, count);
              return count;
            })
            .catch((err) => {
              console.error('Error loading invitations:', err);
              setPendingInvitationsCount(0);
              return 0;
            })
        );
      } else {
        setPendingInvitationsCount(invitationsData);
      }

      // Family requests - will be loaded from API when available
      // setFamilyRequestsCount(0);

      if (promises.length > 0) {
        await Promise.allSettled(promises);
      }

      setLastRefresh(now);
    } catch (err) {
      console.error('General error:', err);
      toast.error('حدث خطأ أثناء تحميل البيانات');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [refreshing, lastRefresh, loading, getCachedData, setCachedData]);

  useEffect(() => {
    loadData();
    loadUserEmail();
  }, []); // run once

  // Actions
  const handleStartMeeting = useCallback(() => setShowComingSoonModal(true), []);

  const handleRefresh = useCallback(() => {
    loadData(true);
    toast.loading('جاري تحديث البيانات...', { id: 'refresh-dashboard' });
  }, [loadData]);

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['supervisor']}>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50/30 to-orange-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center relative overflow-hidden pt-20 md:pt-24">
          <div className="fixed inset-0 pointer-events-none z-0">
            <motion.div
              animate={{
                scale: [1, 1.15, 1],
                opacity: [0.15, 0.25, 0.15]
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-amber-200/20 to-orange-300/20 dark:from-amber-600/10 dark:to-orange-700/10 rounded-full blur-3xl"
            />
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.15, 0.25, 0.15]
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 2 }}
              className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-orange-200/15 to-amber-300/15 dark:from-orange-600/8 dark:to-amber-700/8 rounded-full blur-3xl"
            />
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="relative text-center z-10"
          >
            <div className="relative mb-8">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 bg-gradient-to-r from-amber-400/20 to-orange-400/20 dark:from-amber-600/20 dark:to-orange-700/20 rounded-full blur-2xl"
              />
              <div className="relative w-24 h-24 bg-gradient-to-br from-amber-500 to-orange-600 dark:from-amber-600 dark:to-orange-700 rounded-2xl flex items-center justify-center mx-auto shadow-2xl">
                <Spinner size="xl" tone="contrast" />
              </div>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-4"
            >
              <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-amber-800 to-orange-700 dark:from-slate-100 dark:via-amber-300 dark:to-orange-400 bg-clip-text text-transparent">
                جاري تحميل لوحة التحكم
              </h2>
              <p className="text-gray-600 dark:text-slate-400 text-lg">يرجى الانتظار بينما نحضر بياناتك...</p>
              <div className="flex justify-center space-x-2 space-x-reverse mt-6">
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut" }}
                  className="w-3 h-3 bg-amber-400 dark:bg-amber-500 rounded-full"
                />
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut", delay: 0.1 }}
                  className="w-3 h-3 bg-orange-400 dark:bg-orange-500 rounded-full"
                />
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
                  className="w-3 h-3 bg-amber-500 dark:bg-amber-600 rounded-full"
                />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['supervisor']}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50/30 to-orange-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 relative overflow-hidden pt-20 md:pt-24 mt-20">
        <div className="fixed inset-0 pointer-events-none z-0">
          <motion.div
            animate={{
              scale: [1, 1.15, 1],
              opacity: [0.15, 0.25, 0.15],
              x: [0, 30, 0],
              y: [0, -20, 0]
            }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-amber-200/20 to-orange-300/20 dark:from-amber-600/10 dark:to-orange-700/10 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.15, 0.25, 0.15],
              x: [0, -25, 0],
              y: [0, 25, 0]
            }}
            transition={{ duration: 14, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-orange-200/15 to-amber-300/15 dark:from-orange-600/8 dark:to-amber-700/8 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.1, 0.2, 0.1]
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 4 }}
            className="absolute top-1/2 left-1/4 w-64 h-64 bg-gradient-to-br from-orange-200/10 to-amber-200/10 dark:from-orange-600/5 dark:to-amber-700/5 rounded-full blur-3xl"
          />
        </div>
        
        <div className="relative z-10">
          <SupervisorProfileCompletionBanner />

          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border-b border-amber-200/30 dark:border-amber-800/30 shadow-xl"
          >
            {/* Animated gradient background */}
            <div className="absolute inset-0 bg-gradient-to-r from-amber-50/60 via-orange-50/40 to-amber-50/60 dark:from-amber-950/40 dark:via-orange-950/20 dark:to-amber-950/40" />
            <motion.div
              animate={{
                backgroundPosition: ["0% 0%", "100% 100%"],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                repeatType: "reverse",
              }}
              className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(245,158,11,0.15),transparent_70%)] dark:bg-[radial-gradient(circle_at_30%_20%,rgba(245,158,11,0.08),transparent_70%)]" 
            />
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between py-8 md:py-10">
                <div className="flex items-center gap-5">
                  <motion.div 
                    className="relative group"
                  >
                    <motion.div
                      animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.5, 0.8, 0.5],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="absolute inset-0 bg-gradient-to-br from-amber-400 to-orange-600 dark:from-amber-500 dark:to-orange-700 rounded-3xl blur-xl opacity-60 group-hover:opacity-90 transition-opacity duration-300" 
                    />
                    <div className="relative w-20 h-20 bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 dark:from-amber-600 dark:via-amber-700 dark:to-orange-700 rounded-3xl flex items-center justify-center shadow-2xl ring-4 ring-amber-200/50 dark:ring-amber-800/30">
                      <GraduationCap className="h-10 w-10 text-white drop-shadow-lg" />
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
                    className="space-y-2"
                  >
                    <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-gray-900 via-amber-800 to-orange-700 dark:from-slate-100 dark:via-amber-300 dark:to-orange-400 bg-clip-text text-transparent tracking-tight">
                      لوحة تحكم المشرف العام
                    </h1>
                    <p className="text-base md:text-lg text-gray-600 dark:text-slate-400 font-medium flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                      إدارة شاملة للمنصة التعليمية
                    </p>
                  </motion.div>
                </div>

                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex flex-wrap items-center gap-3"
                >
                  <motion.div>
                    <Button
                      onClick={handleStartMeeting}
                      className="bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 hover:from-amber-600 hover:via-amber-700 hover:to-orange-700 text-white px-6 py-3 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 font-semibold text-base border-0 relative overflow-hidden group"
                    >
                      <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></span>
                      <Video className="w-5 h-5 ml-2 relative z-10" />
                      <span className="relative z-10">ابدأ اجتماع جديد</span>
                    </Button>
                  </motion.div>

                  <motion.div>
                    <Button
                      onClick={handleRefresh}
                      disabled={refreshing}
                      variant="outline"
                      className="border-2 border-gray-300 dark:border-slate-600 hover:border-amber-400 dark:hover:border-amber-600 text-gray-800 dark:text-gray-200 hover:text-amber-700 dark:hover:text-amber-400 px-5 py-3 rounded-2xl hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-all duration-300 font-semibold shadow-md hover:shadow-lg"
                    >
                      <RefreshCw className={`w-4 h-4 ml-2 ${refreshing ? 'animate-spin' : ''}`} />
                      {refreshing ? 'جاري التحديث...' : 'تحديث'}
                    </Button>
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </motion.div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5 mb-8">
              {/* Live Sessions Card */}
              <motion.div 
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 100 }}
                whileHover={{ y: -8 }}
                className="group relative bg-gradient-to-br from-red-50 via-red-50/80 to-pink-50 dark:from-red-950/30 dark:via-red-950/20 dark:to-pink-950/30 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-red-200/50 dark:border-red-900/30 hover:shadow-2xl hover:border-red-300 dark:hover:border-red-800/50 transition-all duration-500 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-red-400/10 to-pink-400/10 dark:from-red-600/5 dark:to-pink-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10 flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-red-700 dark:text-red-400 opacity-80">مباشر</p>
                    <motion.p 
                      key={liveSessionsCount}
                      initial={{ scale: 1.2, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-3xl font-extrabold text-red-900 dark:text-red-200"
                    >
                      {liveSessionsCount}
                    </motion.p>
                    <p className="text-xs font-medium text-red-600 dark:text-red-400">حصة جارية</p>
                  </div>
                  <motion.div 
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                    className="bg-gradient-to-br from-red-500 to-red-600 dark:from-red-600 dark:to-red-700 p-3.5 rounded-2xl shadow-lg ring-2 ring-red-200/50 dark:ring-red-800/30"
                  >
                    <Video className="h-5 w-5 text-white" />
                  </motion.div>
                </div>
              </motion.div>

              {/* Supervisors Card */}
              <motion.div 
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
                whileHover={{ y: -8 }}
                className="group relative bg-gradient-to-br from-amber-50 via-orange-50/80 to-yellow-50 dark:from-amber-950/30 dark:via-orange-950/20 dark:to-yellow-950/30 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-amber-200/50 dark:border-amber-900/30 hover:shadow-2xl hover:border-amber-300 dark:hover:border-amber-800/50 transition-all duration-500 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-amber-400/10 to-orange-400/10 dark:from-amber-600/5 dark:to-orange-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10 flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 opacity-80">المشرفين</p>
                    <motion.p 
                      key={stats.active_academic_supervisors}
                      initial={{ scale: 1.2, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-3xl font-extrabold text-amber-900 dark:text-amber-200"
                    >
                      {stats.active_academic_supervisors}
                    </motion.p>
                    <p className="text-xs font-medium text-amber-600 dark:text-amber-400">نشط</p>
                  </div>
                  <motion.div 
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                    className="bg-gradient-to-br from-amber-500 to-orange-600 dark:from-amber-600 dark:to-orange-700 p-3.5 rounded-2xl shadow-lg ring-2 ring-amber-200/50 dark:ring-amber-800/30"
                  >
                    <GraduationCap className="h-5 w-5 text-white" />
                  </motion.div>
                </div>
              </motion.div>

              {/* Courses Card */}
              <motion.div 
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
                whileHover={{ y: -8 }}
                className="group relative bg-gradient-to-br from-blue-50 via-indigo-50/80 to-cyan-50 dark:from-blue-950/30 dark:via-indigo-950/20 dark:to-cyan-950/30 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-blue-200/50 dark:border-blue-900/30 hover:shadow-2xl hover:border-blue-300 dark:hover:border-blue-800/50 transition-all duration-500 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 dark:from-blue-600/5 dark:to-indigo-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10 flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400 opacity-80">الدورات</p>
                    <motion.p 
                      key={pendingCoursesCount}
                      initial={{ scale: 1.2, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-3xl font-extrabold text-blue-900 dark:text-blue-200"
                    >
                      {pendingCoursesCount}
                    </motion.p>
                    <p className="text-xs font-medium text-blue-600 dark:text-blue-400">معلقة</p>
                  </div>
                  <motion.div 
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                    className="bg-gradient-to-br from-blue-500 to-indigo-600 dark:from-blue-600 dark:to-indigo-700 p-3.5 rounded-2xl shadow-lg ring-2 ring-blue-200/50 dark:ring-blue-800/30"
                  >
                    <BookOpen className="h-5 w-5 text-white" />
                  </motion.div>
                </div>
              </motion.div>

              {/* Teachers Card */}
              <motion.div 
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.4, type: "spring", stiffness: 100 }}
                whileHover={{ y: -8 }}
                className="group relative bg-gradient-to-br from-purple-50 via-violet-50/80 to-fuchsia-50 dark:from-purple-950/30 dark:via-violet-950/20 dark:to-fuchsia-950/30 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-purple-200/50 dark:border-purple-900/30 hover:shadow-2xl hover:border-purple-300 dark:hover:border-purple-800/50 transition-all duration-500 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-400/10 to-violet-400/10 dark:from-purple-600/5 dark:to-violet-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10 flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-400 opacity-80">المعلمين</p>
                    <motion.p 
                      key={pendingTeachersCount}
                      initial={{ scale: 1.2, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-3xl font-extrabold text-purple-900 dark:text-purple-200"
                    >
                      {pendingTeachersCount}
                    </motion.p>
                    <p className="text-xs font-medium text-purple-600 dark:text-purple-400">معلقين</p>
                  </div>
                  <motion.div 
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                    className="bg-gradient-to-br from-purple-500 to-violet-600 dark:from-purple-600 dark:to-violet-700 p-3.5 rounded-2xl shadow-lg ring-2 ring-purple-200/50 dark:ring-purple-800/30"
                  >
                    <Users className="h-5 w-5 text-white" />
                  </motion.div>
                </div>
              </motion.div>

              {/* Invitations Card */}
              <motion.div 
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.5, type: "spring", stiffness: 100 }}
                whileHover={{ y: -8 }}
                className="group relative bg-gradient-to-br from-orange-50 via-amber-50/80 to-yellow-50 dark:from-orange-950/30 dark:via-amber-950/20 dark:to-yellow-950/30 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-orange-200/50 dark:border-orange-900/30 hover:shadow-2xl hover:border-orange-300 dark:hover:border-orange-800/50 transition-all duration-500 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-orange-400/10 to-amber-400/10 dark:from-orange-600/5 dark:to-amber-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10 flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-orange-700 dark:text-orange-400 opacity-80">الدعوات</p>
                    <motion.p 
                      key={pendingInvitationsCount}
                      initial={{ scale: 1.2, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-3xl font-extrabold text-orange-900 dark:text-orange-200"
                    >
                      {pendingInvitationsCount}
                    </motion.p>
                    <p className="text-xs font-medium text-orange-600 dark:text-orange-400">معلقة</p>
                  </div>
                  <motion.div 
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                    className="bg-gradient-to-br from-orange-500 to-amber-600 dark:from-orange-600 dark:to-amber-700 p-3.5 rounded-2xl shadow-lg ring-2 ring-orange-200/50 dark:ring-orange-800/30"
                  >
                    <Mail className="h-5 w-5 text-white" />
                  </motion.div>
                </div>
              </motion.div>
            </div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, type: "spring", stiffness: 100 }}
              className="mt-6 bg-gradient-to-r from-white/80 via-amber-50/50 to-white/80 dark:from-slate-900/80 dark:via-amber-950/20 dark:to-slate-900/80 backdrop-blur-xl rounded-2xl p-5 shadow-lg border border-amber-200/30 dark:border-amber-800/20 hover:shadow-xl transition-all duration-300"
            >
              <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
                <motion.div 
                  className="flex items-center gap-2 text-gray-700 dark:text-slate-300 font-medium"
                >
                  <RefreshCw className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>آخر تحديث: <span className="text-amber-700 dark:text-amber-400 font-semibold">{lastRefreshLabel}</span></span>
                </motion.div>
                <div className="flex items-center gap-4">
                  <motion.div 
                    className="flex items-center gap-2 text-gray-700 dark:text-slate-300"
                  >
                    <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span>المعلمين: <span className="font-semibold text-blue-700 dark:text-blue-400">{stats.total_teachers}</span></span>
                  </motion.div>
                  <motion.div 
                    className="flex items-center gap-2 text-gray-700 dark:text-slate-300"
                  >
                    <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <span>الطلاب: <span className="font-semibold text-purple-700 dark:text-purple-400">{stats.total_students}</span></span>
                  </motion.div>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, type: "spring", stiffness: 100 }}
              className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-3xl shadow-2xl border border-amber-200/40 dark:border-amber-800/30 overflow-hidden mt-8"
            >
              {/* Header Section */}
              <div className="relative bg-gradient-to-r from-amber-50 via-orange-50/80 to-amber-50 dark:from-amber-950/40 dark:via-orange-950/20 dark:to-amber-950/40 p-6 md:p-8 border-b border-amber-200/50 dark:border-amber-800/30 overflow-hidden">
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.3, 0.5, 0.3],
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-amber-300/20 to-orange-400/20 dark:from-amber-600/10 dark:to-orange-700/10 rounded-full blur-3xl"
                />
                <div className="relative z-10">
                  <motion.h2 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.9 }}
                    className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-gray-900 via-amber-800 to-orange-700 dark:from-slate-100 dark:via-amber-300 dark:to-orange-400 bg-clip-text text-transparent mb-3"
                  >
                    إدارة المنصة
                  </motion.h2>
                  <motion.p 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1 }}
                    className="text-gray-600 dark:text-slate-400 text-base font-medium"
                  >
                    تحكم شامل في جميع جوانب المنصة التعليمية
                  </motion.p>
                </div>
              </div>

              {/* Tabs Section */}
              <Tabs defaultValue="all-courses" className="w-full" value={activeTab} onValueChange={setActiveTab} dir="rtl">
                <div className="px-6 md:px-8 pt-6 pb-4">
                  <TabsList className="inline-flex h-14 w-full items-center justify-start rounded-2xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl p-2 gap-2 border-2 border-amber-200/50 dark:border-amber-800/40 shadow-lg overflow-hidden">
                    <TabsTrigger 
                      value="all-courses" 
                      className="flex-1 h-full data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:via-amber-600 data-[state=active]:to-orange-600 data-[state=active]:text-white data-[state=active]:shadow-sm rounded-lg transition-all duration-300 flex items-center justify-center gap-2 text-sm px-4 py-3 font-semibold data-[state=inactive]:text-gray-600 dark:data-[state=inactive]:text-gray-400 data-[state=inactive]:bg-transparent data-[state=inactive]:hover:bg-amber-50/60 dark:data-[state=inactive]:hover:bg-amber-950/30 data-[state=inactive]:hover:text-amber-700 dark:data-[state=inactive]:hover:text-amber-400"
                    >
                      <span className="hidden sm:inline">الدورات المباشرة</span>
                      <Video className="w-4 h-4 shrink-0" />
                    </TabsTrigger>
                    <TabsTrigger 
                      value="recorded-courses" 
                      className="flex-1 h-full data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:via-amber-600 data-[state=active]:to-orange-600 data-[state=active]:text-white data-[state=active]:shadow-sm rounded-lg transition-all duration-300 flex items-center justify-center gap-2 text-sm px-4 py-3 font-semibold data-[state=inactive]:text-gray-600 dark:data-[state=inactive]:text-gray-400 data-[state=inactive]:bg-transparent data-[state=inactive]:hover:bg-amber-50/60 dark:data-[state=inactive]:hover:bg-amber-950/30 data-[state=inactive]:hover:text-amber-700 dark:data-[state=inactive]:hover:text-amber-400"
                    >
                      <span className="hidden sm:inline">الدورات المسجلة</span>
                      <BookOpen className="w-4 h-4 shrink-0" />
                    </TabsTrigger>
                    <TabsTrigger 
                      value="teachers" 
                      className="flex-1 h-full data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:via-amber-600 data-[state=active]:to-orange-600 data-[state=active]:text-white data-[state=active]:shadow-sm rounded-lg transition-all duration-300 flex items-center justify-center gap-2 text-sm px-4 py-3 font-semibold data-[state=inactive]:text-gray-600 dark:data-[state=inactive]:text-gray-400 data-[state=inactive]:bg-transparent data-[state=inactive]:hover:bg-amber-50/60 dark:data-[state=inactive]:hover:bg-amber-950/30 data-[state=inactive]:hover:text-amber-700 dark:data-[state=inactive]:hover:text-amber-400"
                    >
                      <span className="hidden sm:inline">المعلمين</span>
                      <Users className="w-4 h-4 shrink-0" />
                    </TabsTrigger>
                    <TabsTrigger 
                      value="supervisors-management" 
                      className="flex-1 h-full data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:via-amber-600 data-[state=active]:to-orange-600 data-[state=active]:text-white data-[state=active]:shadow-sm rounded-lg transition-all duration-300 flex items-center justify-center gap-2 text-sm px-4 py-3 font-semibold data-[state=inactive]:text-gray-600 dark:data-[state=inactive]:text-gray-400 data-[state=inactive]:bg-transparent data-[state=inactive]:hover:bg-amber-50/60 dark:data-[state=inactive]:hover:bg-amber-950/30 data-[state=inactive]:hover:text-amber-700 dark:data-[state=inactive]:hover:text-amber-400"
                    >
                      <span className="hidden sm:inline">المشرفين</span>
                      <GraduationCap className="w-4 h-4 shrink-0" />
                    </TabsTrigger>
                    <TabsTrigger 
                      value="edit-requests" 
                      className="flex-1 h-full data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:via-amber-600 data-[state=active]:to-orange-600 data-[state=active]:text-white data-[state=active]:shadow-sm rounded-lg transition-all duration-300 flex items-center justify-center gap-2 text-sm px-4 py-3 font-semibold data-[state=inactive]:text-gray-600 dark:data-[state=inactive]:text-gray-400 data-[state=inactive]:bg-transparent data-[state=inactive]:hover:bg-amber-50/60 dark:data-[state=inactive]:hover:bg-amber-950/30 data-[state=inactive]:hover:text-amber-700 dark:data-[state=inactive]:hover:text-amber-400"
                    >
                      <span className="hidden sm:inline">التعديلات</span>
                      <Edit className="w-4 h-4 shrink-0" />
                    </TabsTrigger>
                    <TabsTrigger 
                      value="knowledge-labs" 
                      className="flex-1 h-full data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:via-indigo-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-sm rounded-lg transition-all duration-300 flex items-center justify-center gap-2 text-sm px-4 py-3 font-semibold data-[state=inactive]:text-gray-600 dark:data-[state=inactive]:text-gray-400 data-[state=inactive]:bg-transparent data-[state=inactive]:hover:bg-purple-50/60 dark:data-[state=inactive]:hover:bg-purple-950/30 data-[state=inactive]:hover:text-purple-700 dark:data-[state=inactive]:hover:text-purple-400"
                    >
                      <span className="hidden sm:inline">مختبرات المعرفة</span>
                      <FlaskConical className="w-4 h-4 shrink-0" />
                    </TabsTrigger>
                    <TabsTrigger 
                      value="interactive-games" 
                      className="flex-1 h-full data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:via-emerald-600 data-[state=active]:to-green-600 data-[state=active]:text-white data-[state=active]:shadow-sm rounded-lg transition-all duration-300 flex items-center justify-center gap-2 text-sm px-4 py-3 font-semibold data-[state=inactive]:text-gray-600 dark:data-[state=inactive]:text-gray-400 data-[state=inactive]:bg-transparent data-[state=inactive]:hover:bg-green-50/60 dark:data-[state=inactive]:hover:bg-green-950/30 data-[state=inactive]:hover:text-green-700 dark:data-[state=inactive]:hover:text-green-400"
                    >
                      <span className="hidden sm:inline">الألعاب التفاعلية</span>
                      <Gamepad2 className="w-4 h-4 shrink-0" />
                    </TabsTrigger>
                  </TabsList>
                </div>

                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4 }}
                  className="p-6 md:p-8"
                >
                  <TabsContent value="all-courses" className="mt-0">
                    <CoursesTab 
                      key={coursesTabKey}
                      onShowCourseDetails={(course) => {
                        setSelectedCourse(course);
                        setIsRecordedCourse(false);
                        setShowCourseDetailsModal(true);
                      }}
                      onShowApproval={(course) => handleShowApprovalModal(course, false)}
                      onShowRejection={(course) => handleShowRejectionModal(course, false)}
                      onShowDelete={(course) => handleShowDeleteModal(course, false)}
                      onCourseDeletedRef={removeCourseFromListRef}
                    />
                  </TabsContent>
                  
                  <TabsContent value="recorded-courses" className="mt-0">
                    <RecordedCoursesTab 
                      key={recordedCoursesTabKey}
                      onShowCourseDetails={(course) => {
                        setSelectedCourse(course);
                        setIsRecordedCourse(true);
                        setShowCourseDetailsModal(true);
                      }}
                      onShowApproval={(course) => handleShowApprovalModal(course, true)}
                      onShowRejection={(course) => handleShowRejectionModal(course, true)}
                      onShowDelete={(course) => handleShowDeleteModal(course, true)}
                    />
                  </TabsContent>
                  
                  <TabsContent value="teachers" className="mt-0">
                    <TeachersTab />
                  </TabsContent>
                  
                  <TabsContent value="supervisors-management" className="mt-0">
                    <SupervisorsManagementTab />
                  </TabsContent>
                  
                  <TabsContent value="edit-requests" className="mt-0">
                    <SupervisorCourseEditRequests 
                      isActive={activeTab === 'edit-requests'} 
                      onShowComparison={(request) => {
                        setSelectedEditRequest(request);
                        setShowCourseComparisonModal(true);
                      }}
                    />
                  </TabsContent>
                  
                  <TabsContent value="knowledge-labs" className="mt-0">
                    <KnowledgeLabRequestsTab 
                      key={knowledgeLabsTabKey}
                      onShowLabDetails={(lab) => handleShowKnowledgeLabDetails(lab)}
                      onShowApproval={(lab) => handleShowKnowledgeLabApprovalModal(lab)}
                      onShowRejection={(lab) => handleShowKnowledgeLabRejectionModal(lab)}
                    />
                  </TabsContent>

                  <TabsContent value="interactive-games" className="mt-0">
                    <InteractiveGamesTab 
                      onApprove={async (gameId) => {
                        try {
                          await interactiveGamesApi.approve(gameId);
                          toast.success('تم الموافقة على اللعبة بنجاح');
                          await loadData(true);
                        } catch (error: any) {
                          toast.error(error.message || 'حدث خطأ في الموافقة');
                        }
                      }}
                      onReject={async (gameId, reason) => {
                        try {
                          await interactiveGamesApi.reject(gameId, reason);
                          toast.success('تم رفض اللعبة');
                          await loadData(true);
                        } catch (error: any) {
                          toast.error(error.message || 'حدث خطأ في الرفض');
                        }
                      }}
                    />
                  </TabsContent>
                </motion.div>
              </Tabs>
            </motion.div>
          </div>
        </div>

      {/* Coming Soon Modal */}
      <Dialog open={showComingSoonModal} onOpenChange={setShowComingSoonModal}>
        <DialogContent className="max-w-md bg-white rounded-3xl shadow-2xl border-2 border-green-200">
          <DialogHeader className="text-center pb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center shadow-lg mx-auto mb-4">
              <Video className="w-10 h-10 text-green-600" />
            </div>
              <DialogTitle className="text-3xl font-bold text-green-800 mb-2">🚀 قريباً إن شاء الله</DialogTitle>
              <DialogDescription className="text-gray-600 text-lg">🚀 سيتم إضافة هذه الميزة قريباً إن شاء الله</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-6">
              <div className="flex items-center justify-center gap-3 text-green-700 mb-2">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-bold">📹</span>
                </div>
                <span className="font-semibold text-lg">اجتماعات المشرفين</span>
              </div>
                <p className="text-green-600 text-center text-sm">ميزة الاجتماعات مع المشرفين الأكاديميين قيد التطوير</p>
            </div>
          </div>

          <div className="flex gap-4 justify-center pt-4">
            <Button
              onClick={() => setShowComingSoonModal(false)}
              className="px-8 py-3 text-lg font-semibold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <CheckCircle className="w-5 h-5 ml-2" />
              فهمت
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Course Details Modal */}
      <CourseDetailsModal
        isOpen={showCourseDetailsModal}
        onClose={() => {
          setShowCourseDetailsModal(false);
          setSelectedCourse(null);
          setIsRecordedCourse(false);
        }}
        course={selectedCourse}
        onApprove={async (course, notes) => {
          console.log('🟢 onApprove called from CourseDetailsModal', { course, notes, isRecordedCourse });
          
          try {
            // Get valid access token (will refresh if needed)
            const validToken = await simpleAuthService.getValidAccessToken();
            if (!validToken) {
              toast.error('❌ فشل في الحصول على رمز المصادقة');
              return;
            }
            
            const apiBaseUrl = process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:8000/api';
            // Determine the correct API endpoint based on course type
            const endpoint = isRecordedCourse 
              ? `${apiBaseUrl}/recorded-courses/courses/${course.id}/approve/`
              : `${apiBaseUrl}/live-courses/courses/${course.id}/approve/`;
            
            console.log('📤 Sending approval request to:', endpoint);
            
            const response = await fetch(endpoint, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${validToken}`
              },
              body: JSON.stringify({
                platform_commission_percentage: '0',
                notes: notes || ''
              })
            });

            console.log('📥 Response status:', response.status);

            if (response.ok) {
              toast.success('✅ تم قبول الدورة بنجاح!');
              setShowCourseDetailsModal(false);
              setSelectedCourse(null);
              // Refresh the appropriate tab
              if (isRecordedCourse) {
                setRecordedCoursesTabKey(prev => prev + 1);
              } else {
                setCoursesTabKey(prev => prev + 1);
              }
            } else {
              const errorData = await response.json().catch(() => ({}));
              console.error('❌ Approval failed:', errorData);
              toast.error(errorData.detail || 'فشل في قبول الدورة');
            }
          } catch (error) {
            console.error('❌ Error approving course:', error);
            toast.error('حدث خطأ أثناء قبول الدورة');
          }
        }}
        onReject={async (course, reason) => {
          console.log('🔴 onReject called from CourseDetailsModal', { course, reason, isRecordedCourse });
          
          try {
            // Get valid access token (will refresh if needed)
            const validToken = await simpleAuthService.getValidAccessToken();
            if (!validToken) {
              toast.error('❌ فشل في الحصول على رمز المصادقة');
              return;
            }
            
            const apiBaseUrl = process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:8000/api';
            // Determine the correct API endpoint based on course type
            const endpoint = isRecordedCourse 
              ? `${apiBaseUrl}/recorded-courses/courses/${course.id}/reject/`
              : `${apiBaseUrl}/live-courses/courses/${course.id}/reject/`;
            
            console.log('📤 Sending rejection request to:', endpoint);
            
            const response = await fetch(endpoint, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${validToken}`
              },
              body: JSON.stringify({
                rejection_reason: reason || ''
              })
            });

            console.log('📥 Response status:', response.status);

            if (response.ok) {
              toast.success('✅ تم رفض الدورة بنجاح!');
              setShowCourseDetailsModal(false);
              setSelectedCourse(null);
              // Refresh the appropriate tab
              if (isRecordedCourse) {
                setRecordedCoursesTabKey(prev => prev + 1);
              } else {
                setCoursesTabKey(prev => prev + 1);
              }
            } else {
              const errorData = await response.json().catch(() => ({}));
              console.error('❌ Rejection failed:', errorData);
              toast.error(errorData.detail || 'فشل في رفض الدورة');
            }
          } catch (error) {
            console.error('❌ Error rejecting course:', error);
            toast.error('حدث خطأ أثناء رفض الدورة');
          }
        }}
      />

      {/* Course Comparison Modal */}
      <CourseComparisonModal
        isOpen={showCourseComparisonModal}
        onClose={() => {
          setShowCourseComparisonModal(false);
          setSelectedEditRequest(null);
        }}
        request={selectedEditRequest}
        onApprove={async (request, notes) => {
          // TODO: Implement approve logic
          console.log('Approving edit request:', request.id, 'with notes:', notes);
          setShowCourseComparisonModal(false);
          setSelectedEditRequest(null);
        }}
        onReject={async (request, reason) => {
          // TODO: Implement reject logic
          console.log('Rejecting edit request:', request.id, 'with reason:', reason);
          setShowCourseComparisonModal(false);
          setSelectedEditRequest(null);
        }}
        isLoading={false}
      />

      {/* Recorded Course Action Modals - مخصص للدورات المسجلة */}
      {isRecordedCourse && (
        <RecordedCourseActionModals
          showApprovalModal={showApprovalModal}
          selectedCourse={selectedCourse}
          approvalNotes={approvalNotes}
          setApprovalNotes={setApprovalNotes}
          platformCommission={platformCommission}
          setPlatformCommission={setPlatformCommission}
          isApproving={isApproving}
          handleCourseApproval={handleCourseApproval}
          showRejectionModal={showRejectionModal}
          rejectionReason={rejectionReason}
          setRejectionReason={setRejectionReason}
          handleCourseRejection={handleCourseRejection}
          handleCloseModals={handleCloseModals}
        />
      )}

      {/* Knowledge Lab Details Modal */}
      <KnowledgeLabDetailsModal
        isOpen={showKnowledgeLabDetailsModal}
        onClose={() => {
          setShowKnowledgeLabDetailsModal(false);
          setSelectedKnowledgeLab(null);
        }}
        lab={selectedKnowledgeLab}
        onApprove={(lab) => {
          setSelectedKnowledgeLab(lab);
          setShowKnowledgeLabDetailsModal(false);
          setShowKnowledgeLabApprovalModal(true);
        }}
        onReject={(lab) => {
          setSelectedKnowledgeLab(lab);
          setShowKnowledgeLabDetailsModal(false);
          setShowKnowledgeLabRejectionModal(true);
        }}
      />

      {/* Knowledge Lab Action Modals - مخصص لمختبرات المعرفة */}
      <KnowledgeLabActionModals
        showApprovalModal={showKnowledgeLabApprovalModal}
        selectedLab={selectedKnowledgeLab}
        approvalNotes={knowledgeLabApprovalNotes}
        setApprovalNotes={setKnowledgeLabApprovalNotes}
        platformCommission={knowledgeLabPlatformCommission}
        setPlatformCommission={setKnowledgeLabPlatformCommission}
        isApproving={isApprovingKnowledgeLab}
        handleLabApproval={handleKnowledgeLabApproval}
        showRejectionModal={showKnowledgeLabRejectionModal}
        rejectionReason={knowledgeLabRejectionReason}
        setRejectionReason={setKnowledgeLabRejectionReason}
        handleLabRejection={handleKnowledgeLabRejection}
        handleCloseModals={handleCloseKnowledgeLabModals}
      />

      {/* Global Course Action Modals - Page Level - للدورات المباشرة فقط */}
      {!isRecordedCourse && (
        <>
      <Dialog open={showApprovalModal} onOpenChange={handleCloseModals}>
        <DialogContent className="sm:max-w-[450px] max-w-[95vw] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xl">
          <DialogHeader className="pb-3">
            <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white">
              قبول الدورة
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 py-2">
            {/* Notes Input */}
            <div className="space-y-1.5">
              <label className="text-sm text-slate-600 dark:text-slate-400">
                ملاحظات <span className="text-slate-400">(اختيارية)</span>
              </label>
              <Textarea
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                placeholder="ملاحظات..."
                className="min-h-[70px] text-sm resize-none"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button
              variant="outline"
              onClick={handleCloseModals}
              disabled={isApproving}
              className="h-9 px-4 text-sm"
            >
              إلغاء
            </Button>
            <Button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('🔵 Approval button clicked', { selectedCourse, isRecordedCourse, approvalNotes, isApproving });
                handleCourseApproval();
              }}
              disabled={isApproving}
              type="button"
              className="h-9 px-5 text-sm bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white gap-2"
            >
              {isApproving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  جاري الموافقة...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  موافقة
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showRejectionModal} onOpenChange={handleCloseModals}>
        <DialogContent className="sm:max-w-[450px] max-w-[95vw] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xl">
          <DialogHeader className="pb-3">
            <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white">
              رفض الدورة
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 py-2">
            {/* Rejection Reason Input */}
            <div className="space-y-1.5">
              <label className="text-sm text-slate-700 dark:text-slate-300">
                سبب الرفض <span className="text-red-500">*</span>
              </label>
              <Textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="أدخل سبب الرفض..."
                required
                className="min-h-[80px] text-sm resize-none border-red-200 dark:border-red-800 focus:border-red-500 dark:focus:border-red-500"
                rows={4}
              />
              {rejectionReason.trim() && rejectionReason.trim().length < 10 && (
                <p className="text-xs text-red-600 dark:text-red-400">
                  يجب أن يكون السبب 10 أحرف على الأقل
                </p>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button
              variant="outline"
              onClick={handleCloseModals}
              disabled={isApproving}
              className="h-9 px-4 text-sm"
            >
              إلغاء
            </Button>
            <Button
              onClick={handleCourseRejection}
              disabled={!rejectionReason.trim() || rejectionReason.trim().length < 10 || isApproving}
              className="h-9 px-5 text-sm bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white gap-2"
            >
              {isApproving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  جاري الرفض...
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4" />
                  رفض
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
        </>
      )}

      {showDeleteModal && selectedCourse && (
        <Dialog open={showDeleteModal} onOpenChange={handleCloseModals}>
          <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xl">
            <DialogHeader>
              <DialogTitle className={`flex items-center gap-2 ${selectedCourse.is_hidden ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}>
                <Eye className="w-5 h-5" />
                {selectedCourse.is_hidden ? 'إظهار الدورة' : 'إخفاء الدورة'}
              </DialogTitle>
              <DialogDescription className="text-slate-600 dark:text-slate-400">
                {selectedCourse.is_hidden 
                  ? 'سيتم إظهار الدورة للطلاب مرة أخرى'
                  : 'سيتم إخفاء الدورة عن الطلاب (لن يتم حذفها نهائياً)'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <Alert className={selectedCourse.is_hidden 
                ? "border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20"
                : "border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20"}>
                <Eye className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <AlertDescription className={selectedCourse.is_hidden 
                  ? "text-green-800 dark:text-green-300"
                  : "text-amber-800 dark:text-amber-300"}>
                  <strong>ملاحظة:</strong> {selectedCourse.is_hidden 
                    ? 'الدورة مخفية حالياً. سيتم إظهارها للطلاب بعد التأكيد.'
                    : 'الدورة ظاهرة حالياً. سيتم إخفاؤها عن الطلاب بعد التأكيد. يمكنك إظهارها مرة أخرى في أي وقت.'}
                </AlertDescription>
              </Alert>

              <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-lg border border-gray-200 dark:border-slate-700">
                <h4 className="font-semibold text-gray-900 dark:text-slate-100 mb-2">تفاصيل الدورة:</h4>
                <div className="space-y-1 text-sm text-gray-700 dark:text-slate-300">
                  <p><strong>العنوان:</strong> {selectedCourse.title || 'غير محدد'}</p>
                  <p><strong>المعلم:</strong> {selectedCourse.teacher_name || 'غير محدد'}</p>
                  <p><strong>عدد الطلاب:</strong> {selectedCourse.enrollment_count || selectedCourse.enrolled_count || 'غير محدد'}</p>
                  <p><strong>تاريخ الإنشاء:</strong> {selectedCourse.created_at ? new Date(selectedCourse.created_at).toLocaleDateString('ar-SA') : 'غير محدد'}</p>
                  <p><strong>الحالة:</strong> {selectedCourse.approval_status || 'غير محدد'}</p>
                  <p><strong>حالة الإخفاء:</strong> {selectedCourse.is_hidden ? 'مخفية' : 'ظاهرة'}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleToggleVisibility}
                  disabled={isDeleting}
                  variant={selectedCourse.is_hidden ? "default" : "destructive"}
                  className={`flex-1 ${selectedCourse.is_hidden 
                    ? 'bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white'
                    : 'bg-amber-600 hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-800 text-white'}`}
                >
                  {isDeleting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></div>
                      جاري المعالجة...
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4 ml-2" />
                      {selectedCourse.is_hidden ? 'إظهار الدورة' : 'إخفاء الدورة'}
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleCloseModals}
                  disabled={isDeleting}
                  variant="outline"
                  className="flex-1 border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800"
                >
                  إلغاء
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
      </div>
    </ProtectedRoute>
  );
};

export default GeneralSupervisorDashboard;





