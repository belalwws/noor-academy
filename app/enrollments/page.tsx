'use client';

import React from 'react';
import { useAppSelector } from '@/lib/hooks';
import EnrollmentManagement from '@/components/EnrollmentManagement';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function EnrollmentsPage() {
  const { user } = useAppSelector((state) => state.auth);

  return (
    <ProtectedRoute allowedRoles={['student', 'teacher', 'supervisor', 'academic_supervisor', 'general_supervisor']}>
      <div className="container-fluid py-4">
        <div className="row">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-gradient-primary text-white">
                <div className="d-flex align-items-center">
                  <i className="fas fa-graduation-cap fa-2x me-3"></i>
                  <div>
                    <h3 className="mb-0">إدارة التسجيلات</h3>
                    <p className="mb-0 opacity-75">
                      {user?.role === 'student' && 'تسجيلاتي في الدورات'}
                      {(user?.role === 'teacher') && 'تسجيلات الطلاب في دوراتي'}
                      {(user?.role === 'supervisor' || user?.role === 'academic_supervisor' || user?.role === 'general_supervisor') && 'إدارة جميع التسجيلات'}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="card-body">
                <EnrollmentManagement 
                  userRole={
                    user?.role === 'student' ? 'student' :
                    user?.role === 'teacher' ? 'teacher' : 'supervisor'
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .bg-gradient-primary {
          background: linear-gradient(135deg, #2d7d32 0%, #4caf50 100%);
        }
        
        .card {
          border-radius: 15px;
          overflow: hidden;
        }
        
        .card-header {
          border-bottom: none;
          padding: 2rem;
        }
        
        .card-body {
          padding: 2rem;
        }
        
        @media (max-width: 768px) {
          .card-header {
            padding: 1.5rem;
          }
          
          .card-body {
            padding: 1.5rem;
          }
          
          .fa-2x {
            font-size: 1.5em !important;
          }
        }
      `}</style>
    </ProtectedRoute>
  );
}
