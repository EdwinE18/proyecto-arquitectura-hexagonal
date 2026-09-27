import { Navigate } from 'react-router-dom';
import { useAuth } from '../modules/auth/context/AuthContext.jsx';

// Uso: <RutaProtegida rolesPermitidos={['admin']}> <AdminDashboard /> </RutaProtegida>
export function RutaProtegida({ children, rolesPermitidos }) {
  const { usuario, estaAutenticado } = useAuth();

  if (!estaAutenticado) {
    return <Navigate to="/login" replace />;
  }

  if (rolesPermitidos && !rolesPermitidos.includes(usuario.rol)) {
    // Logueado, pero no tiene permiso para ver esta ruta
    return <Navigate to="/no-autorizado" replace />;
  }

  return children;
}
