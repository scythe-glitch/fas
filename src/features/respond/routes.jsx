import SurveyList from './SurveyList.jsx';
import TakeSurvey from './TakeSurvey.jsx';

export default [
  {
    path: 'surveys',
    element: <SurveyList />,
    roles: ['respondent'],
    nav: 'My Surveys',
    description: 'Find your pending surveys and submit feedback.',
    order: 10,
  },
  { path: 'surveys/:id', element: <TakeSurvey />, roles: ['respondent'] },
];
