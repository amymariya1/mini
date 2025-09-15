import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { adminLogin } from '../services/api';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await adminLogin({ email, password });
      // store token for protected admin calls
      if (data?.token) localStorage.setItem('mm_admin_token', data.token);
      if (data?.admin) localStorage.setItem('mm_admin', JSON.stringify(data.admin));
      // Redirect to admin dashboard after successful login
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container" style={{ maxWidth: 420, margin: '60px auto' }}>
      <h2>Admin Login</h2>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
        <label>
          <div>Email</div>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          <div>Password</div>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        {error && <div style={{ color: 'red' }}>{error}</div>}
        <button type="submit" disabled={loading} className="primary-btn">
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
        <div style={{ marginTop: 8 }}>
          <span>Don't have an admin account? </span>
          <Link to="/admin/register">Register here</Link>
        </div>
      </form>
    </div>
  );
}