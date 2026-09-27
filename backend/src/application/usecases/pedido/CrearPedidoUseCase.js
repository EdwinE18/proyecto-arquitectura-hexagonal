import { Pedido, PedidoItem } from '../../../domain/entities/Pedido.js';
 
export class CrearPedidoUseCase {
  /**
   * @param {import('../../ports/out/PedidoRepositoryPort.js').PedidoRepositoryPort} pedidoRepository
   * @param {import('../../ports/out/ProductoRepositoryPort.js').ProductoRepositoryPort} productoRepository
   */
  constructor(pedidoRepository, productoRepository) {
    this.pedidoRepository = pedidoRepository;
    this.productoRepository = productoRepository;
  }
 
  /**
   * @param {number} usuarioId - quien solicita el pedido (rol "pedido")
   * @param {{productoId: number, cantidad: number}[]} itemsSolicitados
   */
  async ejecutar({ usuarioId, itemsSolicitados }) {
    if (!itemsSolicitados || itemsSolicitados.length === 0) {
      throw new Error('Debes incluir al menos un producto en el pedido');
    }
 
    const items = [];
 
    for (const { productoId, cantidad } of itemsSolicitados) {
      const producto = await this.productoRepository.buscarPorId(productoId);
      if (!producto) {
        throw new Error(`El producto con id ${productoId} no existe`);
      }
 
      // Regla de negocio del dominio: comprobar stock disponible al ordenar.
      // NOTA: según la actividad, esto es una SIMULACIÓN, no se descuenta stock real.
      if (!producto.tieneStockDisponible(cantidad)) {
        throw new Error(`Stock insuficiente para el producto "${producto.nombre}"`);
      }
 
      items.push(new PedidoItem({
        productoId: producto.id,
        cantidad,
        precioUnitario: producto.precio,
      }));
    }
 
    const pedido = new Pedido({ usuarioId, items });
    // El total se calcula con la regla de negocio de la entidad
    pedido.total = pedido.calcularTotal();
 
    return this.pedidoRepository.guardar(pedido);
  }
}