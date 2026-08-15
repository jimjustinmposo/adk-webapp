import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiRequest } from '../api/client';

export default function AdminGate() {
  const [adminPassword, setAdminPassword] = useState('');
  const [errorHtml, setErrorHtml] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorHtml(null);
    setLoading(true);

    try {
      await apiRequest('/auth/verify-admin-password', {
        method: 'POST',
        auth: false,
        body: { password: adminPassword }
      });

      sessionStorage.setItem('adk_admin_pass', adminPassword);
      navigate('/create-account');
    } catch {
      setErrorHtml(
        <>
          Incorrect password, please contact{' '}
          <strong>Jim Justin M. Poso (Webapp Developer)</strong> at{' '}
          <strong>050195318</strong> to create a new account.
        </>
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <h1>Welcome to Alpha Delta Kennel</h1>
        <p className="subtitle">Create new account page pass</p>

        {errorHtml && <div className="error-msg">{errorHtml}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="adminPassword">Admin Password</label>
            <input
              type="password"
              id="adminPassword"
              required
              autoFocus
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Checking...' : 'Continue'}
          </button>
        </form>

        <div className="link-row">
          <Link to="/login">Back to login</Link>
        </div>
      </div>
    </div>
  );
}
