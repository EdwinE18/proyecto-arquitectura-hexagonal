import { Producto } from '../../../domain/entities/Producto.js';
 
export class CrearProductoUseCase {
  /**
   * @param {import('../../ports/out/ProductoRepositoryPort.js').ProductoRepositoryPort} productoRepository
   */
  constructor(productoRepository) {
    this.productoRepository = productoRepository;
  }
 
  async ejecutar({ nombre, descripcion, imagenUrl, precio, stock }) {
    const producto = new Producto({ nombre, descripcion, imagenUrl, precio, stock });
    return this.productoRepository.guardar(producto);
  }
}