# Especificación de Endpoints Analíticos

Base URL: `http://<servidor>:4000/api/reportes`

**Seguridad:** todos los endpoints requieren el encabezado `Authorization: Bearer <token>` de un usuario con rol **admin**.

| Código | Cuándo |
|---|---|
| `200` | Reporte generado |
| `400` | Filtros inválidos (rango, fechas, agrupación o límite) |
| `401` | No se envió token o el token expiró |
| `403` | El usuario no es administrador |
| `500` | Error interno al consultar la base de datos |

## Filtros (query string, comunes a todos)

| Parámetro | Valores | Por defecto | Descripción |
|---|---|---|---|
| `rango` | `7d`, `30d`, `mes`, `personalizado` | `30d` | Últimos 7 días, últimos 30 días, mes en curso o rango libre |
| `desde` | `YYYY-MM-DD` | — | Obligatorio si `rango=personalizado` |
| `hasta` | `YYYY-MM-DD` | — | Obligatorio si `rango=personalizado` (día incluido) |
| `agrupacion` | `dia`, `semana`, `mes` | automática | Agrupación de la serie de ingresos. Si no se manda: ≤31 días → `dia`, ≤120 → `semana`, más → `mes` |
| `limite` | `5`, `10` | `5` | Tamaño del ranking de productos |

Reglas validadas en el dominio (`RangoFechas`): `desde` ≤ `hasta` y máximo 366 días.

**Pedidos que cuentan como venta** (ingresos, ranking y ticket): estado `aprobado` (se muestra como *Pagado*). Los pedidos pendientes y cancelados no suman ingresos.

**Equivalencia de estados:** `pendiente` → Pendiente · `aprobado` → Pagado · `rechazado` → Cancelado · Enviado (reservado para cuando el sistema registre envíos).

---

## 1. `GET /api/reportes/resumen`
Todo el dashboard en una sola llamada (lo usa el frontend).

```
GET /api/reportes/resumen?rango=30d
```
```json
{
  "periodo": { "desde": "2026-09-12", "hasta": "2026-10-11", "dias": 30, "agrupacion": "dia" },
  "productosTop": [ { "posicion": 1, "productoId": 1, "nombre": "Lapiz", "unidades": 36, "monto": 936, "participacion": 7.6 } ],
  "ingresos": { "total": 20021.5, "serie": [ { "periodo": "2026-09-12", "ingresos": 0, "pedidos": 0 } ] },
  "estadosPedidos": { "total": 40, "estados": [ { "estado": "Pagado", "cantidad": 26, "monto": 20021.5, "porcentaje": 65 } ] },
  "ticketPromedio": { "ingresos": 20021.5, "pedidos": 26, "clientes": 4, "ticketPorPedido": 770.06, "gastoPromedioPorUsuario": 5005.38, "porUsuario": [] }
}
```

## 2. `GET /api/reportes/productos-top`
Volumen de ventas por producto: Top 5 o Top 10 ordenado por unidades vendidas y luego por monto.

```
GET /api/reportes/productos-top?rango=personalizado&desde=2026-07-01&hasta=2026-10-11&limite=10
```
```json
{
  "periodo": { "desde": "2026-07-01", "hasta": "2026-10-11", "dias": 103, "agrupacion": "semana" },
  "productos": [
    { "posicion": 1, "productoId": 1, "nombre": "Lapiz", "unidades": 135, "monto": 3510, "participacion": 5.2 },
    { "posicion": 2, "productoId": 2, "nombre": "Audífonos", "unidades": 66, "monto": 17094, "participacion": 25.3 }
  ]
}
```
`participacion` = % del monto del producto sobre el total del ranking.

## 3. `GET /api/reportes/ingresos`
Ingresos totales del periodo y serie por día, semana o mes (los periodos sin ventas aparecen en 0).

```
GET /api/reportes/ingresos?rango=7d
```
```json
{
  "periodo": { "desde": "2026-10-05", "hasta": "2026-10-11", "dias": 7, "agrupacion": "dia" },
  "total": 3835,
  "serie": [
    { "periodo": "2026-10-05", "ingresos": 180, "pedidos": 2 },
    { "periodo": "2026-10-06", "ingresos": 0, "pedidos": 0 },
    { "periodo": "2026-10-07", "ingresos": 1065, "pedidos": 1 }
  ]
}
```

## 4. `GET /api/reportes/estados-pedidos`
Conteo y distribución porcentual por estado. Siempre devuelve los 4 estados.

```
GET /api/reportes/estados-pedidos?rango=mes
```
```json
{
  "periodo": { "desde": "2026-10-01", "hasta": "2026-10-11", "dias": 11, "agrupacion": "dia" },
  "total": 20,
  "estados": [
    { "estado": "Pendiente", "cantidad": 5,  "monto": 1956,   "porcentaje": 25 },
    { "estado": "Pagado",    "cantidad": 10, "monto": 7786.5, "porcentaje": 50 },
    { "estado": "Enviado",   "cantidad": 0,  "monto": 0,      "porcentaje": 0 },
    { "estado": "Cancelado", "cantidad": 5,  "monto": 3299,   "porcentaje": 25 }
  ]
}
```

## 5. `GET /api/reportes/ticket-promedio`
Gasto medio por pedido y por usuario, más el detalle de los 10 clientes que más gastan.

```
GET /api/reportes/ticket-promedio?rango=30d
```
```json
{
  "periodo": { "desde": "2026-09-12", "hasta": "2026-10-11", "dias": 30, "agrupacion": "dia" },
  "ingresos": 20021.5,
  "pedidos": 26,
  "clientes": 4,
  "ticketPorPedido": 770.06,
  "gastoPromedioPorUsuario": 5005.38,
  "porUsuario": [
    { "usuarioId": 8, "nombre": "Ana López", "correo": "demo1@tienda.com", "pedidos": 5, "gastoTotal": 6618, "ticketPromedio": 1323.6 }
  ]
}
```
- `ticketPorPedido` = ingresos ÷ pedidos
- `gastoPromedioPorUsuario` = ingresos ÷ clientes distintos

## Ejemplo de error (400)
```
GET /api/reportes/resumen?rango=personalizado&desde=2026-10-11&hasta=2026-10-01
```
```json
{ "error": "La fecha \"desde\" no puede ser posterior a \"hasta\"" }
```

---

## Cómo encaja en la arquitectura hexagonal

| Capa | Archivo | Responsabilidad |
|---|---|---|
| Dominio | `domain/valueobjects/RangoFechas.js` | Reglas del periodo (validación, rangos predefinidos, agrupación) |
| Aplicación (puerto de entrada) | `application/usecases/analytics/AnalyticsService.js` | Calcula porcentajes y ticket promedio; arma el resumen |
| Aplicación (puerto de salida) | `application/ports/out/AnalyticsRepositoryPort.js` | Contrato de consultas analíticas (solo lectura) |
| Infraestructura (salida) | `infrastructure/out/postgres/AnalyticsRepositoryAdapter.js` | SQL con `SUM`, `COUNT`, `GROUP BY`, `date_trunc` y filtros de fecha |
| Infraestructura (entrada) | `infrastructure/in/http/controllers/AnalyticsController.js` + `routes/analyticsRoutes.js` | HTTP, JSON y protección por rol admin |

La agregación ocurre en PostgreSQL: Node.js recibe solo las filas resumidas, no el historial de pedidos.
