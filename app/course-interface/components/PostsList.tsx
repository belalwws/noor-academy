'use client';

import React from 'react';

interface Post {
  id: string;
  author: string;
  content: string;
  date: string;
  likes?: number;
}

interface PostsListProps {
  posts?: Post[];
}

export default function PostsList({ posts = [] }: PostsListProps) {
  const safePosts = posts || [];
  
  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">المنشورات</h2>
      
      <div className="space-y-4">
        {safePosts.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">لا توجد منشورات بعد</p>
        ) : (
          safePosts.map((post) => (
            <div key={post.id} className="p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium text-gray-900 dark:text-white">{post.author}</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">{post.date}</span>
              </div>
              <p className="text-gray-700 dark:text-gray-300">{post.content}</p>
              {post.likes !== undefined && (
                <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  ❤️ {post.likes} إعجاب
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
