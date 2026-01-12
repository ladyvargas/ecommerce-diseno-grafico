const express = require("express");
const router = express.Router();
const { pool } = require("../config/database");

// Obtener un pedido específico por ID (sin autenticación)
router.get("/guest/:id", async (req, res) => {
  try {
    const orderId = req.params.id;

    const [orders] = await pool.query(
      `
            SELECT o.* 
            FROM orders o
            WHERE o.id = ?
        `,
      [orderId]
    );

    if (orders.length === 0) {
      return res.status(404).json({ error: "Pedido no encontrado" });
    }

    const order = orders[0];

    // Obtener items con información de productos
    const [items] = await pool.query(
      `
            SELECT oi.*, p.name as product_name, p.image as product_image
            FROM order_items oi
            LEFT JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id = ?
        `,
      [orderId]
    );

    order.items = items.map((item) => ({
      productId: item.product_id,
      quantity: item.quantity,
      price: parseFloat(item.price),
      name: item.product_name,
      image: item.product_image,
    }));

    res.json(order);
  } catch (error) {
    console.error("Error al obtener pedido:", error);
    res.status(500).json({ error: "Error al cargar pedido" });
  }
});

// Obtener todos los pedidos (para admin)
router.get("/all", async (req, res) => {
  try {
    const [orders] = await pool.query(`
            SELECT o.*
            FROM orders o
            ORDER BY o.created_at DESC
        `);

    // Para cada pedido, obtener sus items con información de productos
    for (let order of orders) {
      const [items] = await pool.query(
        `
                SELECT oi.*, p.name as product_name, p.image as product_image
                FROM order_items oi
                LEFT JOIN products p ON oi.product_id = p.id
                WHERE oi.order_id = ?
            `,
        [order.id]
      );

      order.items = items.map((item) => ({
        productId: item.product_id,
        quantity: item.quantity,
        price: parseFloat(item.price),
        name: item.product_name,
        image: item.product_image,
      }));
    }

    res.json(orders);
  } catch (error) {
    console.error("Error al obtener pedidos:", error);
    res.status(500).json({ error: "Error al cargar pedidos" });
  }
});

// Obtener pedidos de un usuario
router.get("/", async (req, res) => {
  try {
    const userEmail = req.query.email;

    let query = `SELECT o.* FROM orders o`;

    if (userEmail) {
      query += ` WHERE o.customer_email = ?`;
    }

    query += ` ORDER BY o.created_at DESC`;

    const [orders] = userEmail
      ? await pool.query(query, [userEmail])
      : await pool.query(query);

    // Para cada pedido, obtener sus items con información de productos
    for (let order of orders) {
      const [items] = await pool.query(
        `
                SELECT oi.*, p.name as product_name, p.image as product_image
                FROM order_items oi
                LEFT JOIN products p ON oi.product_id = p.id
                WHERE oi.order_id = ?
            `,
        [order.id]
      );

      order.items = items.map((item) => ({
        productId: item.product_id,
        quantity: item.quantity,
        price: parseFloat(item.price),
        name: item.product_name,
        image: item.product_image,
      }));
    }

    res.json(orders);
  } catch (error) {
    console.error("Error al obtener pedidos:", error);
    res.json([]);
  }
});

