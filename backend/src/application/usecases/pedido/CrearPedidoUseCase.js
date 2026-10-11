import { Pedido, PedidoItem } from '../../../domain/entities/Pedido.js';

export class CrearPedidoUseCase {
  /**
   * @param {import('../../ports/out/PedidoRepositoryPort.js').PedidoRepositoryPort} pedidoRepository
   * @param {import('../../ports/out/ProductoRepositoryPort.js').ProductoRepositoryPort} productoRepository
   * @param {import('../../ports/out/UsuarioRepositoryPort.js').UsuarioRepositoryPort} usuarioRepository
   * @param {import('../../ports/out/EmailServicePort.js').EmailServicePort} emailService
   */
  constructor(pedidoRepository, productoRepository, usuarioRepository, emailService) {
    this.pedidoRepository = pedidoRepository;
    this.productoRepository = productoRepository;
    this.usuarioRepository = usuarioRepository;
    this.emailService = emailService; // solo conoce el PUERTO, no Nodemailer
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
    const detalleCorreo = []; // datos legibles para el correo (con nombre del producto)

    for (const { productoId, cantidad } of itemsSolicitados) {
      const producto = await this.productoRepository.buscarPorId(productoId);
      if (!producto) {
        throw new Error(`El producto con id ${productoId} no existe`);
      }

      // Regla de negocio del dominio: comprobar stock disponible al ordenar.
      // NOTA: es una SIMULACIÓN, no se descuenta stock real.
      if (!producto.tieneStockDisponible(cantidad)) {
        throw new Error(`Stock insuficiente para el producto "${producto.nombre}"`);
      }

      const item = new PedidoItem({
        productoId: producto.id,
        cantidad,
        precioUnitario: producto.precio,
      });
      items.push(item);
      detalleCorreo.push({
        nombre: producto.nombre,
        cantidad: item.cantidad,
        precioUnitario: item.precioUnitario,
        subtotal: item.subtotal(),
      });
    }

    const pedido = new Pedido({ usuarioId, items });
    pedido.total = pedido.calcularTotal();

    const pedidoGuardado = await this.pedidoRepository.guardar(pedido);

    // Notificaciones por correo a través del puerto de salida.
    // Si el correo falla, el pedido YA quedó registrado: no se revierte la compra.
    await this.#notificar(usuarioId, pedidoGuardado, pedido.total, detalleCorreo);

    return pedidoGuardado;
  }

  async #notificar(usuarioId, pedidoGuardado, total, detalleCorreo) {
    try {
      const usuario = await this.usuarioRepository.buscarPorId(usuarioId);
      if (!usuario) return;

      const datos = {
        cliente: {
          nombre: `${usuario.nombre} ${usuario.apellidoPaterno ?? ''}`.trim(),
          correo: usuario.correo,
        },
        pedido: {
          id: pedidoGuardado.id,
          estado: 'Pendiente de Pago',
          total,
          fecha: pedidoGuardado.createdAt ?? new Date(),
          items: detalleCorreo,
        },
      };

      await Promise.all([
        this.emailService.enviarComprobanteCliente(datos),
        this.emailService.notificarNuevoPedidoAdmin(datos),
      ]);
    } catch (error) {
      console.error('[CrearPedido] El pedido se guardó pero falló el envío de correo:', error.message);
    }
  }
}