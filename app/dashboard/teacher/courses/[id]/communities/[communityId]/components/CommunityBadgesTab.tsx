'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Award, 
  Trophy, 
  Star, 
  Medal,
  Plus,
  Trash2,
  Edit2,
  Loader2
} from 'lucide-react'
import { courseCommunitiesApi, type CommunityBadge } from '@/lib/api/course-communities'
import { toast } from 'sonner'
import CreateBadgeDialog from './CreateBadgeDialog'
import EditBadgeDialog from './EditBadgeDialog'
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
import { batchesApi, batchStudentsApi, type BatchStudent } from '@/lib/api/batches'

interface CommunityBadgesTabProps {
  communityId: string
  courseId: string
  compact?: boolean
}

export default function CommunityBadgesTab({ 
  communityId,
  courseId,
  compact = false
}: CommunityBadgesTabProps) {
  const [badges, setBadges] = useState<CommunityBadge[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasNext, setHasNext] = useState(false)
  const [hasPrevious, setHasPrevious] = useState(false)
  const [count, setCount] = useState(0)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [selectedBadge, setSelectedBadge] = useState<CommunityBadge | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [badgeToDelete, setBadgeToDelete] = useState<CommunityBadge | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [batchStudents, setBatchStudents] = useState<Array<{ id: string; user: { id: number; get_full_name: string } }>>([])

  useEffect(() => {
    if (communityId) {
      loadBadges()
      loadBatchStudents()
    }
  }, [communityId, page, courseId])

  const loadBatchStudents = async () => {
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
      
      // Map to the format expected by CreateBadgeDialog
      const students = allStudents.map((s) => ({
        id: String(s.student),
        user: {
          id: typeof s.student === 'number' ? s.student : parseInt(String(s.student), 10) || 0,
          get_full_name: s.student_name || 'طالب'
        }
      }))
      
      setBatchStudents(students)
    } catch (error) {
      console.error('Error loading batch students:', error)
    }
  }

  const loadBadges = async () => {
    try {
      setLoading(true)
      const response = await courseCommunitiesApi.listBadges({
        page,
        community: communityId
      })
      setBadges(response.results || [])
      setCount(response.count || 0)
      setHasNext(!!response.next)
      setHasPrevious(!!response.previous)
    } catch (error: any) {
      console.error('Error loading badges:', error)
      toast.error(error?.data?.detail || error?.message || 'فشل تحميل الشارات')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateBadge = async () => {
    setShowCreateDialog(false)
    await loadBadges()
  }

  const handleEditBadge = (badge: CommunityBadge) => {
    setSelectedBadge(badge)
    setShowEditDialog(true)
  }

  const handleUpdateBadge = async () => {
    setShowEditDialog(false)
    setSelectedBadge(null)
    await loadBadges()
  }

  const handleDeleteClick = (badge: CommunityBadge) => {
    setBadgeToDelete(badge)
    setShowDeleteDialog(true)
  }

  const handleDeleteConfirm = async () => {
    if (!badgeToDelete) return

    try {
      setDeleting(true)
      await courseCommunitiesApi.deleteBadge(badgeToDelete.id)
      toast.success('تم حذف الشارة بنجاح')
      setShowDeleteDialog(false)
      setBadgeToDelete(null)
      await loadBadges()
    } catch (error: any) {
      console.error('Error deleting badge:', error)
      toast.error(error?.data?.detail || error?.message || 'فشل حذف الشارة')
    } finally {
      setDeleting(false)
    }
  }

  const getBadgeIcon = (badgeType: string) => {
    switch (badgeType) {
      case 'title':
        return <Medal className="w-5 h-5" />
      case 'achievement':
        return <Trophy className="w-5 h-5" />
      case 'participation':
        return <Star className="w-5 h-5" />
      case 'excellence':
        return <Award className="w-5 h-5" />
      default:
        return <Award className="w-5 h-5" />
    }
  }

  const getBadgeColor = (badgeType: string) => {
    switch (badgeType) {
      case 'title':
        return 'bg-gradient-to-br from-amber-400 to-orange-500'
      case 'achievement':
        return 'bg-gradient-to-br from-amber-500 to-orange-600'
      case 'participation':
        return 'bg-gradient-to-br from-orange-400 to-amber-500'
      case 'excellence':
        return 'bg-gradient-to-br from-amber-600 to-orange-700'
      default:
        return 'bg-gradient-to-br from-amber-400 to-orange-500'
    }
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch {
      return dateString
    }
  }

  if (loading && badges.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {!compact && (
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-50">
              شارات المجتمع
            </h3>
            <p className="text-sm text-gray-600 dark:text-slate-400">
              {count} شارة
            </p>
          </div>
          <Button
            onClick={() => setShowCreateDialog(true)}
            size="sm"
            className="flex items-center gap-2 bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 hover:from-amber-600 hover:via-amber-700 hover:to-orange-700 text-white shadow-lg"
          >
            <Plus className="w-4 h-4" />
            إضافة شارة
          </Button>
        </div>
      )}
      {compact && (
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-600 dark:text-slate-400">
            {count} شارة
          </p>
          <Button
            onClick={() => setShowCreateDialog(true)}
            size="sm"
            variant="outline"
            className="flex items-center gap-2 border-amber-200 dark:border-amber-800 hover:bg-amber-50 dark:hover:bg-amber-950/20"
          >
            <Plus className="w-4 h-4" />
            إضافة
          </Button>
        </div>
      )}

      {badges.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <Award className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 dark:text-slate-400">
              لا توجد شارات حالياً
            </p>
            <Button
              onClick={() => setShowCreateDialog(true)}
              size="sm"
              className="mt-4"
            >
              إضافة شارة جديدة
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className={`space-y-2 ${compact ? 'max-h-[500px] overflow-y-auto' : ''}`}>
          {badges.map((badge) => (
            <div
              key={badge.id}
              className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all bg-white dark:bg-slate-800"
            >
              <div className={`${getBadgeColor(badge.badge_type)} p-2 rounded-lg text-white flex-shrink-0`}>
                {badge.icon ? (
                  <span className="text-lg">{badge.icon}</span>
                ) : (
                  <div className="w-5 h-5">
                    {getBadgeIcon(badge.badge_type)}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm text-gray-900 dark:text-slate-50 mb-1 truncate">
                      {badge.name}
                    </h4>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">
                        {badge.badge_type_display}
                      </Badge>
                      <span className="text-xs text-gray-500 dark:text-slate-400">
                        {badge.student_name}
                      </span>
                    </div>
                    {badge.description && (
                      <p className="text-xs text-gray-600 dark:text-slate-400 line-clamp-1">
                        {badge.description}
                      </p>
                    )}
                  </div>
                  {!compact && (
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditBadge(badge)}
                        className="h-7 w-7 p-0"
                      >
                        <Edit2 className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(badge)}
                        className="h-7 w-7 p-0 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {(hasNext || hasPrevious) && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page - 1)}
            disabled={!hasPrevious || loading}
          >
            السابق
          </Button>
          <span className="text-sm text-gray-600 dark:text-slate-400">
            الصفحة {page}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page + 1)}
            disabled={!hasNext || loading}
          >
            التالي
          </Button>
        </div>
      )}

      {/* Create Badge Dialog */}
      <CreateBadgeDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        communityId={communityId}
        batchStudents={batchStudents}
        onSuccess={handleCreateBadge}
      />

      {/* Edit Badge Dialog */}
      {selectedBadge && (
        <EditBadgeDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          badge={selectedBadge}
          batchStudents={batchStudents}
          onSuccess={handleUpdateBadge}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف الشارة</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف الشارة "{badgeToDelete?.name}"؟ هذا الإجراء لا يمكن التراجع عنه.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {deleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  جاري الحذف...
                </>
              ) : (
                'حذف'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

