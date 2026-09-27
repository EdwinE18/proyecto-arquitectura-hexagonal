import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { roleMiddleware } from '../middlewares/roleMiddleware.js';
 
export function crearProductoRoutes(productoController) {
  const router = Router();
 
  // Cualquier usuario autenticado (admin, producto o pedido) puede CONSULTAR el catálogo
  router.get('/', authMiddleware, productoController.listar);
 
  // Solo el rol "producto" (o admin) puede dar de alta/baja o modificar productos
  router.post('/', authMiddleware, roleMiddleware(['producto', 'admin']), productoController.crear);
  router.put('/:id', authMiddleware, roleMiddleware(['producto', 'admin']), productoController.actualizar);
  router.delete('/:id', authMiddleware, roleMiddleware(['producto', 'admin']), productoController.eliminar);
 
  return router;
}
 