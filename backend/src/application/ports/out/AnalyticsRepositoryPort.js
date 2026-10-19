// src/application/ports/out/AnalyticsRepositoryPort.js
//
// PUERTO DE SALIDA para consultas analíticas (solo lectura).
// Es independiente de UsuarioRepositoryPort, ProductoRepositoryPort y
// PedidoRepositoryPort: así las métricas NO sobrecargan las entidades
// operativas del dominio. Devuelve datos ya agregados (filas planas),
// nunca entidades completas.
//
// Todas las fechas llegan como Date: "desde" inclusive y "hastaExclusivo" exclusivo.

export class AnalyticsRepositoryPort {
  /**
   * Top de productos más vendidos.
   * @returns {Promise<{ productoId:number, nombre:string, unidades:number, monto:number }[]>}
   */
  async ventasPorProducto({ desde, hastaExclusivo, limite }) {
    throw new Error('AnalyticsRepositoryPort.ventasPorProducto() no implementado');
  }

  /**
   * Ingresos agrupados por periodo (día, semana o mes), sin huecos.
   * @returns {Promise<{ periodo: Date, ingresos:number, pedidos:number }[]>}
   */
  async ingresosPorPeriodo({ desde, hastaExclusivo, agrupacion }) {
    throw new Error('AnalyticsRepositoryPort.ingresosPorPeriodo() no implementado');
  }

  /**
   * Conteo de pedidos por estado de negocio (Pendiente, Pagado, Enviado, Cancelado).
   * @returns {Promise<{ estado:string, cantidad:number, monto:number }[]>}
   */
  async conteoPorEstado({ desde, hastaExclusivo }) {
    throw new Error('AnalyticsRepositoryPort.conteoPorEstado() no implementado');
  }

  /**
   * Totales para calcular el ticket promedio global.
   * @returns {Promise<{ ingresos:number, pedidos:number, clientes:number }>}
   */
  async totalesVentas({ desde, hastaExclusivo }) {
    throw new Error('AnalyticsRepositoryPort.totalesVentas() no implementado');
  }

  /**
   * Gasto por cliente (para el ticket promedio por usuario).
   * @returns {Promise<{ usuarioId:number, nombre:string, correo:string, pedidos:number, gastoTotal:number }[]>}
   */
  async gastoPorUsuario({ desde, hastaExclusivo, limite }) {
    throw new Error('AnalyticsRepositoryPort.gastoPorUsuario() no implementado');
  }
}
