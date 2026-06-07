import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Share2, Image, Loader2, Send, User } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase, TABLES } from '../lib/supabaseClient';
import toast from 'react-hot-toast';

export default function Community() {
  const { user, isAuthenticated } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState({ title: '', content: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const { data, error } = await supabase
        .from(TABLES.COMMUNITY_POSTS)
        .select('*, profile:profiles(full_name)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setPosts(data || []);
    } catch (err) {
      console.error('Error loading posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please sign in to post');
      return;
    }
    if (!newPost.title.trim() || !newPost.content.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from(TABLES.COMMUNITY_POSTS).insert({
        user_id: user.id,
        title: newPost.title,
        content: newPost.content,
      });
      if (error) throw error;
      toast.success('Post shared!');
      setNewPost({ title: '', content: '' });
      loadPosts();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="py-12 sm:py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">Community</h1>
          <p className="text-text-secondary text-sm mt-1">Share your 3D printed creations with the world</p>
        </motion.div>

        {/* Create Post */}
        {isAuthenticated && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-bg-card border border-border-subtle rounded-xl p-5 mb-6"
          >
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Share a title for your creation..."
                value={newPost.title}
                onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                className="w-full bg-bg-primary border border-border-subtle rounded-lg px-4 py-2.5 text-text-primary text-sm mb-3 focus:outline-none focus:border-accent"
              />
              <textarea
                placeholder="Tell us about your 3D printed gift experience..."
                value={newPost.content}
                onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                rows={3}
                className="w-full bg-bg-primary border border-border-subtle rounded-lg px-4 py-2.5 text-text-primary text-sm mb-3 focus:outline-none focus:border-accent resize-none"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-accent hover:bg-accent-hover disabled:opacity-60 text-white px-5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2"
                >
                  {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                  Share Post
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {!isAuthenticated && (
          <div className="bg-bg-card border border-border-subtle rounded-xl p-5 mb-6 text-center">
            <p className="text-text-secondary text-sm">
              <Link to="/login" className="text-accent hover:underline">Sign in</Link> to share your creations with the community
            </p>
          </div>
        )}

        {/* Posts Feed */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 size={24} className="animate-spin text-accent" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12">
            <Image size={40} className="text-text-muted mx-auto mb-3" />
            <p className="text-text-secondary">No posts yet. Be the first to share!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-bg-card border border-border-subtle rounded-xl p-5"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 bg-accent/20 rounded-full flex items-center justify-center">
                    <span className="text-accent text-xs font-bold">
                      {post.profile?.full_name?.charAt(0).toUpperCase() || <User size={14} />}
                    </span>
                  </div>
                  <div>
                    <p className="text-text-primary text-sm font-medium">{post.profile?.full_name || 'Anonymous'}</p>
                    <p className="text-text-muted text-xs">{new Date(post.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <h3 className="text-text-primary font-semibold mb-2">{post.title}</h3>
                <p className="text-text-secondary text-sm leading-relaxed">{post.content}</p>
                <div className="flex items-center gap-4 mt-4 pt-3 border-t border-border-subtle">
                  <button className="flex items-center gap-1.5 text-text-muted hover:text-accent text-xs transition-colors">
                    <Heart size={14} /> Like
                  </button>
                  <button className="flex items-center gap-1.5 text-text-muted hover:text-accent text-xs transition-colors">
                    <MessageCircle size={14} /> Comment
                  </button>
                  <button className="flex items-center gap-1.5 text-text-muted hover:text-accent text-xs transition-colors">
                    <Share2 size={14} /> Share
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
