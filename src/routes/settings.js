const express = require("express");
const router = express.Router();
const { pool } = require("../config/database");
const { verifyToken } = require("../middleware/auth");

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
           facebook_url, instagram_url, whatsapp_url, tiktok_url, footer_text, iva_percent)
        VALUES
          (1, 'CNC CAMPAS', 'cnccampas@gmail.com', '+593 964083585', 
           'Esmeraldas, Ecuador', 'Esmeraldas', 'Lun – Vie 8:00 AM – 6:00 PM',
           'https://www.facebook.com/p/Cnccampas-61557170055468/', 
           'https://www.instagram.com/cnccampas/', '', 
           'https://www.tiktok.com/@cnccampas7',
           'Fabricación digital profesional con la más alta tecnología. Convirtiendo tus ideas en realidad.',
           12)`
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

    // Construir query dinámicamente (solo actualizar campos que vienen en el body)
    const updateFields = [];
    const updateValues = [];

    if (store_name !== undefined) {
      updateFields.push("store_name = ?");
      updateValues.push(store_name);
    }
    if (store_email !== undefined) {
      updateFields.push("store_email = ?");
      updateValues.push(store_email);
    }
    if (store_phone !== undefined) {
      updateFields.push("store_phone = ?");
      updateValues.push(store_phone);
    }
    if (store_address !== undefined) {
      updateFields.push("store_address = ?");
      updateValues.push(store_address);
    }
    if (store_city !== undefined) {
      updateFields.push("store_city = ?");
      updateValues.push(store_city);
    }
    if (store_schedule !== undefined) {
      updateFields.push("store_schedule = ?");
      updateValues.push(store_schedule);
    }
    if (facebook_url !== undefined) {
      updateFields.push("facebook_url = ?");
      updateValues.push(facebook_url);
    }
    if (instagram_url !== undefined) {
      updateFields.push("instagram_url = ?");
      updateValues.push(instagram_url);
    }
    if (whatsapp_url !== undefined) {
      updateFields.push("whatsapp_url = ?");
      updateValues.push(whatsapp_url);
    }
    if (tiktok_url !== undefined) {
      updateFields.push("tiktok_url = ?");
      updateValues.push(tiktok_url);
    }
    if (footer_text !== undefined) {
      updateFields.push("footer_text = ?");
      updateValues.push(footer_text);
    }
    if (iva_percent !== undefined) {
      updateFields.push("iva_percent = ?");
      updateValues.push(iva_percent);
    }

    // Si no hay campos para actualizar, retornar error
    if (updateFields.length === 0) {
      return res.status(400).json({ error: "No hay campos para actualizar" });
    }

    // Ejecutar UPDATE
    const query = `UPDATE settings SET ${updateFields.join(", ")} WHERE id = 1`;
    await pool.query(query, updateValues);

    // Retornar los settings actualizados
    const [rows] = await pool.query(
      "SELECT * FROM settings WHERE id = 1 LIMIT 1"
    );

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