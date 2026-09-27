import { Link } from 'react-router-dom';

export function NoAutorizado() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0f172a',
      color: '#f1f5f9',
      fontFamily: 'system-ui, sans-serif',
      gap: '16px',
    }}>
      <h1>🚫 No autorizado</h1>
      <p style={{ color: '#94a3b8' }}>No tienes permiso para ver esta página.</p>
      <Link to="/login" style={{ color: '#6366f1' }}>Volver al inicio de sesión</Link>
    </div>
  );
}
