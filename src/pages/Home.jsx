import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { getHomeSummary } from '../api/dashboard.js';
import Icon from '../components/Icon.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { navFor } from '../routes.js';
import { roleLabel } from '../utils/roles.js';
import { academicSession, formatDate, formatPct, greeting } from '../utils/format.js';

// Per-role dashboard: main action, four stat tiles and the list shown below them.
const DASHBOARDS = {
  respondent: {
    action: { label: 'Give Pending Feedback', to: '/surveys' },
    list: { title: 'My Assigned Surveys', note: 'Surveys you have been invited to respond to', to: '/surveys', link: 'View All Surveys' },
    tiles: (s) => [
      { label: 'Assigned surveys', value: s.assigned, note: 'Published surveys you are eligible for', icon: 'clipboard', tone: 'navy' },
      { label: 'Pending feedback', value: s.pending, note: 'Open and awaiting your response', icon: 'clock', tone: 'maroon' },
      { label: 'Completed', value: s.completed, note: 'Responses submitted', icon: 'check', tone: 'green' },
      { label: 'Closing soon', value: s.closingSoon, note: 'Pending surveys closing within 3 days', icon: 'bell', tone: 'amber' },
    ],
  },
  coordinator: {
    action: { label: 'Create New Survey', to: '/manage/new' },
    list: { title: 'My Surveys', note: 'Surveys you manage, with their current lifecycle status', to: '/manage', link: 'Manage All Surveys' },
    tiles: (s) => [
      { label: 'My surveys', value: s.total, note: 'Across all terms', icon: 'clipboard', tone: 'navy' },
      { label: 'Open now', value: s.open, note: `${s.openResponses} responses collected so far`, icon: 'inbox', tone: 'maroon' },
      { label: 'Under review', value: s.underReview, note: 'Waiting for the approver', icon: 'clock', tone: 'amber' },
      { label: 'Drafts', value: s.drafts, note: 'Draft or rejected, not yet submitted', icon: 'edit', tone: 'green' },
    ],
  },
  approver: {
    action: { label: 'Open Review Queue', to: '/review' },
    list: { title: 'Awaiting Your Decision', note: 'Surveys submitted for approval in your department', to: '/review', link: 'Open Review Queue' },
    tiles: (s) => [
      { label: 'Pending reviews', value: s.pending, note: 'Surveys awaiting your decision', icon: 'clock', tone: 'amber' },
      { label: 'Approved', value: s.approved, note: 'Decisions you have approved', icon: 'check', tone: 'green' },
      { label: 'Rejected', value: s.rejected, note: 'Returned to coordinators with a reason', icon: 'edit', tone: 'maroon' },
      { label: 'Unread notices', value: null, note: 'Notifications waiting for you', icon: 'bell', tone: 'navy' },
    ],
  },
  reporting: {
    action: { label: 'View Analytics', to: '/analytics' },
    list: { title: 'Surveys in Your Reporting Scope', note: 'Aggregate results only; individual answers are never shown', to: '/analytics', link: 'Open Analytics' },
    tiles: (s) => [
      { label: 'Surveys', value: s.surveys, note: 'Published or closed, in your scope', icon: 'clipboard', tone: 'navy' },
      { label: 'Responses', value: s.responses, note: `From ${s.eligible} eligible respondents`, icon: 'users', tone: 'maroon' },
      { label: 'Response rate', value: formatPct(s.rate), note: 'Responses ÷ eligible respondents', icon: 'percent', tone: 'green' },
      { label: 'Open now', value: s.open, note: 'Still collecting feedback', icon: 'clock', tone: 'amber' },
    ],
  },
  admin: {
    action: { label: 'Manage Users & Roles', to: '/admin/users' },
    list: null,
    tiles: (s) => [
      { label: 'Registered users', value: s.users, note: `${s.active} active accounts`, icon: 'users', tone: 'navy' },
      { label: 'Pending activation', value: s.pending, note: 'New registrations to review', icon: 'clock', tone: 'amber' },
      { label: 'Audit entries', value: s.auditEntries, note: 'Privileged actions recorded', icon: 'shield', tone: 'maroon' },
      { label: 'Policy version', value: `v${s.policyVersion}`, note: 'Domain, approval and retention rules', icon: 'settings', tone: 'green' },
    ],
  },
};
DASHBOARDS.faculty = DASHBOARDS.reporting;
DASHBOARDS.management = DASHBOARDS.reporting;

function StatTile({ label, value, note, icon, tone }) {
  return (
    <div className={`stat-tile tone-${tone}`}>
      <div className="stat-tile-head">
        <span className="stat-tile-label">{label}</span>
        <span className="stat-tile-icon">
          <Icon name={icon} />
        </span>
      </div>
      <div className="stat-tile-value">{value}</div>
      <div className="stat-tile-note">{note}</div>
    </div>
  );
}

export default function Home() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const session = academicSession();

  useEffect(() => {
    getHomeSummary(user).then(setSummary);
  }, [user]);

  const dashboard = summary && DASHBOARDS[summary.role];
  const tiles = dashboard ? dashboard.tiles(summary.stats).map((t) => (t.value === null ? { ...t, value: summary.unread } : t)) : [];
  const links = navFor(user);

  return (
    <>
      <section className="card hero">
        <h1>
          {greeting()}, {user.name} <span aria-hidden="true">👋</span>
        </h1>
        <p className="hero-meta">
          <span>{user.roles.map(roleLabel).join(', ')}</span>
          {summary?.department && <strong>Department of {summary.department}</strong>}
          <span>
            Academic Session {session.year} ({session.semester})
          </span>
        </p>
        {dashboard && (
          <Link className="btn btn-primary btn-large" to={dashboard.action.to}>
            <Icon name="plus" /> {dashboard.action.label}
          </Link>
        )}
      </section>

      {tiles.length > 0 && (
        <div className="stat-tiles">
          {tiles.map((t) => (
            <StatTile key={t.label} {...t} />
          ))}
        </div>
      )}

      {dashboard?.list && (
        <section className="card">
          <div className="section-header">
            <div>
              <h2>{dashboard.list.title}</h2>
              <p className="muted">{dashboard.list.note}</p>
            </div>
            <Link className="btn" to={dashboard.list.to}>
              {dashboard.list.link} <Icon name="arrow" size={16} />
            </Link>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Survey</th>
                  <th>Target</th>
                  <th>Term</th>
                  <th>Closes</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {summary.rows.slice(0, 5).map((r) => (
                  <tr key={r.id}>
                    <td>
                      <strong>{r.title}</strong>
                    </td>
                    <td>
                      {r.target ? (
                        <>
                          {r.target.name} <span className="type-chip">{r.target.type}</span>
                        </>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="nowrap">{r.term || '—'}</td>
                    <td>{formatDate(r.closingAt)}</td>
                    <td>
                      <StatusBadge status={r.status} />
                    </td>
                    <td>
                      <Link className="btn btn-small" to={r.to}>
                        Open
                      </Link>
                    </td>
                  </tr>
                ))}
                {summary.rows.length === 0 && (
                  <tr>
                    <td colSpan={6} className="muted">
                      Nothing here yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {links.length > 0 && (
        <section className="card">
          <h2>Quick Access</h2>
          <div className="link-grid">
            {links.map((r) => (
              <Link key={r.path} to={`/${r.path}`} className="link-card">
                <strong>{r.nav}</strong>
                <span className="muted">{r.description}</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
