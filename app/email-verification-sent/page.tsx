'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import apiService from '../../lib/api';

export default function EmailVerificationSentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const [resendMessageType, setResendMessageType] = useState<'success' | 'error' | ''>('');
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam));
    }
  }, [searchParams]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleResendVerification = async () => {
    if (!email) {
      setResendMessage('البريد الإلكتروني مطلوب');
      setResendMessageType('error');
      return;
    }

    setIsResending(true);
    setResendMessage('');

    try {
      const result = await apiService.sendEmailVerification(email);
      
      if (result.success) {
        setResendMessage('✅ تم إرسال رابط التحقق بنجاح! يرجى فحص بريدك الإلكتروني.');
        setResendMessageType('success');
        setCountdown(60); // 60 second cooldown
      } else {
        setResendMessage(result.error || '❌ حدث خطأ في إرسال رابط التحقق');
        setResendMessageType('error');
      }
    } catch (error) {
      setResendMessage('❌ حدث خطأ في الاتصال بالخادم');
      setResendMessageType('error');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <>
      <style jsx>{`
        body {
          font-family: 'Cairo', 'Amiri', Arial, sans-serif;
          background: linear-gradient(135deg, #1B5E20 0%, #2E7D32 50%, #388E3C 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0;
          padding: 0;
        }
        
        .verification-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #1B5E20 0%, #2E7D32 50%, #388E3C 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        
        .verification-card {
          background: white;
          border-radius: 15px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.2);
          padding: 2rem;
          max-width: 500px;
          width: 100%;
          text-align: center;
        }
        
        .verification-icon {
          font-size: 4rem;
          color: #1B5E20;
          margin-bottom: 1rem;
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
        
        .islamic-quote {
          color: #666;
          font-style: italic;
          margin: 1rem 0;
          padding: 1rem;
          background: #f8f9fa;
          border-right: 4px solid #1B5E20;
          border-radius: 5px;
          font-family: 'Amiri', serif;
        }
        
        .btn-verify {
          background: linear-gradient(45deg, #1B5E20, #2E7D32);
          border: none;
          color: white;
          padding: 12px 30px;
          border-radius: 25px;
          font-weight: 600;
          transition: all 0.3s ease;
          cursor: pointer;
          font-size: 16px;
        }
        
        .btn-verify:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(27, 94, 32, 0.4);
          color: white;
        }
        
        .btn-verify:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }
        
        .btn-outline {
          background: transparent;
          border: 2px solid #1B5E20;
          color: #1B5E20;
          padding: 12px 30px;
          border-radius: 25px;
          font-weight: 600;
          transition: all 0.3s ease;
          cursor: pointer;
          font-size: 16px;
          text-decoration: none;
          display: inline-block;
        }
        
        .btn-outline:hover {
          background: #1B5E20;
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(27, 94, 32, 0.4);
        }
        
        .alert {
          margin-top: 1rem;
          padding: 1rem;
          border-radius: 8px;
          font-size: 14px;
        }
        
        .alert-info {
          background: #d1ecf1;
          color: #0c5460;
          border: 1px solid #bee5eb;
        }
        
        .alert-success {
          background: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        }
        
        .alert-error {
          background: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }
        
        .resend-section {
          margin-top: 2rem;
          padding-top: 2rem;
          border-top: 1px solid #eee;
        }
        
        .countdown {
          font-weight: bold;
          color: #1B5E20;
        }
        
        .spinner {
          display: inline-block;
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,.3);
          border-radius: 50%;
          border-top-color: #fff;
          animation: spin 1s linear infinite;
          margin-right: 8px;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .email-highlight {
          color: #1B5E20;
          font-weight: 600;
          word-break: break-all;
        }
        
        @media (max-width: 768px) {
          .verification-card {
            padding: 1.5rem;
            margin: 10px;
          }
          
          .verification-icon {
            font-size: 3rem;
          }
        }
      `}</style>

      <div className="verification-page">
        <div className="verification-card">
          <div className="verification-icon">
            <i className="fas fa-envelope-circle-check"></i>
          </div>
          
          <h2 style={{ marginBottom: '1rem', color: '#333' }}>
            تأكيد البريد الإلكتروني
          </h2>
          
          <div className="islamic-quote">
            "وَقُل رَّبِّ زِدْنِي عِلْمًا" - سورة طه
          </div>
          
          {email ? (
            <p style={{ marginBottom: '1rem' }}>
              تم إرسال رسالة تحقق إلى بريدكم الإلكتروني:<br />
              <span className="email-highlight">{email}</span>
            </p>
          ) : (
            <p style={{ marginBottom: '1rem' }}>
              تم إرسال رسالة تحقق إلى بريدكم الإلكتروني
            </p>
          )}
          
          <p style={{ color: '#666', marginBottom: '1rem' }}>
            يرجى فتح بريدكم الإلكتروني والنقر على رابط التحقق لتفعيل حسابكم في أكاديمية لسان الحكمة.
          </p>
          
          <div className="alert alert-info">
            <i className="fas fa-info-circle" style={{ marginLeft: '8px' }}></i>
            إذا لم تجدوا الرسالة في البريد الوارد، يرجى فحص مجلد الرسائل المزعجة (Spam).
          </div>
          
          <div className="resend-section">
            <p style={{ color: '#666', marginBottom: '1rem' }}>
              لم تصلكم رسالة التحقق؟
            </p>
            
            {countdown > 0 ? (
              <div style={{ marginBottom: '1rem' }}>
                يمكنكم طلب رمز جديد خلال <span className="countdown">{countdown}</span> ثانية
              </div>
            ) : (
              <button
                className="btn-verify"
                onClick={handleResendVerification}
                disabled={isResending || countdown > 0}
              >
                {isResending ? (
                  <>
                    <span className="spinner"></span>
                    جاري الإرسال...
                  </>
                ) : (
                  <>
                    <i className="fas fa-paper-plane" style={{ marginLeft: '8px' }}></i>
                    إعادة إرسال رمز التحقق
                  </>
                )}
              </button>
            )}
            
            {resendMessage && (
              <div className={`alert alert-${resendMessageType}`}>
                {resendMessage}
              </div>
            )}
          </div>
          
          <div style={{ marginTop: '2rem', display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/login" className="btn-outline">
              <i className="fas fa-sign-in-alt" style={{ marginLeft: '5px' }}></i>
              تسجيل الدخول
            </Link>
            <Link href="/" className="btn-outline">
              <i className="fas fa-home" style={{ marginLeft: '5px' }}></i>
              الصفحة الرئيسية
            </Link>
          </div>
        </div>
      </div>
    </>
  );
} 
