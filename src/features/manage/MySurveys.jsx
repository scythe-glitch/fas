import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { listManagedSurveys } from '../../api/surveys.js';
import StatusBadge from '../../components/StatusBadge.jsx';
import { formatDate, formatPct } from '../../utils/format.js';

export default function MySurveys() {
  const { user } = useAuth();
  const [surveys, setSurveys] = useState([]);

  useEffect(() => {
    listManagedSurveys(user).then(setSurveys);
  }, [user]);

  return (
    <>
      <div className="page-header">
        <h1>Manage Surveys</h1>
        <Link className="btn btn-primary" to="/manage/new">
          + New survey
        </Link>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Survey</th>
              <th>Target</th>
              <th>Term</th>
              <th>Closes</th>
              <th>Status</th>
              <th>Responses</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {surveys.map((s) => {
              const rate = s.audience.length ? (100 * s.responseCount) / s.audience.length : null;
              return (
                <tr key={s.id}>
                  <td>{s.title || <em className="muted">Untitled</em>}</td>
                  <td>{s.target?.name ?? '—'}</td>
                  <td>{s.term || '—'}</td>
                  <td>{formatDate(s.closingAt)}</td>
                  <td>
                    <StatusBadge status={s.state} />
                  </td>
                  <td>
                    {s.responseCount} / {s.audience.length} <span className="muted">({formatPct(rate)})</span>
                  </td>
                  <td>
                    <Link className="btn btn-small" to={`/manage/${s.id}`}>
                      Open
                    </Link>
                  </td>
                </tr>
              );
            })}
            {surveys.length === 0 && (
              <tr>
                <td colSpan={7} className="muted">
                  You have not created any surveys yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
