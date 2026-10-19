// src/application/usecases/analytics/AnalyticsService.js
//
// PUERTO DE ENTRADA / CASO DE USO del subsistema analítico.
// Recibe los filtros del dashboard, los convierte en un RangoFechas del dominio,
// pide los datos agregados al puerto de salida y calcula lo que es lógica de
// negocio: porcentajes de estados y ticket promedio.
// No sabe si los datos vienen de PostgreSQL, de un archivo o de una API.

import { RangoFechas } from '../../../domain/valueobjects/RangoFechas.js';

export const ESTADOS_NEGOCIO = Object.freeze(['Pendiente', 'Pagado', 'Enviado', 'Cancelado']);

const redondear = (n, decimales = 2) => {
  const f = 10 ** decimales;
  return Math.round((Number(n) + Number.EPSILON) * f) / f;
};

const LIMITES_TOP = [5, 10];

// Date → "YYYY-MM-DD" (fecha local, sin desfase de zona horaria)
const aTextoFecha = (f) =>
  `${f.getFullYear()}-${String(f.getMonth() + 1).padStart(2, '0')}-${String(f.getDate()).padStart(2, '0')}`;

export class AnalyticsService {
  /**
   * @param {import('../../ports/out/AnalyticsRepositoryPort.js').AnalyticsRepositoryPort} analyticsRepository
   * @param {() => Date} reloj  se inyecta para facilitar pruebas (por defecto, la fecha actual)
   */
  constructor(analyticsRepository, reloj = () => new Date()) {
    this.analyticsRepository = analyticsRepository;
    this.reloj = reloj;
  }

  #rango(filtros) {
    return RangoFechas.desdeFiltros(filtros, this.reloj());
  }

  #periodo(rango) {
    return {
      desde: aTextoFecha(rango.desde),
      hasta: aTextoFecha(rango.hasta),
      dias: rango.dias(),
      agrupacion: rango.agrupacion,
    };
  }

  #consulta(rango) {
    return { desde: rango.desde, hastaExclusivo: rango.hastaExclusivo() };
  }

  /** 1. Volumen de ventas por producto (Top 5 o Top 10) */
  async productosMasVendidos(filtros = {}) {
    const rango = this.#rango(filtros);
    const limite = Number(filtros.limite) || 5;
    if (!LIMITES_TOP.includes(limite)) {
      throw new Error('El límite debe ser 5 o 10');
    }

    const filas = await this.analyticsRepository.ventasPorProducto({ ...this.#consulta(rango), limite });
    const montoTotal = filas.reduce((s, f) => s + f.monto, 0);

    return {
      periodo: this.#periodo(rango),
      productos: filas.map((f, i) => ({
        posicion: i + 1,
        productoId: f.productoId,
        nombre: f.nombre,
        unidades: f.unidades,
        monto: redondear(f.monto),
        participacion: montoTotal ? redondear((f.monto / montoTotal) * 100, 1) : 0,
      })),
    };
  }

  /** 2. Ingresos totales por rango de tiempo (diario, semanal o mensual) */
  async ingresos(filtros = {}) {
    const rango = this.#rango(filtros);
    const serie = await this.analyticsRepository.ingresosPorPeriodo({
      ...this.#consulta(rango),
      agrupacion: rango.agrupacion,
    });

    return {
      periodo: this.#periodo(rango),
      total: redondear(serie.reduce((s, p) => s + p.ingresos, 0)),
      serie: serie.map((p) => ({
        periodo: p.periodo,
        ingresos: redondear(p.ingresos),
        pedidos: p.pedidos,
      })),
    };
  }

  /** 3. Estado de pedidos: conteo y distribución porcentual */
  async estadosPedidos(filtros = {}) {
    const rango = this.#rango(filtros);
    const filas = await this.analyticsRepository.conteoPorEstado(this.#consulta(rango));

    const total = filas.reduce((s, f) => s + f.cantidad, 0);
    const porEstado = new Map(filas.map((f) => [f.estado, f]));

    // Siempre devolvemos los 4 estados, aunque alguno tenga 0 pedidos
    return {
      periodo: this.#periodo(rango),
      total,
      estados: ESTADOS_NEGOCIO.map((estado) => {
        const fila = porEstado.get(estado) || { cantidad: 0, monto: 0 };
        return {
          estado,
          cantidad: fila.cantidad,
          monto: redondear(fila.monto),
          porcentaje: total ? redondear((fila.cantidad / total) * 100, 1) : 0,
        };
      }),
    };
  }

  /** 4. Ticket promedio: por pedido y por usuario */
  async ticketPromedio(filtros = {}) {
    const rango = this.#rango(filtros);
    const consulta = this.#consulta(rango);

    const [totales, clientes] = await Promise.all([
      this.analyticsRepository.totalesVentas(consulta),
      this.analyticsRepository.gastoPorUsuario({ ...consulta, limite: 10 }),
    ]);

    return {
      periodo: this.#periodo(rango),
      ingresos: redondear(totales.ingresos),
      pedidos: totales.pedidos,
      clientes: totales.clientes,
      ticketPorPedido: totales.pedidos ? redondear(totales.ingresos / totales.pedidos) : 0,
      gastoPromedioPorUsuario: totales.clientes ? redondear(totales.ingresos / totales.clientes) : 0,
      porUsuario: clientes.map((c) => ({
        usuarioId: c.usuarioId,
        nombre: c.nombre,
        correo: c.correo,
        pedidos: c.pedidos,
        gastoTotal: redondear(c.gastoTotal),
        ticketPromedio: c.pedidos ? redondear(c.gastoTotal / c.pedidos) : 0,
      })),
    };
  }

  /** Todo el dashboard en una sola llamada (lo usa el frontend) */
  async resumen(filtros = {}) {
    const [productos, ingresos, estados, ticket] = await Promise.all([
      this.productosMasVendidos(filtros),
      this.ingresos(filtros),
      this.estadosPedidos(filtros),
      this.ticketPromedio(filtros),
    ]);

    return {
      periodo: ingresos.periodo,
      productosTop: productos.productos,
      ingresos: { total: ingresos.total, serie: ingresos.serie },
      estadosPedidos: { total: estados.total, estados: estados.estados },
      ticketPromedio: {
        ingresos: ticket.ingresos,
        pedidos: ticket.pedidos,
        clientes: ticket.clientes,
        ticketPorPedido: ticket.ticketPorPedido,
        gastoPromedioPorUsuario: ticket.gastoPromedioPorUsuario,
        porUsuario: ticket.porUsuario,
      },
    };
  }
}
