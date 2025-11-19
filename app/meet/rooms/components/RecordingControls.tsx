'use client';

import React, { useState, useEffect } from 'react';
import { recordingService, Recording } from '@/lib/api/recording';
import toast from 'react-hot-toast';

interface RecordingControlsProps {
  sessionId: string;
  isTeacher: boolean;
}

export function RecordingControls({ sessionId, isTeacher }: RecordingControlsProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [currentRecording, setCurrentRecording] = useState<Recording | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);

  // Check for active recording on mount
  useEffect(() => {
    if (!isTeacher) return;

    const checkActiveRecording = async () => {
      try {
        setCheckingStatus(true);
        const response = await recordingService.listRecordings(sessionId);
        // Find active recording (only processing - not uploading, as uploading means recording was stopped)
        const recordings = response?.recordings || response?.results || [];
        const activeRecording = recordings.find(
          (rec: Recording) => rec.status === 'processing'
        );
        
        if (activeRecording) {
          setCurrentRecording(activeRecording);
          setIsRecording(true);
        }
      } catch (error) {
        // Silently fail - recording might not exist yet
        console.debug('No active recording found');
      } finally {
        setCheckingStatus(false);
      }
    };

    checkActiveRecording();
  }, [sessionId, isTeacher]);

  if (!isTeacher) return null;

  const handleStartRecording = async () => {
    try {
      setLoading(true);
      const recording = await recordingService.startRecording(sessionId);
      console.log('Recording started:', recording);
      setCurrentRecording(recording);
      setIsRecording(true);
      toast.success('بدأ التسجيل 🎥');
      
      // Re-check recording status after a short delay to ensure it's saved
      setTimeout(async () => {
        try {
          const response = await recordingService.listRecordings(sessionId);
          const recordings = response?.recordings || response?.results || [];
          const activeRecording = recordings.find(
            (rec: Recording) => rec.status === 'processing'
          );
          if (activeRecording) {
            setCurrentRecording(activeRecording);
            setIsRecording(true);
          }
        } catch (error) {
          console.debug('Failed to refresh recording status:', error);
        }
      }, 2000);
    } catch (error: any) {
      console.error('Failed to start recording:', error);
      
      // If recording already exists, fetch it and update UI
      if (error.message?.includes('يوجد تسجيل قيد التشغيل') || 
          error.message?.includes('Recording already in progress')) {
        try {
          // Try to extract recording_id from error if available
          const errorData = error?.appError?.originalError || error?.originalError;
          const recordingId = errorData?.recording_id;
          
          if (recordingId) {
            // Fetch the existing recording
            const existingRecording = await recordingService.getRecording(sessionId, recordingId);
            setCurrentRecording(existingRecording);
            setIsRecording(true);
            toast.success('التسجيل قيد التشغيل بالفعل 🎥');
            return;
          }
          
          // Fallback: check for active recordings
          const response = await recordingService.listRecordings(sessionId);
          const recordings = response?.recordings || response?.results || [];
          const activeRecording = recordings.find(
            (rec: Recording) => rec.status === 'processing'
          );
          if (activeRecording) {
            setCurrentRecording(activeRecording);
            setIsRecording(true);
            toast.success('التسجيل قيد التشغيل بالفعل 🎥');
            return;
          }
        } catch (fetchError) {
          console.error('Failed to fetch existing recording:', fetchError);
        }
      }
      
      toast.error(error.message || 'فشل بدء التسجيل');
    } finally {
      setLoading(false);
    }
  };

  const handleStopRecording = async () => {
    if (!currentRecording) return;

    try {
      setLoading(true);
      const updatedRecording = await recordingService.stopRecording(sessionId, currentRecording.id);
      console.log('Recording stopped:', updatedRecording);
      
      // Clear the recording state immediately after stopping
      setCurrentRecording(null);
      setIsRecording(false);
      toast.success('تم إيقاف التسجيل ✅');
      
      // Re-check status after a short delay to ensure backend has updated
      setTimeout(async () => {
        try {
          const response = await recordingService.listRecordings(sessionId);
          const recordings = response?.recordings || response?.results || [];
          const activeRecording = recordings.find(
            (rec: Recording) => rec.status === 'processing'
          );
          // Only update if there's actually a new active recording
          if (!activeRecording) {
            setCurrentRecording(null);
            setIsRecording(false);
          }
        } catch (error) {
          console.debug('Failed to refresh recording status after stop:', error);
        }
      }, 1000);
    } catch (error: any) {
      console.error('Failed to stop recording:', error);
      toast.error(error.message || 'فشل إيقاف التسجيل');
    } finally {
      setLoading(false);
    }
  };

  if (checkingStatus) {
    return (
      <div className="fixed top-4 left-4 z-50 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="fixed top-4 left-4 z-50 flex flex-col sm:flex-row items-start sm:items-center gap-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2 sm:p-3">
      {isRecording && (
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full animate-pulse" />
          <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
            جاري التسجيل
          </span>
        </div>
      )}
      
      <button
        onClick={isRecording ? handleStopRecording : handleStartRecording}
        disabled={loading}
        className={`px-3 py-2 sm:px-4 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-colors touch-manipulation min-w-[44px] min-h-[44px] ${
          isRecording
            ? 'bg-red-500 hover:bg-red-600 active:bg-red-700 text-white'
            : 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {loading ? (
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span className="hidden sm:inline">جاري...</span>
          </span>
        ) : isRecording ? (
          <span className="flex items-center gap-1">
            <span>⏹</span>
            <span className="hidden sm:inline">إيقاف</span>
          </span>
        ) : (
          <span className="flex items-center gap-1">
            <span>🎥</span>
            <span className="hidden sm:inline">بدء التسجيل</span>
          </span>
        )}
      </button>
    </div>
  );
}