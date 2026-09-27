export const ESTADOS_PEDIDO = Object.freeze({
  PENDIENTE: 'pendiente',
  APROBADO: 'aprobado',
  RECHAZADO: 'rechazado',
});

// Un item representa un producto dentro del pedido (tabla pedido_productos)
export class PedidoItem {
  constructor({ productoId, cantidad, precioUnitario }) {
    this.productoId = productoId;
    this.cantidad = Number(cantidad);
    this.precioUnitario = Number(precioUnitario);

    if (!this.productoId) {
      throw new Error('El item del pedido debe tener un productoId');
    }
    if (!Number.isInteger(this.cantidad) || this.cantidad <= 0) {
      throw new Error('La cantidad debe ser un entero mayor a 0');
    }
    if (Number.isNaN(this.precioUnitario) || this.precioUnitario < 0) {
      throw new Error('El precio unitario debe ser un número mayor o igual a 0');
    }
  }

  subtotal() {
    return this.cantidad * this.precioUnitario;
  }
}

export class Pedido {
  constructor({
    id = null,
    usuarioId,
    estado = ESTADOS_PEDIDO.PENDIENTE,
    items = [],
    createdAt = null,
  }) {
    this.id = id;
    this.usuarioId = usuarioId;
    this.estado = estado;
    // items: array de PedidoItem
    this.items = items.map((it) => (it instanceof PedidoItem ? it : new PedidoItem(it)));
    this.createdAt = createdAt;

    this.validar();
  }

  validar() {
    if (!this.usuarioId) {
      throw new Error('El pedido debe estar asociado a un usuario');
    }
    if (!Object.values(ESTADOS_PEDIDO).includes(this.estado)) {
      throw new Error(`Estado de pedido inválido: ${this.estado}`);
    }
    if (!this.items || this.items.length === 0) {
      throw new Error('El pedido debe tener al menos un producto');
    }
  }

  // Regla de negocio: cálculo del monto total del pedido
  calcularTotal() {
    return this.items.reduce((total, item) => total + item.subtotal(), 0);
  }

  aprobar() {
    if (this.estado !== ESTADOS_PEDIDO.PENDIENTE) {
      throw new Error('Solo se pueden aprobar pedidos que están pendientes');
    }
    this.estado = ESTADOS_PEDIDO.APROBADO;
  }

  rechazar() {
    if (this.estado !== ESTADOS_PEDIDO.PENDIENTE) {
      throw new Error('Solo se pueden rechazar pedidos que están pendientes');
    }
    this.estado = ESTADOS_PEDIDO.RECHAZADO;
  }
}