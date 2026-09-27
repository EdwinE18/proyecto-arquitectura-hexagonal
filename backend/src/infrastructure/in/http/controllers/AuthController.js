export class AuthController {
  /**
   * @param {import('../../../../application/usecases/RegistrarUsuarioUseCase.js').RegistrarUsuarioUseCase} registrarUsuarioUseCase
   * @param {import('../../../../application/usecases/LoginUseCase.js').LoginUseCase} loginUseCase
   */
  constructor(registrarUsuarioUseCase, loginUseCase) {
    this.registrarUsuarioUseCase = registrarUsuarioUseCase;
    this.loginUseCase = loginUseCase;
  }
 
  registrar = async (req, res) => {
    try {
      const { nombre, apellidoPaterno, apellidoMaterno, correo, password } = req.body;
      const usuario = await this.registrarUsuarioUseCase.ejecutar({
        nombre,
        apellidoPaterno,
        apellidoMaterno,
        correo,
        passwordPlano: password,
      });
      res.status(201).json({
        mensaje: 'Registro exitoso. Tu solicitud quedó pendiente de aprobación por el administrador.',
        usuario: {
          id: usuario.id,
          nombre: usuario.nombreCompleto(),
          correo: usuario.correo,
          estado: usuario.estado,
        },
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };
 
  login = async (req, res) => {
    try {
      const { correo, password } = req.body;
      const resultado = await this.loginUseCase.ejecutar({ correo, passwordPlano: password });
      res.status(200).json(resultado);
    } catch (error) {
      res.status(401).json({ error: error.message });
    }
  };
}
 