export class PedidoRepositoryPort {
  // Debe guardar el pedido junto con sus items (pedido_productos)
  async guardar(pedido) {
    throw new Error('Método guardar() no implementado');
  }
 
  async buscarPorId(id) {
    throw new Error('Método buscarPorId() no implementado');
  }
 
  async listarTodos() {
    throw new Error('Método listarTodos() no implementado');
  }
 
  async listarPorUsuario(usuarioId) {
    throw new Error('Método listarPorUsuario() no implementado');
  }
 
  async listarPendientes() {
    throw new Error('Método listarPendientes() no implementado');
  }
 
  async actualizarEstado(pedido) {
    throw new Error('Método actualizarEstado() no implementado');
  }
}