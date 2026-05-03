import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Alumnos from './pages/Alumnos';
import Maestros from './pages/Maestros';
import Reservaciones from './pages/Reservaciones';
import Anuncios from './pages/Anuncios';

function PrivateRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.rol !== 'admin') return <Navigate to="/login" replace />;
  return children;
}

function AppRoutes() {
  const { user } = useAuth();
  const isAdmin = user?.rol === 'admin';

  return (
    <Routes>
      <Route path="/login" element={isAdmin ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/dashboard"    element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/alumnos"      element={<PrivateRoute><Alumnos /></PrivateRoute>} />
      <Route path="/maestros"     element={<PrivateRoute><Maestros /></PrivateRoute>} />
      <Route path="/reservaciones" element={<PrivateRoute><Reservaciones /></PrivateRoute>} />
      <Route path="/anuncios"      element={<PrivateRoute><Anuncios /></PrivateRoute>} />
      <Route path="*" element={<Navigate to={isAdmin ? '/dashboard' : '/login'} replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
