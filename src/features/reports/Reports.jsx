import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { getSurveyResults, listAnalyticsSurveys, recordExport } from '../../api/analytics.js';
import { describeStats, MIN_ANSWERS } from '../../utils/analytics.js';
import { downloadFile, toCsv } from '../../utils/csv.js';
import { formatDate, formatPct } from '../../utils/format.js';

const CSV_HEADER = [
  'Survey', 'Target', 'Term', 'Status', 'Opens', 'Closes', 'Eligible', 'Responses', 'Response rate',
  'Question', 'Type', 'Answered', 'Result',
];

function csvRows(report) {
  const rows = [CSV_HEADER];
  for (const r of report.results) {
    const base = [r.title, r.target?.name, r.term, r.state, formatDate(r.openingAt), formatDate(r.closingAt), r.eligible, r.accepted, formatPct(r.rate)];
    for (const s of r.stats) rows.push([...base, s.question.text, s.question.type, s.answered, describeStats(s)]);
  }
  return rows;
}

export default function Reports() {
  const { user } = useAuth();
  const [surveys, setSurveys] = useState([]);
  const [selected, setSelected] = useState([]);
  const [includeCancelled, setIncludeCancelled] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    listAnalyticsSurveys(user).then(setSurveys);
  }, [user]);

  const options = surveys.filter((s) => includeCancelled || s.status !== 'Cancelled');
  const toggle = (id) => setSelected((list) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]));

  async function generate() {
    setError('');
    const ids = selected.filter((id) => options.some((o) => o.id === id));
    if (ids.length === 0) {
      setError('Select at least one survey.');
      return;
    }
    try {
      const results = await Promise.all(ids.map((id) => getSurveyResults(user, id)));
      setReport({ generatedAt: new Date().toISOString(), includeCancelled, results });
    } catch (err) {
      setError(err.message);
    }
  }

  async function exportReport(format) {
    const ids = report.results.map((r) => r.id);
    try {
      if (format === 'csv') downloadFile(`fas-report-${report.generatedAt.slice(0, 10)}.csv`, toCsv(csvRows(report)));
      else window.print(); // the browser's "Save as PDF" produces the PDF
      await recordExport(user, ids, format);
    } catch (err) {
      await recordExport(user, ids, format, 'failed');
      setError(`Export failed: ${err.message}`);
    }
  }

  return (
    <>
      <div className="no-print">
        <h1>Reports</h1>
        {error && <div className="alert alert-error">{error}</div>}

        <div className="card">
          <h2>1. Choose surveys</h2>
          <label className="row" style={{ marginBottom: '0.5rem' }}>
            <input type="checkbox" checked={includeCancelled} onChange={(e) => setIncludeCancelled(e.target.checked)} /> Include cancelled
            surveys
          </label>
          <div className="checkbox-list">
            {options.map((s) => (
              <label key={s.id}>
                <input type="checkbox" checked={selected.includes(s.id)} onChange={() => toggle(s.id)} /> {s.title}{' '}
                <span className="muted">
                  ({s.term}, {s.state})
                </span>
              </label>
            ))}
            {options.length === 0 && <span className="muted">No surveys in your reporting scope.</span>}
          </div>
          <div className="row" style={{ marginTop: '1rem' }}>
            <button className="btn btn-primary" onClick={generate}>
              Generate report
            </button>
          </div>
        </div>

        {report && (
          <div className="card">
            <h2>2. Export</h2>
            <div className="row">
              <button className="btn" onClick={() => exportReport('csv')}>
                Download CSV
              </button>
              <button className="btn" onClick={() => exportReport('pdf')}>
                Print / Save as PDF
              </button>
            </div>
          </div>
        )}
      </div>

      {report && (
        <div className="card">
          <h1>FAS Aggregate Report</h1>
          <p className="muted">
            Generated {formatDate(report.generatedAt)} by {user.name}. Cancelled surveys {report.includeCancelled ? 'included' : 'excluded'}.
            Questions with fewer than {MIN_ANSWERS} answers are suppressed. No identities, individual answers or comments are included.
          </p>
          {report.results.map((r) => (
            <section key={r.id} style={{ marginBottom: '1.5rem' }}>
              <h2>{r.title}</h2>
              <p>
                {r.target?.name} · {r.term} · {r.state} · {formatDate(r.openingAt)} – {formatDate(r.closingAt)}
                <br />
                Responses: {r.accepted} of {r.eligible} eligible · Response rate: {formatPct(r.rate)}
              </p>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Question</th>
                      <th>Answered</th>
                      <th>Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {r.stats.map((s) => (
                      <tr key={s.question.id}>
                        <td>{s.question.text}</td>
                        <td>{s.answered}</td>
                        <td>{describeStats(s)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ))}
        </div>
      )}
    </>
  );
}
