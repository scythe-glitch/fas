// Quotes special characters and neutralises spreadsheet formula prefixes (FR-040).
function cell(value) {
  let text = value == null ? '' : String(value);
  if (/^[=+\-@]/.test(text)) text = `'${text}`;
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function toCsv(rows) {
  return rows.map((row) => row.map(cell).join(',')).join('\r\n');
}

export function downloadFile(filename, content, type = 'text/csv;charset=utf-8') {
  // The BOM makes Excel open the file as UTF-8.
  const url = URL.createObjectURL(new Blob(['﻿', content], { type }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
