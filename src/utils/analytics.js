import { classify, CLASSIFIER_VERSION } from './sentiment.js';

// Question results are hidden below this many non-empty answers (BR-010).
export const MIN_ANSWERS = 5;

// Response rate in percent, or null (shown as N/A) when nobody is eligible (BR-011).
export function responseRate(accepted, eligible) {
  return eligible > 0 ? (100 * accepted) / eligible : null;
}

export function questionStats(question, responses) {
  const values = responses
    .map((r) => r.answers[question.id])
    .filter((v) => v != null && String(v).trim() !== '');
  const stats = { question, answered: values.length, suppressed: values.length < MIN_ANSWERS };
  if (stats.suppressed) return stats;

  if (question.type === 'rating') {
    stats.mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    stats.distribution = [1, 2, 3, 4, 5].map((n) => ({ label: String(n), count: values.filter((v) => v === n).length }));
    stats.denominator = values.length;
  } else if (question.type === 'choice') {
    stats.distribution = question.options.map((o) => ({ label: o, count: values.filter((v) => v === o).length }));
    stats.denominator = values.length;
  } else {
    const categories = values.map(classify);
    stats.distribution = ['Positive', 'Neutral', 'Negative'].map((c) => ({ label: c, count: categories.filter((x) => x === c).length }));
    stats.unclassified = categories.filter((c) => c === 'Unclassified').length;
    stats.denominator = values.length - stats.unclassified;
    stats.classifier = CLASSIFIER_VERSION;
  }
  return stats;
}

export const percent = (count, denominator) => (denominator ? (100 * count) / denominator : null);

// One-line text form of a question's result, used by the report table and CSV export.
export function describeStats(stats) {
  if (stats.suppressed) return 'Insufficient responses';
  const parts = stats.distribution.map((d) => {
    const p = percent(d.count, stats.denominator);
    return `${d.label}: ${d.count} (${p == null ? 'N/A' : p.toFixed(2) + '%'})`;
  });
  if (stats.question.type === 'rating') return `Mean ${stats.mean.toFixed(2)}; ${parts.join('; ')}`;
  if (stats.question.type === 'text') {
    return `${parts.join('; ')}; Unclassified: ${stats.unclassified} (heuristic, ${stats.classifier})`;
  }
  return parts.join('; ');
}
