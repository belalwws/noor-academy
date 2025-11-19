'use client'

import React, { useEffect } from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { AlertCircle, RefreshCw } from 'lucide-react'

interface CommunityErrorProps {
  error: string
  onRetry?: () => void
  retryCount?: number
  maxRetries?: number
  operation?: string
}

const CommunityError = ({ 
  error, 
  onRetry, 
  retryCount = 0, 
  maxRetries = 3,
  operation = 'general'
}: CommunityErrorProps) => {
  // Log error to console for debugging
  useEffect(() => {
    console.error(`Community Error in ${operation}:`, error)
  }, [error, operation])

  // Get specific error message based on error type
  const getSpecificErrorMessage = () => {
    if (error.includes('401')) {
      return 'يجب تسجيل الدخول للوصول إلى هذه الميزة'
    } else if (error.includes('403')) {
      return 'ليس لديك الصلاحية للوصول إلى هذا المحتوى'
    } else if (error.includes('404')) {
      return 'لم يتم العثور على المورد المطلوب'
    } else if (error.includes('500')) {
      return 'حدث خطأ في الخادم. يرجى المحاولة لاحقاً'
    } else if (error.includes('Network Error') || error.includes('failed to fetch')) {
      return 'فشل الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت'
    }
    return error
  }

  // Get retry button text based on operation
  const getRetryButtonText = () => {
    switch (operation) {
      case 'forums':
        return 'إعادة تحميل المنتديات'
      case 'topics':
        return 'إعادة تحميل المواضيع'
      case 'posts':
        return 'إعادة تحميل المشاركات'
      default:
        return 'إعادة المحاولة'
    }
  }

  return (
    <Alert className="mb-6 border-red-200 bg-red-50" dir="rtl">
      <AlertCircle className="h-4 w-4 text-red-600" />
      <AlertTitle className="text-red-800">خطأ في {operation === 'forums' ? 'المنتديات' : operation === 'topics' ? 'المواضيع' : operation === 'posts' ? 'المشاركات' : 'النظام'}</AlertTitle>
      <AlertDescription className="text-red-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <span>{getSpecificErrorMessage()}</span>
        {onRetry && retryCount < maxRetries && (
          <Button 
            variant="outline"
            size="sm"
            className="border-red-300 text-red-700 hover:bg-red-100 mt-2 sm:mt-0"
            onClick={onRetry}
          >
            <RefreshCw className="h-4 w-4 ml-2" />
            {getRetryButtonText()}
          </Button>
        )}
      </AlertDescription>
    </Alert>
  )
}

export default CommunityError
