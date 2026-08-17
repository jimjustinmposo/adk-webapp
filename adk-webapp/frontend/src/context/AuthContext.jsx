import React, { createContext, useContext, useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const AuthContext = createContext(null);

// If the browser has been fully closed (not just the tab backgrounded) for
// longer than this, the session is considered expired and the user is
// logged out the next time the app loads.
const CLOSED_SESSION_TIMEOUT_MS = 60 * 60 * 1000; // 1 hour

function loadInitialSession() {
  const token = localStorage.getItem('adk_token');
  const lastActive = localStorage.getItem('adk_last_active');

  if (token && lastActive && Date.now() - Number(lastActive) > CLOSED_SESSION_TIMEOUT_MS) {
    localStorage.removeItem('adk_token');
    localStorage.removeItem('adk_user');
    localStorage.removeItem('adk_last_active');
    return { token: null, user: null };
  }

  let user = null;
  try {
    const raw = localStorage.getItem('adk_user');
    user = raw ? JSON.parse(raw) : null;
  } catch {
    user = null;
  }
  return { token: token || null, user };
}

// Computed once when the app first loads (i.e. once per real page load,
// which is exactly when we want to check "was the browser closed too long").
const initialSession = loadInitialSession();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(initialSession.token);
  const [user, setUser] = useState(initialSession.user);

  // Stamp "last active" the moment the tab/browser is actually closed or
  // navigated away from (not on ordinary in-app navigation, which stays on
  // the same document and never fires these events).
  useEffect(() => {
    const markLastActive = () => {
      if (localStorage.getItem('adk_token')) {
        localStorage.setItem('adk_last_active', String(Date.now()));
      }
    };
    window.addEventListener('pagehide', markLastActive);
    window.addEventListener('beforeunload', markLastActive);
    return () => {
      window.removeEventListener('pagehide', markLastActive);
      window.removeEventListener('beforeunload', markLastActive);
    };
  }, []);

  const login = (newToken, newUser) => {
    localStorage.setItem('adk_token', newToken);
    localStorage.setItem('adk_user', JSON.stringify(newUser));
    localStorage.setItem('adk_last_active', String(Date.now()));
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('adk_token');
    localStorage.removeItem('adk_user');
    localStorage.removeItem('adk_last_active');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated: !!token,
        isAdmin: !!user?.adminrights,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

// Guards pages that only admins should be able to open. Standard users are
// bounced to the dashboard even if they type the URL directly.
export function AdminRoute({ children }) {
  const { isAuthenticated, isAdmin } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
