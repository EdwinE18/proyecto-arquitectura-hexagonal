// Entidad pura de dominio: no conoce Express, ni PostgreSQL, ni bcrypt.
// Solo conoce las reglas de negocio de un Usuario.

export const ROLES = Object.freeze({
  ADMIN: 'admin',
  PRODUCTO: 'producto',
  PEDIDO: 'pedido',
});

export const ESTADOS_USUARIO = Object.freeze({
  PENDIENTE: 'pendiente',
  APROBADO: 'aprobado',
  RECHAZADO: 'rechazado',
});

export class Usuario {
  constructor({
    id = null,
    nombre,
    apellidoPaterno,
    apellidoMaterno,
    correo,
    passwordHash,
    rol = null,
    estado = ESTADOS_USUARIO.PENDIENTE,
    createdAt = null,
  }) {
    this.id = id;
    this.nombre = nombre;
    this.apellidoPaterno = apellidoPaterno;
    this.apellidoMaterno = apellidoMaterno;
    this.correo = correo;
    this.passwordHash = passwordHash;
    this.rol = rol;
    this.estado = estado;
    this.createdAt = createdAt;

    this.validar();
  }

  // ---- Reglas de negocio ----

  validar() {
    if (!this.nombre || this.nombre.trim().length < 2) {
      throw new Error('El nombre debe tener al menos 2 caracteres');
    }
    if (!this.apellidoPaterno || this.apellidoPaterno.trim().length < 2) {
      throw new Error('El apellido paterno debe tener al menos 2 caracteres');
    }
    if (!this.apellidoMaterno || this.apellidoMaterno.trim().length < 2) {
      throw new Error('El apellido materno debe tener al menos 2 caracteres');
    }
    if (!this.correoEsValido(this.correo)) {
      throw new Error('El correo no tiene un formato válido');
    }
    if (this.rol && !Object.values(ROLES).includes(this.rol)) {
      throw new Error(`Rol inválido: ${this.rol}`);
    }
    if (!Object.values(ESTADOS_USUARIO).includes(this.estado)) {
      throw new Error(`Estado inválido: ${this.estado}`);
    }
  }

  correoEsValido(correo) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return typeof correo === 'string' && regex.test(correo);
  }

  
  static passwordEsValida(passwordPlano) {
    if (typeof passwordPlano !== 'string' || passwordPlano.length < 8) {
      return { valida: false, motivo: 'La contraseña debe tener al menos 8 caracteres' };
    }
    const tieneNumero = /\d/.test(passwordPlano);
    const tieneLetra = /[a-zA-Z]/.test(passwordPlano);
    if (!tieneNumero || !tieneLetra) {
      return { valida: false, motivo: 'La contraseña debe tener al menos una letra y un número' };
    }
    return { valida: true, motivo: null };
  }

  esAdmin() {
    return this.rol === ROLES.ADMIN;
  }

  estaAprobado() {
    return this.estado === ESTADOS_USUARIO.APROBADO;
  }

  aprobar(rolAsignado) {
    if (!Object.values(ROLES).includes(rolAsignado) || rolAsignado === ROLES.ADMIN) {
      throw new Error('El admin solo puede asignar el rol "producto" o "pedido"');
    }
    this.estado = ESTADOS_USUARIO.APROBADO;
    this.rol = rolAsignado;
  }

  rechazar() {
    this.estado = ESTADOS_USUARIO.RECHAZADO;
    this.rol = null;
  }

  nombreCompleto() {
    return `${this.nombre} ${this.apellidoPaterno} ${this.apellidoMaterno}`;
  }
}