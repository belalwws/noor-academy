'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getProxiedImageUrl } from '@/lib/imageUtils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { courseCommunitiesApi, type Community, type CommunityMember } from '@/lib/api/course-communities'
import { toast } from 'sonner'
import { 
  Users, 
  UserPlus, 
  UserMinus, 
  UserCheck, 
  Crown,
  Loader2,
  Search,
  X
} from 'lucide-react'
import { batchesApi, batchStudentsApi, type BatchStudent } from '@/lib/api/batches'

interface CommunityMembersManagementProps {
  community: Community
  courseId: string
  onUpdate: () => void
}

export default function CommunityMembersManagement({ 
  community, 
  courseId,
  onUpdate 
}: CommunityMembersManagementProps) {
  const router = useRouter()
  const [members, setMembers] = useState<CommunityMember[]>([])
  const [availableStudents, setAvailableStudents] = useState<BatchStudent[]>([])
  const [allBatchStudents, setAllBatchStudents] = useState<BatchStudent[]>([]) // Store all batch students for lookup
  const [loading, setLoading] = useState(true)
  const [loadingStudents, setLoadingStudents] = useState(false)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showRemoveDialog, setShowRemoveDialog] = useState(false)
  const [showPromoteDialog, setShowPromoteDialog] = useState(false)
  const [selectedStudentId, setSelectedStudentId] = useState('')
  const [selectedMember, setSelectedMember] = useState<CommunityMember | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [adding, setAdding] = useState(false)
  const [removing, setRemoving] = useState(false)
  const [promoting, setPromoting] = useState(false)
  const [studentIds, setStudentIds] = useState<string[]>([])
  const [showProfileDialog, setShowProfileDialog] = useState(false)
  const [selectedProfileMember, setSelectedProfileMember] = useState<CommunityMember | null>(null)

  useEffect(() => {
    if (community && courseId) {
      loadMembers()
      loadAllBatchStudents()
    }
  }, [community, courseId])

  const loadMembers = async () => {
    try {
      setLoading(true)
      const data = await courseCommunitiesApi.get(community.id)
      setMembers(data.members || [])
    } catch (error) {
      console.error('Error loading members:', error)
      toast.error('فشل تحميل الأعضاء')
    } finally {
      setLoading(false)
    }
  }

  const loadAllBatchStudents = async () => {
    try {
      // Get batches for this course
      const batchesResponse = await batchesApi.list({ course: courseId })
      const batches = batchesResponse.results || []
      
      // Get all students from all batches
      const allStudents: BatchStudent[] = []
      for (const batch of batches) {
        try {
          // Check if batch has students directly (from API response)
          if (batch.students && Array.isArray(batch.students) && batch.students.length > 0) {
            allStudents.push(...batch.students)
          } else if (batch.id) {
            // If not, fetch students from batch-students API
            const studentsResponse = await batchStudentsApi.list({ batch: batch.id })
            allStudents.push(...(studentsResponse.results || []))
          }
        } catch (error) {
          console.error('Error loading students from batch:', error)
        }
      }
      
      // Store all batch students for lookup (for remove/promote)
      setAllBatchStudents(allStudents)
    } catch (error) {
      console.error('Error loading batch students:', error)
    }
  }

  const loadAvailableStudents = async () => {
    try {
      setLoadingStudents(true)
      // Reload all batch students if needed
      if (allBatchStudents.length === 0) {
        await loadAllBatchStudents()
      }
      
      // Reload members if needed to get latest membership
      const currentMembers = members.length > 0 ? members : (await courseCommunitiesApi.get(community.id)).members || []
      
      // Filter out students already in community
      // Create a map of user emails to check membership
      const memberEmails = new Set(currentMembers.map((m: CommunityMember) => m.user?.email?.toLowerCase() || ''))
      const available = allBatchStudents.filter(s => {
        // Filter by email since that's what we have in both places
        return s.student_email && !memberEmails.has(s.student_email.toLowerCase())
      })
      
      setAvailableStudents(available)
    } catch (error) {
      console.error('Error loading available students:', error)
      toast.error('فشل تحميل الطلاب المتاحين')
    } finally {
      setLoadingStudents(false)
    }
  }

  const handleAddStudents = async () => {
    if (studentIds.length === 0) {
      toast.error('يرجى اختيار طالب واحد على الأقل')
      return
    }

    try {
      setAdding(true)
      await courseCommunitiesApi.addStudents(community.id, {
        student_ids: studentIds
      })
      toast.success('تم إضافة الطلاب بنجاح')
      setShowAddDialog(false)
      setStudentIds([])
      loadMembers()
      onUpdate()
    } catch (error: any) {
      console.error('Error adding students:', error)
      toast.error(error?.data?.detail || error?.message || 'فشل إضافة الطلاب')
    } finally {
      setAdding(false)
    }
  }

  const getStudentProfileId = (member: CommunityMember): string | null => {
    // Find StudentProfile ID from batch students by matching email
    if (!member.user?.email) return null
    
    const foundStudent = allBatchStudents.find(s => 
      s.student_email?.toLowerCase() === member.user?.email?.toLowerCase()
    )
    
    return foundStudent ? foundStudent.student.toString() : null
  }

  const handleRemoveStudent = async () => {
    if (!selectedMember) return

    try {
      setRemoving(true)
      // Backend expects StudentProfile ID
      const studentProfileId = getStudentProfileId(selectedMember)
      
      if (!studentProfileId) {
        // Try to reload batch students
        await loadAllBatchStudents()
        const retryStudentProfileId = getStudentProfileId(selectedMember)
        if (!retryStudentProfileId) {
          toast.error('لم يتم العثور على معرف الطالب. يرجى المحاولة مرة أخرى.')
          return
        }
        // Use retry ID
        await courseCommunitiesApi.removeStudent(community.id, {
          student_id: retryStudentProfileId
        })
      } else {
        await courseCommunitiesApi.removeStudent(community.id, {
          student_id: studentProfileId
        })
      }
      toast.success('تم إزالة الطالب بنجاح')
      setShowRemoveDialog(false)
      setSelectedMember(null)
      loadMembers()
      onUpdate()
    } catch (error: any) {
      console.error('Error removing student:', error)
      toast.error(error?.data?.detail || error?.message || 'فشل إزالة الطالب')
    } finally {
      setRemoving(false)
    }
  }

  const handlePromoteToAssistant = async () => {
    if (!selectedMember) return

    try {
      setPromoting(true)
      // Backend expects StudentProfile ID
      const studentProfileId = getStudentProfileId(selectedMember)
      
      if (!studentProfileId) {
        // Try to reload batch students
        await loadAllBatchStudents()
        const retryStudentProfileId = getStudentProfileId(selectedMember)
        if (!retryStudentProfileId) {
          toast.error('لم يتم العثور على معرف الطالب. يرجى المحاولة مرة أخرى.')
          return
        }
        // Use retry ID
        await courseCommunitiesApi.promoteToAssistant(community.id, {
          student_id: retryStudentProfileId
        })
      } else {
        await courseCommunitiesApi.promoteToAssistant(community.id, {
          student_id: studentProfileId
        })
      }
      toast.success('تم ترقية الطالب إلى مساعد بنجاح')
      setShowPromoteDialog(false)
      setSelectedMember(null)
      loadMembers()
      onUpdate()
    } catch (error: any) {
      console.error('Error promoting student:', error)
      toast.error(error?.data?.detail || error?.message || 'فشل ترقية الطالب')
    } finally {
      setPromoting(false)
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'teacher':
        return <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">معلم</Badge>
      case 'assistant':
        return <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">مساعد</Badge>
      case 'student':
        return <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">طالب</Badge>
      default:
        return <Badge variant="outline">عضو</Badge>
    }
  }

  const filteredMembers = members.filter(member => {
    if (!searchQuery) return true
    const name = member.user?.get_full_name || ''
    return name.toLowerCase().includes(searchQuery.toLowerCase())
  })

  return (
    <div className="space-y-6">
      <Card className="shadow-lg border-2">
      <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-b border-amber-200 dark:border-amber-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-lg">
              <Users className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
              <div>
                <CardTitle className="text-xl">إدارة الأعضاء</CardTitle>
                <CardDescription>
                  إدارة أعضاء المجتمع ({members.length} عضو)
                </CardDescription>
              </div>
            </div>
            <Button
              onClick={() => {
                loadAvailableStudents()
                setShowAddDialog(true)
              }}
              className="bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 hover:from-amber-600 hover:via-amber-700 hover:to-orange-700 text-white shadow-lg"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              إضافة طلاب
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {/* Search */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="بحث عن عضو..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
              />
            </div>
          </div>

          {/* Members List */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">لا توجد أعضاء</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredMembers.map((member) => (
                <Card 
                  key={member.id} 
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => {
                    // Navigate to profile page instead of opening dialog
                    const userId = member.user?.id?.toString() || member.id
                    router.push(`/dashboard/teacher/courses/${courseId}/communities/${community.id}/profile/${userId}`)
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 flex-1">
                        <Avatar className="w-10 h-10">
                          <AvatarImage 
                            src={member.user?.profile_image_url ? getProxiedImageUrl(member.user.profile_image_url, false) : undefined} 
                            onError={(e) => {
                              const currentSrc = (e.target as HTMLImageElement).src;
                              const originalUrl = member.user?.profile_image_url;
                              if (originalUrl) {
                                if (currentSrc.includes('/auth/image-proxy/')) {
                                  (e.target as HTMLImageElement).src = originalUrl;
                                }
                              }
                            }}
                          />
                          <AvatarFallback className="bg-gradient-to-br from-amber-500 to-orange-500 text-white">
                            {member.user?.get_full_name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-gray-900 dark:text-white">
                              {member.user?.get_full_name || 'عضو'}
                            </h4>
                            {getRoleBadge(member.role)}
                            {member.role === 'teacher' && (
                              <Crown className="w-4 h-4 text-yellow-500" />
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {member.user?.email}
                          </p>
                          {member.total_points !== undefined && member.total_points > 0 && (
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                              نقاط: {member.total_points}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        {member.role === 'student' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedMember(member)
                                setShowPromoteDialog(true)
                              }}
                              className="text-amber-600 hover:text-amber-700"
                            >
                              <UserCheck className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedMember(member)
                                setShowRemoveDialog(true)
                              }}
                              className="text-red-600 hover:text-red-700"
                            >
                              <UserMinus className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Students Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900">
          <DialogHeader>
            <DialogTitle>إضافة طلاب إلى المجتمع</DialogTitle>
            <DialogDescription>
              اختر الطلاب الذين تريد إضافتهم إلى المجتمع
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {loadingStudents ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : availableStudents.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 dark:text-gray-400">
                  لا توجد طلاب متاحين للإضافة
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {availableStudents.map((student) => {
                  const studentId = student.student.toString()
                  const isSelected = studentIds.includes(studentId)
                  return (
                    <Card
                      key={student.id}
                      className={`cursor-pointer transition-all ${
                        isSelected
                          ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/30'
                          : 'hover:border-gray-300'
                      }`}
                      onClick={() => {
                        if (isSelected) {
                          setStudentIds(studentIds.filter(id => id !== studentId))
                        } else {
                          setStudentIds([...studentIds, studentId])
                        }
                      }}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-8 h-8">
                              <AvatarFallback className="bg-gradient-to-br from-amber-500 to-orange-500 text-white text-xs">
                                {student.student_name?.charAt(0) || 'S'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">{student.student_name}</p>
                              <p className="text-xs text-gray-500">{student.student_email}</p>
                            </div>
                          </div>
                          {isSelected && (
                            <div className="w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center">
                              <X className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              إلغاء
            </Button>
            <Button
              onClick={handleAddStudents}
              disabled={adding || studentIds.length === 0}
              className="bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 hover:from-amber-600 hover:via-amber-700 hover:to-orange-700 text-white shadow-lg"
            >
              {adding ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  جاري الإضافة...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  إضافة ({studentIds.length})
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Student Dialog */}
      <AlertDialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>إزالة طالب من المجتمع</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من إزالة الطالب "{selectedMember?.user?.get_full_name}" من المجتمع؟ هذا الإجراء لا يمكن التراجع عنه.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveStudent}
              disabled={removing}
              className="bg-red-600 hover:bg-red-700"
            >
              {removing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  جاري الإزالة...
                </>
              ) : (
                'إزالة'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Promote to Assistant Dialog */}
      <AlertDialog open={showPromoteDialog} onOpenChange={setShowPromoteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ترقية طالب إلى مساعد</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من ترقية الطالب "{selectedMember?.user?.get_full_name}" إلى مساعد؟ سيكون له صلاحيات إضافية في المجتمع.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handlePromoteToAssistant}
              disabled={promoting}
              className="bg-amber-600 hover:bg-amber-700 text-white shadow-lg"
            >
              {promoting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  جاري الترقية...
                </>
              ) : (
                'ترقية'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Member Profile Dialog */}
      <Dialog open={showProfileDialog} onOpenChange={setShowProfileDialog}>
        <DialogContent className="sm:max-w-2xl bg-white dark:bg-slate-900" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-amber-700 to-orange-700 dark:from-amber-400 dark:to-orange-400 bg-clip-text text-transparent">
              بروفايل العضو
            </DialogTitle>
            <DialogDescription>
              معلومات العضو في المجتمع
            </DialogDescription>
          </DialogHeader>
          {selectedProfileMember && (
            <div className="space-y-6">
              {/* Profile Header */}
              <div className="flex flex-col items-center text-center pb-6 border-b border-gray-200 dark:border-gray-700">
                <Avatar className="w-24 h-24 ring-4 ring-amber-200 dark:ring-amber-800 mb-4">
                  <AvatarImage 
                    src={selectedProfileMember.user?.profile_image_url ? getProxiedImageUrl(selectedProfileMember.user.profile_image_url, false) : undefined} 
                    onError={(e) => {
                      const currentSrc = (e.target as HTMLImageElement).src;
                      const originalUrl = selectedProfileMember.user?.profile_image_url;
                      if (originalUrl) {
                        if (currentSrc.includes('/auth/image-proxy/')) {
                          (e.target as HTMLImageElement).src = originalUrl;
                        }
                      }
                    }}
                  />
                  <AvatarFallback className="bg-gradient-to-br from-amber-500 to-orange-500 text-white text-3xl">
                    {selectedProfileMember.user?.get_full_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {selectedProfileMember.user?.get_full_name || 'عضو'}
                </h3>
                <div className="flex items-center gap-3">
                  {getRoleBadge(selectedProfileMember.role)}
                  {selectedProfileMember.role === 'teacher' && (
                    <Crown className="w-5 h-5 text-yellow-500" />
                  )}
                </div>
              </div>

              {/* Profile Details */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">البريد الإلكتروني</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {selectedProfileMember.user?.email || 'غير متوفر'}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">النقاط</p>
                    <p className="font-semibold text-amber-600 dark:text-amber-400 text-xl">
                      {selectedProfileMember.total_points || 0}
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">تاريخ الانضمام</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {new Date(selectedProfileMember.joined_at).toLocaleDateString('ar-SA', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">الحالة</p>
                  <Badge className={
                    selectedProfileMember.status === 'active'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                  }>
                    {selectedProfileMember.status_display}
                  </Badge>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowProfileDialog(false)}
              className="border-2 rounded-xl"
            >
              إغلاق
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

