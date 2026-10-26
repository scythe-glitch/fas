// Demo data used until the backend exists. Dates are relative to when the seed is created.
const DAY = 24 * 60 * 60 * 1000;
const at = (days) => new Date(Date.now() + days * DAY).toISOString();

const COURSE_QUESTIONS = [
  { id: 'q1', key: 'course-content', type: 'rating', text: 'Rate the course content', required: true, options: [] },
  { id: 'q2', key: 'instructor-clarity', type: 'rating', text: "Rate the instructor's clarity", required: true, options: [] },
  {
    id: 'q3',
    key: 'course-pace',
    type: 'choice',
    text: 'How was the pace of the course?',
    required: true,
    options: ['Too slow', 'Just right', 'Too fast'],
  },
  { id: 'q4', key: 'course-comments', type: 'text', text: 'Any other comments?', required: false, options: [] },
];

const EVENT_QUESTIONS = [
  { id: 'e1', key: 'event-overall', type: 'rating', text: 'Overall event rating', required: true, options: [] },
  { id: 'e2', key: 'event-again', type: 'choice', text: 'Would you attend again?', required: true, options: ['Yes', 'No', 'Maybe'] },
];

const LIBRARY_QUESTIONS = [
  { id: 'l1', key: 'library-availability', type: 'rating', text: 'Availability of books', required: true, options: [] },
  { id: 'l2', key: 'library-staff', type: 'rating', text: 'Helpfulness of library staff', required: true, options: [] },
  { id: 'l3', key: 'library-suggestions', type: 'text', text: 'Suggestions for improvement', required: false, options: [] },
];

const COURSE_ANSWERS = [
  { q1: 5, q2: 4, q3: 'Just right', q4: 'Great course, very useful projects' },
  { q1: 4, q2: 4, q3: 'Too fast', q4: 'The pace was hard to follow' },
  { q1: 4, q2: 3, q3: 'Just right', q4: 'Lectures were confusing at times' },
  { q1: 3, q2: 5, q3: 'Just right', q4: 'Good examples in class' },
  { q1: 5, q2: 2, q3: 'Too slow' },
  { q1: 4, q2: 4, q3: 'Just right', q4: 'Helpful labs' },
];

const user = (id, name, email, roles, status = 'active') => ({
  id,
  name,
  email,
  password: 'password', // mock only; the real backend stores salted hashes (NFR-004)
  status,
  departmentId: 'cse',
  roles,
});

