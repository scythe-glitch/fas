import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { listAudit } from '../../api/admin.js';
import StatusBadge from '../../components/StatusBadge.jsx';
import { formatDate } from '../../utils/format.js';

export default function AuditLog() {
  const { user } = useAuth();
  const [entries, setEntries] = useState([]);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    listAudit(user).then(setEntries);
  }, [user]);

  const query = filter.trim().toLowerCase();
  const visible = entries.filter((a) => `${a.action} ${a.actorName} ${a.objectType} ${a.objectId}`.toLowerCase().includes(query));

  return (
    <>
      <h1>Audit Log</h1>
      <p className="muted">Read-only record of privileged actions. Entries cannot be edited or deleted.</p>
      <div className="field" style={{ maxWidth: 360 }}>
        <input type="search" placeholder="Filter by action, user or object" aria-label="Filter audit log" value={filter} onChange={(e) => setFilter(e.target.value)} />
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Time</th>
              <th>Actor</th>
              <th>Action</th>
              <th>Object</th>
              <th>Result</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((a) => (
              <tr key={a.id}>
                <td>{formatDate(a.at)}</td>
                <td>{a.actorName}</td>
                <td>{a.action}</td>
                <td>
                  {a.objectType} <span className="muted">{a.objectId}</span>
                </td>
                <td>
                  <StatusBadge status={a.result} />
                </td>
              </tr>
            ))}
            {visible.length === 0 && (
              <tr>
                <td colSpan={5} className="muted">
                  No audit entries yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
