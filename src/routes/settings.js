const express = require("express");
const router = express.Router();
const { pool } = require("../config/database");

// Crear settings si no existe
async function ensureSettingsRow() {
  await pool.query(`
    INSERT INTO settings 
      (id, store_name, store_email, store_phone, store_address, store_city, store_schedule,
       facebook_url, instagram_url, whatsapp_url, tiktok_url, footer_text, iva_percent)
    SELECT
      1,
      'CNC CAMPAS',
      'cnccampas@gmail.com',
      '+593 964083585',
      'Esmeraldas, Ecuador',
      'Esmeraldas',
      'Lun – Vie 8:00 AM – 6:00 PM',
      'https://www.facebook.com/p/Cnccampas-61557170055468/',
      'https://www.instagram.com/cnccampas/',
      '',
      'https://www.tiktok.com/@cnccampas7',
      'Fabricación digital profesional con la más alta tecnología. Convirtiendo tus ideas en realidad.',
      12
    FROM DUAL
    WHERE NOT EXISTS (SELECT 1 FROM settings WHERE id=1)
  `);
}

// ===============================
// GET /api/settings (PÚBLICO)
// ===============================
router.get("/", async (req, res) => {
  try {
    await ensureSettingsRow();

    const [rows] = await pool.query("SELECT * FROM settings WHERE id=1 LIMIT 1");
    res.json(rows[0] || {});
  } catch (error) {
    console.error("GET /api/settings error:", error);
    res.status(500).json({ error: "Error cargando settings" });
  }
});

// ===============================
// PUT /api/settings (ADMIN)
// ===============================
// ✅ SIN AUTH (como productos) para que no falle por token
router.put("/", async (req, res) => {
  try {
    await ensureSettingsRow();

    const {
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
      footer_text,
      iva_percent,
    } = req.body;

    await pool.query(
      `UPDATE settings SET
        store_name=?,
        store_email=?,
        store_phone=?,
        store_address=?,
        store_city=?,
        store_schedule=?,
        facebook_url=?,
        instagram_url=?,
        whatsapp_url=?,
        tiktok_url=?,
        footer_text=?,
        iva_percent=?
      WHERE id=1`,
      [
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
        footer_text,
        iva_percent,
      ]
    );

    res.json({ ok: true, message: "Settings actualizados" });
  } catch (error) {
    console.error("PUT /api/settings error:", error);
    res.status(500).json({ error: "Error guardando settings" });
  }
});

module.exports = router;
