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

interface BatchBadgesProps {
  communityId: string
  userRole: 'teacher' | 'student'
  batchStudents: Array<{ id: string; user: { id: number; get_full_name: string } }>
}

export default function BatchBadges({ 
  communityId, 
  userRole,
  batchStudents 
}: BatchBadgesProps) {
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

  useEffect(() => {
    if (communityId) {
      loadBadges()
    }
  }, [communityId, page])

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
        return 'bg-gradient-to-br from-yellow-400 to-orange-500'
      case 'achievement':
        return 'bg-gradient-to-br from-blue-400 to-indigo-500'
      case 'participation':
        return 'bg-gradient-to-br from-green-400 to-emerald-500'
      case 'excellence':
        return 'bg-gradient-to-br from-purple-400 to-pink-500'
      default:
        return 'bg-gradient-to-br from-gray-400 to-gray-500'
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
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-50">
            شارات المجتمع
          </h3>
          <p className="text-sm text-gray-600 dark:text-slate-400">
            {count} شارة
          </p>
        </div>
        {userRole === 'teacher' && (
          <Button
            onClick={() => setShowCreateDialog(true)}
            size="sm"
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            إضافة شارة
          </Button>
        )}
      </div>

      {badges.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <Award className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 dark:text-slate-400">
              لا توجد شارات حالياً
            </p>
            {userRole === 'teacher' && (
              <Button
                onClick={() => setShowCreateDialog(true)}
                size="sm"
                className="mt-4"
              >
                إضافة شارة جديدة
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {badges.map((badge) => (
            <Card key={badge.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className={`${getBadgeColor(badge.badge_type)} p-3 rounded-full text-white flex-shrink-0`}>
                    {badge.icon ? (
                      <span className="text-2xl">{badge.icon}</span>
                    ) : (
                      getBadgeIcon(badge.badge_type)
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 dark:text-slate-50 mb-1">
                          {badge.name}
                        </h4>
                        <Badge variant="outline" className="text-xs mb-2">
                          {badge.badge_type_display}
                        </Badge>
                        {badge.description && (
                          <p className="text-sm text-gray-600 dark:text-slate-400 mb-2">
                            {badge.description}
                          </p>
                        )}
                        <div className="text-xs text-gray-500 dark:text-slate-500 space-y-1">
                          <p>
                            <span className="font-medium">الطالب:</span> {badge.student_name}
                          </p>
                          <p>
                            <span className="font-medium">منحه:</span> {badge.granted_by_name}
                          </p>
                          <p>
                            <span className="font-medium">التاريخ:</span> {formatDate(badge.granted_at)}
                          </p>
                        </div>
                      </div>
                      {userRole === 'teacher' && (
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditBadge(badge)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(badge)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
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
            <AlertDialogCancel disabled={deleting}>إلغاء</AlertDialogCancel>
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

