const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { pool } = require('../config/database');

// Obtener todas las reseñas
router.get('/', async (req, res) => {
    try {
        const { productId } = req.query;
        
        let query = 'SELECT * FROM reviews';
        const params = [];
        
        if (productId) {
            query += ' WHERE product_id = ?';
            params.push(productId);
        }
        
        query += ' ORDER BY created_at DESC';
        
        const [reviews] = await pool.query(query, params);
        res.json(reviews);
    } catch (error) {
        console.error('Error al obtener reseñas:', error);
        res.status(500).json({ message: 'Error al obtener reseñas' });
    }
});

// Crear nueva reseña
router.post('/', auth, async (req, res) => {
    try {
        const { productId, rating, comment } = req.body;
        
        if (!productId || !rating) {
            return res.status(400).json({ message: 'Producto y calificación son requeridos' });
        }
        
        const [result] = await pool.query(
            'INSERT INTO reviews (product_id, user_id, user_name, rating, comment) VALUES (?, ?, ?, ?, ?)',
            [productId, req.user.id, req.user.name, rating, comment || '']
        );
        
        res.status(201).json({
            id: result.insertId,
            message: 'Reseña creada exitosamente'
        });
    } catch (error) {
        console.error('Error al crear reseña:', error);
        res.status(500).json({ message: 'Error al crear reseña' });
    }
});

// Eliminar reseña (solo admin o autor)
router.delete('/:id', auth, async (req, res) => {
    try {
        const reviewId = parseInt(req.params.id);
        
        const [reviews] = await pool.query('SELECT * FROM reviews WHERE id = ?', [reviewId]);
        
        if (reviews.length === 0) {
            return res.status(404).json({ message: 'Reseña no encontrada' });
        }
        
        const review = reviews[0];
        
        // Solo el autor o un admin puede eliminar
        if (review.user_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'No autorizado' });
        }
        
        await pool.query('DELETE FROM reviews WHERE id = ?', [reviewId]);
        
        res.json({ message: 'Reseña eliminada exitosamente' });
    } catch (error) {
        console.error('Error al eliminar reseña:', error);
        res.status(500).json({ message: 'Error al eliminar reseña' });
    }
});

module.exports = router;
