import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { roleMiddleware } from '../middlewares/roleMiddleware.js';
 
export function crearAdminRoutes(adminController) {
  const router = Router();
 
  // Todas las rutas de admin requieren estar logueado Y tener rol admin
  router.use(authMiddleware, roleMiddleware(['admin']));
 
  router.get('/solicitudes', adminController.listarSolicitudesPendientes);
  router.patch('/solicitudes/:id', adminController.resolverSolicitud);
  router.get('/usuarios', adminController.listarTodosUsuarios);
 
  return router;
}
 