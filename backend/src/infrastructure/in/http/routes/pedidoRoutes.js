import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { roleMiddleware } from '../middlewares/roleMiddleware.js';
 
export function crearPedidoRoutes(pedidoController) {
  const router = Router();
 
  // El rol "pedido" crea solicitudes; el admin también podría por completitud
  router.post('/', authMiddleware, roleMiddleware(['pedido', 'admin']), pedidoController.crear);
 
  // Listar: admin ve todos, "pedido" ve los suyos (la lógica de filtrado vive en el caso de uso)
  router.get('/', authMiddleware, roleMiddleware(['pedido', 'admin']), pedidoController.listar);
 
  // Solo el admin aprueba o rechaza
  router.patch('/:id', authMiddleware, roleMiddleware(['admin']), pedidoController.resolver);
 
  return router;
}
 