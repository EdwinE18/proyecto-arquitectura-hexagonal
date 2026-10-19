// src/modules/admin/pages/DashboardAnalitico.jsx
//
// Panel analítico del administrador (pestaña dentro de AdminDashboard).
// Solo pinta datos: todos los cálculos vienen ya hechos del backend
// (GET /api/reportes/resumen).
import { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { reportesService } from '../services/reportesService.js';
import './DashboardAnalitico.css';

const RANGOS = [
  { valor: '7d', texto: 'Últimos 7 días' },
  { valor: 'mes', texto: 'Este mes' },
  { valor: '30d', texto: 'Últimos 30 días' },
  { valor: 'personalizado', texto: 'Rango personalizado' },
];

// Mismos colores que las etiquetas de estado del resto del sistema
const COLOR_ESTADO = {
  Pendiente: '#f59e0b',
  Pagado: '#22c55e',
  Enviado: '#3b82f6',
  Cancelado: '#ef4444',
};

const NOMBRE_AGRUPACION = { dia: 'por día', semana: 'por semana', mes: 'por mes' };
const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

const dinero = (n) =>
  Number(n).toLocaleString('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 });
const dineroExacto = (n) =>
  Number(n).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });

// "2026-10-05" -> "5 oct" (o "oct 2026" si la serie es mensual)
const etiquetaPeriodo = (texto, agrupacion) => {
  const [a, m, d] = texto.split('-').map(Number);
  if (agrupacion === 'mes') return `${MESES[m - 1]} ${a}`;
  return `${d} ${MESES[m - 1]}`;
};

const TooltipIngresos = ({ active, payload, agrupacion }) => {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  const prefijo = agrupacion === 'semana' ? 'Semana del ' : '';
  return (
    <div className="da-tooltip">
      <div className="da-tooltip-titulo">{prefijo}{etiquetaPeriodo(p.periodo, agrupacion)}</div>
      <div>{dineroExacto(p.ingresos)}</div>
      <div className="da-tooltip-sub">{p.pedidos} pedido{p.pedidos === 1 ? '' : 's'} pagado{p.pedidos === 1 ? '' : 's'}</div>
    </div>
  );
};

const TooltipEstado = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const e = payload[0].payload;
  return (
    <div className="da-tooltip">
      <div className="da-tooltip-titulo">{e.estado}</div>
      <div>{e.cantidad} pedidos · {e.porcentaje}%</div>
      <div className="da-tooltip-sub">{dineroExacto(e.monto)}</div>
    </div>
  );
};

