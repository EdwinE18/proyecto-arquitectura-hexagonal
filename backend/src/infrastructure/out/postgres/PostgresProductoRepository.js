import { ProductoRepositoryPort } from '../../../application/ports/out/ProductoRepositoryPort.js';
import { Producto } from '../../../domain/entities/Producto.js';
import { pool } from './db.js';
 
function filaAProducto(fila) {
  if (!fila) return null;
  return new Producto({
    id: fila.id,
    nombre: fila.nombre,
    descripcion: fila.descripcion,
    imagenUrl: fila.imagen_url,
    precio: fila.precio,
    stock: fila.stock,
    createdAt: fila.created_at,
  });
}
 
export class PostgresProductoRepository extends ProductoRepositoryPort {
  async guardar(producto) {
    const query = `
      INSERT INTO productos (nombre, descripcion, imagen_url, precio, stock)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const valores = [producto.nombre, producto.descripcion, producto.imagenUrl, producto.precio, producto.stock];
    const { rows } = await pool.query(query, valores);
    return filaAProducto(rows[0]);
  }
 
  async buscarPorId(id) {
    const { rows } = await pool.query('SELECT * FROM productos WHERE id = $1', [id]);
    return filaAProducto(rows[0]);
  }
 
  async listarTodos() {
    const { rows } = await pool.query('SELECT * FROM productos ORDER BY created_at DESC');
    return rows.map(filaAProducto);
  }
 
  async actualizar(producto) {
    const query = `
      UPDATE productos
      SET nombre = $1, descripcion = $2, imagen_url = $3, precio = $4, stock = $5
      WHERE id = $6
      RETURNING *;
    `;
    const valores = [producto.nombre, producto.descripcion, producto.imagenUrl, producto.precio, producto.stock, producto.id];
    const { rows } = await pool.query(query, valores);
    return filaAProducto(rows[0]);
  }
 
  async eliminar(id) {
    await pool.query('DELETE FROM productos WHERE id = $1', [id]);
  }
}