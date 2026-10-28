# Feedback Analytics System (FAS) — Frontend

Web frontend for the Feedback Analytics System (CS314, Team T093).
Built with **React 18 + Vite + React Router**, styled with plain CSS.

## Getting started

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
```

## Demo accounts

All demo accounts use the password `password`.

| Role           | Email                       |
| -------------- | --------------------------- |
| Respondent     | student1@lnmiit.ac.in (… student8) |
| Coordinator    | coordinator@lnmiit.ac.in    |
| Approver       | head@lnmiit.ac.in           |
| Administrator  | admin@lnmiit.ac.in          |
| Faculty / Staff| faculty@lnmiit.ac.in        |
| Management     | management@lnmiit.ac.in     |

Survey dates are seeded relative to the first time the app loads. Use **Reset demo data**
on the login page to restore the seed (for example, after a seeded survey has closed).

## Project structure

```
src/
  api/          Mock backend (localStorage). One file per area: auth, responses, surveys, ...
  components/   Shared UI (Layout, StatusBadge, SurveySummary)
  context/      AuthContext (current user, login, logout)
  features/     One folder per feature; each has a routes.jsx
  pages/        App-level pages (Home, NotFound)
  utils/        Formatting, roles, analytics, CSV helpers
  routes.js     Collects routes from every features/*/routes.jsx
```

### Adding a page

1. Create the component inside a feature folder, e.g. `src/features/reports/MyPage.jsx`.
2. Add it to that folder's `routes.jsx`:
   ```js
   { path: 'my-page', element: <MyPage />, roles: ['coordinator'], nav: 'My Page', order: 55 }
   ```
   `roles` limits who can open it, `nav` adds it to the sidebar. Routes without `nav` are
   reachable by link only (e.g. detail pages with `:id`).

New feature folders are picked up automatically; `App.jsx` does not need to change.

### Connecting the real backend

Pages only call functions from `src/api/*.js`. Every function is `async`, so swapping the
localStorage implementation for `fetch` calls to the backend does not require page changes.
`src/api/db.js` and `src/api/seed.js` can be deleted once all API files talk to the server.

## Requirement coverage (SRS v1.0)

| Area | Pages | FRs |
| ---- | ----- | --- |
| Login / registration | Login, Register | FR-001 – FR-003 |
| Respondent surveys | My Surveys, Take Survey | FR-017 – FR-026 |
| Survey management | Manage Surveys, Editor, Detail | FR-006 – FR-016 |
| Review | Review Queue, Review Survey | FR-010 – FR-013 |
| Notifications | Notifications | FR-034 – FR-037 |
| Analytics | Analytics, Results | FR-027 – FR-029, FR-031 – FR-033 |
| Reports | Reports (CSV / PDF via print) | FR-038 – FR-041 |
| Administration | Users, Audit Log, Policy | FR-004, FR-042, FR-043 |

Security rules (role checks, eligibility, duplicate prevention) are mirrored in the mock API
so the UI behaves correctly, but they must be enforced by the backend.
