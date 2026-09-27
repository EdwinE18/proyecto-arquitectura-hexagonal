import bcrypt from 'bcrypt';
import { PasswordHasherPort } from '../../../application/ports/out/PasswordHasherPort.js';
 
const SALT_ROUNDS = 10;
 
export class BcryptPasswordHasher extends PasswordHasherPort {
  async hashear(passwordPlano) {
    return bcrypt.hash(passwordPlano, SALT_ROUNDS);
  }
 
  async comparar(passwordPlano, passwordHash) {
    return bcrypt.compare(passwordPlano, passwordHash);
  }
}
 