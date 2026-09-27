export class ListarProductosUseCase {
  /**
   * @param {import('../../ports/out/ProductoRepositoryPort.js').ProductoRepositoryPort} productoRepository
   */
  constructor(productoRepository) {
    this.productoRepository = productoRepository;
  }
 
  async ejecutar() {
    return this.productoRepository.listarTodos();
  }
}
 