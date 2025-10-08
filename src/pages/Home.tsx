import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Menu from '../components/Menu';
import api from '../api/axios';
import ImageWithFallback from '../components/ImageWithFallback';
import LikesModal from '../components/LikesModal';
import CommentModal from '../components/CommentModal';

interface Post {
  id: number;
  imageUrl: string;
  caption: string;
  createdAt: string;
  author: {
    id: number;
    username: string;
    name: string;
    avatarUrl?: string | null;
  };
  likeCount: number;
  commentCount: number;
  likedByMe: boolean;
  savedByMe: boolean;
}

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const [showLikesModal, setShowLikesModal] = useState(false);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const navigate = useNavigate();

  const fetchFeed = async (pageNum: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const res = await api.get(`/api/feed?page=${pageNum}&limit=20`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        const newItems = res.data.data.items || [];
        setPosts((prev) => (pageNum === 1 ? newItems : [...prev, ...newItems]));
        setHasMore(newItems.length > 0);
      }
    } catch (err) {
      console.error('❌ Gagal ambil feed:', err);
    } finally {
      setLoading(false);
      setIsFetchingMore(false);
    }
  };

  useEffect(() => {
    fetchFeed(1);
  }, []);

  // ✅ Infinite scroll handler
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
          document.body.offsetHeight - 300 &&
        hasMore &&
        !isFetchingMore
      ) {
        setIsFetchingMore(true);
        setPage((prev) => prev + 1);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasMore, isFetchingMore]);

  useEffect(() => {
    if (page > 1) fetchFeed(page);
  }, [page]);

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
    } catch (err) {
      console.error('❌ Gagal like/unlike:', err);
    }
  };

  const handleSave = async (postId: number, saved: boolean) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return alert('Kamu harus login dulu');

      const url = `/api/posts/${postId}/save`;
      const method = saved ? 'delete' : 'post';
      await api[method](
        url,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, savedByMe: !saved } : p))
      );
    } catch (err) {
      console.error('❌ Gagal save/unsave:', err);
    }
  };

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
      <div className='min-h-screen flex items-center justify-center bg-black text-white'>
        Loading feed...
      </div>
    );

  return (
    <div className='min-h-screen bg-black text-white'>
      <Navbar />
      <div className='max-w-[600px] mx-auto pb-28'>
        {posts.length === 0 ? (
          <p className='text-center text-gray-400 mt-10'>Belum ada post.</p>
        ) : (
          posts.map((post) => (
            <div
              key={post.id}
              className='w-full bg-neutral-900 rounded-lg mb-6 shadow-md'
            >
              <div
                className='flex items-center gap-3 px-4 py-3 cursor-pointer'
                onClick={() => navigate(`/user/${post.author.username}`)}
              >
                <ImageWithFallback
                  src={post.author.avatarUrl || '/profile.png'}
                  alt={post.author.username}
                  className='w-10 h-10 rounded-full'
                />
                <div>
                  <p className='font-semibold text-sm'>{post.author.name}</p>
                  <p className='text-xs text-gray-400'>
                    @{post.author.username}
                  </p>
                </div>
              </div>

              <ImageWithFallback
                src={post.imageUrl}
                alt='post'
                className='w-full object-cover max-h-[500px]'
              />

              <div className='flex gap-6 px-4 py-3 text-gray-400 text-sm'>
                <button
                  onClick={() => handleLike(post.id, post.likedByMe)}
                  className={`flex items-center gap-1 ${
                    post.likedByMe ? 'text-red-500' : ''
                  }`}
                >
                  ❤️ {post.likeCount}
                </button>

                <button onClick={() => openLikesModal(post.id)}>
                  👁‍🗨 View Likes
                </button>

                <button onClick={() => openCommentsModal(post.id)}>
                  💬 {post.commentCount}
                </button>

                <button
                  onClick={() => handleSave(post.id, post.savedByMe)}
                  className={`flex items-center gap-1 ${
                    post.savedByMe ? 'text-yellow-400' : ''
                  }`}
                >
                  {post.savedByMe ? '🔖 Saved' : '📑 Save'}
                </button>

                <span>↗️ Share</span>
              </div>

              <div className='px-4 pb-4 text-sm'>
                <p className='font-medium'>@{post.author.username}</p>
                <p>{post.caption}</p>
              </div>
            </div>
          ))
        )}

        {/* Loader saat scroll */}
        {isFetchingMore && (
          <div className='text-center text-gray-500 pb-10'>Loading more...</div>
        )}
      </div>

      <Menu />

      <LikesModal
        isOpen={showLikesModal}
        onClose={() => setShowLikesModal(false)}
        postId={selectedPostId}
      />

      <CommentModal
        isOpen={showCommentsModal}
        onClose={() => setShowCommentsModal(false)}
        postId={selectedPostId}
      />
    </div>
  );
}
