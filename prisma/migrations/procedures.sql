-- ================================================
-- 📦 PROCEDIMIENTOS ALMACENADOS - E-COMMERCE
-- ================================================
-- Ejecutar este archivo después de crear las tablas con Prisma
-- Para aplicar: psql -d tu_database -f prisma/migrations/procedures.sql
-- O ejecutar directamente en Supabase SQL Editor

-- ================================================
-- 1. 📦 PROCEDIMIENTO: Actualizar Stock
-- ================================================
-- Actualiza el stock de un producto y registra el movimiento
-- Uso: compras, ventas, ajustes, devoluciones

CREATE OR REPLACE FUNCTION proc_actualizar_stock(
    p_producto_id INT,
    p_cantidad INT,
    p_tipo_movimiento VARCHAR,
    p_referencia VARCHAR,
    p_usuario UUID
) RETURNS VOID AS $$
BEGIN
    -- Actualizar o crear stock
    UPDATE stock_producto
    SET cantidad = cantidad + p_cantidad,
        fecha_actualizacion = now()
    WHERE producto_id = p_producto_id;

    IF NOT FOUND THEN
        INSERT INTO stock_producto(producto_id, cantidad)
        VALUES(p_producto_id, p_cantidad);
    END IF;

    -- Registrar movimiento
    INSERT INTO movimientos_stock(
        producto_id, cantidad, tipo_movimiento, referencia, creado_por
    ) VALUES(
        p_producto_id, p_cantidad, p_tipo_movimiento, p_referencia, p_usuario
    );
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- 2. ✅ PROCEDIMIENTO: Verificar Stock
-- ================================================
-- Valida que haya stock suficiente para un producto
-- Lanza excepción si no hay stock

CREATE OR REPLACE FUNCTION proc_verificar_stock(
    p_producto_id INT,
    p_cantidad INT
) RETURNS VOID AS $$
DECLARE
    v_stock INT;
BEGIN
    SELECT cantidad INTO v_stock
    FROM stock_producto
    WHERE producto_id = p_producto_id;

    IF v_stock IS NULL OR v_stock < p_cantidad THEN
        RAISE EXCEPTION 'Stock insuficiente para el producto %', p_producto_id;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- 3. 🛒 PROCEDIMIENTO: Registrar Compra
-- ================================================
-- Crea la compra con detalle y actualiza el stock
-- Retorna el ID de la compra creada

CREATE OR REPLACE FUNCTION proc_registrar_compra(
    p_proveedor_id INT,
    p_creado_por UUID,
    p_items JSON
) RETURNS BIGINT AS $$
DECLARE
    v_compra_id BIGINT;
    v_item JSON;
BEGIN
    -- Crear compra
    INSERT INTO compras(proveedor_id, creado_por)
    VALUES(p_proveedor_id, p_creado_por)
    RETURNING id INTO v_compra_id;

    -- Procesar cada item
    FOR v_item IN SELECT * FROM json_array_elements(p_items)
    LOOP
        -- Insertar detalle
        INSERT INTO compras_detalle(
            compra_id, producto_id, precio_unitario, cantidad, subtotal
        ) VALUES(
            v_compra_id,
            (v_item->>'producto_id')::INT,
            (v_item->>'precio_unitario')::NUMERIC,
            (v_item->>'cantidad')::INT,
            ((v_item->>'precio_unitario')::NUMERIC * (v_item->>'cantidad')::INT)
        );

        -- Actualizar stock (entrada positiva)
        PERFORM proc_actualizar_stock(
            (v_item->>'producto_id')::INT,
            (v_item->>'cantidad')::INT,
            'compra',
            'Compra #' || v_compra_id,
            p_creado_por
        );
    END LOOP;

    -- Calcular monto total
    UPDATE compras
    SET monto_total = (
        SELECT COALESCE(SUM(subtotal), 0)
        FROM compras_detalle WHERE compra_id = v_compra_id
    )
    WHERE id = v_compra_id;

    RETURN v_compra_id;
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- 4. 🛍️ PROCEDIMIENTO: Crear Orden
-- ================================================
-- Genera orden de venta con detalle y descuenta stock
-- Retorna el ID de la orden creada

CREATE OR REPLACE FUNCTION proc_crear_orden(
    p_usuario_id UUID,
    p_items JSON
) RETURNS BIGINT AS $$
DECLARE
    v_orden_id BIGINT;
    v_item JSON;
