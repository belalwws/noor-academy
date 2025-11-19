'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

const ForumSkeleton = () => {
  return (
    <Card className="border border-gray-200">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

const TopicSkeleton = () => {
  return (
    <Card className="border border-gray-200">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-3">
            <div className="space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <div className="flex gap-4">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

const CommunitySkeletonLoader = ({ type }: { type: 'forum' | 'topic' }) => {
  if (type === 'forum') {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <ForumSkeleton key={i} />
        ))}
      </div>
    )
  }
  
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <TopicSkeleton key={i} />
      ))}
    </div>
  )
}

export default CommunitySkeletonLoader
