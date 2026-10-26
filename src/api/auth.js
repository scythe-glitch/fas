import { db, save, audit, newId, nowIso, ApiError, SESSION_KEY } from './db.js';

const publicUser = ({ password, ...rest }) => rest;

export async function login(email, password) {
  const u = db().users.find((x) => x.email.toLowerCase() === email.trim().toLowerCase());
  // One generic message for unknown, wrong-password and inactive accounts (FR-002).
  if (!u || u.password !== password || u.status !== 'active') {
    throw new ApiError('Invalid credentials or inactive account.');
  }
  localStorage.setItem(SESSION_KEY, u.id);
  return publicUser(u);
}

export function logout() {
  localStorage.removeItem(SESSION_KEY);
}

export function getSessionUser() {
  const id = localStorage.getItem(SESSION_KEY);
  const u = id && db().users.find((x) => x.id === id && x.status === 'active');
  return u ? publicUser(u) : null;
}

export async function register({ name, email, password }) {
  const d = db();
  const cleanEmail = email.trim().toLowerCase();
  const errors = {};
  if (!name.trim()) errors.name = 'Name is required.';
  if (!cleanEmail.endsWith('@' + d.policy.emailDomain)) errors.email = `Use your @${d.policy.emailDomain} email address.`;
  else if (d.users.some((u) => u.email === cleanEmail)) errors.email = 'An account with this email already exists.';
  if (password.length < 8) errors.password = 'Password must be at least 8 characters.';
  if (Object.keys(errors).length) throw new ApiError('Please fix the highlighted fields.', errors);

  // New accounts are pending respondents until an administrator activates them (FR-001).
  const u = {
    id: newId('u'),
    name: name.trim(),
    email: cleanEmail,
    password,
    status: 'pending',
    departmentId: 'cse',
    roles: ['respondent'],
    createdAt: nowIso(),
  };
  d.users.push(u);
  audit(u.id, 'register', 'User', u.id);
  save();
  return publicUser(u);
}
