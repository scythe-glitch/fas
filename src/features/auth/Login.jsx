import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { resetDb } from '../../api/db.js';

const DEMO_ACCOUNTS = [
  ['Respondent', 'student1@lnmiit.ac.in'],
  ['Coordinator', 'coordinator@lnmiit.ac.in'],
  ['Approver', 'head@lnmiit.ac.in'],
  ['Administrator', 'admin@lnmiit.ac.in'],
  ['Faculty / Staff', 'faculty@lnmiit.ac.in'],
  ['Management', 'management@lnmiit.ac.in'],
];

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message);
    }
  }

  function fillDemo(demoEmail) {
    setEmail(demoEmail);
    setPassword('password');
  }

  function handleReset() {
    resetDb();
    window.location.reload();
  }

  return (
    <div className="auth-page">
      <h1>Feedback Analytics System</h1>
      <form className="card" onSubmit={handleSubmit}>
        <h2>Sign in</h2>
        {error && <div className="alert alert-error">{error}</div>}
        <div className="field">
          <label htmlFor="email">Institutional email</label>
          <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <div className="row">
          <button className="btn btn-primary" type="submit">
            Sign in
          </button>
          <span className="muted">
            New here? <Link to="/register">Create an account</Link>
          </span>
        </div>
      </form>

      <div className="card">
        <h2>Demo accounts</h2>
        <p className="muted">Password for all accounts: password</p>
        <div className="table-wrap">
          <table>
            <tbody>
              {DEMO_ACCOUNTS.map(([role, demoEmail]) => (
                <tr key={demoEmail}>
                  <td>{role}</td>
                  <td>
                    <button type="button" className="link-button" onClick={() => fillDemo(demoEmail)}>
                      {demoEmail}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button type="button" className="btn btn-small" onClick={handleReset}>
          Reset demo data
        </button>
      </div>
    </div>
  );
}
