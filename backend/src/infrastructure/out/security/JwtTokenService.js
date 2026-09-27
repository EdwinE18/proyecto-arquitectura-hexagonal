import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
 
dotenv.config();
 
const SECRET = process.env.JWT_SECRET;
const EXPIRA_EN = '8h';
 
export class JwtTokenService {
  generarToken(payload) {
    return jwt.sign(payload, SECRET, { expiresIn: EXPIRA_EN });
  }
 
  verificarToken(token) {
    return jwt.verify(token, SECRET);
  }
}