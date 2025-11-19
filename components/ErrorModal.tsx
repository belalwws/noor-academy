'use client';

import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface ErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  details?: string[];
  onLogin?: () => void;
  showLoginButton?: boolean;
}

export default function ErrorModal({
  isOpen,
  onClose,
  title,
  message,
  details,
  onLogin,
  showLoginButton = false
}: ErrorModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md z-[9999] border-2 border-red-200 dark:border-red-800">
        <DialogHeader>
          <DialogTitle className="text-red-600 dark:text-red-400 flex items-center gap-2">
            <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <X className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            {title}
          </DialogTitle>
          <DialogDescription>
            {message}
          </DialogDescription>
        </DialogHeader>
        
        {details && details.length > 0 && (
          <div className="mt-4">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2 text-right">تفاصيل المشكلة:</h4>
            <ul className="space-y-2 text-right">
              {details.map((detail, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <div className="w-1.5 h-1.5 bg-red-400 dark:bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>{detail}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        <div className="flex gap-3 justify-start mt-6">
          <Button
            onClick={onClose}
            className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            فهمت
          </Button>
          {showLoginButton && onLogin && (
            <Button
              onClick={onLogin}
              className="px-4 py-2 text-sm bg-red-600 text-white hover:bg-red-700"
            >
              تسجيل الدخول
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
