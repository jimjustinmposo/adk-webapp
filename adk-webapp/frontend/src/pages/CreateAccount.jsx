import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, AlertCircle } from 'lucide-react';
import { apiRequest } from '../api/client';

export default function CreateAccount() {
  const [formData, setFormData] = useState({
    fullname: '',
    nickname: '',
    designation: '',
    adminrights: false,
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const adminPass = sessionStorage.getItem('adk_admin_pass');

  useEffect(() => {
    if (!adminPass) {
      navigate('/admin-gate', { replace: true });
    }
  }, [adminPass, navigate]);

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await apiRequest('/auth/register', {
        method: 'POST',
        auth: false,
        body: {
          adminPassword: adminPass,
          fullname: formData.fullname.trim(),
          nickname: formData.nickname.trim(),
          designation: formData.designation.trim(),
          username: formData.username.trim(),
          password: formData.password,
          adminrights: formData.adminrights
        }
      });

      sessionStorage.removeItem('adk_admin_pass');
      alert('Account successfully created! You may now sign in.');
      navigate('/login');
    } catch (err) {
      setError(err.message || 'Failed to create user account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card" style={{ maxWidth: '460px' }}>
        <div className="auth-logo-wrap">
          <img src="/images/logo.jpeg" alt="Alpha Delta Kennel" className="auth-logo-img" />
        </div>
        <h1>Create Staff Account</h1>
        <p className="subtitle">Register authorized kennel management credentials</p>

        {error && (
          <div className="error-msg">
            <AlertCircle style={{ width: 18, height: 18, flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="fullname">Full Name</label>
            <input
              type="text"
              id="fullname"
              required
              placeholder="e.g. Johnathan Doe"
              value={formData.fullname}
              onChange={handleChange}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="field">
              <label htmlFor="nickname">Nickname</label>
              <input
                type="text"
                id="nickname"
                required
                placeholder="e.g. John"
                value={formData.nickname}
                onChange={handleChange}
              />
            </div>

            <div className="field">
              <label htmlFor="designation">Designation</label>
              <input
                type="text"
                id="designation"
                placeholder="e.g. Kennel Master"
                value={formData.designation}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="checkbox-row" style={{ background: 'var(--blue-50)', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--blue-100)' }}>
            <input
              type="checkbox"
              id="adminrights"
              checked={formData.adminrights}
              onChange={handleChange}
            />
            <label htmlFor="adminrights" style={{ color: 'var(--blue-950)', fontWeight: 600 }}>
              Grant Administrator Privileges
            </label>
          </div>

          <div className="field">
            <label htmlFor="username">Account Username</label>
            <input
              type="text"
              id="username"
              required
              placeholder="Choose a login username"
              value={formData.username}
              onChange={handleChange}
            />
          </div>

          <div className="field">
            <label htmlFor="password">Login Password</label>
            <input
              type="password"
              id="password"
              required
              minLength={6}
              placeholder="Minimum 6 characters"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 8 }} disabled={loading}>
            <UserPlus />
            <span>{loading ? 'Creating Account...' : 'Complete Registration'}</span>
          </button>
        </form>

        <div className="link-row">
          <Link to="/login">← Cancel & Back to Login</Link>
        </div>
      </div>
    </div>
  );
}
