import { useEffect, useState } from 'react';
import api from '../api/axios';
import ImageWithFallback from './ImageWithFallback';

interface LikesModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: number | null;
}

interface LikedUser {
  id: number;
  username: string;
  name: string;
  avatarUrl?: string;
  isFollowedByMe?: boolean;
  followsMe?: boolean;
  isMe?: boolean;
}

export default function LikesModal({
  isOpen,
  onClose,
  postId,
}: LikesModalProps) {
  const [users, setUsers] = useState<LikedUser[]>([]);
  const [loading, setLoading] = useState(false);

  const [, setMyId] = useState<number | null>(null);

  // Ambil daftar like
  useEffect(() => {
    if (!isOpen || !postId) return;

    const fetchLikes = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) return;

        // ambil data user login
        const meRes = await api.get('/api/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMyId(meRes.data?.data?.id ?? null);

        // ambil daftar like
        const res = await api.get(`/api/posts/${postId}/likes`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const likedUsers: LikedUser[] =
          res.data?.data?.users?.map((u: unknown) => {
            const user = u as Record<string, unknown>;
            return {
              id: Number(user.id),
              username: String(user.username),
              name: String(user.name),
              avatarUrl:
                typeof user.avatarUrl === 'string' ? user.avatarUrl : undefined,
              isFollowedByMe:
                (user.isFollowedByMe as boolean | undefined) ??
                (user.isFollowing as boolean | undefined) ??
                false,
              followsMe: (user.followsMe as boolean | undefined) ?? false,
              isMe: Number(user.id) === meRes.data?.data?.id,
            };
          }) ?? [];

        setUsers(likedUsers);
      } catch (err) {
        console.error('❌ Gagal ambil daftar likes:', err);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLikes();
  }, [isOpen, postId]);

  // handle follow / unfollow
  const handleFollow = async (username: string, isFollowed: boolean) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login first');
        return;
      }

      if (isFollowed) {
        await api.delete(`/api/follow/${username}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await api.post(
          `/api/follow/${username}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      // update state langsung
      setUsers((prev) =>
        prev.map((u) =>
          u.username === username ? { ...u, isFollowedByMe: !isFollowed } : u
        )
      );
    } catch (err) {
      console.error('❌ Failed to follow/unfollow:', err);
      alert('Action failed. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black/70 flex justify-center items-center z-50'>
      <div className='bg-neutral-900 w-[400px] max-h-[500px] rounded-lg p-4 overflow-y-auto'>
        {/* Header */}
        <div className='flex justify-between items-center mb-4'>
          <h2 className='text-lg font-semibold'>Likes</h2>
          <button onClick={onClose} className='text-gray-400 hover:text-white'>
            ✕
          </button>
        </div>

        {/* Body */}
        {loading ? (
          <p className='text-center text-gray-400 py-6'>Loading...</p>
        ) : users.length === 0 ? (
          <p className='text-center text-gray-400 py-6'>Belum ada yang like.</p>
        ) : (
          users.map((user) => (
            <div
              key={user.id}
              className='flex justify-between items-center mb-3'
            >
              <div className='flex items-center gap-3'>
                <ImageWithFallback
                  src={user.avatarUrl || '/profile.png'}
                  alt={user.name}
                  className='w-10 h-10 rounded-full'
                />
                <div>
                  <p className='text-sm font-medium'>{user.name}</p>
                  <p className='text-xs text-gray-400'>@{user.username}</p>
                </div>
              </div>

              {/* Tombol follow/unfollow */}
              {!user.isMe && (
                <button
                  onClick={() =>
                    handleFollow(user.username, user.isFollowedByMe ?? false)
                  }
                  className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                    user.isFollowedByMe
                      ? 'bg-gray-700 hover:bg-gray-800 text-gray-300'
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                >
                  {user.isFollowedByMe ? 'Following' : 'Follow'}
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
