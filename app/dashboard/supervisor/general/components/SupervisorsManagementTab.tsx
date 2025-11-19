'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GraduationCap, Mail } from 'lucide-react';
import AcademicSupervisorsTab from './AcademicSupervisorsTab';
import InvitationsTab from './InvitationsTab';

const SupervisorsManagementTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative bg-gradient-to-br from-amber-50/80 via-orange-50/60 to-amber-50/80 dark:from-amber-900/20 dark:via-orange-900/10 dark:to-amber-900/20 p-6 rounded-2xl border border-amber-200/50 dark:border-amber-700/30 shadow-lg overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-200/30 to-orange-200/20 dark:from-amber-600/20 dark:to-orange-700/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-orange-200/20 to-amber-200/30 dark:from-orange-600/10 dark:to-amber-700/20 rounded-full blur-2xl" />
        
        <div className="relative z-10">
          <h2 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-amber-900 via-orange-700 to-amber-800 dark:from-amber-300 dark:via-orange-400 dark:to-amber-400 bg-clip-text text-transparent mb-2">
            إدارة المشرفين
          </h2>
          <p className="text-gray-700 dark:text-slate-300 font-medium">إدارة المشرفين الأكاديميين ودعوات الانضمام</p>
        </div>
      </motion.div>

      <Tabs defaultValue="supervisors" className="w-full" dir="rtl">
        <TabsList className="inline-flex h-14 w-full items-center justify-start rounded-2xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl p-2 gap-2 border-2 border-amber-200/50 dark:border-amber-800/40 shadow-lg overflow-hidden">
          <TabsTrigger 
            value="supervisors" 
            className="flex-1 h-full data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:via-amber-600 data-[state=active]:to-orange-600 data-[state=active]:text-white data-[state=active]:shadow-sm rounded-lg transition-all duration-300 flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold data-[state=inactive]:text-gray-600 dark:data-[state=inactive]:text-gray-400 data-[state=inactive]:bg-transparent data-[state=inactive]:hover:bg-amber-50/60 dark:data-[state=inactive]:hover:bg-amber-950/30 data-[state=inactive]:hover:text-amber-700 dark:data-[state=inactive]:hover:text-amber-400"
          >
            <GraduationCap className="w-4 h-4 shrink-0" />
            <span className="whitespace-nowrap text-xs sm:text-sm">المشرفين الأكاديميين</span>
          </TabsTrigger>
          <TabsTrigger 
            value="invitations" 
            className="flex-1 h-full data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:via-amber-600 data-[state=active]:to-orange-600 data-[state=active]:text-white data-[state=active]:shadow-sm rounded-lg transition-all duration-300 flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold data-[state=inactive]:text-gray-600 dark:data-[state=inactive]:text-gray-400 data-[state=inactive]:bg-transparent data-[state=inactive]:hover:bg-amber-50/60 dark:data-[state=inactive]:hover:bg-amber-950/30 data-[state=inactive]:hover:text-amber-700 dark:data-[state=inactive]:hover:text-amber-400"
          >
            <Mail className="w-4 h-4 shrink-0" />
            <span className="whitespace-nowrap text-xs sm:text-sm">دعوات الانضمام</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="supervisors" className="mt-6">
          <AcademicSupervisorsTab />
        </TabsContent>

        <TabsContent value="invitations" className="mt-6">
          <InvitationsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SupervisorsManagementTab;
