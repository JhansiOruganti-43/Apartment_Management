import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

function Login() {
  const { login } = useAuth();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('http://127.0.0.1:5000/api/login', form);
      if (res.data.success) {
        login(res.data);
      }
    } catch (err) {
      setError('Invalid username or password. Try admin / admin123');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page d-flex align-items-center justify-content-center min-vh-100">
      <div className="login-card glass-card p-5" style={{ width: '100%', maxWidth: '420px' }}>
        {/* Logo */}
        <div className="text-center mb-4">
          <div className="login-logo mx-auto mb-3">
            <i className="bi bi-buildings-fill fs-1"></i>
          </div>
          <h2 className="fw-bold mb-1">Apt Manager</h2>
          <p className="text-muted small">Apartment Management System</p>
        </div>

        {error && (
          <div className="alert alert-danger py-2 small border-0" style={{ background: 'rgba(220,53,69,0.15)', color: '#f87171' }}>
            <i className="bi bi-exclamation-circle me-2"></i>{error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label text-muted small">Username</label>
            <div className="input-group">
              <span className="input-group-text login-input-icon"><i className="bi bi-person"></i></span>
              <input
                type="text"
                className="form-control"
                placeholder="Enter username"
                value={form.username}
                onChange={e => setForm({ ...form, username: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="form-label text-muted small">Password</label>
            <div className="input-group">
              <span className="input-group-text login-input-icon"><i className="bi bi-lock"></i></span>
              <input
                type="password"
                className="form-control"
                placeholder="Enter password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>
          </div>
          <button
            type="submit"
            className="btn btn-primary-gradient w-100 py-3 fw-bold"
            disabled={loading}
          >
            {loading ? (
              <span className="spinner-border spinner-border-sm me-2"></span>
            ) : (
              <i className="bi bi-box-arrow-in-right me-2"></i>
            )}
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-4 pt-3 border-top border-secondary">
          <p className="text-muted small text-center mb-2">Demo Credentials:</p>
          <div className="d-flex gap-2 justify-content-center">
            <span className="badge bg-dark border border-secondary text-primary px-3 py-2">
              <i className="bi bi-shield-fill me-1"></i>admin / admin123
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
