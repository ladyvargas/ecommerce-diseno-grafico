const express = require('express');
const router = express.Router();

const { pool } = require('../config/database');
const auth = require('../middleware/auth');

// Helpers
async function ensureAboutRow() {
  await pool.query(`
    INSERT INTO about_page
      (id, hero_title, historia_title, historia_html, mision_title, mision_text, vision_title, vision_text, team_title)
    SELECT
      1,'Sobre Nosotros','Nuestra Historia','<p>Texto inicial</p>','MISION','Texto misión','VISION','Texto visión','Nuestro Equipo'
    FROM DUAL
    WHERE NOT EXISTS (SELECT 1 FROM about_page WHERE id=1)
  `);
}

/**
 * GET /api/about (público)
 */
router.get('/', async (req, res) => {
  try {
    await ensureAboutRow();

    const [aboutRows] = await pool.query('SELECT * FROM about_page WHERE id=1 LIMIT 1');
    const about = aboutRows[0] || {};

    const [teamRows] = await pool.query(
      'SELECT * FROM about_team WHERE active=1 ORDER BY sort_order ASC, id ASC'
    );

    res.json({
      ...about,
      team: teamRows
    });
  } catch (err) {
    console.error('GET /api/about error:', err);
    res.status(500).json({ error: 'Error cargando About' });
  }
});

/**
 * PUT /api/about (admin)
 */
router.put('/', auth.auth, auth.adminAuth, async (req, res) => {
  try {
    await ensureAboutRow();

    const {
      hero_title,
      historia_title,
      historia_html,
      mision_title,
      mision_text,
      vision_title,
      vision_text,
      team_title
    } = req.body;

    await pool.query(
      `UPDATE about_page SET
        hero_title=?,
        historia_title=?,
        historia_html=?,
        mision_title=?,
        mision_text=?,
        vision_title=?,
        vision_text=?,
        team_title=?
      WHERE id=1`,
      [
        hero_title,
        historia_title,
        historia_html,
        mision_title,
        mision_text,
        vision_title,
        vision_text,
        team_title
      ]
    );

    res.json({ ok: true });
  } catch (err) {
    console.error('PUT /api/about error:', err);
    res.status(500).json({ error: 'Error guardando About' });
  }
});

/**
 * POST /api/about/team (admin)
 */
router.post('/team', auth.auth, auth.adminAuth, async (req, res) => {
  try {
    const { name, role, bio, icon_class, sort_order, active } = req.body;

    await pool.query(
      `INSERT INTO about_team (name, role, bio, icon_class, sort_order, active)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, role, bio, icon_class || 'fa-user', sort_order || 0, active ?? 1]
    );

    res.json({ ok: true });
  } catch (err) {
    console.error('POST /api/about/team error:', err);
    res.status(500).json({ error: 'Error creando miembro' });
  }
});

/**
 * PUT /api/about/team/:id (admin)
 */
router.put('/team/:id', auth.auth, auth.adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role, bio, icon_class, sort_order, active } = req.body;

    await pool.query(
      `UPDATE about_team SET
        name=?,
        role=?,
        bio=?,
        icon_class=?,
        sort_order=?,
        active=?
      WHERE id=?`,
      [name, role, bio, icon_class || 'fa-user', sort_order || 0, active ?? 1, id]
    );

    res.json({ ok: true });
  } catch (err) {
    console.error('PUT /api/about/team/:id error:', err);
    res.status(500).json({ error: 'Error actualizando miembro' });
  }
});

/**
 * DELETE /api/about/team/:id (admin)
 */
router.delete('/team/:id', auth.auth, auth.adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM about_team WHERE id=?', [id]);
    res.json({ ok: true });
  } catch (err) {
    console.error('DELETE /api/about/team/:id error:', err);
    res.status(500).json({ error: 'Error eliminando miembro' });
  }
});

module.exports = router;
