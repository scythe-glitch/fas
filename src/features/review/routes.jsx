import ReviewQueue from './ReviewQueue.jsx';
import ReviewSurvey from './ReviewSurvey.jsx';

export default [
  {
    path: 'review',
    element: <ReviewQueue />,
    roles: ['approver'],
    nav: 'Review Queue',
    description: 'Approve or reject surveys submitted for review.',
    order: 30,
  },
  { path: 'review/:id', element: <ReviewSurvey />, roles: ['approver'] },
];
