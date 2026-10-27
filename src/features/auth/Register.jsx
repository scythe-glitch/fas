import { useState } from 'react';
import { Link } from 'react-router-dom';
import { register } from '../../api/auth.js';
import { Logo } from '../../components/Brand.jsx';
import AuthHeader from './AuthHeader.jsx';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState(null);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage(null);
    if (form.password !== form.confirm) {
      setErrors({ confirm: 'Passwords do not match.' });
      return;
    }
    try {
      await register(form);
      setErrors({});
      setMessage({ type: 'success', text: 'Account created. You can sign in after an administrator activates it.' });
      setForm({ name: '', email: '', password: '', confirm: '' });
    } catch (err) {
      setErrors(err.fields || {});
      setMessage({ type: 'error', text: err.message });
    }
  }

  const field = (id, label, type = 'text') => (
    <div className="field">
      <label htmlFor={id}>
        {label} <span className="required">*</span>
      </label>
      <input id={id} type={type} value={form[id]} onChange={update(id)} aria-describedby={`${id}-error`} required />
      {errors[id] && (
        <p className="field-error" id={`${id}-error`}>
          {errors[id]}
        </p>
      )}
    </div>
  );

  return (
    <div className="auth-shell">
      <AuthHeader />

      <main className="auth-page">
        <form className="auth-card" onSubmit={handleSubmit} noValidate>
          <div className="auth-card-head">
            <Logo />
            <h1>Create an Account</h1>
            <p className="muted">Register with your institute email. An administrator activates new accounts.</p>
          </div>

          <div className="auth-card-body">
            {message && <div className={`alert alert-${message.type}`}>{message.text}</div>}
            {field('name', 'Full name')}
            {field('email', 'Institute email', 'email')}
            {field('password', 'Password', 'password')}
            {field('confirm', 'Confirm password', 'password')}
            <button className="btn btn-primary btn-block btn-large" type="submit">
              Register
            </button>
            <div className="auth-links">
              <Link to="/login">← Back to sign in</Link>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