BEGIN
    -- Crear orden
    INSERT INTO ordenes(usuario_id, estado)
    VALUES(p_usuario_id, 'pendiente')
    RETURNING id INTO v_orden_id;

    -- Procesar cada item
    FOR v_item IN SELECT * FROM json_array_elements(p_items)
    LOOP
        -- Verificar stock disponible
        PERFORM proc_verificar_stock(
            (v_item->>'producto_id')::INT,
            (v_item->>'cantidad')::INT
        );

        -- Insertar detalle
        INSERT INTO ordenes_detalle(
            orden_id, producto_id, precio_unitario, cantidad, subtotal
        ) VALUES(
            v_orden_id,
            (v_item->>'producto_id')::INT,
            (v_item->>'precio_unitario')::NUMERIC,
            (v_item->>'cantidad')::INT,
            ((v_item->>'precio_unitario')::NUMERIC * (v_item->>'cantidad')::INT)
        );

        -- Descontar stock (salida negativa)
        PERFORM proc_actualizar_stock(
            (v_item->>'producto_id')::INT,
            -(v_item->>'cantidad')::INT,
            'venta',
            'Orden #' || v_orden_id,
            p_usuario_id
        );
    END LOOP;

    -- Calcular monto total
    UPDATE ordenes
    SET monto_total = (
        SELECT COALESCE(SUM(subtotal), 0)
        FROM ordenes_detalle WHERE orden_id = v_orden_id
    )
    WHERE id = v_orden_id;

    RETURN v_orden_id;
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- 5. ✅ PROCEDIMIENTO: Confirmar Orden
-- ================================================
-- Confirma una orden cambiando su estado

CREATE OR REPLACE FUNCTION proc_confirmar_orden(
    p_orden_id BIGINT
) RETURNS VOID AS $$
BEGIN
    UPDATE ordenes
    SET estado = 'confirmada',
        fecha_confirmacion = now()
    WHERE id = p_orden_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Orden no encontrada: %', p_orden_id;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- 6. 🛒 PROCEDIMIENTO: Actualizar Carrito
-- ================================================
-- Agrega, actualiza o elimina productos del carrito
-- Si cantidad = 0, elimina el producto

CREATE OR REPLACE FUNCTION proc_actualizar_carrito(
    p_usuario_id UUID,
    p_producto_id INT,
    p_cantidad INT,
    p_precio NUMERIC
) RETURNS VOID AS $$
DECLARE
    v_carrito_id BIGINT;
BEGIN
    -- Buscar o crear carrito activo
    SELECT id INTO v_carrito_id
    FROM carritos
    WHERE usuario_id = p_usuario_id AND estado = 'activo'
    LIMIT 1;

    IF v_carrito_id IS NULL THEN
        INSERT INTO carritos(usuario_id)
        VALUES(p_usuario_id)
        RETURNING id INTO v_carrito_id;
    END IF;

    -- Si cantidad es 0, eliminar producto
    IF p_cantidad = 0 THEN
        DELETE FROM carrito_detalle
        WHERE carrito_id = v_carrito_id AND producto_id = p_producto_id;
        RETURN;
    END IF;

    -- Insertar o actualizar
    INSERT INTO carrito_detalle(carrito_id, producto_id, cantidad, precio_unitario)
    VALUES(v_carrito_id, p_producto_id, p_cantidad, p_precio)
    ON CONFLICT (carrito_id, producto_id)
    DO UPDATE SET cantidad = EXCLUDED.cantidad,
                  precio_unitario = EXCLUDED.precio_unitario,
                  fecha_actualizacion = now();
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- 7. 🛍️ PROCEDIMIENTO: Checkout Carrito
-- ================================================
-- Convierte el carrito activo en una orden de venta

CREATE OR REPLACE FUNCTION proc_checkout_carrito(
    p_carrito_id BIGINT,
    p_usuario_id UUID
) RETURNS BIGINT AS $$
DECLARE
    v_items JSON;
    v_orden_id BIGINT;
BEGIN
    -- Validar carrito
    PERFORM 1 FROM carritos
    WHERE id = p_carrito_id
      AND usuario_id = p_usuario_id
      AND estado = 'activo';

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Carrito no válido o no activo';
    END IF;

    -- Construir JSON de items
    SELECT json_agg(
        json_build_object(
            'producto_id', producto_id,
            'cantidad', cantidad,
            'precio_unitario', precio_unitario
        )
    ) INTO v_items
    FROM carrito_detalle
    WHERE carrito_id = p_carrito_id;

    IF v_items IS NULL THEN
        RAISE EXCEPTION 'El carrito está vacío';
    END IF;

    -- Crear orden
    SELECT proc_crear_orden(p_usuario_id, v_items)
    INTO v_orden_id;

    -- Marcar carrito como convertido
    UPDATE carritos
    SET estado = 'convertido', fecha_actualizacion = now()
    WHERE id = p_carrito_id;

    RETURN v_orden_id;
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- 🎉 PROCEDIMIENTOS INSTALADOS EXITOSAMENTE
-- ================================================
-- Total: 7 procedimientos almacenados
-- 
-- ✅ proc_actualizar_stock
-- ✅ proc_verificar_stock
-- ✅ proc_registrar_compra
-- ✅ proc_crear_orden
-- ✅ proc_confirmar_orden
-- ✅ proc_actualizar_carrito
-- ✅ proc_checkout_carrito
-- ================================================
