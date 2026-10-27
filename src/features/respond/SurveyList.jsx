import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { listEligibleSurveys } from '../../api/responses.js';
import StatusBadge from '../../components/StatusBadge.jsx';
import { formatDate } from '../../utils/format.js';

const TARGET_TYPES = ['Course', 'Faculty', 'Event', 'Service'];

export default function SurveyList() {
  const { user } = useAuth();
  const [surveys, setSurveys] = useState([]);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [term, setTerm] = useState('');
  const [completion, setCompletion] = useState('');

  useEffect(() => {
    listEligibleSurveys(user).then(setSurveys);
  }, [user]);

  const terms = [...new Set(surveys.map((s) => s.term))];
  const visible = surveys.filter(
    (s) =>
      s.title.toLowerCase().includes(search.trim().toLowerCase()) &&
      (!type || s.target?.type === type) &&
      (!term || s.term === term) &&
      (!completion || (completion === 'Completed') === s.completed),
  );

  return (
    <>
      <h1>My Surveys</h1>

      <div className="filters">
        <input type="search" placeholder="Search by title" aria-label="Search by title" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select aria-label="Target type" value={type} onChange={(e) => setType(e.target.value)}>
          <option value="">All targets</option>
          {TARGET_TYPES.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
        <select aria-label="Term" value={term} onChange={(e) => setTerm(e.target.value)}>
          <option value="">All terms</option>
          {terms.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
        <select aria-label="Completion status" value={completion} onChange={(e) => setCompletion(e.target.value)}>
          <option value="">Any status</option>
          <option>Pending</option>
          <option>Completed</option>
        </select>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Survey</th>
              <th>Target</th>
              <th>Term</th>
              <th>Closes</th>
              <th>Collection</th>
              <th>Your status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {visible.map((s) => (
              <tr key={s.id}>
                <td>{s.title}</td>
                <td>
                  {s.target?.name} <span className="muted">({s.target?.type})</span>
                </td>
                <td>{s.term}</td>
                <td>{formatDate(s.closingAt)}</td>
                <td>
                  <StatusBadge status={s.state} />
                </td>
                <td>
                  <StatusBadge status={s.completed ? 'Completed' : 'Pending'} />
                </td>
                <td>
                  <Link className="btn btn-small" to={`/surveys/${s.id}`}>
                    {s.state === 'Open' && !s.completed ? 'Give feedback' : 'View'}
                  </Link>
                </td>
              </tr>
            ))}
            {visible.length === 0 && (
              <tr>
                <td colSpan={7} className="muted">
                  No surveys match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
