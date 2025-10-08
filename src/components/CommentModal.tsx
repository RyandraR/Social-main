import { useEffect, useState, useCallback } from 'react';
import api from '../api/axios';

interface Comment {
  id: number;
  text: string;
  createdAt: string;
  author: {
    id: number;
    username: string;
    name: string;
    avatarUrl?: string | null;
  };
}

interface CommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: number | null;
}

export default function CommentModal({
  isOpen,
  onClose,
  postId,
}: CommentModalProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  // Ambil profil user aktif
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    api
      .get('/api/me', { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setCurrentUserId(res.data.data?.id))
      .catch(() => setCurrentUserId(null));
  }, []);

  // Ambil semua komentar (dibungkus useCallback biar aman dari warning)
  const fetchComments = useCallback(async () => {
    if (!postId) return;
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await api.get(
        `/api/posts/${postId}/comments?page=1&limit=10`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setComments(res.data.data.comments || []);
    } catch (err) {
      console.error('❌ Gagal ambil komentar:', err);
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    if (isOpen) fetchComments();
  }, [isOpen, postId, fetchComments]);

  // Tambah komentar
  const handleAddComment = async () => {
    if (!text.trim() || !postId) return;
    const token = localStorage.getItem('token');
    if (!token) return alert('Kamu harus login dulu!');

    try {
      const res = await api.post(
        `/api/posts/${postId}/comments`,
        { text },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const newComment = res.data.data?.comment || {
        id: Date.now(),
        text,
        createdAt: new Date().toISOString(),
        author: {
          id: currentUserId || 0,
          username: 'You',
          name: 'You',
          avatarUrl: null,
        },
      };

      setComments((prev) => [newComment, ...prev]);
      setText('');
    } catch (err) {
      console.error('❌ Gagal tambah komentar:', err);
      alert('Gagal kirim komentar.');
    }
  };

  // Hapus komentar
  const handleDeleteComment = async (commentId: number) => {
    const token = localStorage.getItem('token');
    if (!token) return alert('Kamu harus login dulu!');
    if (!confirm('Yakin mau hapus komentar ini?')) return;

    try {
      await api.delete(`/api/comments/${commentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (err) {
      console.error('❌ Gagal hapus komentar:', err);
      alert('Gagal hapus komentar.');
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className='fixed inset-0 bg-black/80 flex items-center justify-center z-50'
      onClick={onClose}
    >
      <div
        className='bg-neutral-900 rounded-xl w-[90%] max-w-md p-4 text-white shadow-xl'
        onClick={(e) => e.stopPropagation()}
      >
        <div className='flex justify-between items-center mb-4'>
          <h2 className='text-lg font-semibold'>Comments</h2>
          <button
            onClick={onClose}
            className='text-gray-400 hover:text-gray-200 text-sm'
          >
            ✕
          </button>
        </div>

        {/* List komentar */}
        <div className='max-h-72 overflow-y-auto mb-3 space-y-3'>
          {loading ? (
            <p className='text-gray-400 text-center'>Loading comments...</p>
          ) : comments.length === 0 ? (
            <p className='text-gray-400 text-center'>Belum ada komentar.</p>
          ) : (
            comments.map((c) => (
              <div
                key={c.id}
                className='bg-neutral-800 p-2 rounded-lg flex flex-col gap-1'
              >
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <img
                      src={
                        c.author.avatarUrl ||
                        'https://via.placeholder.com/40?text=User'
                      }
                      alt={c.author.username}
                      className='w-6 h-6 rounded-full object-cover'
                    />
                    <p className='text-sm font-semibold'>
                      @{c.author.username}
                    </p>
                  </div>

                  {currentUserId === c.author.id && (
                    <button
                      onClick={() => handleDeleteComment(c.id)}
                      className='text-xs text-red-400 hover:text-red-300'
                    >
                      Hapus
                    </button>
                  )}
                </div>

                <p className='text-gray-300 text-sm break-words'>{c.text}</p>
              </div>
            ))
          )}
        </div>

        {/* Input Comment */}
        <div className='flex items-center gap-2'>
          <input
            type='text'
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder='Tulis komentar...'
            className='flex-1 bg-neutral-800 rounded-lg px-3 py-2 text-sm focus:outline-none'
          />
          <button
            onClick={handleAddComment}
            className='bg-blue-600 hover:bg-blue-500 text-sm px-3 py-2 rounded-lg'
          >
            Kirim
          </button>
        </div>
      </div>
    </div>
  );
}
