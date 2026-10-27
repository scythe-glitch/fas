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

// Odd semester runs July–December, even semester January–June.
export function academicSession(date = new Date()) {
  const y = date.getFullYear();
  const odd = date.getMonth() >= 6;
  const start = odd ? y : y - 1;
  return { year: `${start}-${String(start + 1).slice(2)}`, semester: odd ? 'Odd' : 'Even' };
}

export function greeting(date = new Date()) {
  const h = date.getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
}

export function formatPct(value) {
  return value == null ? 'N/A' : `${value.toFixed(2)}%`;
}
