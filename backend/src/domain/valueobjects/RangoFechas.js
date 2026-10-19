// src/domain/valueobjects/RangoFechas.js
//
// OBJETO DE VALOR del dominio analítico.
// Representa un periodo de consulta y valida sus reglas:
//   - "desde" no puede ser posterior a "hasta"
//   - el rango no puede superar 366 días
//   - la agrupación solo puede ser dia, semana o mes
// No sabe nada de SQL, Express ni React: es JavaScript puro.

export const RANGOS = Object.freeze({
  ULTIMOS_7_DIAS: '7d',
  ULTIMOS_30_DIAS: '30d',
  ESTE_MES: 'mes',
  PERSONALIZADO: 'personalizado',
});

export const AGRUPACIONES = Object.freeze(['dia', 'semana', 'mes']);

const MS_DIA = 24 * 60 * 60 * 1000;
const MAX_DIAS = 366;

function inicioDelDia(fecha) {
  const f = new Date(fecha);
  f.setHours(0, 0, 0, 0);
  return f;
}

function parsearFecha(texto, nombreCampo) {
  // Acepta "YYYY-MM-DD" (lo que manda un <input type="date">)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(texto || ''))) {
    throw new Error(`"${nombreCampo}" debe tener formato YYYY-MM-DD`);
  }
  const [a, m, d] = texto.split('-').map(Number);
  const fecha = new Date(a, m - 1, d);
  if (Number.isNaN(fecha.getTime()) || fecha.getMonth() !== m - 1) {
    throw new Error(`"${nombreCampo}" no es una fecha válida`);
  }
  return fecha;
}

export class RangoFechas {
  /**
   * @param {Date} desde  inicio del periodo (inclusive, 00:00)
   * @param {Date} hasta  fin del periodo (inclusive, se toma el día completo)
   * @param {'dia'|'semana'|'mes'} agrupacion
   */
  constructor(desde, hasta, agrupacion = 'dia') {
    this.desde = inicioDelDia(desde);
    this.hasta = inicioDelDia(hasta);
    this.agrupacion = agrupacion;
    this.validar();
  }

  validar() {
    if (this.desde > this.hasta) {
      throw new Error('La fecha "desde" no puede ser posterior a "hasta"');
    }
    if (this.dias() > MAX_DIAS) {
      throw new Error(`El rango no puede superar ${MAX_DIAS} días`);
    }
    if (!AGRUPACIONES.includes(this.agrupacion)) {
      throw new Error(`Agrupación inválida. Usa: ${AGRUPACIONES.join(', ')}`);
    }
  }

  dias() {
    return Math.round((this.hasta - this.desde) / MS_DIA) + 1;
  }

  /** Límite superior EXCLUSIVO (día siguiente a "hasta", 00:00) para consultas */
  hastaExclusivo() {
    return new Date(this.hasta.getTime() + MS_DIA);
  }

  /**
   * Construye el rango a partir de los filtros del dashboard.
   * @param {{ rango?: string, desde?: string, hasta?: string, agrupacion?: string }} filtros
   * @param {Date} hoy  se inyecta para poder probarlo sin depender del reloj
   */
  static desdeFiltros({ rango = RANGOS.ULTIMOS_30_DIAS, desde, hasta, agrupacion } = {}, hoy = new Date()) {
    const finHoy = inicioDelDia(hoy);
    let inicio;
    let fin = finHoy;

    switch (rango) {
      case RANGOS.ULTIMOS_7_DIAS:
        inicio = new Date(finHoy.getTime() - 6 * MS_DIA);
        break;
      case RANGOS.ULTIMOS_30_DIAS:
        inicio = new Date(finHoy.getTime() - 29 * MS_DIA);
        break;
      case RANGOS.ESTE_MES:
        inicio = new Date(finHoy.getFullYear(), finHoy.getMonth(), 1);
        break;
      case RANGOS.PERSONALIZADO:
        inicio = parsearFecha(desde, 'desde');
        fin = parsearFecha(hasta, 'hasta');
        break;
      default:
        throw new Error(`Rango inválido. Usa: ${Object.values(RANGOS).join(', ')}`);
    }

    // Si no se indica agrupación, se elige una razonable según el tamaño del rango
    const dias = Math.round((fin - inicio) / MS_DIA) + 1;
    const agrupacionFinal = agrupacion || (dias <= 31 ? 'dia' : dias <= 120 ? 'semana' : 'mes');

    return new RangoFechas(inicio, fin, agrupacionFinal);
  }
}
