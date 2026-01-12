const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// TODO: Migrar a MySQL
// Por ahora devuelve array vacío para evitar errores

router.get('/', async (req, res) => {
    res.json([]);
});

router.post('/', async (req, res) => {
    res.json({ success: true, message: 'Funcionalidad en desarrollo' });
});

router.put('/:id', async (req, res) => {
    res.json({ success: true, message: 'Actualizado' });
});

router.delete('/:id', async (req, res) => {
    res.json({ success: true, message: 'Eliminado' });
});

module.exports = router;
