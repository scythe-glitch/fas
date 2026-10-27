import StatusBadge from './StatusBadge.jsx';
import { formatDate } from '../utils/format.js';

const TYPE_LABELS = { rating: 'Rating 1–5', choice: 'Single choice', text: 'Free text' };

// Read-only view of a survey definition, used by coordinators and approvers.
export default function SurveySummary({ survey }) {
  return (
    <>
      <div className="card">
        <dl className="details">
          <dt>Status</dt>
          <dd>
            <StatusBadge status={survey.state} /> <span className="muted">version {survey.version}</span>
          </dd>
          <dt>Purpose</dt>
          <dd>{survey.purpose || '—'}</dd>
          <dt>Target</dt>
          <dd>{survey.target ? `${survey.target.name} (${survey.target.type})` : '—'}</dd>
          <dt>Term</dt>
          <dd>{survey.term || '—'}</dd>
          <dt>Anonymity</dt>
          <dd>{survey.anonymity === 'anonymous' ? 'Anonymous' : 'Identified'}</dd>
          <dt>Collection window</dt>
          <dd>
            {formatDate(survey.openingAt)} – {formatDate(survey.closingAt)}
          </dd>
          <dt>Audience</dt>
          <dd>{survey.audience.length} respondents</dd>
          <dt>Instructions</dt>
          <dd>{survey.instructions || '—'}</dd>
          {survey.endReason && (
            <>
              <dt>Close / cancel reason</dt>
              <dd>{survey.endReason}</dd>
            </>
          )}
        </dl>
      </div>

      <div className="card">
        <h2>Questions ({survey.questions.length})</h2>
        <ol>
          {survey.questions.map((q) => (
            <li key={q.id} style={{ marginBottom: '0.5rem' }}>
              {q.text || <em className="muted">Untitled question</em>}{' '}
              <span className="muted">
                — {TYPE_LABELS[q.type]}
                {q.required ? ', required' : ', optional'}
              </span>
              {q.type === 'choice' && <div className="muted">Options: {q.options.join(', ')}</div>}
            </li>
          ))}
        </ol>
      </div>
    </>
  );
}

export function ReviewHistory({ history }) {
  return (
    <div className="card">
      <h2>Review history</h2>
      {history.length === 0 ? (
        <p className="muted">No review activity yet.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Version</th>
                <th>Decision</th>
                <th>By</th>
                <th>Comment</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {history.map((h, i) => (
                <tr key={i}>
                  <td>v{h.version}</td>
                  <td>{h.decision}</td>
                  <td>{h.byName}</td>
                  <td>{h.reason || '—'}</td>
                  <td>{formatDate(h.at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
