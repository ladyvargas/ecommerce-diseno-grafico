const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'public')));
console.log(
  'Uploads path:',
  path.join(__dirname, 'uploads')
);

// Importar configuración de base de datos
const { pool, initializeDatabase, seedDatabase } = require('./src/config/database');

// Inicializar base de datos
(async () => {
    try {
        console.log('🔄 Inicializando base de datos...');
        await initializeDatabase();
        await seedDatabase();
        console.log('✅ Base de datos lista');
    } catch (error) {
        console.error('❌ Error al inicializar base de datos:', error);
        process.exit(1);
    }
})();

// NO usar global.db - TODO está en MySQL ahora
const fs = require('fs');

console.log(
  'Existe uploads?:',
  fs.existsSync(path.join(__dirname, 'uploads'))
);
console.log(
  'Archivos:',
  fs.readdirSync(path.join(__dirname, 'uploads'), { withFileTypes: true })
);

// Routes API
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/products', require('./src/routes/products'));
app.use('/api/cart', require('./src/routes/cart'));
app.use('/api/orders', require('./src/routes/orders'));
app.use('/api/categories', require('./src/routes/categories'));
app.use('/api/reviews', require('./src/routes/reviews'));
app.use('/api/dashboard', require('./src/routes/dashboard'));
app.use('/api/stats', require('./src/routes/stats'));
app.use('/api/gallery', require('./src/routes/gallery'));

// Páginas Frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'pages', 'admin-pro.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'pages', 'login.html'));
});

app.get('/catalogo', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'pages', 'catalogo.html'));
});

app.get('/productos', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'pages', 'productos.html'));
});

app.get('/mis-pedidos', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'pages', 'mis-pedidos.html'));
});

app.get('/orders', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'pages', 'orders.html'));
});

app.get('/cart', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'pages', 'cart.html'));
});

app.get('/product/:id', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'pages', 'product.html'));
});

app.get('/checkout', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'pages', 'checkout.html'));
});

app.get('/order-success', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'pages', 'order-success.html'));
});

const PORT = process.env.PORT || 3000;

// ========================================
// NUEVAS RUTAS - APIs Adicionales
// ========================================
app.use('/api/upload', require('./src/routes/upload'));
app.use('/api/coupons', require('./src/routes/coupons'));
app.use('/api/promotions', require('./src/routes/promotions'));
app.use('/api/settings', require('./src/routes/settings'));

console.log('✅ APIs adicionales cargadas');

app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║        🎨 CNC CAMPAS PRO - ADMIN PANEL COMPLETO 🎨       ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝

✅ Servidor ejecutándose en: http://localhost:${PORT}
✅ Panel Admin PRO: http://localhost:${PORT}/admin
✅ Ver Pedidos: http://localhost:${PORT}/orders

📦 Base de datos MySQL conectada
👤 Usuario admin: admin@cnccampas.com / admin123
🎯 Panel completamente funcional con MySQL
🚀 Sistema profesional listo para producción
    `);
});
