export class PedidoController {
  /**
   * @param {import('../../../../application/usecases/pedido/CrearPedidoUseCase.js').CrearPedidoUseCase} crearUseCase
   * @param {import('../../../../application/usecases/pedido/ListarPedidosUseCase.js').ListarPedidosUseCase} listarUseCase
   * @param {import('../../../../application/usecases/pedido/ResolverPedidoUseCase.js').ResolverPedidoUseCase} resolverUseCase
   */
  constructor(crearUseCase, listarUseCase, resolverUseCase) {
    this.crearUseCase = crearUseCase;
    this.listarUseCase = listarUseCase;
    this.resolverUseCase = resolverUseCase;
  }
 
  // Rol "pedido": crea una solicitud de compra (simulación)
  crear = async (req, res) => {
    try {
      const usuarioId = req.usuario.id; // viene del token JWT
      const { items } = req.body; // [{ productoId, cantidad }, ...]
      const pedido = await this.crearUseCase.ejecutar({ usuarioId, itemsSolicitados: items });
      res.status(201).json(pedido);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };
 
  // Admin ve todos; rol "pedido" ve solo los suyos
  listar = async (req, res) => {
    try {
      const { id: usuarioId, rol } = req.usuario;
      const pedidos = await this.listarUseCase.ejecutar({ usuarioId, rol });
      res.status(200).json(pedidos);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };
 
  // Solo admin: aprobar o rechazar
  resolver = async (req, res) => {
    try {
      const { id } = req.params;
      const { accion } = req.body; // 'aprobar' | 'rechazar'
      const pedido = await this.resolverUseCase.ejecutar({ pedidoId: id, accion });
      res.status(200).json(pedido);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };
}