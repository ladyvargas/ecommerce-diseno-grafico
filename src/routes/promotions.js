const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// Obtener todas las promociones
router.get('/', async (req, res) => {
    try {
        const [promotions] = await pool.query(`
            SELECT * FROM promotions 
            ORDER BY created_at DESC
        `);
        res.json(promotions);
    } catch (error) {
        console.error('Error al obtener promociones:', error);
        res.status(500).json({ error: 'Error al cargar promociones' });
    }
});

// Obtener promociones activas
router.get('/active', async (req, res) => {
    try {
        const [promotions] = await pool.query(`
            SELECT * FROM promotions 
            WHERE active = TRUE 
            AND start_date <= NOW() 
            AND end_date >= NOW()
            ORDER BY discount_value DESC
        `);
        res.json(promotions);
    } catch (error) {
        console.error('Error al obtener promociones activas:', error);
        res.status(500).json({ error: 'Error al cargar promociones' });
    }
});

// Crear promoción
router.post('/', async (req, res) => {
    try {
        const { 
            name, 
            description, 
            discount_type, 
            discount_value, 
            applies_to,
            product_ids,
            category_ids,
            start_date, 
            end_date, 
            active 
        } = req.body;
        
        const [result] = await pool.query(`
            INSERT INTO promotions 
            (name, description, discount_type, discount_value, applies_to, product_ids, category_ids, start_date, end_date, active)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            name, 
            description, 
            discount_type, 
            discount_value, 
            applies_to || 'all',
            product_ids ? JSON.stringify(product_ids) : null,
            category_ids ? JSON.stringify(category_ids) : null,
            start_date, 
            end_date, 
            active !== false
        ]);
        
        res.status(201).json({ 
            success: true, 
            id: result.insertId,
            message: 'Promoción creada exitosamente' 
        });
    } catch (error) {
        console.error('Error al crear promoción:', error);
        res.status(500).json({ error: 'Error al crear promoción' });
    }
});

// Actualizar promoción
router.put('/:id', async (req, res) => {
    try {
        const { 
            name, 
            description, 
            discount_type, 
            discount_value,
            applies_to,
            product_ids,
            category_ids,
            start_date, 
            end_date, 
            active 
        } = req.body;
        
        await pool.query(`
            UPDATE promotions 
            SET name = ?, description = ?, discount_type = ?, discount_value = ?, 
                applies_to = ?, product_ids = ?, category_ids = ?,
                start_date = ?, end_date = ?, active = ?
            WHERE id = ?
        `, [
            name, 
            description, 
            discount_type, 
            discount_value,
            applies_to,
            product_ids ? JSON.stringify(product_ids) : null,
            category_ids ? JSON.stringify(category_ids) : null,
            start_date, 
            end_date, 
            active, 
            req.params.id
        ]);
        
        res.json({ success: true, message: 'Promoción actualizada' });
    } catch (error) {
        console.error('Error al actualizar promoción:', error);
        res.status(500).json({ error: 'Error al actualizar promoción' });
    }
});

// Eliminar promoción
router.delete('/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM promotions WHERE id = ?', [req.params.id]);
        res.json({ success: true, message: 'Promoción eliminada' });
    } catch (error) {
        console.error('Error al eliminar promoción:', error);
        res.status(500).json({ error: 'Error al eliminar promoción' });
    }
});

module.exports = router;
