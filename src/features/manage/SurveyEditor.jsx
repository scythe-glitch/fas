import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  EDITABLE_STATUSES,
  MAX_QUESTIONS,
  emptySurvey,
  getManagedSurvey,
  listDirectory,
  listTargets,
  newQuestion,
  saveDraft,
  submitForReview,
} from '../../api/surveys.js';
import { fromInputValue, toInputValue } from '../../utils/format.js';

function QuestionEditor({ question: q, index, total, onChange, onMove, onRemove }) {
  return (
    <fieldset className="question">
      <legend>Question {index + 1}</legend>
      <div className="field">
        <label htmlFor={`${q.id}-text`}>
          Question text <span className="required">*</span>
        </label>
        <input id={`${q.id}-text`} type="text" value={q.text} onChange={(e) => onChange({ text: e.target.value })} />
      </div>
      <div className="grid-2">
        <div className="field">
          <label htmlFor={`${q.id}-type`}>Type</label>
          <select id={`${q.id}-type`} value={q.type} onChange={(e) => onChange({ type: e.target.value })}>
            <option value="rating">Rating (1–5)</option>
            <option value="choice">Single choice</option>
            <option value="text">Free text</option>
          </select>
        </div>
        <div className="field">
          <span className="label">Answer</span>
          <label>
            <input type="checkbox" checked={q.required} onChange={(e) => onChange({ required: e.target.checked })} /> Required
          </label>
        </div>
      </div>
      {q.type === 'choice' && (
        <div className="field">
          <label htmlFor={`${q.id}-options`}>Options (one per line, at least two)</label>
          <textarea
            id={`${q.id}-options`}
            rows={3}
            value={q.options.join('\n')}
            onChange={(e) => onChange({ options: e.target.value.split('\n') })}
          />
        </div>
      )}
      <div className="row">
        <button type="button" className="btn btn-small" onClick={() => onMove(-1)} disabled={index === 0}>
          ↑ Up
        </button>
        <button type="button" className="btn btn-small" onClick={() => onMove(1)} disabled={index === total - 1}>
          ↓ Down
        </button>
        <button type="button" className="btn btn-small" onClick={onRemove}>
          Remove
        </button>
      </div>
    </fieldset>
  );
}

