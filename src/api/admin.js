import { db, save, audit, nowIso, findUser, ApiError } from './db.js';

export const RETENTION_OPTIONS = [6, 12, 24];

function requireAdmin(user) {
  if (!user.roles.includes('admin')) throw new ApiError('Administrator access required.');
}

function findAccount(userId) {
  const u = findUser(userId);
  if (!u) throw new ApiError('User not found.');
  return u;
}

export async function listUsers(user) {
  requireAdmin(user);
  return db().users.map(({ password, ...u }) => u);
}

export async function setUserStatus(user, userId, status) {
  requireAdmin(user);
  if (userId === user.id && status !== 'active') throw new ApiError('You cannot deactivate your own account.');
  findAccount(userId).status = status;
  audit(user.id, status === 'active' ? 'activate_user' : 'deactivate_user', 'User', userId);
  save();
}

export async function setUserRoles(user, userId, roles) {
  requireAdmin(user);
  if (roles.length === 0) throw new ApiError('A user needs at least one role.');
  if (userId === user.id && !roles.includes('admin')) throw new ApiError('You cannot remove your own administrator role.');
  findAccount(userId).roles = roles;
  audit(user.id, 'change_roles', 'User', userId);
  save();
}

export async function getPolicy(user) {
  requireAdmin(user);
  return { ...db().policy };
}

// Policy changes are versioned and apply to newly submitted surveys only (FR-043).
export async function updatePolicy(user, changes) {
  requireAdmin(user);
  const d = db();
  if (!changes.emailDomain.trim()) throw new ApiError('Email domain is required.');
  if (!RETENTION_OPTIONS.includes(Number(changes.retentionMonths))) throw new ApiError('Retention must be 6, 12 or 24 months.');
  d.policyHistory.push({ ...d.policy, replacedAt: nowIso(), changedBy: user.id });
  d.policy = {
    version: d.policy.version + 1,
    emailDomain: changes.emailDomain.trim().toLowerCase(),
    approvalRequired: !!changes.approvalRequired,
    retentionMonths: Number(changes.retentionMonths),
  };
  audit(user.id, 'update_policy', 'Policy', `v${d.policy.version}`);
  save();
  return { ...d.policy };
}

export async function listAudit(user) {
  requireAdmin(user);
  return db().audit.map((a) => ({ ...a, actorName: findUser(a.actorId)?.name ?? a.actorId }));
}
