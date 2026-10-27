import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { decideSurvey, getReviewSurvey } from '../../api/surveys.js';
import SurveySummary, { ReviewHistory } from '../../components/SurveySummary.jsx';

export default function ReviewSurvey() {
  const { id } = useParams();
  const { user } = useAuth();
  const [survey, setSurvey] = useState(null);
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const load = useCallback(
    () =>
      getReviewSurvey(user, id)
        .then(setSurvey)
        .catch((err) => setError(err.message)),
    [user, id],
  );

  useEffect(() => {
    load();
  }, [load]);

  if (!survey) return error ? <div className="alert alert-error">{error}</div> : <p>Loading…</p>;

  async function decide(decision) {
    setError('');
    setNotice('');
    try {
      // The version shown on screen is sent so a stale decision is rejected.
      await decideSurvey(user, survey.id, survey.version, decision, reason);
      setNotice(decision === 'approve' ? 'Survey approved. The coordinator has been notified.' : 'Survey rejected. The coordinator has been notified.');
      setReason('');
    } catch (err) {
      setError(err.message);
    }
    load();
  }

  return (
    <>
      <div className="page-header">
        <h1>Review: {survey.title}</h1>
        <Link to="/review">← Review queue</Link>
      </div>

      {notice && <div className="alert alert-success">{notice}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {survey.status === 'UnderReview' && (
        <div className="card">
          <h2>Decision for version {survey.version}</h2>
          <div className="field">
            <label htmlFor="reason">Comment (required when rejecting)</label>
            <textarea id="reason" rows={2} value={reason} onChange={(e) => setReason(e.target.value)} />
          </div>
          <div className="row">
            <button className="btn btn-primary" onClick={() => decide('approve')}>
              Approve
            </button>
            <button className="btn btn-danger" onClick={() => decide('reject')}>
              Reject
            </button>
          </div>
        </div>
      )}

      <SurveySummary survey={survey} />
      <ReviewHistory history={survey.history} />
    </>
  );
}
