import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
      alert('Account created. You can now log in.');
      navigate('/login');
    } catch (err) {
      setError(err.message || 'Failed to create account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <h1>Welcome to Alpha Delta Kennel</h1>
        <p className="subtitle">Create new account page</p>

        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="fullname">Full Name</label>
            <input
              type="text"
              id="fullname"
              required
              value={formData.fullname}
              onChange={handleChange}
            />
          </div>

          <div className="field">
            <label htmlFor="nickname">Nick Name</label>
            <input
              type="text"
              id="nickname"
              required
              value={formData.nickname}
              onChange={handleChange}
            />
          </div>

          <div className="field">
            <label htmlFor="designation">Designation</label>
            <input
              type="text"
              id="designation"
              value={formData.designation}
              onChange={handleChange}
            />
          </div>

          <div className="checkbox-row">
            <input
              type="checkbox"
              id="adminrights"
              checked={formData.adminrights}
              onChange={handleChange}
            />
            <label htmlFor="adminrights">Admin Rights</label>
          </div>

          <div className="field">
            <label htmlFor="username">User Name</label>
            <input
              type="text"
              id="username"
              required
              value={formData.username}
              onChange={handleChange}
            />
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              required
              minLength={6}
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : 'Save'}
          </button>
        </form>
      </div>
    </div>
  );
}
