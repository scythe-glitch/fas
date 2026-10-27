import { db, save, audit, notify, newId, nowIso, collectionState, findTarget, findUser, ApiError } from './db.js';

export const EDITABLE_STATUSES = ['Draft', 'Rejected', 'Approved', 'Ready'];
export const MAX_QUESTIONS = 20;

const DEFINITION_FIELDS = ['title', 'purpose', 'targetId', 'term', 'instructions', 'anonymity', 'openingAt', 'closingAt', 'audience', 'questions'];

function withMeta(s) {
  const d = db();
  return {
    ...s,
    target: findTarget(s.targetId),
    state: collectionState(s),
    responseCount: d.responses.filter((r) => r.surveyId === s.id).length,
    history: s.history.map((h) => ({ ...h, byName: findUser(h.by)?.name ?? h.by })),
  };
}

function requireOwner(user, id) {
  const s = db().surveys.find((x) => x.id === id);
  if (!s || s.ownerId !== user.id) throw new ApiError('Survey not found or not managed by you.');
  return s;
}

export function emptySurvey() {
  return {
    title: '',
    purpose: '',
    targetId: '',
    term: '',
    instructions: '',
    anonymity: 'anonymous',
    openingAt: '',
    closingAt: '',
    audience: [],
    questions: [],
  };
}

export function newQuestion() {
  return { id: newId('q'), key: newId('k'), type: 'rating', text: '', required: true, options: [] };
}

// Completeness rules checked before a survey can be submitted (BR-003).
export function validateDefinition(s) {
  const errors = [];
  if (!s.title.trim()) errors.push('Title is required.');
  if (!s.purpose.trim()) errors.push('Purpose is required.');
  if (!s.targetId) errors.push('Select a feedback target.');
  if (!s.term.trim()) errors.push('Term is required.');
  if (s.questions.length === 0) errors.push('Add at least one question.');
  if (s.questions.length > MAX_QUESTIONS) errors.push(`A survey can have at most ${MAX_QUESTIONS} questions.`);
  s.questions.forEach((q, i) => {
    if (!q.text.trim()) errors.push(`Question ${i + 1} needs text.`);
    if (q.type === 'choice' && q.options.length < 2) errors.push(`Question ${i + 1} needs at least two distinct options.`);
  });
  if (s.audience.length === 0) errors.push('Select at least one respondent.');
  if (!s.openingAt || !s.closingAt) errors.push('Set both opening and closing times.');
  else if (Date.parse(s.closingAt) <= Date.parse(s.openingAt)) errors.push('Closing time must be after opening time.');
  return errors;
}

// ---------- Coordinator ----------

export async function listManagedSurveys(user) {
  return db().surveys.filter((s) => s.ownerId === user.id).map(withMeta);
}

export async function getManagedSurvey(user, id) {
  return withMeta(requireOwner(user, id));
}

export async function listTargets(user) {
  return db().targets.filter((t) => t.departmentId === user.departmentId);
}

export async function listDirectory() {
  return db()
    .users.filter((u) => u.status === 'active' && u.roles.includes('respondent'))
    .map(({ id, name, email }) => ({ id, name, email }));
}

export async function saveDraft(user, draft) {
  const d = db();
  const fields = {};
  for (const key of DEFINITION_FIELDS) fields[key] = draft[key];
  fields.questions = draft.questions.map((q) => ({
    ...q,
    options: q.type === 'choice' ? [...new Set(q.options.map((o) => o.trim()).filter(Boolean))] : [],
  }));

  if (fields.targetId && findTarget(fields.targetId)?.departmentId !== user.departmentId) {
    throw new ApiError('The selected target is outside your department.');
  }
  if (fields.questions.length > MAX_QUESTIONS) throw new ApiError(`A survey can have at most ${MAX_QUESTIONS} questions.`);

  if (!draft.id) {
    const s = { id: newId('s'), version: 1, ownerId: user.id, status: 'Draft', history: [], ...fields };
    d.surveys.push(s);
    audit(user.id, 'create_survey', 'Survey', s.id);
    save();
    return withMeta(s);
  }

  const s = requireOwner(user, draft.id);
  if (!EDITABLE_STATUSES.includes(s.status)) throw new ApiError(`A survey that is ${s.status} cannot be edited.`);
  // Editing an approved/ready survey invalidates the approval (FR-009, BR-004).
  if (s.status === 'Approved' || s.status === 'Ready') {
    s.status = 'Draft';
    s.history.push({ version: s.version, decision: 'Approval invalidated by edit', by: user.id, reason: '', at: nowIso() });
  }
  Object.assign(s, fields);
  audit(user.id, 'update_survey', 'Survey', s.id);
  save();
  return withMeta(s);
}

