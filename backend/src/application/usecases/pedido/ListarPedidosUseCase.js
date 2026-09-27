export class ListarPedidosUseCase {
  /**
   * @param {import('../../ports/out/PedidoRepositoryPort.js').PedidoRepositoryPort} pedidoRepository
   */
  constructor(pedidoRepository) {
    this.pedidoRepository = pedidoRepository;
  }
 
  // El admin ve todos los pedidos; el rol "pedido" solo ve los suyos.
  async ejecutar({ usuarioId, rol }) {
    if (rol === 'admin') {
      return this.pedidoRepository.listarTodos();
    }
    return this.pedidoRepository.listarPorUsuario(usuarioId);
  }
}