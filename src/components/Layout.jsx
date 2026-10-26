import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { navFor } from '../routes.js';
import { roleLabel } from '../utils/roles.js';

export default function Layout() {
  const { user, logout } = useAuth();

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          FAS
          <small>Feedback Analytics System</small>
        </div>
        <nav>
          <NavLink to="/" end>
            Home
          </NavLink>
          {navFor(user).map((r) => (
            <NavLink key={r.path} to={`/${r.path}`}>
              {r.nav}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="main">
        <header className="topbar">
          <span>
            {user.name} <span className="muted">· {user.roles.map(roleLabel).join(', ')}</span>
          </span>
          <button className="btn btn-small" onClick={logout}>
            Logout
          </button>
        </header>
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
