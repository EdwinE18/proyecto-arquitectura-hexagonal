export class EliminarProductoUseCase{
    /**
   * @param {import('../../ports/out/ProductoRepositoryPort.js').ProductoRepositoryPort} productoRepository
   */
  constructor(productoRepository) {
    this.productoRepository = productoRepository;
  }
 
  async ejecutar(id) {
    const producto = await this.productoRepository.buscarPorId(id);
    if (!producto) {
      throw new Error('Producto no encontrado');
    }
    await this.productoRepository.eliminar(id);
    return { mensaje: 'Producto eliminado correctamente' };
  }
}
