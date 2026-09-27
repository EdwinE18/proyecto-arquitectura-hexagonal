import { JwtTokenService } from '../../../out/security/JwtTokenService.js';
 
const tokenService = new JwtTokenService();
 
export function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }
 
  const token = authHeader.split(' ')[1];
 
  try {
    const payload = tokenService.verificarToken(token);
    req.usuario = payload; // { id, correo, rol }
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
}
 