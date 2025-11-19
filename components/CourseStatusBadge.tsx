'use client';

interface CourseStatusBadgeProps {
  status: string;
  className?: string;
}

export default function CourseStatusBadge({ status, className = '' }: CourseStatusBadgeProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          text: 'في انتظار الموافقة',
          icon: 'fas fa-clock',
          bgColor: 'bg-yellow-100',
          textColor: 'text-yellow-800',
          borderColor: 'border-yellow-200'
        };
      case 'approved':
        return {
          text: 'معتمدة',
          icon: 'fas fa-check-circle',
          bgColor: 'bg-green-100',
          textColor: 'text-green-800',
          borderColor: 'border-green-200'
        };
      case 'active':
        return {
          text: 'نشطة',
          icon: 'fas fa-play-circle',
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-800',
          borderColor: 'border-blue-200'
        };
      case 'completed':
        return {
          text: 'مكتملة',
          icon: 'fas fa-flag-checkered',
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800',
          borderColor: 'border-gray-200'
        };
      case 'cancelled':
        return {
          text: 'ملغية',
          icon: 'fas fa-times-circle',
          bgColor: 'bg-red-100',
          textColor: 'text-red-800',
          borderColor: 'border-red-200'
        };
      case 'draft':
        return {
          text: 'مسودة',
          icon: 'fas fa-edit',
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-600',
          borderColor: 'border-gray-200'
        };
      case 'rejected':
        return {
          text: 'مرفوضة',
          icon: 'fas fa-exclamation-triangle',
          bgColor: 'bg-red-100',
          textColor: 'text-red-800',
          borderColor: 'border-red-200'
        };
      default:
        return {
          text: status,
          icon: 'fas fa-question-circle',
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-600',
          borderColor: 'border-gray-200'
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <span className={`
      inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border
      ${config.bgColor} ${config.textColor} ${config.borderColor} ${className}
    `}>
      <i className={`${config.icon} me-2`}></i>
      {config.text}
    </span>
  );
}
