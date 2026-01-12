const mysql = require("mysql2/promise");

// ===============================
// CONFIGURACIÓN DE CONEXIÓN
// ===============================

const isRailway = !!process.env.MYSQL_URL;

const pool = isRailway
  ? mysql.createPool(process.env.MYSQL_URL)
  : mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });

// ===============================
// INICIALIZAR BASE DE DATOS
// ===============================
async function initializeDatabase() {
  let connection;
  try {
    if (!isRailway) {
      const tempPool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
      });

      connection = await tempPool.getConnection();

      await connection.query(
        `CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\``
      );
      console.log(`✅ Base de datos '${process.env.DB_NAME}' verificada`);

      connection.release();
      await tempPool.end();
    }

    const dbConnection = await pool.getConnection();

    // ===============================
    // TABLAS
    // ===============================

    await dbConnection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'user') DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await dbConnection.query(`
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        sale_price DECIMAL(10, 2),
        category VARCHAR(100),
        image TEXT,
        featured BOOLEAN DEFAULT FALSE,
        trending BOOLEAN DEFAULT FALSE,
        downloads INT DEFAULT 0,
        rating DECIMAL(3, 2) DEFAULT 5.0,
        file_format VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await dbConnection.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NULL,
        user_name VARCHAR(255),
        user_email VARCHAR(255),
        status ENUM('pending', 'processing', 'completed', 'cancelled') DEFAULT 'pending',
        payment_status ENUM('pending', 'paid', 'failed') DEFAULT 'pending',
        payment_method VARCHAR(50) DEFAULT 'credit_card',
        subtotal DECIMAL(10, 2) NOT NULL,
        tax DECIMAL(10, 2) DEFAULT 0,
        total DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_user_id (user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await dbConnection.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        product_id INT NOT NULL,
        product_name VARCHAR(255),
        quantity INT NOT NULL DEFAULT 1,
        price DECIMAL(10, 2) NOT NULL,
        sale_price DECIMAL(10, 2),
        image TEXT,
        INDEX idx_order_id (order_id),
        INDEX idx_product_id (product_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await dbConnection.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        slug VARCHAR(100) UNIQUE NOT NULL,
        icon VARCHAR(50),
        color VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await dbConnection.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id INT NOT NULL,
        user_id INT NOT NULL,
        user_name VARCHAR(255),
        rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_product_id (product_id),
        INDEX idx_user_id (user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await dbConnection.query(`
      CREATE TABLE IF NOT EXISTS gallery (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description VARCHAR(500),
        image TEXT NOT NULL,
        category VARCHAR(100),
        active BOOLEAN DEFAULT TRUE,
        order_index INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // ===============================
    // 🔥 SINCRONIZAR COLUMNAS FALTANTES
    // ===============================
    await ensureColumns();

    dbConnection.release();
    console.log("✅ Tablas de base de datos creadas y sincronizadas");

    return true;
  } catch (error) {
    console.error("❌ Error al inicializar base de datos:", error.message);
    throw error;
  }
}

// ===============================
// VERIFICAR Y AGREGAR COLUMNAS
// ===============================
async function ensureColumns() {
  const conn = await pool.getConnection();

  try {
    // -------- products --------
    const productColumns = [
      { name: "active", sql: "ALTER TABLE products ADD COLUMN active BOOLEAN DEFAULT TRUE" },
      { name: "stock", sql: "ALTER TABLE products ADD COLUMN stock INT DEFAULT 100" }
    ];

    for (const col of productColumns) {
      const [rows] = await conn.query(`SHOW COLUMNS FROM products LIKE ?`, [col.name]);
      if (rows.length === 0) {
        await conn.query(col.sql);
        console.log(`🛠 Columna ${col.name} agregada a products`);
      }
    }

    // -------- orders --------
    const orderColumns = [
      { name: "customer_name", sql: "ALTER TABLE orders ADD COLUMN customer_name VARCHAR(255)" },
      { name: "customer_email", sql: "ALTER TABLE orders ADD COLUMN customer_email VARCHAR(255)" },
      { name: "customer_phone", sql: "ALTER TABLE orders ADD COLUMN customer_phone VARCHAR(50)" },
      { name: "notes", sql: "ALTER TABLE orders ADD COLUMN notes TEXT" },
      { name: "discount", sql: "ALTER TABLE orders ADD COLUMN discount DECIMAL(10,2) DEFAULT 0" },
      { name: "coupon_code", sql: "ALTER TABLE orders ADD COLUMN coupon_code VARCHAR(50)" }
    ];

    for (const col of orderColumns) {
      const [rows] = await conn.query(`SHOW COLUMNS FROM orders LIKE ?`, [col.name]);
      if (rows.length === 0) {
        await conn.query(col.sql);
        console.log(`🛠 Columna ${col.name} agregada a orders`);
      }
    }

    // -------- order_items --------
    const [oiCols] = await conn.query(`SHOW COLUMNS FROM order_items LIKE 'image'`);
    if (oiCols.length === 0) {
      await conn.query(`ALTER TABLE order_items ADD COLUMN image TEXT`);
      console.log("🛠 Columna image agregada a order_items");
    }

  } finally {
    conn.release();
  }
}

// ===============================
// SEED DE DATOS
// ===============================
async function seedDatabase() {
  const bcrypt = require("bcryptjs");
  const connection = await pool.getConnection();

  try {
    const [users] = await connection.query(
      "SELECT COUNT(*) as count FROM users"
    );

    if (users[0].count === 0) {
      console.log("📦 Insertando datos iniciales...");

      const adminPassword = bcrypt.hashSync("admin123", 10);
      const userPassword = bcrypt.hashSync("user123", 10);

      await connection.query(
        `
        INSERT INTO users (name, email, password, role) VALUES
        ('Administrador', 'admin@cnccampas.com', ?, 'admin'),
        ('Usuario Demo', 'usuario@test.com', ?, 'user')
      `,
        [adminPassword, userPassword]
      );

      console.log("✅ Datos iniciales insertados correctamente");
      console.log("👤 Usuario admin: admin@cnccampas.com / admin123");
      console.log("👤 Usuario demo: usuario@test.com / user123");
    } else {
      console.log("ℹ️  Base de datos ya contiene datos");
    }
  } catch (error) {
    console.error("❌ Error al insertar datos iniciales:", error.message);
  } finally {
    connection.release();
  }
}

module.exports = {
  pool,
  initializeDatabase,
  seedDatabase,
};
