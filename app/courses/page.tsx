"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Video, BookOpen, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CoursesPage() {
  const router = useRouter();

  const handleCardClick = (path: string) => {
    router.push(path);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950" dir="rtl">
      <div className="container mx-auto px-4 py-12 md:py-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            الدورات التعليمية
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            اختر نوع الدورة التي تريد استكشافها
          </p>
        </motion.div>

        {/* Cards Grid */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Live Courses Card */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card
              className="group cursor-pointer h-full transition-all duration-300 hover:shadow-2xl hover:scale-105 border-2 hover:border-blue-500 dark:hover:border-blue-400 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20"
              onClick={() => handleCardClick("/live-courses")}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Video className="w-8 h-8 text-white" />
                  </div>
                  <ArrowLeft className="w-6 h-6 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-2 transition-all duration-300" />
                </div>
                <CardTitle className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  الدورات المباشرة
                </CardTitle>
                <CardDescription className="text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                  انضم إلى الدورات المباشرة مع المعلمين في الوقت الفعلي. تفاعل مباشر، مناقشات حية، وتعلم تفاعلي مع زملائك في الفصل.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>تعليم مباشر مع المعلمين</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>تفاعل مباشر مع الطلاب</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>جلسات حية في أوقات محددة</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recorded Courses Card */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card
              className="group cursor-pointer h-full transition-all duration-300 hover:shadow-2xl hover:scale-105 border-2 hover:border-green-500 dark:hover:border-green-400 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20"
              onClick={() => handleCardClick("/recorded-courses")}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <BookOpen className="w-8 h-8 text-white" />
                  </div>
                  <ArrowLeft className="w-6 h-6 text-gray-400 group-hover:text-green-500 group-hover:translate-x-2 transition-all duration-300" />
                </div>
                <CardTitle className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  الدورات المسجلة
                </CardTitle>
                <CardDescription className="text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                  تعلم في الوقت الذي يناسبك مع الدورات المسجلة. شاهد الدروس متى شئت، كرر المحتوى حسب حاجتك، وتعلم بوتيرتك الخاصة.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>تعلم في أي وقت يناسبك</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>إمكانية إعادة المشاهدة</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>محتوى مسجل عالي الجودة</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="flex justify-center mt-12"
        >
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            العودة
          </Button>
        </motion.div>
      </div>
    </div>
  );
}