export default function SurveyEditor() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(id ? null : emptySurvey());
  const [targets, setTargets] = useState([]);
  const [directory, setDirectory] = useState([]);
  const [errors, setErrors] = useState([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    listTargets(user).then(setTargets);
    listDirectory().then(setDirectory);
    if (id) {
      getManagedSurvey(user, id)
        .then(setForm)
        .catch((err) => setErrors([err.message]));
    }
  }, [user, id]);

  if (!form) {
    return errors.length ? <div className="alert alert-error">{errors[0]}</div> : <p>Loading…</p>;
  }
  if (form.id && !EDITABLE_STATUSES.includes(form.status)) {
    return <div className="alert alert-info">This survey is {form.status} and can no longer be edited.</div>;
  }

  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }));
  const updateQuestion = (i, patch) => update('questions', form.questions.map((q, j) => (j === i ? { ...q, ...patch } : q)));
  const removeQuestion = (i) => update('questions', form.questions.filter((_, j) => j !== i));
  function moveQuestion(i, dir) {
    const list = [...form.questions];
    [list[i], list[i + dir]] = [list[i + dir], list[i]];
    update('questions', list);
  }
  function toggleAudience(userId) {
    update('audience', form.audience.includes(userId) ? form.audience.filter((x) => x !== userId) : [...form.audience, userId]);
  }

  async function handleSave(submit) {
    setBusy(true);
    setErrors([]);
    try {
      const saved = await saveDraft(user, form);
      setForm((f) => ({ ...f, id: saved.id, status: saved.status }));
      if (submit) await submitForReview(user, saved.id);
      navigate(`/manage/${saved.id}`);
    } catch (err) {
      setErrors(err.fields || [err.message]);
      setBusy(false);
    }
  }

  return (
    <>
      <div className="page-header">
        <h1>{form.id ? 'Edit survey' : 'New survey'}</h1>
        <Link to={form.id ? `/manage/${form.id}` : '/manage'}>Cancel</Link>
      </div>

      {(form.status === 'Approved' || form.status === 'Ready') && (
        <div className="alert alert-info">Saving changes will return this survey to Draft. It must be submitted again.</div>
      )}
      {errors.length > 0 && (
        <div className="alert alert-error">
          Please fix the following:
          <ul>
            {errors.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="card">
        <h2>Details</h2>
        <div className="field">
          <label htmlFor="title">
            Title <span className="required">*</span>
          </label>
          <input id="title" type="text" value={form.title} onChange={(e) => update('title', e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="purpose">
            Purpose <span className="required">*</span>
          </label>
          <input id="purpose" type="text" value={form.purpose} onChange={(e) => update('purpose', e.target.value)} />
        </div>
        <div className="grid-2">
          <div className="field">
            <label htmlFor="target">
              Feedback target <span className="required">*</span>
            </label>
            <select id="target" value={form.targetId} onChange={(e) => update('targetId', e.target.value)}>
              <option value="">Select a target</option>
              {targets.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.type})
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="term">
              Term / cycle <span className="required">*</span>
            </label>
            <input id="term" type="text" placeholder="e.g. 2026-Odd" value={form.term} onChange={(e) => update('term', e.target.value)} />
          </div>
        </div>
        <div className="field">
          <label htmlFor="instructions">Instructions</label>
          <textarea id="instructions" rows={2} value={form.instructions} onChange={(e) => update('instructions', e.target.value)} />
        </div>
        <div className="field">
          <span className="label">Anonymity</span>
          <label>
            <input type="radio" name="anonymity" checked={form.anonymity === 'anonymous'} onChange={() => update('anonymity', 'anonymous')} />{' '}
            Anonymous — answers are stored without identity
          </label>
          <label>
            <input type="radio" name="anonymity" checked={form.anonymity === 'identified'} onChange={() => update('anonymity', 'identified')} />{' '}
            Identified
          </label>
        </div>
      </div>

      <div className="card">
        <h2>
          Questions ({form.questions.length}/{MAX_QUESTIONS})
        </h2>
        {form.questions.map((q, i) => (
          <QuestionEditor
            key={q.id}
            question={q}
            index={i}
            total={form.questions.length}
            onChange={(patch) => updateQuestion(i, patch)}
            onMove={(dir) => moveQuestion(i, dir)}
            onRemove={() => removeQuestion(i)}
          />
        ))}
        <button
          type="button"
          className="btn"
          onClick={() => update('questions', [...form.questions, newQuestion()])}
          disabled={form.questions.length >= MAX_QUESTIONS}
        >
          + Add question
        </button>
      </div>

      <div className="card">
        <h2>Audience and schedule</h2>
        <div className="grid-2">
          <div className="field">
            <label htmlFor="opening">
              Opens at <span className="required">*</span>
            </label>
            <input
              id="opening"
              type="datetime-local"
              value={toInputValue(form.openingAt)}
              onChange={(e) => update('openingAt', fromInputValue(e.target.value))}
            />
          </div>
          <div className="field">
            <label htmlFor="closing">
              Closes at <span className="required">*</span>
            </label>
            <input
              id="closing"
              type="datetime-local"
              value={toInputValue(form.closingAt)}
              onChange={(e) => update('closingAt', fromInputValue(e.target.value))}
            />
          </div>
        </div>
        <div className="field">
          <div className="row">
            <span className="label">
              Respondents ({form.audience.length} selected) <span className="required">*</span>
            </span>
            <button type="button" className="link-button" onClick={() => update('audience', directory.map((u) => u.id))}>
              Select all
            </button>
            <button type="button" className="link-button" onClick={() => update('audience', [])}>
              Clear
            </button>
          </div>
          <div className="checkbox-list">
            {directory.map((u) => (
              <label key={u.id}>
                <input type="checkbox" checked={form.audience.includes(u.id)} onChange={() => toggleAudience(u.id)} /> {u.name}{' '}
                <span className="muted">{u.email}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="row">
        <button className="btn" onClick={() => handleSave(false)} disabled={busy}>
          Save draft
        </button>
        <button className="btn btn-primary" onClick={() => handleSave(true)} disabled={busy}>
          Save and submit for review
        </button>
      </div>
    </>
  );
}
