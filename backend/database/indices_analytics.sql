-- ============================================================
-- database/indices_analytics.sql
-- Índices para que las consultas del dashboard filtren por fecha
-- y agrupen por producto sin recorrer toda la tabla.
-- Ejecutar una sola vez:
--   psql -U postgres -h localhost -d ecommerce -f database/indices_analytics.sql
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_pedidos_created_at        ON pedidos (created_at);
CREATE INDEX IF NOT EXISTS idx_pedidos_estado_created_at ON pedidos (estado, created_at);
CREATE INDEX IF NOT EXISTS idx_pedido_productos_producto ON pedido_productos (producto_id);
