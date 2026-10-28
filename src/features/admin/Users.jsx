import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { listUsers, setUserRoles, setUserStatus } from '../../api/admin.js';
import StatusBadge from '../../components/StatusBadge.jsx';
import { ROLE_LABELS } from '../../utils/roles.js';

export default function Users() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  const load = useCallback(() => listUsers(user).then(setUsers), [user]);

  useEffect(() => {
    load();
  }, [load]);

  async function run(action) {
    setError('');
    try {
      await action();
    } catch (err) {
      setError(err.message);
    }
    load();
  }

  function toggleRole(u, role) {
    const roles = u.roles.includes(role) ? u.roles.filter((r) => r !== role) : [...u.roles, role];
    run(() => setUserRoles(user, u.id, roles));
  }

  const query = search.trim().toLowerCase();
  // Pending accounts first so new registrations are easy to activate.
  const visible = users
    .filter((u) => u.name.toLowerCase().includes(query) || u.email.includes(query))
    .sort((a, b) => (a.status === 'pending' ? -1 : 0) - (b.status === 'pending' ? -1 : 0));

  return (
    <>
      <h1>Users and Roles</h1>
      {error && <div className="alert alert-error">{error}</div>}
      <div className="field" style={{ maxWidth: 360 }}>
        <input type="search" placeholder="Search by name or email" aria-label="Search users" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>User</th>
              <th>Status</th>
              <th>Roles</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {visible.map((u) => (
              <tr key={u.id}>
                <td>
                  {u.name}
                  <div className="muted">{u.email}</div>
                </td>
                <td>
                  <StatusBadge status={u.status} />
                </td>
                <td>
                  {Object.entries(ROLE_LABELS).map(([role, label]) => (
                    <label key={role} style={{ display: 'block' }}>
                      <input type="checkbox" checked={u.roles.includes(role)} onChange={() => toggleRole(u, role)} /> {label}
                    </label>
                  ))}
                </td>
                <td>
                  {u.status === 'active' ? (
                    <button className="btn btn-small" onClick={() => run(() => setUserStatus(user, u.id, 'inactive'))}>
                      Deactivate
                    </button>
                  ) : (
                    <button className="btn btn-small btn-primary" onClick={() => run(() => setUserStatus(user, u.id, 'active'))}>
                      Activate
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
