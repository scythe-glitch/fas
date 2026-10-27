import { db, save, notify, nowIso, collectionState } from './db.js';
import { formatDate } from '../utils/format.js';

const DAY = 24 * 60 * 60 * 1000;

// Stands in for the server-side scheduler: opening notices and 24h reminders (FR-034, FR-035).
export function runScheduler() {
  const d = db();
  const now = Date.now();
  for (const s of d.surveys) {
    if (collectionState(s, now) !== 'Open') continue;
    const opens = Date.parse(s.openingAt);
    const closes = Date.parse(s.closingAt);
    const reminderDue = now >= closes - DAY || closes - opens < DAY;
    for (const userId of s.audience) {
      notify(userId, s.id, 'opening', `"${s.title}" is open for feedback until ${formatDate(s.closingAt)}.`);
      const done = d.participation.some((p) => p.surveyId === s.id && p.userId === userId);
      if (reminderDue && !done) {
        notify(userId, s.id, 'reminder', `Reminder: "${s.title}" closes on ${formatDate(s.closingAt)}.`);
      }
    }
  }
  save();
}

export async function listNotifications(user) {
  runScheduler();
  return db().notifications.filter((n) => n.recipientId === user.id);
}

export async function markRead(user, id) {
  const n = db().notifications.find((x) => x.id === id && x.recipientId === user.id);
  if (n && !n.readAt) n.readAt = nowIso();
  save();
}

export async function markAllRead(user) {
  for (const n of db().notifications) {
    if (n.recipientId === user.id && !n.readAt) n.readAt = nowIso();
  }
  save();
}
