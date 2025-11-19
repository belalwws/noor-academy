'use client';

import { useState } from 'react';

interface JoinSessionButtonProps {
  sessionUrl: string;
  sessionTitle: string;
  maxParticipants: number;
  currentParticipants: number;
  isActive?: boolean;
  className?: string;
}

export default function JoinSessionButton({
  sessionUrl,
  sessionTitle,
  maxParticipants,
  currentParticipants,
  isActive = true,
  className = ''
}: JoinSessionButtonProps) {
  const [isJoining, setIsJoining] = useState(false);

  const handleJoinSession = async () => {
    if (!isActive || currentParticipants >= maxParticipants) {
      return;
    }

    setIsJoining(true);
    
    try {
      // Open the session in a new window/tab
      const sessionWindow = window.open(sessionUrl, '_blank', 'width=1200,height=800');
      
      if (sessionWindow) {
        // Focus on the new window
        sessionWindow.focus();
        
        // Optional: Track that user joined (could send to analytics or backend)
        console.log(`User joined session: ${sessionTitle}`);
      } else {
        // Fallback if popup was blocked
        window.location.href = sessionUrl;
      }
    } catch (error) {
      console.error('Error joining session:', error);
    } finally {
      setIsJoining(false);
    }
  };

  const canJoin = isActive && currentParticipants < maxParticipants;
  const isFull = currentParticipants >= maxParticipants;

  return (
    <div className={`${className}`}>
      <button
        onClick={handleJoinSession}
        disabled={!canJoin || isJoining}
        className={`
          inline-flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-200
          ${canJoin 
            ? 'bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5' 
            : isFull 
              ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }
          ${isJoining ? 'opacity-75' : ''}
        `}
        title={
          !isActive 
            ? 'الجلسة غير نشطة' 
            : isFull 
              ? 'الجلسة مكتملة العدد' 
              : `انضم إلى ${sessionTitle}`
        }
      >
        {isJoining ? (
          <>
            <i className="fas fa-spinner fa-spin me-2"></i>
            جاري الانضمام...
          </>
        ) : !isActive ? (
          <>
            <i className="fas fa-pause-circle me-2"></i>
            الجلسة غير نشطة
          </>
        ) : isFull ? (
          <>
            <i className="fas fa-users me-2"></i>
            الجلسة مكتملة ({currentParticipants}/{maxParticipants})
          </>
        ) : (
          <>
            <i className="fas fa-video me-2"></i>
            انضم للجلسة ({currentParticipants}/{maxParticipants})
          </>
        )}
      </button>
      
      {canJoin && (
        <p className="text-xs text-gray-600 mt-1 text-center">
          <i className="fas fa-info-circle me-1"></i>
          سيتم فتح الجلسة في نافذة جديدة
        </p>
      )}
    </div>
  );
}
