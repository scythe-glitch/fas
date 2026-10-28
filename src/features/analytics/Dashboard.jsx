import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { listAnalyticsSurveys } from '../../api/analytics.js';
import StatusBadge from '../../components/StatusBadge.jsx';
import { formatPct } from '../../utils/format.js';
import { responseRate } from '../../utils/analytics.js';

export default function Dashboard() {
  const { user } = useAuth();
  const [surveys, setSurveys] = useState([]);
  const [term, setTerm] = useState('');
  const [targetId, setTargetId] = useState('');
  const [showCancelled, setShowCancelled] = useState(false);

  useEffect(() => {
    listAnalyticsSurveys(user).then(setSurveys);
  }, [user]);

  const terms = [...new Set(surveys.map((s) => s.term))];
  const targets = [...new Map(surveys.map((s) => [s.target.id, s.target])).values()];
  const visible = surveys.filter(
    (s) => (!term || s.term === term) && (!targetId || s.targetId === targetId) && (showCancelled || s.status !== 'Cancelled'),
  );

  const eligible = visible.reduce((sum, s) => sum + s.eligible, 0);
  const accepted = visible.reduce((sum, s) => sum + s.accepted, 0);

  return (
    <>
      <h1>Analytics</h1>

      <div className="filters">
        <select aria-label="Target" value={targetId} onChange={(e) => setTargetId(e.target.value)}>
          <option value="">All targets</option>
          {targets.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
        <select aria-label="Term" value={term} onChange={(e) => setTerm(e.target.value)}>
          <option value="">All terms</option>
          {terms.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
        <label className="row">
          <input type="checkbox" checked={showCancelled} onChange={(e) => setShowCancelled(e.target.checked)} /> Include cancelled
        </label>
      </div>

      <div className="card stat-row">
        <div className="stat">
          <div className="muted">Surveys</div>
          <div className="value">{visible.length}</div>
        </div>
        <div className="stat">
          <div className="muted">Eligible respondents</div>
          <div className="value">{eligible}</div>
        </div>
        <div className="stat">
          <div className="muted">Responses</div>
          <div className="value">{accepted}</div>
        </div>
        <div className="stat">
          <div className="muted">Overall response rate</div>
          <div className="value">{formatPct(responseRate(accepted, eligible))}</div>
        </div>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Survey</th>
              <th>Target</th>
              <th>Term</th>
              <th>Status</th>
              <th>Responses</th>
              <th>Response rate</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {visible.map((s) => (
              <tr key={s.id}>
                <td>{s.title}</td>
                <td>{s.target?.name}</td>
                <td>{s.term}</td>
                <td>
                  <StatusBadge status={s.state} />
                </td>
                <td>
                  {s.accepted} / {s.eligible}
                </td>
                <td>{formatPct(s.rate)}</td>
                <td>
                  <Link className="btn btn-small" to={`/analytics/${s.id}`}>
                    Results
                  </Link>
                </td>
              </tr>
            ))}
            {visible.length === 0 && (
              <tr>
                <td colSpan={7} className="muted">
                  No surveys in your reporting scope match these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
