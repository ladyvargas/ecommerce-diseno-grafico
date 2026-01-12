const express = require('express');
const router = express.Router();
const { auth, adminAuth } = require('../middleware/auth');
const { pool } = require('../config/database');

// Obtener todos los productos
router.get('/', async (req, res) => {
    try {
        const { category, featured, search, includeInactive } = req.query;
        
        let query = 'SELECT * FROM products WHERE 1=1';
        const params = [];

        // Por defecto, filtrar productos inactivos
        if (includeInactive !== 'true') {
            query += ' AND (active IS NULL OR active = TRUE)';
        }

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

// Obtener producto por ID
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

// Crear producto (solo admin)
router.post('/', auth, adminAuth, async (req, res) => {
    try {
        const { 
            name, description, price, salePrice, category, image, 
            fileFormat, featured, trending, active 
        } = req.body;

        if (!name || !description || !price || !category) {
            return res.status(400).json({ error: 'Faltan campos requeridos' });
        }

        const [result] = await pool.query(
            `INSERT INTO products (name, description, price, sale_price, category, image, file_format, featured, trending, active) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                name,
                description,
                parseFloat(price),
                salePrice ? parseFloat(salePrice) : null,
                category,
                image || 'https://via.placeholder.com/500',
                fileFormat || 'Digital',
                featured || false,
                trending || false,
                active !== false
            ]
        );

        res.status(201).json({
            message: 'Producto creado exitosamente',
            id: result.insertId
        });
    } catch (error) {
        console.error('Error al crear producto:', error);
        res.status(500).json({ error: 'Error al crear producto' });
    }
});

// Actualizar producto (solo admin)
router.put('/:id', auth, adminAuth, async (req, res) => {
    try {
        const { 
            name, description, price, salePrice, category, image, 
            fileFormat, featured, trending, active 
        } = req.body;

        const [result] = await pool.query(
            `UPDATE products 
             SET name = ?, description = ?, price = ?, sale_price = ?, category = ?, 
                 image = ?, file_format = ?, featured = ?, trending = ?, active = ?
             WHERE id = ?`,
            [
                name,
                description,
                parseFloat(price),
                salePrice ? parseFloat(salePrice) : null,
                category,
                image,
                fileFormat,
                featured,
                trending,
                active,
                req.params.id
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        res.json({ message: 'Producto actualizado exitosamente' });
    } catch (error) {
        console.error('Error al actualizar producto:', error);
        res.status(500).json({ error: 'Error al actualizar producto' });
    }
});

// Eliminar producto (solo admin)
router.delete('/:id', auth, adminAuth, async (req, res) => {
    try {
        const [result] = await pool.query(
            'DELETE FROM products WHERE id = ?',
            [req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        res.json({ message: 'Producto eliminado exitosamente' });
    } catch (error) {
        console.error('Error al eliminar producto:', error);
        res.status(500).json({ error: 'Error al eliminar producto' });
    }
});

// Actualizar stock del producto
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
