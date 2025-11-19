import { useState, useCallback } from 'react';
import { useAppDispatch } from '@/lib/hooks';
import { updateUser } from '@/lib/store';
import { toast } from 'sonner';
import { 
  AcademicSupervisorProfileAPI, 
  AcademicSupervisorProfileData, 
  ProfileStatus,
  DashboardStats,
  Teacher,
  Course,
  Student
} from '@/lib/api/academic-supervisor-profile';

export const useAcademicSupervisorProfile = () => {
  const dispatch = useAppDispatch();
  
  // Profile states  
  const [profileData, setProfileData] = useState<AcademicSupervisorProfileData | null>({
    // Initialize with empty object to allow form filling
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    phone_number: '',
    country_code: '+966',
    age: undefined,
    gender: '',
    bio: '',
    department: '',
    specialization: '',
    areas_of_responsibility: '',
    experience: '',
    achievements: ''
  } as AcademicSupervisorProfileData);
  const [profileStatus, setProfileStatus] = useState<ProfileStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dashboard states
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [assignedTeachers, setAssignedTeachers] = useState<Teacher[]>([]);
  const [teacherCourses, setTeacherCourses] = useState<Course[]>([]);
  const [teacherStudents, setTeacherStudents] = useState<Student[]>([]);
  const [isDashboardLoading, setIsDashboardLoading] = useState(false);

  // Load profile status
  const loadProfileStatus = useCallback(async () => {
    try {
      setError(null);
      const status = await AcademicSupervisorProfileAPI.getProfileStatus();
      setProfileStatus(status);
      return status;
    } catch (err: any) {
      const errorMessage = err.message || 'فشل في تحميل حالة الملف الشخصي';
      setError(errorMessage);
      console.error('Error loading profile status:', err);
      throw err;
    }
  }, []);

  // Load profile data
  const loadProfileData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const [profile, status] = await Promise.all([
        AcademicSupervisorProfileAPI.getProfileData(),
        AcademicSupervisorProfileAPI.getProfileStatus()
      ]);
      
      setProfileData(profile);
      setProfileStatus(status);
      
      return profile;
    } catch (err: any) {
      const errorMessage = err.message || 'فشل في تحميل بيانات الملف الشخصي';
      setError(errorMessage);
      console.error('Error loading profile data:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save profile data
  const saveProfileData = useCallback(async (data: Partial<AcademicSupervisorProfileData>) => {
    try {
      setIsSaving(true);
      setError(null);
      
      const updatedProfile = await AcademicSupervisorProfileAPI.updateProfile(data);
      setProfileData(updatedProfile);
      
      // Update Redux store if user data changed
      if (data.user) {
        dispatch(updateUser(data.user));
      }
      
      // Refresh profile status after save to get updated completion percentage
      try {
        await loadProfileStatus();
      } catch (statusError) {
        // Silently handle status refresh error
      }
      
      toast.success('تم حفظ البيانات بنجاح');
      return updatedProfile;
    } catch (err: any) {
      const errorMessage = err.message || 'فشل في حفظ البيانات';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, [dispatch, loadProfileStatus]);

  // Complete profile (PUT - Full completion)
  const completeProfile = useCallback(async (profileData?: Partial<AcademicSupervisorProfileData>) => {
    try {
      setIsSaving(true);
      setError(null);
      
      // Use provided data or current profile data
      const dataToSubmit = profileData || {};
      const result = await AcademicSupervisorProfileAPI.completeProfile(dataToSubmit);
      
      // Update local state with result
      setProfileData(result);
      
      // Reload profile status after completion
      await loadProfileStatus();
      
      toast.success('تم إكمال الملف الشخصي بنجاح');
      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'فشل في إكمال الملف الشخصي';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Error completing profile:', err);
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, [loadProfileStatus]);

  // Partially complete profile (PATCH - Partial update)
  const partiallyCompleteProfile = useCallback(async (profileData: Partial<AcademicSupervisorProfileData>) => {
    try {
      setIsSaving(true);
      setError(null);
      
      const result = await AcademicSupervisorProfileAPI.partiallyCompleteProfile(profileData);
      
      // Update local state with result
      setProfileData(result);
      
      // Reload profile status after update
      await loadProfileStatus();
      
      toast.success('تم تحديث الملف الشخصي بنجاح');
      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'فشل في تحديث الملف الشخصي';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Error partially completing profile:', err);
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, [loadProfileStatus]);

  // Check completion requirement
  const checkCompletionRequirement = useCallback(async () => {
    try {
      const result = await AcademicSupervisorProfileAPI.checkCompletionRequirement();
      return result;
    } catch (err: any) {
      console.error('Error checking completion requirement:', err);
      return { requires_completion: false, completion_percentage: 0 };
    }
  }, []);

  // Update field locally without saving to server
  const updateFieldLocally = useCallback((field: string, value: any) => {
    setProfileData(prevData => {
      if (!prevData) return prevData;
      return { ...prevData, [field]: value };
    });
  }, []);

  // Load dashboard data
  const loadDashboardData = useCallback(async () => {
    try {
      setIsDashboardLoading(true);
      setError(null);
      
      const [stats, teachers, courses, students] = await Promise.all([
        AcademicSupervisorProfileAPI.getDashboardStats(),
        AcademicSupervisorProfileAPI.getAssignedTeachers(),
        AcademicSupervisorProfileAPI.getTeacherCourses(),
        AcademicSupervisorProfileAPI.getTeacherStudents()
      ]);
      
      setDashboardStats(stats);
      setAssignedTeachers(teachers);
      setTeacherCourses(courses);
      setTeacherStudents(students);
      
      return { stats, teachers, courses, students };
    } catch (err: any) {
      const errorMessage = err.message || 'فشل في تحميل بيانات لوحة التحكم';
      setError(errorMessage);
      console.error('Error loading dashboard data:', err);
      throw err;
    } finally {
      setIsDashboardLoading(false);
    }
  }, []);

  // Refresh all data
  const refreshData = useCallback(async () => {
    try {
      await Promise.all([
        loadProfileData(),
        loadDashboardData()
      ]);
    } catch (err) {
      console.error('Error refreshing data:', err);
    }
  }, [loadProfileData, loadDashboardData]);

  return {
    // Profile data
    profileData,
    profileStatus,
    isLoading,
    isSaving,
    error,
    
    // Dashboard data
    dashboardStats,
    assignedTeachers,
    teacherCourses,
    teacherStudents,
    isDashboardLoading,
    
    // Actions
    loadProfileStatus,
    loadProfileData,
    saveProfileData,
    completeProfile,
    partiallyCompleteProfile,
    checkCompletionRequirement,
    updateFieldLocally,
    loadDashboardData,
    refreshData,
    
    // Utilities
    clearError: () => setError(null),
  };
};
