// Update this once your backend is deployed on Railway, e.g.
// const API_BASE_URL = 'https://your-app.up.railway.app/api';
const API_BASE_URL = 'https://adk-webapp-production.up.railway.app/api';

async function apiRequest(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = localStorage.getItem('adk_token');
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || data.message || 'Something went wrong.');
  }
  return data;
}

function getCurrentUser() {
  const raw = localStorage.getItem('adk_user');
  return raw ? JSON.parse(raw) : null;
}

function requireLogin() {
  if (!localStorage.getItem('adk_token')) {
    window.location.href = 'index.html';
  }
}

function logout() {
  localStorage.removeItem('adk_token');
  localStorage.removeItem('adk_user');
  window.location.href = 'index.html';
}

function renderSidebarProfile() {
  const user = getCurrentUser();
  if (!user) return;
  const nameEl = document.getElementById('sidebarName');
  const roleEl = document.getElementById('sidebarRole');
  if (nameEl) nameEl.textContent = `Welcome ${user.nickname}`;
  if (roleEl) roleEl.textContent = user.adminrights ? 'Admin' : 'Not admin';
}
