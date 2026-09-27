export class ProductoController {
  /**
   * @param {import('../../../../application/usecases/producto/CrearProductoUseCase.js').CrearProductoUseCase} crearUseCase
   * @param {import('../../../../application/usecases/producto/ListarProductosUseCase.js').ListarProductosUseCase} listarUseCase
   * @param {import('../../../../application/usecases/producto/ActualizarProductoUseCase.js').ActualizarProductoUseCase} actualizarUseCase
   * @param {import('../../../../application/usecases/producto/EliminarProductoUseCase.js').EliminarProductoUseCase} eliminarUseCase
   */
  constructor(crearUseCase, listarUseCase, actualizarUseCase, eliminarUseCase) {
    this.crearUseCase = crearUseCase;
    this.listarUseCase = listarUseCase;
    this.actualizarUseCase = actualizarUseCase;
    this.eliminarUseCase = eliminarUseCase;
  }
 
  crear = async (req, res) => {
    try {
      const { nombre, descripcion, imagenUrl, precio, stock } = req.body;
      const producto = await this.crearUseCase.ejecutar({ nombre, descripcion, imagenUrl, precio, stock });
      res.status(201).json(producto);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };
 
  listar = async (req, res) => {
    try {
      const productos = await this.listarUseCase.ejecutar();
      res.status(200).json(productos);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };
 
  actualizar = async (req, res) => {
    try {
      const { id } = req.params;
      const producto = await this.actualizarUseCase.ejecutar(id, req.body);
      res.status(200).json(producto);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };
 
  eliminar = async (req, res) => {
    try {
      const { id } = req.params;
      const resultado = await this.eliminarUseCase.ejecutar(id);
      res.status(200).json(resultado);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };
}
 