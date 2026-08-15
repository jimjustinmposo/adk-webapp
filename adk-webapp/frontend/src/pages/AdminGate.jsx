import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowRight, AlertCircle } from 'lucide-react';
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
          Incorrect administrator password. Please contact{' '}
          <strong>Jim Justin M. Poso (Webapp Developer)</strong> at{' '}
          <strong>050195318</strong> to authorize account creation.
        </>
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-logo-wrap">
          <img src="/images/logo.jpeg" alt="Alpha Delta Kennel" className="auth-logo-img" />
        </div>
        <h1>Admin Authorization</h1>
        <p className="subtitle">Enter the master administrative pass to register an account</p>

        {errorHtml && (
          <div className="error-msg">
            <AlertCircle style={{ width: 20, height: 20, flexShrink: 0 }} />
            <div>{errorHtml}</div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="adminPassword">Master Admin Password</label>
            <input
              type="password"
              id="adminPassword"
              required
              autoFocus
              placeholder="Enter master authorization pass"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 8 }} disabled={loading}>
            <ShieldCheck />
            <span>{loading ? 'Verifying Authorization...' : 'Verify & Continue'}</span>
          </button>
        </form>

        <div className="link-row">
          <Link to="/login">← Return to Login</Link>
        </div>
      </div>
    </div>
  );
}
