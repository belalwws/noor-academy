'use client'

import React, { useState, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import ProtectedRoute from '@/components/ProtectedRoute'
import { simpleAuthService } from '@/lib/auth/simpleAuth'
import { ProfileImageAPI } from '@/lib/api/profile-image'
import { getProxiedImageUrl } from '@/lib/imageUtils'
import { getAuthToken } from '@/lib/auth'
import { useSimpleAuth } from '@/lib/hooks/useSimpleAuth'

// Profile Components
import ProfileSidebar from '@/components/profile/ProfileSidebar'
import ProfileHeader from '@/components/profile/ProfileHeader'
import PersonalInfoTab from '@/components/profile/PersonalInfoTab'
import SecurityTab from '@/components/profile/SecurityTab'
import ImageUploadDialog from '@/components/profile/ImageUploadDialog'

// Types
interface ProfileData {
  id: number
  username: string
  full_name: string
  first_name: string
  last_name: string
  email: string
  gender: 'male' | 'female'
  is_active: boolean
  is_staff: boolean
  is_superuser: boolean
  role: string
  last_login: string
  date_joined: string
  country_code: string
  phone_number: string
  age: number
  preferred_language: 'ar' | 'en'
  bio: string
  is_verified: boolean
  is_profile_complete: boolean
  is_profile_public: boolean
  profile_image_url: string | null
  profile_image_thumbnail_url: string | null
}

interface FormData {
  first_name: string
  last_name: string
  email: string
  gender: 'male' | 'female'
  country_code: string
  phone_number: string
  age: number
  bio: string
  preferred_language: 'ar' | 'en'
  is_profile_public: boolean
}

interface PasswordData {
  old_password: string
  new_password: string
  confirm_password: string
}

function GeneralSupervisorProfile() {
  const { user, updateUser } = useSimpleAuth()
  
  // State
  const [activeTab, setActiveTab] = useState('personal')
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [signedImageUrls, setSignedImageUrls] = useState<{profile_image_url?: string, profile_image_thumbnail_url?: string} | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showImageDialog, setShowImageDialog] = useState(false)
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [deletingImage, setDeletingImage] = useState(false)
  const [sendingVerification, setSendingVerification] = useState(false)
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null)
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState<FormData>({
    first_name: '',
    last_name: '',
    email: '',
    gender: 'male',
    country_code: '',
    phone_number: '',
    age: 0,
    bio: '',
    preferred_language: 'ar',
    is_profile_public: true
  })

  const [passwordData, setPasswordData] = useState<PasswordData>({
    old_password: '',
    new_password: '',
    confirm_password: ''
  })

  // Load profile data
  const loadProfile = async () => {
    try {
      setLoading(true)
      simpleAuthService.initialize()
      // Use getValidAccessToken to ensure token is valid and refresh if needed
      const token = await simpleAuthService.getValidAccessToken()
      
      if (!token) {
        toast.error('يجب تسجيل الدخول أولاً')
        return
      }

      const apiUrl = process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:8000/api'
      const response = await fetch(`${apiUrl}/auth/profile/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('فشل تحميل البيانات الشخصية')
      }

      const data: ProfileData = await response.json()
      setProfileData(data)
      
      // Set form data
      setFormData({
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        email: data.email || '',
        gender: data.gender || 'male',
        country_code: data.country_code || '',
        phone_number: data.phone_number || '',
        age: data.age || 0,
        bio: data.bio || '',
        preferred_language: data.preferred_language || 'ar',
        is_profile_public: data.is_profile_public ?? true
      })

      // Load signed image URLs
      try {
        const imageUrlsData = await ProfileImageAPI.getProfileImageUrls()
        if (imageUrlsData.success && imageUrlsData.data) {
          setSignedImageUrls(imageUrlsData.data)
        }
      } catch (error) {
        console.log('Could not load signed image URLs, using direct URLs')
      }
    } catch (error: any) {
      console.error('Error loading profile:', error)
      toast.error(error.message || 'فشل تحميل البيانات الشخصية')
    } finally {
      setLoading(false)
    }
  }

  // Save profile
  const saveProfile = async () => {
    try {
      setSaving(true)
      simpleAuthService.initialize()
      // Use getValidAccessToken to ensure token is valid and refresh if needed
      const token = await simpleAuthService.getValidAccessToken()
      
      if (!token) {
        toast.error('يجب تسجيل الدخول أولاً')
        return
      }

      const apiUrl = process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:8000/api'
      const response = await fetch(`${apiUrl}/auth/profile/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || 'فشل حفظ البيانات')
      }

      const updatedData: ProfileData = await response.json()
      setProfileData(updatedData)
      toast.success('تم حفظ البيانات بنجاح')
      
      // Reload profile to get updated data
      await loadProfile()
    } catch (error: any) {
      console.error('Error saving profile:', error)
      toast.error(error.message || 'فشل حفظ البيانات')
    } finally {
      setSaving(false)
    }
  }

  // Change password
  const changePassword = async () => {
    try {
      if (passwordData.new_password !== passwordData.confirm_password) {
        toast.error('كلمة المرور الجديدة غير متطابقة')
        return
      }

      if (passwordData.new_password.length < 8) {
        toast.error('كلمة المرور يجب أن تكون 8 أحرف على الأقل')
        return
      }

      setSaving(true)
      simpleAuthService.initialize()
      // Use getValidAccessToken to ensure token is valid and refresh if needed
      const token = await simpleAuthService.getValidAccessToken()
      
      if (!token) {
        toast.error('يجب تسجيل الدخول أولاً')
        return
      }

      const apiUrl = process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:8000/api'
      const response = await fetch(`${apiUrl}/auth/profile/change-password/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          old_password: passwordData.old_password,
          new_password: passwordData.new_password
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || errorData.message || 'فشل تغيير كلمة المرور')
      }

      toast.success('تم تغيير كلمة المرور بنجاح')
      setPasswordData({
        old_password: '',
        new_password: '',
        confirm_password: ''
      })
      setShowPasswordDialog(false)
    } catch (error: any) {
      console.error('Error changing password:', error)
      toast.error(error.message || 'فشل تغيير كلمة المرور')
    } finally {
      setSaving(false)
    }
  }

  // Send email verification
  const sendEmailVerification = async () => {
    try {
      setSendingVerification(true)
      simpleAuthService.initialize()
      // Use getValidAccessToken to ensure token is valid and refresh if needed
      const token = await simpleAuthService.getValidAccessToken()
      
      if (!token) {
        toast.error('يجب تسجيل الدخول أولاً')
        return
      }

      const apiUrl = process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:8000/api'
      const response = await fetch(`${apiUrl}/auth/email-verification/send/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || 'فشل إرسال رابط التحقق')
      }

      toast.success('تم إرسال رابط التحقق إلى بريدك الإلكتروني')
    } catch (error: any) {
      console.error('Error sending verification:', error)
      toast.error(error.message || 'فشل إرسال رابط التحقق')
    } finally {
      setSendingVerification(false)
    }
  }

  // Handle image dialog open
  const handleImageDialogOpen = () => {
    fileInputRef.current?.click()
  }

  // Handle image selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    console.log('📁 File selected in handleImageSelect:', file ? {
      name: file.name,
      type: file.type,
      size: `${(file.size / 1024 / 1024).toFixed(2)} MB`
    } : 'No file')
    
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
      if (!validTypes.includes(file.type)) {
        console.error('❌ Invalid file type:', file.type)
        toast.error('نوع الملف غير مدعوم. يرجى استخدام JPEG أو PNG أو WebP')
        return
      }

      // Validate file size (5MB max)
      const maxSize = 5 * 1024 * 1024 // 5MB in bytes
      if (file.size > maxSize) {
        console.error('❌ File too large:', file.size, 'bytes')
        toast.error('حجم الملف كبير جداً. الحد الأقصى 5 ميجابايت')
        return
      }

      console.log('✅ File validation passed, setting file and opening dialog')
      setSelectedImageFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string
        console.log('✅ Image preview generated, setting preview and opening dialog')
        setPreviewImageUrl(imageUrl)
        setShowImageDialog(true)
        console.log('✅ Dialog should be open now')
      }
      reader.onerror = (error) => {
        console.error('❌ Failed to read file:', error)
        toast.error('فشل في قراءة الملف')
      }
      reader.readAsDataURL(file)
    } else {
      console.warn('⚠️ No file selected')
    }
    
    // Reset input value to allow selecting the same file again
    if (e.target) {
      e.target.value = ''
    }
  }

  // Upload image - same as student profile
  const uploadImage = async () => {
    console.log('🚀 uploadImage called')
    console.log('📁 selectedImageFile:', selectedImageFile ? {
      name: selectedImageFile.name,
      type: selectedImageFile.type,
      size: selectedImageFile.size
    } : 'null')
    
    if (!selectedImageFile) {
      console.error('❌ No file selected')
      toast.error('الرجاء اختيار صورة أولاً')
      return
    }

    setUploadingImage(true)
    try {
      console.log('🔐 Initializing auth service...')
      simpleAuthService.initialize()
      // Use getValidAccessToken to ensure token is valid and refresh if needed
      const token = await simpleAuthService.getValidAccessToken()
      console.log('🔑 Token obtained:', token ? 'Yes (length: ' + token.length + ')' : 'No')
      
      if (!token) {
        console.error('❌ No auth token')
        toast.error('يجب تسجيل الدخول أولاً')
        return
      }

      console.log('📤 Uploading image:', selectedImageFile.name, selectedImageFile.type, selectedImageFile.size)

      const formData = new FormData()
      formData.append('image', selectedImageFile)

      console.log('📦 FormData created, sending to API...')

      const response = await fetch(`${process.env['NEXT_PUBLIC_API_URL']}/auth/profile/image/upload/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Don't set Content-Type - let browser set it with boundary for FormData
        },
        credentials: 'include',
        body: formData
      })

      console.log('📡 Response status:', response.status)

      if (response.ok) {
        const data = await response.json()
        console.log('📸 Image uploaded successfully:', data)
        
        // Check if we got valid image URLs (not default avatar)
        const hasValidImage = data.profile_image_url && 
                             data.profile_image_url !== '/default-avatar.png' &&
                             !data.profile_image_url.includes('default-avatar')
        
        if (hasValidImage) {
          // Update profile data
          setProfileData(prev => prev ? { 
            ...prev, 
            profile_image_url: data.profile_image_url,
            profile_image_thumbnail_url: data.profile_image_thumbnail_url 
          } : null)
          
          // Reload signed URLs after upload
          try {
            simpleAuthService.initialize()
            // Use getValidAccessToken to ensure token is valid and refresh if needed
            const token = await simpleAuthService.getValidAccessToken()
            if (token) {
              const imageUrlsResponse = await fetch(`${process.env['NEXT_PUBLIC_API_URL']}/auth/profile/image/urls/`, {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
                credentials: 'include',
              })

              if (imageUrlsResponse.ok) {
                const imageUrlsData = await imageUrlsResponse.json()
                console.log('🖼️ Reloaded signed URLs after upload:', imageUrlsData)
                if (imageUrlsData.success && imageUrlsData.data) {
                  setSignedImageUrls(imageUrlsData.data)
                  
                  // Dispatch event to update navbar immediately
                  const signedUrl = imageUrlsData.data.profile_image_thumbnail_url || imageUrlsData.data.profile_image_url
                  if (signedUrl) {
                    console.log('📡 Dispatching profileImageUpdated event after reload with URL:', signedUrl)
                    window.dispatchEvent(new CustomEvent('profileImageUpdated', {
                      detail: { imageUrl: signedUrl }
                    }))
                  }
                }
              }
            }
          } catch (error) {
            console.error('Error reloading signed URLs:', error)
          }
          
          setShowImageDialog(false)
          setPreviewImageUrl(null)
          setSelectedImageFile(null)
          toast.success('تم رفع الصورة بنجاح!')
          
          // Update user data as well
          if (user) {
            const updatedUser = {
              ...user,
              profile_image_url: data.profile_image_url,
              profile_image_thumbnail_url: data.profile_image_thumbnail_url
            }
            updateUser(updatedUser)
            
            // Also update localStorage directly to ensure all components get the update
            localStorage.setItem('user', JSON.stringify(updatedUser))
            
            // Dispatch a storage event for cross-component updates
            window.dispatchEvent(new StorageEvent('storage', {
              key: 'user',
              newValue: JSON.stringify(updatedUser),
              url: window.location.href
            }))
          }
        } else {
          console.warn('⚠️ Received default avatar URL, not updating')
          toast.error('فشل في رفع الصورة - تم استلام الصورة الافتراضية')
        }
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error('❌ Upload failed:', response.status, errorData)
        console.error('❌ Response headers:', Object.fromEntries(response.headers.entries()))
        
        // Extract error message
        let errorMessage = 'فشل في رفع الصورة'
        if (errorData.message) {
          errorMessage = errorData.message
        } else if (errorData.errors) {
          // Handle Django field errors
          const firstError = Object.values(errorData.errors)[0]
          if (Array.isArray(firstError) && firstError.length > 0) {
            errorMessage = firstError[0]
          }
        } else if (errorData.detail) {
          errorMessage = errorData.detail
        }
        
        console.error('❌ Error message:', errorMessage)
        toast.error(errorMessage)
        throw new Error(errorMessage)
      }
    } catch (error) {
      console.error('❌ Error uploading image:', error)
      if (error instanceof Error) {
        console.error('❌ Error message:', error.message)
        console.error('❌ Error stack:', error.stack)
        if (!error.message.includes('فشل')) {
          toast.error(`حدث خطأ أثناء رفع الصورة: ${error.message}`)
        }
      } else {
        toast.error('حدث خطأ غير متوقع أثناء رفع الصورة')
      }
    } finally {
      setUploadingImage(false)
    }
  }

  // Delete image - same as student profile
  const deleteImage = async () => {
      setDeletingImage(true)
      try {
        simpleAuthService.initialize()
        // Use getValidAccessToken to ensure token is valid and refresh if needed
        const token = await simpleAuthService.getValidAccessToken()
        if (!token) return

      const response = await fetch(`${process.env['NEXT_PUBLIC_API_URL']}/auth/profile/image/delete/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      })

      if (response.ok) {
        setProfileData(prev => prev ? { ...prev, profile_image_thumbnail_url: null, profile_image_url: null } : null)
        setSignedImageUrls(null) // Clear signed URLs
        setShowImageDialog(false)
        toast.success('تم حذف الصورة بنجاح!')
        
        // Update user data as well
        if (user) {
          const updatedUser = {
            ...user,
            profile_image_url: null,
            profile_image_thumbnail_url: null
          }
          updateUser(updatedUser)
          localStorage.setItem('user', JSON.stringify(updatedUser))
        }
        
        // Reload profile to get updated data
        await loadProfile()
      } else {
        throw new Error('فشل في حذف الصورة')
      }
    } catch (error) {
      console.error('Error deleting image:', error)
      toast.error('حدث خطأ أثناء حذف الصورة')
    } finally {
      setDeletingImage(false)
    }
  }

  useEffect(() => {
    loadProfile()
  }, [])

  // Prepare profile data for ProfileHeader
  const profileHeaderData = profileData ? {
    full_name: profileData.full_name,
    email: profileData.email,
    role: 'supervisor',
    is_verified: profileData.is_verified,
    is_active: profileData.is_active,
    profile_image_thumbnail_url: signedImageUrls?.profile_image_thumbnail_url || 
                                 signedImageUrls?.profile_image_url || 
                                 profileData.profile_image_thumbnail_url || 
                                 profileData.profile_image_url,
    isSupervisor: true // Flag to indicate this is supervisor profile
  } : null

  // Prepare form data for PersonalInfoTab (without learning_goal)
  const personalInfoFormData = {
    first_name: formData.first_name,
    last_name: formData.last_name,
    email: formData.email,
    gender: formData.gender,
    country_code: formData.country_code,
    phone_number: formData.phone_number,
    age: formData.age,
    bio: formData.bio,
    preferred_language: formData.preferred_language,
    learning_goal: 'other' as const // Not used for supervisor but required by component
  }

  if (loading && !profileData) {
    return (
      <ProtectedRoute allowedRoles={['supervisor', 'general_supervisor', 'admin']}>
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute allowedRoles={['supervisor', 'general_supervisor', 'admin']}>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="max-w-7xl mx-auto px-4 pt-24 pb-8">
          {/* Profile Header */}
          <ProfileHeader
            profileData={profileHeaderData}
            uploadingImage={uploadingImage}
            sendingVerification={sendingVerification}
            onImageDialogOpen={handleImageDialogOpen}
            onSendEmailVerification={sendEmailVerification}
          />

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <ProfileSidebar
                activeTab={activeTab}
                onTabChange={setActiveTab}
              />
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {activeTab === 'personal' && (
                <PersonalInfoTab
                  formData={personalInfoFormData}
                  loading={saving}
                  hideLearningGoal={true}
                  onFormDataChange={(data) => {
                    // Remove learning_goal if present (not used for supervisor)
                    const { learning_goal, ...rest } = data
                    setFormData(prev => ({ ...prev, ...rest }))
                  }}
                  onSave={saveProfile}
                />
              )}

              {activeTab === 'security' && (
                <SecurityTab
                  formData={{
                    is_profile_public: formData.is_profile_public
                  }}
                  passwordData={passwordData}
                  profileData={profileData}
                  loading={saving}
                  showPasswordDialog={showPasswordDialog}
                  sendingVerification={sendingVerification}
                  onFormDataChange={(data) => {
                    setFormData(prev => ({ ...prev, ...data }))
                  }}
                  onPasswordDataChange={setPasswordData}
                  onPasswordDialogToggle={() => setShowPasswordDialog(!showPasswordDialog)}
                  onPasswordChange={changePassword}
                  onSendEmailVerification={sendEmailVerification}
                />
              )}

              {activeTab === 'preferences' && (
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 border border-slate-200 dark:border-slate-700">
                  <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">التفضيلات</h2>
                  <p className="text-slate-600 dark:text-slate-400">لا توجد تفضيلات متاحة حالياً</p>
                </div>
              )}
            </div>
          </div>

          {/* Image Upload Dialog */}
          <ImageUploadDialog
            open={showImageDialog}
            onOpenChange={setShowImageDialog}
            currentImageUrl={signedImageUrls?.profile_image_thumbnail_url || profileData?.profile_image_thumbnail_url}
            previewImageUrl={previewImageUrl}
            uploadingImage={uploadingImage}
            deletingImage={deletingImage}
            onImageSelect={handleImageSelect}
            onImageUpload={uploadImage}
            onImageDelete={deleteImage}
            fileInputRef={fileInputRef}
          />
        </div>
      </div>
    </ProtectedRoute>
  )
}

export default GeneralSupervisorProfile
