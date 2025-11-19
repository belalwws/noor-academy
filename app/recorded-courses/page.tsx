"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Video, Users, BookOpen, ArrowRight, Play, Clock, Search, Filter, X, CheckCircle2, Sparkles, User } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { recordedCoursesApi, RecordedCourse } from "@/lib/api/recorded-courses";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAppSelector } from "@/lib/hooks";
import { authService } from "@/lib/auth/authService";
import { getProxiedImageUrl } from "@/lib/imageUtils";

interface CourseWithDuration extends RecordedCourse {
  total_video_duration?: number; // Total duration in seconds
  is_purchased?: boolean; // Whether the student has purchased/enrolled in this course
}

export default function RecordedCoursesPage() {
  const { user } = useAppSelector(state => state.auth);
  const [courses, setCourses] = useState<CourseWithDuration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"approved" | "pending" | "rejected" | "all">("approved");
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [purchasedCourses, setPurchasedCourses] = useState<Set<string>>(new Set());
  const [purchasedCoursesLoaded, setPurchasedCoursesLoaded] = useState(false);

  // Debounced search term
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

  useEffect(() => {
    console.log('📹 [Recorded Courses Page] Recorded courses page loaded');
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPage(1); // Reset to first page when searching
    }, 500); // Debounce search by 500ms

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Load purchased courses first, then fetch courses
  useEffect(() => {
    const loadData = async () => {
      let purchasedCoursesSet = new Set<string>();
      
      // First, load purchased courses if user is a student
      if (user && user.role === 'student') {
        console.log('🔄 Loading purchased courses first...');
        purchasedCoursesSet = await loadPurchasedCourses();
        console.log('✅ Purchased courses loaded:', {
          count: purchasedCoursesSet.size,
          courseIds: Array.from(purchasedCoursesSet),
        });
      }
      
      // Then, fetch courses (pass purchasedCoursesSet directly to ensure it's used)
      console.log('🔄 Now fetching courses with purchased courses set...');
      await fetchCourses(purchasedCoursesSet);
    };
    
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, page, debouncedSearchTerm, user]);

  // Update courses when purchasedCourses changes (for real-time updates after initial load)
  useEffect(() => {
    if (courses.length > 0 && purchasedCourses.size > 0) {
      console.log('🔄 useEffect: Updating courses with purchased status...', {
        coursesCount: courses.length,
        purchasedCoursesCount: purchasedCourses.size,
        purchasedCoursesSet: Array.from(purchasedCourses),
      });
      
      setCourses(prevCourses => {
        const updatedCourses = prevCourses.map(course => {
          const normalizedCourseId = course.id.toString().trim();
          const isPurchased = purchasedCourses.has(normalizedCourseId);
          
          if (isPurchased !== course.is_purchased) {
            console.log('🔄 useEffect: Updating course purchased status:', {
              courseId: course.id,
              normalizedCourseId: normalizedCourseId,
              courseTitle: course.title,
              oldStatus: course.is_purchased,
              newStatus: isPurchased,
              purchasedCoursesSet: Array.from(purchasedCourses),
            });
          }
          
          return {
            ...course,
            is_purchased: isPurchased,
          };
        });
        
        // Log updates for debugging
        const purchasedCount = updatedCourses.filter(c => c.is_purchased).length;
        console.log('✅ useEffect: Updated courses with purchased status:', {
          totalCourses: updatedCourses.length,
          purchasedCourses: purchasedCount,
          purchasedCourseIds: updatedCourses
            .filter(c => c.is_purchased)
            .map(c => ({ id: c.id, title: c.title })),
          purchasedCoursesSet: Array.from(purchasedCourses),
        });
        
        return updatedCourses;
      });
    }
  }, [purchasedCourses]);

  const loadPurchasedCourses = async (): Promise<Set<string>> => {
    try {
      console.log('🔄 Loading purchased courses...');
      const authData = authService.getStoredAuthData();
      const currentUser = authData?.user || user;
      
      if (!currentUser || currentUser.role !== 'student') {
        console.log('⚠️ User is not a student, skipping purchased courses load');
        return new Set<string>();
      }

      const API_BASE_URL = process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:8000/api';
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      
      if (!token) {
        console.log('⚠️ No token found, skipping purchased courses load');
        return new Set<string>();
      }
      
      // Fetch all enrollments for the current student
      // Backend automatically filters by current user's student_profile
      console.log('📡 Fetching enrollments from:', `${API_BASE_URL}/recorded-courses/enrollments/`);
      const response = await fetch(
        `${API_BASE_URL}/recorded-courses/enrollments/`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('📡 Enrollments response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        const enrollments = data.results || [];
        
        console.log('📋 Raw enrollments data:', {
          totalEnrollments: enrollments.length,
          enrollments: enrollments.map((e: any) => ({
            id: e.id,
            course: e.course,
            courseType: typeof e.course,
            status: e.status,
            courseTitle: e.course_title,
          })),
        });
        
        // Extract course IDs from enrollments (only active enrollments)
        const purchasedCourseIds = new Set<string>();
        enrollments.forEach((enrollment: any) => {
          console.log('🔍 Processing enrollment:', {
            enrollmentId: enrollment.id,
            course: enrollment.course,
            courseType: typeof enrollment.course,
            status: enrollment.status,
            courseTitle: enrollment.course_title,
          });
          
          if (enrollment.status === 'active' && enrollment.course) {
            // Extract course ID - handle both string and object types
            let courseId: string | null = null;
            
            if (typeof enrollment.course === 'string') {
              courseId = enrollment.course;
            } else if (enrollment.course && typeof enrollment.course === 'object') {
              courseId = enrollment.course.id || enrollment.course;
            } else if (enrollment.course) {
              courseId = String(enrollment.course);
            }
            
            // Normalize course ID (trim only - UUIDs are case-sensitive)
            if (courseId) {
              const normalizedCourseId = courseId.toString().trim();
              purchasedCourseIds.add(normalizedCourseId);
              console.log('✅ Added purchased course:', {
                enrollmentId: enrollment.id,
                originalCourseId: courseId,
                normalizedCourseId: normalizedCourseId,
                courseTitle: enrollment.course_title,
                status: enrollment.status,
              });
            } else {
              console.warn('⚠️ Could not extract course ID from enrollment:', enrollment);
            }
          } else {
            console.log('⏭️ Skipping enrollment (not active or no course):', {
              enrollmentId: enrollment.id,
              status: enrollment.status,
              hasCourse: !!enrollment.course,
            });
          }
        });
        
        console.log('✅ Final purchased courses set:', {
          count: purchasedCourseIds.size,
          courseIds: Array.from(purchasedCourseIds),
        });
        
        setPurchasedCourses(purchasedCourseIds);
        setPurchasedCoursesLoaded(true);
        return purchasedCourseIds;
      } else {
        const errorText = await response.text();
        console.error('❌ Failed to load enrollments:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText,
        });
        setPurchasedCoursesLoaded(true);
        return new Set<string>();
      }
    } catch (error) {
      console.error('❌ Error loading purchased courses:', error);
      setPurchasedCoursesLoaded(true);
      return new Set<string>();
    }
  };

  const fetchCourses = async (currentPurchasedCourses?: Set<string>) => {
    try {
      setLoading(true);
      setError(null);

      // Use provided purchasedCourses or state (fallback)
      const purchasedCoursesToUse = currentPurchasedCourses || purchasedCourses;
      
      console.log('🔄 Fetching courses with purchased courses:', {
        purchasedCoursesCount: purchasedCoursesToUse.size,
        purchasedCourseIds: Array.from(purchasedCoursesToUse),
        isFromParameter: !!currentPurchasedCourses,
        isFromState: !currentPurchasedCourses,
      });

      const params: any = {
        ordering: "-created_at",
        page: page,
      };

      // Only show approved courses for public page (students)
      // If user is authenticated, they might see different courses based on their role
      if (statusFilter !== "all") {
        params.status = statusFilter;
      }
      // Note: When statusFilter is "all", we don't add status param
      // Backend will return courses based on user's role

      if (debouncedSearchTerm.trim()) {
        params.search = debouncedSearchTerm.trim();
      }

      const response = await recordedCoursesApi.list(params);
      
      const coursesList = response.results || [];
      
      console.log('📋 Fetched courses from API:', {
        totalCourses: coursesList.length,
        courseIds: coursesList.map((c: RecordedCourse) => c.id),
      });
      
      // Calculate total video duration for each course and check if purchased
      const coursesWithDuration = await Promise.all(
        coursesList.map(async (course: RecordedCourse) => {
          try {
            const token = localStorage.getItem('access_token') || localStorage.getItem('token');
            const API_BASE_URL = process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:8000/api';
            
            // Fetch units for this course
            const unitsResponse = await fetch(
              `${API_BASE_URL}/recorded-courses/units/?course=${course.id}`,
              {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
              }
            );
            
            let totalVideoDuration = 0;
            
            if (unitsResponse.ok) {
              const unitsData = await unitsResponse.json();
              const units = unitsData.results || unitsData || [];
              
              // Calculate total video duration from all units
              for (const unit of units) {
                try {
                  const unitDetailsResponse = await fetch(
                    `${API_BASE_URL}/recorded-courses/units/${unit.id}/`,
                    {
                      headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                      },
                    }
                  );
                  
                  if (unitDetailsResponse.ok) {
                    const unitDetails = await unitDetailsResponse.json();
                    const lessons = unitDetails.lessons || [];
                    
                    lessons.forEach((lesson: any) => {
                      if (lesson.video_duration && typeof lesson.video_duration === 'number') {
                        totalVideoDuration += lesson.video_duration;
                      }
                    });
                  }
                } catch (error) {
                  console.error(`Error fetching unit ${unit.id} details:`, error);
                }
              }
            }
            
            // Check if course is purchased (normalize course ID for comparison - trim only)
            const normalizedCourseId = course.id.toString().trim();
            const isPurchased = purchasedCoursesToUse.has(normalizedCourseId);
            
            console.log('🔍 Checking course purchase status:', {
              courseId: course.id,
              normalizedCourseId: normalizedCourseId,
              courseTitle: course.title,
              isPurchased: isPurchased,
              purchasedCoursesSetSize: purchasedCoursesToUse.size,
              purchasedCoursesSet: Array.from(purchasedCoursesToUse),
              courseIdInSet: purchasedCoursesToUse.has(normalizedCourseId),
            });
            
            if (isPurchased) {
              console.log('✅ Course is purchased:', {
                courseId: course.id,
                normalizedCourseId: normalizedCourseId,
                courseTitle: course.title,
              });
            }
            
            return {
              ...course,
              total_video_duration: totalVideoDuration,
              is_purchased: isPurchased,
            } as CourseWithDuration;
          } catch (error) {
            console.error(`Error calculating duration for course ${course.id}:`, error);
            // Check if course is purchased even if duration calculation fails
            const normalizedCourseId = course.id.toString().trim();
            const isPurchased = purchasedCoursesToUse.has(normalizedCourseId);
            return {
              ...course,
              is_purchased: isPurchased,
            } as CourseWithDuration;
          }
        })
      );
      
      // Double-check and update purchased status (use purchasedCoursesToUse)
      const coursesWithPurchasedStatus = coursesWithDuration.map(course => {
        const normalizedCourseId = course.id.toString().trim();
        const isPurchased = purchasedCoursesToUse.has(normalizedCourseId);
        
        if (isPurchased !== course.is_purchased) {
          console.warn('⚠️ Mismatch in purchased status:', {
            courseId: course.id,
            normalizedCourseId: normalizedCourseId,
            courseTitle: course.title,
            expected: isPurchased,
            actual: course.is_purchased,
            purchasedCoursesSet: Array.from(purchasedCoursesToUse),
          });
        }
        
        return {
          ...course,
          is_purchased: isPurchased,
        };
      });
      
      setCourses(coursesWithPurchasedStatus);
      
      // Log summary for debugging
      const purchasedCount = coursesWithPurchasedStatus.filter(c => c.is_purchased).length;
      console.log('✅ Courses loaded with purchased status:', {
        totalCourses: coursesWithPurchasedStatus.length,
        purchasedCourses: purchasedCount,
        purchasedCourseIds: coursesWithPurchasedStatus
          .filter(c => c.is_purchased)
          .map(c => ({ id: c.id, title: c.title })),
        purchasedCoursesSetSize: purchasedCoursesToUse.size,
        purchasedCoursesSet: Array.from(purchasedCoursesToUse),
        allCourseIds: coursesWithPurchasedStatus.map(c => ({
          id: c.id,
          normalizedId: c.id.toString().trim(),
          isPurchased: c.is_purchased,
          title: c.title,
        })),
      });
      
      setTotalCount(response.count || 0);
      setHasNext(!!response.next);
      setHasPrevious(!!response.previous);
    } catch (err: any) {
      console.error("Error fetching recorded courses:", err);
      setError(err?.message || "حدث خطأ أثناء تحميل الدورات");
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1); // Reset to first page when searching
  };

  const handleStatusFilter = (status: "approved" | "pending" | "rejected" | "all") => {
    setStatusFilter(status);
    setPage(1); // Reset to first page when filtering
  };

  const formatPrice = (price: string) => {
    if (!price || price === "-" || price === "0") return "مجاني";
    try {
      const numPrice = parseFloat(price);
      return `${numPrice.toLocaleString("ar-EG")} ج.م`;
    } catch {
      return price;
    }
  };

  const formatDuration = (totalSeconds: number | undefined) => {
    if (!totalSeconds || totalSeconds === 0) return null;
    const totalMinutes = Math.round(totalSeconds / 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    if (hours > 0) {
      return minutes > 0 ? `${hours} ساعة ${minutes} دقيقة` : `${hours} ساعة`;
    } else {
      return `${minutes} دقيقة`;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500 text-white">معتمد</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500 text-white">قيد الانتظار</Badge>;
      case "rejected":
        return <Badge className="bg-red-500 text-white">مرفوض</Badge>;
      default:
        return null;
    }
  };

  const features = [
    { icon: Play, text: 'تعلم في أي وقت', color: 'from-[#0A5734] to-[#4A8F5C]' },
    { icon: Clock, text: 'محتوى مسجل متاح دائماً', color: 'from-[#4A8F5C] to-[#0A5734]' },
    { icon: BookOpen, text: 'دروس منظمة وواضحة', color: 'from-[#0A5734] to-[#4A8F5C]' },
    { icon: Users, text: 'معلمين متخصصين', color: 'from-[#4A8F5C] to-[#0A5734]' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950" dir="rtl">
      {/* Hero Section - Enhanced */}
      <section className="relative overflow-hidden pt-32 pb-16 px-4">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-[#0A5734]/20 to-[#4A8F5C]/20 rounded-full blur-3xl opacity-50" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#C5A15A]/20 rounded-full blur-3xl opacity-50" />
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-gradient-to-br from-[#4A8F5C]/10 to-[#0A5734]/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
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
                <div className="absolute inset-0 bg-gradient-to-br from-[#0A5734] to-[#4A8F5C] rounded-full blur-2xl opacity-40 animate-pulse" />
                <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-[#0A5734] to-[#4A8F5C] flex items-center justify-center shadow-xl ring-4 ring-[#0A5734]/20 dark:ring-[#4A8F5C]/30">
                  <Play className="w-10 h-10 text-white" />
                </div>
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6"
            >
              <span className="bg-gradient-to-r from-[#0A5734] via-[#4A8F5C] to-[#0A5734] dark:from-[#4A8F5C] dark:via-[#5BA86D] dark:to-[#4A8F5C] bg-clip-text text-transparent">
                الدورات المسجلة
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed mb-8"
            >
              تعلم بالسرعة التي تناسبك مع دورات مسجلة عالية الجودة
            </motion.p>

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
                    <div className="h-full border-2 border-[#0A5734]/20 dark:border-[#4A8F5C]/30 hover:border-[#0A5734] dark:hover:border-[#4A8F5C] bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300 rounded-xl p-4 text-center flex flex-col flex-1 justify-center min-h-[140px]">
                      <div className={`w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-md group-hover:shadow-xl transition-shadow flex-shrink-0`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed">{feature.text}</p>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Filters and Search Section */}
      <section className="py-8 px-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-[#0A5734]/20 dark:border-[#4A8F5C]/30">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1 max-w-md w-full">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-secondary w-5 h-5" />
                <Input
                  type="text"
                  placeholder="ابحث عن دورة..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10 pl-4 w-full"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchTerm("");
                      setPage(1);
                    }}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary hover:text-text-primary"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </form>

          </div>

          {/* Results Count */}
          {!loading && (
            <div className="mt-4 text-sm text-text-secondary">
              تم العثور على {totalCount} دورة
            </div>
          )}
        </div>
      </section>

      {/* Courses Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-7xl">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Spinner size="xl" />
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-red-500 text-xl mb-4">{error}</p>
              <Button onClick={fetchCourses} variant="outline">
                إعادة المحاولة
              </Button>
            </div>
          ) : courses.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20"
            >
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#0A5734]/10 to-[#4A8F5C]/10 dark:from-[#0A5734]/20 dark:to-[#4A8F5C]/20 flex items-center justify-center">
                <BookOpen className="w-10 h-10 text-[#0A5734] dark:text-[#4A8F5C]" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">لا توجد دورات متاحة حالياً</h3>
              {searchTerm && (
                <p className="text-slate-600 dark:text-slate-400">
                  حاول البحث بكلمات أخرى أو أزل الفلاتر
                </p>
              )}
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
                    <Sparkles className="w-6 h-6 text-[#0A5734] dark:text-[#4A8F5C]" />
                    الدورات المتاحة
                  </h2>
                  <Badge className="bg-[#0A5734]/10 text-[#0A5734] dark:bg-[#4A8F5C]/20 dark:text-[#4A8F5C] border-[#0A5734]/30 dark:border-[#4A8F5C]/40 px-4 py-1">
                    {totalCount} دورة
                  </Badge>
                </div>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course, index) => {
                  // Debug: Log course purchase status
                  if (course.is_purchased) {
                    console.log('🎯 Rendering purchased course:', {
                      courseId: course.id,
                      courseTitle: course.title,
                      is_purchased: course.is_purchased,
                    });
                  }
                  
                  return (
                    <motion.div
                      key={course.id}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ y: -8, scale: 1.02 }}
                      className="h-full"
                    >
                      <div className="h-full bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-slate-200 dark:border-slate-700 hover:border-[#0A5734] dark:hover:border-[#4A8F5C] flex flex-col group">
                        {/* Course Header with Gradient */}
                        {course.thumbnail ? (
                          <div className="relative h-48 w-full overflow-hidden">
                            <img
                              src={course.thumbnail}
                              alt={course.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
                            <div className="absolute top-3 right-3 flex gap-2 flex-wrap">
                              {getStatusBadge(course.status)}
                              {course.is_purchased === true && (
                                <Badge className="bg-green-500 text-white flex items-center gap-1 backdrop-blur-sm">
                                  <CheckCircle2 className="w-3 h-3" />
                                  تم الشراء
                                </Badge>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="relative bg-gradient-to-br from-[#0A5734] via-[#4A8F5C] to-[#0A5734] p-6 text-white overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                            <div className="relative z-10">
                              <div className="flex items-start justify-between gap-3 mb-3">
                                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
                                <Play className="w-6 h-6" />
                              </div>
                                <Badge className="bg-white/20 backdrop-blur-sm text-white border-0">
                                  مسجل
                                </Badge>
                              </div>
                              <h3 className="text-xl font-bold line-clamp-2 leading-tight">{course.title}</h3>
                            </div>
                            <div className="absolute top-3 right-3 flex gap-2 flex-wrap z-20">
                              {getStatusBadge(course.status)}
                              {course.is_purchased === true && (
                                <Badge className="bg-green-500 text-white flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" />
                                  تم الشراء
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}

                      <div className="p-6 flex-1 flex flex-col">
                        {!course.thumbnail && (
                          <h3 className="text-xl font-bold mb-3 line-clamp-2 text-slate-900 dark:text-white">{course.title}</h3>
                        )}
                        
                        <p className="text-slate-600 dark:text-slate-300 mb-5 line-clamp-3 min-h-[4.5rem] flex-1">
                          {course.description}
                        </p>

                        {/* Teacher Info */}
                        <div className="flex items-center gap-3 mb-4 p-3 rounded-lg bg-[#0A5734]/5 dark:bg-[#0A5734]/10 border border-[#0A5734]/20 dark:border-[#4A8F5C]/30">
                          {(() => {
                            const teacherImage = course.teacher_profile_image_thumbnail_url || 
                                                 course.teacher_profile_image_url;
                            console.log('🖼️ RecordedCourses - Teacher image:', {
                              courseId: course.id,
                              courseTitle: course.title,
                              thumbnail: course.teacher_profile_image_thumbnail_url,
                              full: course.teacher_profile_image_url,
                              selected: teacherImage
                            });
                            return teacherImage && teacherImage !== '/default-avatar.png' ? (
                              <img
                                src={getProxiedImageUrl(teacherImage, false)}
                                alt={course.teacher_name}
                                className="w-10 h-10 rounded-full object-cover flex-shrink-0 border-2 border-[#0A5734]/30 dark:border-[#4A8F5C]/40"
                                crossOrigin="anonymous"
                                referrerPolicy="no-referrer"
                                onError={(e) => {
                                  console.error('❌ RecordedCourses - Backend proxy failed, showing fallback:', e);
                                  const img = e.currentTarget as HTMLImageElement;
                                  img.style.display = 'none';
                                  const fallback = img.nextElementSibling as HTMLElement;
                                  if (fallback) fallback.style.display = 'flex';
                                }}
                              />
                            ) : null;
                          })()}
                          <div className={`w-10 h-10 rounded-full bg-gradient-to-br from-[#0A5734] to-[#4A8F5C] flex items-center justify-center flex-shrink-0 ${(() => {
                            const teacherImage = course.teacher_profile_image_thumbnail_url || 
                                                 course.teacher_profile_image_url;
                            return teacherImage && teacherImage !== '/default-avatar.png' ? 'hidden' : '';
                          })()}`}>
                            <User className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">المعلم</p>
                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                              {course.teacher_name}
                            </p>
                          </div>
                            </div>

                        {/* Course Stats */}
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                            {course.total_lessons && (
                              <div className="flex items-center gap-2">
                                <BookOpen className="w-4 h-4" />
                                <span>{course.total_lessons} درس</span>
                              </div>
                            )}
                          {course.units_count && (
                              <div className="flex items-center gap-2">
                              <Video className="w-4 h-4" />
                              <span>{course.units_count} وحدة</span>
                            </div>
                          )}
                          {course.total_video_duration && course.total_video_duration > 0 && (
                              <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                                <span>{formatDuration(course.total_video_duration)}</span>
                            </div>
                          )}
                          </div>

                          <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-700">
                            <div className="text-sm text-slate-500 dark:text-slate-400">
                                {new Date(course.created_at).toLocaleDateString("ar-EG", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                })}
                            </div>
                            <div className="text-lg font-bold bg-gradient-to-r from-[#0A5734] to-[#4A8F5C] dark:from-[#4A8F5C] dark:to-[#5BA86D] bg-clip-text text-transparent">
                                {formatPrice(course.final_price || course.price)}
                            </div>
                          </div>
                        </div>

                        <Link
                          href={`/course/${course.id}`}
                          className={`block w-full text-center font-bold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group mt-auto flex items-center justify-center gap-2 ${
                            course.is_purchased === true
                              ? 'bg-green-500 hover:bg-green-600 text-white'
                              : 'bg-gradient-to-r from-[#0A5734] to-[#4A8F5C] hover:from-[#073D24] hover:to-[#3A7148] text-white'
                          }`}
                        >
                          <span>
                            {course.is_purchased === true ? 'متابعة التعلم' : 'عرض الدورة'}
                          </span>
                          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                  );
                })}
              </div>

              {/* Pagination */}
              {(hasNext || hasPrevious) && (
                <div className="flex justify-center items-center gap-4 mt-12">
                  <Button
                    variant="outline"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={!hasPrevious || loading}
                  >
                    السابق
                  </Button>
                  <span className="text-sm text-text-secondary">
                    صفحة {page}
                    {totalCount > 0 && ` (${totalCount} دورة)`}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={!hasNext || loading}
                  >
                    التالي
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

    </div>
  );
}

