// src/api/me.ts
import api from './axios';
import type { User } from '../store/slices/authSlice';

// 🔹 GET my profile
export async function getMyProfile(): Promise<User> {
  const res = await api.get('/api/me');
  return res.data.data as User;
}

// 🔹 UPDATE my profile (support upload avatar file / URL)
export async function updateMyProfile(data: {
  name?: string;
  username?: string;
  phone?: string;
  bio?: string;
  avatarUrl?: string;
  avatarFile?: File | null;
}): Promise<User> {
  const formData = new FormData();

  if (data.name) formData.append('name', data.name);
  if (data.username) formData.append('username', data.username);
  if (data.phone) formData.append('phone', data.phone);
  if (data.bio) formData.append('bio', data.bio);
  if (data.avatarFile) {
    formData.append('avatar', data.avatarFile); // upload file
  } else if (data.avatarUrl) {
    formData.append('avatarUrl', data.avatarUrl); // URL alternatif
  }

  const res = await api.patch('/api/me', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return res.data.data as User;
}
