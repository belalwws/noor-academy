'use client';

import { useState, useEffect } from 'react';
import { getApiUrl } from '@/lib/config';

export interface Course {
  id: string;
  title: string;
  description: string;
  learning_outcomes: string;
  course_type: string;
  course_type_display: string;
  subjects: string;
  max_students: number;
  teacher_name: string;
  teacher_email: string;
  teacher_specialization: string;
  approval_status: string;
  approval_status_display: string;
  is_published: boolean;
  enrolled_count: number;
  available_spots: string;
  created_at: string;
  updated_at: string;
}

export interface CoursesResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Course[];
}

interface UseCourseOptions {
  page?: number;
  search?: string;
  course_type?: string;
  is_published?: boolean;
}

export const useCourses = (options?: UseCourseOptions) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        setError(null);

        // Build query parameters
        const params = new URLSearchParams();
        if (options?.page) params.append('page', options.page.toString());
        if (options?.search) params.append('search', options.search);
        if (options?.course_type) params.append('course_type', options.course_type);
        if (options?.is_published !== undefined) {
          params.append('is_published', options.is_published.toString());
        }

        // Default to published courses only for landing page
        if (options?.is_published === undefined) {
          params.append('is_published', 'true');
        }

        const url = getApiUrl(`/live-education/courses/?${params.toString()}`);
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch courses: ${response.statusText}`);
        }

        const data: CoursesResponse = await response.json();
        setCourses(data.results);
        setCount(data.count);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch courses';
        setError(errorMessage);
        console.error('Error fetching courses:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [options?.page, options?.search, options?.course_type, options?.is_published]);

  return { courses, loading, error, count };
};

export const useCourseDetail = (courseId: string | number) => {
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!courseId) return;

    const fetchCourse = async () => {
      try {
        setLoading(true);
        setError(null);

        const url = getApiUrl(`/live-education/courses/${courseId}/`);
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch course: ${response.statusText}`);
        }

        const data: Course = await response.json();
        setCourse(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch course';
        setError(errorMessage);
        console.error('Error fetching course:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

  return { course, loading, error };
};

export const useEnrollCourse = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const enroll = async (courseId: string | number) => {
    try {
      setLoading(true);
      setError(null);

      const url = getApiUrl(`/live-education/enrollments/`);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ course: courseId }),
      });

      if (!response.ok) {
        throw new Error(`Failed to enroll in course: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to enroll in course';
      setError(errorMessage);
      console.error('Error enrolling in course:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { enroll, loading, error };
};

