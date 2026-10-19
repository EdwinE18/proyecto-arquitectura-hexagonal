// src/modules/admin/services/reportesService.js
//
// Servicio del panel analítico. Igual que los demás servicios, usa el
// adaptador de red aislado (axiosClient), que ya agrega el token JWT.
import axiosClient from '../../../api/axiosClient.js';

export const reportesService = {
  /**
   * Trae todo el dashboard en una sola llamada.
   * @param {{ rango: '7d'|'30d'|'mes'|'personalizado', desde?: string, hasta?: string, limite?: 5|10 }} filtros
   */
  async resumen({ rango, desde, hasta, limite = 5 }) {
    const params = { rango, limite };
    if (rango === 'personalizado') {
      params.desde = desde;
      params.hasta = hasta;
    }
    const { data } = await axiosClient.get('/reportes/resumen', { params });
    return data;
  },
};
