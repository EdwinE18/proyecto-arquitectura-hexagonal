//
// PUERTO DE SALIDA para el cifrado de contraseñas.
// La capa de aplicación solo sabe que puede "hashear" y "comparar",
// no sabe (ni le importa) que por debajo se usa bcrypt.

export class PasswordHasherPort {
  async hashear(passwordPlano) {
    throw new Error('Método hashear() no implementado');
  }

  async comparar(passwordPlano, passwordHash) {
    throw new Error('Método comparar() no implementado');
  }
}