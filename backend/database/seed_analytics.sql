-- ============================================================
-- database/seed_analytics.sql
-- Datos de DEMOSTRACIÓN para el dashboard analítico.
--
-- Crea 8 productos y 4 clientes de demo, y genera ~150 pedidos
-- repartidos en los últimos 90 días con distintos estados.
-- Los clientes demo usan la misma contraseña que el admin (Admin1234).
--
-- Ejecutar:  psql -U postgres -h localhost -d ecommerce -f database/seed_analytics.sql
-- Borrar demo: ver el bloque LIMPIEZA al final del archivo.
-- ============================================================

-- 1. Productos de demostración (solo si no existen con ese nombre)
INSERT INTO productos (nombre, descripcion, precio, stock)
SELECT v.nombre, 'Producto de demostración', v.precio, v.stock
FROM (VALUES
  ('Cuaderno profesional', 45.00, 120),
  ('Pluma azul',           12.50, 300),
  ('Mochila escolar',     489.00,  40),
  ('Calculadora científica', 329.00, 35),
  ('Marcatextos (5 pzas)',  68.00, 150),
  ('USB 64 GB',            179.00,  60),
  ('Regla 30 cm',           18.00, 200),
  ('Audífonos',            259.00,  45)
) AS v(nombre, precio, stock)
WHERE NOT EXISTS (SELECT 1 FROM productos p WHERE p.nombre = v.nombre);

-- 2. Clientes de demostración (rol "pedido", ya aprobados)
INSERT INTO usuarios (nombre, apellido_paterno, apellido_materno, correo, password_hash, rol, estado)
SELECT v.nombre, v.ap, v.am, v.correo,
       (SELECT password_hash FROM usuarios WHERE correo = 'admin@sistema.com'),
       'pedido', 'aprobado'
FROM (VALUES
  ('Ana',    'López',    'Ruiz',    'demo1@tienda.com'),
  ('Carlos', 'Méndez',   'Soto',    'demo2@tienda.com'),
  ('María',  'Hernández','Cruz',    'demo3@tienda.com'),
  ('Luis',   'Ramírez',  'Vega',    'demo4@tienda.com')
) AS v(nombre, ap, am, correo)
WHERE NOT EXISTS (SELECT 1 FROM usuarios u WHERE u.correo = v.correo);

-- 3. Pedidos históricos de los clientes demo
DO $$
DECLARE
  clientes   INT[];
  productos  INT[];
  n_prod     INT;
  pid        INT;
  prod_id    INT;
  r          FLOAT;
  est        TEXT;
  i          INT;
  j          INT;
BEGIN
  SELECT array_agg(id) INTO clientes  FROM usuarios WHERE correo LIKE 'demo_@tienda.com';
  SELECT array_agg(id ORDER BY id) INTO productos FROM productos;
  n_prod := array_length(productos, 1);

  FOR i IN 1..150 LOOP
    r := random();
    est := CASE WHEN r < 0.55 THEN 'aprobado'      -- se muestra como "Pagado"
                WHEN r < 0.80 THEN 'pendiente'     -- "Pendiente"
                ELSE 'rechazado' END;              -- "Cancelado"

    INSERT INTO pedidos (usuario_id, estado, total, created_at)
    VALUES (
      clientes[1 + floor(random() * array_length(clientes, 1))::INT],
      est,
      0,
      NOW() - (random() * INTERVAL '90 days')
    )
    RETURNING id INTO pid;

    -- 1 a 3 productos por pedido; random()^2 hace que unos se vendan más que otros
    FOR j IN 1..(1 + floor(random() * 3)::INT) LOOP
      prod_id := productos[1 + floor(power(random(), 2) * n_prod)::INT];
      INSERT INTO pedido_productos (pedido_id, producto_id, cantidad, precio_unitario)
      SELECT pid, p.id, 1 + floor(random() * 4)::INT, p.precio
      FROM productos p WHERE p.id = prod_id;
    END LOOP;

    UPDATE pedidos
    SET total = (SELECT COALESCE(SUM(cantidad * precio_unitario), 0)
                 FROM pedido_productos WHERE pedido_id = pid)
    WHERE id = pid;
  END LOOP;
END $$;

SELECT estado, COUNT(*) AS pedidos, SUM(total) AS monto FROM pedidos GROUP BY estado;

-- ============================================================
-- LIMPIEZA (opcional): borra solo los datos de demostración
-- ============================================================
-- DELETE FROM pedidos  WHERE usuario_id IN (SELECT id FROM usuarios WHERE correo LIKE 'demo_@tienda.com');
-- DELETE FROM usuarios WHERE correo LIKE 'demo_@tienda.com';
-- DELETE FROM productos p WHERE descripcion = 'Producto de demostración'
--   AND NOT EXISTS (SELECT 1 FROM pedido_productos pp WHERE pp.producto_id = p.id);