// Crear pedido sin autenticación (guest checkout)
router.post('/create-guest', async (req, res) => {
  const conn = await pool.getConnection();

  try {
    const {
      items,
      customerName,
      customerEmail,
      customerPhone,
      notes,
      paymentMethod,
      subtotal,
      discount,
      couponCode,
      tax,
      total
    } = req.body;

    await conn.beginTransaction();

    // 1️⃣ Crear orden
    const [orderResult] = await conn.query(
      `INSERT INTO orders 
      (user_id, customer_name, customer_email, customer_phone, notes,
       payment_method, subtotal, tax, total, coupon_code, discount)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        null,
        customerName,
        customerEmail,
        customerPhone,
        notes,
        paymentMethod,
        subtotal,
        tax,
        total,
        couponCode,
        discount
      ]
    );

    const orderId = orderResult.insertId;

    // 2️⃣ Insertar items
    for (const item of items) {
      await conn.query(
        `INSERT INTO order_items 
        (order_id, product_id, product_name, quantity, price)
        VALUES (?, ?, ?, ?, ?)`,
        [
          orderId,
          item.productId,
          item.productName,
          item.quantity,
          item.price
        ]
      );
    }

    await conn.commit();

    res.status(201).json({
      success: true,
      message: 'Pedido creado correctamente',
      order: {
        id: orderId,
        total,
        customerName,
        customerEmail
      }
    });

  } catch (error) {
    await conn.rollback();
    console.error('❌ Error al crear pedido:', error);

    res.status(500).json({
      success: false,
      error: 'Error al crear pedido',
      details: error.message
    });
  } finally {
    conn.release();
  }
});


// Crear pedido
router.post("/", async (req, res) => {
  try {
    const {
      customer_name,
      customer_email,
      customer_phone,
      notes,
      items,
      subtotal,
      tax,
      total,
      coupon_code,
      discount,
    } = req.body;

    // Crear pedido
    const [result] = await pool.query(
      `
            INSERT INTO orders (
                user_id,
                customer_name, 
                customer_email, 
                customer_phone, 
                notes,
                subtotal, 
                tax, 
                total,
                status,
                payment_status,
                coupon_code,
                discount
            ) VALUES (NULL, ?, ?, ?, ?, ?, ?, ?, 'pending', 'pending', ?, ?)
        `,
      [
        customer_name,
        customer_email,
        customer_phone,
        notes || null,
        parseFloat(subtotal),
        parseFloat(tax),
        parseFloat(total),
        coupon_code || null,
        discount ? parseFloat(discount) : 0,
      ]
    );

    const orderId = result.insertId;

    // Insertar items del pedido
    for (const item of items) {
      await pool.query(
        `
                INSERT INTO order_items (order_id, product_id, quantity, price)
                VALUES (?, ?, ?, ?)
            `,
        [orderId, item.productId, item.quantity, parseFloat(item.price)]
      );
    }

    res.json({
      success: true,
      message: "Pedido creado exitosamente",
      order: { id: orderId },
    });
  } catch (error) {
    console.error("Error al crear pedido:", error);
    res.status(500).json({
      success: false,
      error: "Error al crear pedido",
    });
  }
});

// Actualizar estado de pedido
router.put("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;

    await pool.query("UPDATE orders SET status = ? WHERE id = ?", [
      status,
      req.params.id,
    ]);

    res.json({ success: true, message: "Estado actualizado" });
  } catch (error) {
    console.error("Error al actualizar estado:", error);
    res.status(500).json({ error: "Error al actualizar estado" });
  }
});

// Actualizar estado de pago
router.put("/:id/payment-status", async (req, res) => {
  try {
    const { payment_status } = req.body;

    await pool.query("UPDATE orders SET payment_status = ? WHERE id = ?", [
      payment_status,
      req.params.id,
    ]);

    res.json({ success: true, message: "Estado de pago actualizado" });
  } catch (error) {
    console.error("Error al actualizar estado de pago:", error);
    res.status(500).json({ error: "Error al actualizar estado de pago" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { status, payment_status } = req.body;

    await pool.query(
      "UPDATE orders SET status = ?, payment_status = ? WHERE id = ?",
      [status, payment_status, req.params.id]
    );

    res.json({ success: true, message: "Pedido actualizado" });
  } catch (error) {
    console.error("Error al actualizar pedido:", error);
    res.status(500).json({ error: "Error al actualizar pedido" });
  }
});

// Eliminar pedido
router.delete("/:id", async (req, res) => {
  try {
    // Eliminar items primero
    await pool.query("DELETE FROM order_items WHERE order_id = ?", [
      req.params.id,
    ]);

    // Eliminar pedido
    await pool.query("DELETE FROM orders WHERE id = ?", [req.params.id]);

    res.json({ success: true, message: "Pedido eliminado" });
  } catch (error) {
    console.error("Error al eliminar pedido:", error);
    res.status(500).json({ error: "Error al eliminar pedido" });
  }
});

module.exports = router;
