const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { pool } = require('../config/database');

// Configurar multer para subida de imágenes
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../../uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'gallery-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png|gif|webp/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Solo se permiten imágenes (jpeg, jpg, png, gif, webp)'));
    }
});

// Obtener todos los elementos de galería
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT * FROM gallery ORDER BY order_index ASC, created_at DESC'
        );
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener galería:', error);
        res.status(500).json({ error: 'Error al obtener galería' });
    }
});

// Obtener elementos activos de galería (para frontend)
router.get('/active', async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT * FROM gallery WHERE active = TRUE ORDER BY order_index ASC, created_at DESC'
        );
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener galería activa:', error);
        res.status(500).json({ error: 'Error al obtener galería activa' });
    }
});

// Obtener elemento de galería por ID
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT * FROM gallery WHERE id = ?',
            [req.params.id]
        );
        
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Elemento no encontrado' });
        }
        
        res.json(rows[0]);
    } catch (error) {
        console.error('Error al obtener elemento:', error);
        res.status(500).json({ error: 'Error al obtener elemento' });
    }
});

// Crear nuevo elemento de galería
router.post('/', upload.single('image'), async (req, res) => {
    try {
        const { title, description, category, active, order_index } = req.body;
        
        if (!title) {
            return res.status(400).json({ error: 'El título es requerido' });
        }
        
        let imageUrl = req.body.image || '';
        
        // Si se subió una imagen, usar la ruta del archivo
        if (req.file) {
            imageUrl = '/uploads/' + req.file.filename;
        }
        
        if (!imageUrl) {
            return res.status(400).json({ error: 'La imagen es requerida' });
        }
        
        const [result] = await pool.query(
            `INSERT INTO gallery (title, description, image, category, active, order_index) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
                title,
                description || '',
                imageUrl,
                category || '',
                active !== 'false' && active !== false ? true : false,
                order_index || 0
            ]
        );
        
        res.status(201).json({
            success: true,
            id: result.insertId,
            message: 'Elemento de galería creado exitosamente'
        });
    } catch (error) {
        console.error('Error al crear elemento de galería:', error);
        res.status(500).json({ error: 'Error al crear elemento de galería' });
    }
});

// Actualizar elemento de galería
router.put('/:id', upload.single('image'), async (req, res) => {
    try {
        const { title, description, category, active, order_index, image } = req.body;
        
        // Obtener elemento actual
        const [current] = await pool.query('SELECT * FROM gallery WHERE id = ?', [req.params.id]);
        
        if (current.length === 0) {
            return res.status(404).json({ error: 'Elemento no encontrado' });
        }
        
        let imageUrl = current[0].image;
        
        // Si se subió una nueva imagen
        if (req.file) {
            imageUrl = '/uploads/' + req.file.filename;
            
            // Eliminar imagen anterior si existe y es local
            if (current[0].image && current[0].image.startsWith('/uploads/')) {
                const oldImagePath = path.join(__dirname, '../../', current[0].image);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }
        } else if (image) {
            // Si se proporcionó una URL de imagen
            imageUrl = image;
        }
        
        await pool.query(
            `UPDATE gallery 
             SET title = ?, description = ?, image = ?, category = ?, active = ?, order_index = ?, updated_at = CURRENT_TIMESTAMP
             WHERE id = ?`,
            [
                title || current[0].title,
                description !== undefined ? description : current[0].description,
                imageUrl,
                category !== undefined ? category : current[0].category,
                active !== undefined ? (active === 'true' || active === true) : current[0].active,
                order_index !== undefined ? order_index : current[0].order_index,
                req.params.id
            ]
        );
        
        res.json({
            success: true,
            message: 'Elemento actualizado exitosamente'
        });
    } catch (error) {
        console.error('Error al actualizar elemento:', error);
        res.status(500).json({ error: 'Error al actualizar elemento' });
    }
});

// Eliminar elemento de galería
router.delete('/:id', async (req, res) => {
    try {
        // Obtener elemento actual para eliminar imagen
        const [current] = await pool.query('SELECT * FROM gallery WHERE id = ?', [req.params.id]);
        
        if (current.length === 0) {
            return res.status(404).json({ error: 'Elemento no encontrado' });
        }
        
        // Eliminar imagen si existe y es local
        if (current[0].image && current[0].image.startsWith('/uploads/')) {
            const imagePath = path.join(__dirname, '../../', current[0].image);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }
        
        await pool.query('DELETE FROM gallery WHERE id = ?', [req.params.id]);
        
        res.json({
            success: true,
            message: 'Elemento eliminado exitosamente'
        });
    } catch (error) {
        console.error('Error al eliminar elemento:', error);
        res.status(500).json({ error: 'Error al eliminar elemento' });
    }
});

// Reordenar elementos
router.put('/reorder/batch', async (req, res) => {
    try {
        const { items } = req.body; // Array de { id, order_index }
        
        if (!Array.isArray(items)) {
            return res.status(400).json({ error: 'Se requiere un array de items' });
        }
        
        // Actualizar order_index de cada elemento
        for (const item of items) {
            await pool.query(
                'UPDATE gallery SET order_index = ? WHERE id = ?',
                [item.order_index, item.id]
            );
        }
        
        res.json({
            success: true,
            message: 'Orden actualizado exitosamente'
        });
    } catch (error) {
        console.error('Error al reordenar elementos:', error);
        res.status(500).json({ error: 'Error al reordenar elementos' });
    }
});

module.exports = router;