export function DashboardAnalitico() {
  const [rango, setRango] = useState('30d');
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [limite, setLimite] = useState(5);
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    if (rango === 'personalizado' && (!desde || !hasta)) return;
    let vigente = true; // evita pintar una respuesta vieja si el filtro cambió
    setCargando(true);
    setError('');
    reportesService
      .resumen({ rango, desde, hasta, limite })
      .then((d) => vigente && setDatos(d))
      .catch((err) => {
        if (!vigente) return;
        setDatos(null); // no dejar en pantalla datos de otro periodo
        setError(err.response?.data?.error || 'No se pudo cargar el reporte');
      })
      .finally(() => vigente && setCargando(false));
    return () => {
      vigente = false;
    };
  }, [rango, desde, hasta, limite]);

  const ticket = datos?.ticketPromedio;
  const agrupacion = datos?.periodo.agrupacion;
  const estados = datos?.estadosPedidos.estados || [];
  const estadosConPedidos = estados.filter((e) => e.cantidad > 0);
  const maxUnidades = Math.max(1, ...(datos?.productosTop || []).map((p) => p.unidades));

  return (
    <div className="da">
      {/* ---------- Filtros ---------- */}
      <div className="da-filtros">
        <div className="da-rangos">
          {RANGOS.map((r) => (
            <button
              key={r.valor}
              className={`da-rango ${rango === r.valor ? 'activo' : ''}`}
              onClick={() => setRango(r.valor)}
            >
              {r.texto}
            </button>
          ))}
        </div>
        {rango === 'personalizado' && (
          <div className="da-fechas">
            <label>
              Desde
              <input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} />
            </label>
            <label>
              Hasta
              <input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} />
            </label>
          </div>
        )}
      </div>

      {rango === 'personalizado' && (!desde || !hasta) && (
        <p className="da-aviso">Elige las dos fechas para ver el reporte.</p>
      )}
      {error && <div className="mensaje-error">{error}</div>}

      {datos && (
        <div className={cargando ? 'da-contenido cargando' : 'da-contenido'}>
          <p className="da-periodo">
            Del {etiquetaPeriodo(datos.periodo.desde, 'dia')} al {etiquetaPeriodo(datos.periodo.hasta, 'dia')}{' '}
            {datos.periodo.hasta.slice(0, 4)} · {datos.periodo.dias} días
          </p>

          {/* ---------- Indicadores ---------- */}
          <div className="da-kpis">
            <div className="da-kpi">
              <span className="da-kpi-etiqueta">Ingresos</span>
              <strong className="da-kpi-valor">{dinero(datos.ingresos.total)}</strong>
              <span className="da-kpi-nota">solo pedidos pagados</span>
            </div>
            <div className="da-kpi">
              <span className="da-kpi-etiqueta">Pedidos pagados</span>
              <strong className="da-kpi-valor">{ticket.pedidos}</strong>
              <span className="da-kpi-nota">de {datos.estadosPedidos.total} pedidos registrados</span>
            </div>
            <div className="da-kpi">
              <span className="da-kpi-etiqueta">Ticket promedio por pedido</span>
              <strong className="da-kpi-valor">{dinero(ticket.ticketPorPedido)}</strong>
              <span className="da-kpi-nota">ingresos ÷ pedidos pagados</span>
            </div>
            <div className="da-kpi">
              <span className="da-kpi-etiqueta">Gasto promedio por cliente</span>
              <strong className="da-kpi-valor">{dinero(ticket.gastoPromedioPorUsuario)}</strong>
              <span className="da-kpi-nota">{ticket.clientes} cliente{ticket.clientes === 1 ? '' : 's'} con compras</span>
            </div>
          </div>

          {/* ---------- Ingresos + Estados ---------- */}
          <div className="da-fila">
            <section className="da-panel da-panel-ancho">
              <h3>Tendencia de ingresos <span>{NOMBRE_AGRUPACION[agrupacion]}</span></h3>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={datos.ingresos.serie} margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
                  <CartesianGrid stroke="#334155" strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="periodo"
                    tickFormatter={(v) => etiquetaPeriodo(v, agrupacion)}
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                    axisLine={{ stroke: '#475569' }}
                    tickLine={false}
                    minTickGap={24}
                  />
                  <YAxis
                    tickFormatter={(v) => (v === 0 ? '$0' : `$${(v / 1000).toLocaleString('es-MX')}k`)}
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    width={56}
                  />
                  <Tooltip content={<TooltipIngresos agrupacion={agrupacion} />} cursor={{ stroke: '#475569' }} />
                  <Line
                    type="linear"
                    dataKey="ingresos"
                    stroke="#818cf8"
                    strokeWidth={2.5}
                    dot={datos.ingresos.serie.length <= 31 ? { r: 3, fill: '#818cf8' } : false}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </section>

            <section className="da-panel">
              <h3>Estado de pedidos <span>{datos.estadosPedidos.total} en total</span></h3>
              {estadosConPedidos.length === 0 ? (
                <p className="da-vacio">No hay pedidos en este periodo.</p>
              ) : (
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={estadosConPedidos}
                      dataKey="cantidad"
                      nameKey="estado"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      stroke="none"
                    >
                      {estadosConPedidos.map((e) => (
                        <Cell key={e.estado} fill={COLOR_ESTADO[e.estado]} />
                      ))}
                    </Pie>
                    <Tooltip content={<TooltipEstado />} />
                  </PieChart>
                </ResponsiveContainer>
              )}
              <ul className="da-leyenda">
                {estados.map((e) => (
                  <li key={e.estado}>
                    <span className="da-punto" style={{ background: COLOR_ESTADO[e.estado] }} />
                    <span className="da-leyenda-nombre">{e.estado}</span>
                    <span className="da-leyenda-num">{e.cantidad}</span>
                    <span className="da-leyenda-pct">{e.porcentaje}%</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          {/* ---------- Ranking + Clientes ---------- */}
          <div className="da-fila">
            <section className="da-panel da-panel-ancho">
              <h3>
                Productos más vendidos
                <select value={limite} onChange={(e) => setLimite(Number(e.target.value))}>
                  <option value={5}>Top 5</option>
                  <option value={10}>Top 10</option>
                </select>
              </h3>
              {datos.productosTop.length === 0 ? (
                <p className="da-vacio">Sin ventas pagadas en este periodo.</p>
              ) : (
                <table className="da-tabla">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Producto</th>
                      <th>Unidades vendidas</th>
                      <th className="num">Monto</th>
                      <th className="num">% del monto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {datos.productosTop.map((p) => (
                      <tr key={p.productoId}>
                        <td className="da-pos">{p.posicion}</td>
                        <td>{p.nombre}</td>
                        <td>
                          <div className="da-barra-celda">
                            <div className="da-barra-pista">
                              <div className="da-barra" style={{ width: `${(p.unidades / maxUnidades) * 100}%` }} />
                            </div>
                            <span>{p.unidades}</span>
                          </div>
                        </td>
                        <td className="num">{dineroExacto(p.monto)}</td>
                        <td className="num">{p.participacion}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>

            <section className="da-panel">
              <h3>Clientes con mayor gasto</h3>
              {ticket.porUsuario.length === 0 ? (
                <p className="da-vacio">Sin compras pagadas en este periodo.</p>
              ) : (
                <table className="da-tabla">
                  <thead>
                    <tr>
                      <th>Cliente</th>
                      <th className="num">Pedidos</th>
                      <th className="num">Ticket prom.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ticket.porUsuario.map((c) => (
                      <tr key={c.usuarioId}>
                        <td>
                          {c.nombre}
                          <div className="da-sub">{dineroExacto(c.gastoTotal)} en total</div>
                        </td>
                        <td className="num">{c.pedidos}</td>
                        <td className="num">{dineroExacto(c.ticketPromedio)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>
          </div>
        </div>
      )}

      {!datos && cargando && <p className="da-aviso">Cargando reporte…</p>}
    </div>
  );
}
