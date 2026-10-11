// src/application/ports/out/EmailServicePort.js
//
// PUERTO DE SALIDA: contrato para enviar notificaciones por correo.
// La capa de aplicación solo sabe QUÉ necesita (avisar al cliente y al admin),
// no CÓMO se envía. No conoce Nodemailer, SMTP, Mailtrap ni Ethereal:
// eso lo decide el adaptador de infraestructura (NodemailAdapter).

export class EmailServicePort {
  /**
   * Envía al cliente el comprobante de compra con las instrucciones de pago.
   * @param {{
   *   cliente: { nombre: string, correo: string },
   *   pedido: { id: number, estado: string, total: number, fecha: Date,
   *             items: { nombre: string, cantidad: number, precioUnitario: number, subtotal: number }[] }
   * }} datos
   */
  async enviarComprobanteCliente(datos) {
    throw new Error('EmailServicePort.enviarComprobanteCliente() no implementado');
  }

  /**
   * Notifica al administrador que llegó un pedido nuevo.
   * @param {{ cliente: { nombre: string, correo: string }, pedido: object }} datos
   */
  async notificarNuevoPedidoAdmin(datos) {
    throw new Error('EmailServicePort.notificarNuevoPedidoAdmin() no implementado');
  }
}