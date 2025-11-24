import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import type { StepConfig } from '../types';

interface StepIndicatorProps {
  steps: StepConfig[];
  currentStep: number;
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="mb-8">
      <div className="relative">
        {/* Progress Line */}
        <div className="absolute top-6 right-0 left-0 h-1 bg-slate-200 dark:bg-slate-700 -z-10">
          <motion.div
            className="h-full bg-gradient-to-r from-amber-500 to-orange-500"
            initial={{ width: '0%' }}
            animate={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Circles Row */}
        <div className="flex justify-between items-start relative z-10 mb-2">
          {steps.map((step) => {
            const Icon = step.icon;
            const isCompleted = currentStep > step.id;
            const isCurrent = currentStep === step.id;

            return (
              <div key={step.id} className="flex flex-col items-center flex-1">
                <motion.div
                  className={`
                    w-12 h-12 rounded-full flex items-center justify-center
                    ${isCurrent ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg' : ''}
                    ${isCompleted ? 'bg-blue-500 text-white' : ''}
                    ${!isCurrent && !isCompleted ? 'bg-white dark:bg-slate-800 text-slate-400 border-2 border-slate-200 dark:border-slate-700' : ''}
                  `}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isCompleted ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    <Icon className="w-6 h-6" />
                  )}
                </motion.div>
              </div>
            );
          })}
        </div>

        {/* Labels Row */}
        <div className="flex justify-between items-start relative z-10 mt-2">
          {steps.map((step) => {
            const isCurrent = currentStep === step.id;

            return (
              <div key={step.id} className="flex flex-col items-center flex-1 px-1">
                <span className={`text-xs md:text-sm font-medium text-center leading-tight ${isCurrent ? 'text-amber-600 dark:text-amber-400' : 'text-slate-600 dark:text-slate-400'}`}>
                  {step.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

