import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import Menu from '../components/Menu';

interface User {
  id: number;
  username: string;
  name: string;
  avatarUrl?: string;
  isFollowedByMe?: boolean;
}

export default function FollowersList() {
  const { username } = useParams();
  const navigate = useNavigate();
  const [followers, setFollowers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFollowers = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return navigate('/login');
        const res = await api.get(`/api/users/${username}/followers`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // ✅ ambil dari data.users (bukan data.followers)
        setFollowers(res.data?.data?.users || []);
      } catch (err) {
        console.error('❌ Gagal ambil followers:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFollowers();
  }, [username, navigate]);

  if (loading)
    return (
      <div className='min-h-screen bg-black text-white flex items-center justify-center'>
        Loading...
      </div>
    );

  return (
    <div className='min-h-screen bg-black text-white flex flex-col'>
      <Navbar />
      <div className='max-w-md mx-auto w-full px-4 py-6'>
        <h1 className='text-xl font-bold mb-6'>Followers</h1>
        {followers.length === 0 ? (
          <p className='text-center text-gray-400'>No followers yet.</p>
        ) : (
          <div className='flex flex-col gap-4'>
            {followers.map((user) => (
              <div
                key={user.id}
                onClick={() => navigate(`/user/${user.username}`)} // ✅ sama seperti Explore.tsx
                className='flex items-center gap-4 cursor-pointer hover:bg-neutral-900 p-3 rounded-lg'
              >
                <img
                  src={user.avatarUrl || '/profile.png'}
                  alt={user.username}
                  className='w-12 h-12 rounded-full object-cover'
                />
                <div>
                  <p className='font-semibold'>{user.name}</p>
                  <p className='text-sm text-gray-400'>@{user.username}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Menu />
    </div>
  );
}
