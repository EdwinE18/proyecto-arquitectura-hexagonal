import { UsuarioRepositoryPort } from '../../../application/ports/out/UsuarioRepositoryPort.js';
import { Usuario } from '../../../domain/entities/Usuario.js';
import { pool } from './db.js';
 
// Convierte una fila de la tabla "usuarios" en una entidad de dominio Usuario
function filaAUsuario(fila) {
  if (!fila) return null;
  return new Usuario({
    id: fila.id,
    nombre: fila.nombre,
    apellidoPaterno: fila.apellido_paterno,
    apellidoMaterno: fila.apellido_materno,
    correo: fila.correo,
    passwordHash: fila.password_hash,
    rol: fila.rol,
    estado: fila.estado,
    createdAt: fila.created_at,
  });
}
 
export class PostgresUsuarioRepository extends UsuarioRepositoryPort {
  async guardar(usuario) {
    const query = `
      INSERT INTO usuarios (nombre, apellido_paterno, apellido_materno, correo, password_hash, rol, estado)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;
    const valores = [
      usuario.nombre,
      usuario.apellidoPaterno,
      usuario.apellidoMaterno,
      usuario.correo,
      usuario.passwordHash,
      usuario.rol,
      usuario.estado,
    ];
    const { rows } = await pool.query(query, valores);
    return filaAUsuario(rows[0]);
  }
 
  async buscarPorId(id) {
    const { rows } = await pool.query('SELECT * FROM usuarios WHERE id = $1', [id]);
    return filaAUsuario(rows[0]);
  }
 
  async buscarPorCorreo(correo) {
    const { rows } = await pool.query('SELECT * FROM usuarios WHERE correo = $1', [correo]);
    return filaAUsuario(rows[0]);
  }
 
  async listarPendientes() {
    const { rows } = await pool.query(
      "SELECT * FROM usuarios WHERE estado = 'pendiente' ORDER BY created_at ASC"
    );
    return rows.map(filaAUsuario);
  }
 
  async listarTodos() {
    const { rows } = await pool.query('SELECT * FROM usuarios ORDER BY created_at DESC');
    return rows.map(filaAUsuario);
  }
 
  async actualizar(usuario) {
    const query = `
      UPDATE usuarios
      SET nombre = $1, apellido_paterno = $2, apellido_materno = $3,
          correo = $4, rol = $5, estado = $6
      WHERE id = $7
      RETURNING *;
    `;
    const valores = [
      usuario.nombre,
      usuario.apellidoPaterno,
      usuario.apellidoMaterno,
      usuario.correo,
      usuario.rol,
      usuario.estado,
      usuario.id,
    ];
    const { rows } = await pool.query(query, valores);
    return filaAUsuario(rows[0]);
  }
}
 