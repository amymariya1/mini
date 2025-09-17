import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  // Users
  adminListUsers,
  adminDeleteUser,
  adminUpdateUser,
  adminLogout,
  // Products
  adminListProducts,
  adminCreateProduct,
  adminUpdateProduct,
  adminDeleteProduct,
  // Posts
  adminListPosts,
  adminCreatePost,
  adminUpdatePost,
  adminDeletePost,
  // Messages
  adminListMessages,
  adminDeleteMessage,
  // Questions
  adminListQuestions,
  adminCreateQuestion,
  adminUpdateQuestion,
  adminDeleteQuestion,
} from '../services/api';

export default function AdminDashboard() {
  const [tab, setTab] = useState('users'); // users | products | posts | messages | questions

  // Shared
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const navigate = useNavigate();

  // Users state
  const [users, setUsers] = useState([]);
  const [userQuery, setUserQuery] = useState('');

  // Products state
  const [products, setProducts] = useState([]);

  // Posts state
  const [posts, setPosts] = useState([]);

  // Messages state
  const [messages, setMessages] = useState([]);

  // Questions state
  const [questions, setQuestions] = useState([]);
  const [questionFilterActive, setQuestionFilterActive] = useState('all'); // all | active | inactive

  // ===== Loaders =====
  async function loadUsers() {
    setError('');
    setLoading(true);
    try {
      const data = await adminListUsers();
      setUsers(data.users || []);
    } catch (err) {
      setError(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }

  async function loadProducts() {
    setError('');
    setLoading(true);
    try {
      const data = await adminListProducts();
      setProducts(data.products || []);
    } catch (err) {
      setError(err.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }

  async function loadPosts() {
    setError('');
    setLoading(true);
    try {
      const data = await adminListPosts();
      setPosts(data.posts || []);
    } catch (err) {
      setError(err.message || 'Failed to load posts');
    } finally {
      setLoading(false);
    }
  }

  async function loadMessages() {
    setError('');
    setLoading(true);
    try {
      const data = await adminListMessages({ room: 'global', limit: 200 });
      setMessages(data.messages || []);
    } catch (err) {
      setError(err.message || 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  }

  async function loadQuestions() {
    setError('');
    setLoading(true);
    try {
      const params = {};
      if (questionFilterActive !== 'all') params.active = (questionFilterActive === 'active');
      const data = await adminListQuestions(params);
      setQuestions(data.questions || []);
    } catch (err) {
      setError(err.message || 'Failed to load questions');
    } finally {
      setLoading(false);
    }
  }

  // Initial + tab changes
  useEffect(() => {
    if (tab === 'users') loadUsers();
    if (tab === 'products') loadProducts();
    if (tab === 'posts') loadPosts();
    if (tab === 'messages') loadMessages();
    if (tab === 'questions') loadQuestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, questionFilterActive]);

  // ===== Users handlers =====
  const filteredUsers = useMemo(() => {
    const q = userQuery.trim().toLowerCase();
    if (!q) return users;
    return users.filter(u => (u.name || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q));
  }, [users, userQuery]);

  async function handleUserDelete(id) {
    if (!window.confirm('Delete this user?')) return;
    try {
      await adminDeleteUser(id);
      setInfo('User deleted');
      await loadUsers();
    } catch (err) {
      setError(err.message || 'Delete failed');
    }
  }

  async function handleUserEdit(u) {
    const name = window.prompt('Name', u.name || '');
    if (name === null) return;
    const email = window.prompt('Email', u.email || '');
    if (email === null) return;
    try {
      await adminUpdateUser(u._id || u.id, { name, email });
      setInfo('User updated');
      await loadUsers();
    } catch (err) {
      setError(err.message || 'Update failed');
    }
  }

  // ===== Products handlers =====
  async function handleProductCreate() {
    const name = window.prompt('Product name');
    if (!name) return;
    const priceStr = window.prompt('Price', '0');
    if (priceStr === null) return;
    const price = Number(priceStr) || 0;
    const category = window.prompt('Category', 'General') || 'General';
    try {
      await adminCreateProduct({ name, price, category });
      setInfo('Product created');
      await loadProducts();
    } catch (err) {
      setError(err.message || 'Create failed');
    }
  }

  async function handleProductEdit(p) {
    const name = window.prompt('Product name', p.name || '');
    if (name === null) return;
    const priceStr = window.prompt('Price', String(p.price ?? 0));
    if (priceStr === null) return;
    const price = Number(priceStr) || 0;
    const category = window.prompt('Category', p.category || 'General');
    if (category === null) return;
    try {
      await adminUpdateProduct(p._id || p.id, { name, price, category });
      setInfo('Product updated');
      await loadProducts();
    } catch (err) {
      setError(err.message || 'Update failed');
    }
  }

  async function handleProductDelete(id) {
    if (!window.confirm('Delete this product?')) return;
    try {
      await adminDeleteProduct(id);
      setInfo('Product deleted');
      await loadProducts();
    } catch (err) {
      setError(err.message || 'Delete failed');
    }
  }

  // ===== Posts handlers =====
  async function handlePostCreate() {
    const title = window.prompt('Post title');
    if (!title) return;
    const content = window.prompt('Post content');
    if (content === null) return;
    try {
      await adminCreatePost({ title, content, published: true });
      setInfo('Post created');
      await loadPosts();
    } catch (err) {
      setError(err.message || 'Create failed');
    }
  }

  async function handlePostEdit(post) {
    const title = window.prompt('Post title', post.title || '');
    if (title === null) return;
    const content = window.prompt('Post content', post.content || '');
    if (content === null) return;
    const published = window.confirm('Publish this post? OK = published, Cancel = draft');
    try {
      await adminUpdatePost(post._id || post.id, { title, content, published });
      setInfo('Post updated');
      await loadPosts();
    } catch (err) {
      setError(err.message || 'Update failed');
    }
  }

  async function handlePostDelete(id) {
    if (!window.confirm('Delete this post?')) return;
    try {
      await adminDeletePost(id);
      setInfo('Post deleted');
      await loadPosts();
    } catch (err) {
      setError(err.message || 'Delete failed');
    }
  }

  // ===== Messages handlers =====
  async function handleMessageDelete(id) {
    if (!window.confirm('Delete this message?')) return;
    try {
      await adminDeleteMessage(id);
      setInfo('Message deleted');
      await loadMessages();
    } catch (err) {
      setError(err.message || 'Delete failed');
    }
  }

  // ===== Questions handlers =====
  async function handleQuestionCreate() {
    const text = window.prompt('Question text');
    if (!text) return;
    const scale = window.prompt("Scale (optional: D, A, S)", '');
    const orderStr = window.prompt('Order (number)', '0');
    if (orderStr === null) return;
    const order = Number(orderStr) || 0;
    const active = window.confirm('Mark as active? OK = Yes');
    try {
      await adminCreateQuestion({ text, scale: (scale || '').toUpperCase(), order, active, category: 'mindcheck' });
      setInfo('Question created');
      await loadQuestions();
    } catch (err) {
      setError(err.message || 'Create failed');
    }
  }

  async function handleQuestionEdit(q) {
    const text = window.prompt('Question text', q.text || '');
    if (text === null) return;
    const scale = window.prompt('Scale (D, A, S or empty)', q.scale || '');
    if (scale === null) return;
    const orderStr = window.prompt('Order (number)', String(q.order ?? 0));
    if (orderStr === null) return;
    const order = Number(orderStr) || 0;
    const active = window.confirm('Set active? OK = Yes, Cancel = No');
    try {
      await adminUpdateQuestion(q._id || q.id, { text, scale: (scale || '').toUpperCase(), order, active });
      setInfo('Question updated');
      await loadQuestions();
    } catch (err) {
      setError(err.message || 'Update failed');
    }
  }

  async function handleQuestionDelete(id) {
    if (!window.confirm('Delete this question?')) return;
    try {
      await adminDeleteQuestion(id);
      setInfo('Question deleted');
      await loadQuestions();
    } catch (err) {
      setError(err.message || 'Delete failed');
    }
  }

  async function handleLogout() {
    try { await adminLogout(); } catch (_) {}
    localStorage.removeItem('mm_admin_token');
    localStorage.removeItem('mm_admin');
    navigate('/login');
  }

  // Derived counts
  const statUsers = users.length;
  const statProducts = products.length;
  const statPosts = posts.length;

  return (
    <div style={{ maxWidth: 1200, margin: '30px auto', padding: '0 16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 18 }}>
        <div>
          <h2 style={{ fontSize: 28, lineHeight: 1.2 }}>Admin Dashboard</h2>
          <div className="subtle" style={{ marginTop: 4 }}>Manage users, products, blogs and chat</div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Link to="/" className="chip">Back to site</Link>
          <button className="cta-btn" onClick={handleLogout}>Logout</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:8, marginBottom: 14 }}>
        {['users','products','posts','messages','questions'].map(t => (
          <button
            key={t}
            className={`chip ${tab === t ? 'active' : ''}`}
            onClick={() => setTab(t)}
          >{t === 'posts' ? 'Blogs' : (t[0].toUpperCase() + t.slice(1))}</button>
        ))}
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 12, marginBottom: 16 }}>
        <div className="card"><div className="subtle">Users</div><div style={{ fontWeight: 800, fontSize: 22 }}>{statUsers}</div></div>
        <div className="card"><div className="subtle">Products</div><div style={{ fontWeight: 800, fontSize: 22 }}>{statProducts}</div></div>
        <div className="card"><div className="subtle">Blogs</div><div style={{ fontWeight: 800, fontSize: 22 }}>{statPosts}</div></div>
        <div className="card"><div className="subtle">Loading</div><div style={{ fontWeight: 800, fontSize: 22 }}>{loading ? '...' : '✓'}</div></div>
      </div>

      {/* Alerts */}
      {error && <div style={{ background:'#fee2e2', color:'#991b1b', border:'1px solid #fecaca', padding:10, borderRadius:10, marginBottom:12 }}>{error}</div>}
      {info && <div style={{ background:'#ecfdf5', color:'#065f46', border:'1px solid #a7f3d0', padding:10, borderRadius:10, marginBottom:12 }}>{info}</div>}

      {tab === 'users' && (
        <div className="card-pro">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 10 }}>
            <div style={{ fontWeight: 800 }}>Users</div>
            <div style={{ display:'flex', gap:8, alignItems:'center' }}>
              <input className="input" placeholder="Search name or email..." value={userQuery} onChange={e => setUserQuery(e.target.value)} />
              <button className="cta-btn secondary" onClick={loadUsers} disabled={loading}>Refresh</button>
            </div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
              <thead>
                <tr>
                  {['Name','Email','Created','Actions'].map(h => (
                    <th key={h} style={{ textAlign:'left', padding: '12px 10px', borderBottom: '1px solid var(--border)', background:'#fafafa', position:'sticky', top:0 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 && !loading && (
                  <tr><td colSpan={4} style={{ padding: 16, textAlign: 'center' }}>No users found</td></tr>
                )}
                {filteredUsers.map((u, idx) => (
                  <tr key={u._id || u.id} style={{ borderBottom: '1px solid #f0f0f0', background: idx % 2 ? '#fff' : '#fcfcff' }}>
                    <td style={{ padding: '10px 10px', fontWeight: 600 }}>{u.name || '-'}</td>
                    <td style={{ padding: '10px 10px' }}>{u.email || '-'}</td>
                    <td style={{ padding: '10px 10px' }}>{u.createdAt ? new Date(u.createdAt).toLocaleString() : '-'}</td>
                    <td style={{ padding: '10px 10px', display: 'flex', gap: 8 }}>
                      <button className="cta-btn secondary" onClick={() => handleUserEdit(u)}>Edit</button>
                      <button className="cta-btn" onClick={() => handleUserDelete(u._id || u.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'products' && (
        <div className="card-pro">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 10 }}>
            <div style={{ fontWeight: 800 }}>Products</div>
            <div style={{ display:'flex', gap:8, alignItems:'center' }}>
              <button className="cta-btn" onClick={handleProductCreate}>Add Product</button>
              <button className="cta-btn secondary" onClick={loadProducts} disabled={loading}>Refresh</button>
            </div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
              <thead>
                <tr>
                  {['Name','Category','Price','In Stock','Created','Actions'].map(h => (
                    <th key={h} style={{ textAlign:'left', padding: '12px 10px', borderBottom: '1px solid var(--border)', background:'#fafafa', position:'sticky', top:0 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.length === 0 && !loading && (
                  <tr><td colSpan={6} style={{ padding: 16, textAlign: 'center' }}>No products</td></tr>
                )}
                {products.map((p, idx) => (
                  <tr key={p._id || p.id} style={{ borderBottom: '1px solid #f0f0f0', background: idx % 2 ? '#fff' : '#fcfcff' }}>
                    <td style={{ padding: '10px 10px', fontWeight: 600 }}>{p.name || '-'}</td>
                    <td style={{ padding: '10px 10px' }}>{p.category || '-'}</td>
                    <td style={{ padding: '10px 10px' }}>${Number(p.price || 0).toFixed(2)}</td>
                    <td style={{ padding: '10px 10px' }}>{p.inStock ? 'Yes' : 'No'}</td>
                    <td style={{ padding: '10px 10px' }}>{p.createdAt ? new Date(p.createdAt).toLocaleString() : '-'}</td>
                    <td style={{ padding: '10px 10px', display: 'flex', gap: 8 }}>
                      <button className="cta-btn secondary" onClick={() => handleProductEdit(p)}>Edit</button>
                      <button className="cta-btn" onClick={() => handleProductDelete(p._id || p.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'posts' && (
        <div className="card-pro">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 10 }}>
            <div style={{ fontWeight: 800 }}>Blogs</div>
            <div style={{ display:'flex', gap:8, alignItems:'center' }}>
              <button className="cta-btn" onClick={handlePostCreate}>Add Blog</button>
              <button className="cta-btn secondary" onClick={loadPosts} disabled={loading}>Refresh</button>
            </div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
              <thead>
                <tr>
                  {['Title','Published','Created','Actions'].map(h => (
                    <th key={h} style={{ textAlign:'left', padding: '12px 10px', borderBottom: '1px solid var(--border)', background:'#fafafa', position:'sticky', top:0 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {posts.length === 0 && !loading && (
                  <tr><td colSpan={4} style={{ padding: 16, textAlign: 'center' }}>No posts</td></tr>
                )}
                {posts.map((post, idx) => (
                  <tr key={post._id || post.id} style={{ borderBottom: '1px solid #f0f0f0', background: idx % 2 ? '#fff' : '#fcfcff' }}>
                    <td style={{ padding: '10px 10px', fontWeight: 600 }}>{post.title || '-'}</td>
                    <td style={{ padding: '10px 10px' }}>{post.published ? 'Yes' : 'No'}</td>
                    <td style={{ padding: '10px 10px' }}>{post.createdAt ? new Date(post.createdAt).toLocaleString() : '-'}</td>
                    <td style={{ padding: '10px 10px', display: 'flex', gap: 8 }}>
                      <button className="cta-btn secondary" onClick={() => handlePostEdit(post)}>Edit</button>
                      <button className="cta-btn" onClick={() => handlePostDelete(post._id || post.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'messages' && (
        <div className="card-pro">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 10 }}>
            <div style={{ fontWeight: 800 }}>Messages (global room)</div>
            <div style={{ display:'flex', gap:8, alignItems:'center' }}>
              <button className="cta-btn secondary" onClick={loadMessages} disabled={loading}>Refresh</button>
            </div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
              <thead>
                <tr>
                  {['Sender','Text','Time','Actions'].map(h => (
                    <th key={h} style={{ textAlign:'left', padding: '12px 10px', borderBottom: '1px solid var(--border)', background:'#fafafa', position:'sticky', top:0 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {messages.length === 0 && !loading && (
                  <tr><td colSpan={4} style={{ padding: 16, textAlign: 'center' }}>No messages</td></tr>
                )}
                {messages.map((m, idx) => (
                  <tr key={m._id || m.id} style={{ borderBottom: '1px solid #f0f0f0', background: idx % 2 ? '#fff' : '#fcfcff' }}>
                    <td style={{ padding: '10px 10px', fontWeight: 600 }}>{m.senderName || (m.sender && m.sender.name) || 'User'}</td>
                    <td style={{ padding: '10px 10px', maxWidth: 600, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{m.text}</td>
                    <td style={{ padding: '10px 10px' }}>{m.createdAt ? new Date(m.createdAt).toLocaleString() : '-'}</td>
                    <td style={{ padding: '10px 10px' }}>
                      <button className="cta-btn" onClick={() => handleMessageDelete(m._id || m.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'questions' && (
        <div className="card-pro">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 10 }}>
            <div style={{ fontWeight: 800 }}>Mind Check Questions</div>
            <div style={{ display:'flex', gap:8, alignItems:'center' }}>
              <button className="cta-btn" onClick={handleQuestionCreate}>Add Question</button>
              <select className="input" value={questionFilterActive} onChange={e => setQuestionFilterActive(e.target.value)}>
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <button className="cta-btn secondary" onClick={loadQuestions} disabled={loading}>Refresh</button>
            </div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
              <thead>
                <tr>
                  {['Text','Scale','Order','Active','Created','Actions'].map(h => (
                    <th key={h} style={{ textAlign:'left', padding: '12px 10px', borderBottom: '1px solid var(--border)', background:'#fafafa', position:'sticky', top:0 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {questions.length === 0 && !loading && (
                  <tr><td colSpan={6} style={{ padding: 16, textAlign: 'center' }}>No questions</td></tr>
                )}
                {questions.map((q, idx) => (
                  <tr key={q._id || q.id} style={{ borderBottom: '1px solid #f0f0f0', background: idx % 2 ? '#fff' : '#fcfcff' }}>
                    <td style={{ padding: '10px 10px', fontWeight: 600 }}>{q.text || '-'}</td>
                    <td style={{ padding: '10px 10px' }}>{q.scale || '-'}</td>
                    <td style={{ padding: '10px 10px' }}>{q.order ?? 0}</td>
                    <td style={{ padding: '10px 10px' }}>{q.active ? 'Yes' : 'No'}</td>
                    <td style={{ padding: '10px 10px' }}>{q.createdAt ? new Date(q.createdAt).toLocaleString() : '-'}</td>
                    <td style={{ padding: '10px 10px', display: 'flex', gap: 8 }}>
                      <button className="cta-btn secondary" onClick={() => handleQuestionEdit(q)}>Edit</button>
                      <button className="cta-btn" onClick={() => handleQuestionDelete(q._id || q.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
