'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAppDispatch } from '../../../../lib/hooks';
import { login } from '../../../../lib/store';
import { saveAuthData } from '../../../../lib/auth';
import { apiClient } from '../../../../lib/api';

interface PageParams {
  uidb64: string;
  token: string;
  [key: string]: string | string[];
}

export default function EmailVerificationPage() {
  const router = useRouter();
  const params = useParams<PageParams>();
  const dispatch = useAppDispatch();
  
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('');
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const uidb64 = Array.isArray(params.uidb64) ? params.uidb64[0] : params.uidb64;
        const token = Array.isArray(params.token) ? params.token[0] : params.token;

        if (!uidb64 || !token) {
          setStatus('error');
          setMessage('رابط التحقق غير صحيح. يرجى التأكد من الرابط المرسل إلى بريدك الإلكتروني.');
          return;
        }

        console.log('🔍 Verifying email with:', { uidb64, token });
        
        const result = await apiClient.confirmEmailVerification(uidb64, token);
        
        if (result.success) {
          console.log('✅ Email verification successful:', result.data);
          
          setStatus('success');
          setMessage('تم تأكيد بريدك الإلكتروني بنجاح! مرحباً بك في أكاديمية لسان الحكمة.');
          
          // If we received fresh tokens, save them
          if (result.data?.tokens && result.data?.user) {
            const userData = result.data.user;
            const tokens = result.data.tokens;
            
            // Save auth data with fresh tokens
            saveAuthData({
              user: userData,
              token: tokens.access,
              refreshToken: tokens.refresh
            });
            
            // Update Redux store
            dispatch(login({
              user: userData,
              tokens: tokens
            }));
            
            console.log('🎉 Auth data saved, redirecting to dashboard...');
          }
          
          // Redirect to dashboard after 3 seconds
          setTimeout(() => {
            setIsRedirecting(true);
            router.push('/dashboard/student?verified=true');
          }, 3000);
          
        } else {
          console.log('❌ Email verification failed:', result.error);
          
          setStatus('error');
          
          if (result.error?.includes('expired') || result.error?.includes('invalid')) {
            setMessage('انتهت صلاحية رابط التحقق أو أنه غير صحيح. يرجى طلب رابط جديد.');
          } else {
            setMessage(result.error || 'حدث خطأ في تأكيد البريد الإلكتروني. يرجى المحاولة مرة أخرى.');
          }
        }
        
      } catch (error) {
        console.error('❌ Email verification error:', error);
        setStatus('error');
        setMessage('حدث خطأ في الاتصال بالخادم. يرجى المحاولة مرة أخرى لاحقاً.');
      }
    };

    verifyEmail();
  }, [params, router, dispatch]);

  const handleResendVerification = async () => {
    try {
      const result = await apiClient.resendEmailVerification();
      if (result.success) {
        setMessage('تم إرسال رابط تحقق جديد إلى بريدك الإلكتروني. يرجى فحص صندوق الوارد.');
      } else {
        setMessage(result.error || 'حدث خطأ في إرسال رابط التحقق.');
      }
    } catch (error) {
      setMessage('حدث خطأ في إرسال رابط التحقق.');
    }
  };

  return (
    <>
      <style jsx>{`
        body {
          font-family: 'Cairo', sans-serif;
          background: linear-gradient(135deg, #1B5E20 0%, #2E7D32 50%, #388E3C 100%);
          min-height: 100vh;
          margin: 0;
          padding: 0;
        }
        
        .verification-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          position: relative;
          overflow: hidden;
        }
        
        .verification-page::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
          opacity: 0.1;
        }
        
        .verification-container {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 25px;
          padding: 50px 40px;
          max-width: 500px;
          width: 100%;
          text-align: center;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.3);
          animation: slideIn 0.6s ease-out;
        }
        
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .mosque-icon {
          font-size: 4rem;
          color: #2E7D32;
          margin-bottom: 25px;
          animation: pulse 2s ease-in-out infinite;
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        
        .title {
          font-size: 1.8rem;
          font-weight: 700;
          color: #2E7D32;
          margin-bottom: 30px;
          font-family: 'Cairo', sans-serif;
        }
        
        .status-icon {
          font-size: 5rem;
          margin-bottom: 25px;
          animation: statusPulse 1.5s ease-in-out;
        }
        
        @keyframes statusPulse {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.2); opacity: 0.8; }
          100% { transform: scale(1); opacity: 1; }
        }
        
        .success-icon { color: #28a745; }
        .error-icon { color: #dc3545; }
        .loading-icon { 
          color: #ffc107; 
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .message {
          font-size: 1.1rem;
          line-height: 1.6;
          color: #495057;
          margin-bottom: 30px;
          padding: 20px;
          border-radius: 12px;
          background: rgba(248, 249, 250, 0.7);
          border: 1px solid rgba(222, 226, 230, 0.5);
        }
        
        .success-message {
          background: rgba(212, 237, 218, 0.7);
          border-color: rgba(195, 230, 203, 0.7);
          color: #155724;
        }
        
        .error-message {
          background: rgba(248, 215, 218, 0.7);
          border-color: rgba(245, 198, 203, 0.7);
          color: #721c24;
        }
        
        .actions {
          display: flex;
          flex-direction: column;
          gap: 15px;
          align-items: center;
        }
        
        .btn {
          padding: 12px 25px;
          border-radius: 12px;
          font-weight: 600;
          text-decoration: none;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 1rem;
          min-width: 200px;
        }
        
        .btn-primary {
          background: linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%);
          color: white;
          box-shadow: 0 4px 15px rgba(46, 125, 50, 0.3);
        }
        
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(46, 125, 50, 0.4);
        }
        
        .btn-secondary {
          background: linear-gradient(135deg, #6c757d 0%, #495057 100%);
          color: white;
          box-shadow: 0 4px 15px rgba(108, 117, 125, 0.3);
        }
        
        .btn-secondary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(108, 117, 125, 0.4);
        }
        
        .btn-warning {
          background: linear-gradient(135deg, #ff9800 0%, #ff5722 100%);
          color: white;
          box-shadow: 0 4px 15px rgba(255, 152, 0, 0.3);
        }
        
        .btn-warning:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(255, 152, 0, 0.4);
        }
        
        .countdown {
          font-size: 0.9rem;
          color: #6c757d;
          margin-top: 20px;
          font-style: italic;
        }
        
        .loading-dots {
          display: inline-flex;
          gap: 4px;
          margin-right: 8px;
        }
        
        .dot {
          width: 6px;
          height: 6px;
          background: #ffc107;
          border-radius: 50%;
          animation: bounce 1.4s ease-in-out infinite both;
        }
        
        .dot:nth-child(1) { animation-delay: -0.32s; }
        .dot:nth-child(2) { animation-delay: -0.16s; }
        .dot:nth-child(3) { animation-delay: 0s; }
        
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
          40% { transform: scale(1.2); opacity: 1; }
        }
        
        @media (max-width: 768px) {
          .verification-container {
            padding: 40px 25px;
            margin: 20px;
          }
          
          .mosque-icon {
            font-size: 3rem;
          }
          
          .title {
            font-size: 1.5rem;
          }
          
          .status-icon {
            font-size: 4rem;
          }
        }
      `}</style>

      <div className="verification-page">
        <div className="verification-container">
          <div className="mosque-icon">
            <i className="fas fa-mosque"></i>
          </div>
          
          <h1 className="title">أكاديمية لسان الحكمة</h1>
          
          {status === 'verifying' && (
            <>
              <div className="status-icon loading-icon">
                <i className="fas fa-spinner"></i>
              </div>
              <div className="message">
                <div className="loading-dots">
                  <div className="dot"></div>
                  <div className="dot"></div>
                  <div className="dot"></div>
                </div>
                جاري تأكيد البريد الإلكتروني...
              </div>
            </>
          )}
          
          {status === 'success' && (
            <>
              <div className="status-icon success-icon">
                <i className="fas fa-check-circle"></i>
              </div>
              <div className="message success-message">
                {message}
              </div>
              <div className="actions">
                {isRedirecting ? (
                  <div className="countdown">
                    جاري التوجه إلى لوحة التحكم...
                  </div>
                ) : (
                  <>
                    <button 
                      onClick={() => router.push('/dashboard/student')}
                      className="btn btn-primary"
                    >
                      <i className="fas fa-user-circle me-2"></i>
                      الذهاب إلى لوحة التحكم
                    </button>
                    <div className="countdown">
                      سيتم التوجه تلقائياً خلال 3 ثوانٍ...
                    </div>
                  </>
                )}
              </div>
            </>
          )}
          
          {status === 'error' && (
            <>
              <div className="status-icon error-icon">
                <i className="fas fa-exclamation-triangle"></i>
              </div>
              <div className="message error-message">
                {message}
              </div>
              <div className="actions">
                <button 
                  onClick={handleResendVerification}
                  className="btn btn-warning"
                >
                  <i className="fas fa-paper-plane me-2"></i>
                  إرسال رابط جديد
                </button>
                <button 
                  onClick={() => router.push('/login')}
                  className="btn btn-secondary"
                >
                  <i className="fas fa-sign-in-alt me-2"></i>
                  العودة لتسجيل الدخول
                </button>
                <button 
                  onClick={() => router.push('/')}
                  className="btn btn-primary"
                >
                  <i className="fas fa-home me-2"></i>
                  الصفحة الرئيسية
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}