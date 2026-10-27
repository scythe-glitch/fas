import { academicSession } from '../utils/format.js';

// Text wordmark for the institute; replace with the official logo image if one is provided.
export function Logo({ small = false }) {
  return (
    <div className={small ? 'logo logo-small' : 'logo'} aria-label="LNMIIT">
      <span className="logo-word">
        LNMIIT
        <span className="logo-squares" aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
        </span>
      </span>
      <span className="logo-sub">The LNM Institute of Information Technology</span>
    </div>
  );
}

// Maroon strip shown above the app header.
export function InstituteBar({ children }) {
  return (
    <div className="institute-bar">
      <span>
        <strong>THE LNM INSTITUTE OF INFORMATION TECHNOLOGY, JAIPUR</strong>
        <span className="institute-bar-tag">
          <span className="institute-bar-sep">|</span>
          Deemed-to-be-University
        </span>
      </span>
      <span className="institute-bar-right">
        <strong>Academic Session {academicSession().year}</strong>
        {children}
      </span>
    </div>
  );
}
