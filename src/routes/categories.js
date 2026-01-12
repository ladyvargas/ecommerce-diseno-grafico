const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// Obtener todas las categorías
router.get('/', async (req, res) => {
    try {
        const [categories] = await pool.query('SELECT * FROM categories ORDER BY name');
        
        // Agregar conteo de productos por categoría
        const categoriesWithCount = await Promise.all(
            categories.map(async (cat) => {
                const [count] = await pool.query(
                    'SELECT COUNT(*) as count FROM products WHERE category = ? AND (active IS NULL OR active = TRUE)',
                    [cat.name]
                );
                return { 
                    ...cat, 
                    count: count[0].count
                };
            })
        );

        res.json(categoriesWithCount);
    } catch (error) {
        console.error('Error al obtener categorías:', error);
        res.status(500).json({ message: 'Error al obtener categorías' });
    }
});

// Obtener categoría específica
router.get('/:slug', async (req, res) => {
    try {
        const { slug } = req.params;
        
        const [categories] = await pool.query('SELECT * FROM categories WHERE slug = ?', [slug]);
        
        if (categories.length === 0) {
            return res.status(404).json({ message: 'Categoría no encontrada' });
        }

        const category = categories[0];
        const [count] = await pool.query(
            'SELECT COUNT(*) as count FROM products WHERE category = ? AND (active IS NULL OR active = TRUE)',
            [category.name]
        );
        
        res.json({ 
            ...category, 
            count: count[0].count
        });
    } catch (error) {
        console.error('Error al obtener categoría:', error);
        res.status(500).json({ message: 'Error al obtener categoría' });
    }
});

module.exports = router;
