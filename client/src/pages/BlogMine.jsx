import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { listMyPosts, deleteMyPost } from '../services/api';

export default function BlogMine() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    let alive = true;
    (async () => {
      setError('');
      setLoading(true);
      try {
        const data = await listMyPosts();
        if (!alive) return;
        setPosts(Array.isArray(data?.posts) ? data.posts : []);
      } catch (err) {
        if (!alive) return;
        setError(err.message || 'Failed to load posts');
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  async function handleDelete(id) {
    if (!window.confirm('Delete this post?')) return;
    try {
      await deleteMyPost(id);
      setInfo('Post deleted');
      const data = await listMyPosts();
      setPosts(Array.isArray(data?.posts) ? data.posts : []);
    } catch (err) {
      setError(err.message || 'Delete failed');
    }
  }

  return (
    <div className="landing-container" style={{ background: '#ffffff', color: '#111827', minHeight: '100vh' }}>
      <Navbar />
      <main style={{ padding: '32px', width: '100%', maxWidth: 1000, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ margin: 0 }}>My Blog</h2>
          <Link to="/blog" className="btn btn-secondary btn-sm">Back to Blog</Link>
        </div>

        {error && (
          <div style={{ background: '#fee2e2', color: '#991b1b', padding: '10px 12px', borderRadius: 8, marginBottom: 16, border: '1px solid #fecaca' }}>{error}</div>
        )}
        {info && (
          <div style={{ background: '#ecfdf5', color: '#065f46', padding: '10px 12px', borderRadius: 8, marginBottom: 16, border: '1px solid #a7f3d0' }}>{info}</div>
        )}

        {loading ? (
          <div>Loading...</div>
        ) : posts.length === 0 ? (
          <div className="subtle">You haven't posted anything yet.</div>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {posts.map((p) => {
              const id = p._id || p.id;
              const snippet = String(p.content || '').length > 200 ? String(p.content).slice(0, 200) + '…' : String(p.content || '');
              const thumb = p.thumbnail || p.coverImage || '';
              return (
                <article key={id} className="card" style={{ padding: 12 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr auto', gap: 12, alignItems: 'center' }}>
                    <div style={{ width: '100%', height: 100, borderRadius: 8, overflow: 'hidden', background: '#f7f7f7' }}>
                      {String(thumb).trim() ? (
                        <img alt={p.title} src={String(thumb).trim()} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: 12 }}>No image</div>
                      )}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <Link to={`/blog/${id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <div style={{ fontWeight: 700, fontSize: 18, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</div>
                      </Link>
                      <div className="subtle" style={{ fontSize: 12, marginTop: 2 }}>{p.createdAt ? new Date(p.createdAt).toLocaleString() : ''}</div>
                      <div style={{ marginTop: 6, color: '#374151' }}>{snippet}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <Link to={`/blog/${id}`} className="btn btn-secondary btn-sm">Read</Link>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(id)}>Delete</button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
