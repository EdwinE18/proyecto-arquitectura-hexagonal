// src/infrastructure/out/email/templates/pedidoTemplates.js
//
// Plantillas HTML de los correos. Viven en infraestructura porque el formato
// (HTML) es un detalle de cómo se presenta el correo, no una regla de negocio.

const dinero = (n) =>
  Number(n).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });

const tablaItems = (items) => `
  <table style="width:100%;border-collapse:collapse;font-size:14px">
    <thead>
      <tr style="background:#f1f5f9">
        <th style="text-align:left;padding:8px;border:1px solid #e2e8f0">Producto</th>
        <th style="text-align:center;padding:8px;border:1px solid #e2e8f0">Cantidad</th>
        <th style="text-align:right;padding:8px;border:1px solid #e2e8f0">Precio</th>
        <th style="text-align:right;padding:8px;border:1px solid #e2e8f0">Subtotal</th>
      </tr>
    </thead>
    <tbody>
      ${items.map((it) => `
        <tr>
          <td style="padding:8px;border:1px solid #e2e8f0">${it.nombre}</td>
          <td style="text-align:center;padding:8px;border:1px solid #e2e8f0">${it.cantidad}</td>
          <td style="text-align:right;padding:8px;border:1px solid #e2e8f0">${dinero(it.precioUnitario)}</td>
          <td style="text-align:right;padding:8px;border:1px solid #e2e8f0">${dinero(it.subtotal)}</td>
        </tr>`).join('')}
    </tbody>
  </table>`;

const marco = (contenido) => `
  <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#1e293b">
    ${contenido}
    <p style="font-size:12px;color:#64748b;margin-top:24px">
      Este es un correo automático, por favor no respondas a este mensaje.
    </p>
  </div>`;

export function plantillaComprobanteCliente({ cliente, pedido, banco }) {
  return {
    asunto: `Pedido #${pedido.id} recibido — Pendiente de Pago`,
    html: marco(`
      <h2 style="color:#4f46e5">¡Gracias por tu pedido, ${cliente.nombre}!</h2>
      <p>Registramos tu pedido <b>#${pedido.id}</b> el
         ${new Date(pedido.fecha).toLocaleString('es-MX')}.</p>
      <p>Estado: <b style="color:#d97706">Pendiente de Pago</b></p>

      <h3>Desglose de tu compra</h3>
      ${tablaItems(pedido.items)}
      <p style="text-align:right;font-size:16px"><b>Total a pagar: ${dinero(pedido.total)}</b></p>

      <h3>Instrucciones de pago</h3>
      <p>Realiza una transferencia o depósito con los siguientes datos:</p>
      <ul>
        <li><b>Banco:</b> ${banco.nombre}</li>
        <li><b>Titular:</b> ${banco.titular}</li>
        <li><b>CLABE:</b> ${banco.clabe}</li>
        <li><b>Referencia:</b> PEDIDO-${pedido.id}</li>
        <li><b>Monto:</b> ${dinero(pedido.total)}</li>
      </ul>
      <p>Usa la referencia para que podamos identificar tu pago.
         Tu pedido se procesará cuando el administrador confirme el pago.</p>
    `),
  };
}

export function plantillaNuevoPedidoAdmin({ cliente, pedido }) {
  return {
    asunto: `Nuevo pedido #${pedido.id} de ${cliente.nombre}`,
    html: marco(`
      <h2 style="color:#4f46e5">Llegó un nuevo pedido</h2>
      <p><b>Pedido:</b> #${pedido.id}<br>
         <b>Cliente:</b> ${cliente.nombre} (${cliente.correo})<br>
         <b>Fecha:</b> ${new Date(pedido.fecha).toLocaleString('es-MX')}<br>
         <b>Estado:</b> Pendiente de Pago</p>
      ${tablaItems(pedido.items)}
      <p style="text-align:right;font-size:16px"><b>Total: ${dinero(pedido.total)}</b></p>
      <p>Revísalo en el panel de administrador.</p>
    `),
  };
}