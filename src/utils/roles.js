export const ROLE_LABELS = {
  respondent: 'Respondent',
  coordinator: 'Coordinator',
  approver: 'Approver',
  faculty: 'Faculty / Staff',
  management: 'Management',
  admin: 'Administrator',
};

export const roleLabel = (role) => ROLE_LABELS[role] || role;

export const hasRole = (user, role) => !!user && user.roles.includes(role);

// `roles` undefined means any signed-in user may access.
export const canAccess = (user, roles) => !!user && (!roles || roles.some((r) => user.roles.includes(r)));
