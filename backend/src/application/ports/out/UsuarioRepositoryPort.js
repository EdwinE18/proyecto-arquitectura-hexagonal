// PUERTO DE SALIDA: es un "contrato". Define QUÉ necesita la capa de
// aplicación para persistir usuarios, pero NO CÓMO se hace (eso lo decide
// el adaptador de infraestructura, ej: PostgresUsuarioRepository).
//
// En JS no hay "interfaces" nativas, así que usamos una clase base que
// lanza error si algún método no fue implementado por el adaptador real.
// Esto documenta el contrato y ayuda a detectar errores de implementación.

export class UsuarioRepositoryPort {
  async guardar(usuario) {
    throw new Error('Método guardar() no implementado');
  }

  async buscarPorId(id) {
    throw new Error('Método buscarPorId() no implementado');
  }

  async buscarPorCorreo(correo) {
    throw new Error('Método buscarPorCorreo() no implementado');
  }

  async listarPendientes() {
    throw new Error('Método listarPendientes() no implementado');
  }

  async listarTodos() {
    throw new Error('Método listarTodos() no implementado');
  }

  async actualizar(usuario) {
    throw new Error('Método actualizar() no implementado');
  }
}