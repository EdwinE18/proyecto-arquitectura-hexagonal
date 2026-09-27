import { PedidoRepositoryPort } from '../../../application/ports/out/PedidoRepositoryPort.js';
import { Pedido, PedidoItem } from '../../../domain/entities/Pedido.js';
import { pool } from './db.js';
 
// Reconstruye un Pedido de dominio a partir de la fila de "pedidos"
// y las filas relacionadas de "pedido_productos"
function filasAPedido(filaPedido, filasItems) {
  if (!filaPedido) return null;
  const items = filasItems.map(
    (it) =>
      new PedidoItem({
        productoId: it.producto_id,
        cantidad: it.cantidad,
        precioUnitario: it.precio_unitario,
      })
  );
  const pedido = new Pedido({
    id: filaPedido.id,
    usuarioId: filaPedido.usuario_id,
    estado: filaPedido.estado,
    items,
    createdAt: filaPedido.created_at,
  });
  pedido.total = Number(filaPedido.total);
  return pedido;
}
 
export class PostgresPedidoRepository extends PedidoRepositoryPort {
  // Usa una transacción: si falla insertar algún item, se revierte todo el pedido.
  async guardar(pedido) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
 
      const resultPedido = await client.query(
        `INSERT INTO pedidos (usuario_id, estado, total) VALUES ($1, $2, $3) RETURNING *`,
        [pedido.usuarioId, pedido.estado, pedido.total ?? pedido.calcularTotal()]
      );
      const pedidoGuardado = resultPedido.rows[0];
 
      for (const item of pedido.items) {
        await client.query(
          `INSERT INTO pedido_productos (pedido_id, producto_id, cantidad, precio_unitario)
           VALUES ($1, $2, $3, $4)`,
          [pedidoGuardado.id, item.productoId, item.cantidad, item.precioUnitario]
        );
      }
 
      await client.query('COMMIT');
      return this.buscarPorId(pedidoGuardado.id);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
 
  async buscarPorId(id) {
    const { rows: filasPedido } = await pool.query('SELECT * FROM pedidos WHERE id = $1', [id]);
    if (filasPedido.length === 0) return null;
 
    const { rows: filasItems } = await pool.query(
      'SELECT * FROM pedido_productos WHERE pedido_id = $1',
      [id]
    );
    return filasAPedido(filasPedido[0], filasItems);
  }
 
  async _hidratarLista(filasPedidos) {
    const pedidos = [];
    for (const filaPedido of filasPedidos) {
      const { rows: filasItems } = await pool.query(
        'SELECT * FROM pedido_productos WHERE pedido_id = $1',
        [filaPedido.id]
      );
      pedidos.push(filasAPedido(filaPedido, filasItems));
    }
    return pedidos;
  }
 
  async listarTodos() {
    const { rows } = await pool.query('SELECT * FROM pedidos ORDER BY created_at DESC');
    return this._hidratarLista(rows);
  }
 
  async listarPorUsuario(usuarioId) {
    const { rows } = await pool.query(
      'SELECT * FROM pedidos WHERE usuario_id = $1 ORDER BY created_at DESC',
      [usuarioId]
    );
    return this._hidratarLista(rows);
  }
 
  async listarPendientes() {
    const { rows } = await pool.query(
      "SELECT * FROM pedidos WHERE estado = 'pendiente' ORDER BY created_at ASC"
    );
    return this._hidratarLista(rows);
  }
 
  async actualizarEstado(pedido) {
    const { rows } = await pool.query(
      'UPDATE pedidos SET estado = $1 WHERE id = $2 RETURNING *',
      [pedido.estado, pedido.id]
    );
    return this.buscarPorId(rows[0].id);
  }
}