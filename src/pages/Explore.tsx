import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Navbar from '../components/Navbar';

interface ApiUser {
  id: number;
  username: string;
  name: string;
  avatarUrl?: string;
  isFollowing?: boolean;
  isFollowedByMe?: boolean;
}

interface User {
  id: number;
  username: string;
  name: string;
  avatarUrl?: string;
  isFollowing: boolean;
}

export default function Explore() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const meRes = await api.get('/api/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const myId: number | null = meRes.data?.data?.id ?? null;

        const res = await api.get('/api/users/search?q=a&page=1&limit=50', {
          headers: { Authorization: `Bearer ${token}` },
        });

        const rawUsers: ApiUser[] =
          res.data?.data?.users ||
          res.data?.data?.items ||
          res.data?.data ||
          [];

        const allUsers: User[] = rawUsers.map((u) => ({
          id: u.id,
          username: u.username,
          name: u.name,
          avatarUrl: u.avatarUrl,
          isFollowing: u.isFollowing ?? u.isFollowedByMe ?? false,
        }));

        const filtered = myId
          ? allUsers.filter((u) => u.id !== myId)
          : allUsers;

        setUsers(filtered);
      } catch (err) {
        console.error('❌ Gagal ambil user:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleFollow = async (username: string, isFollowing: boolean) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login first');
        return;
      }

      if (isFollowing) {
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

      setUsers((prev) =>
        prev.map((u) =>
          u.username === username ? { ...u, isFollowing: !isFollowing } : u
        )
      );
    } catch (err) {
      console.error('❌ Failed to follow/unfollow:', err);
      alert('Action failed. Please try again.');
    }
  };

  if (loading)
    return (
      <div className='min-h-screen flex items-center justify-center bg-black text-white'>
        Loading users...
      </div>
    );

  return (
    <div className='min-h-screen bg-black text-white'>
      <Navbar />
      <div className='max-w-3xl mx-auto p-4 pb-20'>
        <h1 className='text-2xl font-bold mb-4'>Explore People</h1>
        {users.length === 0 ? (
          <p className='text-gray-400'>No users found.</p>
        ) : (
          <div className='space-y-4'>
            {users.map((user) => (
              <div
                key={user.id}
                className='flex items-center justify-between bg-neutral-900 p-3 rounded-xl'
              >
                <div
                  className='flex items-center gap-3 cursor-pointer'
                  onClick={() => navigate(`/user/${user.username}`)}
                >
                  <img
                    src={user.avatarUrl || '/profile.png'}
                    alt={user.username}
                    className='w-12 h-12 rounded-full object-cover'
                  />
                  <div>
                    <p className='font-semibold'>{user.name}</p>
                    <p className='text-gray-400 text-sm'>@{user.username}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleFollow(user.username, user.isFollowing)}
                  className={`px-4 py-1.5 rounded-lg font-medium ${
                    user.isFollowing
                      ? 'bg-gray-600 hover:bg-gray-700'
                      : 'bg-blue-500 hover:bg-blue-600'
                  }`}
                >
                  {user.isFollowing ? 'Following' : 'Follow'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
