import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { getPolicy, RETENTION_OPTIONS, updatePolicy } from '../../api/admin.js';

export default function Policy() {
  const { user } = useAuth();
  const [policy, setPolicy] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    getPolicy(user).then(setPolicy);
  }, [user]);

  if (!policy) return <p>Loading…</p>;

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setPolicy(await updatePolicy(user, policy));
      setMessage({ type: 'success', text: 'Policy saved. Changes apply to newly submitted surveys only.' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  }

  return (
    <>
      <h1>Policy Settings</h1>
      {message && <div className={`alert alert-${message.type}`}>{message.text}</div>}

      <form className="card" onSubmit={handleSubmit} style={{ maxWidth: 560 }}>
        <p className="muted">Current version: v{policy.version}</p>
        <div className="field">
          <label htmlFor="domain">Institutional email domain</label>
          <input id="domain" type="text" value={policy.emailDomain} onChange={(e) => setPolicy({ ...policy, emailDomain: e.target.value })} />
        </div>
        <div className="field">
          <label htmlFor="retention">Data retention for new surveys</label>
          <select
            id="retention"
            value={policy.retentionMonths}
            onChange={(e) => setPolicy({ ...policy, retentionMonths: Number(e.target.value) })}
          >
            {RETENTION_OPTIONS.map((m) => (
              <option key={m} value={m}>
                {m} months
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>
            <input
              type="checkbox"
              checked={policy.approvalRequired}
              onChange={(e) => setPolicy({ ...policy, approvalRequired: e.target.checked })}
            />{' '}
            Surveys require approval before publishing
          </label>
        </div>
        <button className="btn btn-primary" type="submit">
          Save policy
        </button>
      </form>
    </>
  );
}
