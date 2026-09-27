// Script de una sola vez para crear al usuario ADMIN inicial.
// Ejecutar con: node src/infrastructure/seed.js
 
import dotenv from 'dotenv';
dotenv.config();
 
import { pool } from './out/postgres/db.js';
import { BcryptPasswordHasher } from './out/security/BcryptPasswordHasher.js';
 
async function crearAdmin() {
  const hasher = new BcryptPasswordHasher();
 
  const nombre = 'Admin';
  const apellidoPaterno = 'Sistema';
  const apellidoMaterno = 'General';
  const correo = 'admin@sistema.com';
  const passwordPlano = 'Admin1234'; // Cámbiala después de tu primer login si gustas
 
  const existente = await pool.query('SELECT id FROM usuarios WHERE correo = $1', [correo]);
  if (existente.rows.length > 0) {
    console.log('⚠️  El usuario admin ya existe. No se creó de nuevo.');
    await pool.end();
    return;
  }
 
  const passwordHash = await hasher.hashear(passwordPlano);
 
  await pool.query(
    `INSERT INTO usuarios (nombre, apellido_paterno, apellido_materno, correo, password_hash, rol, estado)
     VALUES ($1, $2, $3, $4, $5, 'admin', 'aprobado')`,
    [nombre, apellidoPaterno, apellidoMaterno, correo, passwordHash]
  );
 
  console.log('✅ Usuario admin creado correctamente');
  console.log(`   Correo: ${correo}`);
  console.log(`   Password: ${passwordPlano}`);
 
  await pool.end();
}
 
crearAdmin().catch((err) => {
  console.error('❌ Error al crear el admin:', err.message);
  process.exit(1);
});