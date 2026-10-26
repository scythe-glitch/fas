import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { navFor } from '../routes.js';
import { roleLabel } from '../utils/roles.js';

export default function Home() {
  const { user } = useAuth();
  const links = navFor(user);

  return (
    <>
      <h1>Welcome, {user.name}</h1>
      <p className="muted">Signed in as {user.roles.map(roleLabel).join(', ')}.</p>

      {links.length === 0 ? (
        <p>No features are available for your role yet.</p>
      ) : (
        <div className="link-grid">
          {links.map((r) => (
            <Link key={r.path} to={`/${r.path}`} className="card link-card">
              <strong>{r.nav}</strong>
              <span className="muted">{r.description}</span>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
