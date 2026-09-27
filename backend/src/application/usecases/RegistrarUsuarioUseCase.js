import { Usuario, ESTADOS_USUARIO } from '../../domain/entities/Usuario.js';

export class RegistrarUsuarioUseCase {
  /**
   * @param {import('../ports/out/UsuarioRepositoryPort.js').UsuarioRepositoryPort} usuarioRepository
   * @param {import('../ports/out/PasswordHasherPort.js').PasswordHasherPort} passwordHasher
   */
  constructor(usuarioRepository, passwordHasher) {
    this.usuarioRepository = usuarioRepository;
    this.passwordHasher = passwordHasher;
  }

  async ejecutar({ nombre, apellidoPaterno, apellidoMaterno, correo, passwordPlano }) {
    // 1. Regla de negocio del dominio: validar la contraseña en texto plano
    const { valida, motivo } = Usuario.passwordEsValida(passwordPlano);
    if (!valida) {
      throw new Error(motivo);
    }

    // 2. Verificar que el correo no esté ya registrado
    const existente = await this.usuarioRepository.buscarPorCorreo(correo);
    if (existente) {
      throw new Error('Ya existe un usuario registrado con ese correo');
    }

    // 3. Hashear la contraseña (detalle de infraestructura, vía el puerto)
    const passwordHash = await this.passwordHasher.hashear(passwordPlano);

    // 4. Crear la entidad de dominio (aquí corren las validaciones del constructor)
    const usuario = new Usuario({
      nombre,
      apellidoPaterno,
      apellidoMaterno,
      correo,
      passwordHash,
      rol: null,
      estado: ESTADOS_USUARIO.PENDIENTE,
    });

    // 5. Persistir a través del puerto (no sabemos ni nos importa si es Postgres)
    const usuarioGuardado = await this.usuarioRepository.guardar(usuario);

    return usuarioGuardado;
  }
}