import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
}

interface Post {
  id: number;
  imageUrl: string;
  caption: string;
  author: {
    id: number;
    username: string;
  };
  likeCount: number;
  commentCount: number;
  likedByMe: boolean;
}

export default function MyProfile() {
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [likedPosts, setLikedPosts] = useState<Post[]>([]);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [activeTab, setActiveTab] = useState<'posts' | 'liked'>('posts');
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  // 🔹 Modal States
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const [showLikesModal, setShowLikesModal] = useState(false);
  const [showCommentsModal, setShowCommentsModal] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const meRes = await api.get('/api/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const me = meRes.data?.data?.profile || meRes.data?.data;
        setUser(me);

        const [followersRes, followingRes, postsRes, likedRes] =
          await Promise.all([
            api.get(`/api/users/${me.username}/followers?page=1&limit=1`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            api.get(`/api/users/${me.username}/following?page=1&limit=1`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            api.get(`/api/users/${me.username}/posts?page=1&limit=20`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            api.get(`/api/users/${me.username}/likes?page=1&limit=20`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
          ]);

        setFollowersCount(followersRes.data?.data?.pagination?.total ?? 0);
        setFollowingCount(followingRes.data?.data?.pagination?.total ?? 0);
        setPosts(postsRes.data?.data?.posts || []);
        setLikedPosts(likedRes.data?.data?.posts || []);
      } catch (err) {
        console.error('❌ Gagal ambil data profil:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

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

      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
                ...p,
                likedByMe: !liked,
                likeCount: liked ? p.likeCount - 1 : p.likeCount + 1,
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
                likeCount: liked ? p.likeCount - 1 : p.likeCount + 1,
              }
            : p
        )
      );
    } catch (err) {
      console.error('❌ Gagal like/unlike:', err);
    }
  };

  // 🔹 Buka modal likes/comments
  const openLikesModal = (postId: number) => {
    setSelectedPostId(postId);
    setShowLikesModal(true);
  };
  const openCommentsModal = (postId: number) => {
    setSelectedPostId(postId);
    setShowCommentsModal(true);
  };

  const handleDelete = async (postId: number) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    const token = localStorage.getItem('token');
    if (!token) return navigate('/login');

    try {
      await api.delete(`/api/posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      alert('✅ Post deleted successfully!');
    } catch (err) {
      console.error('❌ Error deleting post:', err);
      alert('Failed to delete post.');
    }
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
        Profile not found
      </div>
    );

  const totalLikes = posts.reduce((sum, p) => sum + (p.likeCount || 0), 0);
  const stats = {
    post: posts.length,
    followers: followersCount,
    following: followingCount,
    likes: totalLikes,
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
          <button
            onClick={() => navigate('/update-profile')}
            className='ml-auto bg-gray-800 px-4 py-2 rounded-lg hover:bg-gray-700'
          >
            Edit Profile
          </button>
        </div>

        {/* 🔹 Stats Section */}
        <div className='flex justify-around mt-6 border-b border-gray-700 pb-4 text-center'>
          <div>
            <p className='font-bold'>{stats.post}</p>
            <p className='text-sm text-gray-400'>Posts</p>
          </div>

          <div
            onClick={() => navigate(`/user/${user.username}/followers`)}
            className='cursor-pointer'
          >
            <p className='font-bold'>{stats.followers}</p>
            <p className='text-sm text-gray-400'>Followers</p>
          </div>

          <div
            onClick={() => navigate(`/user/${user.username}/following`)}
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
          {/* ✅ Tombol Saved */}
          <button
            onClick={() => navigate('/saved')}
            className='pb-1 text-gray-400 hover:text-white'
          >
            Saved
          </button>
        </div>

        {/* 🔹 Gallery */}
        {displayedPosts.length === 0 ? (
          <div className='text-center mt-10 text-gray-400'>
            {activeTab === 'posts'
              ? 'No posts yet. Share your first post!'
              : 'No liked posts yet.'}
          </div>
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
                {activeTab === 'posts' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(post.id);
                    }}
                    className='absolute top-1 right-1 bg-black/60 hover:bg-red-600 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition'
                  >
                    Delete
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <Menu />

      {/* 🔹 Modal Detail Post */}
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
                    handleLike(selectedPost.id, selectedPost.likedByMe)
                  }
                  className={`flex items-center gap-1 ${
                    selectedPost.likedByMe ? 'text-red-500' : ''
                  }`}
                >
                  ❤️ {selectedPost.likeCount ?? 0}
                </button>

                <button onClick={() => openLikesModal(selectedPost.id)}>
                  👁️ View Likes
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
