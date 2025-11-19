'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const buttonVariants = {
  primary: 'gradient-primary text-white shadow-glow hover:shadow-xl hover:scale-105',
  secondary: 'bg-white dark:bg-slate-800 text-primary dark:text-primary border-2 border-primary hover:bg-primary/5 dark:hover:bg-primary/10 hover:scale-105',
  outline: 'border-2 border-gray-300 dark:border-slate-600 text-text-primary dark:text-slate-200 hover:border-primary hover:text-primary hover:scale-105',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-xl font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <button
      className={cn(baseStyles, buttonVariants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
};

export type { ButtonProps };
export { buttonVariants };

