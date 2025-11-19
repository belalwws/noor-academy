/**
 * Redux Store Index
 * Re-exports from main store.ts for backward compatibility
 * Unified export point for all Redux-related code
 */

export { store, persistor } from '../store';
export type { RootState, AppDispatch } from '../store';

// Re-export auth actions
export { 
  setUser, 
  setTokens, 
  login, 
  logout, 
  updateUser, 
  setLoading, 
  setError,
  setProfileImageTimestamp 
} from './authSlice';

// Re-export all custom hooks (unified export point)
export * from './hooks';
