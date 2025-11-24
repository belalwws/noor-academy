"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Video, Users, BookOpen, ArrowRight, X, Check, User, UsersRound, Sparkles, Clock, MessageCircle, Star, Search } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { getProxiedImageUrl } from "@/lib/imageUtils";

interface Course {
  id: string;
  title: string;
  description: string;
  teacher: {
    user: {
      first_name: string;
      last_name: string;
      profile_image_url?: string;
      profile_image_thumbnail_url?: string;
    };
    profile_image_url?: string;
    profile_image_thumbnail_url?: string;
  };
  created_at: string;
}

export default function LiveTeachingPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedType, setSelectedType] = useState<'individual' | 'group' | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    console.log('🎥 [Live Courses Page] Live courses page loaded');
  }, []);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${process.env['NEXT_PUBLIC_API_URL']}/live-courses/courses/`, {
        headers,
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('فشل في تحميل الدورات');
      }

      const data = await response.json();
      const coursesData = data.results || data;
      setCourses(coursesData);
      setFilteredCourses(coursesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ');
    } finally {
      setLoading(false);
    }
  };

  // Filter courses based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredCourses(courses);
      return;
    }

    const filtered = courses.filter(course =>
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${course.teacher.user.first_name} ${course.teacher.user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCourses(filtered);
  }, [searchTerm, courses]);

  const handleOpenModal = (course: Course) => {
    setSelectedCourse(course);
    setSelectedType(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedCourse(null);
    setSelectedType(null);
  };

  const handleApply = async () => {
    if (!selectedType || !selectedCourse) {
      alert('الرجاء اختيار نوع الدورة');
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem('access_token');

      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`${process.env['NEXT_PUBLIC_API_URL']}/live-courses/applications/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          course: selectedCourse.id,
          receipt_url: '',
          student_notes: `طلب من صفحة الدورات - نوع الدورة: ${selectedType === 'individual' ? 'فردي' : 'جماعي'}`,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'فشل في إرسال الطلب');
      }

      alert('تم إرسال طلبك بنجاح! سيتم التواصل معك قريباً.');
      handleCloseModal();
      router.push('/dashboard/student');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'حدث خطأ أثناء إرسال الطلب');
    } finally {
      setSubmitting(false);
    }
  };

  const features = [
    { icon: Video, text: 'تفاعل مباشر مع المعلمين', color: 'from-[#1e40af] to-[#2563eb]' },
    { icon: Users, text: 'مجموعات صغيرة لتعلم أفضل', color: 'from-[#2563eb] to-[#1e40af]' },
    { icon: MessageCircle, text: 'أسئلة وإجابات فورية', color: 'from-[#1e40af] to-[#2563eb]' },
    { icon: Clock, text: 'جلسات منتظمة ومنظمة', color: 'from-[#2563eb] to-[#1e40af]' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950" dir="rtl">
      {/* Hero Section - Enhanced */}
      <section className="relative overflow-hidden pt-32 pb-16 px-4">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-[#1e40af]/20 to-[#2563eb]/20 rounded-full blur-3xl opacity-50" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#C5A15A]/20 rounded-full blur-3xl opacity-50" />
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-gradient-to-br from-[#2563eb]/10 to-[#1e40af]/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        </div>

        <div className="container mx-auto max-w-7xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            {/* Icon & Title */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', duration: 0.8, delay: 0.2 }}
              className="inline-flex items-center justify-center mb-6"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-[#1e40af] to-[#2563eb] rounded-full blur-2xl opacity-40 animate-pulse" />
                <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-[#1e40af] to-[#2563eb] flex items-center justify-center shadow-xl ring-4 ring-[#1e40af]/20 dark:ring-blue-400/30">
                  <Video className="w-10 h-10 text-white" />
                </div>
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6"
            >
              <span className="bg-gradient-to-r from-[#1e40af] via-[#2563eb] to-[#1e40af] dark:from-blue-400 dark:via-[#3b82f6] dark:to-blue-400 bg-clip-text text-transparent">
                الدورات المباشرة
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed mb-8"
            >
              تعلم بشكل مباشر وتفاعلي مع معلمين متخصصين في بيئة تعليمية حيوية ومحفزة
            </motion.p>

            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="max-w-2xl mx-auto mb-8"
            >
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="ابحث عن دورة..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10 pl-4 w-full h-12 text-lg"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm("")}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </motion.div>

            {/* Features Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto"
            >
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    className="group h-full"
                  >
                    <Card className="h-full border-2 border-[#1e40af]/20 dark:border-blue-400/30 hover:border-[#1e40af] dark:hover:border-blue-400 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300 flex flex-col">
                      <CardContent className="p-4 text-center flex flex-col flex-1 justify-center min-h-[140px]">
                        <div className={`w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-md group-hover:shadow-xl transition-shadow flex-shrink-0`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed">{feature.text}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Courses Section - Enhanced */}
      <section className="py-12 px-4 relative">
        <div className="container mx-auto max-w-7xl">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Spinner size="xl" />
            </div>
          ) : error ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <X className="w-8 h-8 text-red-500" />
              </div>
              <p className="text-xl text-red-600 dark:text-red-400 font-semibold">{error}</p>
            </motion.div>
          ) : filteredCourses.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20"
            >
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#1e40af]/10 to-[#2563eb]/10 dark:from-blue-500/20 dark:to-blue-400/20 flex items-center justify-center">
                <BookOpen className="w-10 h-10 text-[#1e40af] dark:text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">
                {searchTerm ? 'لم يتم العثور على دورات' : 'لا توجد دورات متاحة حالياً'}
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                {searchTerm ? 'حاول البحث بكلمات أخرى' : 'سيتم إضافة دورات جديدة قريباً'}
              </p>
            </motion.div>
          ) : (
            <>
              {/* Section Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mb-8"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                    <Sparkles className="w-6 h-6 text-[#1e40af] dark:text-blue-400" />
                    الدورات المتاحة
                  </h2>
                  <Badge className="bg-[#1e40af]/10 text-[#1e40af] dark:bg-blue-500/20 dark:text-blue-400 border-[#1e40af]/30 dark:border-blue-400/40 px-4 py-1">
                    {filteredCourses.length} دورة
                  </Badge>
                </div>
              </motion.div>

              {/* Courses Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.map((course, index) => (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -8, scale: 1.02 }}
                    className="h-full"
                  >
                    <Card className="h-full border-2 border-slate-200 dark:border-slate-700 hover:border-[#1e40af] dark:hover:border-blue-400 bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 group cursor-pointer"
                      onClick={() => router.push(`/course/${course.id}`)}
                    >
                      {/* Header with Gradient */}
                      <div className="relative bg-gradient-to-br from-[#1e40af] via-[#2563eb] to-[#1e40af] p-6 text-white overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                        <div className="relative z-10">
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
                              <BookOpen className="w-6 h-6" />
                            </div>
                            <Badge className="bg-white/20 backdrop-blur-sm text-white border-0">
                              مباشر
                            </Badge>
                          </div>
                          <h3 className="text-xl font-bold line-clamp-2 leading-tight">{course.title}</h3>
                        </div>
                      </div>

                      {/* Content */}
                      <CardContent className="p-6">
                        <p className="text-slate-600 dark:text-slate-300 mb-5 line-clamp-3 min-h-[4.5rem]">
                          {course.description}
                        </p>

                        {/* Teacher Info */}
                        <div className="flex items-center gap-3 mb-6 p-3 rounded-lg bg-[#1e40af]/5 dark:bg-blue-500/10 border border-[#1e40af]/20 dark:border-blue-400/30">
                          {(() => {
                            const teacherImage = course.teacher?.profile_image_thumbnail_url || 
                                                 course.teacher?.profile_image_url ||
                                                 course.teacher?.user?.profile_image_thumbnail_url ||
                                                 course.teacher?.user?.profile_image_url;
                            console.log('🖼️ LiveCourses - Teacher image:', {
                              courseId: course.id,
                              courseTitle: course.title,
                              teacher: course.teacher,
                              teacherImage: teacherImage
                            });
                            return teacherImage && teacherImage !== '/default-avatar.png' ? (
                              <img
                                src={getProxiedImageUrl(teacherImage, false)}
                                alt={`${course.teacher.user.first_name} ${course.teacher.user.last_name}`}
                                className="w-10 h-10 rounded-full object-cover flex-shrink-0 border-2 border-[#1e40af]/30 dark:border-blue-400/40"
                                crossOrigin="anonymous"
                                referrerPolicy="no-referrer"
                                onError={(e) => {
                                  console.error('❌ LiveCourses - Backend proxy failed, showing fallback:', e);
                                  const img = e.currentTarget as HTMLImageElement;
                                  img.style.display = 'none';
                                  const fallback = img.nextElementSibling as HTMLElement;
                                  if (fallback) fallback.style.display = 'flex';
                                }}
                              />
                            ) : null;
                          })()}
                          <div className={`w-10 h-10 rounded-full bg-gradient-to-br from-[#1e40af] to-[#2563eb] flex items-center justify-center flex-shrink-0 ${(() => {
                            const teacherImage = course.teacher?.profile_image_thumbnail_url || 
                                                 course.teacher?.profile_image_url ||
                                                 course.teacher?.user?.profile_image_thumbnail_url ||
                                                 course.teacher?.user?.profile_image_url;
                            return teacherImage && teacherImage !== '/default-avatar.png' ? 'hidden' : '';
                          })()}`}>
                            <User className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">المعلم</p>
                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                              {course.teacher.user.first_name} {course.teacher.user.last_name}
                            </p>
                          </div>
                        </div>

                        {/* Action Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/course/${course.id}`);
                          }}
                          className="w-full bg-gradient-to-r from-[#1e40af] to-[#2563eb] hover:from-[#1e3a8a] hover:to-[#1e40af] text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 group/btn"
                        >
                          <span>عرض الدورة</span>
                          <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                        </button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Application Modal - Enhanced */}
      <AnimatePresence>
        {showModal && selectedCourse && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border-2 border-[#1e40af]/20 dark:border-blue-400/30"
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-gradient-to-r from-[#1e40af] via-[#2563eb] to-[#1e40af] p-6 text-white flex items-center justify-between z-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{selectedCourse.title}</h2>
                    <p className="text-sm opacity-90 flex items-center gap-2 mt-1">
                      <User className="w-4 h-4" />
                      {selectedCourse.teacher.user.first_name} {selectedCourse.teacher.user.last_name}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-8">
                <div className="mb-8">
                  <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-[#1e40af] to-[#2563eb] dark:from-blue-400 dark:to-[#3b82f6] bg-clip-text text-transparent">
                    اختر نوع الدورة المناسب لك
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    {selectedCourse.description}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {/* Individual Option */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedType('individual')}
                    className={`cursor-pointer rounded-2xl p-6 border-2 transition-all duration-300 ${
                      selectedType === 'individual'
                        ? 'border-[#1e40af] bg-[#1e40af]/5 dark:bg-blue-500/20 shadow-xl ring-2 ring-[#1e40af]/20 dark:ring-blue-400/30'
                        : 'border-slate-200 dark:border-slate-700 hover:border-[#1e40af] dark:hover:border-blue-400'
                    }`}
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        selectedType === 'individual'
                          ? 'bg-gradient-to-br from-[#1e40af] to-[#2563eb]'
                          : 'bg-gradient-to-br from-slate-400 to-slate-500'
                      }`}>
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-xl font-bold">تعليم فردي</h3>
                    </div>

                    <ul className="space-y-2 mb-4">
                      {[
                        'اهتمام كامل من المعلم',
                        'جدول زمني مرن',
                        'تقدم سريع ومخصص',
                        'محتوى مخصص لاحتياجاتك'
                      ].map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                            selectedType === 'individual' ? 'text-[#1e40af] dark:text-blue-400' : 'text-slate-400'
                          }`} />
                          <span className="text-sm text-slate-700 dark:text-slate-300">{item}</span>
                        </li>
                      ))}
                    </ul>

                    {selectedType === 'individual' && (
                      <div className="flex items-center gap-2 text-[#1e40af] dark:text-blue-400 font-bold">
                        <Check className="w-5 h-5" />
                        <span>تم الاختيار</span>
                      </div>
                    )}
                  </motion.div>

                  {/* Group Option */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedType('group')}
                    className={`cursor-pointer rounded-2xl p-6 border-2 transition-all duration-300 ${
                      selectedType === 'group'
                        ? 'border-[#1e40af] bg-[#1e40af]/5 dark:bg-blue-500/20 shadow-xl ring-2 ring-[#1e40af]/20 dark:ring-blue-400/30'
                        : 'border-slate-200 dark:border-slate-700 hover:border-[#1e40af] dark:hover:border-blue-400'
                    }`}
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        selectedType === 'group'
                          ? 'bg-gradient-to-br from-[#1e40af] to-[#2563eb]'
                          : 'bg-gradient-to-br from-slate-400 to-slate-500'
                      }`}>
                        <UsersRound className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-xl font-bold">تعليم جماعي</h3>
                    </div>

                    <ul className="space-y-2 mb-4">
                      {[
                        'التعلم من خلال المجموعة',
                        'تكلفة أقل',
                        'تبادل الخبرات',
                        'مناقشات جماعية مفيدة'
                      ].map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                            selectedType === 'group' ? 'text-[#1e40af] dark:text-blue-400' : 'text-slate-400'
                          }`} />
                          <span className="text-sm text-slate-700 dark:text-slate-300">{item}</span>
                        </li>
                      ))}
                    </ul>

                    {selectedType === 'group' && (
                      <div className="flex items-center gap-2 text-[#1e40af] dark:text-blue-400 font-bold">
                        <Check className="w-5 h-5" />
                        <span>تم الاختيار</span>
                      </div>
                    )}
                  </motion.div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={handleCloseModal}
                    className="flex-1 px-6 py-4 bg-white dark:bg-slate-700 text-[#1e40af] dark:text-blue-400 border-2 border-[#1e40af] dark:border-blue-400 rounded-xl font-bold hover:bg-[#1e40af]/5 dark:hover:bg-blue-400/20 transition-all duration-300"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={handleApply}
                    disabled={!selectedType || submitting}
                    className={`flex-1 px-6 py-4 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 ${
                      !selectedType || submitting
                        ? 'bg-slate-300 dark:bg-slate-600 text-slate-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-[#1e40af] to-[#2563eb] hover:from-[#1e3a8a] hover:to-[#1e40af] text-white shadow-lg hover:shadow-xl'
                    }`}
                  >
                    {submitting ? (
                      <>
                        <Spinner size="md" />
                        <span>جاري الإرسال...</span>
                      </>
                    ) : (
                      <>
                        <span>إرسال الطلب</span>
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
