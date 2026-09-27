import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../modules/auth/context/AuthContext.jsx';
import { RutaProtegida } from '../components/RutaProtegida.jsx';
import { NoAutorizado } from '../components/NoAutorizado.jsx';

import { LoginPage } from '../modules/auth/pages/LoginPage.jsx';
import { RegistroPage } from '../modules/auth/pages/RegistroPage.jsx';
import { AdminDashboard } from '../modules/admin/pages/AdminDashboard.jsx';
import { ProductoDashboard } from '../modules/producto/pages/ProductoDashboard.jsx';
import { PedidoDashboard } from '../modules/pedido/pages/PedidoDashboard.jsx';

export function AppRouter() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/registro" element={<RegistroPage />} />
          <Route path="/no-autorizado" element={<NoAutorizado />} />

          {/* Rutas protegidas por rol */}
          <Route
            path="/admin"
            element={
              <RutaProtegida rolesPermitidos={['admin']}>
                <AdminDashboard />
              </RutaProtegida>
            }
          />
          <Route
            path="/producto"
            element={
              <RutaProtegida rolesPermitidos={['producto']}>
                <ProductoDashboard />
              </RutaProtegida>
            }
          />
          <Route
            path="/pedido"
            element={
              <RutaProtegida rolesPermitidos={['pedido']}>
                <PedidoDashboard />
              </RutaProtegida>
            }
          />

          {/* Ruta por defecto: redirige al login */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
