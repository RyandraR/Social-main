import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import { setAuthToken } from '../api/axios';
import type { AuthState } from './slices/authSlice';

// --- fungsi untuk load state dari localStorage ---
function loadState(): { auth: AuthState } | undefined {
  try {
    const state = localStorage.getItem('reduxState');
    if (state) {
      const parsed = JSON.parse(state) as { auth?: AuthState };
      if (parsed.auth) {
        return { auth: parsed.auth };
      }
    }
  } catch (e) {
    console.error('Load state error', e);
  }
  return undefined;
}

// --- fungsi untuk save state ke localStorage ---
function saveState(state: { auth: AuthState }) {
  try {
    localStorage.setItem('reduxState', JSON.stringify({ auth: state.auth }));
  } catch (e) {
    console.error('Save state error', e);
  }
}

// --- bikin store ---
export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
  preloadedState: loadState(),
});

// --- set token ke axios kalau ada ---
const savedToken = store.getState().auth.token;
if (savedToken) {
  setAuthToken(savedToken);
}

// --- subscribe supaya setiap perubahan disimpan ---
store.subscribe(() => {
  const state = store.getState();
  saveState({ auth: state.auth });
});

// ✅ perbaikan: pastikan RootState diexport
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
