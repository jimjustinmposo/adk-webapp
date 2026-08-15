import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutGrid, List, Tag, Heart, FileText, LogOut, User, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const [navOpen, setNavOpen] = useState(false);

  const toggleNav = () => setNavOpen(prev => !prev);
  const closeNav = () => setNavOpen(false);

  return (
    <aside className={`sidebar ${navOpen ? 'nav-open' : ''}`}>
      <button
        className="menu-toggle"
        type="button"
        aria-label="Open menu"
        aria-expanded={navOpen}
        onClick={toggleNav}
      >
        <Menu />
      </button>

      <div className="sidebar-profile">
        <div className="sidebar-avatar">
          <User />
        </div>
        <div>
          <div className="sidebar-name">
            {user?.nickname ? `Welcome ${user.nickname}` : 'Welcome'}
          </div>
          <div className="sidebar-role">
            {user?.adminrights ? 'Admin' : 'Not admin'}
          </div>
        </div>
      </div>

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
          <span>Dogs</span>
        </NavLink>

        <NavLink
          to="/sold"
          className={({ isActive }) => (isActive ? 'active' : '')}
          onClick={closeNav}
        >
          <Tag />
          <span>Sold</span>
        </NavLink>

        <NavLink
          to="/adopted"
          className={({ isActive }) => (isActive ? 'active' : '')}
          onClick={closeNav}
        >
          <Heart />
          <span>Adopted</span>
        </NavLink>

        <NavLink
          to="/reports"
          className={({ isActive }) => (isActive ? 'active' : '')}
          onClick={closeNav}
        >
          <FileText />
          <span>Reports</span>
        </NavLink>
      </nav>

      <button className="sidebar-logout" type="button" onClick={logout}>
        <LogOut />
        <span>Log out</span>
      </button>
    </aside>
  );
}
