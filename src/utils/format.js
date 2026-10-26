// Timestamps are stored in UTC and shown in Asia/Kolkata (BR-005).
const dateFormat = new Intl.DateTimeFormat('en-IN', {
  timeZone: 'Asia/Kolkata',
  dateStyle: 'medium',
  timeStyle: 'short',
});

export function formatDate(iso) {
  return iso ? `${dateFormat.format(new Date(iso))} IST` : '—';
}

// <input type="datetime-local"> works in local time without a timezone suffix.
export function toInputValue(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

export function fromInputValue(value) {
  return value ? new Date(value).toISOString() : '';
}

export function formatPct(value) {
  return value == null ? 'N/A' : `${value.toFixed(2)}%`;
}
