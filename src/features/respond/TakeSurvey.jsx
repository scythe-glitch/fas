import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { getEligibleSurvey, submitResponse, validateAnswers, MAX_TEXT_LENGTH } from '../../api/responses.js';
import StatusBadge from '../../components/StatusBadge.jsx';
import { formatDate } from '../../utils/format.js';

function QuestionField({ question: q, index, value, error, onChange }) {
  const errorId = `${q.id}-error`;
  return (
    <fieldset className={error ? 'question has-error' : 'question'} aria-describedby={error ? errorId : undefined}>
      <legend>
        {index + 1}. {q.text} {q.required ? <span className="required">*</span> : <span className="muted">(optional)</span>}
      </legend>

      {q.type === 'rating' && (
        <>
          <div className="rating">
            {[1, 2, 3, 4, 5].map((n) => (
              <label key={n}>
                <input type="radio" name={q.id} checked={value === n} onChange={() => onChange(n)} /> {n}
              </label>
            ))}
          </div>
          <p className="muted">1 = Poor, 5 = Excellent</p>
        </>
      )}

      {q.type === 'choice' && (
        <div className="choice-list">
          {q.options.map((opt) => (
            <label key={opt}>
              <input type="radio" name={q.id} checked={value === opt} onChange={() => onChange(opt)} /> {opt}
            </label>
          ))}
        </div>
      )}

      {q.type === 'text' && (
        <>
          <textarea rows={4} aria-label={q.text} value={value || ''} onChange={(e) => onChange(e.target.value)} />
          <p className="muted">
            {(value || '').length} / {MAX_TEXT_LENGTH} characters
          </p>
        </>
      )}

      {error && (
        <p className="field-error" id={errorId}>
          {error}
        </p>
      )}
    </fieldset>
  );
}

export default function TakeSurvey() {
  const { id } = useParams();
  const { user } = useAuth();
  const [survey, setSurvey] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [answers, setAnswers] = useState({});
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    getEligibleSurvey(user, id)
      .then(setSurvey)
      .catch((err) => setLoadError(err.message));
  }, [user, id]);

  if (loadError) return <div className="alert alert-error">{loadError}</div>;
  if (!survey) return <p>Loading…</p>;

  const completed = survey.completed || submitted;
  const canSubmit = survey.state === 'Open' && !completed;

  async function handleSubmit(e) {
    e.preventDefault();
    // Entered answers stay in state, so a failed submit never clears the form (NFR-009).
    const found = validateAnswers(survey, answers);
    setErrors(found);
    if (Object.keys(found).length) {
      setMessage({ type: 'error', text: `Please correct ${Object.keys(found).length} highlighted question(s).` });
      return;
    }
    try {
      await submitResponse(user, survey.id, answers);
      setSubmitted(true);
      setMessage({ type: 'success', text: 'Thank you! Your feedback was submitted. Status: Completed.' });
    } catch (err) {
      setErrors(err.fields || {});
      setMessage({ type: 'error', text: err.message });
    }
  }

  return (
    <>
      <div className="page-header">
        <h1>{survey.title}</h1>
        <Link to="/surveys">← Back to my surveys</Link>
      </div>

      <div className="card">
        <dl className="details">
          <dt>Purpose</dt>
          <dd>{survey.purpose}</dd>
          <dt>Target</dt>
          <dd>
            {survey.target?.name} ({survey.target?.type})
          </dd>
          <dt>Term</dt>
          <dd>{survey.term}</dd>
          <dt>Collection window</dt>
          <dd>
            {formatDate(survey.openingAt)} – {formatDate(survey.closingAt)}
          </dd>
          <dt>Collection status</dt>
          <dd>
            <StatusBadge status={survey.state} />
          </dd>
          <dt>Your status</dt>
          <dd>
            <StatusBadge status={completed ? 'Completed' : 'Pending'} />
          </dd>
        </dl>
      </div>

      <div className="alert alert-info">
        {survey.anonymity === 'anonymous'
          ? 'This survey is anonymous. Your answers are stored without your identity, and reports show only totals.'
          : 'This survey is identified. Your answers are linked to your account for internal processing; reports show only totals.'}
        {survey.instructions && <p style={{ margin: '0.5rem 0 0' }}>{survey.instructions}</p>}
      </div>

      {message && <div className={`alert alert-${message.type}`}>{message.text}</div>}
      {!canSubmit && !submitted && (
        <div className="alert alert-info">
          {completed ? 'You have already submitted this survey.' : `This survey is ${survey.state.toLowerCase()} and is not accepting responses.`}
        </div>
      )}

      {!completed && (
        <form onSubmit={handleSubmit} noValidate>
          <fieldset disabled={!canSubmit} style={{ border: 'none', padding: 0, margin: 0 }}>
            {survey.questions.map((q, i) => (
              <QuestionField
                key={q.id}
                question={q}
                index={i}
                value={answers[q.id]}
                error={errors[q.id]}
                onChange={(value) => setAnswers({ ...answers, [q.id]: value })}
              />
            ))}
            <button className="btn btn-primary" type="submit">
              Submit feedback
            </button>
          </fieldset>
        </form>
      )}
    </>
  );
}