export async function submitForReview(user, id) {
  const d = db();
  const s = requireOwner(user, id);
  if (!['Draft', 'Rejected'].includes(s.status)) throw new ApiError(`A survey that is ${s.status} cannot be submitted.`);

  const errors = validateDefinition(s);
  if (errors.length) throw new ApiError('The survey is incomplete.', errors);

  const approvalRequired = d.policy.approvalRequired;
  let approver = null;
  if (approvalRequired) {
    const departmentId = findTarget(s.targetId).departmentId;
    approver = d.users.find(
      (u) => u.status === 'active' && u.roles.includes('approver') && u.departmentId === departmentId && u.id !== user.id,
    );
    if (!approver) throw new ApiError('No approver is assigned to this department.');
  }

  // Each resubmission creates a new version (FR-009).
  if (s.history.some((h) => h.decision === 'Submitted')) s.version += 1;
  s.approvalRequired = approvalRequired;
  s.approverId = approver?.id ?? null;
  s.status = approvalRequired ? 'UnderReview' : 'Ready';
  s.history.push({ version: s.version, decision: 'Submitted', by: user.id, reason: '', at: nowIso() });
  audit(user.id, 'submit_survey', 'Survey', s.id);
  save();
  return withMeta(s);
}

export async function publishSurvey(user, id) {
  const s = requireOwner(user, id);
  if (!['Approved', 'Ready'].includes(s.status)) throw new ApiError('Only Approved or Ready surveys can be published.');
  if (Date.now() >= Date.parse(s.closingAt)) throw new ApiError('The closing time has passed. Edit the schedule first.');
  // Publishing freezes the definition, audience and retention period (FR-014, BR-015).
  s.status = 'Published';
  s.publishedAt = nowIso();
  s.retentionMonths = db().policy.retentionMonths;
  audit(user.id, 'publish_survey', 'Survey', s.id);
  save();
  return withMeta(s);
}

function endCollection(user, id, reason, allowedStates, newStatus) {
  const s = requireOwner(user, id);
  if (!reason.trim()) throw new ApiError('A reason is required.');
  if (!allowedStates.includes(collectionState(s))) throw new ApiError(`This survey cannot be ${newStatus.toLowerCase()} now.`);
  s.status = newStatus;
  s.closedAt = nowIso();
  s.endReason = reason.trim();
  const type = newStatus === 'Closed' ? 'closed' : 'cancelled';
  for (const userId of s.audience) {
    notify(userId, s.id, type, `"${s.title}" was ${type === 'closed' ? 'closed early' : 'cancelled'}: ${s.endReason}`);
  }
  audit(user.id, `${type}_survey`, 'Survey', s.id);
  save();
  return withMeta(s);
}

export async function closeSurvey(user, id, reason) {
  return endCollection(user, id, reason, ['Open'], 'Closed');
}

export async function cancelSurvey(user, id, reason) {
  return endCollection(user, id, reason, ['Scheduled', 'Open'], 'Cancelled');
}

// ---------- Approver ----------

const inApproverScope = (user, s) =>
  user.roles.includes('approver') && findTarget(s.targetId)?.departmentId === user.departmentId;

export async function listReviewQueue(user) {
  return db()
    .surveys.filter((s) => s.status === 'UnderReview' && s.approverId === user.id)
    .map(withMeta);
}

export async function getReviewSurvey(user, id) {
  const s = db().surveys.find((x) => x.id === id);
  if (!s || !inApproverScope(user, s)) throw new ApiError('Survey not found.');
  return withMeta(s);
}

export async function decideSurvey(user, id, version, decision, reason = '') {
  const s = db().surveys.find((x) => x.id === id);
  if (!s) throw new ApiError('Survey not found.');

  const deny = (message) => {
    audit(user.id, `${decision}_survey`, 'Survey', id, 'denied');
    save();
    throw new ApiError(message);
  };
  if (!inApproverScope(user, s)) deny('You are not authorised to review this survey.');
  if (s.ownerId === user.id) deny('You cannot review your own survey.');
  // A stale decision must never overwrite a recorded one (AC-011).
  if (s.status !== 'UnderReview' || s.version !== version) {
    throw new ApiError('This version was already decided or has changed. Refresh and try again.');
  }
  if (decision === 'reject' && !reason.trim()) throw new ApiError('A reason is required to reject a survey.');

  const approved = decision === 'approve';
  s.status = approved ? 'Approved' : 'Rejected';
  s.history.push({ version: s.version, decision: approved ? 'Approved' : 'Rejected', by: user.id, reason: reason.trim(), at: nowIso() });
  notify(
    s.ownerId,
    s.id,
    approved ? 'approved' : 'rejected',
    approved
      ? `"${s.title}" v${s.version} was approved. You can publish it now.`
      : `"${s.title}" v${s.version} was rejected: ${reason.trim()}`,
    `decision:${s.id}:v${s.version}`,
  );
  audit(user.id, `${decision}_survey`, 'Survey', id);
  save();
  return withMeta(s);
}
