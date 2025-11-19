'use client';

import { useState, useEffect } from 'react';
import { getApiUrl } from '@/lib/config';

export interface DashboardStats {
  total_courses: number;
  total_students: number;
  total_teachers: number;
  active_sessions: number;
  completion_rate: number;
  average_rating: number;
}

export const useDashboardStats = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);

        // Try to fetch from general supervisor dashboard endpoint
        const url = getApiUrl('/supervisors/general/dashboard/statistics/');
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        // If not authenticated or not a supervisor, use default stats
        if (!response.ok) {
          // Set default stats for landing page
          setStats({
            total_courses: 0,
            total_students: 0,
            total_teachers: 0,
            active_sessions: 0,
            completion_rate: 0,
            average_rating: 0,
          });
          return;
        }

        const data = await response.json();
        setStats(data);
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        // Set default stats on error
        setStats({
          total_courses: 0,
          total_students: 0,
          total_teachers: 0,
          active_sessions: 0,
          completion_rate: 0,
          average_rating: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, loading, error };
};

export const usePublicStats = () => {
  const [stats, setStats] = useState({
    courses: 0,
    students: 0,
    teachers: 0,
  });
  const [loading, setLoading] = useState(false);

  // Return default stats without API call to avoid 404 errors
  return { stats, loading };
};

