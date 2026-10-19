// src/infrastructure/out/postgres/AnalyticsRepositoryAdapter.js
//
// ADAPTADOR DE SALIDA: implementa AnalyticsRepositoryPort con PostgreSQL.
// Toda la agregación (SUM, COUNT, AVG, GROUP BY y filtros de fechas) la hace
// la base de datos; Node.js solo recibe las filas ya resumidas, nunca el
// historial completo de pedidos.

import { AnalyticsRepositoryPort } from '../../../application/ports/out/AnalyticsRepositoryPort.js';
import { pool } from './db.js';

// Pedidos que cuentan como VENTA para ingresos, top de productos y ticket.
// 'aprobado' es el estado actual del sistema cuando el admin confirma el pedido;
// 'pagado' y 'enviado' se incluyen por si más adelante se agregan esos estados.
const ESTADOS_VENTA = ['aprobado', 'pagado', 'enviado'];

// Traduce los estados guardados en la BD a los estados de negocio del reporte
const SQL_ESTADO_NEGOCIO = `
  CASE p.estado
    WHEN 'pendiente'      THEN 'Pendiente'
    WHEN 'pendiente_pago' THEN 'Pendiente'
    WHEN 'aprobado'       THEN 'Pagado'
    WHEN 'pagado'         THEN 'Pagado'
    WHEN 'enviado'        THEN 'Enviado'
    WHEN 'rechazado'      THEN 'Cancelado'
    WHEN 'cancelado'      THEN 'Cancelado'
    ELSE initcap(p.estado)
  END`;

// Lista blanca: el valor va directo a date_trunc, nunca se concatena texto del usuario
const TRUNC_SQL = { dia: 'day', semana: 'week', mes: 'month' };

export class AnalyticsRepositoryAdapter extends AnalyticsRepositoryPort {
  async ventasPorProducto({ desde, hastaExclusivo, limite }) {
    const { rows } = await pool.query(
      `SELECT pr.id                                   AS producto_id,
              pr.nombre,
              SUM(pp.cantidad)::int                   AS unidades,
              SUM(pp.cantidad * pp.precio_unitario)   AS monto
         FROM pedido_productos pp
         JOIN pedidos   p  ON p.id  = pp.pedido_id
         JOIN productos pr ON pr.id = pp.producto_id
        WHERE p.created_at >= $1 AND p.created_at < $2
          AND p.estado = ANY($3)
        GROUP BY pr.id, pr.nombre
        ORDER BY unidades DESC, monto DESC
        LIMIT $4`,
      [desde, hastaExclusivo, ESTADOS_VENTA, limite]
    );
    return rows.map((r) => ({
      productoId: r.producto_id,
      nombre: r.nombre,
      unidades: r.unidades,
      monto: Number(r.monto),
    }));
  }

  async ingresosPorPeriodo({ desde, hastaExclusivo, agrupacion }) {
    const trunc = TRUNC_SQL[agrupacion];
    if (!trunc) throw new Error(`Agrupación no soportada: ${agrupacion}`);

    // generate_series crea todos los periodos del rango, así el gráfico
    // muestra 0 en los días/semanas/meses sin ventas en lugar de saltarlos.
    const { rows } = await pool.query(
      `WITH ventas AS (
         SELECT date_trunc($3, p.created_at) AS periodo,
                SUM(p.total)                 AS ingresos,
                COUNT(*)::int                AS pedidos
           FROM pedidos p
          WHERE p.created_at >= $1 AND p.created_at < $2
            AND p.estado = ANY($4)
          GROUP BY 1
       ),
       periodos AS (
         SELECT generate_series(
                  date_trunc($3, $1::timestamp),
                  $2::timestamp - INTERVAL '1 second',
                  ('1 ' || $3)::interval
                ) AS periodo
       )
       SELECT to_char(pe.periodo, 'YYYY-MM-DD') AS periodo,
              COALESCE(v.ingresos, 0)           AS ingresos,
              COALESCE(v.pedidos, 0)            AS pedidos
         FROM periodos pe
         LEFT JOIN ventas v ON v.periodo = pe.periodo
        ORDER BY pe.periodo`,
      [desde, hastaExclusivo, trunc, ESTADOS_VENTA]
    );
    return rows.map((r) => ({
      periodo: r.periodo,
      ingresos: Number(r.ingresos),
      pedidos: r.pedidos,
    }));
  }

  async conteoPorEstado({ desde, hastaExclusivo }) {
    const { rows } = await pool.query(
      `SELECT ${SQL_ESTADO_NEGOCIO}  AS estado,
              COUNT(*)::int          AS cantidad,
              SUM(p.total)           AS monto
         FROM pedidos p
        WHERE p.created_at >= $1 AND p.created_at < $2
        GROUP BY 1`,
      [desde, hastaExclusivo]
    );
    return rows.map((r) => ({
      estado: r.estado,
      cantidad: r.cantidad,
      monto: Number(r.monto),
    }));
  }

  async totalesVentas({ desde, hastaExclusivo }) {
    const { rows } = await pool.query(
      `SELECT COALESCE(SUM(p.total), 0)             AS ingresos,
              COUNT(*)::int                         AS pedidos,
              COUNT(DISTINCT p.usuario_id)::int     AS clientes
         FROM pedidos p
        WHERE p.created_at >= $1 AND p.created_at < $2
          AND p.estado = ANY($3)`,
      [desde, hastaExclusivo, ESTADOS_VENTA]
    );
    const r = rows[0];
    return { ingresos: Number(r.ingresos), pedidos: r.pedidos, clientes: r.clientes };
  }

  async gastoPorUsuario({ desde, hastaExclusivo, limite }) {
    const { rows } = await pool.query(
      `SELECT u.id                                        AS usuario_id,
              u.nombre || ' ' || u.apellido_paterno       AS nombre,
              u.correo,
              COUNT(p.id)::int                            AS pedidos,
              SUM(p.total)                                AS gasto_total
         FROM pedidos p
         JOIN usuarios u ON u.id = p.usuario_id
        WHERE p.created_at >= $1 AND p.created_at < $2
          AND p.estado = ANY($3)
        GROUP BY u.id, u.nombre, u.apellido_paterno, u.correo
        ORDER BY gasto_total DESC
        LIMIT $4`,
      [desde, hastaExclusivo, ESTADOS_VENTA, limite]
    );
    return rows.map((r) => ({
      usuarioId: r.usuario_id,
      nombre: r.nombre,
      correo: r.correo,
      pedidos: r.pedidos,
      gastoTotal: Number(r.gasto_total),
    }));
  }
}
