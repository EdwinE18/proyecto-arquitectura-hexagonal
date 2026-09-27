export class ListarSolicitudesPendientesUseCase {
  /**
   * @param {import('../ports/out/UsuarioRepositoryPort.js').UsuarioRepositoryPort} usuarioRepository
   */
  constructor(usuarioRepository) {
    this.usuarioRepository = usuarioRepository;
  }

  async ejecutar() {
    const pendientes = await this.usuarioRepository.listarPendientes();
    return pendientes.map((u) => ({
      id: u.id,
      nombreCompleto: u.nombreCompleto(),
      correo: u.correo,
      createdAt: u.createdAt,
    }));
  }
}