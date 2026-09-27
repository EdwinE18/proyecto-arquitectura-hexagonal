export class AdminController {
  /**
   * @param {import('../../../../application/usecases/ListarSolicitudesPendientesUseCase.js').ListarSolicitudesPendientesUseCase} listarSolicitudesUseCase
   * @param {import('../../../../application/usecases/ResolverSolicitudUsuarioUseCase.js').ResolverSolicitudUsuarioUseCase} resolverSolicitudUseCase
   * @param {import('../../../../application/ports/out/UsuarioRepositoryPort.js').UsuarioRepositoryPort} usuarioRepository
   */
  constructor(listarSolicitudesUseCase, resolverSolicitudUseCase, usuarioRepository) {
    this.listarSolicitudesUseCase = listarSolicitudesUseCase;
    this.resolverSolicitudUseCase = resolverSolicitudUseCase;
    this.usuarioRepository = usuarioRepository;
  }
 
  listarSolicitudesPendientes = async (req, res) => {
    try {
      const solicitudes = await this.listarSolicitudesUseCase.ejecutar();
      res.status(200).json(solicitudes);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };
 
  resolverSolicitud = async (req, res) => {
    try {
      const { id } = req.params;
      const { accion, rol } = req.body; // accion: 'aprobar' | 'rechazar', rol: 'producto' | 'pedido'
      const usuario = await this.resolverSolicitudUseCase.ejecutar({
        usuarioId: id,
        accion,
        rolAsignado: rol,
      });
      res.status(200).json({
        mensaje: `Solicitud ${accion === 'aprobar' ? 'aprobada' : 'rechazada'} correctamente`,
        usuario: {
          id: usuario.id,
          nombre: usuario.nombreCompleto(),
          correo: usuario.correo,
          rol: usuario.rol,
          estado: usuario.estado,
        },
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };
 
  // El admin puede ver a todos los usuarios del sistema
  listarTodosUsuarios = async (req, res) => {
    try {
      const usuarios = await this.usuarioRepository.listarTodos();
      res.status(200).json(
        usuarios.map((u) => ({
          id: u.id,
          nombre: u.nombreCompleto(),
          correo: u.correo,
          rol: u.rol,
          estado: u.estado,
        }))
      );
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };
}