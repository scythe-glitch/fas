import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { getSurveyResults } from '../../api/analytics.js';
import StatusBadge from '../../components/StatusBadge.jsx';
import { MIN_ANSWERS, percent } from '../../utils/analytics.js';
import { formatDate, formatPct } from '../../utils/format.js';

function Bars({ stats }) {
  return stats.distribution.map((d) => {
    const p = percent(d.count, stats.denominator);
    return (
      <div className="bar-row" key={d.label}>
        <span>{d.label}</span>
        <div className="bar" aria-hidden="true">
          <span style={{ width: `${p ?? 0}%` }} />
        </div>
        <span>
          {d.count} ({formatPct(p)})
        </span>
      </div>
    );
  });
}

function QuestionResult({ stats, index }) {
  const q = stats.question;
  return (
    <div className="card">
      <h2>
        {index + 1}. {q.text}
      </h2>
      <p className="muted">{stats.answered} answered</p>
      {stats.suppressed ? (
        <div className="alert alert-info">
          Insufficient responses — results are hidden until at least {MIN_ANSWERS} answers are available.
        </div>
      ) : (
        <>
          {q.type === 'rating' && (
            <p>
              Mean rating: <strong>{stats.mean.toFixed(2)}</strong> / 5
            </p>
          )}
          {q.type === 'text' && (
            <p className="muted">
              Heuristic sentiment summary ({stats.classifier}), English only. Unclassified: {stats.unclassified}. Individual comments
              are not shown.
            </p>
          )}
          <Bars stats={stats} />
        </>
      )}
    </div>
  );
}

export default function SurveyResults() {
  const { id } = useParams();
  const { user } = useAuth();
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getSurveyResults(user, id)
      .then(setResult)
      .catch((err) => setError(err.message));
  }, [user, id]);

  if (error) return <div className="alert alert-error">{error}</div>;
  if (!result) return <p>Loading…</p>;

  return (
    <>
      <div className="page-header">
        <h1>{result.title}</h1>
        <Link to="/analytics">← Analytics</Link>
      </div>

      <div className="card stat-row">
        <div className="stat">
          <div className="muted">Status</div>
          <div className="value">
            <StatusBadge status={result.state} />
          </div>
        </div>
        <div className="stat">
          <div className="muted">Eligible</div>
          <div className="value">{result.eligible}</div>
        </div>
        <div className="stat">
          <div className="muted">Responses</div>
          <div className="value">{result.accepted}</div>
        </div>
        <div className="stat">
          <div className="muted">Response rate</div>
          <div className="value">{formatPct(result.rate)}</div>
        </div>
      </div>
      <p className="muted">
        {result.target?.name} · {result.term} · {formatDate(result.openingAt)} – {formatDate(result.closingAt)}
      </p>

      {result.stats.map((s, i) => (
        <QuestionResult key={s.question.id} stats={s} index={i} />
      ))}
    </>
  );
}
