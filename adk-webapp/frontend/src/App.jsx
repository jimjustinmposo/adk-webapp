import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './context/AuthContext';
import Layout from './components/Layout';

import Login from './pages/Login';
import AdminGate from './pages/AdminGate';
import CreateAccount from './pages/CreateAccount';
import Dashboard from './pages/Dashboard';
import Dogs from './pages/Dogs';
import Sold from './pages/Sold';
import Adopted from './pages/Adopted';
import Reports from './pages/Reports';

export default function App() {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/admin-gate" element={<AdminGate />} />
      <Route path="/create-account" element={<CreateAccount />} />

      {/* Protected App Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="dogs" element={<Dogs />} />
        <Route path="sold" element={<Sold />} />
        <Route path="adopted" element={<Adopted />} />
        <Route path="reports" element={<Reports />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
