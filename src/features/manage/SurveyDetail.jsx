import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  EDITABLE_STATUSES,
  cancelSurvey,
  closeSurvey,
  getManagedSurvey,
  publishSurvey,
  submitForReview,
} from '../../api/surveys.js';
import SurveySummary, { ReviewHistory } from '../../components/SurveySummary.jsx';
import { formatPct } from '../../utils/format.js';

export default function SurveyDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [survey, setSurvey] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [reason, setReason] = useState('');

  const load = useCallback(
    () =>
      getManagedSurvey(user, id)
        .then(setSurvey)
        .catch((err) => setError(err.message)),
    [user, id],
  );

  useEffect(() => {
    load();
  }, [load]);

  if (!survey) return error ? <div className="alert alert-error">{error}</div> : <p>Loading…</p>;

  async function run(action, successMessage) {
    setError('');
    setNotice('');
    try {
      await action();
      setNotice(successMessage);
      setReason('');
      load();
    } catch (err) {
      setError(err.fields ? `${err.message} ${err.fields.join(' ')}` : err.message);
    }
  }

  const { state, status } = survey;
  const canEdit = EDITABLE_STATUSES.includes(status);
  const canSubmit = status === 'Draft' || status === 'Rejected';
  const canPublish = status === 'Approved' || status === 'Ready';
  const canClose = state === 'Open';
  const canCancel = state === 'Open' || state === 'Scheduled';
  const isCollecting = ['Scheduled', 'Open', 'Closed', 'Cancelled'].includes(state);
  const rate = survey.audience.length ? (100 * survey.responseCount) / survey.audience.length : null;

  return (
    <>
      <div className="page-header">
        <h1>{survey.title || 'Untitled survey'}</h1>
        <Link to="/manage">← All surveys</Link>
      </div>

      {notice && <div className="alert alert-success">{notice}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <div className="card">
        <h2>Actions</h2>
        <div className="row">
          {canEdit && (
            <Link className="btn" to={`/manage/${survey.id}/edit`}>
              Edit
            </Link>
          )}
          {canSubmit && (
            <button className="btn btn-primary" onClick={() => run(() => submitForReview(user, survey.id), 'Survey submitted.')}>
              Submit for review
            </button>
          )}
          {canPublish && (
            <button className="btn btn-primary" onClick={() => run(() => publishSurvey(user, survey.id), 'Survey published.')}>
              Publish
            </button>
          )}
          {!canEdit && !canSubmit && !canPublish && !canClose && !canCancel && (
            <span className="muted">No actions are available for a survey that is {state}.</span>
          )}
          {status === 'UnderReview' && <span className="muted">Waiting for the approver's decision.</span>}
        </div>

        {(canClose || canCancel) && (
          <div style={{ marginTop: '1rem' }}>
            <div className="field">
              <label htmlFor="reason">Reason for closing or cancelling</label>
              <input id="reason" type="text" value={reason} onChange={(e) => setReason(e.target.value)} />
            </div>
            <div className="row">
              {canClose && (
                <button className="btn" onClick={() => run(() => closeSurvey(user, survey.id, reason), 'Survey closed.')}>
                  Close early
                </button>
              )}
              {canCancel && (
                <button className="btn btn-danger" onClick={() => run(() => cancelSurvey(user, survey.id, reason), 'Survey cancelled.')}>
                  Cancel survey
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {isCollecting && (
        <div className="card stat-row">
          <div className="stat">
            <div className="muted">Eligible respondents</div>
            <div className="value">{survey.audience.length}</div>
          </div>
          <div className="stat">
            <div className="muted">Responses</div>
            <div className="value">{survey.responseCount}</div>
          </div>
          <div className="stat">
            <div className="muted">Response rate</div>
            <div className="value">{formatPct(rate)}</div>
          </div>
        </div>
      )}

      <SurveySummary survey={survey} />
      <ReviewHistory history={survey.history} />
    </>
  );
}
