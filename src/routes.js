import { canAccess } from './utils/roles.js';

// Every features/<name>/routes.jsx is picked up automatically. A route looks like:
// { path, element, roles?, nav?, description?, order?, public? }
const modules = import.meta.glob('./features/*/routes.jsx', { eager: true });

const routes = Object.values(modules).flatMap((m) => m.default);

export const publicRoutes = routes.filter((r) => r.public);
export const privateRoutes = routes.filter((r) => !r.public);

export function navFor(user) {
  return privateRoutes
    .filter((r) => r.nav && canAccess(user, r.roles))
    .sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
}
