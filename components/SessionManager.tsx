'use client';

import { useState, useEffect } from 'react';
import { Config } from '../lib/config';

interface Session {
  id: string;
  course_id: string;
  title: string;
  description: string;
  scheduled_time: string;
  duration_minutes: number;
  webrtc_room_id: string;
  webrtc_join_url: string;
  max_participants: number;
  current_participants: number;
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
  created_at: string;
}

interface Course {
  id: string;
  title: string;
  learning_path: string;
  individual_subtype?: string;
  family_size?: number;
  status: string;
}

interface SessionManagerProps {
  course: Course;
  onSessionCreated?: (session: Session) => void;
}

export default function SessionManager({ course, onSessionCreated }: SessionManagerProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [sessionForm, setSessionForm] = useState({
    title: '',
    description: '',
    scheduled_time: '',
    duration_minutes: 60
  });

  useEffect(() => {
    if (course.id) {
      fetchSessions();
    }
  }, [course.id]);

  const showMessage = (message: string, type: 'success' | 'error' = 'success') => {
    if (type === 'success') {
      setSuccess(message);
      setError('');
      setTimeout(() => setSuccess(''), 4000);
    } else {
      setError(message);
      setSuccess('');
      setTimeout(() => setError(''), 4000);
    }
  };

  const getAuthToken = () => {
    const tokens = localStorage.getItem('tokens');
    if (!tokens) return null;
    const parsedTokens = JSON.parse(tokens);
    return parsedTokens.access;
  };

  const fetchSessions = async () => {
    try {
      setIsLoading(true);
      
      // Try to get sessions from localStorage first
      const storedSessions = localStorage.getItem(`sessions_${course.id}`);
      if (storedSessions) {
        const sessions = JSON.parse(storedSessions);
        setSessions(sessions);
        return;
      }

      // If no sessions in localStorage, start with empty array
      setSessions([]);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      setSessions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const createSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = getAuthToken();
      if (!token) {
        showMessage('يرجى تسجيل الدخول أولاً', 'error');
        return;
      }

      // Calculate max participants based on course type
      let maxParticipants = 1;
      if (course.individual_subtype === 'family' && course.family_size) {
        maxParticipants = course.family_size;
      }

      // Generate WebRTC room data
      const roomId = `room_${course.id}_${Date.now()}`;
      const joinUrl = `${window.location.origin}/room/${roomId}`;

      const sessionData = {
        id: `session_${Date.now()}`,
        course_id: course.id,
        title: sessionForm.title,
        description: sessionForm.description,
        scheduled_time: sessionForm.scheduled_time,
        duration_minutes: sessionForm.duration_minutes,
        webrtc_room_id: roomId,
        webrtc_join_url: joinUrl,
        max_participants: maxParticipants,
        current_participants: 0,
        status: 'scheduled' as const,
        created_at: new Date().toISOString()
      };

      // Save to localStorage
      const existingSessions = JSON.parse(localStorage.getItem(`sessions_${course.id}`) || '[]');
      const updatedSessions = [sessionData, ...existingSessions];
      localStorage.setItem(`sessions_${course.id}`, JSON.stringify(updatedSessions));

      // Update state
      setSessions(updatedSessions);
      
      // Send notifications to enrolled students
      await sendSessionNotifications(sessionData);

      showMessage('تم إنشاء الجلسة بنجاح وإرسال الإشعارات للطلاب!');
      setShowCreateForm(false);
      resetForm();

      if (onSessionCreated) {
        onSessionCreated(sessionData);
      }

    } catch (error) {
      console.error('Error creating session:', error);
      showMessage('حدث خطأ في إنشاء الجلسة', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const sendSessionNotifications = async (session: Session) => {
    try {
      const token = getAuthToken();
      if (!token) return;

      // This would normally call the backend API to send notifications
      // For now, we'll simulate it by storing notification data
      const notificationData = {
        id: `notif_${Date.now()}`,
        type: 'session_created',
        title: 'جلسة جديدة متاحة',
        message: `تم إنشاء جلسة جديدة "${session.title}" في دورة "${course.title}"`,
        action_url: session.webrtc_join_url,
        action_text: 'انضم للجلسة',
        created_at: new Date().toISOString(),
        is_read: false
      };

      // Store notification for demo purposes
      const existingNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
      existingNotifications.unshift(notificationData);
      localStorage.setItem('notifications', JSON.stringify(existingNotifications));

      console.log('📧 Notification sent to enrolled students:', notificationData);
    } catch (error) {
      console.error('Error sending notifications:', error);
    }
  };

  const resetForm = () => {
    setSessionForm({
      title: '',
      description: '',
      scheduled_time: '',
      duration_minutes: 60
    });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled': return 'مجدولة';
      case 'active': return 'نشطة';
      case 'completed': return 'مكتملة';
      case 'cancelled': return 'ملغية';
      default: return status;
    }
  };

  // Only show session manager for individual courses that are approved
  if (course.learning_path !== 'individual' || course.status !== 'approved') {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">
          <i className="fas fa-video me-2 text-green-600"></i>
          إدارة الجلسات
        </h2>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <i className="fas fa-plus me-2"></i>
          إنشاء جلسة جديدة
        </button>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          <i className="fas fa-check-circle me-2"></i>
          {success}
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <i className="fas fa-exclamation-circle me-2"></i>
          {error}
        </div>
      )}

      {/* Course Info */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-gray-800 mb-2">معلومات الدورة</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-600">النوع:</span>
            <span className="ms-2 font-medium">
              {course.individual_subtype === 'family' ? 'فردي عائلي' : 'فردي عادي'}
            </span>
          </div>
          <div>
            <span className="text-gray-600">الحد الأقصى للمشاركين:</span>
            <span className="ms-2 font-medium">
              {course.individual_subtype === 'family' ? `${course.family_size} أفراد` : '1 طالب'}
            </span>
          </div>
          <div>
            <span className="text-gray-600">الحالة:</span>
            <span className="ms-2 px-2 py-1 rounded text-xs bg-green-100 text-green-800">
              معتمدة
            </span>
          </div>
        </div>
      </div>

      {/* Sessions List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8">
            <i className="fas fa-spinner fa-spin text-2xl text-gray-400 mb-2"></i>
            <p className="text-gray-600">جاري تحميل الجلسات...</p>
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-12">
            <i className="fas fa-video text-6xl text-gray-300 mb-4"></i>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">لا توجد جلسات بعد</h3>
            <p className="text-gray-500 mb-6">ابدأ بإنشاء أول جلسة لدورتك</p>
          </div>
        ) : (
          sessions.map((session) => (
            <div key={session.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold text-gray-800">{session.title}</h3>
                  <span className={`px-2 py-1 rounded text-xs ${getStatusColor(session.status)}`}>
                    {getStatusText(session.status)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigator.clipboard.writeText(session.webrtc_join_url)}
                    className="bg-blue-100 hover:bg-blue-200 text-blue-700 p-2 rounded-lg transition-colors text-sm"
                    title="نسخ رابط الجلسة"
                  >
                    <i className="fas fa-copy"></i>
                  </button>
                  <a
                    href={session.webrtc_join_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-green-100 hover:bg-green-200 text-green-700 p-2 rounded-lg transition-colors text-sm"
                    title="دخول الجلسة"
                  >
                    <i className="fas fa-external-link-alt"></i>
                  </a>
                </div>
              </div>
              
              <p className="text-gray-600 text-sm mb-3">{session.description}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-500">
                <div>
                  <i className="fas fa-calendar me-1"></i>
                  {formatDateTime(session.scheduled_time)}
                </div>
                <div>
                  <i className="fas fa-clock me-1"></i>
                  {session.duration_minutes} دقيقة
                </div>
                <div>
                  <i className="fas fa-users me-1"></i>
                  {session.current_participants}/{session.max_participants} مشارك
                </div>
                <div>
                  <i className="fas fa-link me-1"></i>
                  غرفة: {session.webrtc_room_id}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Session Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">
                  <i className="fas fa-plus-circle me-2 text-green-600"></i>
                  إنشاء جلسة جديدة
                </h2>
                <button
                  onClick={() => {
                    setShowCreateForm(false);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>

              <form onSubmit={createSession} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <i className="fas fa-heading me-2"></i>
                    عنوان الجلسة *
                  </label>
                  <input
                    type="text"
                    value={sessionForm.title}
                    onChange={(e) => setSessionForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="مثال: جلسة تحفيظ سورة البقرة"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <i className="fas fa-align-left me-2"></i>
                    وصف الجلسة
                  </label>
                  <textarea
                    value={sessionForm.description}
                    onChange={(e) => setSessionForm(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="اكتب وصفاً مختصراً عن محتوى الجلسة..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <i className="fas fa-calendar-alt me-2"></i>
                    موعد الجلسة *
                  </label>
                  <input
                    type="datetime-local"
                    value={sessionForm.scheduled_time}
                    onChange={(e) => setSessionForm(prev => ({ ...prev, scheduled_time: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    min={new Date().toISOString().slice(0, 16)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <i className="fas fa-clock me-2"></i>
                    مدة الجلسة (بالدقائق) *
                  </label>
                  <select
                    value={sessionForm.duration_minutes}
                    onChange={(e) => setSessionForm(prev => ({ ...prev, duration_minutes: parseInt(e.target.value) }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value={30}>30 دقيقة</option>
                    <option value={45}>45 دقيقة</option>
                    <option value={60}>60 دقيقة</option>
                    <option value={90}>90 دقيقة</option>
                    <option value={120}>120 دقيقة</option>
                  </select>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    <i className="fas fa-info-circle me-2"></i>
                    سيتم إنشاء رابط خاص بالجلسة وإرسال إشعارات للطلاب المسجلين في الدورة.
                    {course.individual_subtype === 'family' && (
                      <span className="block mt-1">
                        <i className="fas fa-users me-1"></i>
                        الحد الأقصى للمشاركين: {course.family_size} أفراد
                      </span>
                    )}
                  </p>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    {isLoading ? (
                      <>
                        <i className="fas fa-spinner fa-spin me-2"></i>
                        جاري الإنشاء...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-video me-2"></i>
                        إنشاء الجلسة
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false);
                      resetForm();
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
