import { useState, useEffect, useCallback } from 'react';
import { SupervisorProfileAPI, SupervisorProfileData, ProfileCompletionStatus } from '@/lib/api/supervisor-profile';
import { toast } from 'sonner';

export interface UseSupervisorProfileReturn {
  profileData: SupervisorProfileData;
  profileStatus: ProfileCompletionStatus | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  loadProfile: () => Promise<void>;
  loadStatus: () => Promise<void>;
  saveProfile: (data: Partial<SupervisorProfileData>) => Promise<void>;
  completeProfile: (data: SupervisorProfileData) => Promise<void>;
  updateField: (field: keyof SupervisorProfileData, value: string | number) => void;
  resetError: () => void;
}

const initialProfileData: SupervisorProfileData = {
  first_name: '',
  last_name: '',
  username: '',
  email: '',
  phone_number: '',
  country_code: '+966',
  gender: 'male',
  age: 0,
  bio: '',
  department: '',
  specialization: '',
  areas_of_responsibility: '',
  experience: '',
  achievements: ''
};

export const useSupervisorProfile = (): UseSupervisorProfileReturn => {
  const [profileData, setProfileData] = useState<SupervisorProfileData>(initialProfileData);
  const [profileStatus, setProfileStatus] = useState<ProfileCompletionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load profile data
  const loadProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🔍 Loading supervisor profile...');
      const data = await SupervisorProfileAPI.getProfileData();
      console.log('✅ Profile loaded successfully:', data);
      console.log('👤 Personal Info from hook:');
      console.log('  - Name:', data.first_name, data.last_name);
      console.log('  - Email:', data.email);
      console.log('  - Phone:', data.country_code, data.phone_number);
      console.log('  - Age:', data.age);
      console.log('  - Gender:', data.gender);
      console.log('🔍 Hook - All data keys:', Object.keys(data));
      console.log('🔍 Hook - Data values check:');
      console.log('  - data.email exists?', !!data.email);
      console.log('  - data.phone_number exists?', !!data.phone_number);
      console.log('  - data.age exists?', !!data.age);
      setProfileData(data);
    } catch (err: any) {
      console.error('❌ Error loading profile:', err);
      setError(err.message || 'فشل في تحميل بيانات البروفايل');
      toast.error('فشل في تحميل بيانات البروفايل');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load profile completion status
  const loadStatus = useCallback(async () => {
    try {
      console.log('🔍 Loading profile status...');
      const status = await SupervisorProfileAPI.getProfileStatus();
      setProfileStatus(status);
      console.log('✅ Profile status loaded:', status);
    } catch (err: any) {
      console.error('❌ Error loading profile status:', err);
      // Don't show error toast for status loading as it's not critical
    }
  }, []);

  // Save profile (partial update)
  const saveProfile = useCallback(async (data: Partial<SupervisorProfileData>) => {
    setIsSaving(true);
    setError(null);
    
    try {
      console.log('🔍 Saving supervisor profile...');
      const updatedData = await SupervisorProfileAPI.updateProfile(data);
      setProfileData(updatedData);
      console.log('✅ Profile saved successfully');
      toast.success('تم حفظ البيانات بنجاح!');
      
      // Reload status after successful save
      await loadStatus();
    } catch (err: any) {
      console.error('❌ Error saving profile:', err);
      const errorMessage = err.message || 'فشل في حفظ البيانات';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  }, [loadStatus]);

  // Complete profile (full update)
  const completeProfile = useCallback(async (data: SupervisorProfileData) => {
    setIsSaving(true);
    setError(null);
    
    try {
      console.log('🔍 Completing supervisor profile...');
      const updatedData = await SupervisorProfileAPI.completeProfile(data);
      setProfileData(updatedData);
      console.log('✅ Profile completed successfully');
      toast.success('تم إكمال البروفايل بنجاح!');
      
      // Reload status after successful completion
      await loadStatus();
    } catch (err: any) {
      console.error('❌ Error completing profile:', err);
      const errorMessage = err.message || 'فشل في إكمال البروفايل';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  }, [loadStatus]);

  // Update single field
  const updateField = useCallback((field: keyof SupervisorProfileData, value: string | number) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // Reset error
  const resetError = useCallback(() => {
    setError(null);
  }, []);

  // Load data on mount
  useEffect(() => {
    loadProfile();
    loadStatus();
  }, [loadProfile, loadStatus]);

  return {
    profileData,
    profileStatus,
    isLoading,
    isSaving,
    error,
    loadProfile,
    loadStatus,
    saveProfile,
    completeProfile,
    updateField,
    resetError
  };
};

