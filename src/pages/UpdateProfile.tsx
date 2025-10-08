import { useAppSelector, useAppDispatch } from '../store/hooks';
import { useState } from 'react';
import Navbar from '../components/Navbar';
import { setCredentials } from '../store/slices/authSlice';
import type { User } from '../store/slices/authSlice';
import { updateMyProfile } from '../api/me';

type UpdateProfileForm = {
  name: string;
  username: string;
  phone?: string;
  bio?: string;
  avatarUrl?: string;
  avatarFile?: File | null;
};

export default function UpdateProfile() {
  const { user, token } = useAppSelector((s) => s.auth);
  const dispatch = useAppDispatch();

  const [form, setForm] = useState<UpdateProfileForm>({
    name: user?.name || '',
    username: user?.username || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    avatarUrl: user?.avatarUrl || '',
    avatarFile: null,
  });

  const [preview, setPreview] = useState<string>(
    user?.avatarUrl || '/profile.png'
  );
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setForm((prev) => ({ ...prev, avatarFile: file, avatarUrl: '' })); // prioritas file
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updatedUser: User = await updateMyProfile(form);
      dispatch(setCredentials({ token: token!, user: updatedUser }));
      alert('✅ Profile updated successfully!');
    } catch (err) {
      console.error('Update failed:', err);
      alert('Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-black text-white'>
      <Navbar />

      <div className='w-full max-w-[800px] mx-auto px-4 py-6'>
        <button
          onClick={() => window.history.back()}
          className='mb-4 text-sm text-neutral-400'
        >
          ← Back
        </button>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='flex items-center gap-4 mb-6'>
            <img
              src={preview}
              alt='Profile'
              className='w-24 h-24 rounded-full object-cover border border-neutral-700'
            />
            <div className='flex flex-col gap-2 w-full'>
              {/* ❌ Jangan kasih value ke input file */}
              <input
                type='file'
                accept='image/*'
                onChange={handleFileChange}
                className='block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700'
              />
              <input
                type='text'
                name='avatarUrl'
                value={form.avatarUrl ?? ''}
                onChange={handleChange}
                placeholder='Or paste avatar URL'
                className='px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-sm w-full'
              />
            </div>
          </div>

          {['name', 'username', 'phone', 'bio'].map((field) => (
            <div key={field}>
              <label className='block text-sm mb-1 capitalize'>{field}</label>
              {field === 'bio' ? (
                <textarea
                  name='bio'
                  value={form.bio ?? ''}
                  onChange={handleChange}
                  className='w-full rounded-lg bg-neutral-900 border border-neutral-700 px-3 py-2'
                  rows={3}
                  placeholder='Create your bio'
                />
              ) : (
                <input
                  type='text'
                  name={field}
                  value={
                    (form[field as keyof UpdateProfileForm] as string) ?? ''
                  }
                  onChange={handleChange}
                  className='w-full rounded-lg bg-neutral-900 border border-neutral-700 px-3 py-2'
                  placeholder={`Enter ${field}`}
                />
              )}
            </div>
          ))}

          <button
            type='submit'
            disabled={loading}
            className='w-full py-3 rounded-full bg-purple-600 hover:bg-purple-700 font-medium disabled:opacity-50'
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