export function createSeed() {
  const students = Array.from({ length: 8 }, (_, i) =>
    user(`u_s${i + 1}`, `Student ${i + 1}`, `student${i + 1}@lnmiit.ac.in`, ['respondent']),
  );
  const users = [
    ...students,
    user('u_coord', 'Coordinator Demo', 'coordinator@lnmiit.ac.in', ['coordinator']),
    user('u_head', 'Dept. Head Demo', 'head@lnmiit.ac.in', ['approver']),
    user('u_admin', 'Admin Demo', 'admin@lnmiit.ac.in', ['admin']),
    user('u_fac', 'Faculty Demo', 'faculty@lnmiit.ac.in', ['faculty']),
    user('u_mgmt', 'Management Demo', 'management@lnmiit.ac.in', ['management']),
    user('u_new', 'New Student', 'newstudent@lnmiit.ac.in', ['respondent'], 'pending'),
  ];
  const audience = students.map((s) => s.id);

  const surveys = [
    {
      id: 's1',
      version: 1,
      title: 'CS314 Course Feedback',
      purpose: 'Mid-term feedback on CS314 Software Engineering.',
      targetId: 't1',
      term: '2026-Odd',
      ownerId: 'u_coord',
      instructions: 'Answer honestly. This survey is anonymous.',
      anonymity: 'anonymous',
      approvalRequired: true,
      approverId: 'u_head',
      openingAt: at(-2),
      closingAt: at(5),
      status: 'Published',
      publishedAt: at(-3),
      retentionMonths: 12,
      audience,
      questions: COURSE_QUESTIONS,
      history: [
        { version: 1, decision: 'Submitted', by: 'u_coord', reason: '', at: at(-5) },
        { version: 1, decision: 'Approved', by: 'u_head', reason: '', at: at(-4) },
      ],
    },
    {
      id: 's2',
      version: 1,
      title: 'Tech Fest 2026 Feedback',
      purpose: 'Feedback on the annual technical festival.',
      targetId: 't2',
      term: '2026-Odd',
      ownerId: 'u_coord',
      instructions: 'Tell us about your experience at the fest.',
      anonymity: 'identified',
      approvalRequired: true,
      approverId: 'u_head',
      openingAt: at(-20),
      closingAt: at(-10),
      status: 'Published',
      publishedAt: at(-21),
      retentionMonths: 12,
      audience,
      questions: EVENT_QUESTIONS,
      history: [
        { version: 1, decision: 'Submitted', by: 'u_coord', reason: '', at: at(-23) },
        { version: 1, decision: 'Approved', by: 'u_head', reason: '', at: at(-22) },
      ],
    },
    {
      id: 's3',
      version: 1,
      title: 'Library Services Feedback',
      purpose: 'Understand how students use the central library.',
      targetId: 't3',
      term: '2026-Odd',
      ownerId: 'u_coord',
      instructions: 'Rate the library services you used this term.',
      anonymity: 'anonymous',
      approvalRequired: true,
      approverId: 'u_head',
      openingAt: at(2),
      closingAt: at(9),
      status: 'UnderReview',
      audience,
      questions: LIBRARY_QUESTIONS,
      history: [{ version: 1, decision: 'Submitted', by: 'u_coord', reason: '', at: at(-1) }],
    },
    {
      id: 's4',
      version: 1,
      title: 'Git Workshop Feedback',
      purpose: '',
      targetId: 't4',
      term: '2026-Odd',
      ownerId: 'u_coord',
      instructions: '',
      anonymity: 'anonymous',
      openingAt: '',
      closingAt: '',
      status: 'Draft',
      audience: [],
      questions: [{ id: 'g1', key: 'workshop-overall', type: 'rating', text: 'Overall workshop rating', required: true, options: [] }],
      history: [],
    },
  ];

  const responses = [
    ...COURSE_ANSWERS.map((answers, i) => ({ id: `r_s1_${i}`, surveyId: 's1', version: 1, respondentId: null, answers })),
    { id: 'r_s2_0', surveyId: 's2', version: 1, respondentId: 'u_s1', answers: { e1: 4, e2: 'Yes' } },
    { id: 'r_s2_1', surveyId: 's2', version: 1, respondentId: 'u_s2', answers: { e1: 5, e2: 'Yes' } },
    { id: 'r_s2_2', surveyId: 's2', version: 1, respondentId: 'u_s3', answers: { e1: 3, e2: 'Maybe' } },
  ];

  const participation = [
    ...students.slice(1, 7).map((s) => ({ surveyId: 's1', userId: s.id })),
    ...['u_s1', 'u_s2', 'u_s3'].map((userId) => ({ surveyId: 's2', userId })),
  ];

  return {
    users,
    departments: [
      { id: 'cse', name: 'Computer Science & Engineering' },
      { id: 'ece', name: 'Electronics & Communication' },
    ],
    targets: [
      { id: 't1', type: 'Course', name: 'CS314 Software Engineering', departmentId: 'cse', facultyIds: ['u_fac'] },
      { id: 't2', type: 'Event', name: 'Tech Fest 2026', departmentId: 'cse', facultyIds: [] },
      { id: 't3', type: 'Service', name: 'Central Library', departmentId: 'cse', facultyIds: [] },
      { id: 't4', type: 'Event', name: 'Git & GitHub Workshop', departmentId: 'cse', facultyIds: ['u_fac'] },
    ],
    surveys,
    responses,
    participation,
    notifications: [],
    audit: [],
    policy: { version: 1, emailDomain: 'lnmiit.ac.in', approvalRequired: true, retentionMonths: 12 },
    policyHistory: [],
  };
}
