// src/modules/admin/pages/AdminDashboard.jsx
import { useEffect, useState } from 'react';
import { useAuth } from '../../auth/context/AuthContext.jsx';
import { adminService } from '../services/adminService.js';
import { productoService } from '../../producto/services/productoService.js';
import { pedidoService } from '../../pedido/services/pedidoService.js';
import '../../../components/Dashboard.css';
import { DashboardAnalitico } from './DashboardAnalitico.jsx';

const TABS = {
  SOLICITUDES: 'solicitudes',
  USUARIOS: 'usuarios',
  PRODUCTOS: 'productos',
  PEDIDOS: 'pedidos',
  ANALITICO: 'analitico',
};

export function AdminDashboard() {
  const { usuario, logout } = useAuth();
  const [tabActivo, setTabActivo] = useState(TABS.SOLICITUDES);

  const [solicitudes, setSolicitudes] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [productos, setProductos] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [rolSeleccionado, setRolSeleccionado] = useState({}); // { [usuarioId]: 'producto' | 'pedido' }

  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [cargando, setCargando] = useState(false);

  const cargarSolicitudes = async () => {
    const data = await adminService.listarSolicitudesPendientes();
    setSolicitudes(data);
  };

  const cargarUsuarios = async () => {
    const data = await adminService.listarTodosUsuarios();
    setUsuarios(data);
  };

  const cargarProductos = async () => {
    const data = await productoService.listar();
    setProductos(data);
  };

  const cargarPedidos = async () => {
    const data = await pedidoService.listar();
    setPedidos(data);
  };

  useEffect(() => {
    setError('');
    setCargando(true);
    const cargar = {
      [TABS.SOLICITUDES]: cargarSolicitudes,
      [TABS.USUARIOS]: cargarUsuarios,
      [TABS.PRODUCTOS]: cargarProductos,
      [TABS.PEDIDOS]: cargarPedidos,
      [TABS.ANALITICO]: async () => {}, // el panel carga sus propios datos
    }[tabActivo];

    cargar()
      .catch((err) => setError(err.response?.data?.error || 'Error al cargar datos'))
      .finally(() => setCargando(false));
  }, [tabActivo]);

  const handleResolver = async (usuarioId, accion) => {
    setError('');
    setExito('');
    const rol = rolSeleccionado[usuarioId];

    if (accion === 'aprobar' && !rol) {
      setError('Selecciona un rol (Producto o Pedido) antes de aprobar');
      return;
    }

    try {
      await adminService.resolverSolicitud(usuarioId, { accion, rol });
      setExito(`Solicitud ${accion === 'aprobar' ? 'aprobada' : 'rechazada'} correctamente`);
      cargarSolicitudes();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al resolver la solicitud');
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Panel de Administrador</h1>
        <div className="usuario-info">
          <span>{usuario?.nombre}</span>
          <button className="boton-logout" onClick={logout}>Cerrar sesión</button>
        </div>
      </div>

      <div className="dashboard-body">
        <div className="tabs">
          <button
            className={`tab ${tabActivo === TABS.SOLICITUDES ? 'activo' : ''}`}
            onClick={() => setTabActivo(TABS.SOLICITUDES)}
          >
            Solicitudes pendientes
          </button>
          <button
            className={`tab ${tabActivo === TABS.USUARIOS ? 'activo' : ''}`}
            onClick={() => setTabActivo(TABS.USUARIOS)}
          >
            Usuarios
          </button>
          <button
            className={`tab ${tabActivo === TABS.PRODUCTOS ? 'activo' : ''}`}
            onClick={() => setTabActivo(TABS.PRODUCTOS)}
          >
            Productos
          </button>
          <button
            className={`tab ${tabActivo === TABS.PEDIDOS ? 'activo' : ''}`}
            onClick={() => setTabActivo(TABS.PEDIDOS)}
          >
            Pedidos
          </button>
          <button
            className={`tab ${tabActivo === TABS.ANALITICO ? 'activo' : ''}`}
            onClick={() => setTabActivo(TABS.ANALITICO)}
          >
            Panel analítico
          </button>
        </div>

        {error && <div className="mensaje-error">{error}</div>}
        {exito && <div className="mensaje-exito">{exito}</div>}

        {/* ---- TAB: Solicitudes pendientes ---- */}
        {tabActivo === TABS.SOLICITUDES && (
          <div className="tabla-contenedor">
            <table>
              <thead>
                <tr>
                  <th>Nombre completo</th>
                  <th>Correo</th>
                  <th>Asignar rol</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {solicitudes.map((s) => (
                  <tr key={s.id}>
                    <td>{s.nombreCompleto}</td>
                    <td>{s.correo}</td>
                    <td>
                      <select
                        className="select-rol"
                        value={rolSeleccionado[s.id] || ''}
                        onChange={(e) =>
                          setRolSeleccionado({ ...rolSeleccionado, [s.id]: e.target.value })
                        }
                      >
                        <option value="">-- Selecciona --</option>
                        <option value="producto">Producto</option>
                        <option value="pedido">Pedido</option>
                      </select>
                    </td>
                    <td className="acciones">
                      <button className="btn-sm btn-aprobar" onClick={() => handleResolver(s.id, 'aprobar')}>
                        Aprobar
                      </button>
                      <button className="btn-sm btn-rechazar" onClick={() => handleResolver(s.id, 'rechazar')}>
                        Rechazar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!cargando && solicitudes.length === 0 && (
              <div className="sin-datos">No hay solicitudes pendientes 🎉</div>
            )}
          </div>
        )}

        {/* ---- TAB: Usuarios ---- */}
        {tabActivo === TABS.USUARIOS && (
          <div className="tabla-contenedor">
            <table>
              <thead>
                <tr>
                  <th>Nombre completo</th>
                  <th>Correo</th>
                  <th>Rol</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((u) => (
                  <tr key={u.id}>
                    <td>{u.nombre}</td>
                    <td>{u.correo}</td>
                    <td>{u.rol ? <span className={`badge badge-${u.rol}`}>{u.rol}</span> : '—'}</td>
                    <td><span className={`badge badge-${u.estado}`}>{u.estado}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!cargando && usuarios.length === 0 && <div className="sin-datos">Sin usuarios registrados</div>}
          </div>
        )}

        {/* ---- TAB: Productos (solo vista, admin no gestiona catálogo directamente) ---- */}
        {tabActivo === TABS.PRODUCTOS && (
          <div className="tabla-contenedor">
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Precio</th>
                  <th>Stock</th>
                </tr>
              </thead>
              <tbody>
                {productos.map((p) => (
                  <tr key={p.id}>
                    <td>{p.nombre}</td>
                    <td>${Number(p.precio).toFixed(2)}</td>
                    <td>{p.stock}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!cargando && productos.length === 0 && <div className="sin-datos">Sin productos en el catálogo</div>}
          </div>
        )}

        {/* ---- TAB: Pedidos (aprobar/rechazar solicitudes de compra) ---- */}
        {tabActivo === TABS.PEDIDOS && (
          <div className="tabla-contenedor">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Total</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {pedidos.map((p) => (
                  <tr key={p.id}>
                    <td>#{p.id}</td>
                    <td>${Number(p.total).toFixed(2)}</td>
                    <td><span className={`badge badge-${p.estado}`}>{p.estado}</span></td>
                    <td className="acciones">
                      {p.estado === 'pendiente' ? (
                        <>
                          <button
                            className="btn-sm btn-aprobar"
                            onClick={async () => {
                              await pedidoService.resolver(p.id, 'aprobar');
                              cargarPedidos();
                            }}
                          >
                            Aprobar
                          </button>
                          <button
                            className="btn-sm btn-rechazar"
                            onClick={async () => {
                              await pedidoService.resolver(p.id, 'rechazar');
                              cargarPedidos();
                            }}
                          >
                            Rechazar
                          </button>
                        </>
                      ) : (
                        '—'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!cargando && pedidos.length === 0 && <div className="sin-datos">Sin pedidos registrados</div>}
          </div>
        )}
        {tabActivo === TABS.ANALITICO && <DashboardAnalitico />}
      </div>
    </div>
  );
}
