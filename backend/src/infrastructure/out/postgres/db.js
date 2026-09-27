import pkg from 'pg';
import dotenv from 'dotenv';
 
dotenv.config();
 
const { Pool } = pkg;
 
export const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});
 
// Prueba de conexión al iniciar (ayuda a detectar errores de .env rápido)
pool.connect()
  .then((client) => {
    console.log('✅ Conectado a PostgreSQL correctamente');
    client.release();
  })
  .catch((err) => {
    console.error('❌ Error al conectar a PostgreSQL:', err.message);
  });