// src/infrastructure/in/http/controllers/AnalyticsController.js
//
// ADAPTADOR DE ENTRADA HTTP: traduce la petición (query string) a los filtros
// del caso de uso y la respuesta a JSON. No contiene lógica de negocio.

export class AnalyticsController {
  /**
   * @param {import('../../../../application/usecases/analytics/AnalyticsService.js').AnalyticsService} analyticsService
   */
  constructor(analyticsService) {
    this.analyticsService = analyticsService;
  }

  #filtros(req) {
    const { rango, desde, hasta, agrupacion, limite } = req.query;
    return { rango, desde, hasta, agrupacion, limite };
  }

  #responder(metodo) {
    return async (req, res) => {
      try {
        const datos = await this.analyticsService[metodo](this.#filtros(req));
        res.json(datos);
      } catch (error) {
        // Errores de validación de filtros (fechas, rango, agrupación) → 400
        const esValidacion = /inválid|formato|posterior|superar|límite/i.test(error.message);
        if (!esValidacion) console.error('[Analytics]', error);
        res.status(esValidacion ? 400 : 500).json({
          error: esValidacion ? error.message : 'Error al generar el reporte',
        });
      }
    };
  }

  resumen = this.#responder('resumen');
  productosTop = this.#responder('productosMasVendidos');
  ingresos = this.#responder('ingresos');
  estadosPedidos = this.#responder('estadosPedidos');
  ticketPromedio = this.#responder('ticketPromedio');
}
