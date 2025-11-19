'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { supervisorApiService, SupervisorProfile } from '@/lib/api/supervisor';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Spinner } from '../../components/ui/spinner';
import { 
  User, 
  Mail, 
  Phone, 
  Building, 
  Info, 
  CheckCircle, 
  XCircle,
  Award,
  BookOpen,
  GraduationCap,
  Calendar,
  FileText,
  Download,
  Linkedin,
  Globe,
  Building2,
  ScrollText,
  TrendingUp
} from 'lucide-react';
import { useProfileImages } from '@/hooks/use-profile-images';
import ProtectedRoute from '@/components/ProtectedRoute';

// Types are now imported from the supervisor API service

// 2. Main Component
const SupervisorProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<SupervisorProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use signed URLs for profile images
  const { imageUrls, loading: signedUrlsLoading, error: signedUrlsError } = useProfileImages({
    refreshOnFocus: true,
    refreshInterval: 30 * 60 * 1000 // Refresh every 30 minutes
  });

  const loadSupervisorData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await supervisorApiService.getProfile();
      if (response.success && response.data) {
        setProfile(response.data);
      } else {
        setError(response.error || 'Failed to load supervisor profile');
      }
    } catch (err) {
      setError('Failed to load supervisor profile. Please try again later.');
      console.error('Error loading supervisor profile:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSupervisorData();
  }, [loadSupervisorData]);

  // 3. Render Logic
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!profile) {
    return null; // Or a 'not found' message
  }

  const { user, department, areas_of_responsibility, specialization, completion_percentage, profile_completed_at } = profile;
  const isProfileComplete = completion_percentage === 100;

  return (
    <ProtectedRoute allowedRoles={['supervisor', 'admin']}>
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header Card */}
          <Card className="border-0 shadow-2xl bg-gradient-to-br from-white via-green-50/40 to-blue-50/30 overflow-hidden mb-8">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-green-400/10 to-blue-400/10 rounded-full blur-3xl"></div>
            <CardHeader className="flex flex-col md:flex-row items-center gap-6 p-8 relative z-10">
              <div className="relative">
                <Avatar className="w-32 h-32 border-4 border-white shadow-2xl ring-4 ring-green-100">
                  <AvatarImage src={imageUrls?.profile_image_url || user.profile_image_url || "/default-avatar.png"} alt={user.full_name} />
                  <AvatarFallback className="text-4xl bg-gradient-to-br from-green-500 to-blue-500 text-white">{user.full_name?.charAt(0) || 'S'}</AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="text-center md:text-right flex-1">
                <CardTitle className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-2">
                  {user.full_name}
                </CardTitle>
                <p className="text-lg text-gray-600 font-medium mb-2">{profile.supervisor_type_display || 'مشرف'}</p>
                {department && (
                  <p className="text-sm text-gray-500 flex items-center justify-center md:justify-start gap-2">
                    <Building className="w-4 h-4" />
                    {department}
                  </p>
                )}
                <div className="flex items-center justify-center md:justify-start gap-2 mt-4 flex-wrap">
                  {user.is_active ? (
                    <Badge className="bg-green-500 text-white hover:bg-green-600">✓ نشط</Badge>
                  ) : (
                    <Badge variant="destructive">غير نشط</Badge>
                  )}
                  {isProfileComplete ? (
                    <Badge className="bg-blue-500 text-white hover:bg-blue-600">✓ الملف مكتمل</Badge>
                  ) : (
                    <Badge variant="secondary">الملف غير مكتمل ({Math.round(completion_percentage)}%)</Badge>
                  )}
                  {user.gender && (
                    <Badge variant="outline">{user.gender === 'male' ? '♂️ ذكر' : '♀️ أنثى'}</Badge>
                  )}
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Main Content */}
          <div className="space-y-6">
            {/* Essential Info */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-white via-green-50/30 to-blue-50/20 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400/10 to-blue-400/10 rounded-full blur-3xl"></div>
              <CardContent className="p-6 relative z-10">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  المعلومات الأساسية
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-blue-600 font-medium mb-1">الاسم</p>
                      <p className="font-bold text-blue-800 break-words">{user.full_name}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Mail className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-green-600 font-medium mb-1">البريد الإلكتروني</p>
                      <p className="font-bold text-green-800 text-sm break-words">{user.email}</p>
                    </div>
                  </div>

                  {user.phone_number && (
                    <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl border border-purple-100 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-violet-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Phone className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-purple-600 font-medium mb-1">رقم الهاتف</p>
                        <p className="font-bold text-purple-800 break-words">{user.country_code} {user.phone_number}</p>
                      </div>
                    </div>
                  )}

                  {specialization && (
                    <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-100 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
                      <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <GraduationCap className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-orange-600 font-medium mb-1">التخصص</p>
                        <p className="font-bold text-orange-800 break-words">{specialization}</p>
                      </div>
                    </div>
                  )}

                  {(profile as any).years_of_experience && (
                    <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl border border-indigo-100 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <TrendingUp className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-indigo-600 font-medium mb-1">سنوات الخبرة</p>
                        <p className="font-bold text-indigo-800">{(profile as any).years_of_experience} سنة</p>
                      </div>
                    </div>
                  )}

                  {(profile as any).academic_degree && (
                    <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl border border-teal-100 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
                      <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Award className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-teal-600 font-medium mb-1">الدرجة العلمية</p>
                        <p className="font-bold text-teal-800 break-words">{(profile as any).academic_degree}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Areas of Responsibility */}
            {areas_of_responsibility && (
              <Card className="border-0 shadow-xl bg-gradient-to-br from-white via-purple-50/30 to-pink-50/20 overflow-hidden">
                <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-3xl"></div>
                <CardContent className="p-6 relative z-10">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                      <Info className="w-4 h-4 text-white" />
                    </div>
                    مجالات المسؤولية
                  </h3>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{areas_of_responsibility}</p>
                </CardContent>
              </Card>
            )}

            {/* Experience & Achievements */}
            {((profile as any).experience || (profile as any).achievements) && (
              <Card className="border-0 shadow-xl bg-gradient-to-br from-white via-amber-50/30 to-orange-50/20 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-400/10 to-orange-400/10 rounded-full blur-3xl"></div>
                <CardContent className="p-6 relative z-10">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center">
                      <Award className="w-4 h-4 text-white" />
                    </div>
                    الخبرات والإنجازات
                  </h3>
                  {(profile as any).experience && (
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-700 mb-2">الخبرة:</h4>
                      <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{(profile as any).experience}</p>
                    </div>
                  )}
                  {(profile as any).achievements && (
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2">الإنجازات:</h4>
                      <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{(profile as any).achievements}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Documents Section */}
            {((profile as any).graduation_certificate_download_url || (profile as any).cv_file_download_url || (profile as any).linkedin_url) && (
              <Card className="border-0 shadow-xl bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/20 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 rounded-full blur-3xl"></div>
                <CardContent className="p-6 relative z-10">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                      <FileText className="w-4 h-4 text-white" />
                    </div>
                    المستندات والروابط
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(profile as any).graduation_certificate_download_url && (
                      <a
                        href={(profile as any).graduation_certificate_download_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 hover:border-green-400 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 group"
                      >
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                          <Award className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-green-800 mb-1">شهادة التخرج</p>
                          <p className="text-xs text-green-600 flex items-center gap-1">
                            <Download className="w-3 h-3" />
                            تحميل المستند
                          </p>
                        </div>
                      </a>
                    )}

                    {(profile as any).cv_file_download_url && (
                      <a
                        href={(profile as any).cv_file_download_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 hover:border-blue-400 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 group"
                      >
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                          <FileText className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-blue-800 mb-1">السيرة الذاتية</p>
                          <p className="text-xs text-blue-600 flex items-center gap-1">
                            <Download className="w-3 h-3" />
                            تحميل المستند
                          </p>
                        </div>
                      </a>
                    )}

                    {(profile as any).linkedin_url && (
                      <a
                        href={(profile as any).linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-4 bg-gradient-to-r from-sky-50 to-blue-50 rounded-xl border border-sky-200 hover:border-sky-400 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 group"
                      >
                        <div className="w-12 h-12 bg-gradient-to-br from-sky-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                          <Linkedin className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-sky-800 mb-1">LinkedIn</p>
                          <p className="text-xs text-sky-600 flex items-center gap-1">
                            <Globe className="w-3 h-3" />
                            زيارة الملف الشخصي
                          </p>
                        </div>
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Islamic Studies Info */}
            {((profile as any).has_ijazah || (profile as any).islamic_specialization) && (
              <Card className="border-0 shadow-xl bg-gradient-to-br from-white via-emerald-50/30 to-teal-50/20 overflow-hidden">
                <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-emerald-400/10 to-teal-400/10 rounded-full blur-3xl"></div>
                <CardContent className="p-6 relative z-10">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-4 h-4 text-white" />
                    </div>
                    المعلومات الإسلامية
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(profile as any).has_ijazah && (profile as any).ijazah_source && (
                      <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-100">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Award className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-emerald-600 font-medium mb-1">جهة الإجازة</p>
                          <p className="font-bold text-emerald-800 break-words">{(profile as any).ijazah_source}</p>
                        </div>
                      </div>
                    )}

                    {(profile as any).islamic_specialization && (
                      <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl border border-teal-100">
                        <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0">
                          <BookOpen className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-teal-600 font-medium mb-1">التخصص الإسلامي</p>
                          <p className="font-bold text-teal-800 break-words">{(profile as any).islamic_specialization}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default SupervisorProfilePage;
