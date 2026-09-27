import { useEffect, useState } from 'react';
import { useAuth } from '../../auth/context/AuthContext.jsx';
import { productoService } from '../../producto/services/productoService.js';
import { pedidoService } from '../services/pedidoService.js';
import '../../../components/Dashboard.css';
import './Pedido.css';

export function PedidoDashboard() {
  const { usuario, logout } = useAuth();

  const [productos, setProductos] = useState([]);
  const [cantidades, setCantidades] = useState({}); // { [productoId]: cantidad elegida en el input }
  const [carrito, setCarrito] = useState([]); // [{ productoId, nombre, precio, cantidad }]
  const [misPedidos, setMisPedidos] = useState([]);

  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [enviando, setEnviando] = useState(false);

  const cargarProductos = async () => {
    const data = await productoService.listar();
    setProductos(data);
  };

  const cargarMisPedidos = async () => {
    const data = await pedidoService.listar();
    setMisPedidos(data);
  };

  useEffect(() => {
    cargarProductos().catch((err) => setError(err.response?.data?.error || 'Error al cargar catálogo'));
    cargarMisPedidos().catch(() => {}); // silencioso, no crítico
  }, []);

  const agregarAlCarrito = (producto) => {
    setError('');
    const cantidad = Number(cantidades[producto.id] || 1);

    if (cantidad <= 0) {
      setError('La cantidad debe ser mayor a 0');
      return;
    }
    if (cantidad > producto.stock) {
      setError(`Solo hay ${producto.stock} unidades disponibles de "${producto.nombre}"`);
      return;
    }

    setCarrito((prev) => {
      const yaExiste = prev.find((it) => it.productoId === producto.id);
      if (yaExiste) {
        return prev.map((it) =>
          it.productoId === producto.id ? { ...it, cantidad } : it
        );
      }
      return [...prev, { productoId: producto.id, nombre: producto.nombre, precio: producto.precio, cantidad }];
    });
  };

  const quitarDelCarrito = (productoId) => {
    setCarrito((prev) => prev.filter((it) => it.productoId !== productoId));
  };

  const totalCarrito = carrito.reduce((acc, it) => acc + it.precio * it.cantidad, 0);

  const enviarSolicitud = async () => {
    if (carrito.length === 0) return;
    setError('');
    setExito('');
    setEnviando(true);

    try {
      const items = carrito.map((it) => ({ productoId: it.productoId, cantidad: it.cantidad }));
      await pedidoService.crear(items);
      setExito('Tu solicitud de pedido fue enviada. Queda pendiente de aprobación por el administrador.');
      setCarrito([]);
      setCantidades({});
      cargarMisPedidos();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al enviar la solicitud');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Panel de Pedidos</h1>
        <div className="usuario-info">
          <span>{usuario?.nombre}</span>
          <button className="boton-logout" onClick={logout}>Cerrar sesión</button>
        </div>
      </div>

      <div className="dashboard-body">
        {error && <div className="mensaje-error">{error}</div>}
        {exito && <div className="mensaje-exito">{exito}</div>}

        <h2 className="seccion-titulo">Catálogo de productos</h2>
        <div className="tabla-contenedor">
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Cantidad</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productos.map((p) => (
                <tr key={p.id}>
                  <td>{p.nombre}</td>
                  <td>${Number(p.precio).toFixed(2)}</td>
                  <td>{p.stock}</td>
                  <td>
                    <input
                      type="number"
                      min="1"
                      max={p.stock}
                      className="input-cantidad"
                      value={cantidades[p.id] || ''}
                      placeholder="1"
                      onChange={(e) => setCantidades({ ...cantidades, [p.id]: e.target.value })}
                    />
                  </td>
                  <td>
                    <button
                      className="btn-sm btn-primario"
                      disabled={p.stock === 0}
                      onClick={() => agregarAlCarrito(p)}
                    >
                      {p.stock === 0 ? 'Sin stock' : 'Agregar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {productos.length === 0 && <div className="sin-datos">Aún no hay productos en el catálogo</div>}
        </div>

        <h2 className="seccion-titulo">Solicitud actual</h2>
        <div className="carrito">
          {carrito.length === 0 ? (
            <div className="carrito-vacio">No has agregado productos todavía</div>
          ) : (
            <>
              {carrito.map((it) => (
                <div className="carrito-item" key={it.productoId}>
                  <span>{it.nombre} × {it.cantidad}</span>
                  <span style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                    ${(it.precio * it.cantidad).toFixed(2)}
                    <button className="btn-quitar" onClick={() => quitarDelCarrito(it.productoId)}>Quitar</button>
                  </span>
                </div>
              ))}
              <div className="carrito-total">
                <span>Total</span>
                <span>${totalCarrito.toFixed(2)}</span>
              </div>
              <button
                className="btn-sm btn-primario"
                style={{ marginTop: 16, width: '100%', padding: '10px' }}
                onClick={enviarSolicitud}
                disabled={enviando}
              >
                {enviando ? 'Enviando...' : 'Enviar solicitud de pedido'}
              </button>
            </>
          )}
        </div>

        <h2 className="seccion-titulo">Mis solicitudes anteriores</h2>
        <div className="tabla-contenedor">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Total</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {misPedidos.map((p) => (
                <tr key={p.id}>
                  <td>#{p.id}</td>
                  <td>${Number(p.total).toFixed(2)}</td>
                  <td><span className={`badge badge-${p.estado}`}>{p.estado}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
          {misPedidos.length === 0 && <div className="sin-datos">Aún no has hecho ninguna solicitud</div>}
        </div>
      </div>
    </div>
  );
}