// src/api/axios.ts
import axios from 'axios';

const baseURL =
  import.meta.env.VITE_API_BASE_URL ||
  'https://socialmediaapi-production-fc0e.up.railway.app';

const api = axios.create({ baseURL });

// ✅ ambil token dari localStorage kalau ada
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); // atau ambil dari redux persist
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ✅ fungsi manual set token kalau perlu
export const setAuthToken = (token?: string) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('token', token); // simpan supaya interceptor bisa pakai
  } else {
    delete api.defaults.headers.common['Authorization'];
    localStorage.removeItem('token');
  }
};

export default api;
