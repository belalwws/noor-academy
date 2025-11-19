'use client';

import { useEffect, useRef } from 'react';
import { authService } from '@/lib/auth/authService';
import { simpleAuthService } from '@/lib/auth/simpleAuth';

export default function AuthInitializer() {
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      
      // Initialize both auth services for compatibility
      authService.initialize();
      simpleAuthService.initialize();
    }
  }, []);
  
  return null;
}
