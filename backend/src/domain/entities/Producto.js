export class Producto {
  constructor({
    id = null,
    nombre,
    descripcion = '',
    imagenUrl = null,
    precio,
    stock,
    createdAt = null,
  }) {
    this.id = id;
    this.nombre = nombre;
    this.descripcion = descripcion;
    this.imagenUrl = imagenUrl;
    this.precio = Number(precio);
    this.stock = Number(stock);
    this.createdAt = createdAt;

    this.validar();
  }

  validar() {
    if (!this.nombre || this.nombre.trim().length < 2) {
      throw new Error('El nombre del producto debe tener al menos 2 caracteres');
    }
    if (Number.isNaN(this.precio) || this.precio < 0) {
      throw new Error('El precio debe ser un número mayor o igual a 0');
    }
    if (Number.isNaN(this.stock) || !Number.isInteger(this.stock) || this.stock < 0) {
      throw new Error('El stock debe ser un número entero mayor o igual a 0');
    }
  }

  // Regla de negocio: comprobar si hay stock suficiente al ordenar
  // "comprobación de stock disponible al ordenar",
  // pero NO se descuenta realmente, es solo simulación de compra).
  tieneStockDisponible(cantidadSolicitada) {
    return this.stock >= cantidadSolicitada;
  }

  actualizarDatos({ nombre, descripcion, imagenUrl, precio, stock }) {
    if (nombre !== undefined) this.nombre = nombre;
    if (descripcion !== undefined) this.descripcion = descripcion;
    if (imagenUrl !== undefined) this.imagenUrl = imagenUrl;
    if (precio !== undefined) this.precio = Number(precio);
    if (stock !== undefined) this.stock = Number(stock);
    this.validar();
  }
}