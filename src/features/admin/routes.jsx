import AuditLog from './AuditLog.jsx';
import Policy from './Policy.jsx';
import Users from './Users.jsx';

const roles = ['admin'];

export default [
  { path: 'admin/users', element: <Users />, roles, nav: 'Users & Roles', description: 'Activate accounts and assign roles.', order: 60 },
  { path: 'admin/audit', element: <AuditLog />, roles, nav: 'Audit Log', description: 'Review privileged actions and exports.', order: 70 },
  { path: 'admin/policy', element: <Policy />, roles, nav: 'Policy', description: 'Email domain, approval and retention rules.', order: 80 },
];
