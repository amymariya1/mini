import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  adminListUsers,
  adminDeleteUser,
  adminUpdateUser,
  adminLogout,
} from '../services/api';

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const navigate = useNavigate();

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

  useEffect(() => {
    loadUsers();
  }, []);

  async function handleDelete(id) {
    if (!window.confirm('Delete this user?')) return;
    try {
      await adminDeleteUser(id);
      setInfo('User deleted');
      await loadUsers();
    } catch (err) {
      setError(err.message || 'Delete failed');
    }
  }

  async function handleEdit(u) {
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

  async function handleLogout() {
    try {
      await adminLogout();
    } catch (_) {}
    localStorage.removeItem('mm_admin_token');
    localStorage.removeItem('mm_admin');
    navigate('/admin/login');
  }

  return (
    <div className="container" style={{ maxWidth: 1000, margin: '30px auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <h2>Admin Dashboard</h2>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Link to="/">Back to site</Link>
          <button className="cta-btn secondary" onClick={loadUsers} disabled={loading}>Refresh</button>
          <button className="primary-btn" onClick={handleLogout}>Logout</button>
        </div>
      </div>

      {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
      {info && <div style={{ color: 'green', marginBottom: 12 }}>{info}</div>}

      {loading ? (
        <div>Loading users...</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid #ddd' }}>
                <th style={{ padding: '8px 6px' }}>Name</th>
                <th style={{ padding: '8px 6px' }}>Email</th>
                <th style={{ padding: '8px 6px' }}>Created</th>
                <th style={{ padding: '8px 6px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 && (
                <tr><td colSpan={4} style={{ padding: 12, textAlign: 'center' }}>No users found</td></tr>
              )}
              {users.map((u) => (
                <tr key={u._id || u.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '8px 6px' }}>{u.name || '-'}</td>
                  <td style={{ padding: '8px 6px' }}>{u.email || '-'}</td>
                  <td style={{ padding: '8px 6px' }}>{u.createdAt ? new Date(u.createdAt).toLocaleString() : '-'}</td>
                  <td style={{ padding: '8px 6px', display: 'flex', gap: 8 }}>
                    <button className="cta-btn secondary" onClick={() => handleEdit(u)}>Edit</button>
                    <button className="cta-btn" onClick={() => handleDelete(u._id || u.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}