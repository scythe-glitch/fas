import Dashboard from './Dashboard.jsx';
import SurveyResults from './SurveyResults.jsx';

const roles = ['coordinator', 'approver', 'faculty', 'management'];

export default [
  {
    path: 'analytics',
    element: <Dashboard />,
    roles,
    nav: 'Analytics',
    description: 'Response rates and aggregated results.',
    order: 40,
  },
  { path: 'analytics/:id', element: <SurveyResults />, roles },
];
