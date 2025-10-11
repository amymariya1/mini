import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getPost } from '../services/api';

export default function BlogDetail() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    (async () => {
      setError('');
      setLoading(true);
      try {
        const data = await getPost(id);
        if (!alive) return;
        setPost(data.post || data);
      } catch (err) {
        if (!alive) return;
        setError(err.message || 'Failed to load post');
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [id]);

  return (
    <div className="landing-container" style={{ background: '#ffffff', color: '#111827', minHeight: '100vh' }}>
      <Navbar />
      <main style={{ padding: '32px', width: '100%', maxWidth: 1000, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ margin: 0 }}>Blog</h2>
          <Link to="/blog" className="btn btn-secondary btn-sm">Back to Blog</Link>
        </div>

        {loading && <div>Loading...</div>}
        {error && (
          <div style={{ background: '#fee2e2', color: '#991b1b', padding: '10px 12px', borderRadius: 8, marginBottom: 16, border: '1px solid #fecaca' }}>{error}</div>
        )}

        {post && (
          <article className="card" style={{ padding: 16 }}>
            <h1 style={{ margin: 0 }}>{post.title}</h1>
            <div className="subtle" style={{ marginTop: 6 }}>{post.createdAt ? new Date(post.createdAt).toLocaleString() : ''}</div>
            {(post.coverImage || post.thumbnail) && (
              <div style={{ width: '100%', paddingTop: '40%', position: 'relative', borderRadius: 8, overflow: 'hidden', background: '#f7f7f7', marginTop: 12 }}>
                <img alt={post.title} src={post.coverImage || post.thumbnail} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}
            <div style={{ marginTop: 16, whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{post.content}</div>
            {Array.isArray(post.tags) && post.tags.length > 0 && (
              <div style={{ marginTop: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {post.tags.map((t) => (
                  <span key={t} className="chip">#{t}</span>
                ))}
              </div>
            )}
          </article>
        )}
      </main>
    </div>
  );
}
