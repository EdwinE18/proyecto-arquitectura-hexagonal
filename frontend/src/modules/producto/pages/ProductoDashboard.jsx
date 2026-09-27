// src/modules/producto/pages/ProductoDashboard.jsx
import { useEffect, useState } from 'react';
import { useAuth } from '../../auth/context/AuthContext.jsx';
import { productoService } from '../services/productoService.js';
import '../../../components/Dashboard.css';
import './Producto.css';

const FORM_VACIO = { nombre: '', descripcion: '', imagenUrl: '', precio: '', stock: '' };

export function ProductoDashboard() {
  const { usuario, logout } = useAuth();

  const [productos, setProductos] = useState([]);
  const [form, setForm] = useState(FORM_VACIO);
  const [editandoId, setEditandoId] = useState(null); // null = modo "crear"
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [cargando, setCargando] = useState(false);

  const cargarProductos = async () => {
    try {
      const data = await productoService.listar();
      setProductos(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cargar el catálogo');
    }
  };

  useEffect(() => {
    cargarProductos();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const limpiarFormulario = () => {
    setForm(FORM_VACIO);
    setEditandoId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setExito('');
    setCargando(true);

    const payload = {
      nombre: form.nombre,
      descripcion: form.descripcion,
      imagenUrl: form.imagenUrl || null,
      precio: Number(form.precio),
      stock: Number(form.stock),
    };

    try {
      if (editandoId) {
        await productoService.actualizar(editandoId, payload);
        setExito('Producto actualizado correctamente');
      } else {
        await productoService.crear(payload);
        setExito('Producto agregado al catálogo correctamente');
      }
      limpiarFormulario();
      cargarProductos();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar el producto');
    } finally {
      setCargando(false);
    }
  };

  const handleEditar = (producto) => {
    setEditandoId(producto.id);
    setForm({
      nombre: producto.nombre,
      descripcion: producto.descripcion || '',
      imagenUrl: producto.imagenUrl || '',
      precio: producto.precio,
      stock: producto.stock,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEliminar = async (id) => {
    if (!confirm('¿Seguro que quieres eliminar este producto del catálogo?')) return;
    setError('');
    try {
      await productoService.eliminar(id);
      cargarProductos();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al eliminar el producto');
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Panel de Productos</h1>
        <div className="usuario-info">
          <span>{usuario?.nombre}</span>
          <button className="boton-logout" onClick={logout}>Cerrar sesión</button>
        </div>
      </div>

      <div className="dashboard-body">
        {error && <div className="mensaje-error">{error}</div>}
        {exito && <div className="mensaje-exito">{exito}</div>}

        <form className="form-producto" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="nombre">Nombre del producto</label>
            <input id="nombre" name="nombre" value={form.nombre} onChange={handleChange} required />
          </div>

          <div>
            <label htmlFor="precio">Precio ($)</label>
            <input
              id="precio" name="precio" type="number" step="0.01" min="0"
              value={form.precio} onChange={handleChange} required
            />
          </div>

          <div>
            <label htmlFor="stock">Cantidad disponible (stock)</label>
            <input
              id="stock" name="stock" type="number" min="0"
              value={form.stock} onChange={handleChange} required
            />
          </div>

          <div>
            <label htmlFor="imagenUrl">URL de la imagen (opcional)</label>
            <input
              id="imagenUrl" name="imagenUrl" type="url"
              placeholder="https://..."
              value={form.imagenUrl} onChange={handleChange}
            />
          </div>

          <div className="campo-full">
            <label htmlFor="descripcion">Descripción</label>
            <textarea
              id="descripcion" name="descripcion" rows={2}
              value={form.descripcion} onChange={handleChange}
            />
          </div>

          <div className="form-acciones">
            <button type="submit" className="btn-sm btn-primario" disabled={cargando}>
              {editandoId ? 'Guardar cambios' : 'Agregar producto'}
            </button>
            {editandoId && (
              <button type="button" className="btn-sm btn-rechazar" onClick={limpiarFormulario}>
                Cancelar edición
              </button>
            )}
          </div>
        </form>

        <div className="tabla-contenedor">
          <table>
            <thead>
              <tr>
                <th>Imagen</th>
                <th>Nombre</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productos.map((p) => (
                <tr key={p.id}>
                  <td>
                    {p.imagenUrl ? (
                      <img src={p.imagenUrl} alt={p.nombre} className="miniatura" />
                    ) : (
                      <div className="miniatura-placeholder">📦</div>
                    )}
                  </td>
                  <td>{p.nombre}</td>
                  <td>${Number(p.precio).toFixed(2)}</td>
                  <td>{p.stock}</td>
                  <td className="acciones">
                    <button className="btn-sm btn-editar" onClick={() => handleEditar(p)}>Editar</button>
                    <button className="btn-sm btn-eliminar" onClick={() => handleEliminar(p.id)}>Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {productos.length === 0 && <div className="sin-datos">Aún no hay productos en el catálogo</div>}
        </div>
      </div>
    </div>
  );
}