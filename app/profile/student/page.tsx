'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useSimpleAuth } from '@/lib/hooks/useSimpleAuth'
import { toast } from 'sonner'
import ProtectedRoute from '@/components/ProtectedRoute'
import { getAuthToken } from '@/lib/auth'

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
  learning_goal: string
  preferred_language: string
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
  learning_goal: 'memorize_quran' | 'learn_arabic' | 'islamic_studies' | 'other'
  preferred_language: 'ar' | 'en'
  is_profile_public: boolean
}

interface PasswordData {
  old_password: string
  new_password: string
  confirm_password: string
}

function StudentProfile() {
  const { user, updateUser } = useSimpleAuth()
  
  // State
  const [activeTab, setActiveTab] = useState('personal')
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [signedImageUrls, setSignedImageUrls] = useState<{profile_image_url?: string, profile_image_thumbnail_url?: string} | null>(null)
  const [loading, setLoading] = useState(false)
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
    learning_goal: 'memorize_quran',
    preferred_language: 'ar',
    is_profile_public: true
  })

  const [passwordData, setPasswordData] = useState<PasswordData>({
    old_password: '',
    new_password: '',
    confirm_password: ''
  })

  // Load profile data
  useEffect(() => {
    const loadProfileData = async () => {
      try {
        const token = getAuthToken()
        if (!token) {
          console.error('❌ No token found')
          return
        }

        console.log('🔄 Loading profile data...')

        // Load profile data
        const profileResponse = await fetch(`${process.env['NEXT_PUBLIC_API_URL']}/auth/profile/`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        })

        console.log('📡 Profile response status:', profileResponse.status)

        if (profileResponse.ok) {
          const profileData = await profileResponse.json()
          console.log('✅ Profile data loaded successfully:', profileData)
          console.log('📸 Image URLs:', {
            profile_image_url: profileData.profile_image_url,
            profile_image_thumbnail_url: profileData.profile_image_thumbnail_url
          })
          setProfileData(profileData)

          // Load signed image URLs if user has profile images
          if (profileData.profile_image_url || profileData.profile_image_thumbnail_url) {
            try {
              const imageUrlsResponse = await fetch(`${process.env['NEXT_PUBLIC_API_URL']}/auth/profile/image/urls/`, {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
                credentials: 'include',
              })

              if (imageUrlsResponse.ok) {
                const imageUrlsData = await imageUrlsResponse.json()
                console.log('🖼️ Signed URLs loaded:', imageUrlsData)
                if (imageUrlsData.success && imageUrlsData.data) {
                  setSignedImageUrls(imageUrlsData.data)
                  
                  // Dispatch event to update navbar on page load
                  const signedUrl = imageUrlsData.data.profile_image_thumbnail_url || imageUrlsData.data.profile_image_url
                  if (signedUrl && !signedUrl.includes('default-avatar')) {
                    console.log('📡 Dispatching profileImageUpdated event on page load with URL:', signedUrl)
                    window.dispatchEvent(new CustomEvent('profileImageUpdated', {
                      detail: { imageUrl: signedUrl }
                    }))
                  }
                }
              }
            } catch (error) {
              console.error('Error loading signed image URLs:', error)
            }
          }
          
          // Update form data
          setFormData({
            first_name: profileData.first_name || '',
            last_name: profileData.last_name || '',
            email: profileData.email || '',
            gender: profileData.gender || 'male',
            country_code: profileData.country_code || '',
            phone_number: profileData.phone_number || '',
            age: profileData.age || 0,
            bio: profileData.bio || '',
            learning_goal: profileData.learning_goal || 'memorize_quran',
            preferred_language: profileData.preferred_language || 'ar',
            is_profile_public: profileData.is_profile_public ?? true
          })
        } else {
          console.error('❌ Failed to load profile:', profileResponse.status, profileResponse.statusText)
          toast.error('فشل في تحميل بيانات الملف الشخصي')
        }
      } catch (error) {
        console.error('❌ Error loading profile data:', error)
        toast.error('حدث خطأ في تحميل البيانات')
      }
    }

    loadProfileData()
  }, [])

  // Handler functions
  const handlePersonalInfoChange = (data: any) => {
    setFormData(prev => ({ ...prev, ...data }))
  }

  const handleSecurityInfoChange = (data: any) => {
    setFormData(prev => ({ ...prev, ...data }))
  }

  const handlePasswordDataChange = (data: PasswordData) => {
    setPasswordData(data)
  }


  const handlePasswordDialogToggle = () => {
    setShowPasswordDialog(!showPasswordDialog)
  }

  const handleImageDialogOpen = () => {
    setShowImageDialog(true)
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const token = getAuthToken()
      if (!token) return

      const updateData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        // email is not included - users cannot edit their email
        gender: formData.gender,
        country_code: formData.country_code,
        phone_number: formData.phone_number,
        age: formData.age,
        bio: formData.bio,
        learning_goal: formData.learning_goal,
        preferred_language: formData.preferred_language,
        is_profile_public: formData.is_profile_public
      }

      const response = await fetch(`${process.env['NEXT_PUBLIC_API_URL']}/auth/profile/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(updateData)
      })

      if (response.ok) {
        const updatedData = await response.json()
        
        // Update profile data
        setProfileData(prev => prev ? { ...prev, ...updatedData } : updatedData)
        
        // Update form data with the latest values
        setFormData({
          first_name: updatedData.first_name || formData.first_name,
          last_name: updatedData.last_name || formData.last_name,
          email: updatedData.email || formData.email,
          gender: updatedData.gender || formData.gender,
          country_code: updatedData.country_code || formData.country_code,
          phone_number: updatedData.phone_number || formData.phone_number,
          age: updatedData.age || formData.age,
          bio: updatedData.bio || formData.bio,
          learning_goal: updatedData.learning_goal || formData.learning_goal,
          preferred_language: updatedData.preferred_language || formData.preferred_language,
          is_profile_public: updatedData.is_profile_public ?? formData.is_profile_public
        })
        
        // Update user data
        updateUser({
          ...user,
          ...updatedData
        })

        toast.success('تم حفظ البيانات بنجاح!')
      } else {
        throw new Error('فشل في حفظ البيانات')
      }
    } catch (error) {
      console.error('Error saving profile:', error)
      toast.error('حدث خطأ أثناء حفظ البيانات')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async () => {
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error('كلمات المرور الجديدة غير متطابقة')
      return
    }

    setLoading(true)
    try {
      const token = getAuthToken()
      if (!token) return

      const response = await fetch(`${process.env['NEXT_PUBLIC_API_URL']}/auth/profile/change-password/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          old_password: passwordData.old_password,
          new_password: passwordData.new_password
        })
      })

      if (response.ok) {
        setPasswordData({ old_password: '', new_password: '', confirm_password: '' })
        setShowPasswordDialog(false)
        toast.success('تم تغيير كلمة المرور بنجاح!')
      } else {
        throw new Error('فشل في تغيير كلمة المرور')
      }
    } catch (error) {
      console.error('Error changing password:', error)
      toast.error('حدث خطأ أثناء تغيير كلمة المرور')
    } finally {
      setLoading(false)
    }
  }

  const sendEmailVerification = async () => {
    setSendingVerification(true)
    try {
      const token = getAuthToken()
      if (!token) return

      const response = await fetch(`${process.env['NEXT_PUBLIC_API_URL']}/auth/email-verification/send/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      })

      if (response.ok) {
        toast.success('تم إرسال رسالة التحقق بنجاح!')
      } else {
        throw new Error('فشل في إرسال رسالة التحقق')
      }
    } catch (error) {
      console.error('Error sending verification email:', error)
      toast.error('حدث خطأ أثناء إرسال رسالة التحقق')
    } finally {
      setSendingVerification(false)
    }
  }

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      console.log('📁 File selected:', {
        name: file.name,
        type: file.type,
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`
      })

      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
      if (!validTypes.includes(file.type)) {
        toast.error('نوع الملف غير مدعوم. استخدم JPEG أو PNG أو WebP')
        return
      }

      // Validate file size (5MB max)
      const maxSize = 5 * 1024 * 1024 // 5MB in bytes
      if (file.size > maxSize) {
        toast.error('حجم الملف كبير جداً. الحد الأقصى 5 ميجابايت')
        return
      }

      setSelectedImageFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string
        console.log('✅ Image preview generated')
        setPreviewImageUrl(imageUrl)
      }
      reader.onerror = () => {
        console.error('❌ Failed to read file')
        toast.error('فشل في قراءة الملف')
      }
      reader.readAsDataURL(file)
    }
  }

  const handleImageUpload = async () => {
    if (!selectedImageFile) {
      console.error('❌ No file selected')
      toast.error('الرجاء اختيار صورة أولاً')
      return
    }

    setUploadingImage(true)
    try {
      const token = getAuthToken()
      if (!token) {
        console.error('❌ No auth token')
        toast.error('يجب تسجيل الدخول أولاً')
        return
      }

      console.log('📤 Uploading image:', selectedImageFile.name, selectedImageFile.type, selectedImageFile.size)

      const formData = new FormData()
      formData.append('image', selectedImageFile)  // Changed from 'profile_image' to 'image'

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
            const token = getAuthToken()
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
        }
        
        toast.error(errorMessage)
        throw new Error(errorMessage)
      }
    } catch (error) {
      console.error('❌ Error uploading image:', error)
      if (error instanceof Error && !error.message.includes('فشل')) {
        toast.error('حدث خطأ أثناء رفع الصورة')
      }
    } finally {
      setUploadingImage(false)
    }
  }

  const handleImageDelete = async () => {
    setDeletingImage(true)
    try {
      const token = getAuthToken()
      if (!token) return

      const response = await fetch(`${process.env['NEXT_PUBLIC_API_URL']}/auth/profile/image/delete/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      })

      if (response.ok) {
        setProfileData(prev => prev ? { ...prev, profile_image_thumbnail_url: null } : null)
        setSignedImageUrls(null) // Clear signed URLs
        setShowImageDialog(false)
        toast.success('تم حذف الصورة بنجاح!')
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

  const renderTabContent = () => {
    switch (activeTab) {
      case 'personal':
        return (
          <PersonalInfoTab
            formData={{
              first_name: formData.first_name,
              last_name: formData.last_name,
              email: formData.email,
              gender: formData.gender,
              country_code: formData.country_code,
              phone_number: formData.phone_number,
              age: formData.age,
              bio: formData.bio,
              learning_goal: formData.learning_goal,
              preferred_language: formData.preferred_language
            }}
            loading={loading}
            onFormDataChange={handlePersonalInfoChange}
            onSave={handleSave}
          />
        )
      case 'security':
        return (
          <SecurityTab
            formData={{
              is_profile_public: formData.is_profile_public
            }}
            passwordData={passwordData}
            profileData={profileData}
            loading={loading}
            showPasswordDialog={showPasswordDialog}
            sendingVerification={sendingVerification}
            onFormDataChange={handleSecurityInfoChange}
            onPasswordDataChange={handlePasswordDataChange}
            onPasswordDialogToggle={handlePasswordDialogToggle}
            onPasswordChange={handlePasswordChange}
            onSendEmailVerification={sendEmailVerification}
          />
        )
      case 'preferences':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">إعدادات التفضيلات</h3>
              <p className="text-gray-600">هذا القسم قيد التطوير...</p>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 pt-20">
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-br from-amber-200/20 to-orange-200/20 dark:from-amber-900/10 dark:to-orange-900/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-br from-purple-200/20 to-pink-200/20 dark:from-purple-900/10 dark:to-pink-900/10 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Profile Header */}
        <ProfileHeader
          profileData={profileData ? {
            ...profileData,
            profile_image_thumbnail_url: signedImageUrls?.profile_image_thumbnail_url || profileData.profile_image_thumbnail_url
          } : null}
          uploadingImage={uploadingImage}
          sendingVerification={sendingVerification}
          onImageDialogOpen={handleImageDialogOpen}
          onSendEmailVerification={sendEmailVerification}
        />
        {/* Debug info */}
        {(() => {
          console.log('🔍 ProfileData passed to header:', {
            profileData,
            signedImageUrls,
            hasImage: !!(signedImageUrls?.profile_image_thumbnail_url || profileData?.profile_image_thumbnail_url),
            imageUrl: signedImageUrls?.profile_image_thumbnail_url || profileData?.profile_image_thumbnail_url
          })
          return null
        })()}

        {/* Main Content with Sidebar */}
        <div className="flex gap-8">
          {/* Sidebar */}
          <ProfileSidebar
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />

          {/* Main Content */}
          <div className="flex-1">
            {renderTabContent()}
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
          onImageUpload={handleImageUpload}
          onImageDelete={handleImageDelete}
          fileInputRef={fileInputRef}
        />
      </div>
    </div>
  )
}

export default function StudentProfilePage() {
  return (
    <ProtectedRoute allowedRoles={["student"]}>
      <StudentProfile />
    </ProtectedRoute>
  )
}
