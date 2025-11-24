'use client'

import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button';
import {
  GraduationCap,
  Camera,
  RefreshCw,
  Check,
  AlertCircle,
  Mail,
  Sparkles,
  UserCog
} from 'lucide-react'
import { motion } from 'framer-motion'
import { Spinner } from '@/components/ui/spinner'

interface UserProfile {
  full_name: string
  email?: string
  role: string
  is_verified: boolean
  is_active: boolean
  profile_image_thumbnail_url?: string | null
  isSupervisor?: boolean
}

interface ProfileHeaderProps {
  profileData: UserProfile | null
  uploadingImage: boolean
  sendingVerification: boolean
  onImageDialogOpen: () => void
  onSendEmailVerification: () => void
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  profileData,
  uploadingImage,
  sendingVerification,
  onImageDialogOpen,
  onSendEmailVerification
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 dark:from-amber-600 dark:via-orange-700 dark:to-amber-800 rounded-3xl p-8 text-white shadow-2xl shadow-orange-500/20 dark:shadow-orange-900/40 relative overflow-hidden mb-8"
    >
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full blur-3xl -translate-y-20 translate-x-20"></div>
      <div className="absolute bottom-0 left-0 w-56 h-56 bg-amber-300/20 dark:bg-amber-900/20 rounded-full blur-2xl translate-y-16 -translate-x-16"></div>

      {/* Sparkles decorations */}
      <motion.div
        animate={{
          rotate: [0, 360],
          scale: [1, 1.2, 1]
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute top-8 left-8"
      >
        <Sparkles className="w-6 h-6 text-amber-200 dark:text-amber-300" />
      </motion.div>
      <motion.div
        animate={{
          rotate: [360, 0],
          scale: [1, 1.3, 1]
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute bottom-8 right-8"
      >
        <Sparkles className="w-5 h-5 text-orange-200 dark:text-orange-300" />
      </motion.div>

      <div className="relative z-10">
        <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between gap-6">
          <div className="flex flex-col lg:flex-row items-center gap-6">
            {/* Profile Image */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
              className="relative"
            >
              <div className="w-32 h-32 bg-gradient-to-br from-white/30 to-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border-4 border-white/30 shadow-2xl">
                {profileData?.profile_image_thumbnail_url && 
                 !profileData.profile_image_thumbnail_url.includes('default-avatar') &&
                 profileData.profile_image_thumbnail_url !== '/default-avatar.png' ? (
                  <img
                    src={profileData.profile_image_thumbnail_url}
                    alt="الصورة الشخصية"
                    className="w-28 h-28 rounded-xl object-cover"
                    referrerPolicy="no-referrer"
                    onLoad={() => console.log('✅ Image loaded successfully:', profileData.profile_image_thumbnail_url)}
                    onError={(e) => {
                      console.error('❌ Image failed to load:', profileData.profile_image_thumbnail_url)
                      console.log('🔄 Hiding broken image and showing default icon')
                      e.currentTarget.style.display = 'none'
                      // Show the fallback icon
                      const fallbackIcon = e.currentTarget.parentElement?.querySelector('#fallback-icon') as HTMLElement
                      if (fallbackIcon) {
                        fallbackIcon.style.display = 'block'
                      }
                    }}
                  />
                ) : (
                  profileData?.isSupervisor ? (
                    <UserCog className="w-16 h-16 text-white" />
                  ) : (
                    <GraduationCap className="w-16 h-16 text-white" />
                  )
                )}
                {/* Fallback icon */}
                {profileData?.profile_image_thumbnail_url && 
                 !profileData.profile_image_thumbnail_url.includes('default-avatar') &&
                 profileData.profile_image_thumbnail_url !== '/default-avatar.png' && (
                  profileData?.isSupervisor ? (
                    <UserCog
                      id="fallback-icon"
                      className="w-16 h-16 text-white absolute inset-0 m-auto"
                      style={{ display: 'none' }}
                    />
                  ) : (
                    <GraduationCap
                      id="fallback-icon"
                      className="w-16 h-16 text-white absolute inset-0 m-auto"
                      style={{ display: 'none' }}
                    />
                  )
                )}
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={onImageDialogOpen}
                disabled={uploadingImage}
                className="absolute -bottom-2 -right-2 w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 dark:from-purple-600 dark:to-pink-700 rounded-xl flex items-center justify-center border-3 border-white shadow-xl transition-transform"
              >
                {uploadingImage ? (
                  <RefreshCw className="w-5 h-5 animate-spin text-white" />
                ) : (
                  <Camera className="w-5 h-5 text-white" />
                )}
              </motion.button>
            </motion.div>

            {/* Profile Info */}
            <div className="flex-1 text-center lg:text-right">
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="text-4xl font-bold mb-2 drop-shadow-lg"
              >
                {profileData?.full_name || 'الملف الشخصي'}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="text-amber-100 dark:text-amber-200 text-lg mb-4"
              >
                {profileData?.isSupervisor ? 'بروفايل المشرف العام - إدارة بياناتك الشخصية وإعداداتك' : 'إدارة بياناتك الشخصية وإعداداتك'}
              </motion.p>

              {/* Badges */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex gap-2 flex-wrap justify-center lg:justify-start"
              >
                <Badge className="bg-white/30 dark:bg-white/20 text-white border-white/40 backdrop-blur-sm shadow-lg px-3 py-1">
                  {profileData?.isSupervisor ? (
                    <>
                      <UserCog className="w-4 h-4 mr-1" />
                      مشرف عام
                    </>
                  ) : profileData?.role === 'student' ? (
                    <>
                      <GraduationCap className="w-4 h-4 mr-1" />
                      طالب
                    </>
                  ) : (
                    <>
                      <GraduationCap className="w-4 h-4 mr-1" />
                      مستخدم
                    </>
                  )}
                </Badge>
                {profileData?.is_verified ? (
                  <Badge className="bg-blue-500/40 dark:bg-blue-600/40 text-white border-blue-300/40 backdrop-blur-sm shadow-lg px-3 py-1">
                    <Check className="w-4 h-4 mr-1" />
                    محقق
                  </Badge>
                ) : (
                  <Badge className="bg-yellow-500/40 dark:bg-yellow-600/40 text-white border-yellow-300/40 backdrop-blur-sm shadow-lg px-3 py-1">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    غير محقق
                  </Badge>
                )}
                {profileData?.is_active && (
                  <Badge className="bg-blue-500/40 dark:bg-blue-600/40 text-white border-blue-300/40 backdrop-blur-sm shadow-lg px-3 py-1">
                    نشط
                  </Badge>
                )}
              </motion.div>
            </div>
          </div>

          {/* Email Verification Button */}
          {!profileData?.is_verified && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
            >
              <Button
                onClick={onSendEmailVerification}
                disabled={sendingVerification}
                variant="outline"
                size="sm"
                className="bg-white/30 dark:bg-white/20 border-white/40 text-white hover:bg-white/40 dark:hover:bg-white/30 backdrop-blur-md shadow-lg font-medium"
              >
                {sendingVerification ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    جاري الإرسال...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    تحقق من البريد
                  </>
                )}
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default ProfileHeader
