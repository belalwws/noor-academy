'use client';

import React, { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useSupervisorProfile } from '@/hooks/useSupervisorProfile';
import { ProfileSideMenu } from '@/components/supervisor-profile/ProfileSideMenu';
import { ProfileCompletionStatusComponent } from '@/components/supervisor-profile/ProfileCompletionStatus';
import ProfileOverview from '@/components/supervisor-profile/ProfileOverview';
import { PersonalInfoForm } from '@/components/supervisor-profile/PersonalInfoForm';
import { ProfessionalInfoForm } from '@/components/supervisor-profile/ProfessionalInfoForm';
import { SecuritySettings } from '@/components/supervisor-profile/SecuritySettings';
import ProfileImageManager from '@/components/supervisor-profile/ProfileImageManager';
import { ProfileActions } from '@/components/supervisor-profile/ProfileActions';
import { User } from 'lucide-react';

export default function SupervisorProfilePage() {
  const [activeSection, setActiveSection] = useState('overview');
  
  const {
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
  } = useSupervisorProfile();


  // Load profile data on component mount
  useEffect(() => {
    loadProfile();
    loadStatus();
  }, [loadProfile, loadStatus]);

  const handleSave = () => {
    saveProfile(profileData);
  };

  const handleComplete = () => {
    completeProfile(profileData);
  };

  const handleRefresh = () => {
    loadProfile();
    loadStatus();
  };


  const renderActiveSection = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <ProfileOverview 
            profileData={profileData} 
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
              data={profileData}
              onFieldChange={updateField}
              disabled={isSaving}
            />
            <ProfileActions
              isSaving={isSaving}
              isLoading={isLoading}
              error={error}
              onSave={handleSave}
              onComplete={handleComplete}
              onRefresh={handleRefresh}
              onResetError={resetError}
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
              data={profileData}
              onFieldChange={updateField}
              disabled={isSaving}
            />
            <ProfileActions
              isSaving={isSaving}
              isLoading={isLoading}
              error={error}
              onSave={handleSave}
              onComplete={handleComplete}
              onRefresh={handleRefresh}
              onResetError={resetError}
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
            profileData={profileData} 
            profileStatus={profileStatus} 
          />
        );
    }
  };

  return (
    <ProtectedRoute allowedRoles={['supervisor', 'general_supervisor']}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          
          {/* Header */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 mb-8">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-green-700 rounded-xl flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
          </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    الملف الشخصي للمشرف العام
                  </h1>
                  <p className="text-gray-600 mt-1">
                    إدارة ملفك الشخصي والمهني كمشرف عام في النظام
                  </p>
                </div>
                </div>

              </div>
            </div>

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
              <div className="space-y-6">
                {renderActiveSection()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
