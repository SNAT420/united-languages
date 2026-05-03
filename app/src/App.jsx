import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { useNotificaciones } from './hooks/useNotificaciones';
import BottomNav from './components/BottomNav';
import BottomNavMaestro from './components/BottomNavMaestro';
import Login from './pages/Login';
import Reservar from './pages/Reservar';
import MisClases from './pages/MisClases';
import Perfil from './pages/Perfil';
import ClasesHoy from './pages/maestro/ClasesHoy';
import Horario from './pages/maestro/Horario';

function homeByRol(rol) {
  if (rol === 'maestro') return '/maestro/hoy';
  return '/reservar';
}

function PrivateRoute({ children, roles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.rol)) return <Navigate to={homeByRol(user.rol)} replace />;
  return children;
}

function WithNav({ children, nav }) {
  return <>{children}{nav}</>;
}

// Componente que activa notificaciones solo cuando hay sesión activa
function NotificacionesManager() {
  const { user } = useAuth();
  useNotificaciones(user);
  return null;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to={homeByRol(user.rol)} replace /> : <Login />}
      />

      {/* Rutas alumno */}
      <Route
        path="/reservar"
        element={
          <PrivateRoute roles={['alumno']}>
            <WithNav nav={<BottomNav />}><Reservar /></WithNav>
          </PrivateRoute>
        }
      />
      <Route
        path="/mis-clases"
        element={
          <PrivateRoute roles={['alumno']}>
            <WithNav nav={<BottomNav />}><MisClases /></WithNav>
          </PrivateRoute>
        }
      />

      {/* Rutas maestro */}
      <Route
        path="/maestro/hoy"
        element={
          <PrivateRoute roles={['maestro']}>
            <WithNav nav={<BottomNavMaestro />}><ClasesHoy /></WithNav>
          </PrivateRoute>
        }
      />
      <Route
        path="/maestro/horario"
        element={
          <PrivateRoute roles={['maestro']}>
            <WithNav nav={<BottomNavMaestro />}><Horario /></WithNav>
          </PrivateRoute>
        }
      />

      {/* Perfil compartido */}
      <Route
        path="/perfil"
        element={
          <PrivateRoute>
            <WithNav nav={user?.rol === 'maestro' ? <BottomNavMaestro /> : <BottomNav />}>
              <Perfil />
            </WithNav>
          </PrivateRoute>
        }
      />

      <Route path="*" element={<Navigate to={user ? homeByRol(user.rol) : '/login'} replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificacionesManager />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
