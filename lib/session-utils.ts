import { LiveSession } from '@/types/session';

export type SessionStatus = 'upcoming' | 'live' | 'ended' | 'cancelled' | 'postponed';

interface SessionTimeInfo {
  status: SessionStatus;
  formattedDate: string;
  formattedTime: string;
  duration: string;
  isLive: boolean;
  isUpcoming: boolean;
  isEnded: boolean;
}

export function getSessionStatus(session: LiveSession): SessionStatus {
  const now = new Date();
  const start = new Date(session.scheduled_start);
  const end = new Date(session.scheduled_end);
  
  if (session.status === 'cancelled') return 'cancelled';
  if (session.status === 'postponed') return 'postponed';
  
  if (now < start) return 'upcoming';
  if (now >= start && now <= end) return 'live';
  return 'ended';
}

export function formatSessionTime(date: string | Date, locale = 'ar-SA'): string {
  return new Date(date).toLocaleString(locale, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatSessionTimeShort(date: string | Date, locale = 'ar-SA'): string {
  return new Date(date).toLocaleString(locale, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDuration(start: string | Date, end: string | Date): string {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const duration = (endDate.getTime() - startDate.getTime()) / (1000 * 60); // in minutes
  
  if (duration < 60) {
    return `${Math.floor(duration)} دقيقة`;
  }
  
  const hours = Math.floor(duration / 60);
  const minutes = Math.floor(duration % 60);
  
  if (minutes === 0) {
    return `${hours} ساعة`;
  }
  
  return `${hours} ساعة و ${minutes} دقيقة`;
}

export function getSessionTimeInfo(session: LiveSession): SessionTimeInfo {
  const status = getSessionStatus(session);
  
  return {
    status,
    formattedDate: formatSessionTime(session.scheduled_start),
    formattedTime: formatSessionTimeShort(session.scheduled_start),
    duration: formatDuration(session.scheduled_start, session.scheduled_end),
    isLive: status === 'live',
    isUpcoming: status === 'upcoming',
    isEnded: status === 'ended' || status === 'cancelled' || status === 'postponed',
  };
}

export function getStatusBadgeVariant(status: SessionStatus) {
  switch (status) {
    case 'live':
      return 'destructive';
    case 'upcoming':
      return 'default';
    case 'cancelled':
    case 'postponed':
      return 'outline';
    case 'ended':
    default:
      return 'secondary';
  }
}

export function getStatusBadgeText(status: SessionStatus) {
  switch (status) {
    case 'live':
      return 'مباشر الآن';
    case 'upcoming':
      return 'قريباً';
    case 'cancelled':
      return 'ملغي';
    case 'postponed':
      return 'مؤجل';
    case 'ended':
    default:
      return 'انتهت الجلسة';
  }
}
