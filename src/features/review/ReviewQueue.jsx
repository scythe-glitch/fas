import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { listReviewQueue } from '../../api/surveys.js';
import { formatDate } from '../../utils/format.js';

export default function ReviewQueue() {
  const { user } = useAuth();
  const [queue, setQueue] = useState([]);

  useEffect(() => {
    listReviewQueue(user).then(setQueue);
  }, [user]);

  return (
    <>
      <h1>Review Queue</h1>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Survey</th>
              <th>Version</th>
              <th>Target</th>
              <th>Term</th>
              <th>Submitted</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {queue.map((s) => (
              <tr key={s.id}>
                <td>{s.title}</td>
                <td>v{s.version}</td>
                <td>{s.target?.name}</td>
                <td>{s.term}</td>
                <td>{formatDate(s.history.at(-1)?.at)}</td>
                <td>
                  <Link className="btn btn-small btn-primary" to={`/review/${s.id}`}>
                    Review
                  </Link>
                </td>
              </tr>
            ))}
            {queue.length === 0 && (
              <tr>
                <td colSpan={6} className="muted">
                  Nothing is waiting for your review.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
