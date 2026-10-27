import { Logo } from '../../components/Brand.jsx';
import { academicSession } from '../../utils/format.js';

// Institute header shown above the sign-in and registration pages.
export default function AuthHeader() {
  const session = academicSession();
  return (
    <header className="auth-header">
      <div className="app-header-brand">
        <Logo />
        <span className="app-title">
          <strong>The LNM Institute of Information Technology</strong>
          <small>Deemed-to-be-University • Jaipur, Rajasthan</small>
        </span>
      </div>
      <span className="session-pill">
        Academic Session {session.year} ({session.semester} Semester)
      </span>
    </header>
  );
}
