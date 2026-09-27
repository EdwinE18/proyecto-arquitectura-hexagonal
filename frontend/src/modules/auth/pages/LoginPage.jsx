import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import './Auth.css';

export function LoginPage() {
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    try {
      const usuario = await login({ correo, password });

      // Redirige según el rol asignado
      if (usuario.rol === 'admin') {
        navigate('/admin');
      } else if (usuario.rol === 'producto') {
        navigate('/producto');
      } else if (usuario.rol === 'pedido') {
        navigate('/pedido');
      } else {
        navigate('/');
      }
    } catch (err) {
      const mensaje = err.response?.data?.error || 'Ocurrió un error al iniciar sesión';
      setError(mensaje);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Iniciar sesión</h1>
        <p className="subtitulo">Sistema de gestión de e-commerce</p>

        {error && <div className="mensaje-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="campo">
            <label htmlFor="correo">Correo electrónico</label>
            <input
              id="correo"
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              required
              placeholder="tucorreo@ejemplo.com"
            />
          </div>

          <div className="campo">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>

          <button type="submit" className="boton-primario" disabled={cargando}>
            {cargando ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <Link to="/registro">
          <button type="button" className="boton-secundario">
            ¿No tienes cuenta? Regístrate
          </button>
        </Link>
      </div>
    </div>
  );
}
