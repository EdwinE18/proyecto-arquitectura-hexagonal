export class LoginUseCase {
  /**
   * @param {import('../ports/out/UsuarioRepositoryPort.js').UsuarioRepositoryPort} usuarioRepository
   * @param {import('../ports/out/PasswordHasherPort.js').PasswordHasherPort} passwordHasher
   * @param {{ generarToken: (payload: object) => string }} tokenService
   */
  constructor(usuarioRepository, passwordHasher, tokenService) {
    this.usuarioRepository = usuarioRepository;
    this.passwordHasher = passwordHasher;
    this.tokenService = tokenService;
  }

  async ejecutar({ correo, passwordPlano }) {
    const usuario = await this.usuarioRepository.buscarPorCorreo(correo);
    if (!usuario) {
      throw new Error('Correo o contraseña incorrectos');
    }

    const passwordCorrecta = await this.passwordHasher.comparar(passwordPlano, usuario.passwordHash);
    if (!passwordCorrecta) {
      throw new Error('Correo o contraseña incorrectos');
    }

    if (usuario.estado === 'pendiente') {
      throw new Error('Tu cuenta aún no ha sido aprobada por el administrador');
    }
    if (usuario.estado === 'rechazado') {
      throw new Error('Tu solicitud de registro fue rechazada');
    }

    const token = this.tokenService.generarToken({
      id: usuario.id,
      correo: usuario.correo,
      rol: usuario.rol,
    });

    return {
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombreCompleto(),
        correo: usuario.correo,
        rol: usuario.rol,
      },
    };
  }
}
