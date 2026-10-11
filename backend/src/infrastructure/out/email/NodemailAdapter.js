// ADAPTADOR DE SALIDA: implementa EmailServicePort usando Nodemailer.
// Es el ÚNICO archivo del proyecto que importa 'nodemailer'.
// Si mañana cambiamos a SendGrid o Amazon SES, solo se crea otro adaptador;
// el dominio y los casos de uso no se tocan.

import nodemailer from 'nodemailer';
import { EmailServicePort } from '../../../application/ports/out/EmailServicePort.js';
import {
  plantillaComprobanteCliente,
  plantillaNuevoPedidoAdmin,
} from './templates/pedidoTemplates.js';

export class NodemailAdapter extends EmailServicePort {
  constructor() {
    super();
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    this.remitente = process.env.MAIL_FROM || '"Tienda" <no-reply@tienda.com>';
    this.correoAdmin = process.env.ADMIN_EMAIL;
    this.banco = {
      nombre: process.env.BANCO_NOMBRE || 'Banco Ejemplo',
      titular: process.env.BANCO_TITULAR || 'Tienda S.A. de C.V.',
      clabe: process.env.BANCO_CLABE || '000000000000000000',
    };
  }

  async enviarComprobanteCliente({ cliente, pedido }) {
    const { asunto, html } = plantillaComprobanteCliente({ cliente, pedido, banco: this.banco });
    const info = await this.transporter.sendMail({
      from: this.remitente,
      to: cliente.correo,
      subject: asunto,
      html,
    });
    console.log(`[email] Comprobante del pedido #${pedido.id} enviado a ${cliente.correo} (${info.messageId})`);
  }

  async notificarNuevoPedidoAdmin({ cliente, pedido }) {
    if (!this.correoAdmin) {
      console.warn('[email] ADMIN_EMAIL no está configurado, no se notifica al admin');
      return;
    }
    const { asunto, html } = plantillaNuevoPedidoAdmin({ cliente, pedido });
    const info = await this.transporter.sendMail({
      from: this.remitente,
      to: this.correoAdmin,
      subject: asunto,
      html,
    });
    console.log(`[email] Aviso del pedido #${pedido.id} enviado al admin (${info.messageId})`);
  }
}