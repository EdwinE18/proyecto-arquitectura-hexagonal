import { createContext, useContext, useState } from 'react';
import { authService } from '../services/authService.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => {
    const guardado = localStorage.getItem('usuario');
    return guardado ? JSON.parse(guardado) : null;
  });

  const login = async ({ correo, password }) => {
    const { token, usuario: usuarioLogueado } = await authService.login({ correo, password });
    localStorage.setItem('token', token);
    localStorage.setItem('usuario', JSON.stringify(usuarioLogueado));
    setUsuario(usuarioLogueado);
    return usuarioLogueado;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setUsuario(null);
  };

  const estaAutenticado = !!usuario;

  return (
    <AuthContext.Provider value={{ usuario, login, logout, estaAutenticado }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook personalizado para usar el contexto fácilmente en cualquier componente
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}
