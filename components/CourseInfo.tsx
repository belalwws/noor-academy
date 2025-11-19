'use client';

import React from 'react';

interface Course {
  id: string;
  title: string;
  description: string;
}

interface CourseInfoProps {
  course: Course;
}

export default function CourseInfo({ course }: CourseInfoProps) {
  // Split description into paragraphs if it contains newlines or bullet points
  const descriptionParagraphs = course.description 
    ? course.description.split(/\n\n|\n(?=•|\d+\.)/).filter(p => p.trim())
    : [];

  return (
    <div className="space-y-8">
      {/* Course Description removed as requested */}
    </div>
  );
}
