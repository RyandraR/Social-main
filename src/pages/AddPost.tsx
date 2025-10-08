import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import type { AxiosError } from 'axios';

export default function AddPost() {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        alert('File too large! Max 5MB.');
        return;
      }
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!image) {
      alert('Please upload an image!');
      return;
    }

    try {
      setLoading(true);

      // ✅ Kirim langsung ke backend pakai multipart/form-data
      const formData = new FormData();
      formData.append('image', image);
      formData.append('caption', caption);

      await api.post('/api/posts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      navigate('/profile');
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      console.error('❌ Upload error:', axiosError);
      alert(axiosError.response?.data?.message ?? 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-black text-white'>
      <Navbar />
      <div className='flex flex-col items-center mt-6 pb-28'>
        <form
          onSubmit={handleSubmit}
          className='w-full max-w-[452px] bg-neutral-900 rounded-lg p-4 space-y-4'
        >
          {/* Image Upload */}
          <div className='w-full h-52 border border-dashed border-gray-600 flex items-center justify-center rounded-lg relative overflow-hidden'>
            {preview ? (
              <img
                src={preview}
                alt='preview'
                className='object-cover w-full h-full'
              />
            ) : (
              <label className='cursor-pointer text-center w-full h-full flex flex-col items-center justify-center'>
                <input
                  type='file'
                  accept='image/png, image/jpeg, image/webp'
                  className='hidden'
                  onChange={handleImageChange}
                />
                <p className='text-purple-400 font-medium'>Click to upload</p>
                <p className='text-sm text-gray-400'>
                  PNG / JPG / WEBP (max 5MB)
                </p>
              </label>
            )}
          </div>

          {/* Caption */}
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder='Write a caption...'
            className='w-full p-3 rounded-md bg-neutral-800 text-sm focus:outline-none resize-none'
            rows={3}
          />

          {/* Submit Button */}
          <button
            type='submit'
            disabled={loading}
            className='w-full py-3 rounded-full bg-purple-600 hover:bg-purple-700 font-semibold transition disabled:opacity-50'
          >
            {loading ? 'Sharing...' : 'Share'}
          </button>
        </form>
      </div>
    </div>
  );
}
