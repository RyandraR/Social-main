import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { setAuthToken } from '../../api/axios';

export interface User {
  id: number;
  name: string;
  username?: string;
  email: string;
  phone?: string;
  photo?: string;
  avatarUrl?: string;
  bio?: string;
  followers?: number;
  following?: number;
  likes?: number;
  posts?: number;
}

export interface AuthState {
  token: string | null;
  user: User | null;
}

// 🔹 Helper aman untuk parsing JSON dari localStorage
function safeParse<T>(value: string | null): T | null {
  if (!value || value === 'undefined' || value === 'null') return null;
  try {
    return JSON.parse(value) as T;
  } catch (err) {
    console.error('Failed to parse JSON from localStorage:', err);
    return null;
  }
}

// 🔹 Initial state dari localStorage
const initialState: AuthState = {
  token: localStorage.getItem('token'),
  user: safeParse<User>(localStorage.getItem('user')),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(
      state,
      action: PayloadAction<{ token: string; user?: User | null }>
    ) {
      state.token = action.payload.token;
      state.user = action.payload.user ?? null;

      // simpan ke localStorage
      localStorage.setItem('token', action.payload.token);
      if (action.payload.user) {
        localStorage.setItem('user', JSON.stringify(action.payload.user));
      } else {
        localStorage.removeItem('user');
      }

      // set axios default header
      setAuthToken(action.payload.token);
    },
    logout(state) {
      state.token = null;
      state.user = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setAuthToken(undefined);
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
