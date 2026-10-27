import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { listNotifications, markAllRead, markRead } from '../../api/notifications.js';
import { formatDate } from '../../utils/format.js';

const TYPE_LABELS = {
  opening: 'Survey open',
  reminder: 'Reminder',
  approved: 'Approved',
  rejected: 'Rejected',
  closed: 'Closed early',
  cancelled: 'Cancelled',
};

// Respondents open the survey itself; coordinators open their survey's management page.
const linkFor = (n) => (n.type === 'approved' || n.type === 'rejected' ? `/manage/${n.surveyId}` : `/surveys/${n.surveyId}`);

export default function Notifications() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);

  const load = useCallback(() => listNotifications(user).then(setItems), [user]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleRead(id) {
    await markRead(user, id);
    load();
  }

  async function handleReadAll() {
    await markAllRead(user);
    load();
  }

  const unread = items.filter((n) => !n.readAt).length;

  return (
    <>
      <div className="page-header">
        <h1>Notifications</h1>
        <button className="btn" onClick={handleReadAll} disabled={unread === 0}>
          Mark all as read ({unread})
        </button>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Type</th>
              <th>Message</th>
              <th>Received</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {items.map((n) => (
              <tr key={n.id} style={{ fontWeight: n.readAt ? 'normal' : 600 }}>
                <td>{TYPE_LABELS[n.type] || n.type}</td>
                <td>
                  {n.message} <Link to={linkFor(n)}>Open</Link>
                </td>
                <td>{formatDate(n.createdAt)}</td>
                <td>
                  {n.readAt ? (
                    <span className="muted">Read</span>
                  ) : (
                    <button className="btn btn-small" onClick={() => handleRead(n.id)}>
                      Mark read
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={4} className="muted">
                  You have no notifications.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
