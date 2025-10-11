import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import { listPosts, listMyPosts, createUserPost, likePost, addComment } from '../services/api';

export default function Blog() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]); // all approved posts
  const [myPosts, setMyPosts] = useState([]); // current user's posts
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', tags: '' });
  const [thumbPreview, setThumbPreview] = useState(''); // object URL from file
  const [thumbDataUrl, setThumbDataUrl] = useState(''); // base64 data URL for upload
  const [thumbUrl, setThumbUrl] = useState(''); // direct image URL
  const [submitting, setSubmitting] = useState(false);
  const [commentById, setCommentById] = useState({}); // { [postId]: string }

  const others = useMemo(() => {
    const myIds = new Set(myPosts.map((mp) => String(mp._id || mp.id)));
    return posts.filter((p) => !myIds.has(String(p._id || p.id)));
  }, [posts, myPosts]);

  useEffect(() => {
    async function load() {
      setError('');
      setLoading(true);
      try {
        const [allRes, mineRes] = await Promise.allSettled([
          listPosts(),
          listMyPosts(),
        ]);
        if (allRes.status === 'fulfilled') {
          const data = allRes.value;
          setPosts(Array.isArray(data?.posts) ? data.posts : []);
        } else {
          setPosts([]);
        }
        if (mineRes.status === 'fulfilled') {
          const data = mineRes.value;
          setMyPosts(Array.isArray(data?.posts) ? data.posts : []);
        } else {
          setMyPosts([]);
        }
      } catch (err) {
        setError(err.message || 'Failed to load posts');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleLike(postId) {
    try {
      await likePost(postId);
      // Refresh list to update like counts
      try {
        const data = await listPosts();
        setPosts(Array.isArray(data?.posts) ? data.posts : []);
      } catch {}
    } catch (err) {
      setError(err?.message || 'Failed to like');
    }
  }

  async function handleAddComment(postId) {
    const text = (commentById[postId] || '').trim();
    if (!text) return;
    try {
      await addComment(postId, text);
      setCommentById((m) => ({ ...m, [postId]: '' }));
      // Refresh list to show new comment count
      try {
        const data = await listPosts();
        setPosts(Array.isArray(data?.posts) ? data.posts : []);
      } catch {}
    } catch (err) {
      setError(err?.message || 'Failed to add comment');
    }
  }

  function handleThumbChange(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) {
      setThumbPreview('');
      setThumbDataUrl('');
      return;
    }
    try {
      const url = URL.createObjectURL(file);
      setThumbPreview(url);
      const reader = new FileReader();
      reader.onload = () => {
        const result = typeof reader.result === 'string' ? reader.result : '';
        setThumbDataUrl(result);
      };
      reader.readAsDataURL(file);
    } catch (_) {
      setThumbPreview('');
      setThumbDataUrl('');
    }
  }

  function handleThumbUrlChange(e) {
    setThumbUrl(e.target.value);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!form.title.trim() || !form.content.trim()) {
      setError('Please fill in title and content');
      return;
    }
    try {
      setSubmitting(true);
      const payload = {
        title: form.title.trim(),
        content: form.content.trim(),
        tags: form.tags
          .split(',')
          .map((t) => t.trim())
          .filter((t) => t.length > 0),
        ...(thumbUrl || thumbDataUrl ? { coverImage: (thumbUrl || thumbDataUrl).trim ? (thumbUrl || thumbDataUrl).trim() : (thumbUrl || thumbDataUrl) } : {}),
      };
      await createUserPost(payload);
      setForm({ title: '', content: '', tags: '' });
      setThumbPreview('');
      setThumbUrl('');
      setThumbDataUrl('');
      setFormOpen(false);
      // Immediately refresh lists so everyone sees it right away
      try {
        const [allRes, mineRes] = await Promise.allSettled([
          listPosts(),
          listMyPosts(),
        ]);
        if (allRes.status === 'fulfilled') {
          const dataAll = allRes.value;
          setPosts(Array.isArray(dataAll?.posts) ? dataAll.posts : []);
        }
        if (mineRes.status === 'fulfilled') {
          const dataMine = mineRes.value;
          setMyPosts(Array.isArray(dataMine?.posts) ? dataMine.posts : []);
        }
      } catch {}
      alert('Post published! It is now visible to everyone.');
    } catch (err) {
      console.error('Publish blog failed:', err);
      setError(err?.message || 'Failed to submit post');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="landing-container" style={{ background: '#ffffff', color: '#111827', minHeight: '100vh' }}>
      <Navbar />
      <main style={{ padding: '32px', width: '100%' }}>
        <header style={{ marginBottom: 24 }}>
          <h2>Community Blog</h2>
          <p className="subtle">Read published posts from the community and share your own thoughts.</p>
        </header>

        {error && (
          <div
            style={{
              background: '#fee2e2',
              color: '#991b1b',
              padding: '10px 12px',
              borderRadius: 8,
              marginBottom: 16,
              border: '1px solid #fecaca',
            }}
          >
            {error}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 16, alignItems: 'start' }}>
          {/* Left: Menu Sidebar */}
          <nav className="card" style={{ position: 'sticky', top: 24, height: 'fit-content' }}>
            <div style={{ display: 'grid', gap: 10 }}>
              <motion.button
                type="button"
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
                className="cta-btn"
                style={{ background: 'white', color: '#1f2937', border: '2px solid #1f2937' }}
                onClick={() => setFormOpen((v) => !v)}
              >
                {formOpen ? 'Close' : 'Write a blog'}
              </motion.button>
              <motion.button
                type="button"
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
                className="cta-btn"
                style={{ background: 'white', color: '#1f2937', border: '2px solid #1f2937' }}
                onClick={() => navigate('/blog/mine')}
              >
                My blog
              </motion.button>
            </div>
          </nav>

          {/* Center: Posts split into My Posts and Other Posts */}
          <div style={{ display: 'grid', gap: 16 }}>
            <section className="card" style={{ minHeight: 150 }}>
              <h3 style={{ marginBottom: 8 }}>Other posts</h3>
              {loading ? (
                <div>Loading...</div>
              ) : others.length === 0 ? (
                <div className="subtle">No other posts yet.</div>
              ) : (
                <div style={{ display: 'grid', gap: 12 }}>
                  {others.map((p) => {
                    const id = p._id || p.id;
                    const snippet = String(p.content || '').length > 160
                      ? String(p.content).slice(0, 160) + '…'
                      : String(p.content || '');
                    const thumb = p.thumbnail || p.coverImage || '';
                    return (
                      <article key={id} style={{ border: '1px solid #e5e7eb', borderRadius: 10, padding: 12 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: 12, alignItems: 'center' }}>
                          <div style={{ width: '100%', height: 100, borderRadius: 8, overflow: 'hidden', background: '#f7f7f7' }}>
                            {String(thumb).trim() ? (
                              <img alt={p.title} src={String(thumb).trim()} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                            ) : (
                              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: 12 }}>No image</div>
                            )}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
                              <Link to={`/blog/${id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                <div style={{ fontWeight: 700, fontSize: 18, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</div>
                              </Link>
                              <div className="subtle" style={{ fontSize: 12 }}>
                                {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : ''}
                              </div>
                            </div>
                            <div style={{ marginTop: 6, color: '#374151' }}>{snippet}</div>
                            <div style={{ marginTop: 10, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                              <Link to={`/blog/${id}`} className="btn btn-secondary btn-sm">Read more</Link>
                              <button type="button" className="btn btn-secondary btn-sm" onClick={() => handleLike(id)}>
                                Like {Array.isArray(p.likedBy) ? `(${p.likedBy.length})` : ''}
                              </button>
                            </div>
                            <div style={{ marginTop: 8, display: 'flex', gap: 8, alignItems: 'center' }}>
                              <input
                                type="text"
                                className="input"
                                placeholder="Write a comment..."
                                value={commentById[id] || ''}
                                onChange={(e) => setCommentById((m) => ({ ...m, [id]: e.target.value }))}
                                style={{ flex: 1 }}
                              />
                              <button type="button" className="btn btn-secondary btn-sm" onClick={() => handleAddComment(id)}>Comment{Array.isArray(p.comments) ? ` (${p.comments.length})` : ''}</button>
                            </div>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        </div>

        {/* Compose Modal */}
        {formOpen && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div className="card" style={{ width: 'min(720px, 96vw)', maxHeight: '90vh', overflow: 'auto', background: '#fff' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingRight: 4 }}>
                <button className="cta-btn secondary" onClick={() => { setFormOpen(false); setThumbPreview(''); setThumbUrl(''); setThumbDataUrl(''); }} style={{ color: 'black' }}>Close</button>
              </div>
              <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
                <label>
                  <div style={{ fontSize: 14, marginBottom: 6 }}>Title</div>
                  <input
                    type="text"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    className="input"
                    placeholder="A helpful thought..."
                  />
                </label>

                <label>
                  <div style={{ fontSize: 14, marginBottom: 6 }}>Content</div>
                  <textarea
                    name="content"
                    value={form.content}
                    onChange={handleChange}
                    className="input"
                    rows={8}
                    placeholder="Write your message here..."
                  />
                </label>

                <div className="card" style={{ background: '#fafafa' }}>
                  <div className="card-body" style={{ display: 'grid', gap: 10 }}>
                    <div style={{ fontWeight: 700 }}>Thumbnail</div>
                    <label>
                      <div className="subtle" style={{ marginBottom: 6 }}>Choose file</div>
                      <input type="file" accept="image/*" onChange={handleThumbChange} className="input" />
                    </label>
                    <label>
                      <div className="subtle" style={{ marginBottom: 6 }}>Or image URL</div>
                      <input
                        type="url"
                        value={thumbUrl}
                        onChange={handleThumbUrlChange}
                        className="input"
                        placeholder="https://example.com/thumbnail.jpg"
                      />
                    </label>
                    {(thumbPreview || thumbUrl) && (
                      <div style={{ width: '100%', paddingTop: '40%', position: 'relative', borderRadius: 8, overflow: 'hidden', background: '#f7f7f7' }}>
                        <img
                          alt="Preview"
                          src={thumbPreview || thumbUrl}
                          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <label>
                  <div style={{ fontSize: 14, marginBottom: 6 }}>Tags (comma separated)</div>
                  <input
                    type="text"
                    name="tags"
                    value={form.tags}
                    onChange={handleChange}
                    className="input"
                    placeholder="mindfulness, tips, recovery"
                  />
                </label>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button disabled={submitting} type="submit" className="cta-btn" style={{ color: 'black' }}>
                    {submitting ? 'Publishing...' : 'Publish'}
                  </button>
                  <button type="button" className="cta-btn secondary" onClick={() => { setFormOpen(false); setThumbPreview(''); setThumbUrl(''); setThumbDataUrl(''); }} style={{ color: 'black' }}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}