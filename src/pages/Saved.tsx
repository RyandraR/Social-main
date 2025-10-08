import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Menu from '../components/Menu';
import api from '../api/axios';
import LikesModal from '../components/LikesModal';
import CommentModal from '../components/CommentModal';

interface Post {
  id: number;
  imageUrl: string;
  caption: string;
  createdAt: string;
  author?: {
    id: number;
    username: string;
  };
  likeCount?: number;
  commentCount?: number;
  likedByMe?: boolean;
  savedByMe?: boolean;
}

export default function Saved() {
  const [savedPosts, setSavedPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Modal
  const [selectedPostId] = useState<number | null>(null); // ✅ masih ada tapi tidak error
  const [showLikesModal, setShowLikesModal] = useState(false);
  const [showCommentsModal, setShowCommentsModal] = useState(false);

  const navigate = useNavigate();

  // 🔹 Fetch saved posts
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchSaved = async () => {
      try {
        const res = await api.get('/api/me/saved?page=1&limit=30', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.success) {
          const postsData = res.data.data?.posts as unknown;
          const posts = (Array.isArray(postsData) ? postsData : []) as Post[];

          const normalized = posts.map((p) => ({
            ...p,
            likeCount: p.likeCount ?? 0,
            commentCount: p.commentCount ?? 0,
            likedByMe: p.likedByMe ?? false,
            author: p.author ?? { id: 0, username: 'You' },
          }));

          setSavedPosts(normalized);
        }
      } catch (err) {
        console.error('❌ Gagal ambil saved posts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSaved();
  }, [navigate]);

  // 🔹 Fetch post detail saat modal dibuka
  const handleOpenPost = async (post: Post) => {
    const token = localStorage.getItem('token');
    if (!token) return navigate('/login');

    setLoadingDetail(true);
    try {
      const res = await api.get(`/api/posts/${post.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        const detail = res.data.data as Partial<Post>;
        setSelectedPost({
          ...post,
          ...detail,
          author: detail.author ?? { id: 0, username: 'You' },
        });
      } else {
        setSelectedPost(post); // fallback
      }
    } catch (err) {
      console.error('❌ Gagal ambil detail post:', err);
      setSelectedPost(post);
    } finally {
      setLoadingDetail(false);
    }
  };

  // 🔹 Unsave / Remove saved post
  const handleUnsave = async (postId: number) => {
    const token = localStorage.getItem('token');
    if (!token) return navigate('/login');

    if (!window.confirm('Hapus post ini dari daftar saved?')) return;

    try {
      await api.delete(`/api/posts/${postId}/save`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSavedPosts((prev) => prev.filter((p) => p.id !== postId));
      alert('✅ Post dihapus dari Saved');
    } catch (err) {
      console.error('❌ Gagal hapus dari saved:', err);
      alert('Gagal hapus dari saved.');
    }
  };

  // 🔹 Like / Unlike
  const handleLike = async (postId: number, liked: boolean) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const url = `/api/posts/${postId}/like`;
      const method = liked ? 'delete' : 'post';
      await api[method](
        url,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSelectedPost((prev) =>
        prev
          ? {
              ...prev,
              likedByMe: !liked,
              likeCount: liked
                ? (prev.likeCount || 0) - 1
                : (prev.likeCount || 0) + 1,
            }
          : prev
      );
    } catch (err) {
      console.error('❌ Gagal like/unlike:', err);
    }
  };

  if (loading)
    return (
      <div className='min-h-screen flex items-center justify-center bg-black text-white'>
        Loading saved posts...
      </div>
    );

  return (
    <div className='min-h-screen bg-black text-white flex flex-col'>
      <Navbar />

      <div className='flex-1 max-w-3xl mx-auto w-full px-4 py-6'>
        {/* 🔹 Header */}
        <div className='flex justify-between items-center mb-6'>
          <h1 className='text-xl font-bold'>🔖 Saved Posts</h1>
          <button
            onClick={() => navigate(-1)}
            className='text-gray-400 hover:text-white text-sm'
          >
            ← Back
          </button>
        </div>

        {/* 🔹 Grid Saved Posts */}
        {savedPosts.length === 0 ? (
          <p className='text-center text-gray-400 mt-10'>
            Belum ada post yang disimpan.
          </p>
        ) : (
          <div className='grid grid-cols-3 gap-2'>
            {savedPosts.map((post) => (
              <div
                key={post.id}
                className='relative group cursor-pointer'
                onClick={() => handleOpenPost(post)}
              >
                <img
                  src={post.imageUrl}
                  alt={post.caption}
                  className='w-full h-40 object-cover rounded-lg'
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUnsave(post.id);
                  }}
                  className='absolute top-1 right-1 bg-black/60 hover:bg-red-600 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition'
                >
                  Delete
                </button>
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
            {loadingDetail ? (
              <div className='p-6 text-center text-gray-400'>
                Loading post detail...
              </div>
            ) : (
              <>
                <img
                  src={selectedPost.imageUrl}
                  alt='post'
                  className='w-full object-cover'
                />
                <div className='p-4'>
                  <div className='flex items-center justify-between mb-3'>
                    <p className='font-semibold text-white'>
                      @{selectedPost.author?.username ?? 'You'}
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
                        handleLike(
                          selectedPost.id,
                          selectedPost.likedByMe || false
                        )
                      }
                      className={`flex items-center gap-1 ${
                        selectedPost.likedByMe ? 'text-red-500' : ''
                      }`}
                    >
                      ❤️ {selectedPost.likeCount ?? 0}
                    </button>
                    <button onClick={() => setShowLikesModal(true)}>
                      👁️ View Likes
                    </button>
                    <button onClick={() => setShowCommentsModal(true)}>
                      💬 {selectedPost.commentCount ?? 0}
                    </button>
                    <span>↗️ Share</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* 🔹 Likes Modal */}
      <LikesModal
        isOpen={showLikesModal}
        onClose={() => setShowLikesModal(false)}
        postId={selectedPost?.id || selectedPostId}
      />

      {/* 🔹 Comments Modal */}
      <CommentModal
        isOpen={showCommentsModal}
        onClose={() => setShowCommentsModal(false)}
        postId={selectedPost?.id || selectedPostId}
      />
    </div>
  );
}
