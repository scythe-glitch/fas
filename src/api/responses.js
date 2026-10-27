import { db, save, newId, collectionState, findTarget, ApiError } from './db.js';

export const MAX_TEXT_LENGTH = 1000;

const isEmpty = (value) => value == null || String(value).trim() === '';

// Shared by the form (instant feedback) and submitResponse (final check) — FR-021, BR-007.
export function validateAnswers(survey, answers) {
  const errors = {};
  for (const q of survey.questions) {
    const value = answers[q.id];
    if (isEmpty(value)) {
      if (q.required) errors[q.id] = 'This question is required.';
      continue;
    }
    if (q.type === 'rating' && !(Number.isInteger(value) && value >= 1 && value <= 5)) {
      errors[q.id] = 'Choose a rating from 1 to 5.';
    }
    if (q.type === 'choice' && !q.options.includes(value)) {
      errors[q.id] = 'Choose one of the listed options.';
    }
    if (q.type === 'text' && String(value).length > MAX_TEXT_LENGTH) {
      errors[q.id] = `Keep your answer within ${MAX_TEXT_LENGTH} characters.`;
    }
  }
  return errors;
}

const hasCompleted = (surveyId, userId) =>
  db().participation.some((p) => p.surveyId === surveyId && p.userId === userId);

const isVisibleTo = (survey, userId) =>
  (survey.status === 'Published' || survey.status === 'Closed') && survey.audience.includes(userId);

function withMeta(survey, userId) {
  return {
    ...survey,
    target: findTarget(survey.targetId),
    state: collectionState(survey),
    completed: hasCompleted(survey.id, userId),
  };
}

// Published, non-cancelled surveys whose frozen audience includes the user (FR-017).
export async function listEligibleSurveys(user) {
  return db()
    .surveys.filter((s) => isVisibleTo(s, user.id))
    .map((s) => withMeta(s, user.id));
}

export async function getEligibleSurvey(user, surveyId) {
  const survey = db().surveys.find((s) => s.id === surveyId);
  if (!survey || !isVisibleTo(survey, user.id)) throw new ApiError('Survey not found.');
  return withMeta(survey, user.id);
}

export async function submitResponse(user, surveyId, answers) {
  const d = db();
  const survey = d.surveys.find((s) => s.id === surveyId);
  const account = d.users.find((u) => u.id === user.id);

  // Recheck eligibility and the collection window right before saving (FR-022).
  if (!survey || !survey.audience.includes(user.id) || account?.status !== 'active') {
    throw new ApiError('You are not eligible to submit this survey.');
  }
  if (collectionState(survey) !== 'Open') throw new ApiError('This survey is not open for responses.');
  if (hasCompleted(surveyId, user.id)) throw new ApiError('Already submitted.');

  const errors = validateAnswers(survey, answers);
  if (Object.keys(errors).length) throw new ApiError('Some answers need correction.', errors);

  const clean = {};
  for (const q of survey.questions) {
    const value = answers[q.id];
    if (!isEmpty(value)) clean[q.id] = q.type === 'text' ? String(value).trim() : value;
  }

  // Anonymous answers carry no respondent id; completion is tracked separately (FR-026).
  d.responses.push({
    id: newId('r'),
    surveyId,
    version: survey.version,
    respondentId: survey.anonymity === 'identified' ? user.id : null,
    answers: clean,
  });
  d.participation.push({ surveyId, userId: user.id });
  save();
  return { status: 'Completed' };
}
