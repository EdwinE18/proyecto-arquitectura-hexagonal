export class ResolverPedidoUseCase {
  /**
   * @param {import('../../ports/out/PedidoRepositoryPort.js').PedidoRepositoryPort} pedidoRepository
   */
  constructor(pedidoRepository) {
    this.pedidoRepository = pedidoRepository;
  }
 
  /**
   * @param {number} pedidoId
   * @param {'aprobar'|'rechazar'} accion
   */
  async ejecutar({ pedidoId, accion }) {
    const pedido = await this.pedidoRepository.buscarPorId(pedidoId);
    if (!pedido) {
      throw new Error('Pedido no encontrado');
    }
 
    if (accion === 'aprobar') {
      pedido.aprobar(); // regla de negocio vive en la entidad Pedido
    } else if (accion === 'rechazar') {
      pedido.rechazar();
    } else {
      throw new Error('Acción inválida, debe ser "aprobar" o "rechazar"');
    }
 
    // Importante: NO se descuenta stock real, es solo una simulación de compra
    // (así lo pide la actividad explícitamente).
    return this.pedidoRepository.actualizarEstado(pedido);
  }
}