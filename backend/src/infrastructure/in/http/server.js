import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
 
dotenv.config();
 
// --- Infraestructura (adaptadores concretos) ---
import { PostgresUsuarioRepository } from '../../out/postgres/PostgresUsuarioRepository.js';
import { PostgresProductoRepository } from '../../out/postgres/PostgresProductoRepository.js';
import { PostgresPedidoRepository } from '../../out/postgres/PostgresPedidoRepository.js';
import { BcryptPasswordHasher } from '../../out/security/BcryptPasswordHasher.js';
import { JwtTokenService } from '../../out/security/JwtTokenService.js';
 
// --- Casos de uso (aplicación) ---
import { RegistrarUsuarioUseCase } from '../../../application/usecases/RegistrarUsuarioUseCase.js';
import { LoginUseCase } from '../../../application/usecases/LoginUseCase.js';
import { ListarSolicitudesPendientesUseCase } from '../../../application/usecases/ListarSolicitudesPendientesUseCase.js';
import { ResolverSolicitudUsuarioUseCase } from '../../../application/usecases/ResolverSolicitudUsuarioUseCase.js';
 
import { CrearProductoUseCase } from '../../../application/usecases/producto/CrearProductoUseCase.js';
import { ListarProductosUseCase } from '../../../application/usecases/producto/ListarProductosUseCase.js';
import { ActualizarProductoUseCase } from '../../../application/usecases/producto/ActualizarProductoUseCase.js';
import { EliminarProductoUseCase } from '../../../application/usecases/producto/EliminarProductoUseCase.js';
 
import { CrearPedidoUseCase } from '../../../application/usecases/pedido/CrearPedidoUseCase.js';
import { ListarPedidosUseCase } from '../../../application/usecases/pedido/ListarPedidosUseCase.js';
import { ResolverPedidoUseCase } from '../../../application/usecases/pedido/ResolverPedidoUseCase.js';
 
// --- Controladores y rutas (adaptadores de entrada) ---
import { AuthController } from './controllers/AuthController.js';
import { AdminController } from './controllers/AdminController.js';
import { ProductoController } from './controllers/ProductoController.js';
import { PedidoController } from './controllers/PedidoController.js';
 
import { crearAuthRoutes } from './routes/authRoutes.js';
import { crearAdminRoutes } from './routes/adminRoutes.js';
import { crearProductoRoutes } from './routes/productoRoutes.js';
import { crearPedidoRoutes } from './routes/pedidoRoutes.js';
 
// ============================================
// 1. Instanciar adaptadores de salida (infraestructura)
// ============================================
const usuarioRepository = new PostgresUsuarioRepository();
const productoRepository = new PostgresProductoRepository();
const pedidoRepository = new PostgresPedidoRepository();
const passwordHasher = new BcryptPasswordHasher();
const tokenService = new JwtTokenService();
 
// ============================================
// 2. Instanciar casos de uso, inyectando los puertos
// ============================================
const registrarUsuarioUseCase = new RegistrarUsuarioUseCase(usuarioRepository, passwordHasher);
const loginUseCase = new LoginUseCase(usuarioRepository, passwordHasher, tokenService);
const listarSolicitudesUseCase = new ListarSolicitudesPendientesUseCase(usuarioRepository);
const resolverSolicitudUseCase = new ResolverSolicitudUsuarioUseCase(usuarioRepository);
 
const crearProductoUseCase = new CrearProductoUseCase(productoRepository);
const listarProductosUseCase = new ListarProductosUseCase(productoRepository);
const actualizarProductoUseCase = new ActualizarProductoUseCase(productoRepository);
const eliminarProductoUseCase = new EliminarProductoUseCase(productoRepository);
 
const crearPedidoUseCase = new CrearPedidoUseCase(pedidoRepository, productoRepository);
const listarPedidosUseCase = new ListarPedidosUseCase(pedidoRepository);
const resolverPedidoUseCase = new ResolverPedidoUseCase(pedidoRepository);
 
// ============================================
// 3. Instanciar controladores, inyectando los casos de uso
// ============================================
const authController = new AuthController(registrarUsuarioUseCase, loginUseCase);
const adminController = new AdminController(listarSolicitudesUseCase, resolverSolicitudUseCase, usuarioRepository);
const productoController = new ProductoController(
  crearProductoUseCase,
  listarProductosUseCase,
  actualizarProductoUseCase,
  eliminarProductoUseCase
);
const pedidoController = new PedidoController(crearPedidoUseCase, listarPedidosUseCase, resolverPedidoUseCase);
 
// ============================================
// 4. Configurar Express y montar rutas
// ============================================
const app = express();
 
app.use(cors());
app.use(express.json());
 
app.get('/', (req, res) => {
  res.json({ mensaje: 'API del sistema de e-commerce funcionando correctamente 🚀' });
});
 
app.use('/api/auth', crearAuthRoutes(authController));
app.use('/api/admin', crearAdminRoutes(adminController));
app.use('/api/productos', crearProductoRoutes(productoController));
app.use('/api/pedidos', crearPedidoRoutes(pedidoController));
 
// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});
 
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});