import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import Layout from './components/Layout.jsx';
import Home from './pages/Home.jsx';
import NotFound from './pages/NotFound.jsx';
import { privateRoutes, publicRoutes } from './routes.js';
import { canAccess } from './utils/roles.js';

function Forbidden() {
  return <div className="alert alert-error">You do not have permission to view this page.</div>;
}

export default function App() {
  const { user } = useAuth();

  return (
    <Routes>
      {publicRoutes.map((r) => (
        <Route key={r.path} path={r.path} element={user ? <Navigate to="/" replace /> : r.element} />
      ))}

      <Route element={user ? <Layout /> : <Navigate to="/login" replace />}>
        <Route index element={<Home />} />
        {privateRoutes.map((r) => (
          <Route key={r.path} path={r.path} element={canAccess(user, r.roles) ? r.element : <Forbidden />} />
        ))}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
