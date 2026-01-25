const express = require("express");
const router = express.Router();
const { pool } = require("../config/database");

// ========================================
// DOCUMENTOS LEGALES (desde tabla settings)
// /api/legal/privacy
// /api/legal/terms
// ========================================

async function ensureSettingsRow() {
  try {
    const [rows] = await pool.query("SELECT id FROM settings WHERE id = 1");
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

router.get("/privacy", async (req, res) => {
  try {
    await ensureSettingsRow();
    const [rows] = await pool.query(
      "SELECT privacy_policy_html, updated_at FROM settings WHERE id = 1 LIMIT 1"
    );
    const data = rows[0] || {};
    res.json({
      slug: "privacy",
      title: "Política de Privacidad",
      content_html: data.privacy_policy_html || "<p>No hay contenido configurado.</p>",
      updated_at: data.updated_at || null,
    });
  } catch (err) {
    console.error("GET /api/legal/privacy error:", err);
    res.status(500).json({ error: "Error cargando documento" });
  }
});

router.get("/terms", async (req, res) => {
  try {
    await ensureSettingsRow();
    const [rows] = await pool.query(
      "SELECT terms_conditions_html, updated_at FROM settings WHERE id = 1 LIMIT 1"
    );
    const data = rows[0] || {};
    res.json({
      slug: "terms",
      title: "Términos y Condiciones",
      content_html: data.terms_conditions_html || "<p>No hay contenido configurado.</p>",
      updated_at: data.updated_at || null,
    });
  } catch (err) {
    console.error("GET /api/legal/terms error:", err);
    res.status(500).json({ error: "Error cargando documento" });
  }
});

router.put("/privacy", async (req, res) => {
  try {
    await ensureSettingsRow();
    const { content_html } = req.body || {};
    if (typeof content_html === "undefined") {
      return res.status(400).json({ error: "content_html es requerido" });
    }
    await pool.query(
      "UPDATE settings SET privacy_policy_html = ? WHERE id = 1",
      [String(content_html)]
    );
    res.json({ ok: true, message: "Política de privacidad guardada" });
  } catch (err) {
    console.error("PUT /api/legal/privacy error:", err);
    res.status(500).json({ error: "Error guardando documento" });
  }
});

router.put("/terms", async (req, res) => {
  try {
    await ensureSettingsRow();
    const { content_html } = req.body || {};
    if (typeof content_html === "undefined") {
      return res.status(400).json({ error: "content_html es requerido" });
    }
    await pool.query(
      "UPDATE settings SET terms_conditions_html = ? WHERE id = 1",
      [String(content_html)]
    );
    res.json({ ok: true, message: "Términos y condiciones guardados" });
  } catch (err) {
    console.error("PUT /api/legal/terms error:", err);
    res.status(500).json({ error: "Error guardando documento" });
  }
});

module.exports = router;