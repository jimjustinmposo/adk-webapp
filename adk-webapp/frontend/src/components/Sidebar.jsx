import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutGrid,
  List,
  Tag,
  Heart,
  FileText,
  LogOut,
  User,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const [navOpen, setNavOpen] = useState(false);

  const toggleNav = () => setNavOpen(prev => !prev);
  const closeNav = () => setNavOpen(false);

  return (
    <aside className={`sidebar ${navOpen ? 'nav-open' : ''}`}>
      {/* Mobile Toggle Button */}
      <button
        className="menu-toggle"
        type="button"
        aria-label="Toggle navigation menu"
        aria-expanded={navOpen}
        onClick={toggleNav}
      >
        {navOpen ? <X style={{ width: 22, height: 22 }} /> : <Menu style={{ width: 22, height: 22 }} />}
      </button>

      {/* Brand Header */}
      <div className="sidebar-brand">
        <img src="/images/logo.jpeg" alt="Alpha Delta Kennel Logo" />
        <div>
          <div className="sidebar-brand-title">Alpha Delta Kennel</div>
          <div className="sidebar-brand-sub">Management Suite</div>
        </div>
      </div>

      {/* User Profile Card */}
      <div className="sidebar-profile">
        <div className="sidebar-avatar">
          <User />
        </div>
        <div>
          <div className="sidebar-name" title={user?.nickname ? `Welcome ${user.nickname}` : 'Welcome'}>
            {user?.nickname ? `Welcome ${user.nickname}` : 'Welcome'}
          </div>
          <div className="sidebar-role-badge">
            <span className="sidebar-role-dot" />
            <span>{user?.adminrights ? 'Administrator' : 'Standard User'}</span>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="sidebar-nav">
        <NavLink
          to="/dashboard"
          className={({ isActive }) => (isActive ? 'active' : '')}
          onClick={closeNav}
        >
          <LayoutGrid />
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/dogs"
          className={({ isActive }) => (isActive ? 'active' : '')}
          onClick={closeNav}
        >
          <List />
          <span>Animals Database</span>
        </NavLink>

        <NavLink
          to="/sold"
          className={({ isActive }) => (isActive ? 'active' : '')}
          onClick={closeNav}
        >
          <Tag />
          <span>Sold Animals</span>
        </NavLink>

        <NavLink
          to="/adopted"
          className={({ isActive }) => (isActive ? 'active' : '')}
          onClick={closeNav}
        >
          <Heart />
          <span>Adopted Animals</span>
        </NavLink>

        <NavLink
          to="/reports"
          className={({ isActive }) => (isActive ? 'active' : '')}
          onClick={closeNav}
        >
          <FileText />
          <span>Reports & Exports</span>
        </NavLink>
      </nav>

      {/* Logout Action */}
      <button className="sidebar-logout" type="button" onClick={logout}>
        <LogOut />
        <span>Sign Out</span>
      </button>
    </aside>
  );
}
