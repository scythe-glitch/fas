import Login from './Login.jsx';
import Register from './Register.jsx';

export default [
  { path: '/login', element: <Login />, public: true },
  { path: '/register', element: <Register />, public: true },
];
