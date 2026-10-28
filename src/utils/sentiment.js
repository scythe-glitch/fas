// Basic English rule-based sentiment (FR-032, BR-016). A coarse summary, not a judgement of a person.
export const CLASSIFIER_VERSION = 'lexicon-1.0';

const POSITIVE = new Set([
  'good', 'great', 'excellent', 'helpful', 'useful', 'clear', 'love', 'loved', 'nice', 'amazing',
  'best', 'enjoyed', 'interesting', 'engaging', 'well', 'friendly', 'informative',
]);
const NEGATIVE = new Set([
  'bad', 'poor', 'boring', 'confusing', 'hard', 'worst', 'late', 'unclear', 'difficult',
  'rude', 'slow', 'useless', 'crowded', 'noisy', 'waste',
]);

export function classify(text) {
  const words = String(text).toLowerCase().match(/[a-z']+/g);
  // Text without English words (e.g. another script) is not classified.
  if (!words) return 'Unclassified';
  let score = 0;
  for (const w of words) {
    if (POSITIVE.has(w)) score += 1;
    if (NEGATIVE.has(w)) score -= 1;
  }
  if (score > 0) return 'Positive';
  if (score < 0) return 'Negative';
  return 'Neutral';
}
