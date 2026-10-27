import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { resetDb } from '../../api/db.js';
import { Logo } from '../../components/Brand.jsx';
import Icon from '../../components/Icon.jsx';
import AuthHeader from './AuthHeader.jsx';

// The tabs only pick a demo account; the signed-in user's roles always come from their account.
const DEMO_ACCOUNTS = [
  { key: 'student', label: 'Student', icon: 'cap', email: 'student1@lnmiit.ac.in' },
  { key: 'coordinator', label: 'Coordinator', icon: 'edit', email: 'coordinator@lnmiit.ac.in' },
  { key: 'approver', label: 'Approver', icon: 'check', email: 'head@lnmiit.ac.in' },
  { key: 'faculty', label: 'Faculty', icon: 'user', email: 'faculty@lnmiit.ac.in' },
  { key: 'management', label: 'Management', icon: 'chart', email: 'management@lnmiit.ac.in' },
  { key: 'admin', label: 'Admin', icon: 'shield', email: 'admin@lnmiit.ac.in' },
];
const DEMO_PASSWORD = 'password';

export default function Login() {
  const { login } = useAuth();
  const [tab, setTab] = useState(DEMO_ACCOUNTS[0]);
  const [email, setEmail] = useState(DEMO_ACCOUNTS[0].email);
  const [password, setPassword] = useState(DEMO_PASSWORD);
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

  function selectTab(account) {
    setTab(account);
    setEmail(account.email);
    setPassword(DEMO_PASSWORD);
    setError('');
  }

  function handleReset() {
    resetDb();
    window.location.reload();
  }

  return (
    <div className="auth-shell">
      <AuthHeader />

      <main className="auth-page">
        <form className="auth-card" onSubmit={handleSubmit}>
          <div className="auth-card-head">
            <Logo />
            <h1>Feedback Analytics Portal</h1>
            <p className="muted">Sign in with your institute webmail credentials</p>
          </div>

          <div className="auth-card-body">
            <div className="role-tabs" role="tablist" aria-label="Demo account">
              {DEMO_ACCOUNTS.map((a) => (
                <button
                  key={a.key}
                  type="button"
                  role="tab"
                  aria-selected={tab.key === a.key}
                  className={tab.key === a.key ? 'role-tab active' : 'role-tab'}
                  onClick={() => selectTab(a)}
                >
                  <Icon name={a.icon} size={16} /> {a.label}
                </button>
              ))}
            </div>

            <div className="demo-hint">
              <strong>{tab.label} login:</strong> Email: <code>{tab.email}</code> | Password: <code>{DEMO_PASSWORD}</code>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            <div className="field">
              <label htmlFor="email">Institute email</label>
              <div className="input-icon">
                <Icon name="mail" size={18} />
                <input id="email" type="email" placeholder="name@lnmiit.ac.in" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
            </div>
            <div className="field">
              <label htmlFor="password">Password</label>
              <div className="input-icon">
                <Icon name="lock" size={18} />
                <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
            </div>

            <button className="btn btn-primary btn-block btn-large" type="submit">
              Sign In to {tab.label.toUpperCase()} Portal <Icon name="arrow" size={18} />
            </button>

            <div className="auth-links">
              <span>
                New here? <Link to="/register">Create an account</Link>
              </span>
              <button type="button" className="link-button" onClick={handleReset}>
                Reset demo data
              </button>
            </div>
          </div>

          <div className="auth-card-foot muted">
            For technical assistance, contact <a href="mailto:helpdesk@lnmiit.ac.in">helpdesk@lnmiit.ac.in</a>
          </div>
        </form>
      </main>
    </div>
  );
}
