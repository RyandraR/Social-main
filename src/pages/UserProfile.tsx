import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Menu from '../components/Menu';
import api from '../api/axios';
import LikesModal from '../components/LikesModal';
import CommentModal from '../components/CommentModal';

interface User {
  id: number;
  name: string;
  username: string;
  avatarUrl?: string;
  bio?: string;
  email?: string;
  phone?: string;
  counts?: {
    post: number;
    followers: number;
    following: number;
    likes: number;
  };
  isFollowing?: boolean;
  isMe?: boolean;
}

interface Post {
  id: number;
  imageUrl: string;
  caption: string;
  author: {
    id: number;
    username: string;
  };
  likeCount?: number;
  commentCount?: number;
  likedByMe?: boolean;
}

export default function UserProfile() {
  const { username } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [likedPosts, setLikedPosts] = useState<Post[]>([]);
  const [activeTab, setActiveTab] = useState<'posts' | 'liked'>('posts');
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  // 🔹 Modal States
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const [showLikesModal, setShowLikesModal] = useState(false);
  const [showCommentsModal, setShowCommentsModal] = useState(false);

  // 🔹 Fetch user + posts
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        // 1️⃣ Ambil data user
        const res = await api.get(`/api/users/${username}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = res.data?.data;
        setUser(data);
        setIsFollowing(data.isFollowing);

        // 2️⃣ Ambil posts
        const postRes = await api.get(
          `/api/users/${username}/posts?page=1&limit=20`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setPosts(postRes.data?.data?.posts || []);

        // 3️⃣ Ambil liked posts
        const likedRes = await api.get(
          `/api/users/${username}/likes?page=1&limit=20`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setLikedPosts(likedRes.data?.data?.posts || []);
      } catch (err) {
        console.error('❌ Gagal fetch user profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [username, navigate]);

  // 🔹 Handle Follow / Unfollow
  const handleFollow = async () => {
    if (!user) return;
    const token = localStorage.getItem('token');
    if (!token) return alert('Please login first');

    try {
      if (isFollowing) {
        await api.delete(`/api/follow/${user.username}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await api.post(
          `/api/follow/${user.username}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      setIsFollowing(!isFollowing);
    } catch (err) {
      console.error('❌ Follow/unfollow failed:', err);
      alert('Follow action failed.');
    }
  };

  // 🔹 Handle Like/Unlike
  const handleLike = async (postId: number, liked: boolean) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return alert('Kamu harus login dulu');

      const url = `/api/posts/${postId}/like`;
      const method = liked ? 'delete' : 'post';
      await api[method](
        url,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // update di state
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
                ...p,
                likedByMe: !liked,
                likeCount: liked
                  ? (p.likeCount ?? 1) - 1
                  : (p.likeCount ?? 0) + 1,
              }
            : p
        )
      );
      setLikedPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
                ...p,
                likedByMe: !liked,
                likeCount: liked
                  ? (p.likeCount ?? 1) - 1
                  : (p.likeCount ?? 0) + 1,
              }
            : p
        )
      );
    } catch (err) {
      console.error('❌ Gagal like/unlike:', err);
    }
  };

  // 🔹 Open modals
  const openLikesModal = (postId: number) => {
    setSelectedPostId(postId);
    setShowLikesModal(true);
  };
  const openCommentsModal = (postId: number) => {
    setSelectedPostId(postId);
    setShowCommentsModal(true);
  };

  if (loading)
    return (
      <div className='min-h-screen bg-black text-white flex items-center justify-center'>
        Loading...
      </div>
    );

  if (!user)
    return (
      <div className='min-h-screen bg-black text-white flex items-center justify-center'>
        User not found
      </div>
    );

  const stats = user.counts || {
    post: 0,
    followers: 0,
    following: 0,
    likes: 0,
  };

  const displayedPosts = activeTab === 'posts' ? posts : likedPosts;

  return (
    <div className='min-h-screen bg-black text-white flex flex-col'>
      <Navbar />

      <div className='flex-1 max-w-3xl mx-auto w-full px-4 py-6'>
        {/* 🔹 Header Profile */}
        <div className='flex items-center gap-4'>
          <img
            src={user.avatarUrl || '/profile.png'}
            alt='avatar'
            className='w-20 h-20 rounded-full object-cover'
          />
          <div>
            <h1 className='text-xl font-bold'>{user.name}</h1>
            <p className='text-gray-400'>@{user.username}</p>
            {user.bio && <p className='mt-1 text-gray-300'>{user.bio}</p>}
          </div>

          {/* 🔹 Follow Button */}
          {!user.isMe && (
            <button
              onClick={handleFollow}
              className={`ml-auto px-4 py-2 rounded-lg ${
                isFollowing
                  ? 'bg-gray-700 hover:bg-gray-600'
                  : 'bg-blue-600 hover:bg-blue-500'
              }`}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </button>
          )}
        </div>

        {/* 🔹 Stats Section */}
        <div className='flex justify-around mt-6 border-b border-gray-700 pb-4 text-center'>
          <div>
            <p className='font-bold'>{stats.post}</p>
            <p className='text-sm text-gray-400'>Posts</p>
          </div>

          <div
            onClick={() => navigate(`/user/${username}/followers`)}
            className='cursor-pointer'
          >
            <p className='font-bold'>{stats.followers}</p>
            <p className='text-sm text-gray-400'>Followers</p>
          </div>

          <div
            onClick={() => navigate(`/user/${username}/following`)}
            className='cursor-pointer'
          >
            <p className='font-bold'>{stats.following}</p>
            <p className='text-sm text-gray-400'>Following</p>
          </div>

          <div onClick={() => setActiveTab('liked')} className='cursor-pointer'>
            <p className='font-bold'>{stats.likes}</p>
            <p className='text-sm text-gray-400'>Likes</p>
          </div>
        </div>

        {/* 🔹 Tabs */}
        <div className='flex justify-center gap-8 mt-6 border-b border-gray-700 pb-2'>
          <button
            onClick={() => setActiveTab('posts')}
            className={`pb-1 ${
              activeTab === 'posts'
                ? 'border-b-2 border-blue-500 font-semibold'
                : 'text-gray-400'
            }`}
          >
            Posts
          </button>
          <button
            onClick={() => setActiveTab('liked')}
            className={`pb-1 ${
              activeTab === 'liked'
                ? 'border-b-2 border-blue-500 font-semibold'
                : 'text-gray-400'
            }`}
          >
            Liked
          </button>
        </div>

        {/* 🔹 Gallery */}
        {displayedPosts.length === 0 ? (
          <div className='text-center mt-10 text-gray-400'>No posts yet.</div>
        ) : (
          <div className='grid grid-cols-3 gap-2 mt-4'>
            {displayedPosts.map((post) => (
              <div
                key={post.id}
                className='relative group cursor-pointer'
                onClick={() => setSelectedPost(post)}
              >
                <img
                  src={post.imageUrl}
                  alt={post.caption}
                  className='w-full h-40 object-cover rounded-lg'
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <Menu />

      {/* 🔹 Modal Post Detail */}
      {selectedPost && (
        <div
          className='fixed inset-0 bg-black/80 flex items-center justify-center z-50'
          onClick={() => setSelectedPost(null)}
        >
          <div
            className='bg-neutral-900 rounded-xl overflow-hidden max-w-md w-[90%] shadow-lg'
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedPost.imageUrl}
              alt='post'
              className='w-full object-cover'
            />
            <div className='p-4'>
              <div className='flex items-center justify-between mb-3'>
                <p className='font-semibold text-white'>
                  @{selectedPost.author.username}
                </p>
                <button
                  onClick={() => setSelectedPost(null)}
                  className='text-gray-400 hover:text-white text-sm'
                >
                  ✕
                </button>
              </div>
              <p className='text-gray-300 mb-3'>{selectedPost.caption}</p>
              <div className='flex gap-6 text-gray-400 text-sm'>
                <button
                  onClick={() =>
                    handleLike(selectedPost.id, selectedPost.likedByMe || false)
                  }
                  className={`flex items-center gap-1 ${
                    selectedPost.likedByMe ? 'text-red-500' : ''
                  }`}
                >
                  ❤️ {selectedPost.likeCount ?? 0}
                </button>

                <button onClick={() => openLikesModal(selectedPost.id)}>
                  👁‍🗨 View Likes
                </button>

                <button onClick={() => openCommentsModal(selectedPost.id)}>
                  💬 {selectedPost.commentCount ?? 0}
                </button>

                <span>↗️ Share</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🔹 Likes Modal */}
      <LikesModal
        isOpen={showLikesModal}
        onClose={() => setShowLikesModal(false)}
        postId={selectedPostId}
      />

      {/* 🔹 Comments Modal */}
      <CommentModal
        isOpen={showCommentsModal}
        onClose={() => setShowCommentsModal(false)}
        postId={selectedPostId}
      />
    </div>
  );
}
