import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { countUnread } from '../api/dashboard.js';
import { navFor } from '../routes.js';
import { roleLabel } from '../utils/roles.js';
import { InstituteBar, Logo } from './Brand.jsx';
import Icon from './Icon.jsx';

const NAV_ICONS = {
  surveys: 'clipboard',
  manage: 'edit',
  review: 'check',
  notifications: 'bell',
  analytics: 'chart',
  reports: 'file',
  'admin/users': 'users',
  'admin/audit': 'shield',
  'admin/policy': 'settings',
};

export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [unread, setUnread] = useState(0);

  // Refresh the bell whenever the page changes (e.g. after reading notifications).
  useEffect(() => {
    countUnread(user).then(setUnread);
  }, [user, location.pathname]);

  const roles = user.roles.map(roleLabel).join(', ');

  return (
    <div className="shell">
      <InstituteBar>
        <span className="role-pill">Role: {roles}</span>
      </InstituteBar>

      <header className="app-header">
        <Link to="/" className="app-header-brand">
          <Logo />
          <span className="app-title">
            <strong>Feedback Analytics System</strong>
            <small>Official Feedback Portal • The LNM Institute of Information Technology</small>
          </span>
        </Link>

        <div className="app-header-user">
          <Link to="/notifications" className="bell" aria-label={`Notifications (${unread} unread)`}>
            <Icon name="bell" size={22} />
            {unread > 0 && <span className="bell-dot" />}
          </Link>
          <span className="user-id">
            <strong>{user.name}</strong>
            <small>{user.email}</small>
          </span>
          <button className="btn btn-small btn-ghost" onClick={logout}>
            <Icon name="logout" size={16} /> Exit
          </button>
        </div>
      </header>

      <div className="app">
        <aside className="sidebar">
          <div className="sidebar-title">{roleLabel(user.roles[0])} menu</div>
          <nav>
            <NavLink to="/" end>
              <Icon name="grid" /> Dashboard
            </NavLink>
            {navFor(user).map((r) => (
              <NavLink key={r.path} to={`/${r.path}`}>
                <Icon name={NAV_ICONS[r.path] || 'file'} /> {r.nav}
              </NavLink>
            ))}
          </nav>
        </aside>

        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
