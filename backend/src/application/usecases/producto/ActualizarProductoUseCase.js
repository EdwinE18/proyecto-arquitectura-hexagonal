export class ActualizarProductoUseCase {
  /**
   * @param {import('../../ports/out/ProductoRepositoryPort.js').ProductoRepositoryPort} productoRepository
   */
  constructor(productoRepository) {
    this.productoRepository = productoRepository;
  }
 
  async ejecutar(id, datosNuevos) {
    const producto = await this.productoRepository.buscarPorId(id);
    if (!producto) {
      throw new Error('Producto no encontrado');
    }
 
    producto.actualizarDatos(datosNuevos); // valida reglas de negocio en la entidad
    return this.productoRepository.actualizar(producto);
  }
}
 