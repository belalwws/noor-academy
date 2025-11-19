// 🔒 Auth Utilities
// Re-export from lib/auth for compatibility

export { 
  getAuthToken, 
  getAuthData, 
  saveAuthData, 
  clearAuthData, 
  isAuthenticated,
  getAccessToken,
  refreshAccessToken,
  initializeAuth
} from '../lib/auth';

export type { User, AuthTokens, AuthData } from '../lib/auth';
