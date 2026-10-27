import MySurveys from './MySurveys.jsx';
import SurveyDetail from './SurveyDetail.jsx';
import SurveyEditor from './SurveyEditor.jsx';

const roles = ['coordinator'];

export default [
  {
    path: 'manage',
    element: <MySurveys />,
    roles,
    nav: 'Manage Surveys',
    description: 'Create, submit, publish and close your surveys.',
    order: 20,
  },
  { path: 'manage/new', element: <SurveyEditor />, roles },
  { path: 'manage/:id', element: <SurveyDetail />, roles },
  { path: 'manage/:id/edit', element: <SurveyEditor />, roles },
];
