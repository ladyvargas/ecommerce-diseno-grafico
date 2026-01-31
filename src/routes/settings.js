const express = require("express");
const router = express.Router();
const { pool } = require("../config/database");

// ========================================
// ASEGURAR QUE EXISTA LA FILA DE SETTINGS
// ========================================
async function ensureSettingsRow() {
  try {
    const [rows] = await pool.query(
      "SELECT id FROM settings WHERE id = 1"
    );

    if (rows.length === 0) {
      await pool.query(
        `INSERT INTO settings 
          (id, store_name, store_email, store_phone, store_address, store_city, store_schedule,
           facebook_url, instagram_url, whatsapp_url, tiktok_url, footer_text, iva_percent,
           privacy_policy_html, terms_conditions_html)
        VALUES
          (1, 'CNC CAMPAS', 'cnccampas@gmail.com', '+593 964083585', 
           'Esmeraldas, Ecuador', 'Esmeraldas', 'Lun – Vie 8:00 AM – 6:00 PM',
           'https://www.facebook.com/p/Cnccampas-61557170055468/', 
           'https://www.instagram.com/cnccampas/', '', 
           'https://www.tiktok.com/@cnccampas7',
           'Fabricación digital profesional con la más alta tecnología. Convirtiendo tus ideas en realidad.',
           12, '', '')`
      );
    }
  } catch (error) {
    console.error("Error en ensureSettingsRow:", error);
  }
}

// ========================================
// GET /api/settings (PÚBLICO - Lee config)
// ========================================
router.get("/", async (req, res) => {
  try {
    await ensureSettingsRow();

    const [rows] = await pool.query(
      "SELECT * FROM settings WHERE id = 1 LIMIT 1"
    );

    res.json(rows[0] || {});
  } catch (error) {
    console.error("GET /api/settings error:", error);
    res.status(500).json({ error: "Error cargando settings" });
  }
});

// ========================================
// PUT /api/settings (ADMIN - Actualiza config)
// ========================================
router.put("/", async (req, res) => {
  try {
    await ensureSettingsRow();

    const updateFields = [];
    const updateValues = [];

    // Recorrer TODOS los campos del body
    const allowedFields = [
      'store_name', 'store_email', 'store_phone', 'store_address', 'store_city',
      'store_schedule', 'facebook_url', 'instagram_url', 'whatsapp_url', 'tiktok_url',
      'footer_text', 'iva_percent', 'privacy_policy_html', 'terms_conditions_html',
      'bank_name', 'account_type', 'account_number', 'account_holder', 'account_id',
      'whatsapp_message'
    ];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateFields.push(`${field} = ?`);
        updateValues.push(req.body[field]);
      }
    });
    if (updateFields.length === 0) {
      return res.status(400).json({ error: "No hay campos para actualizar" });
    }

    const query = `UPDATE settings SET ${updateFields.join(", ")} WHERE id = 1`;
    await pool.query(query, updateValues);

    const [rows] = await pool.query("SELECT * FROM settings WHERE id = 1 LIMIT 1");

    res.json({
      ok: true,
      message: "Settings actualizados correctamente",
      data: rows[0],
    });
  } catch (error) {
    console.error("PUT /api/settings error:", error);
    res.status(500).json({ error: "Error guardando settings" });
  }
});

// ========================================
// GET /api/settings/store-info (Info pública de tienda)
// ========================================
router.get("/store-info", async (req, res) => {
  try {
    await ensureSettingsRow();

    const [rows] = await pool.query(
      `SELECT 
        store_name, 
        store_email, 
        store_phone, 
        store_address,
        store_city,
        store_schedule,
        facebook_url,
        instagram_url,
        whatsapp_url,
        tiktok_url,
        footer_text
      FROM settings WHERE id = 1 LIMIT 1`
    );

    res.json(rows[0] || {});
  } catch (error) {
    console.error("GET /api/settings/store-info error:", error);
    res.status(500).json({ error: "Error cargando info de tienda" });
  }
});

// ========================================
// GET /api/settings/iva (Para cálculos de impuestos)
// ========================================
router.get("/iva", async (req, res) => {
  try {
    await ensureSettingsRow();

    const [rows] = await pool.query(
      "SELECT iva_percent FROM settings WHERE id = 1 LIMIT 1"
    );

    res.json({
      iva_percent: rows[0]?.iva_percent || 12,
    });
  } catch (error) {
    console.error("GET /api/settings/iva error:", error);
    res.status(500).json({ 
      error: "Error cargando IVA",
      iva_percent: 12 
    });
  }
});

module.exports = router;