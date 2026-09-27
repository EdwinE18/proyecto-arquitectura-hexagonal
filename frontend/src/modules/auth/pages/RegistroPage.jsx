import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService.js';
import './Auth.css';

export function RegistroPage() {
  const [form, setForm] = useState({
    nombre: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    correo: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [cargando, setCargando] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setExito('');
    setCargando(true);

    try {
      const resultado = await authService.registrar(form);
      setExito(resultado.mensaje);
      // Después de 2.5s lo mandamos al login para que espere la aprobación
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      const mensaje = err.response?.data?.error || 'Ocurrió un error al registrarte';
      setError(mensaje);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Crear cuenta</h1>
        <p className="subtitulo">
          Tu solicitud quedará pendiente hasta que el administrador la apruebe
        </p>

        {error && <div className="mensaje-error">{error}</div>}
        {exito && <div className="mensaje-exito">{exito}</div>}

        {!exito && (
          <form onSubmit={handleSubmit}>
            <div className="campo">
              <label htmlFor="nombre">Nombre</label>
              <input
                id="nombre"
                name="nombre"
                type="text"
                value={form.nombre}
                onChange={handleChange}
                required
              />
            </div>

            <div className="campo">
              <label htmlFor="apellidoPaterno">Apellido paterno</label>
              <input
                id="apellidoPaterno"
                name="apellidoPaterno"
                type="text"
                value={form.apellidoPaterno}
                onChange={handleChange}
                required
              />
            </div>

            <div className="campo">
              <label htmlFor="apellidoMaterno">Apellido materno</label>
              <input
                id="apellidoMaterno"
                name="apellidoMaterno"
                type="text"
                value={form.apellidoMaterno}
                onChange={handleChange}
                required
              />
            </div>

            <div className="campo">
              <label htmlFor="correo">Correo electrónico</label>
              <input
                id="correo"
                name="correo"
                type="email"
                value={form.correo}
                onChange={handleChange}
                required
              />
            </div>

            <div className="campo">
              <label htmlFor="password">Contraseña</label>
              <input
                id="password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                required
                placeholder="Mínimo 8 caracteres, letra y número"
              />
            </div>

            <button type="submit" className="boton-primario" disabled={cargando}>
              {cargando ? 'Enviando...' : 'Registrarme'}
            </button>
          </form>
        )}

        <Link to="/login">
          <button type="button" className="boton-secundario">
            Ya tengo cuenta, iniciar sesión
          </button>
        </Link>
      </div>
    </div>
  );
}
