import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User, AuthTokens } from '../types/auth';

interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  profileImageTimestamp: number;
}

const initialState: AuthState = {
  user: null,
  tokens: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  profileImageTimestamp: Date.now(),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      // Validate user data before setting
      if (action.payload && action.payload.id && action.payload.email) {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      }
    },
    setTokens: (state, action: PayloadAction<AuthTokens>) => {
      // Validate tokens before setting
      if (action.payload && action.payload.access && action.payload.refresh) {
        state.tokens = action.payload;
        state.error = null;
      }
    },
    login: (state, action: PayloadAction<{ user: User; tokens: AuthTokens }>) => {
      // Validate both user and tokens before login
      const { user, tokens } = action.payload;
      if (user && user.id && user.email && tokens && tokens.access && tokens.refresh) {
        state.user = user;
        state.tokens = tokens;
        state.isAuthenticated = true;
        state.isLoading = false;
        state.error = null;
      }
    },
    logout: (state) => {
      // Clear all sensitive data
      state.user = null;
      state.tokens = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
      
      // Clear any stored tokens from localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('tokens');
      }
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setProfileImageTimestamp: (state, action: PayloadAction<number>) => {
      state.profileImageTimestamp = action.payload;
    },
  },
});

export const { 
  setUser, 
  setTokens, 
  login, 
  logout, 
  updateUser, 
  setLoading, 
  setError,
  setProfileImageTimestamp 
} = authSlice.actions;

export default authSlice.reducer;
