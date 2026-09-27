import { ROLES } from '../../domain/entities/Usuario.js';

export class ResolverSolicitudUsuarioUseCase {
  /**
   * @param {import('../ports/out/UsuarioRepositoryPort.js').UsuarioRepositoryPort} usuarioRepository
   */
  constructor(usuarioRepository) {
    this.usuarioRepository = usuarioRepository;
  }

  /**
   * @param {number} usuarioId
   * @param {'aprobar'|'rechazar'} accion
   * @param {'producto'|'pedido'|null} rolAsignado - obligatorio si accion === 'aprobar'
   */
  async ejecutar({ usuarioId, accion, rolAsignado = null }) {
    const usuario = await this.usuarioRepository.buscarPorId(usuarioId);
    if (!usuario) {
      throw new Error('Usuario no encontrado');
    }
    if (usuario.estado !== 'pendiente') {
      throw new Error('Esta solicitud ya fue resuelta anteriormente');
    }

    if (accion === 'aprobar') {
      if (!rolAsignado || (rolAsignado !== ROLES.PRODUCTO && rolAsignado !== ROLES.PEDIDO)) {
        throw new Error('Debes asignar el rol "producto" o "pedido" al aprobar');
      }
      usuario.aprobar(rolAsignado); // regla de negocio vive en la entidad
    } else if (accion === 'rechazar') {
      usuario.rechazar();
    } else {
      throw new Error('Acción inválida, debe ser "aprobar" o "rechazar"');
    }

    const actualizado = await this.usuarioRepository.actualizar(usuario);
    return actualizado;
  }
}