import { db } from './db.js';
import { listEligibleSurveys } from './responses.js';
import { listManagedSurveys, listReviewQueue } from './surveys.js';
import { listAnalyticsSurveys } from './analytics.js';
import { listNotifications } from './notifications.js';
import { listAudit, listUsers } from './admin.js';
import { responseRate } from '../utils/analytics.js';

const DAY = 24 * 60 * 60 * 1000;

// Home page shows one dashboard; users with several roles get the first matching one.
const ROLE_ORDER = ['coordinator', 'approver', 'management', 'faculty', 'respondent', 'admin'];

const sum = (list, key) => list.reduce((total, x) => total + x[key], 0);

async function respondentSummary(user) {
  const surveys = await listEligibleSurveys(user);
  const pending = surveys.filter((s) => s.state === 'Open' && !s.completed);
  return {
    stats: {
      assigned: surveys.length,
      pending: pending.length,
      completed: surveys.filter((s) => s.completed).length,
      closingSoon: pending.filter((s) => Date.parse(s.closingAt) - Date.now() < 3 * DAY).length,
    },
    rows: surveys.map((s) => ({ id: s.id, title: s.title, target: s.target, term: s.term, closingAt: s.closingAt, status: s.completed ? 'Completed' : s.state, to: `/surveys/${s.id}` })),
  };
}

async function coordinatorSummary(user) {
  const surveys = await listManagedSurveys(user);
  const open = surveys.filter((s) => s.state === 'Open');
  return {
    stats: {
      total: surveys.length,
      drafts: surveys.filter((s) => s.status === 'Draft' || s.status === 'Rejected').length,
      underReview: surveys.filter((s) => s.status === 'UnderReview').length,
      open: open.length,
      openResponses: sum(open, 'responseCount'),
    },
    rows: surveys.map((s) => ({ id: s.id, title: s.title || 'Untitled survey', target: s.target, term: s.term, closingAt: s.closingAt, status: s.state, to: `/manage/${s.id}` })),
  };
}

async function approverSummary(user) {
  const queue = await listReviewQueue(user);
  const decisions = db().surveys.flatMap((s) => s.history.filter((h) => h.by === user.id));
  return {
    stats: {
      pending: queue.length,
      approved: decisions.filter((h) => h.decision === 'Approved').length,
      rejected: decisions.filter((h) => h.decision === 'Rejected').length,
    },
    rows: queue.map((s) => ({ id: s.id, title: s.title, target: s.target, term: s.term, closingAt: s.closingAt, status: s.state, to: `/review/${s.id}` })),
  };
}

async function reportingSummary(user) {
  const surveys = (await listAnalyticsSurveys(user)).filter((s) => s.status !== 'Cancelled');
  const accepted = sum(surveys, 'accepted');
  const eligible = sum(surveys, 'eligible');
  return {
    stats: {
      surveys: surveys.length,
      open: surveys.filter((s) => s.state === 'Open').length,
      responses: accepted,
      eligible,
      rate: responseRate(accepted, eligible),
    },
    rows: surveys.map((s) => ({ id: s.id, title: s.title, target: s.target, term: s.term, closingAt: s.closingAt, status: s.state, to: `/analytics/${s.id}` })),
  };
}

async function adminSummary(user) {
  const users = await listUsers(user);
  return {
    stats: {
      users: users.length,
      active: users.filter((u) => u.status === 'active').length,
      pending: users.filter((u) => u.status === 'pending').length,
      auditEntries: (await listAudit(user)).length,
      policyVersion: db().policy.version,
    },
    rows: [],
  };
}

const SUMMARIES = {
  respondent: respondentSummary,
  coordinator: coordinatorSummary,
  approver: approverSummary,
  faculty: reportingSummary,
  management: reportingSummary,
  admin: adminSummary,
};

export async function getHomeSummary(user) {
  const role = ROLE_ORDER.find((r) => user.roles.includes(r));
  const notifications = await listNotifications(user);
  return {
    role,
    department: db().departments.find((d) => d.id === user.departmentId)?.name ?? '',
    unread: notifications.filter((n) => !n.readAt).length,
    ...(role ? await SUMMARIES[role](user) : { stats: {}, rows: [] }),
  };
}

export async function countUnread(user) {
  return (await listNotifications(user)).filter((n) => !n.readAt).length;
}
