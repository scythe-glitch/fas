import Reports from './Reports.jsx';

export default [
  {
    path: 'reports',
    element: <Reports />,
    roles: ['coordinator', 'approver', 'faculty', 'management'],
    nav: 'Reports',
    description: 'Generate aggregate reports and export to CSV or PDF.',
    order: 50,
  },
];
