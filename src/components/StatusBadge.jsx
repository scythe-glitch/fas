// Status is always shown as text; colour is only a secondary cue (NFR-009).
const COLORS = {
  Open: 'green',
  Completed: 'green',
  Approved: 'green',
  Ready: 'green',
  active: 'green',
  success: 'green',
  Scheduled: 'blue',
  UnderReview: 'yellow',
  Pending: 'yellow',
  pending: 'yellow',
  Rejected: 'red',
  Cancelled: 'red',
  inactive: 'red',
  denied: 'red',
  failed: 'red',
};

const LABELS = { UnderReview: 'Under Review' };

export default function StatusBadge({ status }) {
  const color = COLORS[status];
  return <span className={color ? `badge badge-${color}` : 'badge'}>{LABELS[status] || status}</span>;
}
