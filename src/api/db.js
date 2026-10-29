import { createSeed } from './seed.js';

// Mock backend: all data is kept in the Local Storage so the UI works without a server.
// Replace the functions in src/api/*.js with real HTTP calls when the backend is ready.
const STORAGE_KEY = 'fas-db-v1';
export const SESSION_KEY = 'fas-session';

let cache = null;

export function db() {
  if (!cache) {
    const raw = localStorage.getItem(STORAGE_KEY);
    cache = raw ? JSON.parse(raw) : createSeed();
    save();
  }
  return cache;
}

export function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
}

export function resetDb() {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(SESSION_KEY);
  cache = null;
}

export const newId = (prefix) => `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
export const nowIso = () => new Date().toISOString();

export class ApiError extends Error {
  // `fields` carries per-field or per-item validation messages when there are several.
  constructor(message, fields) {
    super(message);
    this.fields = fields;
  }
}

export const findUser = (id) => db().users.find((u) => u.id === id);
export const findTarget = (id) => db().targets.find((t) => t.id === id);

export function audit(actorId, action, objectType, objectId, result = 'success') {
  db().audit.unshift({ id: newId('a'), actorId, action, objectType, objectId, at: nowIso(), result });
}

// The key prevents the same notice from being created twice (BR-013).
export function notify(recipientId, surveyId, type, message, key = `${type}:${surveyId}:${recipientId}`) {
  const d = db();
  if (d.notifications.some((n) => n.key === key)) return;
  d.notifications.unshift({ id: newId('n'), recipientId, surveyId, type, message, key, createdAt: nowIso(), readAt: null });
}

// Collection state of a survey, computed from server time (FR-015, BR-005).
export function collectionState(survey, at = Date.now()) {
  if (survey.status !== 'Published') return survey.status;
  if (at < Date.parse(survey.openingAt)) return 'Scheduled';
  if (at < Date.parse(survey.closingAt)) return 'Open';
  return 'Closed';
}
