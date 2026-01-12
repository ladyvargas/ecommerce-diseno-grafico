const mysql = require('mysql2/promise');

// Configuración de la base de datos
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'CNC CAMPAS',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// Crear pool de conexiones
const pool = mysql.createPool(dbConfig);

// Función para inicializar la base de datos
async function initializeDatabase() {
    let connection;
    try {
        // Conectar sin seleccionar base de datos
        const tempPool = mysql.createPool({
            host: dbConfig.host,
            user: dbConfig.user,
            password: dbConfig.password
        });
        
        connection = await tempPool.getConnection();
        
        // Crear base de datos si no existe
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\``);
        console.log(`✅ Base de datos '${dbConfig.database}' verificada`);
        
        await connection.release();
        await tempPool.end();
        
        // Ahora conectar a la base de datos y crear tablas
        const dbConnection = await pool.getConnection();
        
        // Crear tabla de usuarios
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
        
        // Crear tabla de productos
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
        
        // Crear tabla de pedidos
        await dbConnection.query(`
            CREATE TABLE IF NOT EXISTS orders (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
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
        
        // Crear tabla de items de pedidos
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
        
        // Crear tabla de categorías
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
        
        // Crear tabla de reseñas
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
        
        // Crear tabla de galería
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
        
        dbConnection.release();
        console.log('✅ Tablas de base de datos creadas correctamente');
        
        return true;
    } catch (error) {
        console.error('❌ Error al inicializar base de datos:', error.message);
        throw error;
    }
}

// Función para insertar datos iniciales
async function seedDatabase() {
    const bcrypt = require('bcryptjs');
    const connection = await pool.getConnection();
    
    try {
        // Verificar si ya hay usuarios
        const [users] = await connection.query('SELECT COUNT(*) as count FROM users');
        
        if (users[0].count === 0) {
            console.log('📦 Insertando datos iniciales...');
            
            // Insertar usuarios
            const adminPassword = bcrypt.hashSync('admin123', 10);
            const userPassword = bcrypt.hashSync('user123', 10);
            
            await connection.query(`
                INSERT INTO users (name, email, password, role) VALUES
                ('Administrador', 'admin@CNC CAMPAS.com', ?, 'admin'),
                ('Usuario Demo', 'usuario@test.com', ?, 'user')
            `, [adminPassword, userPassword]);
            
            // Insertar categorías
            await connection.query(`
                INSERT INTO categories (name, slug, icon, color) VALUES
                ('Logos', 'logos', 'fa-trademark', '#4a2f1a'),
                ('Branding', 'branding', 'fa-palette', '#ec4899'),
                ('Mockups', 'mockups', 'fa-mobile-alt', '#8b5cf6'),
                ('Iconos', 'iconos', 'fa-icons', '#10b981'),
                ('Tipografía', 'tipografia', 'fa-font', '#f59e0b'),
                ('Presentaciones', 'presentaciones', 'fa-presentation', '#3b82f6'),
                ('Recursos', 'recursos', 'fa-box', '#ec4899'),
                ('Marketing', 'marketing', 'fa-chart-line', '#10b981'),
                ('Ilustraciones', 'ilustraciones', 'fa-image', '#8b5cf6'),
                ('Redes Sociales', 'redes-sociales', 'fa-share-alt', '#4a2f1a')
            `);
            
            // Insertar productos
            await connection.query(`
                INSERT INTO products (name, description, price, category, image, featured, downloads, rating, file_format) VALUES
                ('Pack de Logos Minimalistas', 'Colección de 50 plantillas de logos minimalistas editables en formato vectorial. Perfecto para startups y marcas modernas.', 29.99, 'Logos', 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=500', TRUE, 127, 4.8, 'AI, EPS, SVG, PNG'),
                ('Plantillas de Instagram Stories', '100 plantillas profesionales para Instagram Stories. Totalmente personalizables en Canva y Photoshop.', 19.99, 'Redes Sociales', 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=500', TRUE, 243, 4.9, 'PSD, CANVA'),
                ('Kit de Identidad Corporativa', 'Kit completo de identidad visual: logo, tarjetas, papelería, presentaciones. Todo listo para personalizar.', 49.99, 'Branding', 'https://images.unsplash.com/photo-1634942537034-2531766767d1?w=500', TRUE, 89, 5.0, 'AI, PSD, INDD'),
                ('Iconos Profesionales Pack', '500 iconos vectoriales para web y apps. Múltiples estilos: line, solid, duotone. Totalmente escalables.', 24.99, 'Iconos', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500', FALSE, 156, 4.7, 'SVG, AI, PNG'),
                ('Mockups 3D Premium', 'Colección de 30 mockups 3D de alta calidad para presentar tus diseños. Incluye dispositivos, packaging y más.', 39.99, 'Mockups', 'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=500', TRUE, 198, 4.9, 'PSD, BLEND'),
                ('Fuentes Tipográficas Exclusivas', 'Pack de 10 fuentes tipográficas únicas diseñadas por profesionales. Licencia comercial incluida.', 34.99, 'Tipografía', 'https://images.unsplash.com/photo-1516534775068-ba3e7458af70?w=500', FALSE, 134, 4.6, 'OTF, TTF, WOFF'),
                ('Plantillas de Presentación', '50 slides profesionales para presentaciones de negocios. Compatible con PowerPoint, Keynote y Google Slides.', 27.99, 'Presentaciones', 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=500', FALSE, 167, 4.8, 'PPTX, KEY'),
                ('Texturas y Patrones', '200 texturas de alta resolución y patrones seamless. Ideales para fondos, packaging y diseño web.', 22.99, 'Recursos', 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=500', TRUE, 201, 4.7, 'JPG, PNG, PAT'),
                ('Templates de Email Marketing', '25 plantillas responsive para campañas de email marketing. Compatible con Mailchimp y principales plataformas.', 18.99, 'Marketing', 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=500', FALSE, 145, 4.5, 'HTML, PSD'),
                ('Pack de Ilustraciones Vectoriales', '150 ilustraciones vectoriales modernas. Personajes, objetos, escenas. Totalmente personalizables.', 44.99, 'Ilustraciones', 'https://images.unsplash.com/photo-1509343256512-d77a5cb3791b?w=500', TRUE, 178, 5.0, 'AI, SVG, EPS')
            `);
            
            // Insertar elementos de galería
            await connection.query(`
                INSERT INTO gallery (title, description, image, category, active, order_index) VALUES
                ('Letras Corpóreas 3D', 'Corte CNC en acrílico', 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=600&h=400&fit=crop', 'CNC', TRUE, 1),
                ('Grabado Láser', 'Detalle en madera', 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=600&h=400&fit=crop', 'Láser', TRUE, 2),
                ('Impresión Gran Formato', 'Lona publicitaria', 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=600&h=400&fit=crop', 'Impresión', TRUE, 3),
                ('Impresión UV', 'Sobre madera', 'https://images.unsplash.com/photo-1609743522471-83c84ce23e32?w=600&h=400&fit=crop', 'UV', TRUE, 4),
                ('Prototipo 3D', 'Impresión funcional', 'https://images.unsplash.com/photo-1614025767867-c072ca0cdc18?w=600&h=400&fit=crop', '3D', TRUE, 5),
                ('Letrero LED', 'Iluminación personalizada', 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=600&h=400&fit=crop', 'LED', TRUE, 6)
            `);
            
            console.log('✅ Datos iniciales insertados correctamente');
            console.log('👤 Usuario admin: admin@CNC CAMPAS.com / admin123');
            console.log('👤 Usuario demo: usuario@test.com / user123');
        } else {
            console.log('ℹ️  Base de datos ya contiene datos');
        }
    } catch (error) {
        console.error('❌ Error al insertar datos iniciales:', error.message);
    } finally {
        connection.release();
    }
}

module.exports = {
    pool,
    initializeDatabase,
    seedDatabase
};
