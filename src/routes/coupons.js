const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// Obtener todos los cupones
router.get('/', async (req, res) => {
    try {
        const [coupons] = await pool.query(`
            SELECT * FROM coupons 
            ORDER BY created_at DESC
        `);
        res.json(coupons);
    } catch (error) {
        console.error('Error al obtener cupones:', error);
        res.status(500).json({ error: 'Error al cargar cupones' });
    }
});

// Validar cupón
router.post('/validate', async (req, res) => {
    try {
        const { code, subtotal } = req.body;
        
        const [coupons] = await pool.query(`
            SELECT * FROM coupons 
            WHERE code = ? AND active = TRUE
        `, [code]);
        
        if (coupons.length === 0) {
            return res.status(404).json({ error: 'Cupón no válido' });
        }
        
        const coupon = coupons[0];
        
        // Verificar expiración
        if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
            return res.status(400).json({ error: 'Cupón expirado' });
        }
        
        // Verificar compra mínima
        if (subtotal < coupon.min_purchase) {
            return res.status(400).json({ 
                error: `Compra mínima de $${coupon.min_purchase} requerida` 
            });
        }
        
        // Verificar usos
        if (coupon.max_uses && coupon.used_count >= coupon.max_uses) {
            return res.status(400).json({ error: 'Cupón agotado' });
        }
        
        // Calcular descuento
        let discount = 0;
        if (coupon.discount_type === 'percentage') {
            discount = (subtotal * coupon.discount_value) / 100;
        } else {
            discount = coupon.discount_value;
        }
        
        res.json({
            valid: true,
            coupon: coupon,
            discount: discount
        });
    } catch (error) {
        console.error('Error al validar cupón:', error);
        res.status(500).json({ error: 'Error al validar cupón' });
    }
});

// Crear cupón
router.post('/', async (req, res) => {
    try {
        const { 
            code, 
            description, 
            discount_type, 
            discount_value, 
            min_purchase, 
            max_uses, 
            expires_at, 
            active 
        } = req.body;
        
        const [result] = await pool.query(`
            INSERT INTO coupons 
            (code, description, discount_type, discount_value, min_purchase, max_uses, expires_at, active)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [code, description, discount_type, discount_value, min_purchase || 0, max_uses, expires_at, active !== false]);
        
        res.status(201).json({ 
            success: true, 
            id: result.insertId,
            message: 'Cupón creado exitosamente' 
        });
    } catch (error) {
        console.error('Error al crear cupón:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            res.status(400).json({ error: 'El código del cupón ya existe' });
        } else {
            res.status(500).json({ error: 'Error al crear cupón' });
        }
    }
});

// Actualizar cupón
router.put('/:id', async (req, res) => {
    try {
        const { 
            code, 
            description, 
            discount_type, 
            discount_value, 
            min_purchase, 
            max_uses, 
            expires_at, 
            active 
        } = req.body;
        
        await pool.query(`
            UPDATE coupons 
            SET code = ?, description = ?, discount_type = ?, discount_value = ?, 
                min_purchase = ?, max_uses = ?, expires_at = ?, active = ?
            WHERE id = ?
        `, [code, description, discount_type, discount_value, min_purchase, max_uses, expires_at, active, req.params.id]);
        
        res.json({ success: true, message: 'Cupón actualizado' });
    } catch (error) {
        console.error('Error al actualizar cupón:', error);
        res.status(500).json({ error: 'Error al actualizar cupón' });
    }
});

// Eliminar cupón
router.delete('/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM coupons WHERE id = ?', [req.params.id]);
        res.json({ success: true, message: 'Cupón eliminado' });
    } catch (error) {
        console.error('Error al eliminar cupón:', error);
        res.status(500).json({ error: 'Error al eliminar cupón' });
    }
});

module.exports = router;
