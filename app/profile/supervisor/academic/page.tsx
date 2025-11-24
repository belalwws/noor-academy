'use client';

import React, { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import ProfileSideMenu from '@/components/academic-supervisor-profile/ProfileSideMenu';
import { useAcademicSupervisorProfile } from '@/hooks/useAcademicSupervisorProfile';
import ProfileOverview from '@/components/academic-supervisor-profile/ProfileOverview';
import { ProfileCompletionStatusComponent } from '@/components/supervisor-profile/ProfileCompletionStatus';
import { PersonalInfoForm } from '@/components/academic-supervisor-profile/PersonalInfoForm';
import { ProfessionalInfoForm } from '@/components/academic-supervisor-profile/ProfessionalInfoForm';
import { ProfileActions } from '@/components/academic-supervisor-profile/ProfileActions';
import { SecuritySettings } from '@/components/supervisor-profile/SecuritySettings';
import ProfileImageManager from '@/components/supervisor-profile/ProfileImageManager';
import RequiredFieldsModal from '@/components/academic-supervisor-profile/RequiredFieldsModal';

export default function AcademicSupervisorProfilePage() {
  const [activeSection, setActiveSection] = useState('overview');
  const [showRequiredFieldsModal, setShowRequiredFieldsModal] = useState(false);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  
  const {
    profileData,
    profileStatus,
    isLoading,
    isSaving,
    error,
    loadProfileStatus,
    loadProfileData,
    saveProfileData,
    updateFieldLocally,
    clearError
  } = useAcademicSupervisorProfile();

  useEffect(() => {
    loadProfileData();
    loadProfileStatus();
  }, [loadProfileData, loadProfileStatus]);

  // Helper function to update profile fields locally
  const updateField = (field: string, value: any) => {
    updateFieldLocally(field, value);
  };

  // Parse error and show required fields modal if needed
  const handleSaveError = (error: any) => {
    if (error.message && error.message.includes('Error Details:')) {
      try {
        const errorDetailsMatch = error.message.match(/Error Details:\s*(\{[\s\S]*\})/);
        if (errorDetailsMatch) {
          const errorDetails = JSON.parse(errorDetailsMatch[1]);
          
          // Extract missing fields
          const missingFieldsList = Object.keys(errorDetails).filter(field => {
            const fieldErrors = errorDetails[field];
            return Array.isArray(fieldErrors) && fieldErrors.some(err => 
              err.includes('may not be null') || err.includes('required')
            );
          });
          
          if (missingFieldsList.length > 0) {
            setMissingFields(missingFieldsList);
            setShowRequiredFieldsModal(true);
            return true; // Handled
          }
        }
      } catch (parseError) {
        // Silently fail if error parsing fails
      }
    }
    
    return false; // Not handled
  };


  const renderActiveSection = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <ProfileOverview 
            profileData={profileData || {} as any} 
            profileStatus={profileStatus} 
          />
        );
      case 'personal':
        return (
          <>
            <ProfileCompletionStatusComponent 
              status={profileStatus} 
              isLoading={isLoading} 
            />
            <PersonalInfoForm
              data={profileData || {} as any}
              onFieldChange={updateField}
              disabled={isSaving}
            />
            <ProfileActions
              isSaving={isSaving}
              isLoading={isLoading}
              error={error}
              onSave={async () => {
                if (profileData) {
                  try {
                    await saveProfileData(profileData);
    } catch (error) {
                    handleSaveError(error);
                  }
                }
              }}
              onComplete={() => {}}
              onRefresh={() => { loadProfileData(); loadProfileStatus(); }}
              onResetError={clearError}
              isComplete={profileStatus?.is_complete || false}
            />
          </>
        );
      case 'professional':
        return (
          <>
            <ProfileCompletionStatusComponent 
              status={profileStatus} 
              isLoading={isLoading} 
            />
            <ProfessionalInfoForm
              data={profileData || {} as any}
              onFieldChange={updateField}
              disabled={isSaving}
            />
            <ProfileActions
              isSaving={isSaving}
              isLoading={isLoading}
              error={error}
              onSave={async () => {
                console.log('🔄 Save button clicked!');
                console.log('📊 Current profileData:', profileData);
                console.log('💾 isSaving:', isSaving);
                console.log('⏳ isLoading:', isLoading);
                
                if (profileData) {
                  try {
                    console.log('🚀 Starting save process...');
                    await saveProfileData(profileData);
                    console.log('✅ Save completed successfully!');
    } catch (error) {
                    console.error('❌ Save failed:', error);
                  }
                } else {
                  console.log('⚠️ No profile data to save');
                }
              }}
              onComplete={() => {}}
              onRefresh={() => { loadProfileData(); loadProfileStatus(); }}
              onResetError={clearError}
              isComplete={profileStatus?.is_complete || false}
            />
          </>
        );
      case 'profile-image':
        return <ProfileImageManager />;
      case 'security':
        return <SecuritySettings />;
      default:
        return (
          <ProfileOverview 
            profileData={profileData || {} as any} 
            profileStatus={profileStatus} 
          />
        );
    }
  };

  return (
    <ProtectedRoute allowedRoles={['academic_supervisor']}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            الملف الشخصي - المشرف الأكاديمي
          </h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Side Menu */}
            <div className="lg:col-span-1">
              <ProfileSideMenu 
                activeSection={activeSection}
                onSectionChange={setActiveSection}
              />
                </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {renderActiveSection()}
            </div>
          </div>
        </div>
      </div>

      {/* Required Fields Modal */}
      <RequiredFieldsModal
        isOpen={showRequiredFieldsModal}
        onClose={() => setShowRequiredFieldsModal(false)}
        missingFields={missingFields}
        onFillFields={() => {
          setActiveSection('personal');
          setShowRequiredFieldsModal(false);
        }}
      />
    </ProtectedRoute>
  );
}
