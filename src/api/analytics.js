import { db, save, audit, collectionState, findTarget, ApiError } from './db.js';
import { questionStats, responseRate } from '../utils/analytics.js';

const RESULT_STATUSES = ['Published', 'Closed', 'Cancelled'];

// Reporting scope per role (BR-014). Administrators need an extra reporting role to see results.
function canView(user, survey) {
  const target = findTarget(survey.targetId);
  if (user.roles.includes('management')) return true;
  if (user.roles.includes('coordinator') && survey.ownerId === user.id) return true;
  if (user.roles.includes('approver') && target?.departmentId === user.departmentId) return true;
  if (user.roles.includes('faculty') && target?.facultyIds.includes(user.id)) return true;
  return false;
}

function summarize(survey) {
  const responses = db().responses.filter((r) => r.surveyId === survey.id);
  return {
    ...survey,
    target: findTarget(survey.targetId),
    state: collectionState(survey),
    eligible: survey.audience.length, // frozen audience is the denominator (FR-027)
    accepted: responses.length,
    rate: responseRate(responses.length, survey.audience.length),
  };
}

export async function listAnalyticsSurveys(user) {
  return db()
    .surveys.filter((s) => RESULT_STATUSES.includes(s.status) && canView(user, s))
    .map(summarize);
}

export async function getSurveyResults(user, id) {
  const survey = db().surveys.find((s) => s.id === id);
  if (!survey || !RESULT_STATUSES.includes(survey.status) || !canView(user, survey)) {
    throw new ApiError('Survey not found or outside your reporting scope.');
  }
  const responses = db().responses.filter((r) => r.surveyId === id);
  return { ...summarize(survey), stats: survey.questions.map((q) => questionStats(q, responses)) };
}

// Export audit records hold the scope and format only, never answer content (FR-041).
export async function recordExport(user, surveyIds, format, result = 'success') {
  audit(user.id, `export_${format}`, 'Report', surveyIds.join(', '), result);
  save();
}
