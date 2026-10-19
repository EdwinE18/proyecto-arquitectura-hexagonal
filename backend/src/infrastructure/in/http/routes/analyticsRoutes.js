// src/infrastructure/in/http/routes/analyticsRoutes.js
//
// Rutas de reportes. TODAS exigen token válido y rol "admin".

import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { roleMiddleware } from '../middlewares/roleMiddleware.js';

export function crearAnalyticsRoutes(analyticsController) {
  const router = Router();

  router.use(authMiddleware, roleMiddleware(['admin']));

  router.get('/resumen', analyticsController.resumen);
  router.get('/productos-top', analyticsController.productosTop);
  router.get('/ingresos', analyticsController.ingresos);
  router.get('/estados-pedidos', analyticsController.estadosPedidos);
  router.get('/ticket-promedio', analyticsController.ticketPromedio);

  return router;
}
