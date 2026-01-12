const express = require('express');
const router = express.Router();
const { auth, adminAuth } = require('../middleware/auth');
const { pool } = require('../config/database');

// ===============================
// OBTENER TODOS LOS PRODUCTOS
// ===============================
router.get('/', async (req, res) => {
    try {
        const { category, featured, search } = req.query;
        
        let query = 'SELECT * FROM products WHERE 1=1';
        const params = [];

        // ❌ QUITADO: filtro por active (no existe la columna)

        // Filtrar por categoría
        if (category && category !== 'all') {
            query += ' AND category = ?';
            params.push(category);
        }

        // Filtrar productos destacados
        if (featured === 'true') {
            query += ' AND featured = TRUE';
        }

        // Búsqueda por nombre o descripción
        if (search) {
            query += ' AND (name LIKE ? OR description LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }

        query += ' ORDER BY created_at DESC';

        const [products] = await pool.query(query, params);
        res.json(products);
    } catch (error) {
        console.error('Error al obtener productos:', error);
        res.status(500).json({ error: 'Error al obtener productos' });
    }
});

// ===============================
// OBTENER PRODUCTO POR ID
// ===============================
router.get('/:id', async (req, res) => {
    try {
        const [products] = await pool.query(
            'SELECT * FROM products WHERE id = ?',
            [req.params.id]
        );
        
        if (products.length === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        res.json(products[0]);
    } catch (error) {
        console.error('Error al obtener producto:', error);
        res.status(500).json({ error: 'Error al obtener producto' });
    }
});

// ===============================
// CREAR PRODUCTO (sin auth temporal)
// ===============================
router.post('/', async (req, res) => {
    try {
        const { 
            name, description, price, sale_price, salePrice, category, image, 
            file_format, fileFormat, featured, trending, stock 
        } = req.body;

        if (!name || !description || !price || !category) {
            return res.status(400).json({ error: 'Faltan campos requeridos' });
        }

        // Compatibilidad con ambos formatos
        const finalSalePrice = sale_price || salePrice;
        const finalFileFormat = file_format || fileFormat || 'Digital';
        const finalStock = stock || 100;

        const [result] = await pool.query(
            `INSERT INTO products 
            (name, description, price, sale_price, category, image, file_format, featured, trending, stock) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                name,
                description,
                parseFloat(price),
                finalSalePrice ? parseFloat(finalSalePrice) : null,
                category,
                image || 'https://via.placeholder.com/500',
                finalFileFormat,
                featured ? 1 : 0,
                trending ? 1 : 0,
                parseInt(finalStock)
            ]
        );

        res.status(201).json({
            success: true,
            message: 'Producto creado exitosamente',
            id: result.insertId
        });
    } catch (error) {
        console.error('Error al crear producto:', error);
        res.status(500).json({ error: 'Error al crear producto', details: error.message });
    }
});

// ===============================
// ACTUALIZAR PRODUCTO
// ===============================
router.put('/:id', async (req, res) => {
    try {
        const { 
            name, description, price, sale_price, salePrice, category, image, 
            file_format, fileFormat, featured, trending, stock 
        } = req.body;

        const finalSalePrice = sale_price || salePrice;
        const finalFileFormat = file_format || fileFormat;
        const finalStock = stock || 100;

        const [result] = await pool.query(
            `UPDATE products 
             SET name = ?, description = ?, price = ?, sale_price = ?, category = ?, 
                 image = ?, file_format = ?, featured = ?, trending = ?, stock = ?
             WHERE id = ?`,
            [
                name,
                description,
                parseFloat(price),
                finalSalePrice ? parseFloat(finalSalePrice) : null,
                category,
                image,
                finalFileFormat,
                featured ? 1 : 0,
                trending ? 1 : 0,
                parseInt(finalStock),
                req.params.id
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        res.json({ 
            success: true,
            message: 'Producto actualizado exitosamente' 
        });
    } catch (error) {
        console.error('Error al actualizar producto:', error);
        res.status(500).json({ error: 'Error al actualizar producto', details: error.message });
    }
});

// ===============================
// ELIMINAR PRODUCTO
// ===============================
router.delete('/:id', async (req, res) => {
    try {
        const [result] = await pool.query(
            'DELETE FROM products WHERE id = ?',
            [req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        res.json({ 
            success: true,
            message: 'Producto eliminado exitosamente' 
        });
    } catch (error) {
        console.error('Error al eliminar producto:', error);
        res.status(500).json({ error: 'Error al eliminar producto' });
    }
});

// ===============================
// ACTUALIZAR STOCK
// ===============================
router.patch('/:id/stock', auth, adminAuth, async (req, res) => {
    try {
        const { stock } = req.body;

        const [result] = await pool.query(
            'UPDATE products SET stock = ? WHERE id = ?',
            [parseInt(stock), req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        res.json({ message: 'Stock actualizado exitosamente' });
    } catch (error) {
        console.error('Error al actualizar stock:', error);
        res.status(500).json({ error: 'Error al actualizar stock' });
    }
});

module.exports = router;
