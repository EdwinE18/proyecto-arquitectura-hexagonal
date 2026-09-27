import { Router } from 'express';
 
export function crearAuthRoutes(authController) {
  const router = Router();
 
  router.post('/registro', authController.registrar);
  router.post('/login', authController.login);
 
  return router;
}
 